export type HealthStatus = "normal" | "concern" | "alert";

export interface DashboardPriorityStat {
  label: string;
  fill: number;
  description: string;
}

export interface DashboardStatCard {
  label: string;
  status: HealthStatus;
  statusLabel: string;
  deltaLabel: string;
  bars: number[];
  value: string;
  suggestion: string;
}

export interface DashboardTrendChart {
  title: string;
  description: string;
  currentBars: number[];
  previousBars: number[];
  footerLabel?: string;
}

export interface DashboardSuggestion {
  emoji: string;
  title: string;
  body: string;
  tone: "teal" | "amber";
}

export interface CorrectionPromptData {
  biomarkerLabel: string;
  timestampLabel: string;
  question: string;
  series: number[];
  highlightedIndex: number;
  rangeLow: number;
  rangeHigh: number;
  unit: string;
  yesLabel: string;
  noLabel: string;
  unknownLabel: string;
  answerSummary: string;
  reassuranceTitle: string;
  reassuranceBody: string;
  completionNote: string;
}

export interface BiomarkerItem {
  id: string;
  name: string;
  average: number;
  unit: string;
  rangeLow: number;
  rangeHigh: number;
  dateRange: string;
  statusTitle: string;
  statusMessage: string;
  series: number[];
  chartLabels: string[];
  chartColor: string;
}

export interface CategoryData {
  id: number;
  name: string;
  fullName: string;
  hasAlert: boolean;
  hasUnusualAlert: boolean;
  aboutDescription: string;
  summary: DashboardStatCard;
  biomarkers: BiomarkerItem[];
  unusualPrompt?: CorrectionPromptData;
}

export interface DashboardData {
  bannerStatus: string;
  bannerCompareLabel: string;
  bannerMessage: string[];
  syncLabel: string;
  priorityStats: DashboardPriorityStat[];
  statCards: DashboardStatCard[];
  summaryFeature: {
    title: string;
    value: string;
    description: string;
    secondary: {
      title: string;
      value: string;
      description: string;
    }[];
  };
  trendHighlight: {
    categoryLabel: string;
    headline: string;
    charts: DashboardTrendChart[];
  };
  suggestions: DashboardSuggestion[];
}

export interface DemoProfileUiData {
  profileKey: "alex";
  profileName: string;
  dashboard: DashboardData;
  categories: CategoryData[];
}

const DATE_RANGE = "Feb 10 - Mar 9, 2026";
const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LONG_LABELS = ["W1", "W1", "W1", "W1", "W2", "W2", "W2", "W2"];

const categories: CategoryData[] = [
  {
    id: 1,
    name: "Heart\nHealth",
    fullName: "Heart Health",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "Heart health markers track oxygen delivery, cardiac stress, and lipid balance. Alex's demo profile is mostly stable, with only a brief exercise-linked hs-cTnI bump.",
    summary: {
      label: "Heart Health",
      status: "normal",
      statusLabel: "Normal",
      deltaLabel: "steady",
      bars: [16, 17, 16, 18, 17],
      value: "97.6% O2",
      suggestion: "Cardio markers stayed stable across the last week.",
    },
    biomarkers: [
      {
        id: "hs_ctni",
        name: "hs-cTnI",
        average: 7.1,
        unit: "ng/L",
        rangeLow: 0,
        rangeHigh: 14,
        dateRange: DATE_RANGE,
        statusTitle: "Watch after exertion",
        statusMessage:
          "A short post-workout rise resolved quickly.\nNo sustained cardiac stress pattern was detected.",
        series: [6.1, 6.3, 6.6, 7.2, 8.9, 12.8, 9.4, 7.1],
        chartLabels: LONG_LABELS,
        chartColor: "#ef7d91",
      },
      {
        id: "spo2",
        name: "Blood Oxygen (SpO2)",
        average: 97.6,
        unit: "%",
        rangeLow: 95,
        rangeHigh: 100,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "Daily oxygen delivery stayed in a healthy range.\nOnly one brief overnight dip needs casual monitoring.",
        series: [98.2, 98.1, 97.9, 97.4, 96.9, 97.5, 98.1],
        chartLabels: WEEK_LABELS,
        chartColor: "#39a9d4",
      },
      {
        id: "ldl_cholesterol",
        name: "LDL",
        average: 106,
        unit: "mg/dL",
        rangeLow: 60,
        rangeHigh: 129,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "LDL stayed inside the demo target band.\nNo upward drift across the month.",
        series: [108, 107, 106, 105, 105, 106, 107, 106],
        chartLabels: LONG_LABELS,
        chartColor: "#3b82f6",
      },
      {
        id: "hdl_cholesterol",
        name: "HDL",
        average: 62,
        unit: "mg/dL",
        rangeLow: 50,
        rangeHigh: 90,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "Protective HDL stayed comfortably in range.\nThe trend is stable week over week.",
        series: [63, 62, 63, 64, 62, 61, 62, 62],
        chartLabels: LONG_LABELS,
        chartColor: "#0f766e",
      },
      {
        id: "triglycerides",
        name: "Triglycerides",
        average: 104,
        unit: "mg/dL",
        rangeLow: 40,
        rangeHigh: 150,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "Triglycerides stayed well below the risk threshold.\nSmall meal-linked swings are expected.",
        series: [108, 112, 105, 101, 98, 104, 109, 104],
        chartLabels: LONG_LABELS,
        chartColor: "#f59e0b",
      },
    ],
  },
  {
    id: 2,
    name: "Blood\nSugar",
    fullName: "Blood Sugar & Energy",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "These markers show how Alex handles fuel across fasting and post-meal windows. The profile is mostly healthy, with only a few dinner-related spikes.",
    summary: {
      label: "Blood Sugar & Energy",
      status: "normal",
      statusLabel: "Normal",
      deltaLabel: "dinner +4%",
      bars: [16, 18, 21, 19, 17],
      value: "91.8 mg/dL",
      suggestion: "Breakfast timing looks steady; dinner spikes resolve by night.",
    },
    biomarkers: [
      {
        id: "fasting_glucose",
        name: "Fasting Glucose",
        average: 91.8,
        unit: "mg/dL",
        rangeLow: 70,
        rangeHigh: 99,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "Morning glucose remains inside the healthy fasting band.\nOnly a slight dawn rise appears on higher-stress days.",
        series: [90, 91, 92, 92, 94, 93, 91],
        chartLabels: WEEK_LABELS,
        chartColor: "#22c55e",
      },
      {
        id: "postprandial_glucose",
        name: "Postprandial Glucose",
        average: 118.4,
        unit: "mg/dL",
        rangeLow: 70,
        rangeHigh: 140,
        dateRange: DATE_RANGE,
        statusTitle: "Small evening spikes",
        statusMessage:
          "Post-meal glucose is still within range.\nA few heavier dinners pushed the evening curve higher than baseline.",
        series: [114, 118, 121, 126, 138, 124, 119],
        chartLabels: WEEK_LABELS,
        chartColor: "#f59e0b",
      },
      {
        id: "fasting_insulin",
        name: "Fasting Insulin",
        average: 8.9,
        unit: "uIU/mL",
        rangeLow: 2,
        rangeHigh: 25,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "Insulin demand stays light in the morning window.\nNo insulin-resistance pattern appears in this profile.",
        series: [8.4, 8.6, 8.8, 8.7, 9.1, 9, 8.8],
        chartLabels: WEEK_LABELS,
        chartColor: "#3AABD2",
      },
      {
        id: "hemoglobin_a1c",
        name: "HbA1c",
        average: 5.4,
        unit: "%",
        rangeLow: 4,
        rangeHigh: 5.6,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "The four-week average remains comfortably below the prediabetes threshold.\nLonger-term control still looks healthy.",
        series: [5.38, 5.4, 5.41, 5.42, 5.43, 5.41, 5.4, 5.4],
        chartLabels: LONG_LABELS,
        chartColor: "#2563eb",
      },
    ],
  },
  {
    id: 3,
    name: "Blood\nCells",
    fullName: "Blood Cells",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "Blood-cell markers show oxygen-carrying capacity and clotting readiness. Hemoglobin stays steady and platelets remain in a calm range.",
    summary: {
      label: "Blood Cells",
      status: "normal",
      statusLabel: "Normal",
      deltaLabel: "stable",
      bars: [18, 19, 18, 18, 19],
      value: "12.5 g/dL",
      suggestion: "Red-cell support looks steady despite low-normal ferritin.",
    },
    biomarkers: [
      {
        id: "hemoglobin",
        name: "Hemoglobin",
        average: 12.5,
        unit: "g/dL",
        rangeLow: 11.6,
        rangeHigh: 15,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "Hemoglobin stays in range across the cycle.\nOnly a small early-cycle dip appears, which is expected.",
        series: [12.7, 12.6, 12.5, 12.4, 12.3, 12.5, 12.6],
        chartLabels: WEEK_LABELS,
        chartColor: "#ef4444",
      },
      {
        id: "platelet_count",
        name: "Platelet Count",
        average: 249,
        unit: "10^3/uL",
        rangeLow: 150,
        rangeHigh: 400,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "Platelets remained well inside the healthy clotting window.\nNo sustained thrombosis or bleeding signal appears.",
        series: [244, 247, 248, 252, 254, 251, 247],
        chartLabels: WEEK_LABELS,
        chartColor: "#9333ea",
      },
    ],
  },
  {
    id: 4,
    name: "Stress &\nRecovery",
    fullName: "Stress & Recovery",
    hasAlert: true,
    hasUnusualAlert: true,
    aboutDescription:
      "Stress markers reveal when recovery rhythm flattens after demanding days. The profile is still safe overall, but late-evening cortisol deserves attention.",
    summary: {
      label: "Stress & Recovery",
      status: "concern",
      statusLabel: "Concern",
      deltaLabel: "PM cortisol +12%",
      bars: [14, 17, 16, 21, 24],
      value: "6.2 ug/dL",
      suggestion: "Late meetings are the main reason the evening curve stays elevated.",
    },
    unusualPrompt: {
      biomarkerLabel: "Cortisol (PM)",
      timestampLabel: "02/28, 8:00 pm",
      question: "Did something stressful happen around that time?",
      series: [5.4, 5.7, 6.1, 6.8, 7.6, 8.9, 8.2, 7.1, 6.3],
      highlightedIndex: 5,
      rangeLow: 3,
      rangeHigh: 10,
      unit: "ug/dL",
      yesLabel: "Yes, it was a stressful evening.",
      noLabel: "No, nothing unusual happened.",
      unknownLabel: "I do not remember.",
      answerSummary: "Yes, it was a stressful evening.",
      reassuranceTitle: "That makes sense.",
      reassuranceBody:
        "Your response explains the temporary cortisol rise. The rest of the evening curve returned toward your normal range.",
      completionNote: "We used your answer to keep future evening alerts more accurate.",
    },
    biomarkers: [
      {
        id: "cortisol_am",
        name: "Cortisol (AM)",
        average: 17.4,
        unit: "ug/dL",
        rangeLow: 5,
        rangeHigh: 25,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "Morning cortisol still peaks where it should.\nWake-up readiness remains strong.",
        series: [16.1, 16.8, 17.2, 17.4, 18.1, 17.8, 17.3],
        chartLabels: WEEK_LABELS,
        chartColor: "#22c55e",
      },
      {
        id: "cortisol_pm",
        name: "Cortisol (PM)",
        average: 6.2,
        unit: "ug/dL",
        rangeLow: 3,
        rangeHigh: 10,
        dateRange: DATE_RANGE,
        statusTitle: "Late-day stress pattern",
        statusMessage:
          "Evening cortisol stayed high on a few work-heavy nights.\nThe signal is mild but consistent enough to keep watching.",
        series: [5.1, 5.5, 5.9, 6.4, 8.1, 7.3, 6],
        chartLabels: WEEK_LABELS,
        chartColor: "#f59e0b",
      },
      {
        id: "norepinephrine",
        name: "Norepinephrine",
        average: 338,
        unit: "pg/mL",
        rangeLow: 70,
        rangeHigh: 750,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "Morning alert-mode chemistry remains in range.\nIt rises on busy days but recovers quickly.",
        series: [304, 312, 326, 341, 388, 362, 338],
        chartLabels: WEEK_LABELS,
        chartColor: "#3AABD2",
      },
      {
        id: "cortisol_delta",
        name: "Cortisol AM/PM Diff",
        average: 11.2,
        unit: "ug/dL",
        rangeLow: 5,
        rangeHigh: 18,
        dateRange: DATE_RANGE,
        statusTitle: "Slightly flatter on stress days",
        statusMessage:
          "The day-night swing remains healthy overall.\nTwo late nights narrowed the gap more than usual.",
        series: [11.9, 11.6, 11.3, 10.9, 9.7, 10.2, 11.1],
        chartLabels: WEEK_LABELS,
        chartColor: "#ef7d91",
      },
    ],
  },
  {
    id: 5,
    name: "Immune &\nAllergy",
    fullName: "Immune & Allergy",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "This group captures low-grade inflammation and immune stress. The profile shows a mild CRP rise around one short inflammatory episode, but no escalating pattern.",
    summary: {
      label: "Immune & Allergy",
      status: "normal",
      statusLabel: "Normal",
      deltaLabel: "small bump",
      bars: [15, 16, 17, 22, 18],
      value: "1.3 mg/L",
      suggestion: "Inflammation settled back quickly after one short spike.",
    },
    biomarkers: [
      {
        id: "nlr",
        name: "NLR",
        average: 2,
        unit: "",
        rangeLow: 0.78,
        rangeHigh: 3.53,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "NLR stayed inside the normal immune-stress window.\nNo hidden escalation trend appears.",
        series: [1.8, 1.9, 2, 2.2, 2.5, 2.2, 2],
        chartLabels: WEEK_LABELS,
        chartColor: "#3AABD2",
      },
      {
        id: "crp",
        name: "CRP",
        average: 1.3,
        unit: "mg/L",
        rangeLow: 0,
        rangeHigh: 3,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "CRP remains below the concern threshold.\nA single short-lived bump returned to baseline quickly.",
        series: [0.9, 1.1, 1.2, 1.6, 2.8, 1.9, 1.3],
        chartLabels: WEEK_LABELS,
        chartColor: "#f59e0b",
      },
    ],
  },
  {
    id: 6,
    name: "Nutrient\nStores",
    fullName: "Nutrient Stores",
    hasAlert: true,
    hasUnusualAlert: false,
    aboutDescription:
      "Nutrient reserves change slowly, so the story here is trend rather than sudden spikes. Vitamin D is mildly low and ferritin is low-normal.",
    summary: {
      label: "Nutrient Stores",
      status: "concern",
      statusLabel: "Concern",
      deltaLabel: "vit D low",
      bars: [20, 19, 18, 17, 16],
      value: "28 ng/mL",
      suggestion: "Daylight exposure and iron support would help the slow trends here.",
    },
    biomarkers: [
      {
        id: "vitamin_d",
        name: "Vitamin D",
        average: 28,
        unit: "ng/mL",
        rangeLow: 30,
        rangeHigh: 100,
        dateRange: DATE_RANGE,
        statusTitle: "Mildly low",
        statusMessage:
          "Vitamin D stays just below the preferred range.\nThis is the most consistent concern in the four-week profile.",
        series: [29, 29, 28.8, 28.3, 28.1, 27.9, 27.8, 28],
        chartLabels: LONG_LABELS,
        chartColor: "#f59e0b",
      },
      {
        id: "ferritin",
        name: "Ferritin",
        average: 24,
        unit: "ng/mL",
        rangeLow: 10,
        rangeHigh: 150,
        dateRange: DATE_RANGE,
        statusTitle: "Low-normal",
        statusMessage:
          "Ferritin remains in range but close to the lower end.\nThat matches the mild fatigue-recovery story in this profile.",
        series: [26, 25, 24, 23, 22, 23, 24, 24],
        chartLabels: LONG_LABELS,
        chartColor: "#ef7d91",
      },
    ],
  },
  {
    id: 7,
    name: "Menstrual\nCycle",
    fullName: "Menstrual Cycle & Fertility",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "These hormones track a regular 28-day cycle. Estradiol and progesterone move through the expected sequence without a disruptive pattern.",
    summary: {
      label: "Menstrual Cycle & Fertility",
      status: "normal",
      statusLabel: "Normal",
      deltaLabel: "cycle in sync",
      bars: [13, 18, 27, 22, 16],
      value: "follicular",
      suggestion: "Hormone timing looks consistent with a regular cycle.",
    },
    biomarkers: [
      {
        id: "estradiol",
        name: "Estradiol (E2)",
        average: 96,
        unit: "pg/mL",
        rangeLow: 20,
        rangeHigh: 160,
        dateRange: DATE_RANGE,
        statusTitle: "Expected follicular range",
        statusMessage:
          "Estradiol rises and falls on schedule.\nNo unusual hormone swings were captured in the last cycle.",
        series: [42, 58, 96, 144, 226, 318, 188, 96],
        chartLabels: LONG_LABELS,
        chartColor: "#ec4899",
      },
      {
        id: "progesterone",
        name: "Progesterone (P4)",
        average: 0.8,
        unit: "ng/mL",
        rangeLow: 0,
        rangeHigh: 1,
        dateRange: DATE_RANGE,
        statusTitle: "Pre-ovulation baseline",
        statusMessage:
          "Progesterone sits where it should ahead of ovulation.\nThe later luteal rise is visible deeper in the four-week view.",
        series: [0.4, 0.5, 0.7, 0.9, 1.1, 4.8, 9.2, 12.1],
        chartLabels: LONG_LABELS,
        chartColor: "#8b5cf6",
      },
      {
        id: "testosterone",
        name: "Testosterone",
        average: 31,
        unit: "ng/dL",
        rangeLow: 15,
        rangeHigh: 70,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "Testosterone remained steady in the expected female range.\nNo androgen-driven drift was observed.",
        series: [30, 30.5, 31, 31.8, 33.1, 32.4, 31.2, 31],
        chartLabels: LONG_LABELS,
        chartColor: "#3AABD2",
      },
    ],
  },
  {
    id: 8,
    name: "Clotting &\nBleeding",
    fullName: "Clotting & Bleeding",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "Clotting markers stay comfortably controlled. D-dimer shows only a brief watch-level rise that stays below the risk threshold.",
    summary: {
      label: "Clotting & Bleeding",
      status: "normal",
      statusLabel: "Normal",
      deltaLabel: "brief watch",
      bars: [14, 14, 15, 17, 15],
      value: "0.27 mg/L",
      suggestion: "Clotting risk markers stayed below concern thresholds.",
    },
    biomarkers: [
      {
        id: "d_dimer",
        name: "D-dimer",
        average: 0.27,
        unit: "mg/L FEU",
        rangeLow: 0,
        rangeHigh: 0.5,
        dateRange: DATE_RANGE,
        statusTitle: "All normal",
        statusMessage:
          "D-dimer stayed below the risk threshold.\nA small blip matched a transient inflammation pulse and then settled.",
        series: [0.22, 0.23, 0.24, 0.28, 0.41, 0.33, 0.27],
        chartLabels: WEEK_LABELS,
        chartColor: "#ef4444",
      },
    ],
  },
];

const dashboard: DashboardData = {
  bannerStatus: "Mostly Normal",
  bannerCompareLabel: "compared to 3/8",
  bannerMessage: [
    "Your baseline is stable this morning.",
    "Keep an eye on evening stress and low vitamin D.",
  ],
  syncLabel: "9:38 sync",
  priorityStats: [
    { label: "Cortisol (PM)", fill: 68, description: "Slowing decreasing" },
    { label: "Postprandial Glucose", fill: 54, description: "Stable" },
    { label: "Vitamin D", fill: 36, description: "Stable" },
  ],
  statCards: categories.map((category) => category.summary),
  summaryFeature: {
    title: "Stress & Recovery",
    value: "PM cortisol +12%",
    description: "Late meetings kept your evening recovery curve slightly elevated on 2 days.",
    secondary: [
      {
        title: "Vitamin D",
        value: "28 ng/mL",
        description: "Below your preferred range, but stable over the month.",
      },
      {
        title: "Ferritin",
        value: "24 ng/mL",
        description: "Low-normal iron stores match the mild recovery drag in this profile.",
      },
    ],
  },
  trendHighlight: {
    categoryLabel: "Stress & Recovery",
    headline: "Late-evening cortisol stayed higher than your baseline on two work-heavy nights.",
    charts: [
      {
        title: "Evening cortisol",
        description: "Current week stayed above the prior week on Thu and Fri.",
        previousBars: [14, 15, 16, 15, 14, 14, 13],
        currentBars: [14, 16, 17, 20, 24, 18, 16],
      },
      {
        title: "Post-dinner glucose",
        description: "Dinner spikes were still in range, but slower to settle than usual.",
        previousBars: [14, 15, 16, 15, 15, 14, 14],
        currentBars: [15, 16, 18, 17, 20, 17, 15],
        footerLabel: "10 pm",
      },
    ],
  },
  suggestions: [
    {
      emoji: "🌙",
      title: "Protect your wind-down window",
      body: "Lower evening stimulation so cortisol can fall sooner.",
      tone: "teal",
    },
    {
      emoji: "☀️",
      title: "Add daylight and vitamin D support",
      body: "Short daytime walks or supplement support would help the slow trend.",
      tone: "amber",
    },
  ],
};

const profileUi: DemoProfileUiData = {
  profileKey: "alex",
  profileName: "alex",
  dashboard,
  categories,
};

export function getDemoProfileUi() {
  return profileUi;
}
