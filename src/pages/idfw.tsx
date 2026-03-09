import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ============ Types ============ */

type SymptomType = "mental" | "physical" | "unknown";

interface IdfwState {
  type: SymptomType;
  bodyAreas: string[];
  intensity: { x: number; y: number };
  symptoms: string[];
}

/* ============ Constants ============ */

const GRADIENT_FULL =
  "linear-gradient(180deg, #DD3070 0%, #F17500 25.48%, #E3BC4F 77.89%, #C0DBFF 100%)";

const GRADIENT_ORANGE =
  "linear-gradient(180deg, #DB6E15 0%, #FCD76F 31.25%, #F1F1F7 47.12%)";

const BODY_REGIONS = [
  { id: "head", label: "Head", top: "4%", left: "34%", w: "32%", h: "16%" },
  { id: "neck", label: "Neck", top: "19%", left: "39%", w: "22%", h: "5%" },
  { id: "chest", label: "Chest", top: "24%", left: "28%", w: "44%", h: "14%" },
  { id: "stomach", label: "Stomach", top: "38%", left: "31%", w: "38%", h: "12%" },
  { id: "left-arm", label: "L. Arm", top: "22%", left: "8%", w: "20%", h: "28%" },
  { id: "right-arm", label: "R. Arm", top: "22%", left: "72%", w: "20%", h: "28%" },
  { id: "left-leg", label: "L. Leg", top: "52%", left: "24%", w: "24%", h: "44%" },
  { id: "right-leg", label: "R. Leg", top: "52%", left: "52%", w: "24%", h: "44%" },
];

const SYMPTOM_OPTIONS = [
  "Headache",
  "Fever",
  "Fatigue",
  "Dizziness",
  "Nausea",
  "Chest Pain",
  "Back Pain",
  "Insomnia",
  "Anxiety",
  "Brain Fog",
];

const MOCK_RESULTS = [
  {
    label: "Pain at forehead",
    status: "Safe",
    color: "text-nano-green",
    desc: "Your headache may cause by dehydration",
    biomarkers: [
      { name: "Biomarker 1", detail: "Lower than you average", fill: 60 },
      { name: "Biomarker 2", detail: "Lower than you average", fill: 45 },
    ],
  },
  {
    label: "Pain at nose",
    status: "Concern",
    color: "text-nano-primary",
    desc: "Your pain may cause by dehydration",
    biomarkers: [
      { name: "Biomarker 1", detail: "Lower than you average", fill: 60 },
      { name: "Biomarker 2", detail: "Lower than you average", fill: 45 },
    ],
  },
  {
    label: "Pain at nose",
    status: "Safe",
    color: "text-nano-green",
    desc: "Your pain may cause by dehydration",
    biomarkers: [
      { name: "Biomarker 1", detail: "Lower than you average", fill: 60 },
      { name: "Biomarker 2", detail: "Lower than you average", fill: 45 },
    ],
  },
];

/* ============ Shared Components ============ */

function BackHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 pb-3 pt-14">
      <button
        type="button"
        onClick={onBack}
        className="flex size-6 items-center justify-center"
      >
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
          <path
            d="M9 1L1 9l8 8"
            stroke="#403834"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <p className="text-[20px] font-semibold leading-[25px] tracking-[-0.45px] text-black">
        {title}
      </p>
      <div className="size-6" />
    </div>
  );
}

/* ============ Step 1: Intro ============ */

function StepIntro({
  onSelect,
  onClose,
}: {
  onSelect: (type: SymptomType) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex flex-col font-sf text-white"
      style={{ background: GRADIENT_FULL }}
    >
      <div className="relative mx-auto w-full max-w-[393px] flex-1 overflow-hidden">
        {/* Close button */}
        <div className="absolute left-6 top-[59px] z-10">
          <button
            type="button"
            onClick={onClose}
            className="text-[28px] leading-[34px] tracking-[0.38px] text-nano-black"
          >
            &#x2715;
          </button>
        </div>

        {/* Title */}
        <h1 className="absolute left-7 top-[119px] text-[48px] font-bold leading-[54px] tracking-[0.4px]">
          You Don&rsquo;t
          <br />
          Feel Well?
        </h1>

        {/* White rotated square decoration */}
        <div className="absolute left-[133px] top-[163px] flex size-[427px] items-center justify-center">
          <div className="size-[327px] -rotate-[22.47deg] bg-white/80 backdrop-blur-sm" />
        </div>

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 px-7 pb-14">
          <h2 className="text-[34px] font-bold leading-[41px] tracking-[0.4px]">
            Where don&rsquo;t
            <br />
            you feel well?
          </h2>
          <p className="mt-3 w-[258px] text-[15px] leading-[20px] tracking-[-0.23px]">
            Select the type of symptoms you&rsquo;re experiencing
          </p>

          {/* Type buttons */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onSelect("mental")}
              className="flex h-[45px] w-[157px] items-center justify-center gap-2 rounded-[14px] border border-nano-line bg-white"
            >
              <span className="text-[20px]">&#x1F9E0;</span>
              <span className="text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-nano-black">
                Mentally
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSelect("physical")}
              className="flex h-[45px] w-[157px] items-center justify-center gap-2 rounded-[14px] border border-nano-line bg-white"
            >
              <span className="text-[20px]">&#x1F4AA;</span>
              <span className="text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-nano-black">
                Physically
              </span>
            </button>
          </div>

          {/* "I don't know" link */}
          <button
            type="button"
            onClick={() => onSelect("unknown")}
            className="mt-4 w-full text-center text-[17px] leading-[22px] tracking-[-0.43px] text-white"
          >
            I don&rsquo;t know
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Step 2: Body Map ============ */

function StepBodyMap({
  bodyAreas,
  onToggleArea,
  onNext,
  onBack,
}: {
  bodyAreas: string[];
  onToggleArea: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex flex-col font-sf"
      style={{ background: GRADIENT_ORANGE }}
    >
      <div className="mx-auto flex w-full max-w-[393px] flex-1 flex-col">
        <BackHeader title="Where do you feel it?" onBack={onBack} />

        {/* Body figure + clickable regions */}
        <div className="flex flex-1 flex-col items-center px-6">
          <div className="relative mx-auto mt-4 h-[410px] w-[280px]">
            {/* Body emoji placeholder */}
            <div className="flex h-full w-full select-none items-center justify-center text-[280px] leading-none opacity-80">
              &#x1F9CD;
            </div>

            {/* Clickable overlay regions */}
            {BODY_REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onToggleArea(r.id)}
                className={`absolute rounded-full border-2 transition-colors ${
                  bodyAreas.includes(r.id)
                    ? "border-nano-orange bg-nano-orange/40"
                    : "border-transparent hover:bg-white/20"
                }`}
                style={{
                  top: r.top,
                  left: r.left,
                  width: r.w,
                  height: r.h,
                }}
                title={r.label}
              />
            ))}
          </div>

          <p className="mt-4 text-center text-[17px] leading-[22px] tracking-[-0.43px] text-nano-black">
            Click on the area(s) where you feel the pain
          </p>
        </div>

        {/* Bottom buttons */}
        <div className="flex flex-col items-center gap-3 pb-10">
          <button
            type="button"
            onClick={onNext}
            className="h-12 w-[335px] rounded-2xl bg-[#F27240] text-[17px] font-semibold text-white"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-[17px] tracking-[-0.43px] text-[#F27240]"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Step 3: Intensity Grid ============ */

function StepIntensity({
  intensity,
  onChangeIntensity,
  onNext,
  onBack,
}: {
  intensity: { x: number; y: number };
  onChangeIntensity: (pos: { x: number; y: number }) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      const y = Math.max(
        0,
        Math.min(1, 1 - (clientY - rect.top) / rect.height),
      );
      onChangeIntensity({ x, y });
    },
    [onChangeIntensity],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      updateFromPointer(e.clientX, e.clientY);
    },
    [dragging, updateFromPointer],
  );

  const handlePointerUp = useCallback(() => setDragging(false), []);

  const dotLeft = `${intensity.x * 100}%`;
  const dotTop = `${(1 - intensity.y) * 100}%`;

  return (
    <div
      className="fixed inset-0 flex flex-col font-sf"
      style={{ background: GRADIENT_ORANGE }}
    >
      <div className="mx-auto flex w-full max-w-[393px] flex-1 flex-col">
        <BackHeader title="How are you feeling?" onBack={onBack} />

        {/* Face emoji */}
        <div className="flex justify-center py-4">
          <span className="select-none text-[120px] leading-none">
            &#x1F610;
          </span>
        </div>

        {/* Gradient fade to gray */}
        <div className="h-8 bg-gradient-to-b from-transparent to-nano-surface" />

        {/* Intensity grid */}
        <div className="flex flex-1 flex-col items-center bg-nano-surface px-6">
          <div className="relative">
            <p className="mb-2 text-center text-[13px] font-medium text-nano-sub-text">
              High intensity
            </p>

            <div className="flex items-center gap-2">
              <p className="w-8 text-right text-[13px] font-medium text-nano-sub-text">
                Itch
              </p>

              {/* 2D grid */}
              <div
                ref={gridRef}
                className="relative size-[284px] touch-none cursor-pointer bg-nano-muted"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {/* Cross-hair lines */}
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/60" />
                <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/60" />

                {/* Draggable orange dot */}
                <div
                  className="pointer-events-none absolute size-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nano-orange shadow-lg"
                  style={{ left: dotLeft, top: dotTop }}
                />
              </div>

              <p className="w-8 text-[13px] font-medium text-nano-sub-text">
                Pain
              </p>
            </div>

            <p className="mt-2 text-center text-[13px] font-medium text-nano-sub-text">
              Low intensity
            </p>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex flex-col items-center gap-3 bg-nano-surface pb-10">
          <button
            type="button"
            onClick={onNext}
            className="h-12 w-[335px] rounded-2xl bg-[#F27240] text-[17px] font-semibold text-white"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-[17px] tracking-[-0.43px] text-[#F27240]"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Step 4: Symptoms ============ */

function StepSymptoms({
  type,
  intensity,
  symptoms,
  onToggleSymptom,
  onNext,
  onSkip,
  onBack,
}: {
  type: SymptomType;
  intensity: { x: number; y: number };
  symptoms: string[];
  onToggleSymptom: (s: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const intensityLabel =
    intensity.y > 0.5 ? "High intensity" : "Low intensity";
  const painLabel = intensity.x > 0.5 ? "Pain" : "Itch";
  const isPhysicalPath = type === "physical";

  return (
    <div
      className="fixed inset-0 flex flex-col font-sf"
      style={{ background: GRADIENT_ORANGE }}
    >
      <div className="mx-auto flex w-full max-w-[393px] flex-1 flex-col">
        <BackHeader title="How are you feeling?" onBack={onBack} />

        {/* Face emoji */}
        <div className="flex justify-center py-4">
          <span className="select-none text-[120px] leading-none">
            &#x1F610;
          </span>
        </div>

        {/* Gradient fade */}
        <div className="h-8 bg-gradient-to-b from-transparent to-nano-surface" />

        {/* Content */}
        <div className="flex flex-1 flex-col bg-nano-surface px-6">
          {/* Intensity summary (physical path only) */}
          {isPhysicalPath && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-nano-black">
                {intensityLabel} and {painLabel}
              </p>
              {/* Mini quadrant thumbnail */}
              <div className="relative size-[96px] rounded-lg bg-nano-muted">
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/60" />
                <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/60" />
                <div
                  className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nano-orange"
                  style={{
                    left: `${intensity.x * 100}%`,
                    top: `${(1 - intensity.y) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Symptom chips */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="flex size-[34px] items-center justify-center rounded-2xl border border-nano-new-white bg-white text-nano-black"
            >
              +
            </button>
            {SYMPTOM_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onToggleSymptom(s)}
                className={`h-[34px] rounded-2xl border px-4 text-[15px] leading-[20px] tracking-[-0.23px] transition-colors ${
                  symptoms.includes(s)
                    ? "border-nano-teal bg-nano-teal text-white"
                    : "border-nano-new-white bg-white text-nano-black"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex flex-col items-center gap-3 bg-nano-surface pb-10">
          <button
            type="button"
            onClick={onNext}
            className="h-[45px] w-[328px] rounded-[36px] border border-nano-line bg-white text-[17px] font-semibold text-nano-black"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="text-[17px] tracking-[-0.43px] text-nano-black"
          >
            I don&rsquo;t know, skip
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Step 5: Analyzing ============ */

function StepAnalyzing({ onDone }: { onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current(), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center font-sf text-white"
      style={{ background: GRADIENT_FULL }}
    >
      <div className="mx-auto flex max-w-[393px] flex-col items-center gap-6 px-6">
        {/* Loading placeholder */}
        <div className="size-[177px] rounded-2xl bg-white/20" />
        <h2 className="text-[34px] font-bold leading-[41px] tracking-[0.4px]">
          Analyzing...
        </h2>
        <p className="text-center text-[17px] leading-[22px] tracking-[-0.43px]">
          We are finding your pain in your body
        </p>
      </div>
    </div>
  );
}

/* ============ Step 6: Results ============ */

function StepResults({ onComplete }: { onComplete: () => void }) {
  return (
    <div
      className="fixed inset-0 overflow-y-auto font-sf"
      style={{ colorScheme: "light" }}
    >
      <div className="mx-auto max-w-[393px]">
        {/* Gradient header */}
        <div
          className="relative h-[296px]"
          style={{ background: GRADIENT_FULL }}
        >
          <button
            type="button"
            onClick={onComplete}
            className="absolute right-6 top-[35px] text-[28px] leading-[34px] tracking-[0.38px] text-nano-black"
          >
            &#x2715;
          </button>
          <h2 className="absolute left-9 top-[90px] text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">
            Result
          </h2>
          {/* Illustration placeholder */}
          <div className="absolute right-8 top-[90px] size-[112px] bg-nano-muted" />
        </div>

        {/* White card */}
        <div className="relative z-10 -mt-[144px] mx-4 flex flex-col gap-6 rounded-t-[36px] bg-white px-5 pb-32 pt-8">
          {MOCK_RESULTS.map((result, i) => (
            <div key={i} className="flex flex-col gap-4">
              {/* Label pill */}
              <div className="inline-flex">
                <span className="rounded-2xl bg-nano-muted px-4 py-0.5 font-inter text-[16px] font-semibold tracking-[-0.31px] text-nano-black">
                  {result.label}
                </span>
              </div>

              {/* Status */}
              <p
                className={`text-[34px] font-bold leading-[41px] tracking-[0.4px] ${result.color}`}
              >
                {result.status}
              </p>
              <p className="text-[17px] leading-[22px] tracking-[-0.43px] text-nano-black">
                {result.desc}
              </p>

              {/* Divider */}
              <div className="h-px bg-nano-divider" />

              {/* Biomarker rows with figure */}
              <div className="flex items-center justify-between">
                {/* Figure placeholder */}
                <div className="flex h-[189px] w-[111px] select-none items-center justify-center rounded-lg bg-nano-muted text-[80px]">
                  &#x1F9D1;
                </div>

                <div className="flex w-[200px] flex-col gap-4">
                  {result.biomarkers.map((b, j) => (
                    <div key={j} className="flex flex-col gap-4">
                      <div>
                        <p className="text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-nano-black">
                          {b.name}
                        </p>
                        <p className="text-[17px] leading-[22px] tracking-[-0.43px] text-nano-black">
                          {b.detail}
                        </p>
                      </div>
                      <div className="h-[7px] w-[200px] overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-nano-green"
                          style={{ width: `${b.fill}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Final divider */}
          <div className="h-px bg-nano-divider" />

          {/* Check-in Recorded card */}
          <div className="flex flex-col gap-1 rounded-2xl bg-nano-new-white px-8 py-4">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="9"
                  stroke="#8EBE09"
                  strokeWidth="1.5"
                />
                <path
                  d="M6 10l3 3 5-6"
                  stroke="#8EBE09"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-nano-black">
                Check-in Recorded
              </p>
            </div>
            <p className="text-[15px] leading-[20px] tracking-[-0.23px] text-nano-shadow">
              Your symptom data has been added to your health records.
            </p>
          </div>

          {/* Emergency card */}
          <div className="rounded-2xl bg-nano-new-white p-4">
            <p className="text-center text-[15px] leading-[20px] tracking-[-0.23px] text-[#F27240]">
              <span className="font-bold">Emergency?</span> If you&rsquo;re
              experiencing a medical emergency, call 911 or go to the nearest
              emergency room immediately.
            </p>
          </div>
        </div>

        {/* Fixed bottom bar */}
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-center gap-4 bg-white/80 px-9 py-4 backdrop-blur">
          <button
            type="button"
            onClick={onComplete}
            className="h-[50px] w-[240px] rounded-2xl bg-nano-black font-inter text-[16px] font-semibold text-white"
          >
            Complete
          </button>
          <button
            type="button"
            className="flex size-[50px] items-center justify-center rounded-full bg-nano-black"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Main Page ============ */

export function IdfwPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<IdfwState>({
    type: "physical",
    bodyAreas: [],
    intensity: { x: 0.5, y: 0.5 },
    symptoms: [],
  });

  const goBack = useCallback(() => {
    if (step === 1) {
      navigate(-1);
      return;
    }
    // Mental/unknown path: page 4 back → page 1 (skipping body map & intensity)
    if (step === 4 && state.type !== "physical") {
      setStep(1);
      return;
    }
    setStep((s) => s - 1);
  }, [step, state.type, navigate]);

  const handleSelectType = useCallback((type: SymptomType) => {
    setState((prev) => ({ ...prev, type }));
    setStep(type === "physical" ? 2 : 4);
  }, []);

  const handleToggleArea = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      bodyAreas: prev.bodyAreas.includes(id)
        ? prev.bodyAreas.filter((a) => a !== id)
        : [...prev.bodyAreas, id],
    }));
  }, []);

  const handleChangeIntensity = useCallback(
    (pos: { x: number; y: number }) => {
      setState((prev) => ({ ...prev, intensity: pos }));
    },
    [],
  );

  const handleToggleSymptom = useCallback((s: string) => {
    setState((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(s)
        ? prev.symptoms.filter((x) => x !== s)
        : [...prev.symptoms, s],
    }));
  }, []);

  const handleComplete = useCallback(() => navigate("/"), [navigate]);
  const advanceToAnalyzing = useCallback(() => setStep(5), []);
  const advanceToResults = useCallback(() => setStep(6), []);

  switch (step) {
    case 1:
      return (
        <StepIntro
          onSelect={handleSelectType}
          onClose={() => navigate(-1)}
        />
      );
    case 2:
      return (
        <StepBodyMap
          bodyAreas={state.bodyAreas}
          onToggleArea={handleToggleArea}
          onNext={() => setStep(3)}
          onBack={goBack}
        />
      );
    case 3:
      return (
        <StepIntensity
          intensity={state.intensity}
          onChangeIntensity={handleChangeIntensity}
          onNext={() => setStep(4)}
          onBack={goBack}
        />
      );
    case 4:
      return (
        <StepSymptoms
          type={state.type}
          intensity={state.intensity}
          symptoms={state.symptoms}
          onToggleSymptom={handleToggleSymptom}
          onNext={advanceToAnalyzing}
          onSkip={advanceToAnalyzing}
          onBack={goBack}
        />
      );
    case 5:
      return <StepAnalyzing onDone={advanceToResults} />;
    case 6:
      return <StepResults onComplete={handleComplete} />;
    default:
      return null;
  }
}
