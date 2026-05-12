// Supabase Edge Function — send tomorrow's appointment reminders via Expo Push.
//
// Deploy:
//   supabase functions deploy send-reminders --project-ref <your-ref>
//
// Schedule (Supabase cron, run daily 08:00 Europe/Amsterdam = 06:00 UTC):
//   SELECT cron.schedule(
//     'send-reminders',
//     '0 6 * * *',
//     $$
//     SELECT net.http_post(
//       url := 'https://<project>.supabase.co/functions/v1/send-reminders',
//       headers := jsonb_build_object(
//         'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
//         'Content-Type', 'application/json'
//       )
//     );
//     $$
//   );
//
// The function uses the service-role key (auto-injected via env in Edge runtime)
// to read PushToken + Appointment regardless of RLS.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.0";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: string;
  sound?: "default";
}

async function sendExpoPush(messages: ExpoPushMessage[]) {
  if (messages.length === 0) return;
  // Expo accepts up to 100 messages per call.
  const chunks: ExpoPushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100));

  for (const chunk of chunks) {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[push] Expo error", res.status, text);
    }
  }
}

Deno.serve(async () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return new Response(JSON.stringify({ error: "missing service-role env" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const supabase = createClient(url, key);

  // Tomorrow in YYYY-MM-DD
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: appointments, error } = await supabase
    .from("Appointment")
    .select(
      "id, date, startTime, customerEmail, shop:Shop(name), barber:Barber(name), service:Service(name)",
    )
    .eq("status", "CONFIRMED")
    .eq("date", tomorrow);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!appointments || appointments.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Group emails — one push per appointment, multiple tokens per email
  const emails = [...new Set(appointments.map((a) => a.customerEmail))];
  const { data: tokens } = await supabase
    .from("PushToken")
    .select("userEmail, expoPushToken")
    .in("userEmail", emails)
    .eq("userType", "CUSTOMER");

  const tokensByEmail = new Map<string, string[]>();
  for (const t of tokens || []) {
    const list = tokensByEmail.get(t.userEmail) || [];
    list.push(t.expoPushToken);
    tokensByEmail.set(t.userEmail, list);
  }

  const messages: ExpoPushMessage[] = [];
  for (const apt of appointments) {
    const userTokens = tokensByEmail.get(apt.customerEmail) || [];
    if (userTokens.length === 0) continue;
    const shop = (apt as { shop?: { name?: string } | null }).shop;
    const service = (apt as { service?: { name?: string } | null }).service;
    const title = `Afspraak morgen om ${apt.startTime}`;
    const body = `${service?.name ?? "Afspraak"} bij ${shop?.name ?? "uw kapper"} staat morgen gepland.`;
    for (const token of userTokens) {
      messages.push({
        to: token,
        title,
        body,
        sound: "default",
        channelId: "default",
        data: { type: "reminder", appointmentId: apt.id },
      });
    }
  }

  await sendExpoPush(messages);

  return new Response(
    JSON.stringify({ sent: messages.length, appointments: appointments.length }),
    { headers: { "Content-Type": "application/json" } },
  );
});
