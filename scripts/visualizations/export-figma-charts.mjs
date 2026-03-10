import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

import {
  expectedArtboardCountPerProfile,
  loadVisualizationModel,
  parseVisualizationArgs,
} from "./chart-model.mjs";
import {
  renderCorrectionArtboardSvg,
  renderDetailArtboardSvg,
  renderPriorityArtboardSvg,
  renderStatTileArtboardSvg,
  renderSummaryArtboardSvg,
  renderTrendArtboardSvg,
} from "./svg-artboards.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");

function posixRelative(...segments) {
  return path.join(...segments).split(path.sep).join("/");
}

function renderPng(svg) {
  const resvg = new Resvg(svg, {
    background: "rgba(0,0,0,0)",
  });
  return resvg.render().asPng();
}

function flattenArtboards(profile) {
  const entries = [
    ...profile.charts.priority.map((chart) => ({
      kind: "priority",
      width: chart.width,
      height: chart.height,
      path: `${chart.slug}.png`,
      title: chart.title,
      sourceBiomarkers: chart.sourceBiomarkers,
      renderSvg: () => renderPriorityArtboardSvg(chart),
    })),
    ...profile.charts.statTiles.map((chart) => ({
      kind: "stat-tile",
      width: chart.width,
      height: chart.height,
      path: `${chart.slug}.png`,
      title: chart.title,
      sourceBiomarkers: chart.sourceBiomarkers,
      renderSvg: () => renderStatTileArtboardSvg(chart),
    })),
    {
      kind: "summary",
      width: profile.charts.summary.width,
      height: profile.charts.summary.height,
      path: `${profile.charts.summary.slug}.png`,
      title: profile.charts.summary.title,
      sourceBiomarkers: profile.charts.summary.sourceBiomarkers,
      renderSvg: () => renderSummaryArtboardSvg(profile.charts.summary),
    },
    ...profile.charts.trend.map((chart) => ({
      kind: "trend",
      width: chart.width,
      height: chart.height,
      path: `${chart.slug}.png`,
      title: chart.title,
      sourceBiomarkers: chart.sourceBiomarkers,
      renderSvg: () => renderTrendArtboardSvg(chart),
    })),
    ...profile.charts.detail.map((chart) => ({
      kind: "detail",
      width: 345,
      height: 318,
      path: `detail-${chart.slug}.png`,
      title: chart.title,
      sourceBiomarkers: chart.sourceBiomarkers,
      renderSvg: () =>
        renderDetailArtboardSvg({
          ...chart,
          width: 345,
          height: 318,
        }),
    })),
  ];

  if (profile.charts.correction) {
    entries.push({
      kind: "correction",
      width: profile.charts.correction.width,
      height: profile.charts.correction.height,
      path: `${profile.charts.correction.slug}.png`,
      title: profile.charts.correction.title,
      sourceBiomarkers: profile.charts.correction.sourceBiomarkers,
      renderSvg: () => renderCorrectionArtboardSvg(profile.charts.correction),
    });
  }

  return entries;
}

async function listSvgFiles(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSvgFiles(fullPath)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".svg")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function exportCustomPngs() {
  const sourceRoot = path.join(REPO_ROOT, "artifacts", "figma-charts-svg", "custom");
  const outputRoot = path.join(REPO_ROOT, "artifacts", "figma-charts-png", "custom");

  try {
    const svgFiles = await listSvgFiles(sourceRoot);
    for (const svgPath of svgFiles) {
      const relativePath = path.relative(sourceRoot, svgPath);
      const pngPath = path.join(
        outputRoot,
        relativePath.replace(/\.svg$/i, ".png"),
      );
      await mkdir(path.dirname(pngPath), { recursive: true });
      const svg = await readFile(svgPath, "utf8");
      await writeFile(pngPath, renderPng(svg));
    }
    return svgFiles.length;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return 0;
    }
    throw error;
  }
}

async function main() {
  const { target } = parseVisualizationArgs(process.argv.slice(2));
  const resolvedTarget = target ?? "hosted";
  const model = await loadVisualizationModel(resolvedTarget);
  const outputRoot = path.join(REPO_ROOT, "artifacts", "figma-charts-png", resolvedTarget);

  await mkdir(outputRoot, { recursive: true });

  const manifest = {
    generated_at: model.generatedAt,
    target: model.target,
    profiles: [],
    artboards: [],
  };

  for (const profile of model.profiles) {
    const profileOutputDir = path.join(outputRoot, profile.profileName);
    await mkdir(profileOutputDir, { recursive: true });

    const artboards = flattenArtboards(profile);
    assert.equal(
      artboards.length,
      expectedArtboardCountPerProfile(),
      `Unexpected artboard count for ${profile.profileName}.`,
    );

    manifest.profiles.push({
      profile: profile.profileName,
      count: artboards.length,
    });

    for (const artboard of artboards) {
      const relativePath = posixRelative(profile.profileName, artboard.path);
      await writeFile(path.join(profileOutputDir, artboard.path), renderPng(artboard.renderSvg()));

      manifest.artboards.push({
        profile: profile.profileName,
        kind: artboard.kind,
        title: artboard.title,
        width: artboard.width,
        height: artboard.height,
        source_biomarkers: artboard.sourceBiomarkers,
        relative_path: relativePath,
      });
    }
  }

  const customAssetCount = await exportCustomPngs();
  await writeFile(
    path.join(outputRoot, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  console.log(
    `Generated ${manifest.artboards.length} PNG artboards in ${outputRoot} and ${customAssetCount} custom PNG assets`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
