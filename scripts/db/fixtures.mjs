export const SAMPLE_NAMESPACE = "nanobot-sample";
export const SAMPLE_PASSWORD = "NanobotSample!2026";

export const FIXTURE_ACCOUNTS = [
  {
    key: "ava",
    email: "sample.ava.essential@nanobot.local",
    password: SAMPLE_PASSWORD,
    accountType: "individual",
    subscription: {
      planName: "Essential",
      status: "active",
      startedAt: "2026-03-01T09:00:00Z",
      currentPeriodEnd: "2026-04-01T09:00:00Z",
      nextPlanName: "Comprehensive",
    },
    profiles: [
      {
        key: "ava-main",
        displayName: "Ava Chen",
        dateOfBirth: "1992-04-17",
        biologicalSex: "female",
        heightCm: 168.4,
        weightKg: 61.8,
        devices: [
          { code: "NB-SAMPLE-AVA-BA-001", typeName: "Blood Analyzer", firmwareVersion: "1.4.2" },
          { code: "NB-SAMPLE-AVA-SP-001", typeName: "SpO2 Monitor", firmwareVersion: "2.0.1" },
        ],
        readings: [
          { biomarkerCode: "fasting_glucose", deviceCode: "NB-SAMPLE-AVA-BA-001", value: 91, context: "default", recordedAt: "2026-03-09T06:35:00Z" },
          { biomarkerCode: "cortisol", deviceCode: "NB-SAMPLE-AVA-BA-001", value: 15.2, context: "AM", recordedAt: "2026-03-09T07:10:00Z" },
          { biomarkerCode: "spo2", deviceCode: "NB-SAMPLE-AVA-SP-001", value: 98, context: "default", recordedAt: "2026-03-09T07:14:00Z" },
          { biomarkerCode: "vitamin_d", deviceCode: "NB-SAMPLE-AVA-BA-001", value: 34, context: "default", recordedAt: "2026-03-09T08:00:00Z" },
          { biomarkerCode: "crp", deviceCode: "NB-SAMPLE-AVA-BA-001", value: 1.2, context: "default", recordedAt: "2026-03-09T08:20:00Z" },
        ],
        exportRequest: {
          requesterType: "user",
          formats: ["pdf", "csv"],
          dateRangeStart: "2026-03-01T00:00:00Z",
          dateRangeEnd: "2026-03-09T23:59:59Z",
        },
        idfwScenarios: [
          {
            kind: "physical",
            physicalSymptoms: [
              {
                bodyLocationName: "Shoulders",
                sensationTypeName: "pain",
                intensity: 5,
                selectedReasonName: "Muscle strain",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "liam",
    email: "sample.liam.diabetes@nanobot.local",
    password: SAMPLE_PASSWORD,
    accountType: "individual",
    subscription: {
      planName: "Diabetes Care",
      status: "active",
      startedAt: "2026-03-02T10:00:00Z",
      currentPeriodEnd: "2026-04-02T10:00:00Z",
    },
    profiles: [
      {
        key: "liam-main",
        displayName: "Liam Ortiz",
        dateOfBirth: "1984-09-03",
        biologicalSex: "male",
        heightCm: 180.3,
        weightKg: 88.6,
        devices: [
          { code: "NB-SAMPLE-LIAM-BA-001", typeName: "Blood Analyzer", firmwareVersion: "1.4.0" },
        ],
        readings: [
          { biomarkerCode: "fasting_glucose", deviceCode: "NB-SAMPLE-LIAM-BA-001", value: 136, context: "default", recordedAt: "2026-03-09T06:20:00Z" },
          { biomarkerCode: "postprandial_glucose", deviceCode: "NB-SAMPLE-LIAM-BA-001", value: 194, context: "default", recordedAt: "2026-03-09T12:40:00Z" },
          { biomarkerCode: "fasting_insulin", deviceCode: "NB-SAMPLE-LIAM-BA-001", value: 18.5, context: "default", recordedAt: "2026-03-09T06:22:00Z" },
          { biomarkerCode: "hemoglobin_a1c", deviceCode: "NB-SAMPLE-LIAM-BA-001", value: 7.1, context: "default", recordedAt: "2026-03-09T06:24:00Z" },
          { biomarkerCode: "cortisol", deviceCode: "NB-SAMPLE-LIAM-BA-001", value: 12.8, context: "AM", recordedAt: "2026-03-09T07:05:00Z" },
        ],
        profileReferenceRanges: [
          { biomarkerCode: "fasting_glucose", context: "default", rangeLow: 82, rangeHigh: 118, sampleSize: 48, effectiveFrom: "2026-03-05T09:00:00Z" },
        ],
        question: {
          biomarkerCode: "postprandial_glucose",
          note: "Post-lunch walk caused the spike.",
        },
      },
    ],
    unboundDevices: [
      { code: "NB-SAMPLE-LIAM-HT-001", typeName: "Hormone Tracker", firmwareVersion: "1.0.0" },
    ],
  },
  {
    key: "household",
    email: "sample.household.parent@nanobot.local",
    password: SAMPLE_PASSWORD,
    accountType: "parent",
    subscription: {
      planName: "Comprehensive",
      status: "active",
      startedAt: "2026-03-03T12:00:00Z",
      currentPeriodEnd: "2026-04-03T12:00:00Z",
    },
    profiles: [
      {
        key: "noah-child",
        displayName: "Noah Kim",
        dateOfBirth: "2017-06-21",
        biologicalSex: "male",
        heightCm: 123.1,
        weightKg: 24.7,
        devices: [
          { code: "NB-SAMPLE-NOAH-BA-001", typeName: "Blood Analyzer", firmwareVersion: "1.3.7" },
          { code: "NB-SAMPLE-NOAH-SP-001", typeName: "SpO2 Monitor", firmwareVersion: "2.0.0" },
        ],
        readings: [
          { biomarkerCode: "spo2", deviceCode: "NB-SAMPLE-NOAH-SP-001", value: 99, context: "default", recordedAt: "2026-03-09T08:10:00Z" },
          { biomarkerCode: "hemoglobin", deviceCode: "NB-SAMPLE-NOAH-BA-001", value: 13.1, context: "default", recordedAt: "2026-03-09T08:20:00Z" },
        ],
      },
      {
        key: "grace-senior",
        displayName: "Grace Kim",
        dateOfBirth: "1951-01-30",
        biologicalSex: "female",
        heightCm: 160.4,
        weightKg: 68.1,
        devices: [
          { code: "NB-SAMPLE-GRACE-BA-001", typeName: "Blood Analyzer", firmwareVersion: "1.4.1" },
          { code: "NB-SAMPLE-GRACE-SP-001", typeName: "SpO2 Monitor", firmwareVersion: "2.0.0" },
        ],
        readings: [
          { biomarkerCode: "platelet_count", deviceCode: "NB-SAMPLE-GRACE-BA-001", value: 214, context: "default", recordedAt: "2026-03-09T09:10:00Z" },
          { biomarkerCode: "d_dimer", deviceCode: "NB-SAMPLE-GRACE-BA-001", value: 0.31, context: "default", recordedAt: "2026-03-09T09:12:00Z" },
          { biomarkerCode: "spo2", deviceCode: "NB-SAMPLE-GRACE-SP-001", value: 97, context: "default", recordedAt: "2026-03-09T09:15:00Z" },
        ],
      },
    ],
  },
  {
    key: "sofia",
    email: "sample.sofia.womens@nanobot.local",
    password: SAMPLE_PASSWORD,
    accountType: "individual",
    subscription: {
      planName: "Women's Health",
      status: "active",
      startedAt: "2026-03-04T08:00:00Z",
      currentPeriodEnd: "2026-04-04T08:00:00Z",
    },
    profiles: [
      {
        key: "sofia-main",
        displayName: "Sofia Park",
        dateOfBirth: "1990-11-08",
        biologicalSex: "female",
        heightCm: 165.8,
        weightKg: 58.4,
        devices: [
          { code: "NB-SAMPLE-SOFIA-BA-001", typeName: "Blood Analyzer", firmwareVersion: "1.4.3" },
          { code: "NB-SAMPLE-SOFIA-HT-001", typeName: "Hormone Tracker", firmwareVersion: "1.1.0" },
        ],
        readings: [
          { biomarkerCode: "estradiol", deviceCode: "NB-SAMPLE-SOFIA-HT-001", value: 118, context: "follicular_early", recordedAt: "2026-03-09T10:00:00Z" },
          { biomarkerCode: "progesterone", deviceCode: "NB-SAMPLE-SOFIA-HT-001", value: 1.7, context: "follicular_early", recordedAt: "2026-03-09T10:02:00Z" },
          { biomarkerCode: "testosterone", deviceCode: "NB-SAMPLE-SOFIA-HT-001", value: 32, context: "default", recordedAt: "2026-03-09T10:04:00Z" },
          { biomarkerCode: "cortisol", deviceCode: "NB-SAMPLE-SOFIA-BA-001", value: 6.8, context: "PM", recordedAt: "2026-03-09T18:10:00Z" },
        ],
        profileReferenceRanges: [
          { biomarkerCode: "estradiol", context: "follicular_early", rangeLow: 35, rangeHigh: 142, sampleSize: 12, effectiveFrom: "2026-03-01T12:00:00Z" },
        ],
        idfwScenarios: [
          {
            kind: "mental",
            mentalSymptom: {
              stressLevel: 7,
              clarityLevel: 4,
              selectedReasonName: "Work stress",
            },
          },
          {
            kind: "combined",
            physicalSymptoms: [
              {
                bodyLocationName: "Lower Abdomen",
                sensationTypeName: "pain",
                intensity: 6,
                selectedReasonName: "Menstrual discomfort",
              },
            ],
            mentalSymptom: {
              stressLevel: 5,
              clarityLevel: 5,
              selectedReasonName: "Lack of sleep",
            },
          },
        ],
      },
    ],
  },
];

export const EXPECTED_TIME_FOCUS = [
  {
    accountKey: "ava",
    profileKey: "ava-main",
    atTime: "2026-03-09T07:30:00Z",
    biomarkerCode: "cortisol",
  },
  {
    accountKey: "liam",
    profileKey: "liam-main",
    atTime: "2026-03-09T14:00:00Z",
    biomarkerCode: "fasting_glucose",
  },
];
