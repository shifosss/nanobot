import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getDemoProfileUi,
  type DashboardStatCard,
  type DashboardTrendChart,
  type HealthStatus,
} from "@/data/demo-health-ui";
import { useAuth } from "@/providers/auth-context";

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

const TIME_PERIODS = ["Now", "D", "W", "M", "6M", "Y"] as const;
const TREND_BAR_COLORS = {
  previous: "rgba(58,171,210,0.28)",
  current: "rgba(255,191,103,0.32)",
  currentAccent: "#ffbf67",
};

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

function ComparisonBarChart({ chart }: { chart: DashboardTrendChart }) {
  return (
    <div className="space-y-2">
      <ul className="text-[13px] tracking-[-0.08px]">
        <li className="ml-5 list-disc">{chart.description}</li>
      </ul>
      {chart.footerLabel && (
        <p className="text-right text-[11px] tracking-[0.06px] text-[#99a1af]">
          {chart.footerLabel}
        </p>
      )}
      <div className="flex h-[61px] items-end gap-0.5">
        {chart.previousBars.map((height, index) => (
          <div
            key={`previous-${chart.title}-${index}`}
            className="min-w-0 flex-1 rounded-lg"
            style={{ height, backgroundColor: TREND_BAR_COLORS.previous }}
          />
        ))}
        {chart.currentBars.map((height, index) => (
          <div
            key={`current-${chart.title}-${index}`}
            className="min-w-0 flex-1 rounded-lg"
            style={{
              height,
              backgroundColor:
                index === chart.currentBars.length - 1
                  ? TREND_BAR_COLORS.currentAccent
                  : TREND_BAR_COLORS.current,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({ item }: { item: DashboardStatCard }) {
  const color = STATUS_COLOR[item.status];
  return (
    <div className="flex aspect-square flex-col items-center rounded-2xl border border-nano-border bg-white px-1.5 pt-2.5 pb-2.5">
      <p className="text-xs font-medium text-nano-sub-text">{item.label}</p>
      <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px]" style={{ color }}>
        {item.statusLabel}
      </p>
      <span className="text-[11px] leading-[13px] tracking-[0.06px] text-nano-sub-text">
        {item.value}
      </span>
      <div className="mt-auto w-[76px]">
        <MiniBarChart bars={item.bars} status={item.status} />
      </div>
      <span className="mt-1 text-[11px] leading-[13px] tracking-[0.06px]" style={{ color }}>
        {item.deltaLabel}
      </span>
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
  const navigate = useNavigate();
  const { session, demoMode } = useAuth();
  const [activePeriod, setActivePeriod] = useState<string>("Now");
  const demoProfile = getDemoProfileUi();
  const dashboard = demoProfile.dashboard;
  const statGrid: (DashboardStatCard | "reorder")[] = [...dashboard.statCards, "reorder"];
  const unusualCategory = demoProfile.categories.find((category) => category.unusualPrompt);
  const unusualPrompt = unusualCategory?.unusualPrompt;

  const email = session?.user?.email;
  const name = email
    ? email.split("@")[0]
    : demoMode
      ? demoProfile.profileName
      : "User";

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
                {dashboard.bannerStatus}
              </span>
              <span className="mb-1.5 text-xs text-[#99a1af]">
                {dashboard.bannerCompareLabel}
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="w-[258px] text-[17px] leading-[22px] tracking-[-0.43px]">
              {dashboard.bannerMessage.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-[9px] rounded-full bg-[#34c759]" />
              <span className="text-xs">{dashboard.syncLabel}</span>
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
            {dashboard.priorityStats.map((stat) => (
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

        {unusualCategory && unusualPrompt && (
          <button
            type="button"
            onClick={() => navigate("/detail")}
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
                  {unusualCategory.fullName}
                </p>
                <p className="text-xs text-[#6a7282]">{unusualPrompt.question}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#6a7282]">
              <span className="font-inter text-sm tracking-[-0.15px]">Review</span>
              <span className="text-xs font-medium">›</span>
            </div>
          </button>
        )}

        {/* ---- Summary ---- */}
        <section className="space-y-2">
          <SectionHeader title="Summary" action="See All" />

          {/* Stat detail card */}
          <div className="flex overflow-hidden rounded-2xl bg-white">
            <div className="m-4 flex h-[105px] w-[113px] shrink-0 flex-col rounded-[24px] bg-nano-muted px-3 py-3">
              <p className="text-[13px] font-semibold leading-[18px] tracking-[-0.08px] text-nano-heading">
                {dashboard.summaryFeature.title}
              </p>
              <p className="mt-1 text-[22px] font-bold leading-[28px] tracking-[-0.26px] text-nano-heading">
                {dashboard.summaryFeature.value}
              </p>
              <div className="mt-auto">
                <MiniBarChart
                  bars={dashboard.trendHighlight.charts[0].currentBars.slice(-5)}
                  status="concern"
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-[18px] py-4 pr-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-[#feb300]" />
                    <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px]">
                      {dashboard.summaryFeature.title}
                    </p>
                  </div>
                  <span className="text-xs">{dashboard.summaryFeature.value}</span>
                </div>
                <p className="text-xs">{dashboard.summaryFeature.description}</p>
              </div>
              {dashboard.summaryFeature.secondary.map((entry) => (
                <div key={entry.title} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-nano-pink" />
                      <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px]">
                        {entry.title}
                      </p>
                    </div>
                    <span className="text-xs">{entry.value}</span>
                  </div>
                  <p className="text-xs">{entry.description}</p>
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
            {statGrid.map((item, i) =>
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
            <Link to="/detail" className="text-[15px] tracking-[-0.23px] text-nano-teal">
              see all details
            </Link>
          </div>
        </section>

        {/* ---- Trend & Highlight ---- */}
        <section className="space-y-2">
          <SectionHeader title="Trend & Highlight" action="See All" />
          <div className="rounded-2xl bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-[17px] rounded-full bg-nano-pink" />
                <p className="text-[15px] font-semibold tracking-[-0.23px]">
                  {dashboard.trendHighlight.categoryLabel}
                </p>
              </div>
              <span className="text-xs font-medium">›</span>
            </div>
            <p className="mb-3 text-[15px] leading-[20px] tracking-[-0.23px]">
              {dashboard.trendHighlight.headline}
            </p>
            <div className="mb-3 h-px bg-nano-divider" />

            <div className="space-y-3">
              {dashboard.trendHighlight.charts.map((chart) => (
                <ComparisonBarChart key={chart.title} chart={chart} />
              ))}
            </div>
          </div>
        </section>

        {/* ---- Today's Suggestions ---- */}
        <section className="space-y-3 rounded-2xl border border-nano-border bg-white p-5">
          <h3 className="font-inter text-lg font-medium tracking-[-0.44px] text-nano-heading">
            Today&rsquo;s Suggestions
          </h3>
          {dashboard.suggestions.map((suggestion) => (
            <div
              key={suggestion.title}
              className={`flex gap-3 rounded-[14px] p-3 ${
                suggestion.tone === "teal" ? "bg-[#ecfeff]" : "bg-[#fefce8]"
              }`}
            >
              <span className="text-lg">{suggestion.emoji}</span>
              <div>
                <p className="text-[15px] font-semibold tracking-[-0.23px] text-nano-heading">
                  {suggestion.title}
                </p>
                <p className="text-[11px] tracking-[0.06px] text-nano-sub-text">
                  {suggestion.body}
                </p>
              </div>
            </div>
          ))}
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
          onClick={() => navigate("/idfw")}
          className="flex size-[76px] items-center justify-center rounded-full bg-nano-teal shadow-lg"
        >
          <span className="text-xs font-medium text-nano-text">IDFW</span>
        </button>
      </nav>
    </div>
  );
}
