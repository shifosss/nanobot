# Hosted Demo Account Dataset

This repo includes a repeatable hosted-data generator for the real demo account `alex@example.com`.

It is separate from the disposable sample-user harness in [`scripts/db`](/E:/Alex's%20Local%20Codebases/nanobot/scripts/db). The sample harness creates and deletes temporary auth users. The demo-account flow instead manages two existing profiles under one real account:

- `alex`
- `judy`

## What The Loader Does

- keeps `alex@example.com` as a `parent` account
- normalizes the two target profiles as adult female profiles
- updates `judy` to adult DOB `1998-10-02`
- gives both profiles an active `Comprehensive` subscription
- binds one `Blood Analyzer`, one `Hormone Tracker`, and one `SpO2 Monitor` to each profile
- generates 28 days of half-hourly readings for the full current `Comprehensive` biomarker catalog
- inserts profile-specific personalized ranges
- creates biomarker questions, dismissal rules, IDFW sessions/reports, and completed export requests
- writes export files into the private `exports` bucket under a managed `/demo-account/` path

## Reading Volume

- biomarker codes per profile: `22`
- timestamps per biomarker: `1,344`
- readings per profile: `29,568`
- readings across both profiles: `59,136`

## Profile Stories

### `alex`

- regular 28-day cycle
- generally healthy baseline
- mildly low vitamin D and low-normal ferritin
- occasional CRP and hs-cTnI watch-level bumps after stress/exertion
- one brief overnight SpO2 dip
- cycle-related discomfort and evening stress check-ins

### `judy`

- adult female with a slightly longer 31-day cycle
- mild insulin-resistance pattern
- recurrent meal-related glucose spikes
- slightly elevated triglycerides and flatter cortisol delta
- low vitamin D and low-normal ferritin
- cycle-linked discomfort plus a low-grade inflammation / clotting watch moment

## Range Sources

Primary source:

- [`docs/Biomarker Insight Categories .md`](/E:/Alex's%20Local%20Codebases/nanobot/docs/Biomarker%20Insight%20Categories%20.md)

Supplemented because the live `Comprehensive` catalog is broader than the markdown file:

- `ldl_cholesterol`
- `hdl_cholesterol`
- `triglycerides`
- `hemoglobin_a1c`
- `cortisol_delta`
- `testosterone`

The supplemental defaults are conservative clinical norms encoded in [`demo-account-fixture.mjs`](/E:/Alex's%20Local%20Codebases/nanobot/scripts/db/demo-account-fixture.mjs). They are used only for realistic generation and verification of the missing catalog entries.

## Managed Cleanup Rules

The cleanup flow removes only generator-managed rows:

- demo device codes with the `NB-DEMO-` prefix
- export objects whose storage path includes `/demo-account/`
- IDFW reports whose summary starts with `DEMO:`
- personalized ranges inserted by the demo fixture
- demo readings attached to managed device IDs
- subscriptions on the two managed profiles, before recreating them on rerun

The cleanup flow does not delete the account or the two target profiles.

## Commands

```bash
npm run db:demo:load:hosted
npm run db:demo:verify:hosted
npm run db:demo:cleanup:hosted
npm run db:demo:cycle:hosted
```
