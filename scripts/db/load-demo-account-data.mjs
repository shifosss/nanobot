import {
  createClients,
  findSuggestedReasonId,
  loadReferenceMaps,
  logStep,
  parseArgs,
  resolveTargetConfig,
} from "./common.mjs";
import { cleanupDemoAccountData, resolveDemoAccountState, summarizeDemoTargets } from "./demo-account-helpers.mjs";
import {
  DEMO_NAMESPACE,
  DEMO_PLAN_NAME,
  DEMO_PROFILES,
  countOutOfRangeReadings,
  demoStoragePath,
  generateProfileReadings,
} from "./demo-account-fixture.mjs";

async function insertInChunks(queryFactory, rows, chunkSize = 500) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const { error } = await queryFactory(chunk);
    if (error) {
      throw error;
    }
  }
}

async function normalizeAccountAndProfiles(service, reference) {
  const state = await resolveDemoAccountState(service);

  const { error: accountError } = await service
    .from("accounts")
    .update({ account_type: "parent" })
    .eq("id", state.account.id);
  if (accountError) {
    throw accountError;
  }

  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);
    const { error } = await service
      .from("profiles")
      .update({
        date_of_birth: profileConfig.dateOfBirth,
        biological_sex: profileConfig.biologicalSex,
        height_cm: profileConfig.heightCm,
        weight_kg: profileConfig.weightKg,
      })
      .eq("id", liveProfile.id);
    if (error) {
      throw error;
    }
  }

  return {
    ...state,
    comprehensivePlanId: reference.planIdsByName.get(DEMO_PLAN_NAME),
  };
}

async function insertSubscriptions(service, state) {
  const rows = DEMO_PROFILES.map((profileConfig) => ({
    profile_id: state.profilesByName.get(profileConfig.displayName).id,
    plan_id: state.comprehensivePlanId,
    status: profileConfig.subscription.status,
    started_at: profileConfig.subscription.startedAt,
    current_period_end: profileConfig.subscription.currentPeriodEnd,
  }));

  const { error } = await service.from("profile_subscriptions").insert(rows);
  if (error) {
    throw error;
  }
}

async function insertDevices(service, reference, state) {
  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);
    const rows = profileConfig.devices.map((device) => ({
      device_code: device.code,
      device_type_id: reference.deviceTypeIdsByName.get(device.typeName),
      profile_id: liveProfile.id,
      firmware_version: device.firmwareVersion,
      activated_at: "2026-02-10T00:00:00Z",
    }));

    const { error } = await service.from("devices").insert(rows);
    if (error) {
      throw error;
    }
  }
}

async function loadDeviceMaps(service, state) {
  const profileIds = state.profiles.map((profile) => profile.id);
  const { data, error } = await service
    .from("profile_device_summary")
    .select("device_id, profile_id, device_code, device_type_name")
    .in("profile_id", profileIds);

  if (error) {
    throw error;
  }

  const devicesByProfileName = new Map();

  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);
    const profileDevices = (data ?? []).filter((device) => device.profile_id === liveProfile.id);
    devicesByProfileName.set(profileConfig.displayName, {
      byCode: new Map(profileDevices.map((device) => [device.device_code, device.device_id])),
      byType: new Map(profileDevices.map((device) => [device.device_type_name, device.device_id])),
    });
  }

  return devicesByProfileName;
}

async function insertReadings(service, reference, state, deviceMaps) {
  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);
    const deviceMap = deviceMaps.get(profileConfig.displayName);
    const generated = generateProfileReadings(profileConfig);

    logStep(
      `Generating ${generated.length} readings for ${profileConfig.displayName} (${countOutOfRangeReadings(generated)} out-of-range demo points)`,
    );

    const rows = generated.map((reading) => ({
      profile_id: liveProfile.id,
      biomarker_id: reference.biomarkerIdsByCode.get(reading.biomarkerCode),
      device_id: deviceMap.byType.get(reading.deviceTypeName),
      value: reading.value,
      context: reading.context,
      recorded_at: reading.recordedAt,
    }));

    await insertInChunks(
      (chunk) => service.from("biomarker_readings").insert(chunk),
      rows,
      500,
    );
  }
}

async function insertProfileReferenceRanges(service, reference, state) {
  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);
    const rows = profileConfig.profileReferenceRanges.map((range) => ({
      profile_id: liveProfile.id,
      biomarker_id: reference.biomarkerIdsByCode.get(range.biomarkerCode),
      context: range.context,
      range_low: range.rangeLow,
      range_high: range.rangeHigh,
      sample_size: range.sampleSize,
      effective_from: range.effectiveFrom,
    }));

    const { error } = await service.from("profile_reference_ranges").insert(rows);
    if (error) {
      throw error;
    }
  }
}

function addMinutes(isoString, minutes) {
  return new Date(Date.parse(isoString) + minutes * 60 * 1000).toISOString();
}

function timeBounds(isoString) {
  const center = new Date(isoString);
  const start = new Date(center.getTime() - 15 * 60 * 1000);
  const end = new Date(center.getTime() + 15 * 60 * 1000);
  return {
    windowStart: start.toISOString().slice(11, 19),
    windowEnd: end.toISOString().slice(11, 19),
  };
}

async function findReadingId(service, reference, profileId, question) {
  const { data, error } = await service
    .from("biomarker_readings")
    .select("id")
    .eq("profile_id", profileId)
    .eq("biomarker_id", reference.biomarkerIdsByCode.get(question.biomarkerCode))
    .eq("recorded_at", question.recordedAt)
    .eq("context", question.context)
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function insertQuestionsAndDismissals(service, reference, state) {
  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);

    for (const question of profileConfig.questions) {
      const readingId = await findReadingId(service, reference, liveProfile.id, question);

      const { data: inserted, error } = await service
        .from("biomarker_questions")
        .insert({
          profile_id: liveProfile.id,
          biomarker_id: reference.biomarkerIdsByCode.get(question.biomarkerCode),
          reading_id: readingId,
          is_normal_activity: question.answered ? question.isNormalActivity : null,
          user_note: question.userNote,
          answered_at: question.answered ? addMinutes(question.recordedAt, 6) : null,
          created_at: addMinutes(question.recordedAt, 2),
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      if (question.answered && question.isNormalActivity) {
        const bounds = timeBounds(question.recordedAt);
        const { error: dismissalError } = await service.from("biomarker_dismissal_rules").insert({
          profile_id: liveProfile.id,
          biomarker_id: reference.biomarkerIdsByCode.get(question.biomarkerCode),
          window_start: bounds.windowStart,
          window_end: bounds.windowEnd,
          reason: question.userNote,
          source_question_id: inserted.id,
          is_active: true,
          created_at: addMinutes(question.recordedAt, 7),
        });
        if (dismissalError) {
          throw dismissalError;
        }
      }
    }
  }
}

async function insertIdfwScenarios(service, reference, state) {
  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);

    for (const scenario of profileConfig.idfwScenarios) {
      const { data: session, error: sessionError } = await service
        .from("idfw_sessions")
        .insert({
          profile_id: liveProfile.id,
          has_physical: (scenario.physicalSymptoms ?? []).length > 0,
          has_mental: Boolean(scenario.mentalSymptom),
          created_at: scenario.createdAt,
        })
        .select("id")
        .single();

      if (sessionError) {
        throw sessionError;
      }

      for (const symptom of scenario.physicalSymptoms ?? []) {
        const bodyLocationId = reference.bodyLocationIdsByName.get(symptom.bodyLocationName);
        const { error } = await service.from("idfw_physical_symptoms").insert({
          session_id: session.id,
          body_location_id: bodyLocationId,
          sensation_type_id: reference.sensationTypeIdsByName.get(symptom.sensationTypeName),
          intensity: symptom.intensity,
          selected_reason_id: findSuggestedReasonId(
            reference,
            symptom.selectedReasonName,
            "physical",
            bodyLocationId,
          ),
        });
        if (error) {
          throw error;
        }
      }

      if (scenario.mentalSymptom) {
        const { error } = await service.from("idfw_mental_symptoms").insert({
          session_id: session.id,
          stress_level: scenario.mentalSymptom.stressLevel,
          clarity_level: scenario.mentalSymptom.clarityLevel,
          selected_reason_id: findSuggestedReasonId(
            reference,
            scenario.mentalSymptom.selectedReasonName,
            "mental",
          ),
        });
        if (error) {
          throw error;
        }
      }

      const { error: reportError } = await service.from("idfw_reports").insert({
        session_id: session.id,
        result_summary: scenario.resultSummary,
        matched_conditions: [{ code: `${DEMO_NAMESPACE}_review`, confidence: 0.74 }],
        flagged_biomarkers: scenario.flaggedBiomarkers,
        interpretation: scenario.interpretation,
        suggestions: scenario.suggestions,
        biomarker_snapshot_start: "2026-02-10T00:00:00Z",
        biomarker_snapshot_end: "2026-03-09T23:30:00Z",
        created_at: addMinutes(scenario.createdAt, 5),
      });
      if (reportError) {
        throw reportError;
      }
    }
  }
}

async function insertExportRequests(service, state) {
  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);
    const objectPath = demoStoragePath(liveProfile.id, profileConfig.exportRequest.objectPath);
    const payload = [
      `Namespace: ${DEMO_NAMESPACE}`,
      `Profile: ${profileConfig.displayName}`,
      `Window: ${profileConfig.exportRequest.dateRangeStart} to ${profileConfig.exportRequest.dateRangeEnd}`,
      "Summary: Generated four-week demo dataset with realistic mild abnormalities.",
    ].join("\n");

    const { error: uploadError } = await service.storage
      .from("exports")
      .upload(objectPath, new TextEncoder().encode(payload), {
        contentType: "text/plain",
        upsert: true,
      });
    if (uploadError) {
      throw uploadError;
    }

    const { error } = await service.from("export_requests").insert({
      profile_id: liveProfile.id,
      requester_type: profileConfig.exportRequest.requesterType,
      formats: profileConfig.exportRequest.formats,
      date_range_start: profileConfig.exportRequest.dateRangeStart,
      date_range_end: profileConfig.exportRequest.dateRangeEnd,
      status: "completed",
      file_urls: { txt: objectPath },
      created_at: addMinutes(profileConfig.exportRequest.completedAt, -25),
      completed_at: profileConfig.exportRequest.completedAt,
    });
    if (error) {
      throw error;
    }
  }
}

async function main() {
  const { target } = parseArgs(process.argv.slice(2));
  const config = await resolveTargetConfig(target);
  const { service } = createClients(config);
  const reference = await loadReferenceMaps(service);

  logStep(`Loading managed demo data into ${config.label} Supabase`);
  console.table([summarizeDemoTargets()]);

  logStep("Cleaning previously generated demo rows");
  await cleanupDemoAccountData(service, reference);

  logStep("Normalizing account and profile metadata");
  const state = await normalizeAccountAndProfiles(service, reference);

  logStep("Creating profile subscriptions");
  await insertSubscriptions(service, state);

  logStep("Binding demo devices");
  await insertDevices(service, reference, state);
  const deviceMaps = await loadDeviceMaps(service, state);

  logStep("Inserting biomarker readings");
  await insertReadings(service, reference, state, deviceMaps);

  logStep("Creating personalized ranges");
  await insertProfileReferenceRanges(service, reference, state);

  logStep("Creating biomarker questions and dismissal rules");
  await insertQuestionsAndDismissals(service, reference, state);

  logStep("Creating IDFW sessions and reports");
  await insertIdfwScenarios(service, reference, state);

  logStep("Creating export requests and files");
  await insertExportRequests(service, state);

  logStep(`Managed demo data load complete for ${config.label}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
