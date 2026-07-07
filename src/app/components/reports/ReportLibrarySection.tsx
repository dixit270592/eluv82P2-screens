import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { ReportHistoryItem, ReportHistoryStatus } from "../../data/reportHistory";
import { useReports } from "../../context/ReportsContext";
import type { LibraryCollection } from "./ReportCenterNav";
import { ReportAttentionStrip } from "./ReportAttentionStrip";
import { ReportDeleteConfirmDialog } from "./ReportDeleteConfirmDialog";
import { ReportSectionErrorBanner } from "./ReportSectionErrorBanner";
import { ReportDetailPanel } from "./ReportDetailPanel";
import { ReportEmptyState } from "./ReportEmptyState";
import { EmailReportDrawer } from "./ReportQuickActionDrawers";
import { ReportLibraryTableSkeleton } from "./ReportSkeletons";
import { ReportTooltipButton } from "./ReportTooltipButton";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { parseReportDate } from "../../utils/reportRunConfigUtils";
import {
  EMPTY_LIBRARY_FILTERS,
  filterLibraryReports,
  hasActiveLibraryFilters,
  LIBRARY_COLLECTION_LABELS,
  type LibraryDateFilter,
  type LibraryToolbarFilters,
} from "../../utils/reportLibraryFilters";
import {
  onSearchFocus,
  reportFont,
  reportMutedLight,
} from "./reportUiStyles";

const PAGE_SIZE = 10;
const ACTION_ICON_SIZE = 18;

function buildLibraryPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (current < total - 2) pages.push("ellipsis");
  if (total > 1) pages.push(total);
  return pages;
}

const statusConfig: Record<ReportHistoryStatus, { bg: string; color: string; label: string }> = {
  completed: { bg: "#ECFDF5", color: "#059669", label: "Completed" },
  running: { bg: "#EFF8FF", color: "#1570EF", label: "Running" },
  scheduled: { bg: "#F4F3FF", color: "#7B5EA7", label: "Scheduled" },
  failed: { bg: "#FEF2F2", color: "#F04438", label: "Failed" },
};

export type LibrarySortField = "lastRun" | "created" | "name" | "owner" | "status" | "type";
export type LibraryFilters = LibraryToolbarFilters;

type ReportLibrarySectionProps = {
  collection: LibraryCollection;
  selectedReportId: string | null;
  onSelectReport: (id: string | null) => void;
  onGenerateReport: () => void;
  onScheduleReport: () => void;
  onRunAgain: (report: ReportHistoryItem) => void;
  onEditSchedule?: (scheduleId: string) => void;
  onNavigateToSchedules?: () => void;
  onNavigateToCollection?: (collection: LibraryCollection) => void;
};

function sortReports(rows: ReportHistoryItem[], field: LibrarySortField, dir: "asc" | "desc"): ReportHistoryItem[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (field === "name") return mult * a.reportName.localeCompare(b.reportName);
    if (field === "type") return mult * a.type.localeCompare(b.type);
    if (field === "owner") return mult * a.owner.localeCompare(b.owner);
    if (field === "status") return mult * a.status.localeCompare(b.status);
    if (field === "created") {
      const da = parseReportDate(a.created)?.getTime() ?? 0;
      const db = parseReportDate(b.created)?.getTime() ?? 0;
      return mult * (da - db);
    }
    const da = parseReportDate(a.lastRun)?.getTime() ?? 0;
    const db = parseReportDate(b.lastRun)?.getTime() ?? 0;
    return mult * (da - db);
  });
}

function countActiveToolbarFilters(filters: LibraryFilters): number {
  let n = 0;
  if (filters.type !== "all") n += 1;
  if (filters.status !== "all") n += 1;
  if (filters.owner !== "all") n += 1;
  if (filters.dateRange !== "all") n += 1;
  return n;
}

function LibraryFilterFields({
  filters,
  onChange,
  typeOptions,
  ownerOptions,
  disabled,
}: {
  filters: LibraryFilters;
  onChange: (next: LibraryFilters) => void;
  typeOptions: string[];
  ownerOptions: string[];
  disabled?: boolean;
}) {
  return (
    <div className="app-report-library-filters app-report-library-filters--popover">
      <label className="app-report-library-filter">
        <span className="app-report-library-filter__label">Type</span>
        <select
          className="app-report-library-filter__select"
          value={filters.type}
          disabled={disabled}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
          aria-label="Filter by type"
        >
          {typeOptions.map((t) => (
            <option key={t} value={t}>{t === "all" ? "All types" : t}</option>
          ))}
        </select>
      </label>
      <label className="app-report-library-filter">
        <span className="app-report-library-filter__label">Status</span>
        <select
          className="app-report-library-filter__select"
          value={filters.status}
          disabled={disabled}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="scheduled">Scheduled</option>
          <option value="failed">Failed</option>
        </select>
      </label>
      <label className="app-report-library-filter">
        <span className="app-report-library-filter__label">Owner</span>
        <select
          className="app-report-library-filter__select"
          value={filters.owner}
          disabled={disabled}
          onChange={(e) => onChange({ ...filters, owner: e.target.value })}
          aria-label="Filter by owner"
        >
          {ownerOptions.map((o) => (
            <option key={o} value={o}>{o === "all" ? "All owners" : o}</option>
          ))}
        </select>
      </label>
      <label className="app-report-library-filter">
        <span className="app-report-library-filter__label">Last run</span>
        <select
          className="app-report-library-filter__select"
          value={filters.dateRange}
          disabled={disabled}
          onChange={(e) => onChange({ ...filters, dateRange: e.target.value as LibraryDateFilter })}
          aria-label="Filter by date range"
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="this_week">This week</option>
          <option value="this_month">This month</option>
          <option value="this_quarter">This quarter</option>
          <option value="this_year">This year</option>
        </select>
      </label>
    </div>
  );
}

export function ReportLibrarySection({
  collection,
  selectedReportId,
  onSelectReport,
  onGenerateReport,
  onScheduleReport,
  onRunAgain,
  onEditSchedule,
  onNavigateToSchedules,
  onNavigateToCollection,
}: ReportLibrarySectionProps) {
  const {
    history,
    libraryPageRows,
    libraryApiTotalCount,
    starredIds,
    scheduledReportNames,
    refreshOverview,
    reloadLibrary,
    fetchLibraryPage,
    deleteHistoryItem,
    downloadReport,
    isLoadingLibrary,
    libraryError,
  } = useReports();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const [page, setPage] = useState(1);
  const [attentionDismissed, setAttentionDismissed] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailReportId, setEmailReportId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<LibrarySortField>("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<LibraryFilters>(EMPTY_LIBRARY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [libraryErrorDismissed, setLibraryErrorDismissed] = useState(false);
  const filterAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLibraryErrorDismissed(false);
  }, [libraryError]);

  useEffect(() => {
    if (!filtersOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (filterAnchorRef.current && !filterAnchorRef.current.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [filtersOpen]);

  const ownerOptions = useMemo(() => ["all", ...new Set(history.map((r) => r.owner))], [history]);
  const typeOptions = useMemo(() => ["all", ...new Set(history.map((r) => r.type))], [history]);

  const hasActiveFilters = hasActiveLibraryFilters(collection, filters, searchQuery);
  const useApiPagination = !hasActiveFilters && sortField === "created";

  const filteredRows = useMemo(() => {
    const rows = filterLibraryReports({
      history,
      collection,
      starredIds,
      scheduledReportNames,
      searchQuery: debouncedSearchQuery,
      filters,
    });
    return sortReports(rows, sortField, sortDir);
  }, [collection, debouncedSearchQuery, starredIds, scheduledReportNames, history, filters, sortField, sortDir]);

  const tableTotalCount = useApiPagination ? libraryApiTotalCount : filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(tableTotalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useApiPagination
    ? libraryPageRows
    : filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      if (useApiPagination) {
        void fetchLibraryPage(nextPage, sortDir, { silent: true });
      }
    },
    [fetchLibraryPage, sortDir, useApiPagination],
  );

  const handleSort = useCallback(
    (field: LibrarySortField) => {
      const nextDir: "asc" | "desc" =
        sortField === field ? (sortDir === "asc" ? "desc" : "asc") : field === "name" || field === "owner" ? "asc" : "desc";
      setSortField(field);
      setSortDir(nextDir);
      setPage(1);
      if (field === "created" && !hasActiveLibraryFilters(collection, filters, searchQuery)) {
        void fetchLibraryPage(1, nextDir, { silent: true });
      }
    },
    [collection, fetchLibraryPage, filters, searchQuery, sortDir, sortField],
  );

  const selectedReport = useMemo(
    () => history.find((r) => r.id === selectedReportId) ?? null,
    [history, selectedReportId],
  );

  useEffect(() => {
    setPage(1);
  }, [collection, searchQuery, filters, sortField, sortDir]);

  useEffect(() => {
    if (isLoadingLibrary) return;
    if (selectedReportId && !history.some((r) => r.id === selectedReportId)) {
      onSelectReport(null);
    }
  }, [history, selectedReportId, onSelectReport, isLoadingLibrary]);

  useEffect(() => {
    if (isLoadingLibrary) return;
    const visibleIds = new Set(
      (useApiPagination ? libraryPageRows : filteredRows).map((r) => r.id),
    );
    if (selectedReportId && !visibleIds.has(selectedReportId)) {
      onSelectReport(null);
    }
  }, [filteredRows, libraryPageRows, selectedReportId, onSelectReport, isLoadingLibrary, useApiPagination]);

  const toolbarFilterCount = countActiveToolbarFilters(filters);

  const clearFilters = () => {
    setFilters(EMPTY_LIBRARY_FILTERS);
    setSearchQuery("");
    onNavigateToCollection?.("all");
  };

  const showInitialLoad = isLoadingLibrary && history.length === 0;
  const showLoadError = Boolean(libraryError) && !isLoadingLibrary && history.length === 0;
  const isUnfilteredEmpty = !showInitialLoad && !showLoadError && history.length === 0;

  const filterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (collection !== "all") {
      chips.push({
        key: "collection",
        label: LIBRARY_COLLECTION_LABELS[collection],
        onRemove: () => onNavigateToCollection?.("all"),
      });
    }
    if (filters.type !== "all") {
      chips.push({
        key: "type",
        label: `Type: ${filters.type}`,
        onRemove: () => setFilters((f) => ({ ...f, type: "all" })),
      });
    }
    if (filters.status !== "all") {
      chips.push({
        key: "status",
        label: `Status: ${filters.status}`,
        onRemove: () => setFilters((f) => ({ ...f, status: "all" })),
      });
    }
    if (filters.owner !== "all") {
      chips.push({
        key: "owner",
        label: `Owner: ${filters.owner}`,
        onRemove: () => setFilters((f) => ({ ...f, owner: "all" })),
      });
    }
    if (filters.dateRange !== "all") {
      chips.push({
        key: "date",
        label: `Last run: ${filters.dateRange.replace(/_/g, " ")}`,
        onRemove: () => setFilters((f) => ({ ...f, dateRange: "all" })),
      });
    }
    if (searchQuery.trim()) {
      chips.push({
        key: "search",
        label: `Search: "${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(""),
      });
    }
    return chips;
  }, [collection, filters, searchQuery, onNavigateToCollection]);

  const tableColumns = [
    { field: "name" as const, label: "Report Name" },
    { field: "type" as const, label: "Type" },
    { field: "owner" as const, label: "Owner" },
    { field: "created" as const, label: "Created" },
    { field: "lastRun" as const, label: "Last Run" },
    { field: "status" as const, label: "Status" },
  ] as const;

  return (
    <div className="app-report-stack" style={{ fontFamily: reportFont }}>
      <ReportAttentionStrip
        onSelectReport={(id) => onSelectReport(id)}
        onNavigateToSchedules={onNavigateToSchedules}
        onViewAll={onNavigateToCollection ? (focus) => onNavigateToCollection(focus) : undefined}
        dismissed={attentionDismissed}
        onDismiss={() => setAttentionDismissed(true)}
      />

      {libraryError && history.length > 0 && !libraryErrorDismissed && (
        <ReportSectionErrorBanner
          message={libraryError}
          onRetry={() => void reloadLibrary()}
          onDismiss={() => setLibraryErrorDismissed(true)}
        />
      )}

      <div className="app-report-library-layout">
        <div className="app-report-library-card">
          <div className="app-report-library-toolbar">
            <div className="app-report-library-toolbar__primary">
              <span className="app-report-library-toolbar__count">
                {filteredRows.length} report{filteredRows.length !== 1 ? "s" : ""}
              </span>
              <div
                className="app-report-library-toolbar__search"
                onFocus={(e) => onSearchFocus(e, true)}
                onBlur={(e) => onSearchFocus(e, false)}
              >
                <Search size={13} color="#98A2B3" aria-hidden />
                <input
                  type="search"
                  className="app-report-library-toolbar__search-input"
                  placeholder="Search reports…"
                  value={searchQuery}
                  aria-label="Search reports"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="app-report-library-toolbar__actions-end">
                <button
                  type="button"
                  onClick={refreshOverview}
                  className="app-report-header-btn app-report-header-btn--subtle"
                  aria-label="Refresh reports"
                >
                  <RefreshCw size={13} aria-hidden /> Refresh
                </button>

                <div ref={filterAnchorRef} className="app-report-library-toolbar__filter-anchor">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((open) => !open)}
                    className={`app-report-header-btn app-report-header-btn--subtle app-report-library-toolbar__filter-btn${
                      filtersOpen || toolbarFilterCount > 0 ? " app-report-library-toolbar__filter-btn--active" : ""
                    }`}
                    aria-expanded={filtersOpen}
                    aria-haspopup="dialog"
                    aria-label="Filter reports"
                  >
                    <Filter size={13} aria-hidden /> Filters
                    {toolbarFilterCount > 0 && (
                      <span className="app-report-library-toolbar__filter-badge">{toolbarFilterCount}</span>
                    )}
                  </button>

                  {filtersOpen && (
                    <div
                      className="app-report-library-filters-popover app-report-library-filters-popover--align-end"
                      role="dialog"
                      aria-label="Report filters"
                    >
                      <div className="app-report-library-filters-popover__head">
                        <span>Filters</span>
                        {toolbarFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={() => setFilters(EMPTY_LIBRARY_FILTERS)}
                            className="app-report-library-toolbar__clear"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      <LibraryFilterFields
                        filters={filters}
                        onChange={setFilters}
                        typeOptions={typeOptions}
                        ownerOptions={ownerOptions}
                        disabled={isLoadingLibrary}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {filterChips.length > 0 && (
              <div className="app-report-library-toolbar__chips">
                {filterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    className="app-report-library-toolbar__chip"
                    onClick={chip.onRemove}
                    aria-label={`Remove filter: ${chip.label}`}
                  >
                    {chip.label}
                    <X size={11} aria-hidden />
                  </button>
                ))}
                {filterChips.length > 1 && (
                  <button type="button" onClick={clearFilters} className="app-report-library-toolbar__chips-clear">
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="app-report-table-scroll app-report-library-table-wrap">
            {showInitialLoad ? (
              <ReportLibraryTableSkeleton rows={5} />
            ) : showLoadError ? (
              <ReportEmptyState
                variant="error"
                title="Unable to load reports"
                description={libraryError ?? "Something went wrong while loading saved reports."}
                action={{ label: "Try again", onClick: () => void reloadLibrary() }}
              />
            ) : (
              <table className="app-report-data-table app-report-data-table--compact app-report-data-table--library app-report-library-table">
                <thead>
                  <tr>
                    {tableColumns.map((col) => (
                      <th key={col.field} scope="col">
                        <button
                          type="button"
                          onClick={() => handleSort(col.field)}
                          className={`app-report-sort-btn${sortField === col.field ? " app-report-sort-btn--active" : ""}`}
                          aria-label={`Sort by ${col.label}`}
                          aria-sort={sortField === col.field ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                        >
                          {col.label}
                          {sortField === col.field && (
                            <span className="app-report-sort-btn__dir" aria-hidden>
                              {sortDir === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                      </th>
                    ))}
                    <th scope="col" className="app-report-library-table__actions-head">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length + 1}>
                        <ReportEmptyState
                          icon={
                            isUnfilteredEmpty ? (
                              <FileText size={22} aria-hidden />
                            ) : (
                              <Search size={22} aria-hidden />
                            )
                          }
                          title="No reports found"
                          description={
                            isUnfilteredEmpty
                              ? "Create your first report using the '+ New Report' button."
                              : "No reports match your filters. Try adjusting your search or filters."
                          }
                          action={
                            isUnfilteredEmpty
                              ? { label: "+ New Report", onClick: onGenerateReport }
                              : undefined
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row) => (
                      <LibraryTableRow
                        key={row.id}
                        row={row}
                        selected={selectedReportId === row.id}
                        onSelect={() => onSelectReport(row.id)}
                        onEmail={() => setEmailReportId(row.id)}
                        onDownload={() => void downloadReport(row.id)}
                        onDelete={() => setDeleteTarget({ id: row.id, name: row.reportName })}
                      />
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {!showInitialLoad && !showLoadError && tableTotalCount > 0 && (
            <div className="app-report-library-pagination">
              <span
                className="app-report-library-pagination__summary"
                style={{ fontFamily: reportFont, color: reportMutedLight }}
              >
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, tableTotalCount)} of{" "}
                {tableTotalCount} reports
                {isLoadingLibrary && (
                  <Loader2
                    size={12}
                    className="app-report-library-pagination__loading"
                    aria-hidden
                    style={{ marginLeft: 8, verticalAlign: "middle" }}
                  />
                )}
              </span>
              <div className="app-report-library-pagination__controls">
                <button
                  type="button"
                  disabled={isLoadingLibrary || currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label="Previous page"
                  className="app-report-pagination-btn"
                  style={{ fontFamily: reportFont }}
                >
                  <ChevronLeft size={14} aria-hidden />
                </button>
                {buildLibraryPageNumbers(currentPage, totalPages).map((pageNumber, index) =>
                  pageNumber === "ellipsis" ? (
                    <span key={`ellipsis-${index}`} className="app-report-library-pagination__ellipsis" aria-hidden>
                      …
                    </span>
                  ) : (
                    <button
                      key={pageNumber}
                      type="button"
                      disabled={isLoadingLibrary}
                      onClick={() => handlePageChange(pageNumber)}
                      aria-label={`Page ${pageNumber}`}
                      aria-current={pageNumber === currentPage ? "page" : undefined}
                      className={`app-report-library-pagination__page${pageNumber === currentPage ? " app-report-library-pagination__page--active" : ""}`}
                      style={{ fontFamily: reportFont }}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={isLoadingLibrary || currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label="Next page"
                  className="app-report-pagination-btn"
                  style={{ fontFamily: reportFont }}
                >
                  <ChevronRight size={14} aria-hidden />
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedReport && (
          <ReportDetailPanel
            variant="modal"
            report={selectedReport}
            onClose={() => onSelectReport(null)}
            onGenerateReport={onGenerateReport}
            onScheduleReport={onScheduleReport}
            onRunAgain={onRunAgain}
            onEditSchedule={onEditSchedule}
            onDeleteRequest={(id, name) => setDeleteTarget({ id, name })}
          />
        )}
      </div>

      <EmailReportDrawer
        open={emailReportId !== null}
        onOpenChange={(open) => {
          if (!open) setEmailReportId(null);
        }}
        fixedReportId={emailReportId ?? undefined}
      />

      <ReportDeleteConfirmDialog
        open={deleteTarget !== null}
        reportName={deleteTarget?.name ?? ""}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget || isDeleting) return;
          setIsDeleting(true);
          try {
            const ok = await deleteHistoryItem(deleteTarget.id);
            if (ok) {
              if (selectedReportId === deleteTarget.id) onSelectReport(null);
              setDeleteTarget(null);
              await reloadLibrary();
              if (!hasActiveLibraryFilters(collection, filters, searchQuery) && sortField === "created") {
                await fetchLibraryPage(page, sortDir, { silent: true });
              }
            }
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </div>
  );
}

const LibraryTableRow = memo(function LibraryTableRow({
  row,
  selected,
  onSelect,
  onEmail,
  onDownload,
  onDelete,
}: {
  row: ReportHistoryItem;
  selected: boolean;
  onSelect: () => void;
  onEmail: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const sc = statusConfig[row.status];

  const stopPropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <tr
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      aria-current={selected ? "true" : undefined}
      className={`app-report-library-row${selected ? " app-report-row--selected" : ""}`}
    >
      <td className="app-report-library-name">
        <span className="app-report-library-name__label">{row.reportName}</span>
      </td>
      <td className="app-report-library-table__meta">{row.type}</td>
      <td className="app-report-library-table__meta">{row.owner || "—"}</td>
      <td className="app-report-library-table__date">{row.created}</td>
      <td className="app-report-library-table__date">{row.lastRun || row.created}</td>
      <td className="app-report-library-table__status">
        <span className="app-report-status-badge" style={{ background: sc.bg, color: sc.color }} aria-label={`Status: ${sc.label}`}>
          {sc.label}
        </span>
      </td>
      <td className="app-report-library-table__actions" onClick={stopPropagation}>
        <div className="app-report-schedule-actions">
          <ReportTooltipButton label="Email report">
            <button
              type="button"
              className="app-report-icon-action"
              onClick={onEmail}
              aria-label="Email report"
            >
              <Mail size={ACTION_ICON_SIZE} aria-hidden />
            </button>
          </ReportTooltipButton>
          <ReportTooltipButton label="View report">
            <button
              type="button"
              className="app-report-icon-action"
              onClick={onSelect}
              aria-label="View report"
            >
              <Eye size={ACTION_ICON_SIZE} aria-hidden />
            </button>
          </ReportTooltipButton>
          <ReportTooltipButton label="Download report">
            <button
              type="button"
              className="app-report-icon-action"
              onClick={onDownload}
              aria-label="Download report"
            >
              <Download size={ACTION_ICON_SIZE} aria-hidden />
            </button>
          </ReportTooltipButton>
          <ReportTooltipButton label="Delete report">
            <button
              type="button"
              className="app-report-icon-action app-report-icon-action--danger"
              onClick={onDelete}
              aria-label="Delete report"
            >
              <Trash2 size={ACTION_ICON_SIZE} aria-hidden />
            </button>
          </ReportTooltipButton>
        </div>
      </td>
    </tr>
  );
});
