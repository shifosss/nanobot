import { useState } from "react";

interface CorrectionOverlayProps {
  onClose: () => void;
  onDismiss: () => void;
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 1l12 12M13 1L1 13" stroke="#364153" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BackChevron() {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" style={{ transform: "rotate(90deg)" }}>
      <path d="M1 1l8 8 8-8" stroke="#364153" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CorrectionOverlay({ onClose, onDismiss }: CorrectionOverlayProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [answer, setAnswer] = useState<string | null>(null);

  function handleAnswer(response: string) {
    setAnswer(response);
    setStep(2);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />

      {/* Bottom sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-[393px] rounded-t-[36px] bg-nano-surface"
        style={{ colorScheme: "light" }}
      >
        {/* Header */}
        <div className="rounded-t-[36px] border-b border-nano-muted bg-white px-[24px] py-[12px]">
          <div className="flex h-[46px] items-center justify-between">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex size-[24px] items-center justify-center ${step === 1 ? "invisible" : ""}`}
            >
              <BackChevron />
            </button>
            {/* Title */}
            <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-black">
              Correction ({step}/2)
            </p>
            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="flex size-[24px] items-center justify-center"
            >
              <CloseIcon />
            </button>
          </div>
          <p className="text-center text-[12px] font-medium leading-[16px] text-nano-sub-text">
            Unusual peak in Blood Sugar
          </p>
        </div>

        {/* Content */}
        {step === 1 ? <Step1Content onAnswer={handleAnswer} /> : <Step2Content answer={answer} onDismiss={onDismiss} onBack={() => setStep(1)} />}
      </div>
    </>
  );
}

/* ---- Step 1 ---- */

function Step1Content({ onAnswer }: { onAnswer: (response: string) => void }) {
  return (
    <>
      <div className="flex flex-col items-center px-[16px] py-[16px]">
        {/* Content card */}
        <div className="flex w-[361px] flex-col gap-[16px] rounded-[24px] bg-white p-[16px]">
          <div className="flex flex-col gap-[4px]">
            <p className="text-[17px] leading-[22px] tracking-[-0.43px] text-black">
              Your blood sugar <span className="text-nano-error">raised</span> at
            </p>
            <p className="text-[34px] leading-[41px] tracking-[0.4px] text-black">
              03/04, 4:30 am
            </p>
            <p className="text-[20px] font-semibold leading-[25px] tracking-[-0.45px] text-black">
              Did you eat anything at that time?
            </p>
          </div>
          {/* Graph placeholder */}
          <div className="flex h-[163px] w-full items-center justify-center rounded-[16px] bg-nano-muted">
            <span className="text-[17px] font-semibold tracking-[-0.43px] text-black/30">Graph</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-nano-muted bg-white px-[24px] pb-[40px] pt-[16px]">
        <div className="mx-auto flex w-[335px] gap-[13px]">
          <button
            type="button"
            onClick={() => onAnswer("\u{1F97A} Yes, I did eat snack.")}
            className="flex h-[45px] w-[157px] items-center justify-center rounded-[14px] border border-nano-green bg-[rgba(142,190,9,0.28)]"
          >
            <span className="text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-black">
              🍎 Yes, I did
            </span>
          </button>
          <button
            type="button"
            onClick={() => onAnswer("\u{1F634} No, I did not eat anything.")}
            className="flex h-[45px] w-[157px] items-center justify-center rounded-[14px] border border-[#d08700] bg-[rgba(208,135,0,0.2)]"
          >
            <span className="text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-black">
              😴 No, I did not
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => onAnswer("\u{1F914} I don't remember.")}
          className="mt-[12px] w-full text-center text-[17px] leading-[22px] tracking-[-0.43px] text-nano-link"
        >
          Don't remember
        </button>
      </div>
    </>
  );
}

/* ---- Step 2 ---- */

function Step2Content({
  answer,
  onDismiss,
  onBack,
}: {
  answer: string | null;
  onDismiss: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-[12px] px-[16px] py-[16px]">
        {/* Left bubble — question */}
        <div className="w-[262px] rounded-[24px] border border-[rgba(0,0,0,0.07)] bg-white p-[16px]">
          <p className="text-[17px] leading-[22px] tracking-[-0.43px] text-black">
            Your blood sugar <span className="text-nano-error">raised</span> at
          </p>
          <p className="text-[17px] leading-[22px] tracking-[-0.43px] text-black">
            03/04, 4:30 am
          </p>
        </div>

        {/* Right bubble — user answer */}
        <div className="flex justify-end">
          <div className="rounded-[24px] border border-[rgba(0,0,0,0.07)] bg-[#dfedba] p-[16px]">
            <p className="text-[17px] leading-[22px] tracking-[-0.43px] text-black">
              {answer}
            </p>
          </div>
        </div>

        {/* Rose emoji */}
        <p className="text-[34px] leading-[41px]">🌹</p>

        {/* Left bubble — reassurance */}
        <div className="w-[262px] rounded-[24px] border border-[rgba(0,0,0,0.07)] bg-white p-[16px]">
          <p className="text-[17px] leading-[22px] tracking-[-0.43px] text-black">
            No Worry!
          </p>
          <p className="text-[20px] font-semibold leading-[25px] tracking-[-0.45px] text-black">
            Your response proves that the data is correct.{" "}
          </p>
          <p className="text-[17px] leading-[22px] tracking-[-0.43px] text-black">
            Otherwise it'd be a big issue!
          </p>
        </div>

        {/* Caption */}
        <p className="px-[16px] text-[12px] leading-[16px] text-nano-sub-text">
          We've successfully corrected your data.
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-nano-muted bg-white px-[24px] pb-[40px] pt-[16px]">
        <div className="mx-auto flex w-[335px] items-center justify-between">
          {/* Invisible placeholder for layout balance */}
          <span className="w-[66px] text-[15px] font-semibold text-transparent">Back</span>
          {/* Done button */}
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-[45px] w-[173px] items-center justify-center rounded-[14px] border border-nano-link bg-nano-link"
          >
            <span className="text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-white">
              Done
            </span>
          </button>
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="w-[66px] text-center text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-[#364153]"
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
}
