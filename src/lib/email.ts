// Email helper — logs emails in development, ready for Resend/SendGrid in production
// To enable real emails: npm install resend, set RESEND_API_KEY env var

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // In production with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: 'Kappersklok <noreply@kappersklok.nl>', to, subject, html });

  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL] Body: ${html.substring(0, 200)}...`);
  return true;
}

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

  return {
    subject: `Bevestiging: Afspraak bij ${data.shopName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #d4a853;">Afspraak bevestigd!</h2>
        <p>Beste ${data.customerName},</p>
        <p>Uw afspraak bij <strong>${data.shopName}</strong> is bevestigd:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Dienst</td><td style="padding: 8px 0;"><strong>${data.serviceName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Kapper</td><td style="padding: 8px 0;"><strong>${data.barberName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Datum</td><td style="padding: 8px 0;"><strong>${data.date}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tijd</td><td style="padding: 8px 0;"><strong>${data.time}</strong></td></tr>
        </table>
        <p style="margin-top: 20px;">Wilt u de afspraak wijzigen of annuleren? Dat kan tot 2 uur van tevoren:</p>
        <a href="${cancelUrl}" style="display: inline-block; background: #d4a853; color: #0a0a0a; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Afspraak annuleren</a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">Met vriendelijke groet,<br>Kappersklok</p>
      </div>
    `,
  };
}

export function cancellationConfirmationEmail(data: {
  customerName: string;
  shopName: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  return {
    subject: `Annulering bevestigd — ${data.shopName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #d4a853;">Afspraak geannuleerd</h2>
        <p>Beste ${data.customerName},</p>
        <p>Uw afspraak bij <strong>${data.shopName}</strong> is geannuleerd:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Dienst</td><td style="padding: 8px 0;"><strong>${data.serviceName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Datum</td><td style="padding: 8px 0;"><strong>${data.date}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tijd</td><td style="padding: 8px 0;"><strong>${data.time}</strong></td></tr>
        </table>
        <p style="margin-top: 20px;">U kunt altijd een nieuwe afspraak maken via Kappersklok.</p>
        <a href="https://kappersklok.vercel.app/kapper-zoeken" style="display: inline-block; background: #d4a853; color: #0a0a0a; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Nieuwe afspraak boeken</a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">Met vriendelijke groet,<br>Kappersklok</p>
      </div>
    `,
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
  return {
    subject: `Herinnering: Morgen afspraak bij ${data.shopName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #d4a853;">Herinnering: Afspraak morgen</h2>
        <p>Beste ${data.customerName},</p>
        <p>Dit is een herinnering voor uw afspraak bij <strong>${data.shopName}</strong>:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Dienst</td><td style="padding: 8px 0;"><strong>${data.serviceName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Kapper</td><td style="padding: 8px 0;"><strong>${data.barberName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Datum</td><td style="padding: 8px 0;"><strong>${data.date}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tijd</td><td style="padding: 8px 0;"><strong>${data.time}</strong></td></tr>
        </table>
        <p style="margin-top: 20px;">Wij kijken ernaar uit u te zien!</p>
        <a href="https://kappersklok.vercel.app/mijn-afspraken" style="display: inline-block; background: #d4a853; color: #0a0a0a; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Bekijk afspraak</a>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">Met vriendelijke groet,<br>Kappersklok</p>
      </div>
    `,
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
  return {
    subject: `Nieuwe afspraak: ${data.customerName} — ${data.date} ${data.time}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #d4a853;">Nieuwe afspraak</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Klant</td><td style="padding: 8px 0;"><strong>${data.customerName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Dienst</td><td style="padding: 8px 0;"><strong>${data.serviceName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Kapper</td><td style="padding: 8px 0;"><strong>${data.barberName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Datum</td><td style="padding: 8px 0;"><strong>${data.date}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tijd</td><td style="padding: 8px 0;"><strong>${data.time}</strong></td></tr>
          ${data.customerPhone ? `<tr><td style="padding: 8px 0; color: #666;">Telefoon</td><td style="padding: 8px 0;"><strong>${data.customerPhone}</strong></td></tr>` : ""}
        </table>
        <p style="margin-top: 20px;"><a href="https://kappersklok.vercel.app/dashboard/afspraken" style="color: #d4a853;">Bekijk in dashboard →</a></p>
      </div>
    `,
  };
}
