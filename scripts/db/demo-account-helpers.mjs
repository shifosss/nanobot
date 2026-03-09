import assert from "node:assert/strict";

import { fetchSingle } from "./common.mjs";
import {
  DEMO_ACCOUNT_EMAIL,
  DEMO_NAMESPACE,
  DEMO_PROFILES,
  managedDeviceCodes,
} from "./demo-account-fixture.mjs";

export async function resolveDemoAccountState(service) {
  const account = await fetchSingle(
    service.from("accounts").select("id, email, account_type").eq("email", DEMO_ACCOUNT_EMAIL),
    `demo account ${DEMO_ACCOUNT_EMAIL}`,
  );

  const profileNames = DEMO_PROFILES.map((profile) => profile.displayName);
  const { data: profiles, error: profileError } = await service
    .from("profiles")
    .select("id, account_id, display_name, date_of_birth, biological_sex, height_cm, weight_kg")
    .eq("account_id", account.id)
    .in("display_name", profileNames)
    .order("display_name");

  if (profileError) {
    throw profileError;
  }

  assert.equal(
    profiles.length,
    DEMO_PROFILES.length,
    `Expected ${DEMO_PROFILES.length} target profiles under ${DEMO_ACCOUNT_EMAIL}.`,
  );

  for (const profile of DEMO_PROFILES) {
    assert(
      profiles.some((row) => row.display_name === profile.displayName),
      `Missing profile ${profile.displayName}.`,
    );
  }

  const profilesByName = new Map(profiles.map((profile) => [profile.display_name, profile]));
  return {
    account,
    profiles,
    profilesByName,
  };
}

async function removeStoragePaths(service, objectPaths) {
  if (objectPaths.length === 0) {
    return;
  }

  const { error } = await service.storage.from("exports").remove(objectPaths);
  if (error) {
    throw error;
  }
}

export async function cleanupDemoAccountData(service, reference) {
  const state = await resolveDemoAccountState(service);
  const profileIds = state.profiles.map((profile) => profile.id);

  const { data: exportRows, error: exportError } = await service
    .from("export_requests")
    .select("id, profile_id, file_urls")
    .in("profile_id", profileIds);

  if (exportError) {
    throw exportError;
  }

  const managedExports = (exportRows ?? []).filter((row) =>
    Object.values(row.file_urls ?? {}).some(
      (value) => typeof value === "string" && value.includes("/demo-account/"),
    ),
  );

  await removeStoragePaths(
    service,
    managedExports.flatMap((row) =>
      Object.values(row.file_urls ?? {}).filter((value) => typeof value === "string"),
    ),
  );

  if (managedExports.length > 0) {
    const { error } = await service
      .from("export_requests")
      .delete()
      .in("id", managedExports.map((row) => row.id));
    if (error) {
      throw error;
    }
  }

  const { data: sessions, error: sessionError } = await service
    .from("idfw_sessions")
    .select("id, profile_id")
    .in("profile_id", profileIds);
  if (sessionError) {
    throw sessionError;
  }

  if ((sessions ?? []).length > 0) {
    const sessionIds = sessions.map((session) => session.id);
    const { data: reports, error: reportError } = await service
      .from("idfw_reports")
      .select("id, session_id, result_summary")
      .in("session_id", sessionIds);
    if (reportError) {
      throw reportError;
    }

    const managedSessionIds = reports
      .filter((report) => report.result_summary.startsWith("DEMO:"))
      .map((report) => report.session_id);

    if (managedSessionIds.length > 0) {
      const { error } = await service.from("idfw_sessions").delete().in("id", managedSessionIds);
      if (error) {
        throw error;
      }
    }
  }

  for (const profileConfig of DEMO_PROFILES) {
    const liveProfile = state.profilesByName.get(profileConfig.displayName);

    for (const range of profileConfig.profileReferenceRanges) {
      const { error } = await service
        .from("profile_reference_ranges")
        .delete()
        .eq("profile_id", liveProfile.id)
        .eq("biomarker_id", reference.biomarkerIdsByCode.get(range.biomarkerCode))
        .eq("context", range.context)
        .eq("effective_from", range.effectiveFrom);
      if (error) {
        throw error;
      }
    }
  }

  const { error: subscriptionError } = await service
    .from("profile_subscriptions")
    .delete()
    .in("profile_id", profileIds);
  if (subscriptionError) {
    throw subscriptionError;
  }

  const { data: devices, error: deviceLookupError } = await service
    .from("devices")
    .select("id, device_code")
    .in("device_code", managedDeviceCodes());
  if (deviceLookupError) {
    throw deviceLookupError;
  }

  const deviceIds = (devices ?? []).map((device) => device.id);
  if (deviceIds.length > 0) {
    const { error: readingError } = await service
      .from("biomarker_readings")
      .delete()
      .in("device_id", deviceIds);
    if (readingError) {
      throw readingError;
    }
  }

  const { error: deviceDeleteError } = await service
    .from("devices")
    .delete()
    .in("device_code", managedDeviceCodes());
  if (deviceDeleteError) {
    throw deviceDeleteError;
  }

  return state;
}

export function summarizeDemoTargets() {
  return {
    namespace: DEMO_NAMESPACE,
    accountEmail: DEMO_ACCOUNT_EMAIL,
    profiles: DEMO_PROFILES.map((profile) => profile.displayName),
  };
}
