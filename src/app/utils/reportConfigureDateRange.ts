import type { DateRangePreset } from "../data/reportConfigureOptions";

/** Demo anchor aligned with reportDateRange.ts */
const ANCHOR = new Date(2026, 6, 6);

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/** Resolve configure-panel date presets to ISO start/end for API payloads. */
export function resolveConfigureDateRange(
  preset: string,
  customStart?: string,
  customEnd?: string,
): { start: string; end: string } {
  if (customStart && customEnd) {
    return { start: customStart, end: customEnd };
  }

  const now = ANCHOR;

  switch (preset as DateRangePreset | "custom") {
    case "last_7_days": {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return { start: toIsoDate(start), end: toIsoDate(now) };
    }
    case "last_30_days": {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return { start: toIsoDate(start), end: toIsoDate(now) };
    }
    case "this_month":
      return { start: toIsoDate(startOfMonth(now)), end: toIsoDate(endOfMonth(now)) };
    case "this_quarter": {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      const end = new Date(now.getFullYear(), q * 3 + 3, 0);
      return { start: toIsoDate(start), end: toIsoDate(end) };
    }
    case "ytd":
      return {
        start: toIsoDate(new Date(now.getFullYear(), 0, 1)),
        end: toIsoDate(now),
      };
    case "custom":
      return {
        start: customStart ?? toIsoDate(new Date(now.getFullYear(), 0, 1)),
        end: customEnd ?? toIsoDate(now),
      };
    default:
      return {
        start: toIsoDate(new Date(now.getFullYear(), 0, 1)),
        end: toIsoDate(now),
      };
  }
}

export function getConfigureDateBounds(preset: string, customStart?: string, customEnd?: string) {
  const range = resolveConfigureDateRange(preset, customStart, customEnd);
  return {
    start: new Date(`${range.start}T00:00:00`),
    end: new Date(`${range.end}T23:59:59`),
  };
}
