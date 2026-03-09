# Nanobot Web App

This repo now uses a browser-first React + Vite + Tailwind setup so Figma-generated web code can be dropped in without going through React Native or Expo compatibility layers.

## Stack

- React 19
- Vite
- Tailwind CSS
- React Router
- Supabase Web SDK

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Database Sample Data And Verification

The repo includes a data-only Supabase harness for realistic sample users, profiles, devices, readings, symptoms, exports, and RLS checks.

Local commands:

```bash
npm run db:sample:load:local
npm run db:sample:verify:local
npm run db:sample:cleanup:local
```

Hosted commands:

```bash
npm run db:sample:load:hosted
npm run db:sample:verify:hosted
npm run db:sample:cleanup:hosted
```

For one-shot runs, use `npm run db:sample:cycle:local` or `npm run db:sample:cycle:hosted`.

## Hosted Demo Account Data

The repo also includes a repeatable hosted-only loader for the real demo account `alex@example.com`. It normalizes the two existing profiles (`alex`, `judy`), provisions Comprehensive subscriptions plus all three device types, and generates 4 weeks of half-hourly biomarker data with mild abnormalities and menstrual-cycle context.

Hosted demo commands:

```bash
npm run db:demo:load:hosted
npm run db:demo:verify:hosted
npm run db:demo:cleanup:hosted
```

For a one-shot load plus verification run, use `npm run db:demo:cycle:hosted`.

See [`docs/demo-account-data.md`](/E:/Alex's%20Local%20Codebases/nanobot/docs/demo-account-data.md) for the exact dataset design, supplemental ranges, and cleanup rules.

## Environment

Create `.env` with:

```bash
Database_Project_URL=your-project-url
Database_Public_Anon_Key=your-public-anon-key
```

Only the public anon key belongs in the browser bundle. Do not expose Supabase service-role keys in client-side code.

For hosted sample-data scripts, keep admin-only values in `.env.local`:

```bash
Database_Service_Role_Key=your-service-role-key
```

The sample-data harness never changes the schema. It only inserts and removes test data.

## Structure

```text
src/
  components/
  pages/
  providers/
  lib/
  styles/
```

`src/styles/index.css` is the main Tailwind entry point and is intended to match the way Figma-exported web code expects global CSS to work.
