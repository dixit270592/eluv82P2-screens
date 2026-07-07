import { memo, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
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
import { ReportLibraryTableSkeleton } from "./ReportSkeletons";
import { ReportTooltipButton } from "./ReportTooltipButton";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { parseReportDate } from "../../utils/reportRunConfigUtils";
import {
  EMPTY_LIBRARY_FILTERS,
  filterLibraryReports,
  hasActiveLibraryFilters,
  type LibraryDateFilter,
  type LibraryToolbarFilters,
} from "../../utils/reportLibraryFilters";
import {
  onSearchFocus,
  reportFont,
  reportMutedLight,
} from "./reportUiStyles";

/**
 * Saved Reports API strategy:
 * On load, fetch all months for the current calendar year via getSavedReportsForYear
 * (pageSize=100 per month, merged client-side). The "Last run" toolbar filter narrows
 * within that loaded set.
 */
const PAGE_SIZE = 12;

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
  const { history, starredIds, scheduledReportNames, refreshOverview, reloadLibrary, deleteHistoryItem, isLoadingLibrary, libraryError } = useReports();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const [page, setPage] = useState(1);
  const [attentionDismissed, setAttentionDismissed] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [sortField, setSortField] = useState<LibrarySortField>("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<LibraryFilters>(EMPTY_LIBRARY_FILTERS);
  const [libraryErrorDismissed, setLibraryErrorDismissed] = useState(false);

  useEffect(() => {
    setLibraryErrorDismissed(false);
  }, [libraryError]);

  const ownerOptions = useMemo(() => ["all", ...new Set(history.map((r) => r.owner))], [history]);
  const typeOptions = useMemo(() => ["all", ...new Set(history.map((r) => r.type))], [history]);

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

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedReport = useMemo(
    () => history.find((r) => r.id === selectedReportId) ?? null,
    [history, selectedReportId],
  );

  useEffect(() => {
    setPage(1);
  }, [collection, searchQuery, filters, sortField, sortDir]);

  useEffect(() => {
    if (selectedReportId && !history.some((r) => r.id === selectedReportId)) {
      onSelectReport(null);
    }
  }, [history, selectedReportId, onSelectReport]);

  useEffect(() => {
    const visibleIds = new Set(filteredRows.map((r) => r.id));
    if (selectedReportId && !visibleIds.has(selectedReportId)) {
      onSelectReport(null);
    }
  }, [filteredRows, selectedReportId, onSelectReport]);

  const handleSort = (field: LibrarySortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir(field === "name" || field === "owner" ? "asc" : "desc");
    }
  };

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => history.some((r) => r.id === id)));
      return next;
    });
  }, [history]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    const pageIds = paginatedRows.map((r) => r.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const pageAllSelected = paginatedRows.length > 0 && paginatedRows.every((r) => selectedIds.has(r.id));
  const hasActiveFilters = hasActiveLibraryFilters(collection, filters, searchQuery);

  const clearFilters = () => {
    setFilters(EMPTY_LIBRARY_FILTERS);
    setSearchQuery("");
    onNavigateToCollection?.("all");
  };

  const showInitialLoad = isLoadingLibrary && history.length === 0;
  const showLoadError = Boolean(libraryError) && !isLoadingLibrary && history.length === 0;

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

      <div
        className={`app-report-library-split${selectedReportId ? " app-report-library-split--detail-open" : " app-report-library-split--full"}`}
      >
        <div className="app-report-library-pane">
          <div className="app-report-library-toolbar">
            <div className="app-report-library-toolbar__primary">
              <span className="app-report-library-toolbar__count">
                {filteredRows.length} report{filteredRows.length !== 1 ? "s" : ""}
              </span>
              <div className="app-report-library-toolbar__actions">
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
                <ReportTooltipButton label="Coming soon">
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="app-report-header-btn app-report-header-btn--subtle app-report-library-toolbar__export"
                    style={{ opacity: 0.55, cursor: "not-allowed" }}
                  >
                    <Download size={13} aria-hidden /> Export
                  </button>
                </ReportTooltipButton>
                {/* Refresh replaces the legacy Saved Reports tab refresh — reloads report data from API. */}
                <button
                  type="button"
                  onClick={refreshOverview}
                  className="app-report-header-btn app-report-header-btn--subtle app-report-library-toolbar__export"
                  aria-label="Refresh reports"
                >
                  <RefreshCw size={13} aria-hidden /> Refresh
                </button>
              </div>
            </div>

            <div className="app-report-library-toolbar__filters-wrap">
              <div className="app-report-library-toolbar__filters-head">
                <span className="app-report-library-toolbar__filters-title">Filters</span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    aria-label="Clear all filters"
                    className="app-report-library-toolbar__clear"
                  >
                    <X size={12} aria-hidden /> Clear filters
                  </button>
                )}
              </div>
              <div className="app-report-library-filters">
              <label className="app-report-library-filter">
                <span className="app-report-library-filter__label">Type</span>
                <select
                  className="app-report-library-filter__select"
                  value={filters.type}
                  onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
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
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
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
                  onChange={(e) => setFilters((f) => ({ ...f, owner: e.target.value }))}
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
                  onChange={(e) => setFilters((f) => ({ ...f, dateRange: e.target.value as LibraryDateFilter }))}
                  aria-label="Filter by date range"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="this_week">This week</option>
                  <option value="this_month">This month</option>
                  <option value="this_quarter">This quarter</option>
                </select>
              </label>
              </div>
            </div>
          </div>

          <div className="app-report-table-scroll app-report-library-table-wrap">
            {showInitialLoad ? (
              <ReportLibraryTableSkeleton rows={PAGE_SIZE} />
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
                  <th scope="col" className="app-report-library-table__check">
                    <input type="checkbox" aria-label="Select all on page" checked={pageAllSelected} onChange={toggleSelectAllPage} />
                  </th>
                  {(
                    [
                      { field: "name" as const, label: "Report Name" },
                      { field: "type" as const, label: "Type" },
                      { field: "owner" as const, label: "Owner" },
                      { field: "created" as const, label: "Created" },
                      { field: "lastRun" as const, label: "Last Run" },
                      { field: "status" as const, label: "Status" },
                    ] as const
                  ).map((col) => (
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
                          <ChevronDown size={12} style={{ transform: sortDir === "asc" ? "rotate(180deg)" : undefined }} aria-hidden />
                        )}
                      </button>
                    </th>
                  ))}
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <ReportEmptyState
                        icon={<Search size={22} aria-hidden />}
                        title="No reports found"
                        description={
                          collection === "all" && filters.type === "all" && filters.status === "all"
                            ? "Generate your first report to get started."
                            : "No reports match your filters. Try adjusting criteria."
                        }
                        action={collection === "all" ? { label: "New Report", onClick: onGenerateReport } : undefined}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => (
                    <LibraryTableRow
                      key={row.id}
                      row={row}
                      selected={selectedReportId === row.id}
                      checked={selectedIds.has(row.id)}
                      onSelect={() => onSelectReport(row.id)}
                      onToggleCheck={() => toggleSelect(row.id)}
                      onDeleteRequest={() => setDeleteTarget({ id: row.id, name: row.reportName })}
                    />
                  ))
                )}
              </tbody>
            </table>
            )}
          </div>

          {!showInitialLoad && !showLoadError && filteredRows.length > PAGE_SIZE && (
            <div className="app-report-library-pagination">
              <span style={{ fontSize: "11px", color: reportMutedLight }}>
                Page {currentPage} of {totalPages}
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button type="button" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page" className="app-report-pagination-btn" style={{ fontFamily: reportFont }}>
                  <ChevronLeft size={14} />
                </button>
                <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page" className="app-report-pagination-btn" style={{ fontFamily: reportFont }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        <ReportDetailPanel
          report={selectedReport}
          onClose={selectedReportId ? () => onSelectReport(null) : undefined}
          onGenerateReport={onGenerateReport}
          onScheduleReport={onScheduleReport}
          onRunAgain={onRunAgain}
          onEditSchedule={onEditSchedule}
          onDeleteRequest={(id, name) => setDeleteTarget({ id, name })}
        />
      </div>

      <ReportDeleteConfirmDialog
        open={deleteTarget !== null}
        reportName={deleteTarget?.name ?? ""}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const ok = await deleteHistoryItem(deleteTarget.id);
          if (ok) {
            if (selectedReportId === deleteTarget.id) onSelectReport(null);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}

const LibraryTableRow = memo(function LibraryTableRow({
  row,
  selected,
  checked,
  onSelect,
  onToggleCheck,
  onDeleteRequest,
}: {
  row: ReportHistoryItem;
  selected: boolean;
  checked: boolean;
  onSelect: () => void;
  onToggleCheck: () => void;
  onDeleteRequest: () => void;
}) {
  const { downloadReport, emailReport } = useReports();
  const sc = statusConfig[row.status];

  const handleEmail = () => {
    emailReport(row.id, "team@company.com", "Shared saved report");
  };

  const handleView = () => {
    onSelect();
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
      <td className="app-report-library-table__check" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" aria-label={`Select ${row.reportName}`} checked={checked} onChange={onToggleCheck} />
      </td>
      <td className="app-report-library-name">
        <span className="app-report-library-name__label">{row.reportName}</span>
      </td>
      <td className="app-report-library-table__meta">{row.type}</td>
      <td className="app-report-library-table__meta">{row.owner || "—"}</td>
      <td className="app-report-library-table__date">{row.created}</td>
      <td className="app-report-library-table__date">{row.lastRun || row.created}</td>
      <td className="app-report-library-table__status">
        <span className="app-report-status-badge" style={{ background: sc.bg, color: sc.color }}>
          {sc.label}
        </span>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", gap: "2px" }}>
          {[
            { icon: <Mail size={13} aria-hidden />, label: "Email report", action: handleEmail },
            { icon: <Eye size={13} aria-hidden />, label: "View report", action: handleView },
            { icon: <Download size={13} aria-hidden />, label: "Download", action: () => downloadReport(row.id) },
            { icon: <Trash2 size={13} aria-hidden />, label: "Delete report", action: onDeleteRequest, danger: true },
          ].map((action) => (
            <ReportTooltipButton key={action.label} label={action.label}>
              <button
                type="button"
                className="app-report-icon-action"
                onClick={action.action}
                style={{ color: action.danger ? "#D92D20" : "#667085" }}
                aria-label={action.label}
              >
                {action.icon}
              </button>
            </ReportTooltipButton>
          ))}
        </div>
      </td>
    </tr>
  );
});
