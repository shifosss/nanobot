# Backend Interface

This document describes the Supabase backend contract implemented for Nanobot.

## Auth Model

- Supabase Auth is the source of truth for user identity.
- `public.accounts.id` matches `auth.users.id` exactly.
- A database trigger mirrors new and updated auth users into `public.accounts`.
- `accounts.password_hash` exists only for schema compatibility. The app must not read from or write to it.
- If the frontend wants a `parent` account at signup time, pass `options.data.account_type = "parent"` in the Supabase sign-up call. Otherwise the account defaults to `individual`.

## Ownership Model

- `accounts` rows are owned by `auth.uid()`.
- `profiles` are owned through `profiles.account_id = auth.uid()`.
- All profile-scoped tables use RLS via that profile ownership.
- Reference tables such as `plans`, `biomarkers`, `device_types`, `insight_categories`, `body_locations`, and `sensation_types` are read-only to authenticated users.

## Core Tables The Frontend Can Read Directly

- `accounts`
  - Use for account type and top-level account metadata.
- `profiles`
  - Use for profile switcher, profile settings, and ownership-scoped filtering.
- `plans`
  - Use for plan picker and plan metadata.
- `profile_subscriptions`
  - Use for per-profile plan selection and billing-cycle state in the prototype.
- `devices`
  - Read-only from the client. Binding must go through `bind_device`.
- `device_types`, `plan_device_types`
  - Use for device compatibility UI.
- `insight_categories`, `biomarkers`, `plan_biomarkers`, `biomarker_reference_ranges`, `profile_reference_ranges`
  - Use for biomarker catalogs, display metadata, and personalized range overlays.
- `biomarker_readings`
  - Use for dashboard cards, detail charts, and realtime updates.
- `biomarker_questions`, `biomarker_dismissal_rules`
  - Use for “was this normal?” prompts and dismissal state.
- `body_locations`, `sensation_types`, `suggested_reasons`
  - Use for the IDFW form.
- `idfw_sessions`, `idfw_physical_symptoms`, `idfw_mental_symptoms`, `idfw_reports`
  - Read results directly after session creation and report generation.
- `export_requests`
  - Use for export status polling.
- `suggested_actions`
  - Use for biomarker suggestion copy keyed by biomarker + condition.

## Views

### `current_profile_subscription`

One row per profile subscription with denormalized plan names.

Columns:
- `id`
- `profile_id`
- `account_id`
- `profile_display_name`
- `plan_id`
- `plan_name`
- `next_plan_id`
- `next_plan_name`
- `status`
- `started_at`
- `current_period_end`
- `cancelled_at`
- `created_at`

Typical query:

```ts
const { data } = await supabase
  .from("current_profile_subscription")
  .select("*")
  .eq("profile_id", profileId)
  .eq("status", "active")
  .maybeSingle();
```

### `profile_device_summary`

One row per bound device with profile and device-type labels.

Columns:
- `device_id`
- `profile_id`
- `profile_display_name`
- `device_code`
- `device_type_id`
- `device_type_name`
- `activated_at`
- `firmware_version`

## RPC Functions

### `bind_device(p_device_code text, p_profile_id uuid) -> devices`

Use this instead of updating `devices` directly.

Behavior:
- verifies the caller owns `p_profile_id`
- verifies the device exists
- rejects already-bound devices
- verifies the profile’s active plan supports the device type
- binds the device permanently
- allows multiple robots on one profile, including multiple robots of the same device type

Example:

```ts
const { data, error } = await supabase.rpc("bind_device", {
  p_device_code: "NB-ABC-1234",
  p_profile_id: profileId,
});
```

### `create_idfw_session(p_profile_id uuid, p_physical_symptoms jsonb, p_mental_symptom jsonb) -> uuid`

Creates the parent session and any child symptom rows atomically.

`p_physical_symptoms` shape:

```json
[
  {
    "body_location_id": 1,
    "sensation_type_id": 2,
    "intensity": 6,
    "selected_reason_id": 3
  }
]
```

`p_mental_symptom` shape:

```json
{
  "stress_level": 7,
  "clarity_level": 4,
  "selected_reason_id": 6
}
```

At least one of `p_physical_symptoms` or `p_mental_symptom` must be provided.

### `answer_biomarker_question(p_question_id uuid, p_is_normal_activity boolean, p_user_note text) -> biomarker_questions`

Use this instead of updating `biomarker_questions` directly.

Behavior:
- verifies the caller owns the question
- records the answer and note
- sets `answered_at`
- if `p_is_normal_activity = true`, creates a dismissal rule for the same biomarker in a +/- 15 minute window

### `get_time_focus_biomarker(p_profile_id uuid, p_at_time timestamptz default now())`

Returns the single biomarker that should be highlighted in the home-page time-focus panel.

Returned columns:
- `biomarker_id`
- `biomarker_code`
- `display_name`
- `unit`
- `biomarker_priority`
- `alert_level`
- `category_name`
- `rule_priority`
- `time_start`
- `time_end`
- `condition_tag`

Implementation note:
- `condition_tag` is derived from the active plan for now.
- `Diabetes Care` maps to `diabetes`, `Elderly Care` to `elderly`, `Pregnancy` to `pregnancy`, `Child Care` to `child`, and `Women's Health` to `women`.

## Direct Insert / Update Guidance

Safe direct writes from the frontend in the prototype:
- `profiles`
- `profile_subscriptions`
- `profile_reference_ranges`
- `biomarker_readings`
- `export_requests`

Use RPCs instead of direct writes for:
- device binding
- IDFW session creation
- answering biomarker questions

Recommended frontend rule:
- if a write touches more than one table or depends on business rules, use an RPC

## Biomarker Readings Contract

`biomarker_readings` columns used by the frontend:
- `id`
- `profile_id`
- `biomarker_id`
- `device_id`
- `value`
- `context`
- `recorded_at`
- `created_at`

Important:
- `context` is required for matching readings against contextual ranges such as cortisol `AM` and `PM`.
- Use `"default"` when no specialized context applies.

Example insert:

```ts
const { error } = await supabase.from("biomarker_readings").insert({
  profile_id: profileId,
  biomarker_id: biomarkerId,
  device_id: deviceId,
  value: 87,
  context: "default",
  recorded_at: new Date().toISOString(),
});
```

## Storage Contract

- Bucket: `exports`
- Bucket visibility: private
- Object path convention: `<profile_id>/<request_id>/<filename>`

Example object paths:
- `9f.../7a.../summary.pdf`
- `9f.../7a.../readings.csv`

Important:
- `export_requests.file_urls` should be treated as a format-to-object-path map in this prototype, even though the legacy column name still says `file_urls`.
- Do not persist signed URLs. Generate them on demand from the stored object path.

Example frontend flow:

```ts
const { data } = await supabase.storage
  .from("exports")
  .createSignedUrl(`${profileId}/${requestId}/summary.pdf`, 60 * 60 * 24);
```

## Realtime

Realtime is enabled for `public.biomarker_readings`.

Example subscription:

```ts
const channel = supabase
  .channel(`readings:${profileId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "biomarker_readings",
      filter: `profile_id=eq.${profileId}`,
    },
    (payload) => {
      console.log(payload.new);
    },
  )
  .subscribe();
```

## Frontend Onboarding Flow

1. Sign up or sign in with Supabase Auth.
2. Read `accounts` for `account_type`.
3. Create the first `profiles` row if none exists.
4. Read `plans` and create a `profile_subscriptions` row for that profile.
5. Read `profile_device_summary` and call `bind_device` for one or more devices that belong to that profile.
6. Read biomarker catalogs and subscribe to realtime readings.

## Current Seed Scope

The seed set intentionally covers:
- the plan catalog
- device types
- insight categories
- a starter biomarker catalog aligned with the schema examples and current dashboard concepts
- starter reference ranges explicitly present in the schema doc
- IDFW lookup tables
- starter suggested actions

It does not attempt to define a complete clinical range catalog for every biomarker.
