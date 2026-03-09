import assert from "node:assert/strict";

import { createClients, loadReferenceMaps, logStep, parseArgs, resolveTargetConfig } from "./common.mjs";
import { resolveDemoAccountState, summarizeDemoTargets } from "./demo-account-helpers.mjs";
import {
  DEMO_PLAN_NAME,
  DEMO_PROFILES,
  countOutOfRangeReadings,
  expectedReadingCountPerProfile,
} from "./demo-account-fixture.mjs";

function groupBy(items, keySelector) {
  const grouped = new Map();

  for (const item of items) {
    const key = keySelector(item);
    const bucket = grouped.get(key) ?? [];
    bucket.push(item);
    grouped.set(key, bucket);
  }

  return grouped;
}

async function fetchAllProfileReadings(service, profileId) {
  const pageSize = 1000;
  const rows = [];

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await service
      .from("biomarker_readings")
      .select("biomarker_id, context, value")
      .eq("profile_id", profileId)
      .range(from, to);

    if (error) {
      throw error;
    }

    rows.push(...(data ?? []));
    if ((data ?? []).length < pageSize) {
      break;
    }
  }

  return rows;
}

async function verifyAccountAndProfiles(service, state) {
  assert.equal(state.account.account_type, "parent");

  const alex = state.profilesByName.get("alex");
  const judy = state.profilesByName.get("judy");

  assert.equal(alex.date_of_birth, "1993-08-14");
  assert.equal(alex.biological_sex, "female");
  assert.equal(judy.date_of_birth, "1998-10-02");
  assert.equal(judy.biological_sex, "female");
}

async function verifySubscriptionsAndDevices(service, state) {
  const profileIds = state.profiles.map((profile) => profile.id);
  const { data: subscriptions, error: subscriptionError } = await service
    .from("current_profile_subscription")
    .select("profile_id, profile_display_name, plan_name, status")
    .in("profile_id", profileIds)
    .order("profile_display_name");
  if (subscriptionError) {
    throw subscriptionError;
  }

  assert.equal(subscriptions.length, DEMO_PROFILES.length);
  for (const subscription of subscriptions) {
    assert.equal(subscription.plan_name, DEMO_PLAN_NAME);
    assert.equal(subscription.status, "active");
  }

  const { data: devices, error: deviceError } = await service
    .from("profile_device_summary")
    .select("profile_id, profile_display_name, device_code, device_type_name")
    .in("profile_id", profileIds)
    .order("profile_display_name");
  if (deviceError) {
    throw deviceError;
  }

  assert.equal(devices.length, DEMO_PROFILES.length * 3);

  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);
    const profileDevices = devices.filter((device) => device.profile_id === liveProfile.id);
    assert.equal(profileDevices.length, 3, `${profileConfig.displayName} should have three devices.`);
    assert.deepEqual(
      profileDevices.map((device) => device.device_type_name).sort(),
      ["Blood Analyzer", "Hormone Tracker", "SpO2 Monitor"],
    );
  }
}

async function verifyReadings(service, reference, state) {
  const codeById = new Map(
    [...reference.biomarkerIdsByCode.entries()].map(([code, id]) => [String(id), code]),
  );

  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);
    const readings = await fetchAllProfileReadings(service, liveProfile.id);

    assert.equal(
      readings.length,
      expectedReadingCountPerProfile(),
      `${profileConfig.displayName} reading count mismatch.`,
    );

    const normalized = readings.map((reading) => ({
      biomarkerCode: codeById.get(String(reading.biomarker_id)),
      context: reading.context,
      value: Number(reading.value),
    }));
    const grouped = groupBy(normalized, (reading) => reading.biomarkerCode);

    for (const [biomarkerCode, items] of grouped.entries()) {
      assert.equal(items.length, 1344, `${profileConfig.displayName} missing slots for ${biomarkerCode}.`);
    }

    assert(
      grouped.get("cortisol").some((reading) => reading.context === "AM"),
      `${profileConfig.displayName} should have AM cortisol readings.`,
    );
    assert(
      grouped.get("cortisol").some((reading) => reading.context === "PM"),
      `${profileConfig.displayName} should have PM cortisol readings.`,
    );

    for (const code of ["estradiol", "progesterone"]) {
      const contexts = new Set(grouped.get(code).map((reading) => reading.context));
      assert(contexts.has("follicular_early"));
      assert(contexts.has("ovulation_peak"));
      assert(contexts.has("luteal_mid"));
    }

    const abnormalCount = countOutOfRangeReadings(normalized);
    assert(abnormalCount > 200, `${profileConfig.displayName} should have some mild abnormalities.`);
    assert(abnormalCount < 7000, `${profileConfig.displayName} abnormalities should remain bounded.`);
  }
}

async function verifyRelatedRecords(service, reference, state) {
  const profileIds = state.profiles.map((profile) => profile.id);

  const { data: ranges, error: rangeError } = await service
    .from("profile_reference_ranges")
    .select("profile_id, biomarker_id, context")
    .in("profile_id", profileIds);
  if (rangeError) {
    throw rangeError;
  }
  assert.equal(
    ranges.length,
    DEMO_PROFILES.reduce((sum, profile) => sum + profile.profileReferenceRanges.length, 0),
  );

  const { data: questions, error: questionError } = await service
    .from("biomarker_questions")
    .select("id, profile_id, answered_at")
    .in("profile_id", profileIds);
  if (questionError) {
    throw questionError;
  }
  assert.equal(
    questions.length,
    DEMO_PROFILES.reduce((sum, profile) => sum + profile.questions.length, 0),
  );
  assert.equal(
    questions.filter((question) => Boolean(question.answered_at)).length,
    DEMO_PROFILES.flatMap((profile) => profile.questions).filter((question) => question.answered).length,
  );

  const { data: dismissals, error: dismissalError } = await service
    .from("biomarker_dismissal_rules")
    .select("id, profile_id, biomarker_id")
    .in("profile_id", profileIds);
  if (dismissalError) {
    throw dismissalError;
  }
  assert.equal(
    dismissals.length,
    DEMO_PROFILES.flatMap((profile) => profile.questions).filter(
      (question) => question.answered && question.isNormalActivity,
    ).length,
  );

  const { data: sessions, error: sessionError } = await service
    .from("idfw_sessions")
    .select("id, profile_id, has_physical, has_mental")
    .in("profile_id", profileIds);
  if (sessionError) {
    throw sessionError;
  }
  assert.equal(
    sessions.length,
    DEMO_PROFILES.reduce((sum, profile) => sum + profile.idfwScenarios.length, 0),
  );

  const sessionIds = sessions.map((session) => session.id);
  const { data: reports, error: reportError } = await service
    .from("idfw_reports")
    .select("session_id, result_summary")
    .in("session_id", sessionIds);
  if (reportError) {
    throw reportError;
  }
  assert.equal(reports.length, sessions.length);
  assert(reports.every((report) => report.result_summary.startsWith("DEMO:")));

  const { data: exports, error: exportError } = await service
    .from("export_requests")
    .select("profile_id, status, file_urls")
    .in("profile_id", profileIds);
  if (exportError) {
    throw exportError;
  }
  assert.equal(exports.length, DEMO_PROFILES.length);
  assert(exports.every((row) => row.status === "completed"));
  assert(
    exports.every((row) => String(row.file_urls?.txt ?? "").includes("/demo-account/")),
    "Exports should point at the managed demo path.",
  );

  const judyProfile = state.profilesByName.get("judy");
  const { data: glucoseQuestions, error: glucoseQuestionError } = await service
    .from("biomarker_questions")
    .select("id")
    .eq("profile_id", judyProfile.id)
    .eq("biomarker_id", reference.biomarkerIdsByCode.get("postprandial_glucose"));
  if (glucoseQuestionError) {
    throw glucoseQuestionError;
  }
  assert.equal(glucoseQuestions.length, 1);
}

async function main() {
  const { target } = parseArgs(process.argv.slice(2));
  const config = await resolveTargetConfig(target);
  const { service } = createClients(config);
  const reference = await loadReferenceMaps(service);

  logStep(`Verifying managed demo data on ${config.label}`);
  console.table([summarizeDemoTargets()]);

  const state = await resolveDemoAccountState(service);
  await verifyAccountAndProfiles(service, state);
  await verifySubscriptionsAndDevices(service, state);
  await verifyReadings(service, reference, state);
  await verifyRelatedRecords(service, reference, state);

  logStep(`Managed demo verification passed on ${config.label}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
