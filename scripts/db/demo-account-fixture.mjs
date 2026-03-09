const HALF_HOUR_MS = 30 * 60 * 1000;

export const DEMO_NAMESPACE = "nanobot-demo-account";
export const DEMO_ACCOUNT_EMAIL = "alex@example.com";
export const DEMO_PLAN_NAME = "Comprehensive";
export const DEMO_WINDOW = {
  start: "2026-02-10T00:00:00Z",
  end: "2026-03-09T23:30:00Z",
  days: 28,
  slotsPerDay: 48,
  intervalMinutes: 30,
};

export const DEMO_BIOMARKER_CODES = [
  "hs_ctni",
  "spo2",
  "ldl_cholesterol",
  "hdl_cholesterol",
  "triglycerides",
  "fasting_glucose",
  "postprandial_glucose",
  "fasting_insulin",
  "hemoglobin_a1c",
  "hemoglobin",
  "platelet_count",
  "nlr",
  "cortisol",
  "cortisol_delta",
  "norepinephrine",
  "crp",
  "vitamin_d",
  "ferritin",
  "estradiol",
  "progesterone",
  "testosterone",
  "d_dimer",
];

export const DEMO_RANGE_CATALOG = {
  hs_ctni: { source: "markdown", sex: "female", context: "default", low: null, high: 14 },
  spo2: { source: "markdown", sex: "all", context: "default", low: 95, high: 100 },
  ldl_cholesterol: {
    source: "supplemental",
    sex: "all",
    context: "default",
    low: 60,
    high: 129,
    notes: "Supplemented from conservative standard lipid targets.",
  },
  hdl_cholesterol: {
    source: "supplemental",
    sex: "female",
    context: "default",
    low: 50,
    high: 90,
    notes: "Supplemented from conservative standard lipid targets.",
  },
  triglycerides: {
    source: "supplemental",
    sex: "all",
    context: "default",
    low: 40,
    high: 150,
    notes: "Supplemented from conservative standard lipid targets.",
  },
  fasting_glucose: { source: "markdown", sex: "all", context: "default", low: 70, high: 99 },
  postprandial_glucose: { source: "markdown", sex: "all", context: "default", low: 70, high: 140 },
  fasting_insulin: { source: "markdown", sex: "all", context: "default", low: 2, high: 25 },
  hemoglobin_a1c: {
    source: "supplemental",
    sex: "all",
    context: "default",
    low: 4.0,
    high: 5.6,
    notes: "Supplemented from conservative standard glycemic targets.",
  },
  hemoglobin: { source: "markdown", sex: "female", context: "default", low: 11.6, high: 15 },
  platelet_count: { source: "markdown", sex: "all", context: "default", low: 150, high: 400 },
  nlr: { source: "markdown", sex: "all", context: "default", low: 0.78, high: 3.53 },
  cortisol: {
    source: "markdown",
    sex: "all",
    contexts: {
      AM: { low: 5, high: 25 },
      PM: { low: 3, high: 10 },
    },
  },
  cortisol_delta: {
    source: "supplemental",
    sex: "all",
    context: "default",
    low: 5,
    high: 18,
    notes: "Supplemented from the desired AM/PM separation for healthy circadian rhythm demos.",
  },
  norepinephrine: { source: "markdown", sex: "all", context: "default", low: 70, high: 750 },
  crp: { source: "markdown", sex: "all", context: "default", low: 0, high: 3 },
  vitamin_d: { source: "markdown", sex: "all", context: "default", low: 30, high: 100 },
  ferritin: { source: "markdown", sex: "female", context: "default", low: 10, high: 150 },
  estradiol: {
    source: "markdown",
    sex: "female",
    contexts: {
      follicular_early: { low: 20, high: 160 },
      ovulation_peak: { low: 150, high: 750 },
      luteal_mid: { low: 30, high: 450 },
    },
  },
  progesterone: {
    source: "markdown",
    sex: "female",
    contexts: {
      follicular_early: { low: 0, high: 1 },
      ovulation_peak: { low: 0.8, high: 3.2 },
      luteal_mid: { low: 5, high: 20 },
    },
  },
  testosterone: {
    source: "supplemental",
    sex: "female",
    context: "default",
    low: 15,
    high: 70,
    notes: "Supplemented from conservative adult female serum testosterone ranges.",
  },
  d_dimer: { source: "markdown", sex: "all", context: "default", low: 0, high: 0.5 },
};

export const DEMO_PROFILES = [
  {
    key: "alex",
    displayName: "alex",
    dateOfBirth: "1993-08-14",
    biologicalSex: "female",
    heightCm: 167.4,
    weightKg: 61.7,
    cycleLengthDays: 28,
    cycleOffsetDays: 0,
    noiseSeed: 11,
    subscription: {
      status: "active",
      startedAt: "2026-02-01T08:00:00Z",
      currentPeriodEnd: "2026-04-01T08:00:00Z",
    },
    devices: [
      { code: "NB-DEMO-ALEX-BA-001", typeName: "Blood Analyzer", firmwareVersion: "2.1.0" },
      { code: "NB-DEMO-ALEX-HT-001", typeName: "Hormone Tracker", firmwareVersion: "1.7.3" },
      { code: "NB-DEMO-ALEX-SP-001", typeName: "SpO2 Monitor", firmwareVersion: "3.0.4" },
    ],
    episodes: {
      stress: [
        { day: 8.3, widthDays: 0.7, amplitude: 1.2 },
        { day: 18.8, widthDays: 0.9, amplitude: 0.9 },
      ],
      inflammation: [{ day: 14.4, widthDays: 0.8, amplitude: 1.1 }],
      exercise: [{ day: 19.1, widthDays: 0.25, amplitude: 1.3 }],
      respiratory: [{ day: 11.2, widthDays: 0.2, amplitude: 1.2 }],
      clotting: [{ day: 20.6, widthDays: 0.35, amplitude: 0.6 }],
      dysglycemia: [{ day: 17.4, widthDays: 0.65, amplitude: 0.6 }],
    },
    baselines: {
      hs_ctni: 6.6,
      spo2: 97.8,
      ldl_cholesterol: 104,
      hdl_cholesterol: 63,
      triglycerides: 102,
      fasting_glucose: 91,
      postprandial_glucose: 116,
      fasting_insulin: 8.4,
      hemoglobin_a1c: 5.4,
      hemoglobin: 12.6,
      platelet_count: 248,
      nlr: 1.9,
      cortisol_am: 17.3,
      cortisol_pm: 5.6,
      norepinephrine: 322,
      crp: 1.05,
      vitamin_d: 28,
      ferritin: 24,
      testosterone: 31,
      d_dimer: 0.24,
    },
    profileReferenceRanges: [
      {
        biomarkerCode: "cortisol",
        context: "AM",
        rangeLow: 13.2,
        rangeHigh: 19.4,
        sampleSize: 672,
        effectiveFrom: "2026-02-24T09:00:00Z",
      },
      {
        biomarkerCode: "ferritin",
        context: "default",
        rangeLow: 18,
        rangeHigh: 31,
        sampleSize: 672,
        effectiveFrom: "2026-02-24T09:00:00Z",
      },
      {
        biomarkerCode: "estradiol",
        context: "follicular_early",
        rangeLow: 44,
        rangeHigh: 132,
        sampleSize: 336,
        effectiveFrom: "2026-02-24T09:00:00Z",
      },
    ],
    questions: [
      {
        biomarkerCode: "hs_ctni",
        recordedAt: "2026-03-01T09:00:00Z",
        context: "default",
        answered: true,
        isNormalActivity: false,
        userNote: "Ended a hard workout before breakfast.",
      },
      {
        biomarkerCode: "cortisol",
        recordedAt: "2026-02-28T20:00:00Z",
        context: "PM",
        answered: true,
        isNormalActivity: true,
        userNote: "Late work meeting kept stress elevated.",
      },
    ],
    idfwScenarios: [
      {
        createdAt: "2026-02-27T21:30:00Z",
        resultSummary: "DEMO: alex combined cycle discomfort check-in.",
        physicalSymptoms: [
          {
            bodyLocationName: "Lower Abdomen",
            sensationTypeName: "pain",
            intensity: 5,
            selectedReasonName: "Menstrual discomfort",
          },
        ],
        mentalSymptom: {
          stressLevel: 5,
          clarityLevel: 6,
          selectedReasonName: "Lack of sleep",
        },
        flaggedBiomarkers: [
          { biomarker_code: "cortisol", status: "watch" },
          { biomarker_code: "crp", status: "watch" },
        ],
        interpretation: "Mild stress and inflammation overlap with cycle discomfort.",
        suggestions: "Hydrate, rest, and compare hormone trends with symptom timing.",
      },
      {
        createdAt: "2026-03-04T22:00:00Z",
        resultSummary: "DEMO: alex evening stress reset.",
        mentalSymptom: {
          stressLevel: 7,
          clarityLevel: 5,
          selectedReasonName: "Work stress",
        },
        flaggedBiomarkers: [{ biomarker_code: "cortisol", status: "watch" }],
        interpretation: "Evening cortisol stayed mildly elevated after a stressful day.",
        suggestions: "Reduce late-evening stimulation and monitor sleep quality.",
      },
    ],
    exportRequest: {
      requesterType: "user",
      formats: ["pdf", "csv"],
      dateRangeStart: "2026-02-10T00:00:00Z",
      dateRangeEnd: "2026-03-09T23:30:00Z",
      completedAt: "2026-03-09T22:15:00Z",
      objectPath: "demo-account/alex-four-week-summary.txt",
    },
  },
  {
    key: "judy",
    displayName: "judy",
    dateOfBirth: "1998-10-02",
    biologicalSex: "female",
    heightCm: 163.5,
    weightKg: 59.8,
    cycleLengthDays: 31,
    cycleOffsetDays: 4,
    noiseSeed: 29,
    subscription: {
      status: "active",
      startedAt: "2026-02-01T08:00:00Z",
      currentPeriodEnd: "2026-04-01T08:00:00Z",
    },
    devices: [
      { code: "NB-DEMO-JUDY-BA-001", typeName: "Blood Analyzer", firmwareVersion: "2.1.0" },
      { code: "NB-DEMO-JUDY-HT-001", typeName: "Hormone Tracker", firmwareVersion: "1.7.3" },
      { code: "NB-DEMO-JUDY-SP-001", typeName: "SpO2 Monitor", firmwareVersion: "3.0.4" },
    ],
    episodes: {
      stress: [
        { day: 5.6, widthDays: 0.8, amplitude: 0.9 },
        { day: 20.2, widthDays: 1.0, amplitude: 1.2 },
      ],
      inflammation: [{ day: 16.1, widthDays: 0.85, amplitude: 1.0 }],
      exercise: [{ day: 9.4, widthDays: 0.2, amplitude: 0.6 }],
      respiratory: [{ day: 22.4, widthDays: 0.25, amplitude: 0.9 }],
      clotting: [{ day: 19.8, widthDays: 0.5, amplitude: 0.9 }],
      dysglycemia: [
        { day: 7.2, widthDays: 1.0, amplitude: 1.0 },
        { day: 24.1, widthDays: 0.9, amplitude: 1.1 },
      ],
    },
    baselines: {
      hs_ctni: 7.4,
      spo2: 97.1,
      ldl_cholesterol: 121,
      hdl_cholesterol: 53,
      triglycerides: 142,
      fasting_glucose: 96,
      postprandial_glucose: 124,
      fasting_insulin: 13.8,
      hemoglobin_a1c: 5.55,
      hemoglobin: 12.0,
      platelet_count: 274,
      nlr: 2.4,
      cortisol_am: 13.6,
      cortisol_pm: 7.0,
      norepinephrine: 456,
      crp: 1.9,
      vitamin_d: 26,
      ferritin: 18,
      testosterone: 36,
      d_dimer: 0.34,
    },
    profileReferenceRanges: [
      {
        biomarkerCode: "fasting_glucose",
        context: "default",
        rangeLow: 92,
        rangeHigh: 108,
        sampleSize: 672,
        effectiveFrom: "2026-02-25T09:00:00Z",
      },
      {
        biomarkerCode: "postprandial_glucose",
        context: "default",
        rangeLow: 112,
        rangeHigh: 166,
        sampleSize: 672,
        effectiveFrom: "2026-02-25T09:00:00Z",
      },
      {
        biomarkerCode: "progesterone",
        context: "luteal_mid",
        rangeLow: 4.8,
        rangeHigh: 9.8,
        sampleSize: 336,
        effectiveFrom: "2026-02-25T09:00:00Z",
      },
    ],
    questions: [
      {
        biomarkerCode: "postprandial_glucose",
        recordedAt: "2026-03-03T14:00:00Z",
        context: "default",
        answered: true,
        isNormalActivity: true,
        userNote: "Heavy lunch and dessert after skipping breakfast.",
      },
      {
        biomarkerCode: "d_dimer",
        recordedAt: "2026-03-05T15:30:00Z",
        context: "default",
        answered: false,
        isNormalActivity: null,
        userNote: null,
      },
    ],
    idfwScenarios: [
      {
        createdAt: "2026-02-24T18:00:00Z",
        resultSummary: "DEMO: judy upper-body soreness check-in.",
        physicalSymptoms: [
          {
            bodyLocationName: "Shoulders",
            sensationTypeName: "pain",
            intensity: 4,
            selectedReasonName: "Muscle strain",
          },
        ],
        flaggedBiomarkers: [
          { biomarker_code: "crp", status: "watch" },
          { biomarker_code: "nlr", status: "watch" },
        ],
        interpretation: "Low-grade inflammation matches post-exertion soreness.",
        suggestions: "Use a light recovery day and recheck the next morning.",
      },
      {
        createdAt: "2026-03-03T14:30:00Z",
        resultSummary: "DEMO: judy combined metabolic and cycle check-in.",
        physicalSymptoms: [
          {
            bodyLocationName: "Lower Abdomen",
            sensationTypeName: "pain",
            intensity: 6,
            selectedReasonName: "Menstrual discomfort",
          },
        ],
        mentalSymptom: {
          stressLevel: 6,
          clarityLevel: 5,
          selectedReasonName: "Work stress",
        },
        flaggedBiomarkers: [
          { biomarker_code: "postprandial_glucose", status: "watch" },
          { biomarker_code: "progesterone", status: "watch" },
        ],
        interpretation: "Meal response and cycle timing both contribute to fatigue and discomfort.",
        suggestions: "Review meal timing, rest, and compare the next luteal phase for pattern repeatability.",
      },
    ],
    exportRequest: {
      requesterType: "licensed_professional",
      formats: ["pdf", "json"],
      dateRangeStart: "2026-02-10T00:00:00Z",
      dateRangeEnd: "2026-03-09T23:30:00Z",
      completedAt: "2026-03-09T22:20:00Z",
      objectPath: "demo-account/judy-four-week-summary.txt",
    },
  },
];

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value, low, high) {
  let next = value;
  if (low !== null && low !== undefined) {
    next = Math.max(low, next);
  }
  if (high !== null && high !== undefined) {
    next = Math.min(high, next);
  }
  return next;
}

function noise(index, seed) {
  const a = Math.sin(index * 0.21 + seed * 1.37);
  const b = Math.cos(index * 0.073 + seed * 0.91);
  return (a + b) / 2;
}

function gaussian(x, center, width) {
  return Math.exp(-((x - center) ** 2) / (2 * width ** 2));
}

function dayPulse(dayFraction, pulses) {
  return pulses.reduce(
    (sum, pulse) => sum + pulse.amplitude * gaussian(dayFraction, pulse.day, pulse.widthDays),
    0,
  );
}

function hourPulse(hour, centerHour, widthHours) {
  return gaussian(hour, centerHour, widthHours);
}

function mealPulse(hour) {
  return (
    hourPulse(hour, 10, 1.1) +
    hourPulse(hour, 15, 1.0) +
    hourPulse(hour, 20, 1.1)
  );
}

function dawnPulse(hour) {
  return hourPulse(hour, 6.5, 1.2);
}

function nightPulse(hour) {
  return hourPulse(hour, 3, 1.4);
}

function circadianCortisol(hour, amLevel, pmLevel) {
  const morning = hourPulse(hour, 8, 2.1);
  const evening = hourPulse(hour, 20, 2.4);
  const floor = pmLevel * 0.85;
  return floor + morning * (amLevel - floor) + evening * (pmLevel - floor);
}

function cycleDay(profile, dayIndex) {
  return ((dayIndex + profile.cycleOffsetDays) % profile.cycleLengthDays) + 1;
}

function hormoneContext(profile, dayIndex) {
  const day = cycleDay(profile, dayIndex);

  if (day <= 10) {
    return "follicular_early";
  }
  if (day <= 15) {
    return "ovulation_peak";
  }
  return "luteal_mid";
}

function estradiolForCycle(profile, cycleDayValue, seedNoise) {
  if (cycleDayValue <= 10) {
    return 38 + cycleDayValue * 8 + seedNoise * 6;
  }
  if (cycleDayValue <= 15) {
    return 180 + (cycleDayValue - 10) * 72 + seedNoise * 18;
  }

  const descendingDay = cycleDayValue - 15;
  const base = profile.key === "judy" ? 182 : 208;
  const slope = profile.key === "judy" ? 5.6 : 6.4;
  return base - descendingDay * slope + seedNoise * 10;
}

function progesteroneForCycle(profile, cycleDayValue, seedNoise) {
  if (cycleDayValue <= 10) {
    return 0.45 + cycleDayValue * 0.03 + seedNoise * 0.04;
  }
  if (cycleDayValue <= 15) {
    return 1.2 + (cycleDayValue - 10) * 0.18 + seedNoise * 0.08;
  }

  const lutealDay = cycleDayValue - 15;
  const peak = profile.key === "judy" ? 8.3 : 12.8;
  const shape = Math.sin(Math.min(Math.PI, (lutealDay / (profile.cycleLengthDays - 15)) * Math.PI));
  return 3.2 + peak * shape + seedNoise * 0.3;
}

function createFeatureVector(profile, slotIndex) {
  const timestamp = new Date(Date.parse(DEMO_WINDOW.start) + slotIndex * HALF_HOUR_MS);
  const dayIndex = Math.floor(slotIndex / DEMO_WINDOW.slotsPerDay);
  const hour = timestamp.getUTCHours() + timestamp.getUTCMinutes() / 60;
  const dayFraction = slotIndex / DEMO_WINDOW.slotsPerDay;
  const cycleDayValue = cycleDay(profile, dayIndex);
  const baseNoise = noise(slotIndex, profile.noiseSeed);
  const slowNoise = noise(Math.floor(slotIndex / 4), profile.noiseSeed + 7);

  return {
    timestamp,
    dayIndex,
    hour,
    dayFraction,
    baseNoise,
    slowNoise,
    cycleDayValue,
    hormoneContext: hormoneContext(profile, dayIndex),
    meal: mealPulse(hour),
    dawn: dawnPulse(hour),
    night: nightPulse(hour),
    stress: dayPulse(dayFraction, profile.episodes.stress),
    inflammation: dayPulse(dayFraction, profile.episodes.inflammation),
    exercise: dayPulse(dayFraction, profile.episodes.exercise),
    respiratory: dayPulse(dayFraction, profile.episodes.respiratory),
    clotting: dayPulse(dayFraction, profile.episodes.clotting),
    dysglycemia: dayPulse(dayFraction, profile.episodes.dysglycemia),
  };
}

function readingForBiomarker(profile, biomarkerCode, vector) {
  const baseline = profile.baselines;
  const lowNoise = vector.baseNoise * 0.08 + vector.slowNoise * 0.12;

  switch (biomarkerCode) {
    case "hs_ctni":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.hs_ctni + vector.exercise * 4.8 + vector.stress * 0.8 + lowNoise * 0.6,
            3.8,
            15.4,
          ),
          2,
        ),
      };
    case "spo2":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.spo2 - vector.night * 0.9 - vector.respiratory * 1.9 + lowNoise * 0.5,
            93.6,
            99.7,
          ),
          1,
        ),
      };
    case "ldl_cholesterol":
      return {
        context: "default",
        value: round(
          clamp(baseline.ldl_cholesterol + vector.slowNoise * 4 + vector.dysglycemia * 6, 82, 146),
          1,
        ),
      };
    case "hdl_cholesterol":
      return {
        context: "default",
        value: round(
          clamp(baseline.hdl_cholesterol - vector.stress * 1.1 + vector.slowNoise * 2, 44, 70),
          1,
        ),
      };
    case "triglycerides":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.triglycerides + vector.meal * 16 + vector.dysglycemia * 22 + vector.slowNoise * 6,
            82,
            191,
          ),
          1,
        ),
      };
    case "fasting_glucose":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.fasting_glucose + vector.dawn * 5 + vector.dysglycemia * 8 + lowNoise * 3,
            78,
            111,
          ),
          1,
        ),
      };
    case "postprandial_glucose":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.postprandial_glucose + vector.meal * (profile.key === "judy" ? 28 : 18) +
              vector.dysglycemia * 22 + lowNoise * 4,
            84,
            179,
          ),
          1,
        ),
      };
    case "fasting_insulin":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.fasting_insulin + vector.dawn * 1.6 + vector.meal * 1.8 +
              vector.dysglycemia * 2.6 + lowNoise * 0.8,
            4.2,
            23.8,
          ),
          2,
        ),
      };
    case "hemoglobin_a1c":
      return {
        context: "default",
        value: round(
          clamp(baseline.hemoglobin_a1c + vector.slowNoise * 0.08 + vector.dysglycemia * 0.09, 5.1, 6.1),
          2,
        ),
      };
    case "hemoglobin":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.hemoglobin -
              (vector.hormoneContext === "follicular_early" ? 0.18 : 0) +
              vector.slowNoise * 0.18,
            11.4,
            13.8,
          ),
          2,
        ),
      };
    case "platelet_count":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.platelet_count + vector.inflammation * 18 + vector.clotting * 22 + vector.slowNoise * 9,
            182,
            342,
          ),
          1,
        ),
      };
    case "nlr":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.nlr + vector.inflammation * 0.7 + vector.stress * 0.26 + vector.baseNoise * 0.16,
            1.0,
            4.2,
          ),
          2,
        ),
      };
    case "cortisol": {
      const context = vector.hour < 12 ? "AM" : "PM";
      const circadian = circadianCortisol(vector.hour, baseline.cortisol_am, baseline.cortisol_pm);
      return {
        context,
        value: round(
          clamp(circadian + vector.stress * 2.1 + vector.inflammation * 0.7 + vector.baseNoise * 0.4, 3.2, 24.5),
          2,
        ),
      };
    }
    case "cortisol_delta":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.cortisol_am - baseline.cortisol_pm - vector.stress * (profile.key === "judy" ? 1.1 : 0.9) +
              vector.baseNoise * 0.5,
            4.1,
            15.6,
          ),
          2,
        ),
      };
    case "norepinephrine":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.norepinephrine + hourPulse(vector.hour, 7.5, 2) * 140 +
              vector.stress * 120 + vector.baseNoise * 24,
            120,
            690,
          ),
          1,
        ),
      };
    case "crp":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.crp + vector.inflammation * 1.7 + vector.stress * 0.45 + vector.slowNoise * 0.18,
            0.4,
            4.6,
          ),
          2,
        ),
      };
    case "vitamin_d":
      return {
        context: "default",
        value: round(
          clamp(baseline.vitamin_d + vector.slowNoise * 1.1 - vector.stress * 0.2, 21, 33),
          1,
        ),
      };
    case "ferritin":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.ferritin - (vector.hormoneContext === "follicular_early" ? 1.1 : 0) +
              vector.inflammation * 2.1 + vector.slowNoise * 1.3,
            13,
            38,
          ),
          1,
        ),
      };
    case "estradiol":
      return {
        context: vector.hormoneContext,
        value: round(
          clamp(
            estradiolForCycle(profile, vector.cycleDayValue, vector.baseNoise),
            22,
            profile.key === "judy" ? 380 : 420,
          ),
          1,
        ),
      };
    case "progesterone":
      return {
        context: vector.hormoneContext,
        value: round(
          clamp(progesteroneForCycle(profile, vector.cycleDayValue, vector.baseNoise), 0.2, 15.2),
          2,
        ),
      };
    case "testosterone":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.testosterone + (vector.hormoneContext === "ovulation_peak" ? 3.5 : 0) + vector.baseNoise * 2.1,
            20,
            46,
          ),
          1,
        ),
      };
    case "d_dimer":
      return {
        context: "default",
        value: round(
          clamp(
            baseline.d_dimer + vector.clotting * 0.14 + vector.inflammation * 0.05 + vector.baseNoise * 0.02,
            0.12,
            0.56,
          ),
          3,
        ),
      };
    default:
      throw new Error(`No generator implemented for biomarker ${biomarkerCode}`);
  }
}

export function buildTimeline() {
  return Array.from(
    { length: DEMO_WINDOW.days * DEMO_WINDOW.slotsPerDay },
    (_, index) => new Date(Date.parse(DEMO_WINDOW.start) + index * HALF_HOUR_MS),
  );
}

export function expectedReadingCountPerProfile() {
  return DEMO_BIOMARKER_CODES.length * DEMO_WINDOW.days * DEMO_WINDOW.slotsPerDay;
}

export function expectedTotalReadingCount() {
  return expectedReadingCountPerProfile() * DEMO_PROFILES.length;
}

export function managedDeviceCodes() {
  return DEMO_PROFILES.flatMap((profile) => profile.devices.map((device) => device.code));
}

export function biomarkerDeviceTypeName(biomarkerCode) {
  if (biomarkerCode === "spo2") {
    return "SpO2 Monitor";
  }

  if (["estradiol", "progesterone", "testosterone"].includes(biomarkerCode)) {
    return "Hormone Tracker";
  }

  return "Blood Analyzer";
}

export function findProfileConfig(profileName) {
  return DEMO_PROFILES.find((profile) => profile.displayName === profileName) ?? null;
}

export function generateProfileReadings(profileConfig) {
  const rows = [];
  const timestamps = buildTimeline();

  for (let slotIndex = 0; slotIndex < timestamps.length; slotIndex += 1) {
    const vector = createFeatureVector(profileConfig, slotIndex);
    const recordedAt = timestamps[slotIndex].toISOString();

    for (const biomarkerCode of DEMO_BIOMARKER_CODES) {
      const reading = readingForBiomarker(profileConfig, biomarkerCode, vector);
      rows.push({
        biomarkerCode,
        deviceTypeName: biomarkerDeviceTypeName(biomarkerCode),
        value: reading.value,
        context: reading.context,
        recordedAt,
      });
    }
  }

  return rows;
}

export function rangeForReading(biomarkerCode, context) {
  const definition = DEMO_RANGE_CATALOG[biomarkerCode];
  if (!definition) {
    return null;
  }

  if (definition.contexts) {
    return definition.contexts[context] ?? definition.contexts.default ?? null;
  }

  return definition;
}

export function countOutOfRangeReadings(readings) {
  let count = 0;

  for (const reading of readings) {
    const range = rangeForReading(reading.biomarkerCode, reading.context);
    if (!range) {
      continue;
    }

    const below = range.low !== null && range.low !== undefined && reading.value < range.low;
    const above = range.high !== null && range.high !== undefined && reading.value > range.high;
    if (below || above) {
      count += 1;
    }
  }

  return count;
}

export function demoStoragePath(profileId, suffix) {
  return `${profileId}/${suffix}`;
}
