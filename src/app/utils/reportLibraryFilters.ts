import type { LibraryCollection } from "../components/reports/ReportCenterNav";
import type { ReportHistoryItem } from "../data/reportHistory";
import { parseReportDate } from "./reportRunConfigUtils";

export const RECENT_REPORT_DAYS = 30;

export const LIBRARY_COLLECTION_LABELS: Record<LibraryCollection, string> = {
  all: "All Reports",
  recent: "Recent",
  saved: "Saved",
  starred: "Starred",
  running: "Running",
  scheduled: "Scheduled",
  failed: "Failed",
};

export type LibraryDateFilter = "all" | "today" | "this_week" | "this_month" | "this_quarter" | "this_year";

export type LibraryToolbarFilters = {
  type: string;
  status: string;
  owner: string;
  dateRange: LibraryDateFilter;
};

export type LibraryFilterInput = {
  history: ReportHistoryItem[];
  collection: LibraryCollection;
  starredIds: Set<string>;
  scheduledReportNames: Set<string>;
  searchQuery: string;
  filters: LibraryToolbarFilters;
};

export function isRecentReport(lastRun: string, now = new Date()): boolean {
  const date = parseReportDate(lastRun);
  if (!date) return false;
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= RECENT_REPORT_DAYS;
}

export function isWithinDateFilter(
  lastRun: string,
  filter: LibraryDateFilter,
  now = new Date(),
): boolean {
  if (filter === "all") return true;
  const date = parseReportDate(lastRun);
  if (!date) return false;

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  if (filter === "today") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  if (filter === "this_week") return date >= startOfWeek && date <= endOfToday;

  if (filter === "this_month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }

  if (filter === "this_quarter") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
    return date >= quarterStart && date <= endOfToday;
  }

  if (filter === "this_year") {
    return date.getFullYear() === now.getFullYear();
  }

  return true;
}

export function applyCollectionFilter(
  rows: ReportHistoryItem[],
  collection: LibraryCollection,
  starredIds: Set<string>,
  scheduledReportNames: Set<string>,
  now = new Date(),
): ReportHistoryItem[] {
  switch (collection) {
    case "saved":
      return rows.filter((row) => row.saved);
    case "starred":
      return rows.filter((row) => starredIds.has(row.id) || row.starred);
    case "failed":
      return rows.filter((row) => row.status === "failed");
    case "running":
      return rows.filter((row) => row.status === "running");
    case "scheduled":
      return rows.filter((row) => scheduledReportNames.has(row.reportName.trim().toLowerCase()));
    case "recent":
      return rows.filter((row) => isRecentReport(row.lastRun, now));
    case "all":
    default:
      return rows;
  }
}

export function applyToolbarFilters(
  rows: ReportHistoryItem[],
  filters: LibraryToolbarFilters,
  searchQuery: string,
  now = new Date(),
): ReportHistoryItem[] {
  let result = [...rows];

  if (filters.type !== "all") {
    result = result.filter((row) => row.type === filters.type);
  }
  if (filters.status !== "all") {
    result = result.filter((row) => row.status === filters.status);
  }
  if (filters.owner !== "all") {
    result = result.filter((row) => row.owner === filters.owner);
  }
  if (filters.dateRange !== "all") {
    result = result.filter((row) => isWithinDateFilter(row.lastRun, filters.dateRange, now));
  }

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    result = result.filter(
      (row) =>
        row.reportName.toLowerCase().includes(query) ||
        row.type.toLowerCase().includes(query) ||
        row.owner.toLowerCase().includes(query),
    );
  }

  return result;
}

export function filterLibraryReports(input: LibraryFilterInput, now = new Date()): ReportHistoryItem[] {
  const collected = applyCollectionFilter(
    input.history,
    input.collection,
    input.starredIds,
    input.scheduledReportNames,
    now,
  );
  return applyToolbarFilters(collected, input.filters, input.searchQuery, now);
}

export type LibraryCollectionCounts = {
  library: number;
  saved: number;
  starred: number;
  failed: number;
  running: number;
  scheduled: number;
  recent: number;
};

export function computeCollectionCounts(
  history: ReportHistoryItem[],
  starredIds: Set<string>,
  scheduledReportNames: Set<string>,
  now = new Date(),
): LibraryCollectionCounts {
  return {
    library: history.length,
    saved: history.filter((row) => row.saved).length,
    starred: history.filter((row) => starredIds.has(row.id) || row.starred).length,
    failed: history.filter((row) => row.status === "failed").length,
    running: history.filter((row) => row.status === "running").length,
    scheduled: history.filter((row) =>
      scheduledReportNames.has(row.reportName.trim().toLowerCase()),
    ).length,
    recent: history.filter((row) => isRecentReport(row.lastRun, now)).length,
  };
}

export function hasActiveLibraryFilters(
  collection: LibraryCollection,
  filters: LibraryToolbarFilters,
  searchQuery: string,
): boolean {
  return (
    collection !== "all" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.owner !== "all" ||
    filters.dateRange !== "all" ||
    searchQuery.trim().length > 0
  );
}

export const EMPTY_LIBRARY_FILTERS: LibraryToolbarFilters = {
  type: "all",
  status: "all",
  owner: "all",
  dateRange: "all",
};
