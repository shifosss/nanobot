import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

import { EXPECTED_TIME_FOCUS, FIXTURE_ACCOUNTS, SAMPLE_NAMESPACE } from "./fixtures.mjs";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");

function parseDotEnv(content) {
  const env = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    let [, key, value] = match;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

export async function loadRepoEnv() {
  const files = [".env", ".env.local"];
  const merged = { ...process.env };

  for (const file of files) {
    const fullPath = path.join(REPO_ROOT, file);
    try {
      const content = await readFile(fullPath, "utf8");
      Object.assign(merged, parseDotEnv(content));
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  return merged;
}

function parseKeyValueLines(content) {
  const parsed = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || !line.includes("=") || line.startsWith("Stopped services:")) {
      continue;
    }

    const [key, ...rest] = line.split("=");
    let value = rest.join("=").trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    parsed[key.trim()] = value;
  }
  return parsed;
}

async function resolveLocalConfig() {
  const env = await loadRepoEnv();
  const explicitUrl = firstPresent(env, ["LOCAL_SUPABASE_URL"]);
  const explicitAnonKey = firstPresent(env, ["LOCAL_SUPABASE_ANON_KEY"]);
  const explicitServiceRoleKey = firstPresent(env, ["LOCAL_SUPABASE_SERVICE_ROLE_KEY"]);

  if (explicitUrl && explicitAnonKey && explicitServiceRoleKey) {
    return {
      label: "local",
      url: explicitUrl,
      anonKey: explicitAnonKey,
      serviceRoleKey: explicitServiceRoleKey,
    };
  }

  const { stdout } = await execFileAsync("npx", ["supabase", "status", "-o", "env"], {
    cwd: REPO_ROOT,
    shell: true,
  });
  const values = parseKeyValueLines(stdout);

  return {
    label: "local",
    url: values.API_URL,
    anonKey: values.ANON_KEY,
    serviceRoleKey: values.SERVICE_ROLE_KEY,
  };
}

function firstPresent(env, keys) {
  for (const key of keys) {
    if (env[key]) {
      return env[key];
    }
  }

  return undefined;
}

async function resolveHostedConfig() {
  const env = await loadRepoEnv();

  return {
    label: "hosted",
    url: firstPresent(env, ["Database_Project_URL"]),
    anonKey: firstPresent(env, ["Database_Public_Anon_Key", "Database_Publishable_Key"]),
    serviceRoleKey: firstPresent(env, ["Database_Service_Role_Key", "Database_Secret_API_Key"]),
  };
}

export async function resolveTargetConfig(target) {
  const config = target === "local" ? await resolveLocalConfig() : await resolveHostedConfig();
  assert(config.url, `Missing Supabase URL for ${target}.`);
  assert(config.anonKey, `Missing anon key for ${target}.`);
  assert(config.serviceRoleKey, `Missing service role key for ${target}.`);
  return config;
}

export function createClients(config) {
  const options = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  };

  return {
    service: createClient(config.url, config.serviceRoleKey, options),
    anon: createClient(config.url, config.anonKey, options),
  };
}

export async function signInUser(config, email, password) {
  const client = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return { client, session: data.session, user: data.user };
}

export async function adminListUsers(service) {
  const allUsers = [];
  let page = 1;

  for (;;) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw error;
    }

    allUsers.push(...data.users);
    if (data.users.length < 200) {
      break;
    }
    page += 1;
  }

  return allUsers;
}

async function removeProfileStorageObjects(service, profileIds) {
  for (const profileId of profileIds) {
    const { data: listed, error: listError } = await service.storage
      .from("exports")
      .list(profileId, { limit: 100 });

    if (listError) {
      throw listError;
    }

    for (const entry of listed ?? []) {
      const childPrefix = `${profileId}/${entry.name}`;
      const { data: nested, error: nestedError } = await service.storage
        .from("exports")
        .list(childPrefix, { limit: 100 });

      if (nestedError) {
        throw nestedError;
      }

      const objectPaths = (nested ?? []).map((nestedEntry) => `${childPrefix}/${nestedEntry.name}`);
      if (objectPaths.length > 0) {
        const { error: removeError } = await service.storage.from("exports").remove(objectPaths);
        if (removeError) {
          throw removeError;
        }
      }
    }
  }
}

export async function ensureSampleUsersDeleted(service) {
  const users = await adminListUsers(service);
  const sampleUsers = users.filter((user) =>
    FIXTURE_ACCOUNTS.some((fixture) => fixture.email === user.email),
  );

  if (sampleUsers.length > 0) {
    const userIds = sampleUsers.map((user) => user.id);
    const { data: profiles, error: profileError } = await service
      .from("profiles")
      .select("id")
      .in("account_id", userIds);

    if (profileError) {
      throw profileError;
    }

    await removeProfileStorageObjects(
      service,
      profiles.map((profile) => profile.id),
    );

    for (const user of sampleUsers) {
      const { error } = await service.auth.admin.deleteUser(user.id);
      if (error) {
        throw error;
      }
    }
  }

  const fixtureDeviceCodes = FIXTURE_ACCOUNTS.flatMap((account) =>
    [
      ...account.profiles.flatMap((profile) => profile.devices.map((device) => device.code)),
      ...(account.unboundDevices ?? []).map((device) => device.code),
    ],
  );

  if (fixtureDeviceCodes.length > 0) {
    const { error } = await service.from("devices").delete().in("device_code", fixtureDeviceCodes);
    if (error) {
      throw error;
    }
  }
}

export async function ensureAuthUser(service, fixture) {
  const { data, error } = await service.auth.admin.createUser({
    email: fixture.email,
    password: fixture.password,
    email_confirm: true,
    user_metadata: {
      account_type: fixture.accountType,
      fixture_namespace: SAMPLE_NAMESPACE,
      fixture_key: fixture.key,
    },
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function fetchSingle(query, description) {
  const { data, error } = await query.single();
  if (error) {
    throw new Error(`${description}: ${error.message}`);
  }
  return data;
}

export async function fetchMaybeSingle(query, description) {
  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error(`${description}: ${error.message}`);
  }
  return data;
}

async function fetchList(query, description) {
  const { data, error } = await query;
  if (error) {
    throw new Error(`${description}: ${error.message}`);
  }
  return data;
}

export async function loadReferenceMaps(service) {
  const [plans, biomarkers, deviceTypes, bodyLocations, sensationTypes, suggestedReasons] =
    await Promise.all([
      fetchList(service.from("plans").select("id, name"), "plans"),
      fetchList(service.from("biomarkers").select("id, code"), "biomarkers"),
      fetchList(service.from("device_types").select("id, name"), "device types"),
      fetchList(service.from("body_locations").select("id, name"), "body locations"),
      fetchList(service.from("sensation_types").select("id, name"), "sensation types"),
      fetchList(
        service.from("suggested_reasons").select("id, name, applies_to, body_location_id"),
        "suggested reasons",
      ),
    ]);

  return {
    planIdsByName: new Map(plans.map((plan) => [plan.name, plan.id])),
    biomarkerIdsByCode: new Map(biomarkers.map((row) => [row.code, row.id])),
    deviceTypeIdsByName: new Map(deviceTypes.map((row) => [row.name, row.id])),
    bodyLocationIdsByName: new Map(bodyLocations.map((row) => [row.name, row.id])),
    sensationTypeIdsByName: new Map(sensationTypes.map((row) => [row.name, row.id])),
    suggestedReasons,
  };
}

export function findSuggestedReasonId(reference, name, appliesTo, bodyLocationId = null) {
  const match = reference.suggestedReasons.find(
    (reason) =>
      reason.name === name &&
      reason.applies_to === appliesTo &&
      (reason.body_location_id ?? null) === bodyLocationId,
  );

  assert(match, `Could not find suggested reason "${name}" (${appliesTo}).`);
  return match.id;
}

export function parseArgs(argv) {
  const args = { target: "local" };
  for (const arg of argv) {
    if (arg.startsWith("--target=")) {
      args.target = arg.slice("--target=".length);
    }
  }
  return args;
}

export function assertErrorMessage(error, expectedSubstring, description) {
  assert(error, `${description} should fail.`);
  assert(
    error.message.includes(expectedSubstring),
    `${description} failed with "${error.message}", expected "${expectedSubstring}".`,
  );
}

export function logStep(message) {
  console.log(`\n[${new Date().toISOString()}] ${message}`);
}

export function summarizeFixtureShape() {
  return FIXTURE_ACCOUNTS.map((account) => ({
    email: account.email,
    accountType: account.accountType,
    profiles: account.profiles.map((profile) => profile.displayName).join(", "),
  }));
}

export function expectedTimeFocusCases() {
  return EXPECTED_TIME_FOCUS;
}
