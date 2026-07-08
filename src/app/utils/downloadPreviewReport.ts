import { reportChartTheme } from "../tokens/reportChartTheme";
import type { PreviewColumn, PreviewRow } from "./reportPreviewData";
import {
  buildPreviewChartSeries,
  formatAxisValue,
  getPreviewChartAxisLabel,
  type PreviewChartSeries,
} from "./reportPreviewChartData";

export type PreviewReportDownloadPayload = {
  reportName: string;
  columns: PreviewColumn[];
  rows: PreviewRow[];
  totalCount: number;
  generatedOn?: string;
};

function sanitizeFilename(name: string) {
  return name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) || "report";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBarChartSvg(series: PreviewChartSeries): string {
  const width = 760;
  const height = 320;
  const margin = { top: 36, right: 24, bottom: 72, left: 56 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(...series.points.map((point) => point.value), 1);
  const barGap = 16;
  const barWidth = Math.min(
    56,
    (chartWidth - barGap * (series.points.length - 1)) / series.points.length,
  );
  const groupWidth = barWidth + barGap;

  const bars = series.points
    .map((point, index) => {
      const barHeight = (point.value / maxValue) * chartHeight;
      const x = margin.left + index * groupWidth + (groupWidth - barWidth) / 2;
      const y = margin.top + chartHeight - barHeight;
      const labelX = x + barWidth / 2;
      const categoryY = margin.top + chartHeight + 18;
      return `
        <g>
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" fill="${point.color}" rx="2" />
          <text x="${labelX.toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="${reportChartTheme.text}">${escapeHtml(point.displayValue)}</text>
          <text x="${labelX.toFixed(1)}" y="${categoryY.toFixed(1)}" text-anchor="end" font-size="10" fill="${reportChartTheme.muted}" transform="rotate(-35 ${labelX.toFixed(1)} ${categoryY.toFixed(1)})">${escapeHtml(point.label)}</text>
        </g>`;
    })
    .join("");

  const gridLines = [0, 0.25, 0.5, 0.75, 1]
    .map((ratio) => {
      const y = margin.top + chartHeight * (1 - ratio);
      const value = maxValue * ratio;
      return `
        <line x1="${margin.left}" y1="${y.toFixed(1)}" x2="${(width - margin.right).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${reportChartTheme.grid}" stroke-dasharray="4 4" />
        <text x="${(margin.left - 8).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="${reportChartTheme.mutedLight}">${escapeHtml(formatAxisValue(value, series.unit))}</text>`;
    })
    .join("");

  const yAxisLabel = escapeHtml(getPreviewChartAxisLabel(series));
  const xAxisLabel = escapeHtml(series.labelColumn.label);

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="Bar chart by ${xAxisLabel}">
      ${gridLines}
      <line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${width - margin.right}" y2="${margin.top + chartHeight}" stroke="${reportChartTheme.border}" />
      ${bars}
      <text x="${(margin.left - 28).toFixed(1)}" y="${(margin.top + chartHeight / 2).toFixed(1)}" text-anchor="middle" font-size="11" fill="${reportChartTheme.muted}" transform="rotate(-90 ${(margin.left - 28).toFixed(1)} ${(margin.top + chartHeight / 2).toFixed(1)})">${yAxisLabel}</text>
      <text x="${(margin.left + chartWidth / 2).toFixed(1)}" y="${(height - 16).toFixed(1)}" text-anchor="middle" font-size="11" fill="${reportChartTheme.muted}">${xAxisLabel}</text>
    </svg>`;
}

function buildPieChartSvg(series: PreviewChartSeries): string {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 98;
  const innerRadius = 62;
  const total = series.points.reduce((sum, point) => sum + point.value, 0) || 1;
  let startAngle = -Math.PI / 2;

  const slices = series.points
    .map((point) => {
      const sliceAngle = (point.value / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      const x1 = cx + outerRadius * Math.cos(startAngle);
      const y1 = cy + outerRadius * Math.sin(startAngle);
      const x2 = cx + outerRadius * Math.cos(endAngle);
      const y2 = cy + outerRadius * Math.sin(endAngle);
      const x3 = cx + innerRadius * Math.cos(endAngle);
      const y3 = cy + innerRadius * Math.sin(endAngle);
      const x4 = cx + innerRadius * Math.cos(startAngle);
      const y4 = cy + innerRadius * Math.sin(startAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const path = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`;
      startAngle = endAngle;

      return `<path d="${path}" fill="${point.color}" stroke="#ffffff" stroke-width="2" />`;
    })
    .join("");

  const totalLabel = total.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const metricLabel = escapeHtml(series.valueColumn.label.replace(/\([^)]*\)/g, "").trim());

  return `
    <svg viewBox="0 0 ${size} ${size}" width="100%" height="${size}" role="img" aria-label="Pie chart by ${escapeHtml(series.labelColumn.label)}">
      ${slices}
      <text x="${cx}" y="${(cy - 4).toFixed(1)}" text-anchor="middle" font-size="18" font-weight="700" fill="${reportChartTheme.text}">${escapeHtml(totalLabel)}</text>
      <text x="${cx}" y="${(cy + 16).toFixed(1)}" text-anchor="middle" font-size="11" fill="${reportChartTheme.muted}">${metricLabel}</text>
    </svg>`;
}

function buildLegendHtml(series: PreviewChartSeries): string {
  const total = series.points.reduce((sum, point) => sum + point.value, 0) || 1;
  return `
    <ul class="legend">
      ${series.points
        .map((point) => {
          const pct = Math.round((point.value / total) * 100);
          return `
        <li>
          <span class="legend-swatch" style="background:${point.color}"></span>
          <span class="legend-label">${escapeHtml(point.label)}</span>
          <span class="legend-value">${escapeHtml(point.displayValue)} <span class="legend-pct">(${pct}%)</span></span>
        </li>`;
        })
        .join("")}
    </ul>`;
}

function buildTableHtml(columns: PreviewColumn[], rows: PreviewRow[]): string {
  if (columns.length === 0) {
    return `<p class="empty-note">No tabular preview data available.</p>`;
  }

  return `
    <table>
      <thead>
        <tr>${columns.map((col) => `<th scope="col">${escapeHtml(col.label)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${
          rows.length > 0
            ? rows
                .map(
                  (row) =>
                    `<tr>${columns.map((col) => `<td>${escapeHtml(row[col.key] ?? "—")}</td>`).join("")}</tr>`,
                )
                .join("")
            : `<tr><td colspan="${columns.length}">No records match your filters.</td></tr>`
        }
      </tbody>
    </table>`;
}

function buildChartsSection(series: PreviewChartSeries | null): string {
  if (!series) {
    return `<section><h2>Charts</h2><p class="empty-note">Charts are unavailable for this report data.</p></section>`;
  }

  return `
    <section>
      <h2>Charts</h2>
      <div class="chart-section">
        <h3>Bar chart by ${escapeHtml(series.labelColumn.label)}</h3>
        <div class="chart-frame">${buildBarChartSvg(series)}</div>
        ${buildLegendHtml(series)}
      </div>
      <div class="chart-section">
        <h3>Pie chart by ${escapeHtml(series.labelColumn.label)}</h3>
        <div class="chart-frame chart-frame--pie">${buildPieChartSvg(series)}</div>
        ${buildLegendHtml(series)}
      </div>
    </section>`;
}

export function downloadPreviewReport(payload: PreviewReportDownloadPayload): void {
  const series = buildPreviewChartSeries(payload.columns, payload.rows);
  const generatedOn = payload.generatedOn ?? new Date().toLocaleString();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(payload.reportName)} — Report Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"
  />
  <style>
    :root {
      color: ${reportChartTheme.text};
      font-family: 'Instrument Sans', system-ui, sans-serif;
      background: ${reportChartTheme.pageBg};
    }
    body { margin: 0; padding: 32px; }
    .report-shell { max-width: 920px; margin: 0 auto; background: ${reportChartTheme.surface}; border: 1px solid ${reportChartTheme.border}; border-radius: 12px; overflow: hidden; }
    .report-header { padding: 24px 28px; border-bottom: 1px solid ${reportChartTheme.border}; }
    h1 { margin: 0 0 6px; font-size: 22px; }
    .meta { margin: 0; color: ${reportChartTheme.muted}; font-size: 13px; }
    section { padding: 24px 28px; border-bottom: 1px solid ${reportChartTheme.border}; }
    section:last-child { border-bottom: none; }
    h2 { margin: 0 0 16px; font-size: 16px; }
    h3 { margin: 0 0 12px; text-align: center; font-size: 15px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 10px 12px; border-bottom: 1px solid ${reportChartTheme.grid}; text-align: left; }
    th { background: ${reportChartTheme.pageBg}; color: ${reportChartTheme.muted}; font-weight: 600; }
    .chart-section { margin-bottom: 28px; }
    .chart-section:last-child { margin-bottom: 0; }
    .chart-frame { padding: 12px 8px 0; background: ${reportChartTheme.surface}; border: 1px solid ${reportChartTheme.border}; border-radius: 10px; }
    .chart-frame--pie { display: flex; justify-content: center; }
    .legend { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px 16px; }
    .legend li { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .legend-swatch { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
    .legend-label { color: ${reportChartTheme.muted}; flex: 1; min-width: 0; }
    .legend-value { font-weight: 600; white-space: nowrap; }
    .legend-pct { font-weight: 500; color: ${reportChartTheme.mutedLight}; }
    .empty-note { margin: 0; color: ${reportChartTheme.mutedLight}; font-size: 13px; }
    .report-footer { padding: 14px 28px 20px; font-size: 11px; color: ${reportChartTheme.mutedLight}; }
  </style>
</head>
<body>
  <div class="report-shell">
    <header class="report-header">
      <h1>${escapeHtml(payload.reportName)}</h1>
      <p class="meta">Generated on ${escapeHtml(generatedOn)} · ${payload.totalCount.toLocaleString()} records</p>
    </header>
    <section>
      <h2>Preview Data</h2>
      ${buildTableHtml(payload.columns, payload.rows)}
    </section>
    ${buildChartsSection(series)}
    <footer class="report-footer">Exported from Eluv8P2P Report Center</footer>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFilename(payload.reportName)}-report.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}
