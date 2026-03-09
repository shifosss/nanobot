import {
  createClients,
  ensureAuthUser,
  ensureSampleUsersDeleted,
  fetchSingle,
  findSuggestedReasonId,
  loadReferenceMaps,
  logStep,
  parseArgs,
  resolveTargetConfig,
  signInUser,
  summarizeFixtureShape,
} from "./common.mjs";
import { FIXTURE_ACCOUNTS, SAMPLE_NAMESPACE } from "./fixtures.mjs";

async function insertSubscription(userClient, reference, fixture) {
  const { error } = await userClient.from("account_subscriptions").insert({
    account_id: fixture.accountId,
    plan_id: reference.planIdsByName.get(fixture.subscription.planName),
    next_plan_id: fixture.subscription.nextPlanName
      ? reference.planIdsByName.get(fixture.subscription.nextPlanName)
      : null,
    status: fixture.subscription.status,
    started_at: fixture.subscription.startedAt,
    current_period_end: fixture.subscription.currentPeriodEnd,
  });

  if (error) {
    throw error;
  }
}

async function createProfilesAndBindDevices(service, userClient, reference, fixture) {
  const createdProfiles = [];

  for (const profileFixture of fixture.profiles) {
    const { data: profileRows, error: profileError } = await userClient
      .from("profiles")
      .insert({
        account_id: fixture.accountId,
        display_name: profileFixture.displayName,
        date_of_birth: profileFixture.dateOfBirth,
        biological_sex: profileFixture.biologicalSex,
        height_cm: profileFixture.heightCm,
        weight_kg: profileFixture.weightKg,
      })
      .select("*");

    if (profileError) {
      throw profileError;
    }

    const createdProfile = {
      ...profileFixture,
      ...profileRows[0],
    };

    for (const deviceFixture of profileFixture.devices) {
      const { error: deviceError } = await service.from("devices").insert({
        device_code: deviceFixture.code,
        device_type_id: reference.deviceTypeIdsByName.get(deviceFixture.typeName),
        firmware_version: deviceFixture.firmwareVersion,
        profile_id: null,
      });

      if (deviceError) {
        throw deviceError;
      }

      const { error: bindError } = await userClient.rpc("bind_device", {
        p_device_code: deviceFixture.code,
        p_profile_id: createdProfile.id,
      });

      if (bindError) {
        throw bindError;
      }
    }

    createdProfiles.push(createdProfile);
  }

  return createdProfiles;
}

async function provisionUnboundDevices(service, reference, fixture) {
  for (const deviceFixture of fixture.unboundDevices ?? []) {
    const { error } = await service.from("devices").insert({
      device_code: deviceFixture.code,
      device_type_id: reference.deviceTypeIdsByName.get(deviceFixture.typeName),
      firmware_version: deviceFixture.firmwareVersion,
      profile_id: null,
    });

    if (error) {
      throw error;
    }
  }
}

async function insertReadings(userClient, service, reference, profileFixture) {
  const { data: devices, error: deviceError } = await service
    .from("profile_device_summary")
    .select("device_id, device_code")
    .eq("profile_id", profileFixture.id);

  if (deviceError) {
    throw deviceError;
  }

  const deviceIdsByCode = new Map(devices.map((device) => [device.device_code, device.device_id]));
  const readingIdsByBiomarker = new Map();

  for (const reading of profileFixture.readings ?? []) {
    const { data, error } = await userClient
      .from("biomarker_readings")
      .insert({
        profile_id: profileFixture.id,
        biomarker_id: reference.biomarkerIdsByCode.get(reading.biomarkerCode),
        device_id: deviceIdsByCode.get(reading.deviceCode),
        value: reading.value,
        context: reading.context,
        recorded_at: reading.recordedAt,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    readingIdsByBiomarker.set(reading.biomarkerCode, data.id);
  }

  return readingIdsByBiomarker;
}

async function insertProfileReferenceRanges(userClient, reference, profileFixture) {
  for (const range of profileFixture.profileReferenceRanges ?? []) {
    const { error } = await userClient.from("profile_reference_ranges").insert({
      profile_id: profileFixture.id,
      biomarker_id: reference.biomarkerIdsByCode.get(range.biomarkerCode),
      context: range.context,
      range_low: range.rangeLow,
      range_high: range.rangeHigh,
      sample_size: range.sampleSize,
      effective_from: range.effectiveFrom,
    });

    if (error) {
      throw error;
    }
  }
}

async function insertQuestionAndAnswer(service, userClient, reference, profileFixture, readingIdsByBiomarker) {
  if (!profileFixture.question) {
    return;
  }

  const { data: questionRows, error: questionError } = await service
    .from("biomarker_questions")
    .insert({
      profile_id: profileFixture.id,
      biomarker_id: reference.biomarkerIdsByCode.get(profileFixture.question.biomarkerCode),
      reading_id: readingIdsByBiomarker.get(profileFixture.question.biomarkerCode),
    })
    .select("id");

  if (questionError) {
    throw questionError;
  }

  const { error: answerError } = await userClient.rpc("answer_biomarker_question", {
    p_question_id: questionRows[0].id,
    p_is_normal_activity: true,
    p_user_note: profileFixture.question.note,
  });

  if (answerError) {
    throw answerError;
  }
}

async function insertIdfwSessions(userClient, service, reference, profileFixture) {
  for (const scenario of profileFixture.idfwScenarios ?? []) {
    const physicalSymptoms = (scenario.physicalSymptoms ?? []).map((symptom) => {
      const bodyLocationId = reference.bodyLocationIdsByName.get(symptom.bodyLocationName);

      return {
        body_location_id: bodyLocationId,
        sensation_type_id: reference.sensationTypeIdsByName.get(symptom.sensationTypeName),
        intensity: symptom.intensity,
        selected_reason_id: findSuggestedReasonId(
          reference,
          symptom.selectedReasonName,
          "physical",
          bodyLocationId,
        ),
      };
    });

    const mentalSymptom = scenario.mentalSymptom
      ? {
          stress_level: scenario.mentalSymptom.stressLevel,
          clarity_level: scenario.mentalSymptom.clarityLevel,
          selected_reason_id: findSuggestedReasonId(
            reference,
            scenario.mentalSymptom.selectedReasonName,
            "mental",
          ),
        }
      : null;

    const { data: sessionId, error: sessionError } = await userClient.rpc("create_idfw_session", {
      p_profile_id: profileFixture.id,
      p_physical_symptoms: physicalSymptoms,
      p_mental_symptom: mentalSymptom,
    });

    if (sessionError) {
      throw sessionError;
    }

    const { error: reportError } = await service.from("idfw_reports").insert({
      session_id: sessionId,
      result_summary: `${profileFixture.displayName} ${scenario.kind} symptom check-in completed.`,
      matched_conditions: [{ code: "sample_review", confidence: 0.72 }],
      flagged_biomarkers: [{ biomarker_code: "cortisol", status: "watch" }],
      interpretation: "Sample report generated for database verification.",
      suggestions: "Review symptoms alongside recent biomarker trends.",
      biomarker_snapshot_start: "2026-03-09T00:00:00Z",
      biomarker_snapshot_end: "2026-03-09T23:59:59Z",
    });

    if (reportError) {
      throw reportError;
    }
  }
}

async function insertExportRequest(userClient, service, profileFixture) {
  if (!profileFixture.exportRequest) {
    return;
  }

  const { data: request, error: requestError } = await userClient
    .from("export_requests")
    .insert({
      profile_id: profileFixture.id,
      requester_type: profileFixture.exportRequest.requesterType,
      formats: profileFixture.exportRequest.formats,
      date_range_start: profileFixture.exportRequest.dateRangeStart,
      date_range_end: profileFixture.exportRequest.dateRangeEnd,
      status: "pending",
    })
    .select("id")
    .single();

  if (requestError) {
    throw requestError;
  }

  const objectPath = `${profileFixture.id}/${request.id}/summary.txt`;
  const { error: uploadError } = await userClient.storage
    .from("exports")
    .upload(objectPath, new TextEncoder().encode(`Sample export for ${profileFixture.displayName}`), {
      contentType: "text/plain",
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { error: updateError } = await service
    .from("export_requests")
    .update({
      status: "completed",
      file_urls: { txt: objectPath },
      completed_at: "2026-03-09T13:15:00Z",
    })
    .eq("id", request.id);

  if (updateError) {
    throw updateError;
  }
}

async function main() {
  const { target } = parseArgs(process.argv.slice(2));
  const config = await resolveTargetConfig(target);
  const { service } = createClients(config);

  logStep(`Loading sample data into ${config.label} Supabase`);
  console.table(summarizeFixtureShape());

  await ensureSampleUsersDeleted(service);
  const reference = await loadReferenceMaps(service);

  for (const fixture of FIXTURE_ACCOUNTS) {
    const authUser = await ensureAuthUser(service, fixture);
    const signedIn = await signInUser(config, fixture.email, fixture.password);
    const account = await fetchSingle(
      signedIn.client.from("accounts").select("id, email, account_type").eq("id", authUser.id),
      `account mirror for ${fixture.email}`,
    );

    fixture.accountId = account.id;
    await insertSubscription(signedIn.client, reference, fixture);
    fixture.createdProfiles = await createProfilesAndBindDevices(
      service,
      signedIn.client,
      reference,
      fixture,
    );
    await provisionUnboundDevices(service, reference, fixture);

    for (const profile of fixture.createdProfiles) {
      const readingIdsByBiomarker = await insertReadings(signedIn.client, service, reference, profile);
      await insertProfileReferenceRanges(signedIn.client, reference, profile);
      await insertQuestionAndAnswer(
        service,
        signedIn.client,
        reference,
        profile,
        readingIdsByBiomarker,
      );
      await insertIdfwSessions(signedIn.client, service, reference, profile);
      await insertExportRequest(signedIn.client, service, profile);
    }
  }

  logStep(`Sample data load complete for ${config.label}. Namespace: ${SAMPLE_NAMESPACE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
