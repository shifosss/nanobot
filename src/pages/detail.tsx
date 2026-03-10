import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { BiomarkerItem, CategoryData, CorrectionPromptData } from "@/data/demo-health-ui";
import { CorrectionOverlay } from "@/components/correction-overlay";
import { MetricTrendChart } from "@/components/metric-trend-chart";
import { useHealthData, type TimePeriod } from "@/hooks/use-health-data";
import { computeHealthStatus, statusToColor } from "@/lib/health-engine";

const TIME_PERIODS: TimePeriod[] = ["Now", "D", "W", "M", "6M", "Y"];

const CARD_SHADOW = "0px 4px 8px 0px rgba(144,127,160,0.1)";

/* ---- Icons ---- */

function BackChevron() {
  return (
    <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
      <path d="M9 1L1 9l8 8" stroke="#403834" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CheckShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 2.5L4 6.5v7c0 6.08 4.27 11.77 10 13 5.73-1.23 10-6.92 10-13v-7L14 2.5z" fill="#8ebe09" fillOpacity="0.15" stroke="#8ebe09" strokeWidth="1.5" />
      <path d="M10 14l3 3 5-6" stroke="#8ebe09" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 1v11M3 4.5L6.5 1 10 4.5" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3AABD2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3AABD2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

/* ---- Sub-Components ---- */

function CategoryPill({
  category,
  isActive,
  onClick,
}: {
  category: CategoryData;
  isActive: boolean;
  onClick: () => void;
}) {
  // Determine border color from category health status
  const catStatus = category.summary.status;
  const { color: statusColor } = statusToColor(catStatus);
  const borderColor = isActive ? "transparent" : statusColor;

  return (
    <button type="button" onClick={onClick} className="relative shrink-0">
      {category.hasAlert && (
        <div className="absolute -top-0.5 right-0 z-10 flex size-[22px] items-center justify-center rounded-full bg-nano-error">
          <span className="text-[11px] font-bold text-white">!</span>
        </div>
      )}
      <div
        className={`mt-[6px] flex h-[75px] w-[64px] flex-col items-center justify-center rounded-[60px] ${
          isActive ? "bg-[#3acfd2] text-white" : ""
        }`}
        style={isActive ? undefined : { border: `1px solid ${borderColor}`, color: statusColor }}
      >
        <div className="flex w-[56px] flex-col items-center gap-[2px]">
          <HeartIcon />
          <span className="whitespace-pre-line text-center text-[11px] font-semibold leading-[13px] tracking-[0.06px]">
            {category.name}
          </span>
        </div>
      </div>
    </button>
  );
}

/** Biomarker stats header — matches Figma node 101:647 layout. */
function BiomarkerStats({ biomarker }: { biomarker: BiomarkerItem }) {
  const status = computeHealthStatus(biomarker.average, biomarker.rangeLow, biomarker.rangeHigh);
  const { color: valueColor } = statusToColor(status);

  return (
    <div className="w-[167px]">
      {/* Biomarker name — displayed at top per Figma */}
      <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-nano-black">
        {biomarker.name}
      </p>
      <p className="text-[12px] font-medium leading-[16px] text-nano-shadow">Average</p>
      <div className="flex items-end gap-[4px]">
        <span
          className="text-[28px] leading-[34px] tracking-[0.38px]"
          style={{ color: valueColor }}
        >
          {biomarker.average}
        </span>
        <div className="flex flex-col items-start justify-center">
          <span className="text-[11px] font-semibold leading-[13px] tracking-[0.06px] text-nano-shadow">
            {biomarker.unit}
          </span>
          <div className="h-[4px] w-[44px]" />
        </div>
      </div>
      <p className="text-nano-shadow">
        <span className="text-[13px] font-semibold leading-[18px] tracking-[-0.08px]">
          {biomarker.rangeLow}{" "}
        </span>
        <span className="text-[11px] leading-[13px] tracking-[0.06px]">{biomarker.unit}</span>
        <span className="text-[12px] font-medium leading-[16px]">
          {" "}- {biomarker.rangeHigh}{" "}
        </span>
        <span className="text-[11px] leading-[13px] tracking-[0.06px]">{biomarker.unit}</span>
      </p>
      <p className="text-[13px] font-semibold leading-[18px] tracking-[-0.08px] text-nano-black">
        {biomarker.dateRange}
      </p>
    </div>
  );
}

function StatusCard({ title, message }: { title: string; message: string }) {
  return (
    <div
      className="flex w-full items-center gap-[16px] rounded-[16px] border-[0.612px] border-nano-border bg-white p-[16px]"
      style={{ boxShadow: CARD_SHADOW }}
    >
      <div className="w-[40px] shrink-0">
        <CheckShieldIcon />
      </div>
      <div className="flex-1">
        <p className="text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-nano-heading">
          {title}
        </p>
        <p className="whitespace-pre-line text-[12px] leading-[16px] text-nano-sub-text">
          {message}
        </p>
      </div>
    </div>
  );
}

function UnusualCard({
  prompt,
  onClick,
}: {
  prompt: CorrectionPromptData;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[345px] items-center justify-between rounded-[16px] border-[0.612px] border-[#feb300] bg-[rgba(255,191,103,0.08)] p-[16px] text-left"
    >
      <div className="w-[222px]">
        <p className="text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-[#F27240]">
          Something unusual
        </p>
        <p className="text-[12px] leading-[16px] text-nano-sub-text">
          {prompt.question}
        </p>
        <div className="mt-2 inline-flex h-[28px] items-center justify-center rounded-[50px] border border-[rgba(38,38,38,0.1)] bg-[#F27240] px-[16px]">
          <span className="text-[15px] leading-[20px] tracking-[-0.23px] text-white">
            Check it now
          </span>
        </div>
      </div>
      <div className="flex h-[100px] w-[79px] shrink-0 items-center justify-center rounded-lg bg-nano-muted">
        <span className="text-[17px] font-semibold tracking-[-0.43px] text-black/30">img</span>
      </div>
    </button>
  );
}

function ActionRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex h-[46px] w-full items-center justify-between px-[16px]"
    >
      <div className="flex items-center gap-[12px]">
        <div className="flex size-[40px] shrink-0 items-center justify-center rounded-full">
          {icon}
        </div>
        <span className="text-[17px] leading-[22px] tracking-[-0.43px] text-nano-heading">
          {label}
        </span>
      </div>
      <div className="shrink-0">
        <ChevronRightIcon />
      </div>
    </button>
  );
}

/* ---- Main Page ---- */

export function DetailPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const [pillsVisible, setPillsVisible] = useState(true);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const { loading, categories, period, setPeriod } = useHealthData();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function onScroll() {
      const y = el!.scrollTop;
      const delta = y - lastScrollY.current;

      if (y > 120) {
        if (delta > 5) setPillsVisible(false);
        else if (delta < -5) setPillsVisible(true);
      } else {
        setPillsVisible(true);
      }

      lastScrollY.current = y;
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (loading || categories.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white" style={{ colorScheme: "light" }}>
        <p className="text-lg text-nano-shadow">Loading...</p>
      </div>
    );
  }

  const activeData = categories[activeCategory];
  const selectedCategoryName = activeData?.fullName ?? "Biomarker Group";

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 overflow-y-auto bg-white"
      style={{ colorScheme: "light" }}
    >
      <div className="mx-auto max-w-[393px] font-sf">
        {/* ---- Sticky Zone ---- */}
        <div className="sticky top-0 z-20">
          {/* Header */}
          <header className="flex flex-col gap-[16px] overflow-clip bg-white pt-[26px] px-[24px] pb-[12px]">
            <div className="h-[28px] w-[340px] shrink-0" />
            <div className="flex w-[345px] items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-[22px] w-[24px] items-center justify-center"
              >
                <BackChevron />
              </button>
              <p className="text-[20px] font-semibold leading-[25px] tracking-[-0.45px] text-black">
                Detail
              </p>
              <div className="h-[22px] w-[24px]" />
            </div>
          </header>

          {/* Category pills */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              pillsVisible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="overflow-x-auto bg-white px-[16px] py-[6px] scrollbar-none">
                <div className="flex items-center px-[4px]" style={{ width: "max-content" }}>
                  {categories.map((cat, i) => (
                    <CategoryPill
                      key={cat.id}
                      category={cat}
                      isActive={activeCategory === i}
                      onClick={() => setActiveCategory(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Group header + time filter */}
          <div className="flex flex-col gap-[16px] bg-nano-surface px-[24px] py-[16px]">
            <p className="w-[345px] text-center text-[20px] font-semibold leading-[25px] tracking-[-0.45px] text-black">
              {selectedCategoryName}
            </p>
            <div className="flex w-[345px] items-center gap-[14px]">
              {/* Time filter — flex-based centering */}
              <div className="relative inline-grid">
                <div
                  className="col-start-1 row-start-1 h-[22px] w-[308px] rounded-[16px] border border-nano-line bg-white"
                  style={{ boxShadow: CARD_SHADOW }}
                />
                <div className="col-start-1 row-start-1 flex h-[22px] w-[308px] items-center">
                  {TIME_PERIODS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`relative flex h-full flex-1 items-center justify-center text-[15px] font-semibold leading-[20px] tracking-[-0.23px] ${
                        period === p ? "text-white" : "text-nano-black"
                      }`}
                    >
                      {period === p && (
                        <div className="absolute inset-y-0 left-1/2 w-[32px] -translate-x-1/2 rounded-[16px] bg-nano-teal" />
                      )}
                      <span className="relative">{p}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="flex size-[22px] shrink-0 items-center justify-center"
              >
                <SortIcon />
              </button>
            </div>
          </div>
        </div>

        {/* ---- Content ---- */}
        <div className="flex flex-col gap-[16px] bg-nano-surface pt-[24px] px-[24px] pb-[200px]">
          {activeData.biomarkers.map((biomarker, index) => (
            <div key={biomarker.id} className="flex flex-col gap-[16px]">
              <BiomarkerStats biomarker={biomarker} />
              <MetricTrendChart
                values={biomarker.series}
                labels={biomarker.chartLabels}
                rangeLow={biomarker.rangeLow}
                rangeHigh={biomarker.rangeHigh}
                color={biomarker.chartColor}
              />
              <StatusCard
                title={biomarker.statusTitle}
                message={biomarker.statusMessage}
              />
              {index === 0 && activeData.hasUnusualAlert && activeData.unusualPrompt && !alertDismissed && (
                <UnusualCard prompt={activeData.unusualPrompt} onClick={() => setCorrectionOpen(true)} />
              )}
            </div>
          ))}

          {/* Divider */}
          <div className="h-px w-[345px] bg-[#cfcfcf]" />

          {/* About Section */}
          <div className="flex w-full flex-col gap-[8px]">
            <h2 className="text-[22px] font-bold leading-[28px] tracking-[-0.26px] text-nano-heading">
              About {selectedCategoryName}
            </h2>
            <div
              className="flex w-full flex-col gap-[16px] rounded-[16px] border border-nano-line bg-white p-[24px]"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <p className="w-[285px] text-[15px] leading-[20px] tracking-[-0.23px] text-nano-sub-text">
                {activeData.aboutDescription}
              </p>
              <div className="border-t border-[#cfcfcf] pt-[12px]">
                <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-nano-heading">
                  Learn More
                </p>
                <button
                  type="button"
                  className="mt-[12px] text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-nano-pink"
                >
                  Read health article &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="flex w-full flex-col gap-[8px]">
            <h2 className="text-[22px] font-bold leading-[28px] tracking-[-0.26px] text-nano-heading">
              Action
            </h2>
            <div
              className="flex w-[345px] flex-col gap-[4px] rounded-[16px] border border-nano-line bg-white py-[8px]"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <ActionRow icon={<GearIcon />} label="Data Log In" />
              <div className="h-px w-full bg-nano-divider" />
              <ActionRow icon={<BellIcon />} label="Share" />
            </div>
          </div>
        </div>
      </div>

      {/* ---- Bottom Navigation ---- */}
      <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-[98px]">
        <div className="relative h-[61px] w-[167px] overflow-clip rounded-[34px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
          <div className="absolute left-[75px] top-[3.67px] h-[54px] w-[86px] rounded-[27px] bg-nano-muted" />
          <Link
            to="/"
            className="absolute left-[17px] top-1/2 flex -translate-y-1/2 flex-col items-center gap-[3px] text-black"
          >
            <HomeIcon />
            <span className="text-[12px] font-medium leading-[16px]">Home</span>
          </Link>
          <div className="absolute left-[86px] top-[9px] flex w-[66px] flex-col items-center gap-[3px] text-black">
            <ChartIcon />
            <span className="text-[12px] font-medium leading-[16px]">Detail</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/idfw")}
          className="flex size-[76px] items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-teal-400 shadow-lg"
        >
          <span className="text-[12px] font-medium text-black">IDFW</span>
        </button>
      </nav>

      {/* ---- Correction Overlay ---- */}
      {correctionOpen && (
        <CorrectionOverlay
          prompt={activeData.unusualPrompt}
          onClose={() => setCorrectionOpen(false)}
          onDismiss={() => {
            setCorrectionOpen(false);
            setAlertDismissed(true);
          }}
        />
      )}
    </div>
  );
}
