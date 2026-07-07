import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { ReportHistoryItem, ReportHistoryStatus } from "../data/reportHistory";
import type { ReportTemplateGroup } from "../data/reportTemplates";
import type { ScheduledReport } from "../data/scheduledReports";
import type { RecentActivityItem, RecentActivityType } from "../data/reportRecentActivity";
import type { GeneratedReportResult, ReportRunConfig } from "../components/reports/reportGenerationTypes";
import {
  deleteSavedReport,
  downloadReportFile,
  editSchedule,
  flattenTemplateList,
  generateReport,
  generateReportPage,
  getOverviewData,
  getReportTemplates,
  getSavedReports,
  getSavedReportsForYear,
  getScheduleReports,
  pauseOrResumeSchedule,
  saveReport,
  sendSavedReportEmail,
} from "../services/reportService";
import { ApiError, isReportApiConfigured } from "../services/apiClient";
import {
  mapGenerateReportPreview,
  mapOverviewCharts,
  mapOverviewCounts,
  mapSavedReportItem,
  mapScheduledReportItem,
  mapTemplateItem,
  groupTemplates,
  isOverviewDataEmpty,
  type OverviewChartSeries,
  type OverviewKpiCounts,
} from "../utils/reportApiMappers";
import {
  buildGenerateReportRequest,
  buildGenerateReportRequestFromSaved,
  buildSaveReportRequest,
} from "../utils/reportPayloadBuilders";
import type { PreviewColumn, PreviewRow } from "../utils/reportPreviewData";
import {
  downloadGeneratedReport,
  downloadReportAsCsv,
  downloadReportsBulk,
  type ExportFormat,
} from "../utils/reportExport";
import { DEFAULT_TIMEZONE } from "../types/reportApi";
import type { SavedReportApiItem } from "../types/reportApi";
import {
  resolveReportApiError,
  shouldToastReportApiFailure,
} from "../utils/reportApiErrors";
import {
  DEMO_OVERVIEW_CHARTS,
  DEMO_OVERVIEW_COUNTS,
  DEMO_PREVIEW_DATA,
  DEMO_RECENT_ACTIVITY,
  DEMO_REPORT_HISTORY,
  DEMO_SCHEDULED_REPORTS,
  DEMO_TEMPLATE_GROUPS,
  isDemoReportDataEnabled,
} from "../data/reportDemoData";

/** Normalize saved-report rows for library display without altering API mappers. */
function normalizeLibraryReportItem(item: ReportHistoryItem): ReportHistoryItem {
  return {
    ...item,
    owner: "—",
    lastRun: item.created,
    status: "completed",
  };
}

function buildLatestReportByTemplateId(history: ReportHistoryItem[]): Map<string, ReportHistoryItem> {
  const map = new Map<string, ReportHistoryItem>();
  const sorted = [...history].sort(
    (a, b) => (Date.parse(b.created) || 0) - (Date.parse(a.created) || 0),
  );

  for (const row of sorted) {
    const keys = [row.runConfig?.templateId, row.apiPayload?.reportTemplateType, row.type].filter(
      (key): key is string => Boolean(key),
    );
    for (const key of keys) {
      if (!map.has(key)) map.set(key, row);
    }
  }

  return map;
}

function mapSavedReportsFromApi(
  items: SavedReportApiItem[],
  starred: Set<string>,
  saved: Set<string>,
): ReportHistoryItem[] {
  return items.map((item) => {
    const histItem = normalizeLibraryReportItem(mapSavedReportItem(item, starred, saved));
    return {
      ...histItem,
      starred: starred.has(histItem.id) || histItem.starred,
      saved: saved.has(histItem.id),
    };
  });
}

const STARRED_KEY = "eluv8p2p_starred_reports";
const LEGACY_STARRED_KEY = "element-p2p-report-starred-ids";
const SAVED_KEY = "element-p2p-report-saved-ids";

function loadStarredIds(): Set<string> {
  const current = loadIdSet(STARRED_KEY);
  if (current.size > 0) return current;
  const legacy = loadIdSet(LEGACY_STARRED_KEY);
  if (legacy.size > 0) {
    saveIdSet(STARRED_KEY, legacy);
  }
  return legacy;
}

export type ReportPreviewState = {
  columns: PreviewColumn[];
  rows: PreviewRow[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  generatedOn?: string;
  fileSize?: string;
  loading: boolean;
  error?: string;
};

function loadIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveIdSet(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...ids]));
}

function formatNow() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

type ReportsContextValue = {
  history: ReportHistoryItem[];
  libraryPageRows: ReportHistoryItem[];
  libraryApiTotalCount: number;
  scheduledReports: ScheduledReport[];
  templateGroups: ReportTemplateGroup[];
  activity: RecentActivityItem[];
  starredIds: Set<string>;
  refreshKey: number;
  overviewCounts: OverviewKpiCounts | null;
  overviewCharts: OverviewChartSeries | null;
  isLoadingLibrary: boolean;
  isLoadingOverview: boolean;
  isLoadingTemplates: boolean;
  isLoadingSchedules: boolean;
  libraryError: string | null;
  overviewError: string | null;
  schedulesError: string | null;
  templatesError: string | null;
  reportPreviews: Record<string, ReportPreviewState>;
  scheduledReportNames: Set<string>;
  addActivity: (type: RecentActivityType, description: string, user?: string) => void;
  refreshOverview: () => Promise<void>;
  reloadLibrary: () => Promise<boolean>;
  fetchLibraryPage: (
    pageIndex: number,
    sortParam: "asc" | "desc",
    options?: { silent?: boolean },
  ) => Promise<boolean>;
  reloadSchedules: () => Promise<boolean>;
  reloadTemplates: () => Promise<boolean>;
  reloadOverview: () => Promise<boolean>;
  loadReportPreview: (reportId: string, pageIndex?: number, pageSize?: number) => Promise<void>;
  toggleStar: (id: string) => void;
  toggleSave: (id: string) => void;
  deleteHistoryItem: (id: string) => Promise<boolean>;
  deleteHistoryItems: (ids: string[]) => Promise<void>;
  duplicateHistoryItem: (id: string) => void;
  retryFailedReport: (id: string) => Promise<void>;
  viewReport: (id: string) => void;
  downloadReport: (id: string) => Promise<void>;
  emailReport: (id: string, recipients: string, subject: string) => Promise<boolean>;
  exportOverview: (format: ExportFormat) => void;
  exportReportById: (id: string, format: ExportFormat) => void;
  exportAllReports: (scope: string, format: ExportFormat) => void;
  exportReportsByIds: (ids: string[], format: ExportFormat) => void;
  addFromGeneration: (config: ReportRunConfig, result: GeneratedReportResult) => Promise<string>;
  pauseScheduled: (id: string) => Promise<void>;
  resumeScheduled: (id: string) => Promise<void>;
  deleteScheduled: (id: string) => void;
  updateScheduled: (
    id: string,
    patch: Pick<ScheduledReport, "frequency" | "recipients" | "timezone" | "deliveryTime" | "emailSubject">,
  ) => Promise<boolean>;
  getScheduleForReport: (reportId: string, reportName?: string) => ScheduledReport | undefined;
  findLatestReportByTemplateId: (templateId: string) => ReportHistoryItem | undefined;
  saveReportFromSuccess: (result: GeneratedReportResult) => Promise<void>;
  downloadGenerated: (result: GeneratedReportResult) => void;
  getHistoryItem: (id: string) => ReportHistoryItem | undefined;
  runReportAgain: (report: ReportHistoryItem) => Promise<GeneratedReportResult | null>;
};

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [starredIds, setStarredIds] = useState<Set<string>>(() => loadStarredIds());
  const [savedIds, setSavedIds] = useState<Set<string>>(() => loadIdSet(SAVED_KEY));
  const [refreshKey, setRefreshKey] = useState(0);
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [libraryPageRows, setLibraryPageRows] = useState<ReportHistoryItem[]>([]);
  const [libraryApiTotalCount, setLibraryApiTotalCount] = useState(0);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [templateGroups, setTemplateGroups] = useState<ReportTemplateGroup[]>([]);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [overviewCounts, setOverviewCounts] = useState<OverviewKpiCounts | null>(null);
  const [overviewCharts, setOverviewCharts] = useState<OverviewChartSeries | null>(null);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [reportPreviews, setReportPreviews] = useState<Record<string, ReportPreviewState>>({});
  const historyRef = useRef<ReportHistoryItem[]>([]);
  const previewRequestSeqRef = useRef<Record<string, number>>({});
  const hasLoadedOnceRef = useRef(false);

  // Latest-ref pattern: always holds current starred/saved sets without being in useCallback deps.
  // This prevents reloadLibrary from recreating on every star/save action, which would otherwise
  // re-trigger the bootstrap useEffect and fire all 4 API reload calls unnecessarily.
  const starredIdsRef = useRef<Set<string>>(starredIds);
  starredIdsRef.current = starredIds;

  const savedIdsRef = useRef<Set<string>>(savedIds);
  savedIdsRef.current = savedIds;

  const scheduledReportNames = useMemo(
    () => new Set(scheduledReports.map((row) => row.reportName.trim().toLowerCase())),
    [scheduledReports],
  );

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const reloadLibrary = useCallback(async (options?: { silent?: boolean }): Promise<boolean> => {
    setIsLoadingLibrary(true);
    setLibraryError(null);
    if (isDemoReportDataEnabled()) {
      const demoRows = DEMO_REPORT_HISTORY.map(normalizeLibraryReportItem);
      setHistory(demoRows);
      setIsLoadingLibrary(false);
      return true;
    }
    try {
      // Option A: no month picker in the library UI — load the full current year via
      // getSavedReportsForYear (12 parallel GetSavedReport calls) and paginate client-side.
      const year = new Date().getFullYear();
      const result = await getSavedReportsForYear(year);
      const starred = starredIdsRef.current;
      const saved = savedIdsRef.current;
      const mapped = mapSavedReportsFromApi(result.items, starred, saved);
      setHistory(mapped);
      return true;
    } catch (error) {
      const resolved = resolveReportApiError(error);
      setLibraryError(resolved.message);
      if (!options?.silent && shouldToastReportApiFailure(error)) {
        toast.error(resolved.message);
      }
      return false;
    } finally {
      setIsLoadingLibrary(false);
    }
  }, []);

  // Paginated table fetch — calls getSavedReports with pageIndex + sortParam (current month/year).
  const fetchLibraryPage = useCallback(
    async (pageIndex: number, sortParam: "asc" | "desc", options?: { silent?: boolean }): Promise<boolean> => {
      setIsLoadingLibrary(true);
      setLibraryError(null);
      if (isDemoReportDataEnabled()) {
        const demoRows = DEMO_REPORT_HISTORY.map(normalizeLibraryReportItem);
        setLibraryApiTotalCount(demoRows.length);
        const start = (pageIndex - 1) * 10;
        setLibraryPageRows(demoRows.slice(start, start + 10));
        setIsLoadingLibrary(false);
        return true;
      }
      try {
        const now = new Date();
        const response = await getSavedReports({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          sortBy: "CreatedAt",
          sortParam,
          pageIndex,
          pageSize: 10,
        });
        const starred = starredIdsRef.current;
        const saved = savedIdsRef.current;
        const pageRows = mapSavedReportsFromApi(response.items, starred, saved);
        setLibraryPageRows(pageRows);
        setLibraryApiTotalCount(response.totalCount ?? pageRows.length);
        setHistory((prev) => {
          const merged = new Map(prev.map((row) => [row.id, row]));
          pageRows.forEach((row) => merged.set(row.id, row));
          return [...merged.values()];
        });
        return true;
      } catch (error) {
        const resolved = resolveReportApiError(error);
        setLibraryError(resolved.message);
        if (!options?.silent && shouldToastReportApiFailure(error)) {
          toast.error(resolved.message);
        }
        return false;
      } finally {
        setIsLoadingLibrary(false);
      }
    },
    [],
  );

  const reloadSchedules = useCallback(async (options?: { silent?: boolean }): Promise<boolean> => {
    setIsLoadingSchedules(true);
    setSchedulesError(null);
    if (isDemoReportDataEnabled()) {
      setScheduledReports(DEMO_SCHEDULED_REPORTS);
      setIsLoadingSchedules(false);
      return true;
    }
    try {
      const now = new Date();
      const result = await getScheduleReports({
        timeZoneId: DEFAULT_TIMEZONE,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        sortBy: "CreatedAt",
        sortParam: "desc",
        pageIndex: 1,
        pageSize: 100,
      });
      setScheduledReports(result.items.map(mapScheduledReportItem));
      return true;
    } catch (error) {
      const resolved = resolveReportApiError(error);
      setSchedulesError(resolved.message);
      if (!options?.silent && shouldToastReportApiFailure(error)) {
        toast.error(resolved.message);
      }
      return false;
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  const reloadTemplates = useCallback(async (options?: { silent?: boolean }): Promise<boolean> => {
    setIsLoadingTemplates(true);
    setTemplatesError(null);
    if (isDemoReportDataEnabled()) {
      setTemplateGroups(DEMO_TEMPLATE_GROUPS);
      setIsLoadingTemplates(false);
      return true;
    }
    try {
      const data = await getReportTemplates();
      const flat = flattenTemplateList(data).map(mapTemplateItem);
      setTemplateGroups(groupTemplates(flat));
      return true;
    } catch (error) {
      const resolved = resolveReportApiError(error);
      setTemplatesError(resolved.message);
      if (!options?.silent && shouldToastReportApiFailure(error)) {
        toast.error(resolved.message);
      }
      return false;
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  const reloadOverview = useCallback(async (options?: { silent?: boolean }): Promise<boolean> => {
    setIsLoadingOverview(true);
    setOverviewError(null);
    if (isDemoReportDataEnabled()) {
      setOverviewCounts(DEMO_OVERVIEW_COUNTS);
      setOverviewCharts(DEMO_OVERVIEW_CHARTS);
      setRefreshKey((value) => value + 1);
      setIsLoadingOverview(false);
      return true;
    }
    try {
      const data = await getOverviewData();
      if (isOverviewDataEmpty(data)) {
        setOverviewCounts(null);
        setOverviewCharts(null);
        setOverviewError("Overview data is not available for your tenant.");
        return false;
      }
      setOverviewCounts(mapOverviewCounts(data));
      setOverviewCharts(mapOverviewCharts(data));
      setRefreshKey((value) => value + 1);
      return true;
    } catch (error) {
      const resolved = resolveReportApiError(error);
      setOverviewError(resolved.message);
      if (!options?.silent && shouldToastReportApiFailure(error)) {
        toast.error(resolved.message);
      }
      return false;
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    if (isDemoReportDataEnabled()) {
      setActivity(DEMO_RECENT_ACTIVITY);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const [libraryOk, schedulesOk, templatesOk, overviewOk] = await Promise.all([
        reloadLibrary({ silent: true }),
        reloadSchedules({ silent: true }),
        reloadTemplates({ silent: true }),
        reloadOverview({ silent: true }),
      ]);
      if (libraryOk) {
        await fetchLibraryPage(1, "desc", { silent: true });
      }
      const successCount = [libraryOk, schedulesOk, templatesOk, overviewOk].filter(Boolean).length;
      hasLoadedOnceRef.current = true;
      if (isDemoReportDataEnabled()) return;
      if (successCount === 0) {
        const authHint = isReportApiConfigured()
          ? "Report data is unavailable. Ensure a tenant is selected in the procurement API."
          : "Report data is unavailable. Set VITE_API_TOKEN in .env or sign in via Element P2P Authenticate (localStorage Token).";
        toast.error(authHint);
      } else if (successCount < 4) {
        toast.warning("Some report sections couldn't be loaded. Retry from the section that failed.");
      }
    })();
  }, [reloadLibrary, reloadOverview, reloadSchedules, reloadTemplates, fetchLibraryPage]);

  const addActivity = useCallback((type: RecentActivityType, description: string, user = "You") => {
    setActivity((prev) => [
      { id: nextId("act"), type, description, timestamp: "Just now", user },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const refreshOverview = useCallback(async () => {
    const [overviewOk, libraryOk, schedulesOk, templatesOk] = await Promise.all([
      reloadOverview(),
      reloadLibrary(),
      reloadSchedules(),
      reloadTemplates(),
    ]);
    if (libraryOk) {
      await fetchLibraryPage(1, "desc", { silent: true });
    }
    const successCount = [overviewOk, libraryOk, schedulesOk, templatesOk].filter(Boolean).length;
    if (successCount === 4) {
      addActivity("export_completed", "Report data refreshed");
      toast.success("Report data refreshed");
    } else if (successCount === 0) {
      toast.error("Couldn't refresh report data. Please try again.");
    } else {
      toast.warning("Some report data couldn't be refreshed. Showing the last loaded data.");
    }
  }, [addActivity, fetchLibraryPage, reloadLibrary, reloadOverview, reloadSchedules, reloadTemplates]);

  const persistStarred = useCallback((ids: Set<string>) => {
    setStarredIds(ids);
    saveIdSet(STARRED_KEY, ids);
  }, []);

  const persistSaved = useCallback((ids: Set<string>) => {
    setSavedIds(ids);
    saveIdSet(SAVED_KEY, ids);
  }, []);

  const toggleStar = useCallback(
    (id: string) => {
      const nextStarred = new Set(starredIds);
      if (nextStarred.has(id)) nextStarred.delete(id);
      else nextStarred.add(id);
      persistStarred(nextStarred);
      setHistory((prev) =>
        prev.map((row) => (row.id === id ? { ...row, starred: nextStarred.has(id) } : row)),
      );
      toast.success(nextStarred.has(id) ? "Added to favorites" : "Removed from favorites");
    },
    [persistStarred, starredIds],
  );

  const toggleSave = useCallback(
    (id: string) => {
      const nextSaved = new Set(savedIds);
      if (nextSaved.has(id)) nextSaved.delete(id);
      else nextSaved.add(id);
      persistSaved(nextSaved);
      setHistory((prev) => prev.map((row) => (row.id === id ? { ...row, saved: nextSaved.has(id) } : row)));
      toast.success(nextSaved.has(id) ? "Report saved" : "Report removed from saved");
    },
    [persistSaved, savedIds],
  );

  const deleteHistoryItem = useCallback(
    async (id: string): Promise<boolean> => {
      const item = history.find((row) => row.id === id);
      if (!item) return false;
      try {
        await deleteSavedReport(id);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setHistory((prev) => prev.filter((row) => row.id !== id));
          toast.success("Report deleted successfully");
          addActivity("export_completed", `Deleted report: ${item.reportName}`);
          return true;
        }
        const resolved = resolveReportApiError(error);
        if (shouldToastReportApiFailure(error)) {
          toast.error(resolved.message);
        }
        return false;
      }
      setHistory((prev) => prev.filter((row) => row.id !== id));
      toast.success("Report deleted successfully");
      addActivity("export_completed", `Deleted report: ${item.reportName}`);
      return true;
    },
    [addActivity, history],
  );

  const deleteHistoryItems = useCallback(
    async (ids: string[]) => {
      for (const id of ids) {
        await deleteHistoryItem(id);
      }
    },
    [deleteHistoryItem],
  );

  const duplicateHistoryItem = useCallback(
    (id: string) => {
      const item = history.find((row) => row.id === id);
      if (!item) return;
      const copy: ReportHistoryItem = {
        ...item,
        id: nextId("rpt"),
        reportName: `${item.reportName} (Copy)`,
        created: formatNow(),
        lastRun: formatNow(),
        status: "completed",
        saved: false,
        starred: false,
        runConfig: item.runConfig ? { ...item.runConfig, reportName: `${item.reportName} (Copy)` } : undefined,
      };
      setHistory((prev) => [copy, ...prev]);
      toast.success("Report duplicated");
      addActivity("template_cloned", `Duplicated report: ${item.reportName}`);
    },
    [addActivity, history],
  );

  const runReportAgain = useCallback(
    async (report: ReportHistoryItem): Promise<GeneratedReportResult | null> => {
      if (isDemoReportDataEnabled()) {
        toast.success(`"${report.reportName}" re-run successfully`);
        return {
          reportName: report.reportName,
          generatedTime: new Date().toLocaleString(),
          records: report.records ?? 0,
          fileSize: report.fileSize ?? "—",
          exportFormat: "Excel (.xlsx)",
          config: {
            reportName: report.reportName,
            templateId: report.type,
            outputFormat: "xlsx",
            outputFormatLabel: "Excel (.xlsx)",
            datePreset: "ytd",
            departments: [],
            vendor: "All Vendors",
            category: "All Categories",
            amountMin: "",
            amountMax: "",
            approvalStatus: "All Statuses",
            requestType: "All Types",
            scheduleEnabled: false,
          },
        };
      }
      const payload =
        buildGenerateReportRequestFromSaved(report) ??
        (report.runConfig ? buildGenerateReportRequest(report.runConfig) : null);
      if (!payload) {
        toast.error("Original parameters not available.");
        return null;
      }
      try {
        const data = await generateReport(payload);
        const preview = mapGenerateReportPreview(data);
        return {
          reportName: report.reportName,
          generatedTime: preview.generatedOn ?? new Date().toLocaleString(),
          records: preview.totalCount,
          fileSize: preview.fileSize ?? "—",
          exportFormat: "Excel (.xlsx)",
          config: report.runConfig ?? {
            reportName: report.reportName,
            templateId: payload.ReportTemplateType,
            outputFormat: "xlsx",
            outputFormatLabel: "Excel (.xlsx)",
            datePreset: "ytd",
            departments: payload.BasicFilters.Departments,
            vendor: payload.BasicFilters.Vendor[0] ?? "All Vendors",
            category: "All Categories",
            amountMin: "",
            amountMax: "",
            approvalStatus: "All Statuses",
            requestType: "All Types",
            scheduleEnabled: false,
          },
        };
      } catch (error) {
        const resolved = resolveReportApiError(error);
        if (shouldToastReportApiFailure(error)) {
          toast.error(resolved.message);
        }
        return null;
      }
    },
    [],
  );

  const retryFailedReport = useCallback(
    async (id: string) => {
      const item = history.find((row) => row.id === id);
      if (!item || item.status !== "failed") {
        toast.error("Only failed reports can be retried");
        return;
      }
      toast.loading("Retrying report…", { id: `retry-${id}` });
      setHistory((prev) => prev.map((row) => (row.id === id ? { ...row, status: "running" } : row)));
      const result = await runReportAgain(item);
      if (result) {
        setHistory((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, status: "completed" as ReportHistoryStatus, lastRun: formatNow() } : row,
          ),
        );
        toast.success(`"${item.reportName}" completed successfully`, { id: `retry-${id}` });
        addActivity("report_generated", `Retried and completed: ${item.reportName}`);
      } else {
        setHistory((prev) => prev.map((row) => (row.id === id ? { ...row, status: "failed" } : row)));
        toast.error(`Could not retry "${item.reportName}". Check parameters and try again.`, { id: `retry-${id}` });
      }
    },
    [addActivity, history, runReportAgain],
  );

  const loadReportPreview = useCallback(
    async (reportId: string, pageIndex = 1, pageSize = 10) => {
      const seq = (previewRequestSeqRef.current[reportId] ?? 0) + 1;
      previewRequestSeqRef.current[reportId] = seq;

      // Use historyRef so this callback stays stable (no history dep).
      // Keeping history in deps would recreate this function on every library reload,
      // which would re-trigger the preview useEffect in ReportDetailPanel unnecessarily.
      const item = historyRef.current.find((row) => row.id === reportId);

      // In demo mode, serve built-in preview rows immediately — no API call needed.
      if (isDemoReportDataEnabled()) {
        const demo = DEMO_PREVIEW_DATA[reportId];
        setReportPreviews((prev) => ({
          ...prev,
          [reportId]: demo
            ? {
                columns: demo.columns,
                rows: demo.rows.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
                totalCount: demo.totalCount,
                pageIndex,
                pageSize,
                loading: false,
                error: undefined,
              }
            : {
                columns: [],
                rows: [],
                totalCount: 0,
                pageIndex,
                pageSize,
                loading: false,
                error: "Preview not available for this sample report.",
              },
        }));
        return;
      }

      setReportPreviews((prev) => ({
        ...prev,
        [reportId]: {
          columns: prev[reportId]?.columns ?? [],
          rows: prev[reportId]?.rows ?? [],
          totalCount: prev[reportId]?.totalCount ?? 0,
          pageIndex,
          pageSize,
          loading: true,
          error: undefined,
        },
      }));

      const payload =
        item && buildGenerateReportRequestFromSaved(item)
          ? buildGenerateReportRequestFromSaved(item)
          : item?.runConfig
            ? buildGenerateReportRequest(item.runConfig)
            : null;

      if (!payload) {
        if (previewRequestSeqRef.current[reportId] !== seq) return;
        setReportPreviews((prev) => ({
          ...prev,
          [reportId]: {
            columns: [],
            rows: [],
            totalCount: 0,
            pageIndex,
            pageSize,
            loading: false,
            error: "Preview not available. The original report parameters were not stored.",
          },
        }));
        return;
      }

      try {
        const data =
          pageIndex > 1 || pageSize !== 10
            ? await generateReportPage(payload, pageIndex, pageSize)
            : await generateReport(payload);
        if (previewRequestSeqRef.current[reportId] !== seq) return;
        const preview = mapGenerateReportPreview(data);
        setReportPreviews((prev) => ({
          ...prev,
          [reportId]: {
            ...preview,
            pageIndex,
            pageSize,
            loading: false,
          },
        }));
      } catch (error) {
        if (previewRequestSeqRef.current[reportId] !== seq) return;
        setReportPreviews((prev) => ({
          ...prev,
          [reportId]: {
            columns: prev[reportId]?.columns ?? [],
            rows: prev[reportId]?.rows ?? [],
            totalCount: prev[reportId]?.totalCount ?? 0,
            pageIndex,
            pageSize,
            loading: false,
            error: resolveReportApiError(error).message,
          },
        }));
      }
    },
    [], // Stable: reads history via historyRef.current instead of closing over the state array.
  );

  const getHistoryItem = useCallback((id: string) => history.find((row) => row.id === id), [history]);

  const viewReport = useCallback(
    (id: string) => {
      const item = history.find((row) => row.id === id);
      if (!item) {
        toast.error("Report not found");
        return;
      }
      addActivity("report_generated", `Viewed report: ${item.reportName}`);
    },
    [addActivity, history],
  );

  const downloadReport = useCallback(
    async (id: string) => {
      const item = history.find((row) => row.id === id);
      if (!item) {
        toast.error("Report not found");
        return;
      }
      if (isDemoReportDataEnabled()) {
        downloadReportAsCsv(item);
        toast.success(`Downloaded "${item.reportName}" (CSV export)`);
        addActivity("export_completed", `Downloaded: ${item.reportName}`);
        return;
      }
      try {
        const blob = await downloadReportFile({ ReportName: item.reportName });
        triggerBrowserDownload(blob, `${item.reportName}.xlsx`);
        toast.success(`Downloaded "${item.reportName}"`);
        addActivity("export_completed", `Downloaded: ${item.reportName}`);
      } catch (error) {
        if (error instanceof ApiError) {
          const resolved = resolveReportApiError(error);
          if (shouldToastReportApiFailure(error)) {
            toast.error(resolved.message);
          }
          return;
        }
        downloadReportAsCsv(item);
        toast.success(`Downloaded "${item.reportName}" (CSV export)`);
        addActivity("export_completed", `Downloaded: ${item.reportName}`);
      }
    },
    [addActivity, history],
  );

  const emailReport = useCallback(
    async (id: string, recipients: string, subject: string): Promise<boolean> => {
      const trimmed = recipients.trim();
      if (!trimmed) {
        toast.error("Enter at least one recipient email");
        return false;
      }
      const item = history.find((row) => row.id === id);
      if (!item) {
        toast.error("Report not found");
        return false;
      }
      const emails = trimmed.split(/[,;]+/).map((entry) => entry.trim()).filter(Boolean);
      try {
        await sendSavedReportEmail({
          ReportName: item.reportName,
          Emails: emails,
          ReportTemplateType: item.apiPayload?.reportTemplateType ?? item.type,
          BasicFilters: item.apiPayload?.basicFilters,
          AdvancedFilters: item.apiPayload?.advancedFilters,
          UserTimeZoneId: DEFAULT_TIMEZONE,
        });
        toast.success(`Email sent to ${emails.join(", ")}`, { description: subject || item.reportName });
        addActivity("export_completed", `Emailed "${item.reportName}" to ${emails.join(", ")}`);
        return true;
      } catch (error) {
        const resolved = resolveReportApiError(error);
        if (shouldToastReportApiFailure(error)) {
          toast.error(resolved.message);
        }
        return false;
      }
    },
    [addActivity, history],
  );

  const exportOverview = useCallback(
    (format: ExportFormat) => {
      downloadReportsBulk(history.filter((row) => row.status === "completed"), format);
      toast.success(format === "print" ? "Print dialog opened" : `Exported as ${format.toUpperCase()}`);
      addActivity("export_completed", `Overview exported as ${format.toUpperCase()}`);
    },
    [addActivity, history],
  );

  const exportReportById = useCallback(
    (id: string, format: ExportFormat) => {
      const item = history.find((row) => row.id === id);
      if (!item) {
        toast.error("Report not found");
        return;
      }
      downloadReportsBulk([item], format);
      toast.success(`Exported "${item.reportName}"`);
      addActivity("export_completed", `Exported ${item.reportName} as ${format.toUpperCase()}`);
    },
    [addActivity, history],
  );

  const exportAllReports = useCallback(
    (scope: string, format: ExportFormat) => {
      let rows = [...history];
      if (scope === "completed") rows = rows.filter((row) => row.status === "completed");
      else if (scope === "saved") rows = rows.filter((row) => row.saved);
      else if (scope === "starred") rows = rows.filter((row) => row.starred);
      if (rows.length === 0) {
        toast.error("No reports match the selected scope");
        return;
      }
      downloadReportsBulk(rows, format);
      toast.success(`Exported ${rows.length} report${rows.length === 1 ? "" : "s"}`);
      addActivity("export_completed", `Bulk export (${scope}) as ${format.toUpperCase()}`);
    },
    [addActivity, history],
  );

  const exportReportsByIds = useCallback(
    (ids: string[], format: ExportFormat) => {
      const rows = history.filter((row) => ids.includes(row.id));
      if (rows.length === 0) {
        toast.error("No reports selected");
        return;
      }
      downloadReportsBulk(rows, format);
      toast.success(`Exported ${rows.length} report${rows.length === 1 ? "" : "s"}`);
      addActivity("export_completed", `Bulk export (${rows.length} selected) as ${format.toUpperCase()}`);
    },
    [addActivity, history],
  );

  const addFromGeneration = useCallback(
    async (config: ReportRunConfig, result: GeneratedReportResult): Promise<string> => {
      const payload = buildGenerateReportRequest(config);
      const id = nextId("rpt");
      const now = formatNow();

      if (isDemoReportDataEnabled()) {
        const optimistic = normalizeLibraryReportItem({
          id,
          reportName: result.reportName,
          type: config.templateId,
          owner: "—",
          created: now,
          lastRun: now,
          status: "completed",
          saved: true,
          starred: false,
          runConfig: config,
          records: result.records,
          fileSize: result.fileSize,
          apiPayload: {
            reportTemplateType: payload.ReportTemplateType,
            basicFilters: payload.BasicFilters,
            advancedFilters: payload.AdvancedFilters,
          },
        });
        setHistory((prev) => [optimistic, ...prev]);
        if (config.scheduleEnabled) {
          toast.success("Report scheduled successfully");
          addActivity("schedule_updated", `Scheduled "${result.reportName}" (${config.frequency})`);
        } else {
          toast.success("Report generated successfully");
          addActivity("report_generated", `Generated "${result.reportName}" successfully`);
        }
        return id;
      }

      try {
        await saveReport(buildSaveReportRequest(config));
      } catch (error) {
        const resolved = resolveReportApiError(error);
        if (shouldToastReportApiFailure(error)) {
          toast.error(resolved.message);
        }
        throw error;
      }

      const optimistic = normalizeLibraryReportItem({
        id,
        reportName: result.reportName,
        type: config.templateId,
        owner: "—",
        created: now,
        lastRun: now,
        status: "completed",
        saved: true,
        starred: false,
        runConfig: config,
        records: result.records,
        fileSize: result.fileSize,
        apiPayload: {
          reportTemplateType: payload.ReportTemplateType,
          basicFilters: payload.BasicFilters,
          advancedFilters: payload.AdvancedFilters,
        },
      });
      setHistory((prev) => [optimistic, ...prev]);
      setLibraryPageRows((prev) => [optimistic, ...prev.slice(0, 9)]);
      setLibraryApiTotalCount((count) => count + 1);

      if (config.scheduleEnabled) {
        toast.success("Report scheduled successfully");
        addActivity("schedule_updated", `Scheduled "${result.reportName}" (${config.frequency})`);
      } else {
        toast.success("Report generated successfully");
        addActivity("report_generated", `Generated "${result.reportName}" successfully`);
      }

      // Refresh library in the background — do not block the wizard success step.
      void (async () => {
        const libraryOk = await reloadLibrary({ silent: true });
        if (libraryOk) {
          await fetchLibraryPage(1, "desc", { silent: true });
        }
        if (config.scheduleEnabled) {
          await reloadSchedules({ silent: true });
        }
      })();

      return id;
    },
    [addActivity, fetchLibraryPage, reloadLibrary, reloadSchedules],
  );

  const pauseScheduled = useCallback(
    async (id: string) => {
      const schedule = scheduledReports.find((row) => row.id === id);
      if (!schedule) return;
      if (isDemoReportDataEnabled()) {
        setScheduledReports((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, status: "paused", nextRun: "Paused" } : row,
          ),
        );
        toast.success("Schedule paused");
        addActivity("schedule_updated", "Schedule paused");
        return;
      }
      if (!schedule.sequenceNumber) {
        toast.error("Cannot pause schedule: missing sequence number from API.");
        return;
      }
      try {
        await pauseOrResumeSchedule(schedule.sequenceNumber, true);
        await reloadSchedules();
        toast.success("Schedule paused");
        addActivity("schedule_updated", "Schedule paused");
      } catch (error) {
        const resolved = resolveReportApiError(error);
        if (shouldToastReportApiFailure(error)) {
          toast.error(resolved.message);
        }
      }
    },
    [addActivity, reloadSchedules, scheduledReports],
  );

  const resumeScheduled = useCallback(
    async (id: string) => {
      const schedule = scheduledReports.find((row) => row.id === id);
      if (!schedule) return;
      if (isDemoReportDataEnabled()) {
        setScheduledReports((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, status: "active", nextRun: "Jul 10, 2026 · 8:00 AM" } : row,
          ),
        );
        toast.success("Schedule resumed");
        addActivity("schedule_updated", "Schedule resumed");
        return;
      }
      if (!schedule.sequenceNumber) {
        toast.error("Cannot resume schedule: missing sequence number from API.");
        return;
      }
      try {
        await pauseOrResumeSchedule(schedule.sequenceNumber, false);
        await reloadSchedules();
        toast.success("Schedule resumed");
        addActivity("schedule_updated", "Schedule resumed");
      } catch (error) {
        const resolved = resolveReportApiError(error);
        if (shouldToastReportApiFailure(error)) {
          toast.error(resolved.message);
        }
      }
    },
    [addActivity, reloadSchedules, scheduledReports],
  );

  const updateScheduled = useCallback(
    async (
      id: string,
      patch: Pick<ScheduledReport, "frequency" | "recipients" | "timezone" | "deliveryTime" | "emailSubject">,
    ): Promise<boolean> => {
      const schedule = scheduledReports.find((row) => row.id === id);
      if (!schedule) return false;

      if (isDemoReportDataEnabled()) {
        setScheduledReports((prev) =>
          prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );
        toast.success("Schedule updated");
        addActivity("schedule_updated", "Schedule settings updated");
        return true;
      }

      const recipients = patch.recipients
        .split(/[,;]+/)
        .map((entry) => entry.trim())
        .filter(Boolean);

      try {
        await editSchedule({
          Id: id,
          SequenceNumber: schedule.sequenceNumber,
          ReportId: schedule.linkedReportId,
          ReportName: schedule.reportName,
          DelieveryOptions: {
            IsEmail: false,
            EmailReceipents: recipients,
            IsScheduleReport: true,
            ScheduleReport: {
              Frequency: patch.frequency.toLowerCase(),
              EmailReceipents: recipients,
              // Preserve the original DayOfWeek/DayOfMonth from the API response so
              // editing frequency/recipients/timezone doesn't silently reset these fields.
              DayOfWeek: schedule.dayOfWeek ?? "monday",
              DayOfMonth: schedule.dayOfMonth ?? 1,
              Time: patch.deliveryTime ?? "",
              IsRescheduleMessage: false,
              TimeZoneId: patch.timezone ?? DEFAULT_TIMEZONE,
            },
          },
        });
        await reloadSchedules();
        toast.success("Schedule updated");
        addActivity("schedule_updated", "Schedule settings updated");
        return true;
      } catch (error) {
        const resolved = resolveReportApiError(error);
        if (shouldToastReportApiFailure(error)) {
          toast.error(resolved.message);
        }
        return false;
      }
    },
    [addActivity, reloadSchedules, scheduledReports],
  );

  const deleteScheduled = useCallback(
    (id: string) => {
      const item = scheduledReports.find((row) => row.id === id);
      if (!item) return;
      if (isDemoReportDataEnabled()) {
        setScheduledReports((prev) => prev.filter((row) => row.id !== id));
        toast.success("Schedule removed");
        addActivity("schedule_updated", `Removed schedule: ${item.reportName}`);
        return;
      }
      toast.error("Schedule deletion is not supported by the Report API.");
    },
    [addActivity, scheduledReports],
  );

  const getScheduleForReport = useCallback(
    (reportId: string, reportName?: string) =>
      scheduledReports.find(
        (row) => row.linkedReportId === reportId || (reportName && row.reportName === reportName),
      ),
    [scheduledReports],
  );

  const latestReportByTemplateId = useMemo(() => buildLatestReportByTemplateId(history), [history]);

  const findLatestReportByTemplateId = useCallback(
    (templateId: string) => latestReportByTemplateId.get(templateId),
    [latestReportByTemplateId],
  );

  const saveReportFromSuccess = useCallback(
    async (result: GeneratedReportResult) => {
      try {
        await saveReport(buildSaveReportRequest(result.config));
        await reloadLibrary();
        toast.success("Report saved");
        addActivity("report_generated", `Saved report: ${result.reportName}`);
      } catch (error) {
        const resolved = resolveReportApiError(error);
        if (shouldToastReportApiFailure(error)) {
          toast.error(resolved.message);
        }
      }
    },
    [addActivity, reloadLibrary],
  );

  const downloadGenerated = useCallback(
    (result: GeneratedReportResult) => {
      downloadGeneratedReport(result.reportName, result.exportFormat);
      toast.success("Download started");
      addActivity("export_completed", `Downloaded ${result.reportName}`);
    },
    [addActivity],
  );

  const value = useMemo<ReportsContextValue>(
    () => ({
      history,
      libraryPageRows,
      libraryApiTotalCount,
      scheduledReports,
      templateGroups,
      activity,
      starredIds,
      refreshKey,
      overviewCounts,
      overviewCharts,
      isLoadingLibrary,
      isLoadingOverview,
      isLoadingTemplates,
      isLoadingSchedules,
      libraryError,
      overviewError,
      schedulesError,
      templatesError,
      reportPreviews,
      scheduledReportNames,
      addActivity,
      refreshOverview,
      reloadLibrary,
      fetchLibraryPage,
      reloadSchedules,
      reloadTemplates,
      reloadOverview,
      loadReportPreview,
      toggleStar,
      toggleSave,
      deleteHistoryItem,
      deleteHistoryItems,
      duplicateHistoryItem,
      retryFailedReport,
      viewReport,
      downloadReport,
      emailReport,
      exportOverview,
      exportReportById,
      exportAllReports,
      exportReportsByIds,
      addFromGeneration,
      pauseScheduled,
      resumeScheduled,
      deleteScheduled,
      updateScheduled,
      getScheduleForReport,
      findLatestReportByTemplateId,
      saveReportFromSuccess,
      downloadGenerated,
      getHistoryItem,
      runReportAgain,
    }),
    [
      history,
      libraryPageRows,
      libraryApiTotalCount,
      scheduledReports,
      templateGroups,
      activity,
      starredIds,
      refreshKey,
      overviewCounts,
      overviewCharts,
      isLoadingLibrary,
      isLoadingOverview,
      isLoadingTemplates,
      isLoadingSchedules,
      libraryError,
      overviewError,
      schedulesError,
      templatesError,
      reportPreviews,
      scheduledReportNames,
      addActivity,
      refreshOverview,
      reloadLibrary,
      fetchLibraryPage,
      reloadSchedules,
      reloadTemplates,
      reloadOverview,
      loadReportPreview,
      toggleStar,
      toggleSave,
      deleteHistoryItem,
      deleteHistoryItems,
      duplicateHistoryItem,
      retryFailedReport,
      viewReport,
      downloadReport,
      emailReport,
      exportOverview,
      exportReportById,
      exportAllReports,
      exportReportsByIds,
      addFromGeneration,
      pauseScheduled,
      resumeScheduled,
      deleteScheduled,
      updateScheduled,
      getScheduleForReport,
      findLatestReportByTemplateId,
      saveReportFromSuccess,
      downloadGenerated,
      getHistoryItem,
      runReportAgain,
    ],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useReports must be used within ReportsProvider");
  return ctx;
}
