export type PageDateRange =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "last_quarter"
  | "this_year"
  | "custom";

export type CustomDateRange = {
  start: string;
  end: string;
};

/** Demo anchor: Jul 6, 2026 */
const ANCHOR = new Date(2026, 6, 6);

export const pageDateRangeLabels: Record<PageDateRange, string> = {
  this_month: "This Month",
  last_month: "Last Month",
  this_quarter: "This Quarter",
  last_quarter: "Last Quarter",
  this_year: "This Year",
  custom: "Custom Range",
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getDateRangeBounds(
  range: PageDateRange,
  custom?: CustomDateRange | null,
): { start: Date; end: Date } {
  const now = ANCHOR;

  switch (range) {
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last_month": {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { start: startOfMonth(prev), end: endOfMonth(prev) };
    }
    case "this_quarter": {
      const q = Math.floor(now.getMonth() / 3);
      return {
        start: new Date(now.getFullYear(), q * 3, 1),
        end: new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999),
      };
    }
    case "last_quarter": {
      const q = Math.floor(now.getMonth() / 3) - 1;
      const year = q < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const adjustedQ = q < 0 ? 3 : q;
      return {
        start: new Date(year, adjustedQ * 3, 1),
        end: new Date(year, adjustedQ * 3 + 3, 0, 23, 59, 59, 999),
      };
    }
    case "this_year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    case "custom": {
      if (custom?.start && custom?.end) {
        return {
          start: new Date(`${custom.start}T00:00:00`),
          end: new Date(`${custom.end}T23:59:59`),
        };
      }
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: endOfMonth(now),
      };
    }
    default:
      return { start: new Date(now.getFullYear(), 0, 1), end: endOfMonth(now) };
  }
}

export function isDateInRange(iso: string, range: PageDateRange, custom?: CustomDateRange | null): boolean {
  const { start, end } = getDateRangeBounds(range, custom);
  const d = new Date(iso);
  return d >= start && d <= end;
}

/** Scale factor for KPI totals based on selected range (demo approximation). */
export function rangeScaleFactor(range: PageDateRange, custom?: CustomDateRange | null): number {
  if (range === "custom" && custom?.start && custom?.end) {
    const { start, end } = getDateRangeBounds(range, custom);
    const days = Math.max(1, (end.getTime() - start.getTime()) / 86400000);
    return Math.min(1, days / 365);
  }
  const factors: Record<PageDateRange, number> = {
    this_month: 0.09,
    last_month: 0.085,
    this_quarter: 0.26,
    last_quarter: 0.24,
    this_year: 1,
    custom: 0.5,
  };
  return factors[range];
}

export function formatRangeLabel(range: PageDateRange, custom?: CustomDateRange | null): string {
  if (range === "custom" && custom?.start && custom?.end) {
    const fmt = (s: string) =>
      new Date(`${s}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${fmt(custom.start)} – ${fmt(custom.end)}`;
  }
  return pageDateRangeLabels[range];
}
