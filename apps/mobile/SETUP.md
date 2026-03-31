# Kappersklok Mobile App — Setup Guide

## Vereisten
- Node.js 18+
- Expo account (gratis op https://expo.dev)
- Apple Developer account (voor iOS, €99/jaar)
- Google Play Console (voor Android, eenmalig $25)

## 1. Expo account koppelen

```bash
cd apps/mobile
npx eas-cli login
npx eas-cli init
```

Dit geeft je een `projectId` — vul deze in bij `app.json > extra.eas.projectId`.

## 2. Supabase Auth activeren

Ga naar je Supabase dashboard > Authentication > Providers:
1. **Email** — enable, met "Confirm email" uit (voor development)
2. **Phone** — optioneel, voor SMS OTP

## 3. RLS Policies uitvoeren

Ga naar Supabase dashboard > SQL Editor en voer uit:
```
apps/web/prisma/rls-policies.sql
```

## 4. Development build

```bash
# iOS simulator
npx eas-cli build --platform ios --profile development

# Android
npx eas-cli build --platform android --profile development
```

## 5. Preview build (intern testen)

```bash
npx eas-cli build --platform all --profile preview
```

Deel de installatie-link met testers via Expo dashboard.

## 6. Production build + submit

```bash
# Build
npx eas-cli build --platform all --profile production

# Submit naar stores
npx eas-cli submit --platform ios --profile production
npx eas-cli submit --platform android --profile production
```

### iOS vereisten voor submit:
- Apple Developer account
- App Store Connect app aangemaakt
- Vul `ascAppId` en `appleTeamId` in `eas.json`

### Android vereisten voor submit:
- Google Play Console
- Service account key (JSON) voor geautomatiseerde uploads
- Plaats als `apps/mobile/google-services.json`

## 7. OTA Updates (geen store review nodig)

Voor JavaScript-only wijzigingen:
```bash
npx eas-cli update --channel production --message "bugfix: ..."
```

## Environment variabelen

| Variabele | Waar |
|-----------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` + `eas.json` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env` + `eas.json` |

## App starten (development)

```bash
cd apps/mobile
npx expo start
```

Scan de QR-code met Expo Go (Android) of de Camera app (iOS).
