import { Resend } from "resend";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[EMAIL] (geen API key) To: ${to} | Subject: ${subject}`);
    return true;
  }

  const from = process.env.RESEND_FROM_EMAIL || "Kappersklok <onboarding@resend.dev>";
  const resend = new Resend(apiKey);
  await resend.emails.send({ from, to, subject, html });

  return true;
}

// ── Shared email layout ──

function emailLayout(content: string, footerNote?: string) {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">

        <!-- Header -->
        <tr><td align="center" style="padding-bottom: 32px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="font-size: 28px; font-weight: 800; color: #d4a853; letter-spacing: 1px;">KAPPERSKLOK</td>
          </tr></table>
          <div style="margin-top: 8px; width: 40px; height: 2px; background: linear-gradient(90deg, transparent, #d4a853, transparent);"></div>
        </td></tr>

        <!-- Content card -->
        <tr><td style="background-color: #141414; border: 1px solid #222; border-radius: 16px; padding: 32px 28px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top: 24px; text-align: center;">
          ${footerNote ? `<p style="margin: 0 0 12px; font-size: 12px; color: #555;">${footerNote}</p>` : ""}
          <p style="margin: 0; font-size: 11px; color: #333;">Kappersklok — Online afspraken voor kappers</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding: 10px 14px; font-size: 13px; color: #777; width: 90px;">${label}</td>
      <td style="padding: 10px 14px; font-size: 14px; color: #f0f0f0; font-weight: 600;">${value}</td>
    </tr>`;
}

function detailsTable(rows: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #262626; border-radius: 10px; margin: 20px 0;">
      ${rows}
    </table>`;
}

function goldButton(href: string, label: string) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin: 24px 0 0;"><tr>
      <td style="background-color: #d4a853; border-radius: 8px;">
        <a href="${href}" style="display: inline-block; padding: 12px 28px; color: #0a0a0a; font-size: 14px; font-weight: 700; text-decoration: none; letter-spacing: 0.3px;">${label}</a>
      </td>
    </tr></table>`;
}

function outlineButton(href: string, label: string) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin: 16px 0 0;"><tr>
      <td style="border: 1px solid #333; border-radius: 8px;">
        <a href="${href}" style="display: inline-block; padding: 10px 24px; color: #d4a853; font-size: 13px; font-weight: 600; text-decoration: none;">${label}</a>
      </td>
    </tr></table>`;
}

// ── Email templates ──

export function bookingConfirmationEmail(data: {
  customerName: string;
  shopName: string;
  serviceName: string;
  date: string;
  time: string;
  barberName: string;
  cancelToken: string;
}) {
  const cancelUrl = `https://kappersklok.vercel.app/afspraak/annuleren?token=${data.cancelToken}`;
  const rescheduleUrl = `https://kappersklok.vercel.app/afspraak/herplannen?id=${data.cancelToken}`;

  const content = `
    <!-- Status badge -->
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background-color: #1a2e1a; border: 1px solid #2a4a2a; border-radius: 20px; padding: 6px 14px;">
        <span style="color: #6db87b; font-size: 12px; font-weight: 600;">&#10003; Bevestigd</span>
      </td>
    </tr></table>

    <h1 style="margin: 16px 0 4px; font-size: 22px; font-weight: 700; color: #f5f5f5;">Uw afspraak is bevestigd</h1>
    <p style="margin: 0 0 4px; font-size: 14px; color: #888;">Beste ${data.customerName}, uw afspraak staat gepland bij</p>
    <p style="margin: 0; font-size: 17px; font-weight: 700; color: #d4a853;">${data.shopName}</p>

    ${detailsTable(
      detailRow("Dienst", data.serviceName) +
      detailRow("Kapper", data.barberName) +
      detailRow("Datum", data.date) +
      detailRow("Tijd", data.time)
    )}

    <p style="margin: 0; font-size: 13px; color: #666;">Wijzigen of annuleren kan tot 2 uur van tevoren.</p>

    <table cellpadding="0" cellspacing="0"><tr>
      <td>${outlineButton(rescheduleUrl, "Herplannen")}</td>
      <td style="padding-left: 8px;">${outlineButton(cancelUrl, "Annuleren")}</td>
    </tr></table>
  `;

  return {
    subject: `✓ Afspraak bevestigd — ${data.shopName}`,
    html: emailLayout(content, "U ontvangt een herinnering op de dag van uw afspraak."),
  };
}

export function cancellationConfirmationEmail(data: {
  customerName: string;
  shopName: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  const content = `
    <!-- Status badge -->
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background-color: #2e1a1a; border: 1px solid #4a2a2a; border-radius: 20px; padding: 6px 14px;">
        <span style="color: #c94a6d; font-size: 12px; font-weight: 600;">&#10005; Geannuleerd</span>
      </td>
    </tr></table>

    <h1 style="margin: 16px 0 4px; font-size: 22px; font-weight: 700; color: #f5f5f5;">Afspraak geannuleerd</h1>
    <p style="margin: 0; font-size: 14px; color: #888;">Beste ${data.customerName}, uw afspraak bij <strong style="color: #ccc;">${data.shopName}</strong> is geannuleerd.</p>

    ${detailsTable(
      detailRow("Dienst", data.serviceName) +
      detailRow("Datum", data.date) +
      detailRow("Tijd", data.time)
    )}

    <p style="margin: 0; font-size: 13px; color: #666;">Wilt u een nieuwe afspraak maken?</p>
    ${goldButton("https://kappersklok.vercel.app/kapper-zoeken", "Nieuwe afspraak boeken")}
  `;

  return {
    subject: `Afspraak geannuleerd — ${data.shopName}`,
    html: emailLayout(content),
  };
}

export function reminderEmail(data: {
  customerName: string;
  shopName: string;
  serviceName: string;
  date: string;
  time: string;
  barberName: string;
}) {
  const content = `
    <!-- Status badge -->
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background-color: #1a1a10; border: 1px solid #3a3a1a; border-radius: 20px; padding: 6px 14px;">
        <span style="color: #d4a853; font-size: 12px; font-weight: 600;">&#9719; Morgen</span>
      </td>
    </tr></table>

    <h1 style="margin: 16px 0 4px; font-size: 22px; font-weight: 700; color: #f5f5f5;">Herinnering: afspraak morgen</h1>
    <p style="margin: 0; font-size: 14px; color: #888;">Beste ${data.customerName}, niet vergeten!</p>

    ${detailsTable(
      detailRow("Zaak", data.shopName) +
      detailRow("Dienst", data.serviceName) +
      detailRow("Kapper", data.barberName) +
      detailRow("Datum", data.date) +
      detailRow("Tijd", data.time)
    )}

    ${goldButton("https://kappersklok.vercel.app/mijn-afspraken", "Bekijk afspraak")}
  `;

  return {
    subject: `Herinnering: morgen ${data.time} bij ${data.shopName}`,
    html: emailLayout(content, "Wij kijken ernaar uit u te zien!"),
  };
}

export function barberNotificationEmail(data: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  barberName: string;
  customerPhone?: string;
}) {
  const content = `
    <!-- Status badge -->
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background-color: #101520; border: 1px solid #1a2540; border-radius: 20px; padding: 6px 14px;">
        <span style="color: #4a9ec9; font-size: 12px; font-weight: 600;">&#9889; Nieuwe boeking</span>
      </td>
    </tr></table>

    <h1 style="margin: 16px 0 4px; font-size: 22px; font-weight: 700; color: #f5f5f5;">Nieuwe afspraak ingepland</h1>
    <p style="margin: 0; font-size: 14px; color: #888;">Er is een nieuwe afspraak gemaakt voor <strong style="color: #ccc;">${data.barberName}</strong>.</p>

    ${detailsTable(
      detailRow("Klant", data.customerName) +
      detailRow("Dienst", data.serviceName) +
      detailRow("Datum", data.date) +
      detailRow("Tijd", data.time) +
      (data.customerPhone ? detailRow("Telefoon", data.customerPhone) : "")
    )}

    ${goldButton("https://kappersklok.vercel.app/dashboard/afspraken", "Bekijk in dashboard")}
  `;

  return {
    subject: `Nieuwe afspraak: ${data.customerName} — ${data.date} ${data.time}`,
    html: emailLayout(content),
  };
}
