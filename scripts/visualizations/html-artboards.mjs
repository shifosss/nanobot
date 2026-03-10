function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function svgLineChart({ values, width, height, color, rangeLow, rangeHigh, highlightedIndex }) {
  const paddingX = 14;
  const paddingTop = 16;
  const paddingBottom = 28;
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
    }" height="${Math.max(10, Math.abs(lowY - highY))}" rx="12" fill="rgba(58, 171, 210, 0.08)" />`;
  }

  const circles = points
    .map((point, index) => {
      const selected = highlightedIndex === index;
      return `<circle cx="${point.x}" cy="${point.y}" r="${
        selected ? 5.5 : 3
      }" fill="${selected ? "#ffffff" : color}" stroke="${color}" stroke-width="${
        selected ? 3 : 0
      }" />`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" role="img" aria-label="Trend chart">
      ${band}
      <path d="${areaPath}" fill="${color}" fill-opacity="0.12"></path>
      <path d="${linePath}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"></path>
      ${circles}
    </svg>
  `;
}

function svgMiniBars(values, width, height, fill, bg) {
  const gap = 3;
  const innerWidth = width - gap * (values.length - 1);
  const barWidth = innerWidth / values.length;

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" role="img" aria-label="Mini bar chart">
      ${values
        .map((value, index) => {
          const x = index * (barWidth + gap);
          const y = height - value;
          const color = index === values.length - 1 ? fill : bg;
          return `<rect x="${x}" y="${y}" width="${barWidth}" height="${value}" rx="4" fill="${color}"></rect>`;
        })
        .join("")}
    </svg>
  `;
}

function svgTrendingIcon(color, up = false) {
  return `
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" role="img" aria-label="${
      up ? "Trending up" : "Trending down"
    }" style="${up ? "transform: scaleY(-1);" : ""}">
      <path d="M11 8.5L6.75 4.25L4.25 6.75L1 3.5" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M8 8.5H11V5.5" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;
}

function svgRangeBar(fillPercent) {
  const knob = fillPercent * 2.94;
  return `
    <svg viewBox="0 0 294 18" class="chart-svg" role="img" aria-label="Range bar">
      <rect x="0" y="6" width="76" height="7" fill="#FAC7B3"></rect>
      <rect x="76" y="6" width="142" height="7" fill="#B0ECED"></rect>
      <rect x="218" y="6" width="76" height="7" fill="#FAC7B3"></rect>
      <circle cx="${knob}" cy="9.5" r="4.5" fill="#3AABD2" stroke="#ffffff" stroke-width="2"></circle>
    </svg>
  `;
}

function svgDualBars(previousBars, currentBars) {
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

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" role="img" aria-label="Comparison bar chart">
      ${allBars
        .map((bar, index) => {
          const x = index * (barWidth + gap);
          const y = height - bar.value;
          return `<rect x="${x}" y="${y}" width="${barWidth}" height="${bar.value}" rx="5" fill="${bar.color}"></rect>`;
        })
        .join("")}
    </svg>
  `;
}

function renderPage({ title, body, width }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f7fb;
        --card: #ffffff;
        --text: #262626;
        --muted: #907fa0;
        --line: #e2e8f0;
        --shadow: 0 16px 40px rgba(144, 127, 160, 0.12);
        --teal: #3aabd2;
        --amber: #feb300;
        --orange: #f27240;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background: radial-gradient(circle at top, rgba(176, 236, 237, 0.55), transparent 50%), var(--bg);
        color: var(--text);
        font-family: Inter, "Segoe UI", Arial, sans-serif;
      }

      .artboard {
        width: ${width}px;
      }

      .card {
        width: 100%;
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 24px;
        box-shadow: var(--shadow);
      }

      .small-card {
        border-radius: 20px;
      }

      .chart-svg {
        display: block;
        width: 100%;
        height: auto;
      }

      .label {
        font-size: 12px;
        line-height: 1.3;
        color: var(--muted);
      }

      .title {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.2;
      }

      .value {
        font-size: 26px;
        font-weight: 700;
        line-height: 1.1;
      }

      .description {
        font-size: 13px;
        line-height: 1.45;
        color: var(--muted);
      }

      .meta-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
      }

      .status-normal { color: var(--teal); }
      .status-concern { color: var(--amber); }
      .status-alert { color: var(--orange); }
    </style>
  </head>
  <body>
    <main class="artboard">
      ${body}
    </main>
  </body>
</html>`;
}

export function renderPriorityArtboard(artboard) {
  return renderPage({
    title: `${artboard.profileName} ${artboard.title} priority`,
    width: artboard.width,
    body: `
      <section class="card" style="padding: 18px 20px;">
        <div class="meta-row">
          <div class="title">${escapeHtml(artboard.title)}</div>
          <div class="label">Priority</div>
        </div>
        <div class="description" style="margin-top: 6px;">${escapeHtml(artboard.description)}</div>
        <div style="margin-top: 16px;">
          ${svgRangeBar(artboard.fillPercent)}
        </div>
      </section>
    `,
  });
}

export function renderStatTileArtboard(artboard) {
  const styles = {
    normal: { fill: "#3AABD2", bg: "#B0ECED" },
    concern: { fill: "#FEB300", bg: "#FFE199" },
    alert: { fill: "#F27240", bg: "#FAC7B3" },
  };
  const style = styles[artboard.status];

  return renderPage({
    title: `${artboard.profileName} ${artboard.title} tile`,
    width: artboard.width,
    body: `
      <section class="card small-card" style="position:relative; width:${artboard.width}px; height:${artboard.height}px; border-radius:16px;">
        <div style="position:absolute; left:5.39px; top:10.39px; display:flex; width:93px; flex-direction:column; align-items:center; gap:2px;">
          <div class="label" style="width:100%; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11px; line-height:13px;">${escapeHtml(
            artboard.tileLabel ?? artboard.shortLabel,
          )}</div>
          <div class="title status-${artboard.status}" style="width:100%; text-align:center; font-size:17px; line-height:22px;">${escapeHtml(
            artboard.statusLabel,
          )}</div>
          <div style="display:flex; height:16px; align-items:center; gap:1px;">
            ${svgTrendingIcon(style.fill, artboard.trendUp)}
            <span class="label status-${artboard.status}" style="font-weight:600; color:${style.fill};">${escapeHtml(
              artboard.deltaLabel,
            )}</span>
          </div>
        </div>
        <div style="position:absolute; left:14.39px; top:66.39px; display:flex; height:28px; width:76px; align-items:flex-end; gap:2px;">
          ${svgMiniBars(artboard.bars, 76, 28, style.fill, style.bg)}
        </div>
      </section>
    `,
  });
}

export function renderSummaryArtboard(artboard) {
  return renderPage({
    title: `${artboard.profileName} summary focus`,
    width: artboard.width,
    body: `
      <section class="card small-card" style="height:${artboard.height}px; padding: 12px; display:flex; flex-direction:column;">
        <div class="label">${escapeHtml(artboard.title)}</div>
        <div class="value" style="margin-top:4px; font-size:20px;">${escapeHtml(
          artboard.valueLabel,
        )}</div>
        <div style="margin-top:auto;">
          ${svgMiniBars(artboard.bars, 89, 28, "#3AABD2", "#B0ECED")}
        </div>
      </section>
    `,
  });
}

export function renderTrendArtboard(artboard) {
  return renderPage({
    title: `${artboard.profileName} ${artboard.title} trend`,
    width: artboard.width,
    body: `
      <section class="card" style="padding: 18px 16px;">
        <div class="meta-row">
          <div class="title">${escapeHtml(artboard.title)}</div>
          <div class="label">Trend</div>
        </div>
        <div class="description" style="margin-top: 8px;">${escapeHtml(artboard.description)}</div>
        <div style="margin-top: 18px;">
          ${svgDualBars(artboard.previousBars, artboard.currentBars)}
        </div>
      </section>
    `,
  });
}

export function renderDetailArtboard(artboard) {
  return renderPage({
    title: `${artboard.profileName} ${artboard.title} detail`,
    width: artboard.width,
    body: `
      <section class="card" style="padding: 18px 16px 14px;">
        <div class="meta-row">
          <div>
            <div class="label">${escapeHtml(artboard.title)}</div>
            <div class="value">${escapeHtml(artboard.latestValueLabel ?? artboard.latestValue.toString())}</div>
          </div>
          <div class="label" style="text-align:right;">
            ${
              artboard.rangeLow !== null && artboard.rangeLow !== undefined
                ? escapeHtml(String(artboard.rangeLow))
                : "-"
            }
            to
            ${
              artboard.rangeHigh !== null && artboard.rangeHigh !== undefined
                ? escapeHtml(String(artboard.rangeHigh))
                : "-"
            }
          </div>
        </div>
        <div style="margin-top: 14px;">
          ${svgLineChart({
            values: artboard.series,
            width: 313,
            height: 174,
            color: artboard.color,
            rangeLow: artboard.rangeLow,
            rangeHigh: artboard.rangeHigh,
          })}
        </div>
        <div class="meta-row" style="margin-top: 8px;">
          ${artboard.labels
            .map((label) => `<div class="label">${escapeHtml(label)}</div>`)
            .join("")}
        </div>
      </section>
    `,
  });
}

export function renderCorrectionArtboard(artboard) {
  return renderPage({
    title: `${artboard.profileName} correction prompt`,
    width: artboard.width,
    body: `
      <section class="card" style="padding: 18px 16px;">
        <div class="label">Correction Prompt</div>
        <div class="title" style="margin-top: 6px;">${escapeHtml(artboard.title)}</div>
        <div class="label" style="margin-top: 6px;">${escapeHtml(artboard.timestampLabel)}</div>
        <div class="description" style="margin-top: 12px;">${escapeHtml(artboard.question)}</div>
        <div style="margin-top: 18px;">
          ${svgLineChart({
            values: artboard.series,
            width: 329,
            height: 163,
            color: "#FEB300",
            rangeLow: artboard.rangeLow,
            rangeHigh: artboard.rangeHigh,
            highlightedIndex: artboard.highlightedIndex,
          })}
        </div>
      </section>
    `,
  });
}
