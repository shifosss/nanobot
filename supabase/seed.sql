insert into public.plans (id, name, description, price_cents_monthly, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'Essential', 'General adult monitoring with core cardiovascular, metabolic, immune, stress, and nutrient markers.', 2999, true),
  ('22222222-2222-2222-2222-222222222222', 'Women''s Health', 'Essential plan plus menstrual cycle and fertility biomarkers.', 3999, true),
  ('33333333-3333-3333-3333-333333333333', 'Diabetes Care', 'Essential plan plus enhanced glucose and insulin tracking.', 4499, true),
  ('44444444-4444-4444-4444-444444444444', 'Elderly Care', 'Essential plan plus clotting and bleeding markers.', 4299, true),
  ('55555555-5555-5555-5555-555555555555', 'Child Care', 'Child-focused monitoring with age-adjusted biomarker coverage.', 3599, true),
  ('66666666-6666-6666-6666-666666666666', 'Pregnancy', 'Women''s health markers with pregnancy-oriented monitoring.', 4599, true),
  ('77777777-7777-7777-7777-777777777777', 'Comprehensive', 'All supported biomarkers and device types.', 5999, true)
on conflict (id) do update
  set name = excluded.name,
      description = excluded.description,
      price_cents_monthly = excluded.price_cents_monthly,
      is_active = excluded.is_active;

insert into public.device_types (name, description)
values
  ('Blood Analyzer', 'Measures blood-based biomarkers from the core analysis robot.'),
  ('Hormone Tracker', 'Specialized hormone and fertility biomarker device.'),
  ('SpO2 Monitor', 'Peripheral oxygen saturation and respiratory support device.')
on conflict (name) do update
  set description = excluded.description;

insert into public.plan_device_types (plan_id, device_type_id)
select mappings.plan_id, dt.id
from (
  values
    ('11111111-1111-1111-1111-111111111111'::uuid, 'Blood Analyzer'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'SpO2 Monitor'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Blood Analyzer'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'Hormone Tracker'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'SpO2 Monitor'),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'Blood Analyzer'),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'SpO2 Monitor'),
    ('44444444-4444-4444-4444-444444444444'::uuid, 'Blood Analyzer'),
    ('44444444-4444-4444-4444-444444444444'::uuid, 'SpO2 Monitor'),
    ('55555555-5555-5555-5555-555555555555'::uuid, 'Blood Analyzer'),
    ('55555555-5555-5555-5555-555555555555'::uuid, 'SpO2 Monitor'),
    ('66666666-6666-6666-6666-666666666666'::uuid, 'Blood Analyzer'),
    ('66666666-6666-6666-6666-666666666666'::uuid, 'Hormone Tracker'),
    ('66666666-6666-6666-6666-666666666666'::uuid, 'SpO2 Monitor'),
    ('77777777-7777-7777-7777-777777777777'::uuid, 'Blood Analyzer'),
    ('77777777-7777-7777-7777-777777777777'::uuid, 'Hormone Tracker'),
    ('77777777-7777-7777-7777-777777777777'::uuid, 'SpO2 Monitor')
) mappings (plan_id, device_type_name)
join public.device_types dt
  on dt.name = mappings.device_type_name
on conflict do nothing;

insert into public.insight_categories (name, display_order, icon)
values
  ('Heart Health', 1, 'heart'),
  ('Blood Sugar & Energy', 2, 'activity'),
  ('Blood Cells', 3, 'droplets'),
  ('Stress & Recovery', 4, 'brain'),
  ('Sleep & Circadian Rhythm', 5, 'moon'),
  ('Immune & Allergy', 6, 'shield'),
  ('Acid-Base Balance', 7, 'beaker'),
  ('Gut Health', 8, 'sparkles'),
  ('Nutrient Stores', 9, 'pill'),
  ('Menstrual Cycle & Fertility', 10, 'flower'),
  ('Clotting & Bleeding', 11, 'triangle-alert')
on conflict (name) do update
  set display_order = excluded.display_order,
      icon = excluded.icon;

with biomarker_seed as (
  select *
  from (values
    ('Heart Health', 'hs_ctni', 'hs-cTnI', 'ng/L', 1, 4, false, 'High-sensitivity cardiac troponin I for cardiac injury screening.', 1),
    ('Heart Health', 'spo2', 'Blood Oxygen (SpO2)', '%', 1, 3, false, 'Peripheral oxygen saturation.', 2),
    ('Heart Health', 'ldl_cholesterol', 'LDL', 'mg/dL', 2, 3, false, 'Low-density lipoprotein cholesterol.', 3),
    ('Heart Health', 'hdl_cholesterol', 'HDL', 'mg/dL', 2, 2, false, 'High-density lipoprotein cholesterol.', 4),
    ('Heart Health', 'triglycerides', 'Triglycerides', 'mg/dL', 2, 3, false, 'Circulating triglyceride level.', 5),
    ('Blood Sugar & Energy', 'fasting_glucose', 'Fasting Glucose', 'mg/dL', 1, 4, false, 'Blood glucose before food intake.', 1),
    ('Blood Sugar & Energy', 'postprandial_glucose', 'Postprandial Glucose', 'mg/dL', 1, 4, false, 'Blood glucose after meals.', 2),
    ('Blood Sugar & Energy', 'fasting_insulin', 'Fasting Insulin', 'uIU/mL', 2, 3, false, 'Baseline insulin level.', 3),
    ('Blood Sugar & Energy', 'hemoglobin_a1c', 'HbA1c', '%', 2, 3, false, 'Average glucose marker over prior months.', 4),
    ('Blood Cells', 'hemoglobin', 'Hemoglobin', 'g/dL', 2, 3, false, 'Oxygen-carrying protein in red blood cells.', 1),
    ('Blood Cells', 'platelet_count', 'Platelet Count', '10^3/uL', 2, 3, false, 'Platelet concentration for clotting support.', 2),
    ('Blood Cells', 'nlr', 'Neutrophil-Lymphocyte Ratio', 'ratio', 2, 3, true, 'Derived immune-stress ratio.', 3),
    ('Stress & Recovery', 'cortisol', 'Cortisol', 'ug/dL', 1, 4, false, 'Stress hormone sampled across the day.', 1),
    ('Stress & Recovery', 'cortisol_delta', 'Cortisol AM/PM Differential', 'ug/dL', 2, 3, true, 'Derived day-night cortisol differential.', 2),
    ('Stress & Recovery', 'norepinephrine', 'Norepinephrine', 'pg/mL', 1, 3, false, 'Stress-response neurotransmitter.', 3),
    ('Immune & Allergy', 'crp', 'CRP', 'mg/L', 2, 3, false, 'C-reactive protein inflammation marker.', 1),
    ('Nutrient Stores', 'vitamin_d', 'Vitamin D', 'ng/mL', 2, 3, false, 'Vitamin D storage status.', 1),
    ('Nutrient Stores', 'ferritin', 'Ferritin', 'ng/mL', 2, 3, false, 'Iron storage marker.', 2),
    ('Menstrual Cycle & Fertility', 'estradiol', 'Estradiol', 'pg/mL', 1, 3, false, 'Estrogen hormone marker for cycle tracking.', 1),
    ('Menstrual Cycle & Fertility', 'progesterone', 'Progesterone', 'ng/mL', 1, 3, false, 'Luteal and pregnancy-related hormone.', 2),
    ('Menstrual Cycle & Fertility', 'testosterone', 'Testosterone', 'ng/dL', 2, 3, false, 'Androgen marker available in fertility workflows.', 3),
    ('Clotting & Bleeding', 'd_dimer', 'D-dimer', 'mg/L FEU', 1, 4, false, 'Clotting and fibrin degradation marker.', 1)
  ) as t(category_name, code, display_name, unit, priority, alert_level, is_derived, description, display_order)
)
insert into public.biomarkers (
  category_id,
  code,
  display_name,
  unit,
  priority,
  alert_level,
  is_derived,
  description,
  display_order
)
select
  ic.id,
  bs.code,
  bs.display_name,
  bs.unit,
  bs.priority,
  bs.alert_level,
  bs.is_derived,
  bs.description,
  bs.display_order
from biomarker_seed bs
join public.insight_categories ic
  on ic.name = bs.category_name
on conflict (code) do update
  set category_id = excluded.category_id,
      display_name = excluded.display_name,
      unit = excluded.unit,
      priority = excluded.priority,
      alert_level = excluded.alert_level,
      is_derived = excluded.is_derived,
      description = excluded.description,
      display_order = excluded.display_order;

with plan_codes as (
  select *
  from (values
    ('11111111-1111-1111-1111-111111111111'::uuid, array[
      'hs_ctni','spo2','ldl_cholesterol','hdl_cholesterol','triglycerides',
      'fasting_glucose','fasting_insulin','hemoglobin_a1c','hemoglobin','nlr',
      'cortisol','cortisol_delta','norepinephrine','crp','vitamin_d','ferritin'
    ]::text[]),
    ('22222222-2222-2222-2222-222222222222'::uuid, array[
      'hs_ctni','spo2','ldl_cholesterol','hdl_cholesterol','triglycerides',
      'fasting_glucose','fasting_insulin','hemoglobin_a1c','hemoglobin','nlr',
      'cortisol','cortisol_delta','norepinephrine','crp','vitamin_d','ferritin',
      'estradiol','progesterone','testosterone'
    ]::text[]),
    ('33333333-3333-3333-3333-333333333333'::uuid, array[
      'hs_ctni','spo2','ldl_cholesterol','hdl_cholesterol','triglycerides',
      'fasting_glucose','postprandial_glucose','fasting_insulin','hemoglobin_a1c',
      'hemoglobin','nlr','cortisol','cortisol_delta','norepinephrine','crp','vitamin_d','ferritin'
    ]::text[]),
    ('44444444-4444-4444-4444-444444444444'::uuid, array[
      'hs_ctni','spo2','ldl_cholesterol','hdl_cholesterol','triglycerides',
      'fasting_glucose','fasting_insulin','hemoglobin_a1c','hemoglobin','platelet_count','nlr',
      'cortisol','cortisol_delta','norepinephrine','crp','vitamin_d','ferritin','d_dimer'
    ]::text[]),
    ('55555555-5555-5555-5555-555555555555'::uuid, array[
      'spo2','fasting_glucose','hemoglobin','platelet_count','nlr','crp','vitamin_d','ferritin','d_dimer'
    ]::text[]),
    ('66666666-6666-6666-6666-666666666666'::uuid, array[
      'hs_ctni','spo2','ldl_cholesterol','hdl_cholesterol','triglycerides',
      'fasting_glucose','fasting_insulin','hemoglobin_a1c','hemoglobin','nlr',
      'cortisol','cortisol_delta','norepinephrine','crp','vitamin_d','ferritin',
      'estradiol','progesterone','testosterone'
    ]::text[]),
    ('77777777-7777-7777-7777-777777777777'::uuid, array[
      'hs_ctni','spo2','ldl_cholesterol','hdl_cholesterol','triglycerides',
      'fasting_glucose','postprandial_glucose','fasting_insulin','hemoglobin_a1c',
      'hemoglobin','platelet_count','nlr','cortisol','cortisol_delta','norepinephrine',
      'crp','vitamin_d','ferritin','estradiol','progesterone','testosterone','d_dimer'
    ]::text[])
  ) as t(plan_id, biomarker_codes)
)
insert into public.plan_biomarkers (plan_id, biomarker_id)
select pc.plan_id, b.id
from plan_codes pc
cross join lateral unnest(pc.biomarker_codes) as seeded_code(biomarker_code)
join public.biomarkers b
  on b.code = seeded_code.biomarker_code
on conflict do nothing;

insert into public.biomarker_reference_ranges (
  biomarker_id,
  sex,
  context,
  range_low,
  range_high,
  optimal_low,
  optimal_high
)
select b.id, rr.sex, rr.context, rr.range_low, rr.range_high, rr.optimal_low, rr.optimal_high
from (
  values
    ('hs_ctni', 'male', 'default', null::numeric, 20::numeric, null::numeric, null::numeric),
    ('hs_ctni', 'female', 'default', null::numeric, 14::numeric, null::numeric, null::numeric),
    ('fasting_glucose', 'all', 'default', 70::numeric, 99::numeric, null::numeric, null::numeric),
    ('estradiol', 'female', 'follicular_early', 20::numeric, 160::numeric, null::numeric, null::numeric),
    ('estradiol', 'female', 'ovulation_peak', 150::numeric, 750::numeric, null::numeric, null::numeric),
    ('cortisol', 'all', 'AM', 5::numeric, 25::numeric, null::numeric, null::numeric),
    ('cortisol', 'all', 'PM', 3::numeric, 10::numeric, null::numeric, null::numeric)
) as rr(code, sex, context, range_low, range_high, optimal_low, optimal_high)
join public.biomarkers b
  on b.code = rr.code
on conflict (biomarker_id, sex, context) do update
  set range_low = excluded.range_low,
      range_high = excluded.range_high,
      optimal_low = excluded.optimal_low,
      optimal_high = excluded.optimal_high;

insert into public.time_focus_rules (biomarker_id, time_start, time_end, priority, condition_tag)
select b.id, r.time_start, r.time_end, r.priority, r.condition_tag
from (
  values
    ('cortisol', '06:00'::time, '12:00'::time, 10::smallint, null::text),
    ('norepinephrine', '06:00'::time, '12:00'::time, 8::smallint, null::text),
    ('fasting_glucose', '06:00'::time, '10:00'::time, 9::smallint, null::text),
    ('fasting_insulin', '06:00'::time, '10:00'::time, 7::smallint, null::text),
    ('fasting_glucose', '06:00'::time, '23:59'::time, 15::smallint, 'diabetes'),
    ('postprandial_glucose', '06:00'::time, '23:59'::time, 14::smallint, 'diabetes')
) as r(code, time_start, time_end, priority, condition_tag)
join public.biomarkers b
  on b.code = r.code
where not exists (
  select 1
  from public.time_focus_rules existing
  where existing.biomarker_id = b.id
    and existing.time_start = r.time_start
    and existing.time_end = r.time_end
    and existing.priority = r.priority
    and coalesce(existing.condition_tag, '') = coalesce(r.condition_tag, '')
);

insert into public.body_locations (name, display_order)
values
  ('Head', 1),
  ('Eyes', 2),
  ('Ears', 3),
  ('Throat', 4),
  ('Neck', 5),
  ('Chest', 6),
  ('Upper Back', 7),
  ('Lower Back', 8),
  ('Shoulders', 9),
  ('Arms', 10),
  ('Hands', 11),
  ('Upper Abdomen', 12),
  ('Lower Abdomen', 13),
  ('Hips', 14),
  ('Legs', 15),
  ('Knees', 16),
  ('Feet', 17),
  ('Skin (general)', 18)
on conflict (name) do update
  set display_order = excluded.display_order;

insert into public.sensation_types (name)
values
  ('stitchy'),
  ('pain'),
  ('numbness')
on conflict (name) do nothing;

insert into public.suggested_reasons (name, applies_to, body_location_id)
select reason_name, applies_to, bl.id
from (
  values
    ('Tension headache', 'physical', 'Head'),
    ('Eye strain', 'physical', 'Eyes'),
    ('Muscle strain', 'physical', 'Shoulders'),
    ('Dehydration', 'physical', null),
    ('Lack of sleep', 'mental', null),
    ('Work stress', 'mental', null),
    ('Anxiety spike', 'mental', null),
    ('Menstrual discomfort', 'physical', 'Lower Abdomen')
) as reasons(reason_name, applies_to, body_location_name)
left join public.body_locations bl
  on bl.name = reasons.body_location_name
where not exists (
  select 1
  from public.suggested_reasons existing
  where existing.name = reasons.reason_name
    and existing.applies_to = reasons.applies_to
    and coalesce(existing.body_location_id, -1) = coalesce(bl.id, -1)
);

insert into public.suggested_actions (biomarker_id, condition, action_text, priority)
select b.id, sa.condition, sa.action_text, sa.priority
from (
  values
    ('fasting_glucose', 'high', 'Reduce fast-acting sugars and review meal timing.', 10::smallint),
    ('cortisol', 'high', 'Prioritize recovery, sleep, and stress reduction today.', 9::smallint),
    ('vitamin_d', 'low', 'Increase daylight exposure and review vitamin D intake.', 7::smallint),
    ('crp', 'high', 'Monitor symptoms and consider reducing intense exertion temporarily.', 8::smallint),
    ('spo2', 'low', 'Recheck the reading and seek medical guidance if it remains low.', 10::smallint)
) as sa(code, condition, action_text, priority)
join public.biomarkers b
  on b.code = sa.code
where not exists (
  select 1
  from public.suggested_actions existing
  where coalesce(existing.biomarker_id, -1) = b.id
    and existing.condition = sa.condition
    and existing.action_text = sa.action_text
);
