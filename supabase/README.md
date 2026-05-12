# Supabase Edge Functions

## send-reminders

Stuurt daily push-notifications naar klanten voor afspraken van morgen.

### Deploy

```bash
# Eenmalig: link je local repo aan je Supabase project
supabase link --project-ref <project-ref>

# Deploy de functie
supabase functions deploy send-reminders
```

### Cron-trigger setup (eenmalig in Supabase SQL Editor)

1. **Enable extensies** in Dashboard → Database → Extensions:
   - `pg_cron`
   - `pg_net`
   - `supabase_vault`

2. **Sla je service-role key op in Vault** (één keer):

```sql
SELECT vault.create_secret(
  '<your-service-role-key>',
  'send_reminders_key',
  'Service-role key used by cron to invoke send-reminders'
);
```

3. **Schedule de cron** (07:00 UTC = 09:00 NL winter / 09:00–10:00 NL zomer):

```sql
SELECT cron.schedule(
  'send-reminders-daily',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<your-project>.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'send_reminders_key'),
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

> Let op: **niet** `current_setting('app.settings.service_role_key')` gebruiken — die parameter bestaat niet standaard in Supabase Postgres. Gebruik Vault zoals hierboven.

### Local test

```bash
supabase functions serve send-reminders
curl http://localhost:54321/functions/v1/send-reminders \
  -H "Authorization: Bearer <service-role-key>"
```

### Security
JWT-verification staat default AAN voor Edge Functions sinds 2024. Cron POST'ed met service-role bearer = werkt. Niet-geauthenticeerde requests → 401. Zie `supabase/config.toml` voor expliciete config.

### Wat ontbreekt nog
- Reminder voor waitlist-notify (als kapper afspraak cancelt en plek vrijkomt) — aparte function trigger
- Booking-confirmation push (direct na succesvolle boeking) — kan vanuit de app of via DB trigger op INSERT
- Dead-token-cleanup (Expo geeft errors terug bij ongeldige tokens, die moeten uit PushToken-tabel)
