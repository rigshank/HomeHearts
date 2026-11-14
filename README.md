# HomeHearts

HomeHearts is a Dallas-first Expo Go prototype for people facing a housing crisis. It turns a stressful housing question into three connected flows:

1. Compare the cost of staying versus moving over 3 or 12 months.
2. Complete a short intake and receive explainable Dallas resource matches.
3. Prepare documents, save a flexible checklist, and use a personalized provider call script.

## Run it in Expo Go

```bash
npm install
npx expo start --lan --clear
```

Scan the `exp://...` QR code with Expo Go. Do not open the `http://localhost:...` URL from the QR flow; that is the web preview. If Expo Go shows a stale or blank project, stop any older Expo process, rerun the command above, and scan the newly generated QR code while the phone and computer are on the same Wi-Fi network. The app runs without an account or external service credentials using the curated Dallas source catalog and local device persistence.

## Verification commands

```bash
npm run typecheck
npm run test:unit
npx expo export --platform web
```

## Data and trust model

The bundled catalog links to provider websites and records when each source was checked, the service area, eligibility, intake status, and the next step. The app separates options to pursue now from closed intake and waitlists. An open status expires after seven days, and an announced reopening prompts a fresh check when the date arrives.

Matching runs on the device. The ZIP lookup comes from the [2020 Census ZCTA-to-county and ZCTA-to-place relationship files](https://www.census.gov/geographies/reference-files/2020/geo/relationship-files.html), which approximate residential ZIP coverage. Intake asks for county or city-limit confirmation when an overlap affects the results. The appropriate 211 directory remains available when the catalog has no matching services or does not recognize the ZIP.

## Upload behavior

In the no-credential Expo Go mode, document picker selections are copied into the app cache and only their metadata is persisted. The checklist supports add, preview, replace, and remove. This is real device file selection, but it is intentionally not a production cloud submission.

To enable the optional Supabase adapter, copy `.env.example` to a local environment file and provide `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. The `homehearts-documents` bucket must remain private and be protected by authenticated/signed upload policies before this mode is used with identity or income documents. Production still needs authentication, signed URL expiry, malware scanning, retention, and deletion policies.

## Architecture

- `app/`: Expo Router screens and native stack/tab navigation.
- `src/domain/`: pure cost, matching, validation, and plan logic.
- `src/data/`: Dallas fixtures and upload repository boundary.
- `src/state/`: versioned anonymous progress persistence.
- `src/components/ui.tsx`: native tokenized primitives inspired by shadcn/21st.dev composition patterns, adapted for React Native rather than copied DOM components.
- `design-system/homehearts/`: UI/UX Pro Max source and the native override used by the app.

