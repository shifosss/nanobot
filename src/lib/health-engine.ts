/**
 * health-engine.ts
 *
 * Pure functions that transform raw Supabase data into the UI-ready shapes
 * defined in demo-health-ui.ts.  No side effects, no imports of React.
 */

import type {
  HealthStatus,
  DashboardData,
  DashboardStatCard,
  DashboardPriorityStat,
  DashboardTrendChart,
  DashboardSuggestion,
  CategoryData,
  BiomarkerItem,
  CorrectionPromptData,
} from "@/data/demo-health-ui";

import type {
  DashboardSummaryRow,
  SuggestedActionRow,
  BiomarkerQuestionRow,
} from "@/lib/queries";

/* ---- Status computation ---- */

export function computeHealthStatus(
  value: number,
  rangeLow: number | null,
  rangeHigh: number | null,
): HealthStatus {
  if (rangeLow == null && rangeHigh == null) return "normal";

  const low = rangeLow ?? -Infinity;
  const high = rangeHigh ?? Infinity;
  const span = high - low || 1;

  if (value >= low && value <= high) return "normal";

  // How far outside the range (as fraction of range span)
  const overshoot =
    value < low ? (low - value) / span : (value - high) / span;

  return overshoot <= 0.1 ? "concern" : "alert";
}

export function statusLabel(s: HealthStatus): string {
  return s === "normal" ? "Normal" : s === "concern" ? "Concern" : "Alert";
}

export function statusToColor(s: HealthStatus): {
  color: string;
  lightColor: string;
} {
  switch (s) {
    case "alert":
      return { color: "#F27240", lightColor: "#FAC7B3" };
    case "concern":
      return { color: "#FEB300", lightColor: "#FFE199" };
    default:
      return { color: "#3ACFD2", lightColor: "#B0ECED" };
  }
}

/* ---- Trend helpers ---- */

function computeDelta(trend: number[]): { delta: string; trendUp: boolean } {
  if (trend.length < 2) return { delta: "0%", trendUp: false };
  const first = trend[0];
  const last = trend[trend.length - 1];
  if (first === 0) return { delta: "0%", trendUp: false };
  const pct = Math.round(((last - first) / Math.abs(first)) * 100);
  return { delta: `${Math.abs(pct)}%`, trendUp: pct > 0 };
}

export type TimePeriod = "Now" | "D" | "W" | "M" | "6M" | "Y";

/** Slice full 28-day trend to the requested period window. */
export function sliceTrendForPeriod(
  fullTrend: number[],
  fullLabels: string[],
  period: TimePeriod,
): { trend: number[]; labels: string[] } {
  const len = fullTrend.length;
  switch (period) {
    case "Now":
      // Last 1 day
      return {
        trend: fullTrend.slice(-1),
        labels: fullLabels.slice(-1),
      };
    case "D":
      // Last 7 days
      return {
        trend: fullTrend.slice(-7),
        labels: fullLabels.slice(-7),
      };
    case "W": {
      // Group into ~4 weekly buckets from full 28-day data
      if (len <= 7) return { trend: fullTrend, labels: fullLabels };
      const weekSize = Math.ceil(len / 4);
      const weekTrend: number[] = [];
      const weekLabels: string[] = [];
      for (let i = 0; i < len; i += weekSize) {
        const chunk = fullTrend.slice(i, i + weekSize);
        const avg = chunk.reduce((a, b) => a + b, 0) / chunk.length;
        weekTrend.push(Math.round(avg * 100) / 100);
        weekLabels.push(`W${weekLabels.length + 1}`);
      }
      return { trend: weekTrend, labels: weekLabels };
    }
    case "M":
    case "6M":
    case "Y":
    default:
      // Show all available data (up to 28 days)
      return { trend: fullTrend, labels: fullLabels };
  }
}

/** Normalise trend values to bar heights (range 8–28px). */
function trendToBars(trend: number[]): number[] {
  if (trend.length === 0) return [14, 14, 14, 14, 14];
  const vals = trend.length >= 5 ? trend.slice(-5) : trend;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  return vals.map((v) => Math.round(8 + ((v - min) / span) * 20));
}

/* ---- Chart colour palette (cycles for multiple biomarkers) ---- */

const CHART_COLORS = [
  "#ef7d91", "#39a9d4", "#3b82f6", "#0f766e", "#f59e0b",
  "#22c55e", "#9333ea", "#ef4444", "#ec4899", "#8b5cf6",
  "#3AABD2", "#2563eb",
];

/* ---- Category-level helpers ---- */

/** Map category_name → short display name (with line break for pills). */
const CATEGORY_SHORT_NAMES: Record<string, string> = {
  "Heart Health": "Heart\nHealth",
  "Blood Sugar & Energy": "Blood\nSugar",
  "Blood Cells": "Blood\nCells",
  "Stress & Recovery": "Stress &\nRecovery",
  "Immune & Allergy": "Immune &\nAllergy",
  "Nutrient Stores": "Nutrient\nStores",
  "Menstrual Cycle & Fertility": "Menstrual\nCycle",
  "Clotting & Bleeding": "Clotting &\nBleeding",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Heart Health":
    "Heart health markers track oxygen delivery, cardiac stress, and lipid balance.",
  "Blood Sugar & Energy":
    "These markers show how the body handles fuel across fasting and post-meal windows.",
  "Blood Cells":
    "Blood-cell markers show oxygen-carrying capacity and clotting readiness.",
  "Stress & Recovery":
    "Stress markers reveal when recovery rhythm flattens after demanding days.",
  "Immune & Allergy":
    "This group captures low-grade inflammation and immune stress.",
  "Nutrient Stores":
    "Nutrient reserves change slowly, so the story here is trend rather than sudden spikes.",
  "Menstrual Cycle & Fertility":
    "These hormones track the menstrual cycle through expected phases.",
  "Clotting & Bleeding":
    "Clotting markers stay comfortably controlled under normal conditions.",
};

/* ---- Build dashboard data ---- */

function buildBannerStatus(rows: DashboardSummaryRow[]): {
  bannerStatus: string;
  bannerMessage: string[];
} {
  const statuses = rows.map((r) =>
    computeHealthStatus(
      Number(r.latest_value),
      r.personal_range_low ?? r.range_low,
      r.personal_range_high ?? r.range_high,
    ),
  );
  const alertCount = statuses.filter((s) => s === "alert").length;
  const concernCount = statuses.filter((s) => s === "concern").length;

  let bannerStatus: string;
  if (alertCount > 0) bannerStatus = "Needs Attention";
  else if (concernCount > 2) bannerStatus = "Mostly Normal";
  else if (concernCount > 0) bannerStatus = "Mostly Normal";
  else bannerStatus = "All Normal";

  const messages: string[] = [];
  if (alertCount === 0 && concernCount <= 1) {
    messages.push("Your baseline is stable this morning.");
  } else {
    messages.push("Your baseline is stable this morning.");
  }

  // Find the top concern/alert biomarkers for a helpful second line
  const flagged = rows
    .filter((r) => {
      const s = computeHealthStatus(
        Number(r.latest_value),
        r.personal_range_low ?? r.range_low,
        r.personal_range_high ?? r.range_high,
      );
      return s !== "normal";
    })
    .slice(0, 2)
    .map((r) => r.biomarker_name);

  if (flagged.length > 0) {
    messages.push(`Keep an eye on ${flagged.join(" and ")}.`);
  }

  return { bannerStatus, bannerMessage: messages };
}

function buildPriorityStats(rows: DashboardSummaryRow[]): DashboardPriorityStat[] {
  // Pick the top 3 biomarkers by how far they deviate from their range midpoint
  const scored = rows
    .filter((r) => r.range_low != null || r.range_high != null)
    .map((r) => {
      const low = Number(r.personal_range_low ?? r.range_low ?? 0);
      const high = Number(r.personal_range_high ?? r.range_high ?? 100);
      const span = high - low || 1;
      const mid = (low + high) / 2;
      const val = Number(r.latest_value);
      const fillPct = Math.max(0, Math.min(100, ((val - low) / span) * 100));
      const deviation = Math.abs(val - mid) / span;
      return { row: r, fill: Math.round(fillPct), deviation };
    })
    .sort((a, b) => b.deviation - a.deviation);

  return scored.slice(0, 3).map(({ row, fill }) => {
    const { delta, trendUp } = computeDelta(row.trend_7d);
    const desc =
      delta === "0%" ? "Stable" : `${trendUp ? "Rising" : "Falling"} ${delta}`;
    return {
      label: row.biomarker_name,
      fill,
      description: desc,
    };
  });
}

function buildStatCard(
  row: DashboardSummaryRow,
  actions: SuggestedActionRow[],
): DashboardStatCard {
  const val = Number(row.latest_value);
  const low = row.personal_range_low ?? row.range_low;
  const high = row.personal_range_high ?? row.range_high;
  const status = computeHealthStatus(val, low, high);
  const { delta, trendUp } = computeDelta(row.trend_7d);

  // Find a matching suggested action
  const matchingAction = actions.find(
    (a) => a.biomarker_id === row.biomarker_id,
  );
  const suggestion =
    matchingAction?.action_text ?? `${row.biomarker_name} is ${statusLabel(status).toLowerCase()}.`;

  // Format display value
  const displayVal =
    val >= 100
      ? `${Math.round(val)} ${row.unit}`
      : `${Number(val.toFixed(1))} ${row.unit}`;

  return {
    label: row.biomarker_name,
    status,
    statusLabel: statusLabel(status),
    deltaLabel: `${trendUp ? "+" : "-"}${delta}`,
    bars: trendToBars(row.trend_7d),
    value: displayVal,
    suggestion,
  };
}

function buildTrendHighlight(
  rows: DashboardSummaryRow[],
): DashboardData["trendHighlight"] {
  // Pick the category with the most deviation for the trend highlight
  // Group by category, find the one with the most non-normal biomarkers
  const catGroups = new Map<string, DashboardSummaryRow[]>();
  for (const r of rows) {
    const arr = catGroups.get(r.category_name) ?? [];
    arr.push(r);
    catGroups.set(r.category_name, arr);
  }

  let bestCat = rows[0]?.category_name ?? "";
  let bestScore = -1;
  for (const [cat, catRows] of catGroups) {
    const score = catRows.reduce((acc, r) => {
      const s = computeHealthStatus(
        Number(r.latest_value),
        r.personal_range_low ?? r.range_low,
        r.personal_range_high ?? r.range_high,
      );
      return acc + (s === "alert" ? 2 : s === "concern" ? 1 : 0);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }

  const catRows = catGroups.get(bestCat) ?? [];
  const charts: DashboardTrendChart[] = catRows.slice(0, 2).map((r) => {
    const trend = r.trend_7d;
    const mid = Math.floor(trend.length / 2);
    const prevHalf = trend.slice(0, mid);
    const currHalf = trend.slice(mid);

    // Normalise to bar heights (8-28)
    const all = [...prevHalf, ...currHalf];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const span = max - min || 1;
    const norm = (v: number) => Math.round(8 + ((v - min) / span) * 20);

    return {
      title: r.biomarker_name,
      description: `${r.biomarker_name} 7-day trend comparison.`,
      previousBars: prevHalf.map(norm),
      currentBars: currHalf.map(norm),
    };
  });

  const headline =
    catRows.length > 0
      ? `${bestCat} shows the most notable variation in the past week.`
      : "No significant trends to highlight.";

  return { categoryLabel: bestCat, headline, charts };
}

function buildSuggestions(
  rows: DashboardSummaryRow[],
  actions: SuggestedActionRow[],
): DashboardSuggestion[] {
  // Match non-normal biomarkers to suggested actions
  const suggestions: DashboardSuggestion[] = [];
  const emojis = ["🌙", "☀️", "💧", "🏃", "🍎"];

  for (const row of rows) {
    const status = computeHealthStatus(
      Number(row.latest_value),
      row.personal_range_low ?? row.range_low,
      row.personal_range_high ?? row.range_high,
    );
    if (status === "normal") continue;

    const action = actions.find((a) => a.biomarker_id === row.biomarker_id);
    if (action) {
      suggestions.push({
        emoji: emojis[suggestions.length % emojis.length],
        title: `${row.biomarker_name} — ${statusLabel(status)}`,
        body: action.action_text,
        tone: status === "alert" ? "amber" : "teal",
      });
    }
    if (suggestions.length >= 3) break;
  }

  // Ensure at least one suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      emoji: "✅",
      title: "Looking good",
      body: "All biomarkers are within their reference ranges today.",
      tone: "teal",
    });
  }

  return suggestions;
}

/* ---- Main builder: DashboardSummaryRow[] → DashboardData ---- */

export function buildDashboardData(
  rows: DashboardSummaryRow[],
  actions: SuggestedActionRow[],
): DashboardData {
  const { bannerStatus, bannerMessage } = buildBannerStatus(rows);

  const latestDate = rows[0]?.latest_at
    ? new Date(rows[0].latest_at)
    : new Date();
  const syncLabel = `${latestDate.getHours()}:${String(latestDate.getMinutes()).padStart(2, "0")} sync`;
  const compareLabel = `compared to ${latestDate.getMonth() + 1}/${latestDate.getDate() - 1}`;

  const priorityStats = buildPriorityStats(rows);

  // Group by category to build stat cards
  const catOrder = new Map<string, number>();
  for (const r of rows) catOrder.set(r.category_name, r.category_order);
  const catNames = [...catOrder.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([name]) => name);

  const statCards: DashboardStatCard[] = catNames.map((catName) => {
    const catRows = rows.filter((r) => r.category_name === catName);
    // Use the first biomarker's data as the category summary
    const primary = catRows[0];
    const card = buildStatCard(primary, actions);
    // Override label to use category name
    return { ...card, label: catName };
  });

  // Summary feature: top concern category
  const topConcern = rows.find((r) => {
    const s = computeHealthStatus(
      Number(r.latest_value),
      r.personal_range_low ?? r.range_low,
      r.personal_range_high ?? r.range_high,
    );
    return s !== "normal";
  });

  const summaryFeature = {
    title: topConcern?.category_name ?? rows[0]?.category_name ?? "",
    value: topConcern
      ? `${Number(topConcern.latest_value).toFixed(1)} ${topConcern.unit}`
      : "",
    description: topConcern
      ? `${topConcern.biomarker_name} is outside the expected range.`
      : "All markers within range.",
    secondary: rows
      .filter(
        (r) =>
          r.biomarker_code !== topConcern?.biomarker_code &&
          computeHealthStatus(
            Number(r.latest_value),
            r.personal_range_low ?? r.range_low,
            r.personal_range_high ?? r.range_high,
          ) !== "normal",
      )
      .slice(0, 2)
      .map((r) => ({
        title: r.biomarker_name,
        value: `${Number(r.latest_value).toFixed(1)} ${r.unit}`,
        description: `${statusLabel(computeHealthStatus(Number(r.latest_value), r.personal_range_low ?? r.range_low, r.personal_range_high ?? r.range_high))} — ${r.biomarker_name}`,
      })),
  };

  return {
    bannerStatus,
    bannerCompareLabel: compareLabel,
    bannerMessage,
    syncLabel,
    priorityStats,
    statCards,
    summaryFeature,
    trendHighlight: buildTrendHighlight(rows),
    suggestions: buildSuggestions(rows, actions),
  };
}

/* ---- Build category data for the detail page ---- */

export function buildCategoryData(
  rows: DashboardSummaryRow[],
  actions: SuggestedActionRow[],
  questions: BiomarkerQuestionRow[],
): CategoryData[] {
  // Group rows by category
  const grouped = new Map<
    string,
    { order: number; catId: number; rows: DashboardSummaryRow[] }
  >();
  for (const r of rows) {
    const existing = grouped.get(r.category_name);
    if (existing) {
      existing.rows.push(r);
    } else {
      grouped.set(r.category_name, {
        order: r.category_order,
        catId: r.category_id,
        rows: [r],
      });
    }
  }

  const categories: CategoryData[] = [];
  let colorIdx = 0;

  const sortedEntries = [...grouped.entries()].sort(
    (a, b) => a[1].order - b[1].order,
  );

  for (const [catName, { catId, rows: catRows }] of sortedEntries) {
    const biomarkers: BiomarkerItem[] = catRows.map((r) => {
      const trend = r.trend_7d;
      const avg = r.daily_avg ?? Number(r.latest_value);
      const low = Number(r.personal_range_low ?? r.range_low ?? 0);
      const high = Number(r.personal_range_high ?? r.range_high ?? 100);
      const status = computeHealthStatus(Number(r.latest_value), low, high);
      const chartColor = CHART_COLORS[colorIdx % CHART_COLORS.length];
      colorIdx++;

      // Build date range label from trend labels
      const labels = r.trend_labels;
      const dateRange =
        labels.length >= 2
          ? `${labels[0]} - ${labels[labels.length - 1]}`
          : "Last 7 days";

      return {
        id: r.biomarker_code,
        name: r.biomarker_name,
        average: Number(avg.toFixed(1)),
        unit: r.unit,
        rangeLow: low,
        rangeHigh: high,
        dateRange,
        statusTitle: statusLabel(status),
        statusMessage: `${r.biomarker_name} is ${statusLabel(status).toLowerCase()} at ${Number(r.latest_value).toFixed(1)} ${r.unit}.`,
        series: trend.map(Number),
        chartLabels:
          labels.length > 0
            ? labels
            : trend.map((_, i) => `D${i + 1}`),
        chartColor,
      };
    });

    // Category-level summary stat card
    const primary = catRows[0];
    const summaryCard = buildStatCard(primary, actions);
    const overriddenSummary: DashboardStatCard = {
      ...summaryCard,
      label: catName,
    };

    // Check if any biomarker in this category has an alert
    const hasAlert = biomarkers.some((b) => {
      const s = computeHealthStatus(b.average, b.rangeLow, b.rangeHigh);
      return s === "alert" || s === "concern";
    });

    // Check for unanswered questions in this category
    const unansweredQ = questions.find(
      (q) =>
        q.answered_at == null &&
        catRows.some((r) => r.biomarker_id === q.biomarker_id),
    );

    let unusualPrompt: CorrectionPromptData | undefined;
    if (unansweredQ) {
      const matchRow = catRows.find(
        (r) => r.biomarker_id === unansweredQ.biomarker_id,
      );
      if (matchRow) {
        unusualPrompt = {
          biomarkerLabel: matchRow.biomarker_name,
          timestampLabel: new Date(matchRow.latest_at).toLocaleString(),
          question: "Did something unusual happen around that time?",
          series: matchRow.trend_7d.map(Number),
          highlightedIndex: matchRow.trend_7d.length - 1,
          rangeLow: Number(matchRow.range_low ?? 0),
          rangeHigh: Number(matchRow.range_high ?? 100),
          unit: matchRow.unit,
          yesLabel: "Yes, something unusual happened.",
          noLabel: "No, nothing unusual happened.",
          unknownLabel: "I do not remember.",
          answerSummary: "",
          reassuranceTitle: "Thank you.",
          reassuranceBody: "Your feedback helps us calibrate future alerts.",
          completionNote: "We used your answer to keep future alerts more accurate.",
        };
      }
    }

    categories.push({
      id: catId,
      name: CATEGORY_SHORT_NAMES[catName] ?? catName,
      fullName: catName,
      hasAlert,
      hasUnusualAlert: !!unusualPrompt,
      aboutDescription:
        CATEGORY_DESCRIPTIONS[catName] ??
        `Overview of ${catName} biomarkers.`,
      summary: overriddenSummary,
      biomarkers,
      unusualPrompt,
    });
  }

  return categories;
}
