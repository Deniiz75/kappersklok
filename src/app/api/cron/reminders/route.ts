import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, reminderEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  // Daily cron (Hobby plan): find all appointments for tomorrow
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: appointments } = await supabase
    .from("Appointment")
    .select("id, date, startTime, customerName, customerEmail, shopId, barberId, serviceId")
    .eq("status", "CONFIRMED")
    .eq("date", tomorrowStr);

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;

  for (const apt of appointments) {

    // Get shop, barber, service names
    const [{ data: shop }, { data: barber }, { data: service }] = await Promise.all([
      supabase.from("Shop").select("name").eq("id", apt.shopId).single(),
      supabase.from("Barber").select("name").eq("id", apt.barberId).single(),
      supabase.from("Service").select("name").eq("id", apt.serviceId).single(),
    ]);

    if (shop && barber && service) {
      const email = reminderEmail({
        customerName: apt.customerName,
        shopName: shop.name,
        serviceName: service.name,
        date: apt.date,
        time: apt.startTime,
        barberName: barber.name,
      });
      await sendEmail({ to: apt.customerEmail, ...email }).catch(() => {});
      sent++;
    }
  }

  // Expire old waitlist entries (date has passed)
  await supabase
    .from("WaitlistEntry")
    .update({ status: "EXPIRED" })
    .in("status", ["WAITING", "NOTIFIED"])
    .lt("date", tomorrowStr);

  return NextResponse.json({ sent });
}
