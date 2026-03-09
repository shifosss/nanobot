import assert from "node:assert/strict";

import {
  assertErrorMessage,
  createClients,
  expectedTimeFocusCases,
  fetchMaybeSingle,
  fetchSingle,
  loadReferenceMaps,
  logStep,
  parseArgs,
  resolveTargetConfig,
  signInUser,
} from "./common.mjs";
import { FIXTURE_ACCOUNTS } from "./fixtures.mjs";

async function mapFixtureState(service) {
  const { data: accounts, error: accountError } = await service
    .from("accounts")
    .select("id, email, account_type");

  if (accountError) {
    throw accountError;
  }

  for (const fixture of FIXTURE_ACCOUNTS) {
    const account = accounts.find((row) => row.email === fixture.email);
    assert(account, `Missing fixture account for ${fixture.email}. Run load-sample-data first.`);
    fixture.accountId = account.id;
  }

  const { data: profiles, error: profileError } = await service
    .from("profiles")
    .select("id, account_id, display_name");

  if (profileError) {
    throw profileError;
  }

  for (const fixture of FIXTURE_ACCOUNTS) {
    fixture.createdProfiles = profiles.filter(
      (profile) =>
        profile.account_id === fixture.accountId &&
        fixture.profiles.some((candidate) => candidate.displayName === profile.display_name),
    );
  }
}

async function verifyAccountAndProfileOwnership(config, fixture, otherFixture) {
  const signedIn = await signInUser(config, fixture.email, fixture.password);
  const otherSignedIn = await signInUser(config, otherFixture.email, otherFixture.password);

  const ownAccount = await fetchSingle(
    signedIn.client.from("accounts").select("id, email, account_type").eq("id", fixture.accountId),
    `own account for ${fixture.email}`,
  );
  assert.equal(ownAccount.email, fixture.email);
  assert.equal(ownAccount.account_type, fixture.accountType);

  const { data: ownProfiles, error: ownProfileError } = await signedIn.client
    .from("profiles")
    .select("id, display_name")
    .eq("account_id", fixture.accountId);
  if (ownProfileError) {
    throw ownProfileError;
  }
  assert.equal(ownProfiles.length, fixture.profiles.length);

  const { data: hiddenProfiles, error: hiddenProfileError } = await signedIn.client
    .from("profiles")
    .select("id")
    .eq("account_id", otherFixture.accountId);
  if (hiddenProfileError) {
    throw hiddenProfileError;
  }
  assert.equal(hiddenProfiles.length, 0, "RLS should hide other account profiles.");

  const { error: extraProfileError } = await signedIn.client.from("profiles").insert({
    account_id: fixture.accountId,
    display_name: `${fixture.key}-extra`,
    date_of_birth: "1999-01-01",
    biological_sex: "female",
  });
  assertErrorMessage(
    extraProfileError,
    "Individual accounts may only have one profile",
    "individual profile limit",
  );

  const foreignAccount = await fetchMaybeSingle(
    otherSignedIn.client.from("accounts").select("id").eq("id", fixture.accountId),
    "cross-account account read",
  );
  assert.equal(foreignAccount, null);
}

async function verifySubscriptionsAndViews(config, fixture) {
  const signedIn = await signInUser(config, fixture.email, fixture.password);

  const { data: subscriptions, error: subscriptionError } = await signedIn.client
    .from("current_profile_subscription")
    .select("profile_id, profile_display_name, plan_name, next_plan_name, status");
  if (subscriptionError) {
    throw subscriptionError;
  }

  assert.equal(subscriptions.length, fixture.profiles.length);

  for (const profileFixture of fixture.profiles) {
    const liveProfile = fixture.createdProfiles.find(
      (candidate) => candidate.display_name === profileFixture.displayName,
    );
    assert(liveProfile, `Missing live profile for ${profileFixture.displayName}`);

    const subscription = subscriptions.find(
      (row) => row.profile_id === liveProfile.id,
    );
    assert(subscription, `Missing subscription for ${profileFixture.displayName}`);
    assert.equal(subscription.profile_display_name, profileFixture.displayName);
    assert.equal(subscription.plan_name, profileFixture.subscription.planName);
    assert.equal(subscription.status, profileFixture.subscription.status);

    if (profileFixture.subscription.nextPlanName) {
      assert.equal(
        subscription.next_plan_name,
        profileFixture.subscription.nextPlanName,
      );
    }
  }

  const { data: devices, error } = await signedIn.client
    .from("profile_device_summary")
    .select("profile_display_name, device_code, device_type_name, profile_id");
  if (error) {
    throw error;
  }

  const expectedDeviceCount = fixture.profiles.reduce((count, profile) => count + profile.devices.length, 0);
  assert.equal(devices.length, expectedDeviceCount);

  for (const profileFixture of fixture.profiles) {
    const liveProfile = fixture.createdProfiles.find(
      (candidate) => candidate.display_name === profileFixture.displayName,
    );
    const profileDevices = devices.filter((device) => device.profile_id === liveProfile.id);

    const expectedByType = new Map();
    for (const device of profileFixture.devices) {
      expectedByType.set(
        device.typeName,
        (expectedByType.get(device.typeName) ?? 0) + 1,
      );
    }

    for (const [typeName, expectedCount] of expectedByType.entries()) {
      const actualCount = profileDevices.filter(
        (device) => device.device_type_name === typeName,
      ).length;
      assert.equal(
        actualCount,
        expectedCount,
        `${profileFixture.displayName} should have ${expectedCount} ${typeName} devices.`,
      );
    }
  }
}

async function verifyParentAccountAccess(config) {
  const household = FIXTURE_ACCOUNTS.find((fixture) => fixture.key === "household");
  const signedIn = await signInUser(config, household.email, household.password);

  const { data: profiles, error } = await signedIn.client
    .from("profiles")
    .select("id, display_name")
    .eq("account_id", household.accountId)
    .order("display_name");
  if (error) {
    throw error;
  }

  assert.equal(profiles.length, 2, "Parent account should retain two profiles.");
  assert.deepEqual(
    profiles.map((profile) => profile.display_name),
    ["Grace Kim", "Noah Kim"],
  );

  const { data: subscriptions, error: subscriptionError } = await signedIn.client
    .from("current_profile_subscription")
    .select("profile_display_name, plan_name")
    .order("profile_display_name");
  if (subscriptionError) {
    throw subscriptionError;
  }

  assert.deepEqual(subscriptions, [
    { profile_display_name: "Grace Kim", plan_name: "Elderly Care" },
    { profile_display_name: "Noah Kim", plan_name: "Child Care" },
  ]);
}

async function verifyReadingsAndRanges(config, reference, fixture) {
  const signedIn = await signInUser(config, fixture.email, fixture.password);

  for (const profileFixture of fixture.profiles) {
    const profile = fixture.createdProfiles.find(
      (candidate) => candidate.display_name === profileFixture.displayName,
    );
    assert(profile, `Expected profile ${profileFixture.displayName}`);

    const { data: readings, error: readingError } = await signedIn.client
      .from("biomarker_readings")
      .select("id, biomarker_id, context, value")
      .eq("profile_id", profile.id);
    if (readingError) {
      throw readingError;
    }

    assert.equal(readings.length, (profileFixture.readings ?? []).length);

    if ((profileFixture.profileReferenceRanges ?? []).length > 0) {
      const { data: ranges, error: rangeError } = await signedIn.client
        .from("profile_reference_ranges")
        .select("biomarker_id, context, sample_size")
        .eq("profile_id", profile.id);
      if (rangeError) {
        throw rangeError;
      }

      assert.equal(ranges.length, profileFixture.profileReferenceRanges.length);
      for (const range of profileFixture.profileReferenceRanges) {
        const biomarkerId = reference.biomarkerIdsByCode.get(range.biomarkerCode);
        assert(
          ranges.some(
            (row) =>
              row.biomarker_id === biomarkerId &&
              row.context === range.context &&
              row.sample_size === range.sampleSize,
          ),
          `Missing range for ${range.biomarkerCode}`,
        );
      }
    }
  }
}

async function verifyCrossAccountReadingIsolation(config) {
  const ava = FIXTURE_ACCOUNTS.find((fixture) => fixture.key === "ava");
  const liam = FIXTURE_ACCOUNTS.find((fixture) => fixture.key === "liam");
  const avaClient = await signInUser(config, ava.email, ava.password);

  const { data, error } = await avaClient.client
    .from("biomarker_readings")
    .select("id")
    .eq("profile_id", liam.createdProfiles[0].id);
  if (error) {
    throw error;
  }

  assert.equal(data.length, 0, "RLS should hide another account's readings.");
}

async function verifyDeviceBindingRules(config, fixture) {
  const signedIn = await signInUser(config, fixture.email, fixture.password);
  const profile = fixture.createdProfiles[0];

  const { error: rebindError } = await signedIn.client.rpc("bind_device", {
    p_device_code: fixture.profiles[0].devices[0].code,
    p_profile_id: profile.id,
  });
  assertErrorMessage(rebindError, "already been bound", "device rebinding");

  if (fixture.key === "liam") {
    const { error: incompatibleError } = await signedIn.client.rpc("bind_device", {
      p_device_code: "NB-SAMPLE-LIAM-HT-001",
      p_profile_id: profile.id,
    });
    assertErrorMessage(
      incompatibleError,
      "active plan does not support this device type",
      "plan-incompatible device",
    );
  }
}

async function verifyBiomarkerQuestions(config, reference) {
  const liam = FIXTURE_ACCOUNTS.find((fixture) => fixture.key === "liam");
  const ava = FIXTURE_ACCOUNTS.find((fixture) => fixture.key === "ava");
  const liamClient = await signInUser(config, liam.email, liam.password);
  const avaClient = await signInUser(config, ava.email, ava.password);

  const question = await fetchSingle(
    liamClient.client.from("biomarker_questions").select("id, answered_at").limit(1),
    "answered biomarker question",
  );
  assert(question.answered_at, "Answered question should have answered_at set.");

  const dismissal = await fetchSingle(
    liamClient.client.from("biomarker_dismissal_rules").select("reason, is_active").limit(1),
    "dismissal rule",
  );
  assert.equal(dismissal.is_active, true);

  const { error: foreignAnswerError } = await avaClient.client.rpc("answer_biomarker_question", {
    p_question_id: question.id,
    p_is_normal_activity: false,
    p_user_note: "Not my question",
  });
  assertErrorMessage(foreignAnswerError, "Question not found or not owned", "foreign question answer");

  const { error: invalidQuestionInsertError } = await liamClient.client
    .from("biomarker_questions")
    .insert({
      profile_id: ava.createdProfiles[0].id,
      biomarker_id: reference.biomarkerIdsByCode.get("fasting_glucose"),
      reading_id: 1,
    });
  assert(invalidQuestionInsertError, "Direct biomarker question insert should fail.");
}

async function verifyIdfwFlows(config) {
  const ava = FIXTURE_ACCOUNTS.find((fixture) => fixture.key === "ava");
  const sofia = FIXTURE_ACCOUNTS.find((fixture) => fixture.key === "sofia");
  const avaClient = await signInUser(config, ava.email, ava.password);
  const sofiaClient = await signInUser(config, sofia.email, sofia.password);

  const avaSessions = await fetchSingle(
    avaClient.client.from("idfw_sessions").select("id, has_physical, has_mental").limit(1),
    "Ava physical IDFW session",
  );
  assert.equal(avaSessions.has_physical, true);
  assert.equal(avaSessions.has_mental, false);

  const { data: sofiaSessions, error: sessionError } = await sofiaClient.client
    .from("idfw_sessions")
    .select("id, has_physical, has_mental");
  if (sessionError) {
    throw sessionError;
  }

  assert.equal(sofiaSessions.length, 2);
  assert(sofiaSessions.some((session) => session.has_mental && !session.has_physical));
  assert(sofiaSessions.some((session) => session.has_mental && session.has_physical));

  const { data: sofiaReports, error: reportError } = await sofiaClient.client
    .from("idfw_reports")
    .select("id, result_summary");
  if (reportError) {
    throw reportError;
  }

  assert.equal(sofiaReports.length, 2);
}

async function verifyExportsAndStorage(config) {
  const ava = FIXTURE_ACCOUNTS.find((fixture) => fixture.key === "ava");
  const liam = FIXTURE_ACCOUNTS.find((fixture) => fixture.key === "liam");
  const avaClient = await signInUser(config, ava.email, ava.password);
  const liamClient = await signInUser(config, liam.email, liam.password);

  const request = await fetchSingle(
    avaClient.client.from("export_requests").select("id, file_urls, status").limit(1),
    "Ava export request",
  );
  assert.equal(request.status, "completed");
  const objectPath = request.file_urls.txt;

  const { data: ownSignedUrl, error: ownSignedUrlError } = await avaClient.client.storage
    .from("exports")
    .createSignedUrl(objectPath, 60);
  if (ownSignedUrlError) {
    throw ownSignedUrlError;
  }
  assert(ownSignedUrl.signedUrl.includes("token="));

  const { error: foreignSignedUrlError } = await liamClient.client.storage
    .from("exports")
    .createSignedUrl(objectPath, 60);
  assert(foreignSignedUrlError, "Another user should not access Ava's export.");
}

async function verifyTimeFocus(config) {
  for (const testCase of expectedTimeFocusCases()) {
    const fixture = FIXTURE_ACCOUNTS.find((entry) => entry.key === testCase.accountKey);
    const profileFixture = fixture.profiles.find((entry) => entry.key === testCase.profileKey);
    const liveProfile = fixture.createdProfiles.find(
      (entry) => entry.display_name === profileFixture.displayName,
    );
    const signedIn = await signInUser(config, fixture.email, fixture.password);

    const { data, error } = await signedIn.client.rpc("get_time_focus_biomarker", {
      p_profile_id: liveProfile.id,
      p_at_time: testCase.atTime,
    });
    if (error) {
      throw error;
    }

    assert.equal(data[0].biomarker_code, testCase.biomarkerCode);
  }
}

async function main() {
  const { target } = parseArgs(process.argv.slice(2));
  const config = await resolveTargetConfig(target);
  const { service } = createClients(config);
  const reference = await loadReferenceMaps(service);

  logStep(`Verifying sample database scenarios on ${config.label}`);
  await mapFixtureState(service);

  await verifyAccountAndProfileOwnership(config, FIXTURE_ACCOUNTS[0], FIXTURE_ACCOUNTS[1]);
  await verifySubscriptionsAndViews(config, FIXTURE_ACCOUNTS[0]);
  await verifySubscriptionsAndViews(config, FIXTURE_ACCOUNTS[2]);
  await verifyParentAccountAccess(config);
  await verifyReadingsAndRanges(config, reference, FIXTURE_ACCOUNTS[1]);
  await verifyReadingsAndRanges(config, reference, FIXTURE_ACCOUNTS[3]);
  await verifyCrossAccountReadingIsolation(config);
  await verifyDeviceBindingRules(config, FIXTURE_ACCOUNTS[1]);
  await verifyBiomarkerQuestions(config, reference);
  await verifyIdfwFlows(config);
  await verifyExportsAndStorage(config);
  await verifyTimeFocus(config);

  logStep(`All verification scenarios passed on ${config.label}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
