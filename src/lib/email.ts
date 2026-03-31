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

// ── Kappersklok logo as pre-computed base64 data URI ──

const LOGO_DATA_URI = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNTYiIHN0cm9rZT0iI2Q0YTg1MyIgc3Ryb2tlLXdpZHRoPSIzIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNTIiIHN0cm9rZT0iI2Q0YTg1MyIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMyIvPjxsaW5lIHgxPSI2MC4wIiB5MT0iMTcuMCIgeDI9IjYwLjAiIHkyPSIxMC4wIiBzdHJva2U9IiNkNGE4NTMiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9IjEiLz48bGluZSB4MT0iODMuMCIgeTE9IjIwLjIiIHgyPSI4NS4wIiB5Mj0iMTYuNyIgc3Ryb2tlPSIjZDRhODUzIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iMC41Ii8+PGxpbmUgeDE9Ijk5LjgiIHkxPSIzNy4wIiB4Mj0iMTAzLjMiIHkyPSIzNS4wIiBzdHJva2U9IiNkNGE4NTMiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjUiLz48bGluZSB4MT0iMTAzLjAiIHkxPSI2MC4wIiB4Mj0iMTEwLjAiIHkyPSI2MC4wIiBzdHJva2U9IiNkNGE4NTMiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9IjEiLz48bGluZSB4MT0iOTkuOCIgeTE9IjgzLjAiIHgyPSIxMDMuMyIgeTI9Ijg1LjAiIHN0cm9rZT0iI2Q0YTg1MyIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9IjAuNSIvPjxsaW5lIHgxPSI4My4wIiB5MT0iOTkuOCIgeDI9Ijg1LjAiIHkyPSIxMDMuMyIgc3Ryb2tlPSIjZDRhODUzIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iMC41Ii8+PGxpbmUgeDE9IjYwLjAiIHkxPSIxMDMuMCIgeDI9IjYwLjAiIHkyPSIxMTAuMCIgc3Ryb2tlPSIjZDRhODUzIiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIxIi8+PGxpbmUgeDE9IjM3LjAiIHkxPSI5OS44IiB4Mj0iMzUuMCIgeTI9IjEwMy4zIiBzdHJva2U9IiNkNGE4NTMiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjUiLz48bGluZSB4MT0iMjAuMiIgeTE9IjgzLjAiIHgyPSIxNi43IiB5Mj0iODUuMCIgc3Ryb2tlPSIjZDRhODUzIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iMC41Ii8+PGxpbmUgeDE9IjE3LjAiIHkxPSI2MC4wIiB4Mj0iMTAuMCIgeTI9IjYwLjAiIHN0cm9rZT0iI2Q0YTg1MyIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iMSIvPjxsaW5lIHgxPSIyMC4yIiB5MT0iMzcuMCIgeDI9IjE2LjciIHkyPSIzNS4wIiBzdHJva2U9IiNkNGE4NTMiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjUiLz48bGluZSB4MT0iMzcuMCIgeTE9IjIwLjIiIHgyPSIzNS4wIiB5Mj0iMTYuNyIgc3Ryb2tlPSIjZDRhODUzIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iMC41Ii8+PHBhdGggZD0iTTYwIDYwIEwzOCAyOCIgc3Ryb2tlPSIjZDRhODUzIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjM0IiBjeT0iMjMiIHI9IjYiIHN0cm9rZT0iI2Q0YTg1MyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTYwIDYwIEw4NCAzMCIgc3Ryb2tlPSIjZDRhODUzIiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iODkiIGN5PSIyNSIgcj0iNiIgc3Ryb2tlPSIjZDRhODUzIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjYwIiByPSI0IiBmaWxsPSIjZDRhODUzIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iMiIgZmlsbD0iIzBhMGEwYSIvPjxsaW5lIHgxPSI1MiIgeTE9Ijc1IiB4Mj0iNTIiIHkyPSI4NiIgc3Ryb2tlPSIjZDRhODUzIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjYiLz48bGluZSB4MT0iNTYiIHkxPSI3NSIgeDI9IjU2IiB5Mj0iODYiIHN0cm9rZT0iI2Q0YTg1MyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iMC42Ii8+PGxpbmUgeDE9IjYwIiB5MT0iNzUiIHgyPSI2MCIgeTI9Ijg2IiBzdHJva2U9IiNkNGE4NTMiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9IjAuNiIvPjxsaW5lIHgxPSI2NCIgeTE9Ijc1IiB4Mj0iNjQiIHkyPSI4NiIgc3Ryb2tlPSIjZDRhODUzIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjYiLz48bGluZSB4MT0iNjgiIHkxPSI3NSIgeDI9IjY4IiB5Mj0iODYiIHN0cm9rZT0iI2Q0YTg1MyIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgb3BhY2l0eT0iMC42Ii8+PGxpbmUgeDE9IjUwIiB5MT0iODYiIHgyPSI3MCIgeTI9Ijg2IiBzdHJva2U9IiNkNGE4NTMiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIG9wYWNpdHk9IjAuNiIvPjwvc3ZnPg==";

// ── Shared email layout ──

function emailLayout(content: string, preheader?: string) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background-color:#08080a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<!-- Outer wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#08080a;">
<tr><td align="center" style="padding:32px 16px 40px;">

  <!-- Email container -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:540px;">

    <!-- Logo + Brand Header -->
    <tr><td align="center" style="padding:0 0 28px;">
      <table cellpadding="0" cellspacing="0" role="presentation">
        <tr><td align="center">
          <img src="${LOGO_DATA_URI}" width="52" height="52" alt="Kappersklok" style="display:block;border:0;" />
        </td></tr>
        <tr><td align="center" style="padding-top:14px;">
          <table cellpadding="0" cellspacing="0" role="presentation"><tr>
            <td style="font-size:15px;font-weight:300;color:#b0b0b0;letter-spacing:3.5px;text-transform:uppercase;font-family:Georgia,'Times New Roman',serif;">KAPPERS</td>
            <td style="padding:0 6px;"><table cellpadding="0" cellspacing="0"><tr><td style="width:1px;height:14px;background-color:#d4a853;opacity:0.5;"></td></tr></table></td>
            <td style="font-size:15px;font-weight:700;color:#d4a853;letter-spacing:1.5px;text-transform:uppercase;font-family:Georgia,'Times New Roman',serif;">KLOK</td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>

    <!-- Gold accent line -->
    <tr><td align="center" style="padding:0 0 28px;">
      <table cellpadding="0" cellspacing="0" role="presentation"><tr>
        <td style="width:12px;height:1px;background-color:#1a1510;"></td>
        <td style="width:8px;height:1px;background-color:#6b5428;"></td>
        <td style="width:60px;height:1px;background-color:#d4a853;"></td>
        <td style="width:8px;height:1px;background-color:#6b5428;"></td>
        <td style="width:12px;height:1px;background-color:#1a1510;"></td>
      </tr></table>
    </td></tr>

    <!-- Content card -->
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#111113;border-radius:16px;border:1px solid #1e1e22;">
        <!-- Top gold border accent -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#111113,#d4a853,#111113);border-radius:16px 16px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:36px 32px 32px;">
          ${content}
        </td></tr>
      </table>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:28px 0 0;">
      <!-- Ornamental separator -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" role="presentation"><tr>
            <td style="width:40px;height:1px;background:linear-gradient(90deg,transparent,#1e1e22);"></td>
            <td style="padding:0 10px;font-size:10px;color:#2a2a2a;">&#9830;</td>
            <td style="width:40px;height:1px;background:linear-gradient(90deg,#1e1e22,transparent);"></td>
          </tr></table>
        </td>
      </tr></table>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding-top:16px;">
        <tr><td align="center" style="font-size:11px;color:#3a3a3a;line-height:18px;">
          Online afspraken voor kappers
        </td></tr>
        <tr><td align="center" style="padding-top:6px;font-size:10px;color:#2a2a2a;line-height:16px;">
          <a href="https://kappersklok.vercel.app" style="color:#2a2a2a;text-decoration:none;">kappersklok.nl</a>
        </td></tr>
      </table>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Detail components ──

function statusBadge(label: string, color: string, bgColor: string, borderColor: string) {
  return `<table cellpadding="0" cellspacing="0" role="presentation"><tr>
    <td style="background-color:${bgColor};border:1px solid ${borderColor};border-radius:20px;padding:5px 14px 4px;">
      <span style="color:${color};font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">${label}</span>
    </td>
  </tr></table>`;
}

function detailRow(label: string, value: string, isLast = false) {
  return `<tr>
    <td style="padding:11px 16px;font-size:12px;color:#666;width:85px;vertical-align:top;${!isLast ? "border-bottom:1px solid #1a1a1e;" : ""}">${label}</td>
    <td style="padding:11px 16px;font-size:13px;color:#e8e8e8;font-weight:500;${!isLast ? "border-bottom:1px solid #1a1a1e;" : ""}">${value}</td>
    <td style="padding:11px 0;width:4px;${!isLast ? "border-bottom:1px solid #1a1a1e;" : ""}"><table cellpadding="0" cellspacing="0"><tr><td style="width:3px;height:100%;background-color:#d4a853;opacity:0.15;border-radius:2px;"></td></tr></table></td>
  </tr>`;
}

function detailsCard(rows: string) {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0c0c0e;border:1px solid #1a1a1e;border-radius:12px;margin:20px 0 24px;overflow:hidden;">
    ${rows}
  </table>`;
}

function primaryButton(href: string, label: string) {
  return `<table cellpadding="0" cellspacing="0" role="presentation"><tr>
    <td style="background-color:#d4a853;border-radius:10px;mso-padding-alt:0;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:13px 32px;color:#08080a;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.5px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${label}</a>
    </td>
  </tr></table>`;
}

function secondaryButton(href: string, label: string) {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;"><tr>
    <td style="border:1px solid #2a2a2e;border-radius:8px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:9px 20px;color:#999;font-size:12px;font-weight:500;text-decoration:none;letter-spacing:0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${label}</a>
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
  const myUrl = "https://kappersklok.vercel.app/mijn-afspraken";

  const content = `
    ${statusBadge("&#10003;&ensp;Bevestigd", "#6db87b", "#0f1a0f", "#1a2e1a")}

    <h1 style="margin:18px 0 6px;font-size:24px;font-weight:700;color:#f5f5f5;font-family:Georgia,'Times New Roman',serif;line-height:1.2;">
      Uw afspraak staat gepland
    </h1>
    <p style="margin:0 0 2px;font-size:14px;color:#777;line-height:1.5;">
      Beste ${data.customerName}, alles is geregeld bij
    </p>
    <p style="margin:0;font-size:18px;font-weight:700;color:#d4a853;font-family:Georgia,'Times New Roman',serif;letter-spacing:0.3px;">
      ${data.shopName}
    </p>

    ${detailsCard(
      detailRow("Dienst", data.serviceName) +
      detailRow("Kapper", data.barberName) +
      detailRow("Datum", data.date) +
      detailRow("Tijd", data.time, true)
    )}

    ${primaryButton(myUrl, "Bekijk afspraak")}

    <p style="margin:24px 0 0;font-size:12px;color:#555;line-height:1.6;">
      Wijzigen of annuleren kan tot 2 uur van tevoren via
      <a href="${cancelUrl}" style="color:#d4a853;text-decoration:none;">deze link</a>.
    </p>
  `;

  return {
    subject: `Afspraak bevestigd bij ${data.shopName}`,
    html: emailLayout(content, `Uw afspraak bij ${data.shopName} op ${data.date} om ${data.time} is bevestigd.`),
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
    ${statusBadge("Geannuleerd", "#c94a6d", "#1a0f0f", "#2e1a1a")}

    <h1 style="margin:18px 0 6px;font-size:24px;font-weight:700;color:#f5f5f5;font-family:Georgia,'Times New Roman',serif;line-height:1.2;">
      Afspraak geannuleerd
    </h1>
    <p style="margin:0;font-size:14px;color:#777;line-height:1.5;">
      Beste ${data.customerName}, uw afspraak bij <strong style="color:#bbb;">${data.shopName}</strong> is geannuleerd.
    </p>

    ${detailsCard(
      detailRow("Dienst", data.serviceName) +
      detailRow("Datum", data.date) +
      detailRow("Tijd", data.time, true)
    )}

    <p style="margin:0 0 16px;font-size:13px;color:#666;">Wilt u opnieuw boeken?</p>
    ${primaryButton("https://kappersklok.vercel.app/kapper-zoeken", "Nieuwe afspraak")}
  `;

  return {
    subject: `Afspraak geannuleerd — ${data.shopName}`,
    html: emailLayout(content, `Uw afspraak bij ${data.shopName} op ${data.date} is geannuleerd.`),
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
    ${statusBadge("&#9719;&ensp;Morgen", "#d4a853", "#141008", "#2e2510")}

    <h1 style="margin:18px 0 6px;font-size:24px;font-weight:700;color:#f5f5f5;font-family:Georgia,'Times New Roman',serif;line-height:1.2;">
      Niet vergeten: afspraak morgen
    </h1>
    <p style="margin:0;font-size:14px;color:#777;line-height:1.5;">
      Beste ${data.customerName}, morgen wordt u verwacht bij <strong style="color:#d4a853;">${data.shopName}</strong>.
    </p>

    ${detailsCard(
      detailRow("Dienst", data.serviceName) +
      detailRow("Kapper", data.barberName) +
      detailRow("Datum", data.date) +
      detailRow("Tijd", data.time, true)
    )}

    ${primaryButton("https://kappersklok.vercel.app/mijn-afspraken", "Bekijk afspraak")}

    <p style="margin:24px 0 0;font-size:12px;color:#444;line-height:1.5;text-align:center;font-style:italic;">
      Wij kijken ernaar uit u te verwelkomen.
    </p>
  `;

  return {
    subject: `Morgen ${data.time} — afspraak bij ${data.shopName}`,
    html: emailLayout(content, `Herinnering: morgen om ${data.time} bij ${data.shopName}.`),
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
  const rows =
    detailRow("Klant", `<strong style="color:#f0f0f0;">${data.customerName}</strong>`) +
    detailRow("Dienst", data.serviceName) +
    detailRow("Kapper", data.barberName) +
    detailRow("Datum", data.date) +
    (data.customerPhone
      ? detailRow("Telefoon", `<a href="tel:${data.customerPhone}" style="color:#d4a853;text-decoration:none;">${data.customerPhone}</a>`)
      : "") +
    detailRow("Tijd", data.time, true);

  const content = `
    ${statusBadge("&#9889;&ensp;Nieuwe boeking", "#4a9ec9", "#0a0f15", "#152535")}

    <h1 style="margin:18px 0 6px;font-size:24px;font-weight:700;color:#f5f5f5;font-family:Georgia,'Times New Roman',serif;line-height:1.2;">
      Nieuwe afspraak ingepland
    </h1>
    <p style="margin:0;font-size:14px;color:#777;line-height:1.5;">
      Er is zojuist een afspraak gemaakt voor <strong style="color:#bbb;">${data.barberName}</strong>.
    </p>

    ${detailsCard(rows)}

    ${primaryButton("https://kappersklok.vercel.app/dashboard/afspraken", "Bekijk in dashboard")}
  `;

  return {
    subject: `Nieuwe afspraak: ${data.customerName} — ${data.date} ${data.time}`,
    html: emailLayout(content, `Nieuwe boeking van ${data.customerName} op ${data.date} om ${data.time}.`),
  };
}

export function waitlistConfirmationEmail(data: {
  customerName: string;
  shopName: string;
  serviceName: string;
  barberName: string;
  date: string;
}) {
  const content = `
    ${statusBadge("&#9719;&ensp;Wachtlijst", "#d4a853", "#141008", "#2e2510")}

    <h1 style="margin:18px 0 6px;font-size:24px;font-weight:700;color:#f5f5f5;font-family:Georgia,'Times New Roman',serif;line-height:1.2;">
      U staat op de wachtlijst
    </h1>
    <p style="margin:0;font-size:14px;color:#777;line-height:1.5;">
      Beste ${data.customerName}, u bent aangemeld voor de wachtlijst bij <strong style="color:#d4a853;">${data.shopName}</strong>.
    </p>

    ${detailsCard(
      detailRow("Dienst", data.serviceName) +
      detailRow("Kapper", data.barberName) +
      detailRow("Datum", data.date, true)
    )}

    <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
      Wij sturen u een e-mail zodra er een plek vrijkomt.
    </p>

    ${primaryButton("https://kappersklok.vercel.app/mijn-afspraken", "Mijn afspraken")}
  `;

  return {
    subject: `Wachtlijst — ${data.shopName} op ${data.date}`,
    html: emailLayout(content, `U staat op de wachtlijst bij ${data.shopName} op ${data.date}.`),
  };
}

export function waitlistNotificationEmail(data: {
  customerName: string;
  shopName: string;
  shopSlug: string;
  barberName: string;
  date: string;
  freedTime: string;
}) {
  const bookUrl = `https://kappersklok.vercel.app/kapperszaak/${data.shopSlug}`;

  const content = `
    ${statusBadge("&#10003;&ensp;Plek beschikbaar!", "#6db87b", "#0f1a0f", "#1a2e1a")}

    <h1 style="margin:18px 0 6px;font-size:24px;font-weight:700;color:#f5f5f5;font-family:Georgia,'Times New Roman',serif;line-height:1.2;">
      Er is een plek vrijgekomen!
    </h1>
    <p style="margin:0;font-size:14px;color:#777;line-height:1.5;">
      Beste ${data.customerName}, er is een plek vrijgekomen bij <strong style="color:#d4a853;">${data.shopName}</strong>.
    </p>

    ${detailsCard(
      detailRow("Kapper", data.barberName) +
      detailRow("Datum", data.date) +
      detailRow("Tijd", data.freedTime, true)
    )}

    <p style="margin:0 0 20px;font-size:13px;color:#d4a853;line-height:1.5;font-weight:500;">
      &#9888; Wees er snel bij — andere klanten zijn ook op de hoogte gebracht.
    </p>

    ${primaryButton(bookUrl, "Nu boeken")}
  `;

  return {
    subject: `Plek vrijgekomen bij ${data.shopName} op ${data.date}!`,
    html: emailLayout(content, `Er is een plek vrijgekomen bij ${data.shopName} op ${data.date} om ${data.freedTime}!`),
  };
}
