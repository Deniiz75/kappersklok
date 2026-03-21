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

  // Find appointments in 23-24 hours from now
  const now = new Date();
  const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const dateStr23 = in23h.toISOString().split("T")[0];
  const dateStr24 = in24h.toISOString().split("T")[0];

  // Get appointments for tomorrow (or today if it's late)
  const dates = [dateStr23];
  if (dateStr24 !== dateStr23) dates.push(dateStr24);

  const { data: appointments } = await supabase
    .from("Appointment")
    .select("id, date, startTime, customerName, customerEmail, shopId, barberId, serviceId")
    .eq("status", "CONFIRMED")
    .in("date", dates);

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;

  for (const apt of appointments) {
    // Check if appointment is within 23-24 hour window
    const aptTime = new Date(`${apt.date}T${apt.startTime}:00`);
    const hoursUntil = (aptTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 23 || hoursUntil > 24) continue;

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

  return NextResponse.json({ sent });
}
