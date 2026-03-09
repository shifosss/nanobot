export interface BiomarkerItem {
  id: string;
  name: string;
  average: number;
  unit: string;
  rangeLow: number;
  rangeHigh: number;
  dateRange: string;
  statusMessage: string;
}

export interface CategoryData {
  id: number;
  name: string;
  fullName: string;
  hasAlert: boolean;
  hasUnusualAlert: boolean;
  aboutDescription: string;
  biomarkers: BiomarkerItem[];
}

const DATE_RANGE = "Mar 2 - 8, 2026";

export const CATEGORIES: CategoryData[] = [
  {
    id: 1,
    name: "Heart\nHealth",
    fullName: "Heart Health",
    hasAlert: false,
    hasUnusualAlert: true,
    aboutDescription:
      "Heart health markers track damage, oxygen delivery, and bleeding risk. Together they give a real-time picture of how well your cardiovascular system is performing.",
    biomarkers: [
      {
        id: "hscTnI",
        name: "hs-cTnI",
        average: 8,
        unit: "ng/L",
        rangeLow: 0,
        rangeHigh: 14,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your hs-cTnI is within healthy range.\nNo signs of heart muscle stress.",
      },
      {
        id: "spo2",
        name: "Blood Oxygen (SpO\u2082)",
        average: 98,
        unit: "%",
        rangeLow: 95,
        rangeHigh: 100,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Blood Oxygen is within healthy range.\nNothing to stress about!",
      },
      {
        id: "hemoglobin",
        name: "Hemoglobin",
        average: 14.5,
        unit: "g/dL",
        rangeLow: 13.2,
        rangeHigh: 16.6,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Hemoglobin is within healthy range.\nOxygen delivery looks good.",
      },
    ],
  },
  {
    id: 2,
    name: "Blood\nSugar",
    fullName: "Blood Sugar & Energy",
    hasAlert: true,
    hasUnusualAlert: false,
    aboutDescription:
      "These markers reveal how your body manages fuel \u2014 from fasting sugar levels to insulin response after meals. Early shifts here can predict diabetes years ahead.",
    biomarkers: [
      {
        id: "fastingGlucose",
        name: "Fasting Glucose",
        average: 85,
        unit: "mg/dL",
        rangeLow: 70,
        rangeHigh: 99,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Fasting Glucose is within healthy range.\nBlood sugar control looks normal.",
      },
      {
        id: "postprandialGlucose",
        name: "Postprandial Glucose (2h)",
        average: 120,
        unit: "mg/dL",
        rangeLow: 0,
        rangeHigh: 140,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your post-meal glucose is within healthy range.\nYour body handles sugar well.",
      },
      {
        id: "fastingInsulin",
        name: "Fasting Insulin",
        average: 6,
        unit: "\u00b5IU/mL",
        rangeLow: 2,
        rangeHigh: 25,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Fasting Insulin is optimal.\nNo signs of insulin resistance.",
      },
      {
        id: "postprandialInsulin",
        name: "Postprandial Insulin (2h)",
        average: 30,
        unit: "\u00b5IU/mL",
        rangeLow: 0,
        rangeHigh: 55,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your post-meal insulin is within range.\nPancreatic response is healthy.",
      },
      {
        id: "lactate",
        name: "Lactate",
        average: 1.2,
        unit: "mmol/L",
        rangeLow: 0.5,
        rangeHigh: 2.2,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Lactate level is normal.\nTissues are getting enough oxygen.",
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
      "Red blood cell markers tell you whether your body has enough oxygen-carrying capacity. Low counts mean anemia; high hematocrit can signal dehydration.",
    biomarkers: [
      {
        id: "rbc",
        name: "RBC",
        average: 4.8,
        unit: "\u00d710\u2076/\u00b5L",
        rangeLow: 4.35,
        rangeHigh: 5.65,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Red Blood Cell count is normal.\nNo signs of anemia.",
      },
      {
        id: "hematocrit",
        name: "Hematocrit",
        average: 43,
        unit: "%",
        rangeLow: 38.3,
        rangeHigh: 48.6,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Hematocrit is within healthy range.\nHydration and blood volume look good.",
      },
    ],
  },
  {
    id: 4,
    name: "Stress &\nRecovery",
    fullName: "Stress & Recovery",
    hasAlert: true,
    hasUnusualAlert: false,
    aboutDescription:
      "Stress hormones reveal whether your nervous system is stuck in fight-or-flight mode. Tracking them over time shows how well your body recovers from daily pressure.",
    biomarkers: [
      {
        id: "cortisolAM",
        name: "Cortisol (AM)",
        average: 15,
        unit: "\u00b5g/dL",
        rangeLow: 5,
        rangeHigh: 25,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your morning Cortisol is in a healthy range.\nYour stress rhythm looks normal.",
      },
      {
        id: "cortisolPM",
        name: "Cortisol (PM)",
        average: 6,
        unit: "\u00b5g/dL",
        rangeLow: 3,
        rangeHigh: 10,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your evening Cortisol is within range.\nHealthy daily decline observed.",
      },
      {
        id: "norepinephrine",
        name: "Norepinephrine",
        average: 350,
        unit: "pg/mL",
        rangeLow: 70,
        rangeHigh: 750,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Norepinephrine is within range.\nNo signs of chronic fight-or-flight.",
      },
      {
        id: "epinephrine",
        name: "Epinephrine",
        average: 45,
        unit: "pg/mL",
        rangeLow: 0,
        rangeHigh: 110,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Epinephrine is within normal range.\nNo acute stress signals detected.",
      },
      {
        id: "betaEndorphin",
        name: "\u03b2-Endorphin",
        average: 22,
        unit: "pg/mL",
        rangeLow: 10,
        rangeHigh: 40,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your \u03b2-Endorphin is in a healthy range.\nNatural pain-relief system looks good.",
      },
    ],
  },
  {
    id: 5,
    name: "Sleep &\nRhythm",
    fullName: "Sleep & Circadian Rhythm",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "These markers track your internal clock. Melatonin drives sleepiness at night, while the cortisol AM/PM gap shows whether your body\u2019s daily rhythm is in sync.",
    biomarkers: [
      {
        id: "melatonin",
        name: "Melatonin (night)",
        average: 85,
        unit: "pg/mL",
        rangeLow: 18,
        rangeHigh: 180,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Melatonin level is healthy.\nYour sleep hormone is working well.",
      },
      {
        id: "cortisolDiff",
        name: "Cortisol AM/PM Diff",
        average: 12,
        unit: "\u00b5g/dL",
        rangeLow: 5,
        rangeHigh: 20,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your cortisol rhythm is healthy.\nGood swing between morning and evening.",
      },
    ],
  },
  {
    id: 6,
    name: "Immune &\nAllergy",
    fullName: "Immune & Allergy",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "Immune markers reveal active infection, chronic inflammation, and allergic reactions. IL-6 and PCT respond within hours, while hs-CRP tracks long-term trends.",
    biomarkers: [
      {
        id: "il6",
        name: "IL-6",
        average: 3,
        unit: "pg/mL",
        rangeLow: 0,
        rangeHigh: 7,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your IL-6 is within normal range.\nNo signs of acute inflammation.",
      },
      {
        id: "pct",
        name: "Procalcitonin (PCT)",
        average: 0.04,
        unit: "ng/mL",
        rangeLow: 0,
        rangeHigh: 0.1,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Procalcitonin is very low.\nNo signs of bacterial infection.",
      },
      {
        id: "wbc",
        name: "WBC",
        average: 7200,
        unit: "/\u00b5L",
        rangeLow: 4500,
        rangeHigh: 11000,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your White Blood Cell count is normal.\nImmune system is balanced.",
      },
      {
        id: "nlr",
        name: "NLR",
        average: 2.1,
        unit: "",
        rangeLow: 0.78,
        rangeHigh: 3.53,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Neutrophil-Lymphocyte Ratio is normal.\nNo hidden inflammation detected.",
      },
      {
        id: "hsCRP",
        name: "hs-CRP",
        average: 0.8,
        unit: "mg/L",
        rangeLow: 0,
        rangeHigh: 3,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your hs-CRP is optimal (under 1).\nLow cardiovascular inflammation risk.",
      },
      {
        id: "histamine",
        name: "Histamine",
        average: 0.4,
        unit: "ng/mL",
        rangeLow: 0,
        rangeHigh: 1,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Histamine is within normal range.\nNo allergic reaction detected.",
      },
    ],
  },
  {
    id: 7,
    name: "Acid-Base",
    fullName: "Acid-Base Balance",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "Blood pH is one of the most tightly controlled values in your body. Even small deviations signal serious conditions like diabetic crisis or respiratory failure.",
    biomarkers: [
      {
        id: "bloodPH",
        name: "Blood pH",
        average: 7.4,
        unit: "",
        rangeLow: 7.35,
        rangeHigh: 7.45,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Blood pH is perfectly balanced.\nAcid-base regulation is working well.",
      },
    ],
  },
  {
    id: 8,
    name: "Gut\nHealth",
    fullName: "Gut Health",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "Gut markers reflect the health of your digestive system and microbiome. Serotonin screens for rare tumors, while SCFAs indicate how well your gut bacteria are thriving.",
    biomarkers: [
      {
        id: "serotonin",
        name: "Serotonin",
        average: 120,
        unit: "ng/mL",
        rangeLow: 50,
        rangeHigh: 200,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Serotonin level is within range.\nGut function appears healthy.",
      },
      {
        id: "scfas",
        name: "Intestinal SCFAs",
        average: 70,
        unit: "\u00b5mol/L",
        rangeLow: 50,
        rangeHigh: 100,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Short-Chain Fatty Acids are normal.\nGut microbiome looks healthy.",
      },
    ],
  },
  {
    id: 9,
    name: "Nutrient\nStores",
    fullName: "Nutrient Stores",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "These markers track your body\u2019s reserves of essential vitamins and minerals. They change slowly, so periodic checks catch deficiencies before symptoms appear.",
    biomarkers: [
      {
        id: "vitD",
        name: "Vitamin D (25-OH)",
        average: 45,
        unit: "ng/mL",
        rangeLow: 30,
        rangeHigh: 100,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Vitamin D is within healthy range.\nBone and immune support looks good.",
      },
      {
        id: "vitB12",
        name: "Vitamin B12",
        average: 500,
        unit: "pg/mL",
        rangeLow: 200,
        rangeHigh: 900,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Vitamin B12 is within range.\nNerve and blood cell health is good.",
      },
      {
        id: "ferritin",
        name: "Ferritin",
        average: 80,
        unit: "ng/mL",
        rangeLow: 12,
        rangeHigh: 300,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Ferritin is within healthy range.\nIron stores are adequate.",
      },
      {
        id: "vitA",
        name: "Vitamin A (Retinol)",
        average: 48,
        unit: "\u00b5g/dL",
        rangeLow: 30,
        rangeHigh: 65,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Vitamin A is within range.\nEye and skin health markers look good.",
      },
      {
        id: "vitB1",
        name: "Vitamin B1 (Thiamine)",
        average: 120,
        unit: "nmol/L",
        rangeLow: 70,
        rangeHigh: 180,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Thiamine is within range.\nEnergy metabolism is normal.",
      },
      {
        id: "vitB6",
        name: "Vitamin B6 (PLP)",
        average: 20,
        unit: "\u00b5g/L",
        rangeLow: 5,
        rangeHigh: 50,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Vitamin B6 is within range.\nBrain chemistry support looks good.",
      },
    ],
  },
  {
    id: 10,
    name: "Menstrual\nCycle",
    fullName: "Menstrual Cycle & Fertility",
    hasAlert: false,
    hasUnusualAlert: false,
    aboutDescription:
      "These hormones map your menstrual cycle phases. Together they confirm ovulation, track cycle regularity, and provide early signals about reproductive health.",
    biomarkers: [
      {
        id: "estradiol",
        name: "Estradiol (E2)",
        average: 90,
        unit: "pg/mL",
        rangeLow: 20,
        rangeHigh: 160,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Estradiol is within follicular range.\nCycle hormone levels look normal.",
      },
      {
        id: "progesterone",
        name: "Progesterone (P4)",
        average: 0.5,
        unit: "ng/mL",
        rangeLow: 0,
        rangeHigh: 1,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your Progesterone is at follicular level.\nPre-ovulation phase confirmed.",
      },
      {
        id: "lh",
        name: "LH",
        average: 7,
        unit: "mIU/mL",
        rangeLow: 1.7,
        rangeHigh: 15,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your LH is within follicular range.\nNo ovulation surge detected yet.",
      },
      {
        id: "fsh",
        name: "FSH",
        average: 6,
        unit: "mIU/mL",
        rangeLow: 3,
        rangeHigh: 12,
        dateRange: DATE_RANGE,
        statusMessage:
          "Your FSH is within normal range.\nOvarian reserve appears healthy.",
      },
    ],
  },
];
