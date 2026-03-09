interface MetricTrendChartProps {
  values: number[];
  labels?: string[];
  rangeLow?: number;
  rangeHigh?: number;
  color?: string;
  highlightedIndex?: number;
  height?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function MetricTrendChart({
  values,
  labels,
  rangeLow,
  rangeHigh,
  color = "#3AABD2",
  highlightedIndex,
  height = 174,
}: MetricTrendChartProps) {
  const width = 345;
  const paddingX = 14;
  const paddingTop = 16;
  const paddingBottom = labels?.length ? 24 : 16;
  const chartHeight = height - paddingTop - paddingBottom;
  const minValue = Math.min(...values, rangeLow ?? Number.POSITIVE_INFINITY);
  const maxValue = Math.max(...values, rangeHigh ?? Number.NEGATIVE_INFINITY);
  const domainMin = minValue - (maxValue - minValue || 1) * 0.08;
  const domainMax = maxValue + (maxValue - minValue || 1) * 0.08;

  const points = values.map((value, index) => {
    const x =
      paddingX + (index * (width - paddingX * 2)) / Math.max(1, values.length - 1);
    const normalized = (value - domainMin) / Math.max(1e-6, domainMax - domainMin);
    const y = paddingTop + (1 - normalized) * chartHeight;
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  let band = null;
  if (rangeLow !== undefined && rangeHigh !== undefined) {
    const lowY =
      paddingTop +
      (1 - (rangeLow - domainMin) / Math.max(1e-6, domainMax - domainMin)) * chartHeight;
    const highY =
      paddingTop +
      (1 - (rangeHigh - domainMin) / Math.max(1e-6, domainMax - domainMin)) * chartHeight;

    band = {
      y: clamp(highY, paddingTop, height - paddingBottom),
      height: clamp(lowY - highY, 10, chartHeight),
    };
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-nano-border bg-white">
      <svg viewBox={`0 0 ${width} ${height}`} className="block h-full w-full" role="img">
        {band && (
          <rect
            x={paddingX}
            y={band.y}
            width={width - paddingX * 2}
            height={band.height}
            rx="12"
            fill="rgba(58, 171, 210, 0.08)"
          />
        )}
        <path d={areaPath} fill={color} fillOpacity="0.12" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {points.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={highlightedIndex === index ? 5.5 : 3}
            fill={highlightedIndex === index ? "#fff" : color}
            stroke={color}
            strokeWidth={highlightedIndex === index ? 3 : 0}
          />
        ))}
      </svg>
      {labels && (
        <div className="flex justify-between px-4 pb-3 text-[11px] tracking-[0.06px] text-nano-sub-text">
          {labels.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
