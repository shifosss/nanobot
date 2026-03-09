import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/providers/auth-context";

/* ---- Types & Mock Data ---- */

type HealthStatus = "normal" | "concern" | "alert";

interface StatItem {
  label: string;
  status: HealthStatus;
  statusLabel: string;
  bars: number[];
}

const STATUS_COLOR: Record<HealthStatus, string> = {
  normal: "#3AABD2",
  concern: "#FEB300",
  alert: "#E7000B",
};

const BAR_STYLE: Record<HealthStatus, { fill: string; bg: string }> = {
  normal: { fill: "#3AABD2", bg: "rgba(58,171,210,0.28)" },
  concern: { fill: "#ffbf67", bg: "rgba(255,191,103,0.32)" },
  alert: { fill: "#f98f94", bg: "rgba(249,143,148,0.32)" },
};

const STAT_GRID: (StatItem | "reorder")[] = [
  { label: "Heart Health", status: "normal", statusLabel: "Normal", bars: [24, 10, 15, 24, 18] },
  { label: "Blood Sugar", status: "concern", statusLabel: "Concern", bars: [24, 10, 15, 24, 18] },
  { label: "Blood Cells", status: "alert", statusLabel: "Alert", bars: [24, 10, 15, 24, 18] },
  { label: "Blood Cells", status: "alert", statusLabel: "Alert", bars: [24, 10, 15, 24, 18] },
  { label: "Blood Sugar", status: "concern", statusLabel: "Concern", bars: [24, 10, 15, 24, 18] },
  { label: "Heart Health", status: "normal", statusLabel: "Normal", bars: [24, 10, 15, 24, 18] },
  { label: "Heart Health", status: "normal", statusLabel: "Normal", bars: [24, 10, 15, 24, 18] },
  { label: "Blood Cells", status: "alert", statusLabel: "Alert", bars: [24, 10, 15, 24, 18] },
  { label: "Heart Health", status: "normal", statusLabel: "Normal", bars: [24, 10, 15, 24, 18] },
  { label: "Blood Sugar", status: "concern", statusLabel: "Concern", bars: [24, 10, 15, 24, 18] },
  "reorder",
];

const PRIORITY_STATS = [
  { label: "Cortisol", fill: 60 },
  { label: "Norepinephrine", fill: 45 },
  { label: "Fasting Glucose", fill: 75 },
];

const TIME_PERIODS = ["Now", "D", "W", "M", "6M", "Y"] as const;

/* ---- Helper Components ---- */

function MiniBarChart({ bars, status }: { bars: number[]; status: HealthStatus }) {
  const { fill, bg } = BAR_STYLE[status];
  return (
    <div className="flex w-full items-end gap-0.5">
      {bars.map((h, i) => (
        <div
          key={i}
          className="min-w-0 flex-1 rounded-t"
          style={{ height: h, backgroundColor: i === bars.length - 1 ? fill : bg }}
        />
      ))}
    </div>
  );
}

function StatCard({ item }: { item: StatItem }) {
  const color = STATUS_COLOR[item.status];
  return (
    <div className="flex aspect-square flex-col items-center rounded-2xl border border-nano-border bg-white px-1.5 pt-2.5 pb-2.5">
      <p className="text-xs font-medium text-nano-sub-text">{item.label}</p>
      <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px]" style={{ color }}>
        {item.statusLabel}
      </p>
      <span className="text-[11px] leading-[13px] tracking-[0.06px]" style={{ color }}>
        ↘ 1%
      </span>
      <div className="mt-auto w-[76px]">
        <MiniBarChart bars={item.bars} status={item.status} />
      </div>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[22px] font-bold leading-[28px] tracking-[-0.26px] text-nano-heading">
        {title}
      </h2>
      {action && (
        <button type="button" className="text-xs font-medium text-nano-purple">
          {action}
        </button>
      )}
    </div>
  );
}

/* ---- Main Component ---- */

export function DashboardPage() {
  const { session } = useAuth();
  const [activePeriod, setActivePeriod] = useState<string>("Now");

  const email = session?.user?.email ?? "User";
  const name = email.split("@")[0];

  return (
    <div className="fixed inset-0 overflow-y-auto bg-nano-surface" style={{ colorScheme: "light" }}>
      <div className="mx-auto max-w-[393px] space-y-4 px-6 pt-6 pb-32 font-sf text-nano-text">

        {/* ---- Header ---- */}
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[28px] leading-[34px] tracking-[0.38px]">Good Morning,</p>
            <div className="flex items-center gap-2">
              <p className="text-[28px] font-bold leading-[34px] tracking-[0.38px]">{name}</p>
              <span className="text-[15px] leading-[20px] text-[#99a1af]">▾</span>
            </div>
          </div>
          <Link
            to="/profile"
            className="flex size-10 items-center justify-center rounded-full bg-[#f3e8ff]"
            title="Profile"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </header>

        {/* Spacer */}
        <div className="h-16" />

        {/* ---- Health Status Banner ---- */}
        <section className="space-y-4">
          <div>
            <p className="text-[20px] leading-[25px] tracking-[-0.45px]">Everything is</p>
            <div className="flex items-end gap-2">
              <span className="text-[36px] font-bold leading-[41px] tracking-[0.4px] text-nano-teal">
                Normal
              </span>
              <span className="mb-1.5 text-xs text-[#99a1af]">compared to 3/8</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="w-[258px] text-[17px] leading-[22px] tracking-[-0.43px]">
              <p>You have a healthy morning,</p>
              <p>Remember to eat breakfast soon.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-[9px] rounded-full bg-[#34c759]" />
              <span className="text-xs">12:34 sync</span>
            </div>
          </div>
        </section>

        <div className="h-0.5 bg-nano-divider" />

        {/* ---- Top Priority Stats ---- */}
        <section className="rounded-[7px] bg-white p-4">
          <div className="mb-4 flex items-center gap-1.5">
            <div className="size-[11px] rounded-full bg-[#34c759]" />
            <p className="text-[15px] font-semibold leading-[20px] tracking-[-0.23px]">
              Top priority stats
            </p>
          </div>
          <div className="space-y-4">
            {PRIORITY_STATS.map((stat) => (
              <div key={stat.label} className="space-y-1.5">
                <p className="text-xs font-medium">{stat.label}</p>
                <div className="h-[7px] w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-nano-teal"
                    style={{ width: `${stat.fill}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- New Change? ---- */}
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl border border-nano-border bg-white px-4 py-2.5"
        >
          <div className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="text-left">
              <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-nano-heading">
                New change?
              </p>
              <p className="text-xs text-[#6a7282]">Get new diet?</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#6a7282]">
            <span className="font-inter text-sm tracking-[-0.15px]">Update</span>
            <span className="text-xs font-medium">›</span>
          </div>
        </button>

        {/* ---- Summary ---- */}
        <section className="space-y-2">
          <SectionHeader title="Summary" action="See All" />

          {/* Stat detail card */}
          <div className="flex overflow-hidden rounded-2xl bg-white">
            <div className="m-4 h-[105px] w-[113px] shrink-0 bg-nano-muted" />
            <div className="flex flex-1 flex-col gap-[18px] py-4 pr-4">
              {[1, 2].map((n) => (
                <div key={n} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-nano-pink" />
                      <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px]">
                        Stat {n}
                      </p>
                    </div>
                    <span className="text-xs">123</span>
                  </div>
                  <p className="text-xs">Soft text for suggestion</p>
                </div>
              ))}
            </div>
          </div>

          {/* Time period selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center rounded-2xl bg-white">
              {TIME_PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePeriod(p)}
                  className={`px-3 py-1 text-[15px] font-semibold tracking-[-0.23px] ${
                    activePeriod === p ? "rounded-2xl bg-nano-muted" : ""
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="size-[22px] rounded-full bg-[#e5e7eb]" />
          </div>

          {/* Stat card grid */}
          <div className="grid grid-cols-3 gap-3">
            {STAT_GRID.map((item, i) =>
              item === "reorder" ? (
                <div
                  key={i}
                  className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-nano-border bg-white"
                >
                  <span className="text-[17px] leading-[22px] tracking-[-0.43px]">⊞</span>
                  <span className="text-[11px] tracking-[0.06px] text-nano-sub-text">Reorder</span>
                </div>
              ) : (
                <StatCard key={i} item={item} />
              ),
            )}
          </div>

          <div className="flex justify-center py-2">
            <button type="button" className="text-[15px] tracking-[-0.23px] text-nano-teal">
              see all details
            </button>
          </div>
        </section>

        {/* ---- Trend & Highlight ---- */}
        <section className="space-y-2">
          <SectionHeader title="Trend & Highlight" action="See All" />
          <div className="rounded-2xl bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-[17px] rounded-full bg-nano-pink" />
                <p className="text-[15px] font-semibold tracking-[-0.23px]">Category 1</p>
              </div>
              <span className="text-xs font-medium">›</span>
            </div>
            <p className="mb-3 text-[15px] leading-[20px] tracking-[-0.23px]">
              The time your body feels sleepy is 2 hours later than last 5 weeks.
            </p>
            <div className="mb-3 h-px bg-nano-divider" />

            {/* Chart 1: Melatonin */}
            <div className="mb-3 space-y-2">
              <ul className="text-[13px] tracking-[-0.08px]">
                <li className="ml-5 list-disc">Melatonin was delay 20%</li>
              </ul>
              <p className="text-right text-[11px] tracking-[0.06px] text-[#99a1af]">2 am</p>
              <div className="flex h-[61px] items-center gap-0.5">
                {[47, 61, 29, 47, 47, 47, 19].map((h, i) => (
                  <div
                    key={`m1-${i}`}
                    className="min-w-0 flex-1 rounded-lg"
                    style={{ height: h, backgroundColor: "rgba(58,171,210,0.28)" }}
                  />
                ))}
                {[29, 19, 47, 29, 29, 29, 19].map((h, i) => (
                  <div
                    key={`m2-${i}`}
                    className="min-w-0 flex-1 rounded-lg"
                    style={{ height: h, backgroundColor: "rgba(255,191,103,0.32)" }}
                  />
                ))}
                <div
                  className="min-w-0 flex-1 rounded-lg"
                  style={{ height: 35, backgroundColor: "#ffbf67" }}
                />
              </div>
            </div>

            {/* Chart 2: Cortisol */}
            <div className="space-y-2">
              <ul className="text-[13px] tracking-[-0.08px]">
                <li className="ml-5 list-disc">Cortisol&rsquo;s difference has decreased</li>
              </ul>
              <div className="flex h-[28px] items-end gap-0.5">
                {[28, 12, 28, 12, 17, 28, 28, 12, 17, 28].map((h, i) => (
                  <div
                    key={`c-${i}`}
                    className="min-w-0 flex-1 rounded-t-lg"
                    style={{ height: h, backgroundColor: "rgba(255,191,103,0.32)" }}
                  />
                ))}
                <div
                  className="min-w-0 flex-1 rounded-t-lg"
                  style={{ height: 21, backgroundColor: "#ffbf67" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---- Today's Suggestions ---- */}
        <section className="space-y-3 rounded-2xl border border-nano-border bg-white p-5">
          <h3 className="font-inter text-lg font-medium tracking-[-0.44px] text-nano-heading">
            Today&rsquo;s Suggestions
          </h3>
          <div className="flex gap-3 rounded-[14px] bg-[#faf5ff] p-3">
            <span className="text-lg">💧</span>
            <div>
              <p className="text-sm font-medium text-nano-heading">Drink more water</p>
              <p className="text-xs text-nano-sub-text">Helps blood (Hematocrit) hydrated</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-[14px] bg-[#fefce8] p-3">
            <span className="text-lg">😴</span>
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.23px] text-nano-heading">
                Sleep earlier tonight
              </p>
              <p className="text-[11px] tracking-[0.06px] text-nano-sub-text">
                Help your Circadian Rhythm becomes stable
              </p>
            </div>
          </div>
        </section>

        {/* ---- Footer ---- */}
        <section className="flex flex-col items-center gap-4 pt-8">
          <div className="h-[156px] w-[313px] overflow-hidden rounded-t-full bg-gradient-to-b from-nano-teal/20 to-nano-teal/10" />
          <p className="text-[17px] font-semibold tracking-[-0.43px]">Have questions?</p>
        </section>
        <div className="flex justify-center gap-4 pb-4">
          <button type="button" className="rounded bg-white px-7 py-1 text-[15px] tracking-[-0.23px]">
            Get Help
          </button>
          <button type="button" className="px-7 py-1 text-[15px] tracking-[-0.23px]">
            Visit Us
          </button>
        </div>
      </div>

      {/* ---- Bottom Navigation ---- */}
      <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4">
        <div className="flex h-[61px] items-center rounded-[34px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
          <Link
            to="/"
            className="flex flex-col items-center gap-0.5 rounded-[27px] bg-nano-muted px-5 py-2"
          >
            <span className="text-sm">🏠</span>
            <span className="text-xs font-medium text-black">Home</span>
          </Link>
          <Link
            to="/detail"
            className="flex flex-col items-center gap-0.5 px-5 py-2"
          >
            <span className="text-sm">📊</span>
            <span className="text-xs font-medium text-black">Detail</span>
          </Link>
        </div>
        <button
          type="button"
          className="flex size-[76px] items-center justify-center rounded-full bg-nano-teal shadow-lg"
        >
          <span className="text-xs font-medium text-nano-text">IDFW</span>
        </button>
      </nav>
    </div>
  );
}
