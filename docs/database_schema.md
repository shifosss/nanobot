# Database Schema Design — Biomarker Monitoring App

## Stated Assumptions

- **Derived biomarkers** (NLR, Cortisol AM/PM differential) are computed and stored as regular readings by the backend, not computed at query time.
- **Sensation types** for IDFW physical symptoms are fixed: stitchy, pain, numbness.
- **Body locations** are coarse regions (not left/right split). Adjust as needed.
- **Plan names** are placeholders. The structure supports arbitrary plans.
- **Accounts mirror Supabase Auth users.** `public.accounts.id` is the same UUID as `auth.users.id`; auth is canonical.
- **Account ownership is household-style.** One account may own many profiles. In product terms, `account_type = 'individual'` is intended for a single monitored person and `account_type = 'parent'` for multi-profile households, but the live database does not currently enforce a max-one-profile rule for `individual`.
- **Device binding** is permanent and at the profile level after first pairing. A device starts unbound (`profile_id` is `NULL`), then can be paired to exactly one profile and never reassigned. A profile may have many devices, including multiple devices of the same type.
- **All numeric biomarker values** are stored as `numeric` (arbitrary precision decimal). No biomarker returns non-numeric data.

---

## 1. Authentication & Account

### `accounts`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, FK → auth.users(id) | Mirrored from Supabase Auth |
| email | text | UNIQUE, NOT NULL | Login credential |
| password_hash | text | NOT NULL | Placeholder column; defaults to `managed_by_supabase_auth` and is not used for real auth |
| account_type | text | NOT NULL, CHECK IN ('individual', 'parent') | Use `parent` for multi-profile households |
| created_at | timestamptz | NOT NULL, default `now()` | |
| updated_at | timestamptz | NOT NULL, default `now()` | |

**RLS policy**: Users can only read/write their own account row.

---

### `profiles`

One per monitored person. An account may own many profiles. The intended UX is 1 profile for `individual` accounts and 1+ profiles for `parent` accounts, but the live schema does not currently enforce the max-one-profile rule at the database layer.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK, default `gen_random_uuid()` | |
| account_id | uuid | FK → accounts(id), NOT NULL | |
| display_name | text | NOT NULL | Shown in profile switcher |
| date_of_birth | date | NOT NULL | Needed for age-dependent reference ranges |
| biological_sex | text | NOT NULL, CHECK IN ('male', 'female') | Needed for sex-dependent reference ranges |
| height_cm | numeric(5,1) | NULL | Optional, useful for health context |
| weight_kg | numeric(5,1) | NULL | Optional |
| avatar_url | text | NULL | Profile picture |
| created_at | timestamptz | NOT NULL, default `now()` | |
| updated_at | timestamptz | NOT NULL, default `now()` | |

**Current status**: No database trigger currently enforces max 1 profile for `account_type = 'individual'`. If that rule becomes strict, add a trigger or partial-constraint strategy later.

---

## 2. Subscriptions & Devices

### `plans`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| name | text | NOT NULL, UNIQUE | e.g., "Essential", "Women's Health", "Diabetes Care", "Elderly Care", "Child Care", "Pregnancy", "Comprehensive" |
| description | text | NULL | |
| price_cents_monthly | integer | NOT NULL | Store in cents to avoid float issues |
| is_active | boolean | NOT NULL, default true | Soft-disable retired plans |

**Seed values** (placeholder names):

| Name | Target User | Key Additions Over Essential |
|---|---|---|
| Essential | General adult | Heart, blood sugar, blood cells, stress, immune, acid-base, gut, nutrients |
| Women's Health | Female users | + Menstrual cycle & fertility biomarkers |
| Diabetes Care | Diabetic users | + Enhanced glucose/insulin (postprandial) |
| Elderly Care | Elderly users | + Clotting & bleeding (D-dimer, platelets) |
| Child Care | Children (parent account) | + Clotting & bleeding, adjusted reference ranges |
| Pregnancy | Pregnant users | + Fertility markers with pregnancy-specific ranges |
| Comprehensive | Power users | All biomarkers |

---

### `profile_subscriptions`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles(id) ON DELETE CASCADE, NOT NULL | |
| plan_id | uuid | FK → plans(id), NOT NULL | Currently active plan for this profile |
| next_plan_id | uuid | FK → plans(id), NULL | If user upgraded mid-cycle, this plan takes effect at `current_period_end` |
| status | text | NOT NULL, CHECK IN ('active', 'cancelled', 'expired', 'pending') | |
| started_at | timestamptz | NOT NULL | |
| current_period_end | timestamptz | NOT NULL | When current billing cycle ends |
| cancelled_at | timestamptz | NULL | |
| created_at | timestamptz | NOT NULL, default `now()` | |

**Constraint**: One active subscription per profile at a time (enforced via partial unique index on `profile_id WHERE status = 'active'`).

**Upgrade flow**: When user upgrades mid-cycle, set `next_plan_id`. At `current_period_end`, a scheduled job copies `next_plan_id` → `plan_id`, sets `next_plan_id` to NULL, and advances `current_period_end` by 1 month.

---

### `device_types`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | smallint | PK, generated always as identity | Small set |
| name | text | NOT NULL, UNIQUE | e.g., "Blood Analyzer", "Hormone Tracker", "SpO2 Monitor" |
| description | text | NULL | |

---

### `plan_device_types`

Which robot types ship with each plan.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| plan_id | uuid | FK → plans(id), NOT NULL | |
| device_type_id | smallint | FK → device_types(id), NOT NULL | |
| **PK** | | (plan_id, device_type_id) | |

---

### `devices`

Physical robot units. **Once bound, never reassigned.**

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| device_code | text | UNIQUE, NOT NULL | Printed on the robot; user enters this to bind |
| device_type_id | smallint | FK → device_types(id), NOT NULL | |
| profile_id | uuid | FK → profiles(id), NULL until first bind | One device ↔ one profile after pairing; never reassigned |
| activated_at | timestamptz | NOT NULL, default `now()` | |
| firmware_version | text | NULL | For future OTA updates |

**UNIQUE on `device_code`** ensures globally unique devices.
**Recommendation**: Unique constraint on `device_code` only. A profile can have multiple devices, including multiple robots of the same type.

---

## 3. Biomarker Definitions

### `insight_categories`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | smallint | PK, generated always as identity | |
| name | text | NOT NULL, UNIQUE | "Heart Health", "Blood Sugar & Energy", etc. |
| display_order | smallint | NOT NULL | Controls UI ordering |
| icon | text | NULL | Icon identifier for frontend |

**Seed values** (from your document, in display order):

1. Heart Health
2. Blood Sugar & Energy
3. Blood Cells
4. Stress & Recovery
5. Sleep & Circadian Rhythm
6. Immune & Allergy
7. Acid-Base Balance
8. Gut Health
9. Nutrient Stores
10. Menstrual Cycle & Fertility
11. Clotting & Bleeding

---

### `biomarkers`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | smallint | PK, generated always as identity | ~35 biomarkers, smallint is sufficient |
| category_id | smallint | FK → insight_categories(id), NOT NULL | |
| code | text | NOT NULL, UNIQUE | Machine-readable key, e.g., "hs_ctni", "spo2", "fasting_glucose" |
| display_name | text | NOT NULL | e.g., "hs-cTnI", "Blood Oxygen (SpO₂)" |
| unit | text | NOT NULL | e.g., "ng/L", "%", "g/dL", "mg/dL" |
| priority | smallint | NOT NULL, CHECK BETWEEN 1 AND 3 | ★ = 1, ★★ = 2, ★★★ = 3 |
| alert_level | smallint | NOT NULL, CHECK BETWEEN 1 AND 4 | ❤️‍🔥 count; 4 = zero-level alert |
| is_derived | boolean | NOT NULL, default false | True for NLR, Cortisol differential, etc. |
| description | text | NULL | "What it tells you" text |
| display_order | smallint | NOT NULL, default 0 | Within its category |

---

### `plan_biomarkers`

Which biomarkers each plan tracks.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| plan_id | uuid | FK → plans(id), NOT NULL | |
| biomarker_id | smallint | FK → biomarkers(id), NOT NULL | |
| **PK** | | (plan_id, biomarker_id) | |

---

### `biomarker_reference_ranges`

Universal defaults. Multiple rows per biomarker when ranges differ by sex or physiological context.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | smallint | PK, generated always as identity | |
| biomarker_id | smallint | FK → biomarkers(id), NOT NULL | |
| sex | text | NOT NULL, CHECK IN ('male', 'female', 'all') | |
| context | text | NOT NULL, default 'default' | e.g., "default", "fasting", "follicular_early", "ovulation_peak", "luteal_mid", "post_menopause", "AM", "PM" |
| range_low | numeric | NULL | NULL = no lower bound (e.g., hs-cTnI upper-only) |
| range_high | numeric | NULL | NULL = no upper bound |
| optimal_low | numeric | NULL | Tighter "optimal" range if defined |
| optimal_high | numeric | NULL | |

**Example rows:**

| biomarker | sex | context | range_low | range_high |
|---|---|---|---|---|
| hs_ctni | male | default | NULL | 20 |
| hs_ctni | female | default | NULL | 14 |
| fasting_glucose | all | default | 70 | 99 |
| estradiol | female | follicular_early | 20 | 160 |
| estradiol | female | ovulation_peak | 150 | 750 |
| cortisol | all | AM | 5 | 25 |
| cortisol | all | PM | 3 | 10 |

---

### `profile_reference_ranges`

Personalized overrides, built over time from the user's own data (95th percentile method).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles(id), NOT NULL | |
| biomarker_id | smallint | FK → biomarkers(id), NOT NULL | |
| context | text | NOT NULL, default 'default' | Same domain as above |
| range_low | numeric | NULL | |
| range_high | numeric | NULL | |
| sample_size | integer | NOT NULL | Number of readings used to compute this range |
| effective_from | timestamptz | NOT NULL | When this override was computed |
| created_at | timestamptz | NOT NULL, default `now()` | |

**UNIQUE** on `(profile_id, biomarker_id, context)` — latest row per combo is active.

---

## 4. Biomarker Readings (Time-Series Core)

### `biomarker_readings`

**This is the highest-volume table.** At 1-min intervals × ~30 biomarkers per profile, expect ~43K rows/day/profile.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | bigint | PK, generated always as identity | uuid is 16 bytes vs bigint 8 bytes; matters at this scale |
| profile_id | uuid | FK → profiles(id) ON DELETE CASCADE, NOT NULL | |
| biomarker_id | smallint | FK → biomarkers(id) ON DELETE CASCADE, NOT NULL | |
| device_id | uuid | FK → devices(id) ON DELETE CASCADE, NOT NULL | Which robot produced this reading |
| value | numeric | NOT NULL | |
| context | text | NOT NULL, default `default` | Same context domain as reference ranges: e.g. `fasting`, `AM`, `luteal_mid` |
| recorded_at | timestamptz | NOT NULL | Timestamp of measurement |
| created_at | timestamptz | NOT NULL, default `now()` | When row was inserted |

**Indexes:**

- `(profile_id, biomarker_id, context, recorded_at DESC)` — primary query pattern for detail page charts
- `(profile_id, recorded_at DESC)` — for home page summary (latest readings across all biomarkers)

**Scaling note:** For production, enable TimescaleDB extension (available in Supabase) and convert this to a hypertable partitioned on `recorded_at`. This gives automatic time-based partitioning, compression, and retention policies. For the prototype, a standard table with the above indexes is sufficient.

**Current schema keeps foreign keys on `profile_id`, `biomarker_id`, and `device_id`** for integrity. If ingestion volume eventually makes them too expensive, revisit only after measuring real write pressure.

---

## 5. Time-Focus Configuration

### `time_focus_rules`

Controls which biomarker appears in the home page's time-focus panel at different times of day.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | smallint | PK, generated always as identity | |
| biomarker_id | smallint | FK → biomarkers(id), NOT NULL | |
| time_start | time | NOT NULL | e.g., 06:00 |
| time_end | time | NOT NULL | e.g., 12:00 |
| priority | smallint | NOT NULL | Higher = shown first; ties broken by biomarker priority |
| condition_tag | text | NULL | e.g., "diabetes", "elderly" — NULL means applies to all |

**Seed values** (from your "On morning" section):

| biomarker | time_start | time_end | priority | condition_tag |
|---|---|---|---|---|
| cortisol | 06:00 | 12:00 | 10 | NULL |
| norepinephrine | 06:00 | 12:00 | 8 | NULL |
| fasting_glucose | 06:00 | 10:00 | 9 | NULL |
| fasting_insulin | 06:00 | 10:00 | 7 | NULL |
| fasting_glucose | 06:00 | 23:59 | 15 | diabetes |
| postprandial_glucose | 06:00 | 23:59 | 14 | diabetes |

---

## 6. Question Panel & Learned Rules

### `biomarker_questions`

Logged when the app detects an unusual reading and asks the user about it.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles(id), NOT NULL | |
| biomarker_id | smallint | FK → biomarkers(id), NOT NULL | |
| reading_id | bigint | FK → biomarker_readings(id), NOT NULL | The specific reading that triggered the question |
| is_normal_activity | boolean | NULL | NULL = unanswered; true = user said it's normal; false = user said it's abnormal |
| user_note | text | NULL | Optional free-text reason from user |
| answered_at | timestamptz | NULL | |
| created_at | timestamptz | NOT NULL, default `now()` | |

---

### `biomarker_dismissal_rules`

Created when user answers `is_normal_activity = true`. Suppresses future questions for the same biomarker in the same ±15-min time window on future days.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles(id), NOT NULL | |
| biomarker_id | smallint | FK → biomarkers(id), NOT NULL | |
| window_start | time | NOT NULL | Center time − 15 min |
| window_end | time | NOT NULL | Center time + 15 min |
| reason | text | NULL | Copied from user_note |
| source_question_id | uuid | FK → biomarker_questions(id), NOT NULL | Traceability |
| is_active | boolean | NOT NULL, default true | User can revoke |
| created_at | timestamptz | NOT NULL, default `now()` | |

**Query pattern**: Before showing a question for biomarker B at time T for profile P, check:

```sql
SELECT 1 FROM biomarker_dismissal_rules
WHERE profile_id = P
  AND biomarker_id = B
  AND is_active = true
  AND window_start <= T::time
  AND window_end >= T::time;
```

If a row exists, suppress the question.

**Edge case**: If window_start > window_end (crosses midnight, e.g., 23:50–00:20), the query becomes `window_start <= T OR T <= window_end`.

---

## 7. IDFW (I Don't Feel Well) System

### `body_locations`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | smallint | PK, generated always as identity | |
| name | text | NOT NULL, UNIQUE | |
| display_order | smallint | NOT NULL | |

**Seed values:**

1. Head
2. Eyes
3. Ears
4. Throat
5. Neck
6. Chest
7. Upper Back
8. Lower Back
9. Shoulders
10. Arms
11. Hands
12. Upper Abdomen
13. Lower Abdomen
14. Hips
15. Legs
16. Knees
17. Feet
18. Skin (general)

---

### `sensation_types`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | smallint | PK, generated always as identity | |
| name | text | NOT NULL, UNIQUE | |

**Fixed values (3 total):** stitchy, pain, numbness

---

### `suggested_reasons`

Predefined lookup for the demo. Each reason is scoped to physical/mental and optionally to a body location.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | smallint | PK, generated always as identity | |
| name | text | NOT NULL | e.g., "Tension headache", "Dehydration", "Work stress" |
| applies_to | text | NOT NULL, CHECK IN ('physical', 'mental') | |
| body_location_id | smallint | FK → body_locations(id), NULL | NULL = general; non-NULL = location-specific |

---

### `idfw_sessions`

One row per "I don't feel well" event. A session can have both physical and mental symptoms.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles(id) ON DELETE CASCADE, NOT NULL | |
| has_physical | boolean | NOT NULL, default false | Set true if user reports physical symptoms |
| has_mental | boolean | NOT NULL, default false | Set true if user reports mental symptoms |
| created_at | timestamptz | NOT NULL, default `now()` | |

**Constraint**: CHECK (`has_physical OR has_mental`) — at least one must be true.

---

### `idfw_physical_symptoms`

Multiple rows per session. A user can report multiple sensation types per body location.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| session_id | uuid | FK → idfw_sessions(id) ON DELETE CASCADE, NOT NULL | |
| body_location_id | smallint | FK → body_locations(id), NOT NULL | |
| sensation_type_id | smallint | FK → sensation_types(id), NOT NULL | |
| intensity | smallint | NOT NULL, CHECK BETWEEN 1 AND 10 | |
| selected_reason_id | smallint | FK → suggested_reasons(id), NULL | ≤1 per row; NULL = user chose 0 reasons |

**UNIQUE** on `(session_id, body_location_id, sensation_type_id)` — one entry per body-location + sensation combination per session.

---

### `idfw_mental_symptoms`

One row per mental IDFW session.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| session_id | uuid | FK → idfw_sessions(id) ON DELETE CASCADE, NOT NULL, UNIQUE | One mental record per session |
| stress_level | smallint | NOT NULL, CHECK BETWEEN 1 AND 10 | 1 = low stress, 10 = extreme |
| clarity_level | smallint | NOT NULL, CHECK BETWEEN 1 AND 10 | 1 = heavy fog, 10 = fully clear |
| selected_reason_id | smallint | FK → suggested_reasons(id), NULL | |

---

### `idfw_reports`

Generated after user completes the IDFW flow.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| session_id | uuid | FK → idfw_sessions(id) ON DELETE CASCADE, NOT NULL, UNIQUE | One report per session |
| result_summary | text | NOT NULL | Overall finding |
| matched_conditions | jsonb | NOT NULL, default '[]' | Array of possible illnesses matched; each: `{name, confidence, matched_biomarkers: [...]}` |
| flagged_biomarkers | jsonb | NOT NULL, default '[]' | Array of `{biomarker_code, value, unit, status, reference_range}` |
| interpretation | text | NOT NULL | Plain-language explanation |
| suggestions | text | NOT NULL | Recommended actions |
| biomarker_snapshot_start | timestamptz | NOT NULL | Start of the time window of biomarker data considered |
| biomarker_snapshot_end | timestamptz | NOT NULL | End of the time window |
| created_at | timestamptz | NOT NULL, default `now()` | |

**Note on `matched_conditions` and `flagged_biomarkers`:** Using `jsonb` here because the structure is report-specific and not queried relationally. If you later need to query across reports by condition name, extract into a junction table.

---

## 8. Data Export

### `export_requests`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles(id), NOT NULL | |
| requester_type | text | NOT NULL, CHECK IN ('user', 'licensed_professional') | |
| formats | text[] | NOT NULL | Array: e.g., `{'pdf'}` for users; `{'pdf','csv'}` for professionals |
| date_range_start | timestamptz | NULL | NULL = all data |
| date_range_end | timestamptz | NULL | |
| status | text | NOT NULL, CHECK IN ('pending', 'processing', 'completed', 'failed') | |
| file_urls | jsonb | NULL | e.g., `{"pdf": "https://...", "csv": "https://..."}` |
| created_at | timestamptz | NOT NULL, default `now()` | |
| completed_at | timestamptz | NULL | |

**File storage**: Use Supabase Storage bucket (private, signed URLs with expiry).

---

## 9. Suggested Actions

### `suggested_actions`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | smallint | PK, generated always as identity | |
| biomarker_id | smallint | FK → biomarkers(id), NULL | NULL = general action |
| condition | text | NOT NULL | e.g., "high", "low", "rapid_increase" |
| action_text | text | NOT NULL | e.g., "Consider reducing sodium intake" |
| priority | smallint | NOT NULL | |

---

## Entity Relationship Summary

```
accounts 1──* profiles
profiles 1──* profile_subscriptions *──1 plans
plans *──* device_types        (via plan_device_types)
plans *──* biomarkers           (via plan_biomarkers)
profiles 1──* devices *──1 device_types
profiles 1──* biomarker_readings *──1 biomarkers
profiles 1──* biomarker_questions
profiles 1──* biomarker_dismissal_rules
profiles 1──* idfw_sessions
profiles 1──* export_requests
profiles 1──* profile_reference_ranges

biomarkers *──1 insight_categories
biomarkers 1──* biomarker_reference_ranges
biomarkers 1──* time_focus_rules
biomarkers 1──* suggested_actions

idfw_sessions 1──* idfw_physical_symptoms
idfw_sessions 1──0..1 idfw_mental_symptoms
idfw_sessions 1──1 idfw_reports
```

---

## Supabase-Specific Notes

1. **Row Level Security (RLS):** Enable on all tables. Policy pattern: `auth.uid() = account_id` on accounts; join through `profiles.account_id` for all profile-scoped tables.
2. **Realtime:** Enable on `biomarker_readings` for live dashboard updates. Use Supabase Realtime channels filtered by `profile_id`.
3. **TimescaleDB:** Available as a Supabase extension. Convert `biomarker_readings` to a hypertable for automatic partitioning, compression (90%+ savings on old data), and continuous aggregates (pre-computed hourly/daily averages for the detail page's week/month/year views).
4. **Storage:** Create a private bucket `exports` for PDF/CSV files. Use signed URLs with 24-hour expiry.
5. **Edge Functions:** Use for IDFW report generation (matching symptoms + biomarkers to conditions) and for computing personalized reference ranges.

---

## Resolved Design Decisions

1. **IDFW sessions can have both physical AND mental symptoms.** The `type` column is replaced with `has_physical` / `has_mental` booleans.
2. **Multiple sensation types per body location are allowed.** UNIQUE constraint is on `(session_id, body_location_id, sensation_type_id)`. Fixed sensation types: stitchy, pain, numbness.
3. **Subscriptions are profile-scoped.** Each monitored person carries their own active plan; sibling profiles under one account may have different plans.
4. **Subscription upgrades are deferred.** `next_plan_id` holds the pending upgrade; a scheduled job applies it at `current_period_end`. Old plan price continues until then.
5. **Profile deletion is hard delete.** All profile-scoped FKs use `ON DELETE CASCADE`. When a profile is deleted, all readings, questions, dismissal rules, IDFW sessions (and their symptoms/reports), export requests, and profile subscriptions are permanently removed.
