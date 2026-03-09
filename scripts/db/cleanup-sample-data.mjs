import {
  createClients,
  ensureSampleUsersDeleted,
  logStep,
  parseArgs,
  resolveTargetConfig,
} from "./common.mjs";
import { SAMPLE_NAMESPACE } from "./fixtures.mjs";

async function main() {
  const { target } = parseArgs(process.argv.slice(2));
  const config = await resolveTargetConfig(target);
  const { service } = createClients(config);

  logStep(`Cleaning sample data from ${config.label} Supabase (${SAMPLE_NAMESPACE})`);
  await ensureSampleUsersDeleted(service);
  logStep(`Cleanup complete for ${config.label}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
