import { Link, useNavigate } from "react-router-dom";
import type { DashboardTrendChart } from "@/data/demo-health-ui";
import { useAuth } from "@/providers/auth-context";
import { useHealthData, type TimePeriod } from "@/hooks/use-health-data";
import { statusToColor, computeHealthStatus } from "@/lib/health-engine";

/* ---- Constants ---- */

const TIME_PERIODS: TimePeriod[] = ["Now", "D", "W", "M", "6M", "Y"];

const TREND_BAR_COLORS = {
  previous: "#B0ECED",
  current: "#FFE199",
  currentAccent: "#FEB300",
};

const CARD_SHADOW = "0px 4px 8px 0px rgba(144,127,160,0.1)";

/* ---- Helper Components ---- */

function TrendingIcon({ color, up = false }: { color: string; up?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={up ? { transform: "scaleY(-1)" } : undefined}
    >
      <path
        d="M11 8.5L6.75 4.25L4.25 6.75L1 3.5"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8.5H11V5.5"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface StatCardProps {
  label: string;
  status: string;
  color: string;
  lightColor: string;
  delta: string;
  trendUp: boolean;
  bars: number[];
  col: number;
  row: number;
}

function FigmaStatCard({ card }: { card: StatCardProps }) {
  return (
    <div
      className="relative size-[105px] rounded-2xl border-[0.612px] border-nano-line bg-white"
      style={{
        boxShadow: CARD_SHADOW,
        gridColumn: card.col,
        gridRow: card.row,
      }}
    >
      <div className="absolute left-[5.39px] top-[10.39px] flex w-[93px] flex-col items-center gap-px">
        <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[11px] font-medium leading-[13px] text-nano-shadow">
          {card.label}
        </p>
        <p
          className="w-full text-center text-[17px] font-semibold leading-[22px] tracking-[-0.43px]"
          style={{ color: card.color }}
        >
          {card.status}
        </p>
        <div className="flex h-4 shrink-0 items-center">
          <TrendingIcon color={card.color} up={card.trendUp} />
          <span
            className="text-[11px] leading-[13px] tracking-[0.06px]"
            style={{ color: card.color }}
          >
            {card.delta}
          </span>
        </div>
      </div>
      <div className="absolute left-[14.39px] top-[66.39px] flex h-7 w-[76px] items-end gap-[2px]">
        {card.bars.map((h, i) => (
          <div
            key={i}
            className="min-h-px min-w-px flex-1 rounded-t"
            style={{
              height: h,
              backgroundColor: i === card.bars.length - 1 ? card.color : card.lightColor,
            }}
          />
        ))}
      </div>
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
        <p className="text-right text-[11px] tracking-[0.06px] text-nano-shadow">
          {chart.footerLabel}
        </p>
      )}
      <div className="flex h-[61px] items-end gap-0.5">
        {chart.previousBars.map((height, index) => (
          <div
            key={`prev-${chart.title}-${index}`}
            className="min-w-0 flex-1 rounded-lg"
            style={{ height, backgroundColor: TREND_BAR_COLORS.previous }}
          />
        ))}
        {chart.currentBars.map((height, index) => (
          <div
            key={`cur-${chart.title}-${index}`}
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

function SectionHeader({
  title,
  action,
  actionColor = "text-nano-pink",
}: {
  title: string;
  action?: string;
  actionColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[22px] font-bold leading-[28px] tracking-[-0.26px] text-nano-black">
        {title}
      </h2>
      {action && (
        <button type="button" className={`text-xs font-medium ${actionColor}`}>
          {action}
        </button>
      )}
    </div>
  );
}

function RangeBar({ fill }: { fill: number }) {
  return (
    <div className="relative">
      <div className="flex">
        <div className="h-[7px] bg-nano-red-light" style={{ width: 76 }} />
        <div className="h-[7px] bg-nano-blue-light" style={{ width: 142 }} />
        <div className="h-[7px] bg-nano-red-light" style={{ width: 76 }} />
      </div>
      <div
        className="absolute -top-px size-[9px] -translate-x-1/2 rounded-full border-2 border-white bg-nano-teal"
        style={{ left: `${fill}%` }}
      />
    </div>
  );
}

/** Mini sparkline SVG for the summary card. */
function MiniSparkline({
  values,
  color,
  width = 113,
  height = 105,
}: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return <div className="size-full bg-nano-muted" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * w;
    const y = pad + h - ((v - min) / span) * h;
    return `${x},${y}`;
  });
  const pathD = `M${points.join("L")}`;
  const areaD = `${pathD}L${pad + w},${pad + h}L${pad},${pad + h}Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={areaD} fill={color} fillOpacity="0.15" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Shared time period selector (used by dashboard and detail page). */
function TimePeriodSelector({
  periods,
  active,
  onSelect,
}: {
  periods: readonly string[];
  active: string;
  onSelect: (p: string) => void;
}) {
  return (
    <div className="relative inline-grid">
      {/* Layer 1: White pill background */}
      <div
        className="col-start-1 row-start-1 h-[22px] w-[308px] rounded-2xl border border-nano-line bg-white"
        style={{ boxShadow: CARD_SHADOW }}
      />
      {/* Layer 2 + 3: Buttons with active indicator */}
      <div className="col-start-1 row-start-1 flex h-[22px] w-[308px] items-center">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onSelect(p)}
            className={`relative flex h-full flex-1 items-center justify-center text-[15px] font-semibold leading-[20px] tracking-[-0.23px] ${
              active === p ? "text-white" : "text-nano-black"
            }`}
          >
            {active === p && (
              <div className="absolute inset-y-0 left-1/2 w-[32px] -translate-x-1/2 rounded-2xl bg-nano-teal" />
            )}
            <span className="relative">{p}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- Main Component ---- */

export function DashboardPage() {
  const navigate = useNavigate();
  const { session, demoMode, activeProfile } = useAuth();
  const { loading, dashboard, categories, summaryRows, period, setPeriod } = useHealthData();

  const name = activeProfile?.display_name
    ?? (session?.user?.email ? session.user.email.split("@")[0] : demoMode ? "User" : "User");

  if (loading || !dashboard) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-nano-new-white" style={{ colorScheme: "light" }}>
        <p className="text-lg text-nano-shadow">Loading...</p>
      </div>
    );
  }

  // Build stat card props from dashboard.statCards
  const statCardProps: StatCardProps[] = dashboard.statCards.map((card, i) => {
    const { color, lightColor } = statusToColor(card.status);
    const col = (i % 3) + 1;
    const row = Math.floor(i / 3) + 1;
    const trendUp = card.deltaLabel.startsWith("+");
    return {
      label: card.label,
      status: card.statusLabel,
      color,
      lightColor,
      delta: card.deltaLabel.replace(/^[+-]/, ""),
      trendUp,
      bars: card.bars,
      col,
      row,
    };
  });

  const totalRows = Math.ceil(statCardProps.length / 3);

  // Summary feature data
  const summaryPrimary = summaryRows.length > 0
    ? summaryRows.find((r) => r.category_name === dashboard.summaryFeature.title) ?? summaryRows[0]
    : null;
  const summarySecondary = dashboard.summaryFeature.secondary[0];

  return (
    <div className="fixed inset-0 overflow-y-auto bg-nano-new-white" style={{ colorScheme: "light" }}>
      {/* ---- Teal gradient background ---- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[379px] bg-gradient-to-b from-[rgba(83,218,255,0.8)] to-transparent" />

      <div className="relative mx-auto max-w-[393px] font-sf text-nano-text">
        {/* ---- Character illustration ---- */}
        <img
          src="/images/dashboard-character.png"
          alt=""
          className="pointer-events-none absolute right-0 top-[101px] h-[249px] w-[180px] object-contain"
        />

        {/* ---- Header ---- */}
        <header className="flex items-start justify-between px-6 pt-14">
          <div>
            <p className="text-[28px] leading-[34px] tracking-[0.38px] text-nano-black">
              Good Morning,
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[28px] font-bold leading-[34px] tracking-[0.38px] text-nano-black">
                {name}
              </p>
              <span className="text-[15px] leading-[20px] text-nano-shadow">&#x25BE;</span>
            </div>
          </div>
          <Link
            to="/profile"
            className="flex size-10 items-center justify-center rounded-full bg-white"
            title="Profile"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#907FA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </header>

        <div className="h-16" />

        {/* ---- Main Content Card ---- */}
        <div
          className="relative rounded-[36px] bg-nano-bg px-6 py-6"
          style={{ boxShadow: "0px 4px 20px 0px rgba(38,38,38,0.1)" }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-white/30 mix-blend-lighten" />

          <div className="relative space-y-4">
            {/* ---- Health Status Banner ---- */}
            <section className="space-y-2">
              <p className="text-[20px] leading-[25px] tracking-[-0.45px] text-nano-black">
                Everything is
              </p>
              <div className="flex items-end gap-2">
                <span className="text-[36px] font-bold leading-[41px] tracking-[0.4px] text-nano-teal">
                  {dashboard.bannerStatus}
                </span>
                <div className="flex flex-col gap-0.5 pb-1">
                  <span className="text-xs text-nano-shadow">
                    {dashboard.bannerCompareLabel}
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="w-[258px] text-[17px] leading-[22px] tracking-[-0.43px] text-nano-black">
                  {dashboard.bannerMessage.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-[9px] rounded-full bg-[#34c759]" />
                  <span className="text-xs text-nano-shadow">{dashboard.syncLabel}</span>
                </div>
              </div>
            </section>

            <div className="h-0.5 bg-nano-divider" />

            {/* ---- Top Priority Stats ---- */}
            <section
              className="overflow-hidden rounded-2xl border border-nano-line bg-white p-4"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[15px]">&#x1F4E2;</span>
                <p className="text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-nano-black">
                  Top priority stats
                </p>
              </div>
              <div className="space-y-4">
                {dashboard.priorityStats.map((stat) => {
                  // Color the description based on how far outside range
                  const matchRow = summaryRows.find((r) => r.biomarker_name === stat.label);
                  let descColor = "text-nano-teal";
                  if (matchRow) {
                    const status = computeHealthStatus(
                      Number(matchRow.latest_value),
                      matchRow.personal_range_low ?? matchRow.range_low,
                      matchRow.personal_range_high ?? matchRow.range_high,
                    );
                    if (status === "alert") descColor = "text-[#F27240]";
                    else if (status === "concern") descColor = "text-[#FEB300]";
                  }
                  return (
                    <div key={stat.label} className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-nano-black">{stat.label}:</span>
                        <span className={descColor}>{stat.description}</span>
                      </div>
                      <RangeBar fill={stat.fill} />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ---- New Change? Card ---- */}
            <button
              type="button"
              onClick={() => navigate("/detail")}
              className="flex w-full items-center justify-between rounded-2xl border border-nano-line bg-white p-4"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[22px]">&#x1F34D;</span>
                <div className="text-left">
                  <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-nano-black">
                    New change?
                  </p>
                  <p className="text-xs text-nano-shadow">Get new diet?</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-nano-shadow">
                <span className="font-inter text-sm tracking-[-0.15px]">Update</span>
                <span className="text-xs font-medium">&#x203A;</span>
              </div>
            </button>

            <div className="h-1" />

            {/* ---- Summary ---- */}
            <section className="flex flex-col items-start gap-2">
              <SectionHeader title="Summary" action="See All" actionColor="text-nano-pink" />

              {/* Summary detail card — 345×142, overflow-hidden to prevent text bleed */}
              <div
                className="relative h-[142px] w-[345px] overflow-hidden rounded-2xl border border-nano-line bg-white"
                style={{ boxShadow: CARD_SHADOW }}
              >
                {/* Sparkline chart */}
                <div className="absolute left-[15px] top-[18px] h-[105px] w-[113px]">
                  {summaryPrimary && summaryPrimary.trend_7d.length > 1 ? (
                    <MiniSparkline
                      values={summaryPrimary.trend_7d.map(Number)}
                      color={statusToColor(
                        categories.find((c) => c.fullName === summaryPrimary.category_name)?.summary.status ?? "normal"
                      ).color}
                    />
                  ) : (
                    <div className="size-full bg-nano-muted" />
                  )}
                </div>

                {/* Stat rows — constrained to prevent overflow */}
                <div className="absolute left-[140px] right-[12px] top-[17px] flex flex-col gap-[18px]">
                  {/* Row 1 */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <div className="size-3 shrink-0 rounded-full bg-nano-muted" />
                        <p className="truncate text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-nano-black">
                          {dashboard.summaryFeature.title || "—"}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs leading-4 text-nano-black">
                        {dashboard.summaryFeature.value || "—"}
                      </p>
                    </div>
                    <p className="line-clamp-2 text-[11px] leading-[14px] text-nano-shadow">
                      {dashboard.summaryFeature.description || ""}
                    </p>
                  </div>

                  {/* Row 2 */}
                  {summarySecondary && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <div className="size-3 shrink-0 rounded-full bg-nano-muted" />
                          <p className="truncate text-[15px] font-semibold leading-[20px] tracking-[-0.23px] text-nano-black">
                            {summarySecondary.title}
                          </p>
                        </div>
                        <p className="shrink-0 text-xs leading-4 text-nano-black">
                          {summarySecondary.value}
                        </p>
                      </div>
                      <p className="line-clamp-2 text-[11px] leading-[14px] text-nano-shadow">
                        {summarySecondary.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-2 w-full" />

              {/* Time period selector — flex-based centering */}
              <div className="flex w-[345px] items-start gap-[23px]">
                <TimePeriodSelector
                  periods={TIME_PERIODS}
                  active={period}
                  onSelect={(p) => setPeriod(p as TimePeriod)}
                />
                <button
                  type="button"
                  className="flex size-[22px] items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M7 2l-3 3M7 2l3 3" stroke="#4D4745" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="h-2 w-full" />

              {/* Stat card grid */}
              <div className={`grid w-[345px] grid-cols-[repeat(3,max-content)] grid-rows-[repeat(${totalRows + 1},max-content)] gap-3`}>
                {statCardProps.map((card) => (
                  <FigmaStatCard key={card.label} card={card} />
                ))}
                {/* Reorder card */}
                <div
                  className="flex rounded-2xl border-[0.612px] border-nano-line bg-white px-1.5 py-[35px]"
                  style={{
                    boxShadow: CARD_SHADOW,
                    gridColumn: (statCardProps.length % 3) + 1,
                    gridRow: Math.floor(statCardProps.length / 3) + 1,
                  }}
                >
                  <div className="flex w-[93px] flex-col items-center text-center text-nano-shadow">
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" className="mb-0.5">
                      <rect x="2.5" y="2.5" width="12" height="12" rx="2" stroke="#907FA0" strokeWidth="1.2" />
                      <path d="M6.5 5.5L10 9M10 5.5L6.5 9" stroke="#907FA0" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    <p className="text-[11px] leading-[13px] tracking-[0.06px]">Reorder</p>
                  </div>
                </div>
              </div>

              <div className="flex h-10 w-[339px] items-center justify-center">
                <Link to="/detail" className="text-[15px] leading-[20px] tracking-[-0.23px] text-nano-teal">
                  see all details
                </Link>
              </div>
            </section>

            {/* ---- Trend & Highlight ---- */}
            <section className="space-y-2">
              <SectionHeader title="Trend & Highlight" action="See All" actionColor="text-nano-teal" />
              <div
                className="rounded-2xl bg-white p-4"
                style={{ boxShadow: CARD_SHADOW }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-[17px] rounded-full bg-nano-pink" />
                    <p className="text-[15px] font-semibold tracking-[-0.23px] text-nano-black">
                      {dashboard.trendHighlight.categoryLabel}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-nano-black">&#x203A;</span>
                </div>
                <p className="mb-3 text-[15px] leading-[20px] tracking-[-0.23px] text-nano-black">
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
            <section
              className="space-y-3 rounded-2xl border border-nano-new-white bg-white p-5"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <h3 className="font-inter text-lg font-medium tracking-[-0.44px] text-nano-black">
                Today&rsquo;s Suggestions
              </h3>
              {dashboard.suggestions.map((suggestion) => (
                <div
                  key={suggestion.title}
                  className={`flex gap-3 rounded-[14px] border bg-white p-3 ${
                    suggestion.tone === "teal"
                      ? "border-nano-teal"
                      : "border-nano-yellow-light"
                  }`}
                >
                  <span className="text-lg">{suggestion.emoji}</span>
                  <div>
                    <p className="text-[15px] font-semibold tracking-[-0.23px] text-nano-black">
                      {suggestion.title}
                    </p>
                    <p className="text-[11px] tracking-[0.06px] text-nano-shadow">
                      {suggestion.body}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>

        {/* ---- Footer ---- */}
        <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-32">
          <img
            src="/images/dashboard-footer.png"
            alt="Relaxing illustration"
            className="h-[191px] w-[297px] object-contain"
          />
          <p className="text-[17px] font-semibold tracking-[-0.43px] text-nano-black">
            Have questions?
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="w-[130px] rounded-2xl border border-nano-line bg-white px-4 py-1 text-[15px] tracking-[-0.23px] text-nano-black"
              style={{ boxShadow: CARD_SHADOW }}
            >
              Get Help
            </button>
            <button
              type="button"
              className="w-[130px] px-4 py-1 text-[15px] font-bold tracking-[-0.23px] text-nano-teal"
            >
              Visit Us
            </button>
          </div>
        </div>
      </div>

      {/* ---- Bottom Navigation ---- */}
      <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4">
        <div className="flex h-[61px] items-center rounded-[34px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
          <Link
            to="/"
            className="flex flex-col items-center gap-0.5 rounded-[27px] bg-nano-muted px-5 py-2"
          >
            <span className="text-sm">&#x1F3E0;</span>
            <span className="text-xs font-medium text-black">Home</span>
          </Link>
          <Link
            to="/detail"
            className="flex flex-col items-center gap-0.5 px-5 py-2"
          >
            <span className="text-sm">&#x1F4CA;</span>
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
