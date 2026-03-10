# Figma Chart PNG Exports

This repo can export standalone PNG chart artboards directly from the hosted Supabase demo data for:

- `alex`
- `judy`

The export is separate from the frontend runtime. It does not wire the app to Supabase. It reads the hosted demo data with the service-role key at generation time and writes static PNG files for design handoff.

## Command

```bash
npm run viz:figma:cycle:hosted
```

Or run the steps separately:

```bash
npm run viz:figma:export:hosted
npm run viz:figma:verify:hosted
```

## Output Location

Generated files are written under:

```text
artifacts/figma-charts-png/hosted/
```

Each profile gets its own folder:

- `artifacts/figma-charts-png/hosted/alex/`
- `artifacts/figma-charts-png/hosted/judy/`

A machine-readable manifest is also generated:

- `artifacts/figma-charts-png/hosted/manifest.json`

## What Gets Exported

Per profile, the exporter writes PNG artboards for every current placeholder chart family:

- 3 home priority charts
- 8 home stat-tile mini charts
- 1 home summary mini chart
- 2 home trend/highlight comparison charts
- 23 detail biomarker trend charts
- 1 correction prompt chart

Total:

- 38 artboards per profile
- 76 artboards across `alex` and `judy`

## Data Source Rules

- All chart values come from the hosted Supabase demo dataset already loaded for `alex@example.com`.
- The exporter reads `biomarker_readings`, `biomarker_questions`, `biomarker_reference_ranges`, and `profile_reference_ranges`.
- Prompt copy for the correction artboards is derived from the biomarker type because the database stores the triggered reading and user response state, not a display-ready prompt sentence.

## Notes For Figma

- Each PNG file contains one chart artboard only.
- The exported PNG background is transparent so the files can be placed directly into Figma.
- The PNGs export figure content only, without a page background wrapper.
- `manifest.json` includes `profile`, `kind`, `title`, `source_biomarkers`, `width`, `height`, and `relative_path`.
