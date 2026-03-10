function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function rootSvg({ width, height, title, content }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <title>${escapeXml(title)}</title>
  ${content}
</svg>`;
}

function textNode({
  x,
  y,
  value,
  size = 12,
  weight = 500,
  fill = "#907FA0",
  anchor = "start",
  family = "Inter, Arial, sans-serif",
}) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" dominant-baseline="hanging">${escapeXml(
    value,
  )}</text>`;
}

function svgTrendingIcon({ x, y, color, up = false }) {
  return `<g transform="translate(${x} ${y})${up ? " scale(1 -1) translate(0 -12)" : ""}">
    <path d="M11 8.5L6.75 4.25L4.25 6.75L1 3.5" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 8.5H11V5.5" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

function svgMiniBars({ x = 0, y = 0, values, width, height, fill, bg }) {
  const gap = 3;
  const innerWidth = width - gap * (values.length - 1);
  const barWidth = innerWidth / values.length;

  return `<g transform="translate(${x} ${y})">
    ${values
      .map((value, index) => {
        const barX = index * (barWidth + gap);
        const barY = height - value;
        const color = index === values.length - 1 ? fill : bg;
        return `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${value}" rx="4" fill="${color}"/>`;
      })
      .join("")}
  </g>`;
}

function svgRangeBar({ x = 0, y = 0, fillPercent }) {
  const knob = fillPercent * 2.94;
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="6" width="76" height="7" fill="#FAC7B3"/>
    <rect x="76" y="6" width="142" height="7" fill="#B0ECED"/>
    <rect x="218" y="6" width="76" height="7" fill="#FAC7B3"/>
    <circle cx="${knob}" cy="9.5" r="4.5" fill="#3AABD2" stroke="#ffffff" stroke-width="2"/>
  </g>`;
}

function svgDualBars({ x = 0, y = 0, previousBars, currentBars }) {
  const width = 313;
  const height = 61;
  const totalBars = previousBars.length + currentBars.length;
  const gap = 3;
  const barWidth = (width - gap * (totalBars - 1)) / totalBars;
  const allBars = [
    ...previousBars.map((value, index) => ({
      key: `previous-${index}`,
      value,
      color: "#B0ECED",
    })),
    ...currentBars.map((value, index) => ({
      key: `current-${index}`,
      value,
      color: index === currentBars.length - 1 ? "#FEB300" : "#FFE199",
    })),
  ];

  return `<g transform="translate(${x} ${y})">
    ${allBars
      .map((bar, index) => {
        const barX = index * (barWidth + gap);
        const barY = height - bar.value;
        return `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${bar.value}" rx="5" fill="${bar.color}"/>`;
      })
      .join("")}
  </g>`;
}

function svgLineChart({
  x = 0,
  y = 0,
  values,
  width,
  height,
  color,
  rangeLow,
  rangeHigh,
  highlightedIndex,
}) {
  const paddingX = 14;
  const paddingTop = 16;
  const paddingBottom = 28;
  const chartHeight = height - paddingTop - paddingBottom;
  const minValue = Math.min(...values, rangeLow ?? Number.POSITIVE_INFINITY);
  const maxValue = Math.max(...values, rangeHigh ?? Number.NEGATIVE_INFINITY);
  const domainMin = minValue - (maxValue - minValue || 1) * 0.08;
  const domainMax = maxValue + (maxValue - minValue || 1) * 0.08;

  const points = values.map((value, index) => {
    const pointX =
      paddingX + (index * (width - paddingX * 2)) / Math.max(1, values.length - 1);
    const normalized = (value - domainMin) / Math.max(1e-6, domainMax - domainMin);
    const pointY = paddingTop + (1 - normalized) * chartHeight;
    return { x: pointX, y: pointY };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  let band = "";
  if (rangeLow !== null && rangeLow !== undefined && rangeHigh !== null && rangeHigh !== undefined) {
    const lowY =
      paddingTop +
      (1 - (rangeLow - domainMin) / Math.max(1e-6, domainMax - domainMin)) * chartHeight;
    const highY =
      paddingTop +
      (1 - (rangeHigh - domainMin) / Math.max(1e-6, domainMax - domainMin)) * chartHeight;

    band = `<rect x="${paddingX}" y="${Math.min(lowY, highY)}" width="${
      width - paddingX * 2
    }" height="${Math.max(10, Math.abs(lowY - highY))}" rx="12" fill="rgba(58,171,210,0.08)"/>`;
  }

  return `<g transform="translate(${x} ${y})">
    ${band}
    <path d="${areaPath}" fill="${color}" fill-opacity="0.12"/>
    <path d="${linePath}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    ${points
      .map((point, index) => {
        const selected = highlightedIndex === index;
        return `<circle cx="${point.x}" cy="${point.y}" r="${selected ? 5.5 : 3}" fill="${
          selected ? "#ffffff" : color
        }" stroke="${color}" stroke-width="${selected ? 3 : 0}"/>`;
      })
      .join("")}
  </g>`;
}

export function renderPriorityArtboardSvg(artboard) {
  return rootSvg({
    width: artboard.width,
    height: artboard.height,
    title: `${artboard.profileName} ${artboard.title} priority`,
    content: `
      ${textNode({ x: 0, y: 0, value: artboard.title, size: 18, weight: 700, fill: "#262626" })}
      ${textNode({ x: artboard.width, y: 2, value: "Priority", size: 12, weight: 500, fill: "#907FA0", anchor: "end" })}
      ${textNode({ x: 0, y: 30, value: artboard.description, size: 13, weight: 500, fill: "#907FA0" })}
      ${svgRangeBar({ x: 0, y: 54, fillPercent: artboard.fillPercent })}
    `,
  });
}

export function renderStatTileArtboardSvg(artboard) {
  const styles = {
    normal: { fill: "#3AABD2", bg: "#B0ECED" },
    concern: { fill: "#FEB300", bg: "#FFE199" },
    alert: { fill: "#F27240", bg: "#FAC7B3" },
  };
  const style = styles[artboard.status];

  return rootSvg({
    width: artboard.width,
    height: artboard.height,
    title: `${artboard.profileName} ${artboard.title} tile`,
    content: `
      ${textNode({
        x: 52.5,
        y: 10,
        value: artboard.tileLabel ?? artboard.shortLabel,
        size: 11,
        weight: 500,
        fill: "#907FA0",
        anchor: "middle",
      })}
      ${textNode({
        x: 52.5,
        y: 25,
        value: artboard.statusLabel,
        size: 17,
        weight: 600,
        fill: style.fill,
        anchor: "middle",
      })}
      ${svgTrendingIcon({ x: 38, y: 49, color: style.fill, up: artboard.trendUp })}
      ${textNode({
        x: 52.5,
        y: 48,
        value: artboard.deltaLabel,
        size: 11,
        weight: 500,
        fill: style.fill,
      })}
      ${svgMiniBars({
        x: 14.39,
        y: 66.39,
        values: artboard.bars,
        width: 76,
        height: 28,
        fill: style.fill,
        bg: style.bg,
      })}
    `,
  });
}

export function renderSummaryArtboardSvg(artboard) {
  return rootSvg({
    width: artboard.width,
    height: artboard.height,
    title: `${artboard.profileName} summary focus`,
    content: `
      ${textNode({ x: 0, y: 0, value: artboard.title, size: 12, weight: 500, fill: "#907FA0" })}
      ${textNode({ x: 0, y: 18, value: artboard.valueLabel, size: 20, weight: 700, fill: "#262626" })}
      ${svgMiniBars({ x: 0, y: 77, values: artboard.bars, width: 89, height: 28, fill: "#3AABD2", bg: "#B0ECED" })}
    `,
  });
}

export function renderTrendArtboardSvg(artboard) {
  return rootSvg({
    width: artboard.width,
    height: artboard.height,
    title: `${artboard.profileName} ${artboard.title} trend`,
    content: `
      ${textNode({ x: 0, y: 0, value: artboard.title, size: 18, weight: 700, fill: "#262626" })}
      ${textNode({ x: artboard.width, y: 2, value: "Trend", size: 12, weight: 500, fill: "#907FA0", anchor: "end" })}
      ${textNode({ x: 0, y: 30, value: artboard.description, size: 13, weight: 500, fill: "#907FA0" })}
      ${svgDualBars({ x: 16, y: 96, previousBars: artboard.previousBars, currentBars: artboard.currentBars })}
    `,
  });
}

export function renderDetailArtboardSvg(artboard) {
  const averageValueLabel =
    artboard.averageValueLabel ?? String(artboard.averageValue ?? artboard.latestValue);
  const rangeLabel = `${artboard.rangeLowLabel ?? "-"} ${artboard.unit ?? ""} - ${
    artboard.rangeHighLabel ?? "-"
  } ${artboard.unit ?? ""}`
    .replace(/\s+/g, " ")
    .trim();
  const unitX = Math.max(94, 10 + averageValueLabel.length * 15);

  return rootSvg({
    width: artboard.width,
    height: artboard.height,
    title: `${artboard.profileName} ${artboard.title} detail`,
    content: `
      ${textNode({ x: 0, y: 0, value: "Average", size: 12, weight: 500, fill: "#262626" })}
      ${textNode({
        x: 0,
        y: 18,
        value: averageValueLabel,
        size: 28,
        weight: 400,
        fill: "#262626",
      })}
      ${
        artboard.unit
          ? textNode({
              x: unitX,
              y: 26,
              value: artboard.unit,
              size: 11,
              weight: 600,
              fill: "#262626",
            })
          : ""
      }
      ${textNode({
        x: 0,
        y: 60,
        value: rangeLabel,
        size: 12,
        weight: 500,
        fill: "#262626",
      })}
      ${textNode({
        x: 0,
        y: 78,
        value: artboard.dateRangeLabel ?? "",
        size: 13,
        weight: 600,
        fill: "#262626",
      })}
      <rect x="0" y="110" width="345" height="208" rx="16" fill="#ffffff" stroke="#E5DED8"/>
      ${svgLineChart({
        x: 16,
        y: 110,
        values: artboard.series,
        width: 313,
        height: 174,
        color: artboard.color,
        rangeLow: artboard.rangeLow,
        rangeHigh: artboard.rangeHigh,
      })}
      ${artboard.labels
        .map((label, index) => {
          const labelX = 16 + (index * 313) / Math.max(1, artboard.labels.length - 1);
          const anchor =
            index === 0 ? "start" : index === artboard.labels.length - 1 ? "end" : "middle";
          return textNode({
            x: labelX,
            y: 294,
            value: label,
            size: 11,
            weight: 500,
            fill: "#907FA0",
            anchor,
          });
        })
        .join("")}
    `,
  });
}

export function renderCorrectionArtboardSvg(artboard) {
  return rootSvg({
    width: artboard.width,
    height: artboard.height,
    title: `${artboard.profileName} correction prompt`,
    content: `
      ${textNode({ x: 0, y: 0, value: "Correction Prompt", size: 12, weight: 500, fill: "#907FA0" })}
      ${textNode({ x: 0, y: 20, value: artboard.title, size: 18, weight: 700, fill: "#262626" })}
      ${textNode({ x: 0, y: 48, value: artboard.timestampLabel, size: 12, weight: 500, fill: "#907FA0" })}
      ${textNode({ x: 0, y: 76, value: artboard.question, size: 13, weight: 500, fill: "#907FA0" })}
      ${svgLineChart({
        x: 16,
        y: 122,
        values: artboard.series,
        width: 329,
        height: 163,
        color: "#FEB300",
        rangeLow: artboard.rangeLow,
        rangeHigh: artboard.rangeHigh,
        highlightedIndex: artboard.highlightedIndex,
      })}
    `,
  });
}
