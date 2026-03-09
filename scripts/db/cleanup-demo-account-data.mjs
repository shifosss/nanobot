import { createClients, loadReferenceMaps, logStep, parseArgs, resolveTargetConfig } from "./common.mjs";
import { cleanupDemoAccountData, summarizeDemoTargets } from "./demo-account-helpers.mjs";

async function main() {
  const { target } = parseArgs(process.argv.slice(2));
  const config = await resolveTargetConfig(target);
  const { service } = createClients(config);
  const reference = await loadReferenceMaps(service);

  logStep(`Cleaning managed demo data from ${config.label} Supabase`);
  console.table([summarizeDemoTargets()]);
  await cleanupDemoAccountData(service, reference);
  logStep(`Managed demo cleanup complete for ${config.label}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
