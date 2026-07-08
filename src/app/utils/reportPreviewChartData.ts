import { reportChartPalette, reportChartTheme } from "../tokens/reportChartTheme";
import type { PreviewColumn, PreviewRow } from "./reportPreviewData";

export type PreviewChartPoint = {
  label: string;
  value: number;
  displayValue: string;
  color: string;
};

export type PreviewChartSeries = {
  labelColumn: PreviewColumn;
  valueColumn: PreviewColumn;
  unit: string;
  points: PreviewChartPoint[];
};

export { reportChartPalette, reportChartTheme };

const LABEL_KEY_HINTS =
  /approver|vendor|department|category|status|name|project|type|owner|requester|user/i;
const VALUE_KEY_HINTS =
  /amount|time|hours|hrs|count|total|spend|approval|requested|approved|variance|orders|prs|pos|invoices/i;

function parseNumericCell(raw: string): { value: number; unit: string } | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "—") return null;

  const normalized = trimmed.replace(/,/g, "");

  const patterns: Array<{ regex: RegExp; unit: string }> = [
    { regex: /^([+-]?\d+(?:\.\d+)?)\s*(hrs?|hours?)$/i, unit: "hrs" },
    { regex: /^([+-]?\d+(?:\.\d+)?)\s*days?$/i, unit: "days" },
    { regex: /^([+-]?\d+(?:\.\d+)?)\s*%$/, unit: "%" },
    { regex: /^\$([+-]?\d+(?:\.\d+)?)$/, unit: "USD" },
    { regex: /^([+-]?\d+(?:\.\d+)?)$/, unit: "" },
  ];

  for (const { regex, unit } of patterns) {
    const match = normalized.match(regex);
    if (match) {
      const value = Number.parseFloat(match[1]);
      if (Number.isFinite(value)) return { value, unit };
    }
  }

  return null;
}

function columnNumericScore(column: PreviewColumn, rows: PreviewRow[]): number {
  if (rows.length === 0) return 0;
  const parsed = rows.map((row) => parseNumericCell(row[column.key] ?? ""));
  const hits = parsed.filter(Boolean).length;
  return hits / rows.length;
}

function pickLabelColumn(columns: PreviewColumn[], rows: PreviewRow[]): PreviewColumn | null {
  const byHint = columns.find((col) => LABEL_KEY_HINTS.test(col.key) || LABEL_KEY_HINTS.test(col.label));
  if (byHint) return byHint;

  const textColumns = columns.filter((col) => columnNumericScore(col, rows) < 0.5);
  return textColumns[0] ?? columns[0] ?? null;
}

function pickValueColumn(
  columns: PreviewColumn[],
  rows: PreviewRow[],
  labelColumn: PreviewColumn,
): PreviewColumn | null {
  const candidates = columns.filter((col) => col.key !== labelColumn.key);
  const byHint = candidates.find((col) => VALUE_KEY_HINTS.test(col.key) || VALUE_KEY_HINTS.test(col.label));
  if (byHint) return byHint;

  let best: PreviewColumn | null = null;
  let bestScore = 0;
  for (const col of candidates) {
    const score = columnNumericScore(col, rows);
    if (score > bestScore) {
      bestScore = score;
      best = col;
    }
  }
  return bestScore >= 0.5 ? best : null;
}

function formatDisplayValue(value: number, unit: string): string {
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  if (unit === "USD") return `$${formatted}`;
  if (unit === "%") return `${formatted}%`;
  if (unit === "hrs") return `${formatted} hrs`;
  if (unit === "days") return `${formatted} days`;
  return formatted;
}

function formatAxisValue(value: number, unit: string): string {
  const abs = Math.abs(value);
  if (unit === "USD") {
    if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
    return `$${value}`;
  }
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

export function buildPreviewChartSeries(
  columns: PreviewColumn[],
  rows: PreviewRow[],
): PreviewChartSeries | null {
  if (columns.length < 2 || rows.length === 0) return null;

  const labelColumn = pickLabelColumn(columns, rows);
  if (!labelColumn) return null;

  const valueColumn = pickValueColumn(columns, rows, labelColumn);
  if (!valueColumn) return null;

  const aggregated = new Map<string, { value: number; unit: string }>();

  for (const row of rows) {
    const label = (row[labelColumn.key] ?? "").trim();
    if (!label) continue;

    const parsed = parseNumericCell(row[valueColumn.key] ?? "");
    if (!parsed) continue;

    const existing = aggregated.get(label);
    if (existing) {
      existing.value += parsed.value;
      if (!existing.unit && parsed.unit) existing.unit = parsed.unit;
    } else {
      aggregated.set(label, { value: parsed.value, unit: parsed.unit });
    }
  }

  if (aggregated.size === 0) return null;

  const unit =
    [...aggregated.values()].find((entry) => entry.unit)?.unit ??
    (VALUE_KEY_HINTS.test(valueColumn.key) || VALUE_KEY_HINTS.test(valueColumn.label) ? "" : "");

  const points = [...aggregated.entries()]
    .map(([label, entry], index) => ({
      label,
      value: entry.value,
      displayValue: formatDisplayValue(entry.value, entry.unit || unit),
      color: reportChartPalette[index % reportChartPalette.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);

  return {
    labelColumn,
    valueColumn,
    unit,
    points,
  };
}

export function getPreviewChartAxisLabel(series: PreviewChartSeries): string {
  const label = series.valueColumn.label.replace(/\([^)]*\)/g, "").trim();
  if (series.unit === "hrs") return `${label} ()`;
  if (series.unit) return `${label} (${series.unit})`;
  return label;
}

export { formatAxisValue };
