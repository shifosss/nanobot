# Sample Data And Database Verification

This repo includes a repeatable Supabase fixture and verification harness under [`scripts/db`](/E:/Alex's%20Local%20Codebases/nanobot/scripts/db).

## What It Covers

- auth user creation through Supabase Auth Admin APIs
- `accounts` mirror trigger behavior
- individual and parent account ownership rules
- profile creation and individual-profile limit enforcement
- profile subscriptions and `current_profile_subscription`
- device provisioning, plan-compatible binding, and rebind rejection
- same-type multi-robot pairing on one profile
- direct frontend-safe writes for readings, profile ranges, and export requests
- biomarker questions and dismissal-rule creation through RPC
- IDFW physical-only, mental-only, and combined flows
- private `exports` bucket access rules
- cross-account RLS isolation on owned data
- time-focus biomarker selection

## Fixture Personas

- `sample.ava.essential@nanobot.local`
  - individual account on Essential
  - normal baseline cardiovascular, stress, and export flows
- `sample.liam.diabetes@nanobot.local`
  - individual account on Diabetes Care
  - elevated glucose readings, personalized range, biomarker question workflow
- `sample.household.parent@nanobot.local`
  - parent account with Child Care and Elderly Care profiles
  - two owned profiles to exercise multi-profile access and per-profile plan divergence
- `sample.sofia.womens@nanobot.local`
  - individual account on Women's Health
  - hormone-context readings and IDFW mental/combined sessions

## Commands

Local:

```bash
npm run db:sample:load:local
npm run db:sample:verify:local
npm run db:sample:cleanup:local
```

Hosted:

```bash
npm run db:sample:load:hosted
npm run db:sample:verify:hosted
npm run db:sample:cleanup:hosted
```

One-shot cycles:

```bash
npm run db:sample:cycle:local
npm run db:sample:cycle:hosted
```

## Environment Requirements

- Local runs require Docker plus a running local Supabase stack. The scripts resolve local credentials from `npx supabase status -o env`.
- Hosted runs require:
  - `.env` with `Database_Project_URL` and `Database_Public_Anon_Key`
  - `.env.local` with `Database_Service_Role_Key`

## Cleanup Behavior

- cleanup deletes sample auth users first-class through Supabase Auth Admin
- account-owned rows cascade through foreign keys
- storage objects under the fixture profile paths are removed before auth deletion
- pre-provisioned sample devices are removed explicitly

No schema objects are added, altered, or dropped by this harness.
