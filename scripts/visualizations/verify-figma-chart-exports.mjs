import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  expectedArtboardCountPerProfile,
  parseVisualizationArgs,
} from "./chart-model.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");

async function main() {
  const { target } = parseVisualizationArgs(process.argv.slice(2));
  const resolvedTarget = target ?? "hosted";
  const outputRoot = path.join(REPO_ROOT, "artifacts", "figma-charts-png", resolvedTarget);
  const manifestPath = path.join(outputRoot, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  assert.equal(manifest.target, resolvedTarget);
  assert.equal(manifest.profiles.length, 2);

  for (const profile of manifest.profiles) {
    assert.equal(
      profile.count,
      expectedArtboardCountPerProfile(),
      `Unexpected artboard count for ${profile.profile}.`,
    );
  }

  for (const artboard of manifest.artboards) {
    const fullPath = path.join(outputRoot, artboard.relative_path);
    await access(fullPath);
    const png = await readFile(fullPath);
    assert.equal(png[0], 0x89, `${artboard.relative_path} is not a PNG.`);
    assert.equal(png[1], 0x50, `${artboard.relative_path} is not a PNG.`);
    assert.equal(png[2], 0x4e, `${artboard.relative_path} is not a PNG.`);
    assert.equal(png[3], 0x47, `${artboard.relative_path} is not a PNG.`);
  }

  console.log(
    `Verified ${manifest.artboards.length} figma-chart artboards in ${outputRoot}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
