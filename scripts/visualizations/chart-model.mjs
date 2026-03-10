import assert from "node:assert/strict";

import { createClients, parseArgs, resolveTargetConfig } from "../db/common.mjs";
import { DEMO_RANGE_CATALOG } from "../db/demo-account-fixture.mjs";
import { resolveDemoAccountState } from "../db/demo-account-helpers.mjs";

const CATEGORY_DEFS = [
  {
    key: "heart-health",
    shortLabel: "Heart\nHealth",
    tileLabel: "Heart Health",
    fullName: "Heart Health",
    primaryChartId: "spo2",
    chartIds: ["hs_ctni", "spo2", "ldl_cholesterol", "hdl_cholesterol", "triglycerides"],
  },
  {
    key: "blood-sugar-energy",
    shortLabel: "Blood\nSugar",
    tileLabel: "Blood Sugar",
    fullName: "Blood Sugar & Energy",
    primaryChartId: "fasting_glucose",
    chartIds: [
      "fasting_glucose",
      "postprandial_glucose",
      "fasting_insulin",
      "hemoglobin_a1c",
    ],
  },
  {
    key: "blood-cells",
    shortLabel: "Blood\nCells",
    tileLabel: "Blood Cells",
    fullName: "Blood Cells",
    primaryChartId: "hemoglobin",
    chartIds: ["hemoglobin", "platelet_count"],
  },
  {
    key: "stress-recovery",
    shortLabel: "Stress &\nRecovery",
    tileLabel: "Stress Recovery",
    fullName: "Stress & Recovery",
    primaryChartId: "cortisol_pm",
    chartIds: ["cortisol_am", "cortisol_pm", "norepinephrine", "cortisol_delta"],
  },
  {
    key: "immune-allergy",
    shortLabel: "Immune &\nAllergy",
    tileLabel: "Immune Allergy",
    fullName: "Immune & Allergy",
    primaryChartId: "crp",
    chartIds: ["nlr", "crp"],
  },
  {
    key: "nutrient-stores",
    shortLabel: "Nutrient\nStores",
    tileLabel: "Nutrient",
    fullName: "Nutrient Stores",
    primaryChartId: "vitamin_d",
    chartIds: ["vitamin_d", "ferritin"],
  },
  {
    key: "menstrual-cycle",
    shortLabel: "Menstrual\nCycle",
    tileLabel: "Menstrual",
    fullName: "Menstrual Cycle & Fertility",
    primaryChartId: "estradiol",
    chartIds: ["estradiol", "progesterone", "testosterone"],
  },
  {
    key: "clotting-bleeding",
    shortLabel: "Clotting &\nBleeding",
    tileLabel: "Clotting",
    fullName: "Clotting & Bleeding",
    primaryChartId: "d_dimer",
    chartIds: ["d_dimer"],
  },
];

const DETAIL_CHART_DEFS = [
  {
    id: "hs_ctni",
    biomarkerCode: "hs_ctni",
    title: "hs-cTnI",
    categoryKey: "heart-health",
    mode: "period8",
    color: "#ef7d91",
  },
  {
    id: "spo2",
    biomarkerCode: "spo2",
    title: "Blood Oxygen (SpO2)",
    categoryKey: "heart-health",
    mode: "daily7",
    color: "#39a9d4",
  },
  {
    id: "ldl_cholesterol",
    biomarkerCode: "ldl_cholesterol",
    title: "LDL",
    categoryKey: "heart-health",
    mode: "period8",
    color: "#3b82f6",
  },
  {
    id: "hdl_cholesterol",
    biomarkerCode: "hdl_cholesterol",
    title: "HDL",
    categoryKey: "heart-health",
    mode: "period8",
    color: "#0f766e",
  },
  {
    id: "triglycerides",
    biomarkerCode: "triglycerides",
    title: "Triglycerides",
    categoryKey: "heart-health",
    mode: "period8",
    color: "#f59e0b",
  },
  {
    id: "fasting_glucose",
    biomarkerCode: "fasting_glucose",
    title: "Fasting Glucose",
    categoryKey: "blood-sugar-energy",
    mode: "daily7",
    color: "#22c55e",
  },
  {
    id: "postprandial_glucose",
    biomarkerCode: "postprandial_glucose",
    title: "Postprandial Glucose",
    categoryKey: "blood-sugar-energy",
    mode: "daily7",
    color: "#f59e0b",
  },
  {
    id: "fasting_insulin",
    biomarkerCode: "fasting_insulin",
    title: "Fasting Insulin",
    categoryKey: "blood-sugar-energy",
    mode: "daily7",
    color: "#3AABD2",
  },
  {
    id: "hemoglobin_a1c",
    biomarkerCode: "hemoglobin_a1c",
    title: "HbA1c",
    categoryKey: "blood-sugar-energy",
    mode: "period8",
    color: "#2563eb",
  },
  {
    id: "hemoglobin",
    biomarkerCode: "hemoglobin",
    title: "Hemoglobin",
    categoryKey: "blood-cells",
    mode: "daily7",
    color: "#ef4444",
  },
  {
    id: "platelet_count",
    biomarkerCode: "platelet_count",
    title: "Platelet Count",
    categoryKey: "blood-cells",
    mode: "daily7",
    color: "#9333ea",
  },
  {
    id: "cortisol_am",
    biomarkerCode: "cortisol",
    title: "Cortisol (AM)",
    categoryKey: "stress-recovery",
    mode: "daily7",
    context: "AM",
    color: "#22c55e",
  },
  {
    id: "cortisol_pm",
    biomarkerCode: "cortisol",
    title: "Cortisol (PM)",
    categoryKey: "stress-recovery",
    mode: "daily7",
    context: "PM",
    color: "#f59e0b",
  },
  {
    id: "norepinephrine",
    biomarkerCode: "norepinephrine",
    title: "Norepinephrine",
    categoryKey: "stress-recovery",
    mode: "daily7",
    color: "#3AABD2",
  },
  {
    id: "cortisol_delta",
    biomarkerCode: "cortisol_delta",
    title: "Cortisol AM/PM Diff",
    categoryKey: "stress-recovery",
    mode: "daily7",
    color: "#ef7d91",
  },
  {
    id: "nlr",
    biomarkerCode: "nlr",
    title: "NLR",
    categoryKey: "immune-allergy",
    mode: "daily7",
    color: "#3AABD2",
  },
  {
    id: "crp",
    biomarkerCode: "crp",
    title: "CRP",
    categoryKey: "immune-allergy",
    mode: "daily7",
    color: "#f59e0b",
  },
  {
    id: "vitamin_d",
    biomarkerCode: "vitamin_d",
    title: "Vitamin D",
    categoryKey: "nutrient-stores",
    mode: "period8",
    color: "#f59e0b",
  },
  {
    id: "ferritin",
    biomarkerCode: "ferritin",
    title: "Ferritin",
    categoryKey: "nutrient-stores",
    mode: "period8",
    color: "#ef7d91",
  },
  {
    id: "estradiol",
    biomarkerCode: "estradiol",
    title: "Estradiol (E2)",
    categoryKey: "menstrual-cycle",
    mode: "period8",
    color: "#ec4899",
  },
  {
    id: "progesterone",
    biomarkerCode: "progesterone",
    title: "Progesterone (P4)",
    categoryKey: "menstrual-cycle",
    mode: "period8",
    color: "#8b5cf6",
  },
  {
    id: "testosterone",
    biomarkerCode: "testosterone",
    title: "Testosterone",
    categoryKey: "menstrual-cycle",
    mode: "period8",
    color: "#3AABD2",
  },
  {
    id: "d_dimer",
    biomarkerCode: "d_dimer",
    title: "D-dimer",
    categoryKey: "clotting-bleeding",
    mode: "daily7",
    color: "#ef4444",
  },
];

const PRIORITY_CANDIDATE_IDS = [
  "cortisol_pm",
  "postprandial_glucose",
  "vitamin_d",
  "d_dimer",
  "crp",
  "ferritin",
  "cortisol_delta",
  "hs_ctni",
];

const TREND_CANDIDATE_IDS = [
  "cortisol_pm",
  "postprandial_glucose",
  "crp",
  "d_dimer",
  "hs_ctni",
  "cortisol_delta",
  "norepinephrine",
];

const CORRECTION_QUESTION_BY_CHART_ID = {
  cortisol_pm: "Did something stressful happen around that time?",
  postprandial_glucose: "Did you eat anything around that time?",
  d_dimer: "Were you less active or recovering from inflammation around that time?",
  hs_ctni: "Did intense exercise happen around that time?",
};

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function average(values) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function startOfUtcDay(input) {
  const next = new Date(input);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

function formatShortDate(input) {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(input);
}

function formatWeekday(input) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(input);
}

function formatTimestampLabel(input) {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  })
    .format(input)
    .replace(", ", ", ")
    .toLowerCase();
}

function formatDetailDateRange(startInput, endInput) {
  const start = startOfUtcDay(startInput);
  const end = startOfUtcDay(endInput);
  const startLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(start);
  const endLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(end);

  return `${startLabel} - ${endLabel}`;
}

function formatNumber(value, unit) {
  const abs = Math.abs(value);
  let decimals = 1;
  if (abs >= 100 || Number.isInteger(value)) {
    decimals = 0;
  } else if (abs < 1) {
    decimals = 2;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(round(value, decimals));

  return unit ? `${formatted} ${unit}` : formatted;
}

function formatPercentDelta(deltaRatio) {
  return `${deltaRatio >= 0 ? "+" : ""}${Math.round(deltaRatio * 100)}%`;
}

function shortTrendLabel(metric) {
  const deltaRatio = metric.deltaRatio;
  if (metric.severity > 0 && metric.latestValue < metric.rangeLow) {
    return "low";
  }
  if (metric.severity > 0 && metric.latestValue > metric.rangeHigh) {
    return "high";
  }
  if (Math.abs(deltaRatio) < 0.03) {
    return "steady";
  }
  return formatPercentDelta(deltaRatio);
}

function longTrendLabel(metric) {
  const deltaRatio = metric.deltaRatio;
  if (Math.abs(deltaRatio) < 0.03) {
    return "Stable";
  }
  return deltaRatio > 0
    ? `Rising ${Math.round(deltaRatio * 100)}%`
    : `Falling ${Math.round(Math.abs(deltaRatio) * 100)}%`;
}

function computeSeverity(value, range) {
  if (!range) {
    return 0;
  }

  if (
    range.low !== null &&
    range.low !== undefined &&
    range.high !== null &&
    range.high !== undefined
  ) {
    if (value < range.low) {
      return (range.low - value) / Math.max(1e-6, range.high - range.low);
    }
    if (value > range.high) {
      return (value - range.high) / Math.max(1e-6, range.high - range.low);
    }
    return 0;
  }

  if (range.high !== null && range.high !== undefined && value > range.high) {
    return (value - range.high) / Math.max(1e-6, Math.abs(range.high));
  }

  if (range.low !== null && range.low !== undefined && value < range.low) {
    return (range.low - value) / Math.max(1e-6, Math.abs(range.low));
  }

  return 0;
}

function severityStatus(severity) {
  if (severity >= 0.45) {
    return "alert";
  }
  if (severity >= 0.08) {
    return "concern";
  }
  return "normal";
}

function createBins(startDate, endDate, count) {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const duration = endTime - startTime;

  return Array.from({ length: count }, (_, index) => {
    const bucketStart = new Date(startTime + (duration * index) / count);
    const bucketEnd = new Date(startTime + (duration * (index + 1)) / count);
    return {
      index,
      start: bucketStart,
      end: bucketEnd,
      label: formatShortDate(bucketStart),
    };
  });
}

function sampleToFiveBars(values) {
  if (values.length <= 5) {
    return values;
  }

  return Array.from({ length: 5 }, (_, index) => {
    const position = (index * (values.length - 1)) / 4;
    return values[Math.round(position)];
  });
}

function normalizeBars(values, minHeight = 14, maxHeight = 28) {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (maximum - minimum < 1e-6) {
    return values.map(() => Math.round((minHeight + maxHeight) / 2));
  }

  return values.map((value) =>
    Math.round(minHeight + ((value - minimum) / (maximum - minimum)) * (maxHeight - minHeight)),
  );
}

function gaugeFillPercent(value, range) {
  if (!range) {
    return 50;
  }

  const low =
    range.low !== null && range.low !== undefined
      ? range.low
      : (range.high ?? value) - Math.abs(range.high ?? value) * 0.4;
  const high =
    range.high !== null && range.high !== undefined
      ? range.high
      : (range.low ?? value) + Math.abs(range.low ?? value) * 0.4;

  const padding = Math.max((high - low) * 0.6, Math.abs(high) * 0.1, 1);
  const scaleMin = low - padding;
  const scaleMax = high + padding;
  const percent = ((value - scaleMin) / Math.max(1e-6, scaleMax - scaleMin)) * 100;
  return Math.min(95, Math.max(5, round(percent, 1)));
}

function metricScore(metric) {
  return metric.severity * 2 + Math.abs(metric.deltaRatio);
}

function comparisonScore(comparison) {
  return comparison.severity * 1.6 + Math.abs(comparison.deltaRatio) + comparison.weekChangeRatio;
}

function buildReadingBucketMap(readings, biomarkerIdToCode) {
  const buckets = new Map();
  const combinedBuckets = new Map();
  const readingsById = new Map();

  for (const row of readings) {
    const biomarkerCode = biomarkerIdToCode.get(String(row.biomarker_id));
    const normalized = {
      id: Number(row.id),
      profileId: row.profile_id,
      biomarkerCode,
      context: row.context,
      value: Number(row.value),
      recordedAt: new Date(row.recorded_at),
    };

    readingsById.set(String(normalized.id), normalized);
    const key = `${normalized.profileId}:${normalized.biomarkerCode}:${normalized.context}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(normalized);
    buckets.set(key, bucket);

    const combinedKey = `${normalized.profileId}:${normalized.biomarkerCode}`;
    const combinedBucket = combinedBuckets.get(combinedKey) ?? [];
    combinedBucket.push(normalized);
    combinedBuckets.set(combinedKey, combinedBucket);
  }

  for (const bucket of buckets.values()) {
    bucket.sort((left, right) => left.recordedAt - right.recordedAt);
  }
  for (const bucket of combinedBuckets.values()) {
    bucket.sort((left, right) => left.recordedAt - right.recordedAt);
  }

  return { buckets, combinedBuckets, readingsById };
}

function getBucket(readingBuckets, profileId, biomarkerCode, context = "default") {
  return readingBuckets.get(`${profileId}:${biomarkerCode}:${context}`) ?? [];
}

function getCombinedBucket(combinedBuckets, profileId, biomarkerCode) {
  return combinedBuckets.get(`${profileId}:${biomarkerCode}`) ?? [];
}

function resolveRange(profile, biomarkerId, context, shared) {
  const profileKey = `${profile.id}:${biomarkerId}:${context}`;
  const defaultProfileKey = `${profile.id}:${biomarkerId}:default`;
  if (shared.profileRanges.has(profileKey)) {
    return shared.profileRanges.get(profileKey);
  }
  if (shared.profileRanges.has(defaultProfileKey)) {
    return shared.profileRanges.get(defaultProfileKey);
  }

  const sexOrder = [profile.biological_sex, "all"];
  const contextOrder = [context, "default"];

  for (const sex of sexOrder) {
    for (const nextContext of contextOrder) {
      const key = `${biomarkerId}:${sex}:${nextContext}`;
      if (shared.referenceRanges.has(key)) {
        return shared.referenceRanges.get(key);
      }
    }
  }

  const biomarkerCode = shared.biomarkerIdToCode.get(String(biomarkerId));
  const catalogRange = biomarkerCode ? DEMO_RANGE_CATALOG[biomarkerCode] : null;
  if (catalogRange) {
    if (catalogRange.contexts) {
      const matchedContext = contextOrder.find((nextContext) => catalogRange.contexts[nextContext]);
      if (matchedContext) {
        return catalogRange.contexts[matchedContext];
      }
    }

    if ("low" in catalogRange || "high" in catalogRange) {
      return {
        low: catalogRange.low ?? null,
        high: catalogRange.high ?? null,
      };
    }
  }

  return { low: null, high: null };
}

function aggregateDaily7(readings) {
  const endDay = startOfUtcDay(readings[readings.length - 1].recordedAt);
  const bins = Array.from({ length: 7 }, (_, index) => {
    const start = new Date(endDay);
    start.setUTCDate(endDay.getUTCDate() - (6 - index));
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 1);
    return {
      label: formatWeekday(start),
      start,
      end,
    };
  });

  return bins.map((bin) => {
    const values = readings
      .filter((reading) => reading.recordedAt >= bin.start && reading.recordedAt < bin.end)
      .map((reading) => reading.value);
    return {
      label: bin.label,
      value: round(average(values), 2),
    };
  });
}

function aggregatePeriod8(readings) {
  const start = readings[0].recordedAt;
  const end = new Date(readings[readings.length - 1].recordedAt.getTime() + 30 * 60 * 1000);
  const bins = createBins(start, end, 8);

  return bins.map((bin) => {
    const values = readings
      .filter((reading) => reading.recordedAt >= bin.start && reading.recordedAt < bin.end)
      .map((reading) => reading.value);
    return {
      label: bin.label,
      value: round(average(values), 2),
    };
  });
}

function aggregateDetailSeries(readings, mode) {
  assert(readings.length > 0, "Cannot aggregate an empty reading bucket.");
  return mode === "daily7" ? aggregateDaily7(readings) : aggregatePeriod8(readings);
}

function buildDailyComparison(readings) {
  const endDay = startOfUtcDay(readings[readings.length - 1].recordedAt);
  const bins = Array.from({ length: 14 }, (_, index) => {
    const start = new Date(endDay);
    start.setUTCDate(endDay.getUTCDate() - (13 - index));
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 1);
    const values = readings
      .filter((reading) => reading.recordedAt >= start && reading.recordedAt < end)
      .map((reading) => reading.value);
    return round(average(values), 2);
  });

  const previous = bins.slice(0, 7);
  const current = bins.slice(7, 14);
  const previousAverage = average(previous);
  const currentAverage = average(current);
  const weekChangeRatio =
    Math.abs(currentAverage - previousAverage) / Math.max(1e-6, Math.abs(previousAverage) || 1);

  return {
    previous,
    current,
    previousBars: normalizeBars(previous, 14, 24),
    currentBars: normalizeBars(current, 14, 24),
    weekChangeRatio,
  };
}

function findBiomarkerRow(shared, biomarkerCode) {
  const row = shared.biomarkersByCode.get(biomarkerCode);
  assert(row, `Missing biomarker row for ${biomarkerCode}.`);
  return row;
}

function buildDetailChart(profile, definition, shared) {
  const biomarkerRow = findBiomarkerRow(shared, definition.biomarkerCode);
  const readings = definition.context
    ? getBucket(shared.readingBuckets, profile.id, definition.biomarkerCode, definition.context)
    : getCombinedBucket(shared.combinedBuckets, profile.id, definition.biomarkerCode);

  assert(
    readings.length > 0,
    `No readings found for ${profile.display_name} ${definition.id}.`,
  );

  const aggregated = aggregateDetailSeries(readings, definition.mode);
  const latestValue = aggregated[aggregated.length - 1].value;
  const previousValue = aggregated[aggregated.length - 2]?.value ?? latestValue;
  const averageValue = average(readings.map((reading) => reading.value));
  const latestContext = readings[readings.length - 1].context;
  const range = resolveRange(profile, biomarkerRow.id, definition.context ?? latestContext, shared);
  const severity = computeSeverity(latestValue, range);

  return {
    id: definition.id,
    profileName: profile.display_name,
    categoryKey: definition.categoryKey,
    title: definition.title,
    biomarkerCode: definition.biomarkerCode,
    context: definition.context ?? "default",
    unit: biomarkerRow.unit,
    color: definition.color,
    series: aggregated.map((item) => item.value),
    labels: aggregated.map((item) => item.label),
    averageValue: round(averageValue, 2),
    averageValueLabel: formatNumber(averageValue),
    latestValue: round(latestValue, 2),
    previousValue: round(previousValue, 2),
    deltaRatio: (latestValue - previousValue) / Math.max(1e-6, Math.abs(previousValue) || 1),
    rangeLow: range.low,
    rangeHigh: range.high,
    rangeLowLabel:
      range.low !== null && range.low !== undefined ? formatNumber(range.low) : "-",
    rangeHighLabel:
      range.high !== null && range.high !== undefined ? formatNumber(range.high) : "-",
    dateRangeLabel: formatDetailDateRange(
      readings[0].recordedAt,
      readings[readings.length - 1].recordedAt,
    ),
    severity,
    status: severityStatus(severity),
    slug: slugify(definition.title),
    sourceBiomarkers: [`${definition.biomarkerCode}:${definition.context ?? "default"}`],
  };
}

function buildCategoryCards(profile, detailChartsById) {
  return CATEGORY_DEFS.map((category) => {
    const memberCharts = category.chartIds.map((chartId) => detailChartsById.get(chartId));
    const primaryChart = detailChartsById.get(category.primaryChartId);
    const severity = Math.max(...memberCharts.map((chart) => chart.severity));
    const status = severityStatus(severity);
    const bars = normalizeBars(sampleToFiveBars(primaryChart.series), 14, 26);
    const percent = Math.max(1, Math.round(Math.abs(primaryChart.deltaRatio) * 100));

    return {
      id: category.key,
      profileName: profile.display_name,
      title: category.fullName,
      shortLabel: category.shortLabel,
      tileLabel: category.tileLabel,
      status,
      statusLabel: status === "normal" ? "Normal" : status === "concern" ? "Concern" : "Alert",
      deltaLabel: `${percent}%`,
      trendUp: primaryChart.deltaRatio > 0,
      bars,
      width: 105,
      height: 105,
      slug: `home-stat-${slugify(category.fullName)}`,
      sourceBiomarkers: memberCharts.flatMap((chart) => chart.sourceBiomarkers),
    };
  });
}

function buildPriorityCharts(profile, detailChartsById) {
  return PRIORITY_CANDIDATE_IDS.map((chartId) => detailChartsById.get(chartId))
    .sort((left, right) => metricScore(right) - metricScore(left))
    .slice(0, 3)
    .map((chart, index) => ({
      id: `${chart.id}-${index}`,
      profileName: profile.display_name,
      title: chart.title,
      description: longTrendLabel(chart),
      fillPercent: gaugeFillPercent(chart.latestValue, {
        low: chart.rangeLow,
        high: chart.rangeHigh,
      }),
      width: 345,
      height: 92,
      slug: `home-priority-${chart.slug}`,
      sourceBiomarkers: chart.sourceBiomarkers,
    }));
}

function buildSummaryChart(profile, detailChartsById) {
  const focus = PRIORITY_CANDIDATE_IDS.map((chartId) => detailChartsById.get(chartId))
    .sort((left, right) => metricScore(right) - metricScore(left))[0];

  return {
    id: focus.id,
    profileName: profile.display_name,
    title: focus.title,
    valueLabel: formatNumber(focus.latestValue, focus.unit),
    bars: normalizeBars(sampleToFiveBars(focus.series), 14, 26),
    width: 113,
    height: 105,
    slug: "home-summary-focus",
    sourceBiomarkers: focus.sourceBiomarkers,
  };
}

function buildTrendCharts(profile, detailChartsById, shared) {
  return TREND_CANDIDATE_IDS.map((chartId) => {
    const metric = detailChartsById.get(chartId);
    const readings = getBucket(
      shared.readingBuckets,
      profile.id,
      metric.biomarkerCode,
      metric.context ?? "default",
    );
    const comparison = buildDailyComparison(readings);
    return {
      id: metric.id,
      profileName: profile.display_name,
      title: metric.title,
      description: `${longTrendLabel(metric)} versus the prior week.`,
      previousBars: comparison.previousBars,
      currentBars: comparison.currentBars,
      weekChangeRatio: comparison.weekChangeRatio,
      severity: metric.severity,
      deltaRatio: metric.deltaRatio,
      width: 345,
      height: 188,
      slug: `home-trend-${metric.slug}`,
      sourceBiomarkers: metric.sourceBiomarkers,
    };
  })
    .sort((left, right) => comparisonScore(right) - comparisonScore(left))
    .slice(0, 2);
}

function buildCorrectionChart(profile, detailChartsById, shared) {
  const questions = shared.questionsByProfile.get(profile.id) ?? [];
  if (questions.length === 0) {
    return null;
  }

  const question = questions[0];
  const reading = shared.readingsById.get(String(question.reading_id));
  assert(reading, `Missing reading ${question.reading_id} for correction chart.`);

  const matchingMetric = DETAIL_CHART_DEFS.find(
    (definition) =>
      definition.biomarkerCode === reading.biomarkerCode &&
      (definition.context ?? "default") === reading.context,
  );
  const chart = detailChartsById.get(matchingMetric?.id ?? reading.biomarkerCode);
  const bucket = getBucket(
    shared.readingBuckets,
    profile.id,
    reading.biomarkerCode,
    reading.context,
  );
  const targetIndex = bucket.findIndex((item) => item.id === reading.id);
  const start = Math.max(0, targetIndex - 4);
  const end = Math.min(bucket.length, targetIndex + 5);
  const window = bucket.slice(start, end);
  const highlightedIndex = targetIndex - start;

  return {
    id: matchingMetric?.id ?? reading.biomarkerCode,
    profileName: profile.display_name,
    title: chart.title,
    question:
      CORRECTION_QUESTION_BY_CHART_ID[matchingMetric?.id ?? reading.biomarkerCode] ??
      "Was this part of a normal activity around that time?",
    timestampLabel: formatTimestampLabel(reading.recordedAt),
    series: window.map((item) => item.value),
    highlightedIndex,
    rangeLow: chart.rangeLow,
    rangeHigh: chart.rangeHigh,
    width: 361,
    height: 320,
    slug: "correction-latest-question",
    sourceBiomarkers: chart.sourceBiomarkers,
  };
}

async function fetchAllReadings(service, profileIds) {
  const rows = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await service
      .from("biomarker_readings")
      .select("id, profile_id, biomarker_id, value, context, recorded_at")
      .in("profile_id", profileIds)
      .order("recorded_at", { ascending: true })
      .range(from, to);

    if (error) {
      throw error;
    }

    rows.push(...(data ?? []));
    if ((data ?? []).length < pageSize) {
      break;
    }
  }

  return rows;
}

async function loadSharedState(service, profiles) {
  const profileIds = profiles.map((profile) => profile.id);

  const [biomarkersResult, referenceRangesResult, profileRangesResult, questionsResult, readings] =
    await Promise.all([
      service.from("biomarkers").select("id, code, display_name, unit"),
      service
        .from("biomarker_reference_ranges")
        .select("biomarker_id, sex, context, range_low, range_high"),
      service
        .from("profile_reference_ranges")
        .select("profile_id, biomarker_id, context, range_low, range_high, effective_from")
        .in("profile_id", profileIds)
        .order("effective_from", { ascending: false }),
      service
        .from("biomarker_questions")
        .select("id, profile_id, biomarker_id, reading_id, is_normal_activity, user_note, created_at")
        .in("profile_id", profileIds)
        .order("created_at", { ascending: false }),
      fetchAllReadings(service, profileIds),
    ]);

  if (biomarkersResult.error) {
    throw biomarkersResult.error;
  }
  if (referenceRangesResult.error) {
    throw referenceRangesResult.error;
  }
  if (profileRangesResult.error) {
    throw profileRangesResult.error;
  }
  if (questionsResult.error) {
    throw questionsResult.error;
  }

  const biomarkersByCode = new Map(
    (biomarkersResult.data ?? []).map((row) => [row.code, row]),
  );
  const biomarkerIdToCode = new Map(
    (biomarkersResult.data ?? []).map((row) => [String(row.id), row.code]),
  );

  const referenceRanges = new Map();
  for (const row of referenceRangesResult.data ?? []) {
    referenceRanges.set(`${row.biomarker_id}:${row.sex}:${row.context}`, {
      low: row.range_low === null ? null : Number(row.range_low),
      high: row.range_high === null ? null : Number(row.range_high),
    });
  }

  const profileRanges = new Map();
  for (const row of profileRangesResult.data ?? []) {
    const key = `${row.profile_id}:${row.biomarker_id}:${row.context}`;
    if (!profileRanges.has(key)) {
      profileRanges.set(key, {
        low: row.range_low === null ? null : Number(row.range_low),
        high: row.range_high === null ? null : Number(row.range_high),
      });
    }
  }

  const questionsByProfile = new Map();
  for (const row of questionsResult.data ?? []) {
    const bucket = questionsByProfile.get(row.profile_id) ?? [];
    bucket.push(row);
    questionsByProfile.set(row.profile_id, bucket);
  }

  const { buckets: readingBuckets, combinedBuckets, readingsById } = buildReadingBucketMap(
    readings,
    biomarkerIdToCode,
  );

  return {
    biomarkersByCode,
    biomarkerIdToCode,
    referenceRanges,
    profileRanges,
    readingBuckets,
    combinedBuckets,
    readingsById,
    questionsByProfile,
  };
}

export async function loadVisualizationModel(target = "hosted") {
  const config = await resolveTargetConfig(target);
  const { service } = createClients(config);
  const state = await resolveDemoAccountState(service);
  const shared = await loadSharedState(service, state.profiles);

  const profiles = state.profiles.map((profile) => {
    const detailCharts = DETAIL_CHART_DEFS.map((definition) =>
      buildDetailChart(profile, definition, shared),
    );
    const detailChartsById = new Map(detailCharts.map((chart) => [chart.id, chart]));

    return {
      id: profile.id,
      profileName: profile.display_name,
      charts: {
        priority: buildPriorityCharts(profile, detailChartsById),
        statTiles: buildCategoryCards(profile, detailChartsById),
        summary: buildSummaryChart(profile, detailChartsById),
        trend: buildTrendCharts(profile, detailChartsById, shared),
        detail: detailCharts,
        correction: buildCorrectionChart(profile, detailChartsById, shared),
      },
    };
  });

  return {
    target,
    generatedAt: new Date().toISOString(),
    profiles,
  };
}

export function expectedArtboardCountPerProfile() {
  return 3 + CATEGORY_DEFS.length + 1 + 2 + DETAIL_CHART_DEFS.length + 1;
}

export function parseVisualizationArgs(argv) {
  return parseArgs(argv);
}
