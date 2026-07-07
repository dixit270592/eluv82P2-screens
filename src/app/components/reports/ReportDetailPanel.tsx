import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  Bookmark,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Mail,
  MoreHorizontal,
  Play,
  RefreshCw,
  Settings2,
  Star,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import type { ReportHistoryItem, ReportHistoryStatus } from "../../data/reportHistory";
import { useReports } from "../../context/ReportsContext";
import { EmailReportDrawer } from "./ReportQuickActionDrawers";
import { ReportEmptyState } from "./ReportEmptyState";
import { formatRunConfigForDisplay, getReportRunConfig } from "../../utils/reportRunConfigUtils";
import {
  onDestructiveHover,
  onPrimaryBtnHover,
  reportDestructiveBtnStyle,
  reportDetailModalPanelStyle,
  reportFont,
  reportTertiaryBtnStyle,
  reportText,
} from "./reportUiStyles";
import {
  reportFadeTransition,
  reportModalBackdropTransition,
  reportModalPanelTransition,
  useReportReducedMotion,
} from "./reportMotion";
import { useReportDrawerA11y } from "./useReportDrawerA11y";

type DetailTab = "preview" | "parameters" | "schedule" | "activity";

const statusConfig: Record<ReportHistoryStatus, { bg: string; color: string; label: string }> = {
  completed: { bg: "#ECFDF5", color: "#059669", label: "Completed" },
  running: { bg: "#EFF8FF", color: "#1570EF", label: "Running" },
  scheduled: { bg: "#F4F3FF", color: "#7B5EA7", label: "Scheduled" },
  failed: { bg: "#FEF2F2", color: "#F04438", label: "Failed" },
};

const detailTabs: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
  { id: "preview", label: "Preview", icon: <Eye size={14} aria-hidden /> },
  { id: "parameters", label: "Parameters", icon: <Settings2 size={14} aria-hidden /> },
  { id: "schedule", label: "Schedule", icon: <CalendarClock size={14} aria-hidden /> },
  { id: "activity", label: "Activity", icon: <Activity size={14} aria-hidden /> },
];

type ReportDetailPanelProps = {
  report: ReportHistoryItem | null;
  variant?: "inline" | "modal";
  onClose?: () => void;
  onGenerateReport: () => void;
  onScheduleReport: () => void;
  onRunAgain: (report: ReportHistoryItem) => void;
  onEditSchedule?: (scheduleId: string) => void;
  onDeleteRequest?: (id: string, name: string) => void;
};

export function ReportDetailPanel({
  report,
  variant = "inline",
  onClose,
  onGenerateReport,
  onScheduleReport,
  onRunAgain,
  onEditSchedule,
  onDeleteRequest,
}: ReportDetailPanelProps) {
  const {
    starredIds,
    toggleStar,
    toggleSave,
    downloadReport,
    deleteHistoryItem,
    retryFailedReport,
    getScheduleForReport,
    loadReportPreview,
    reportPreviews,
  } = useReports();

  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("preview");
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReportReducedMotion();

  useReportDrawerA11y(variant === "modal" && report != null, () => onClose?.(), panelRef);

  const schedule = useMemo(
    () => (report ? getScheduleForReport(report.id, report.reportName) : undefined),
    [report, getScheduleForReport],
  );

  useEffect(() => {
    setActiveTab("preview");
    setDetailsExpanded(false);
    setMenuOpen(false);
  }, [report?.id]);

  useEffect(() => {
    if (report && activeTab === "preview") {
      void loadReportPreview(report.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id, activeTab, loadReportPreview]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  if (!report) {
    if (variant === "modal") return null;
    return (
      <motion.div
        key="detail-empty"
        className="app-report-detail-panel app-report-detail-panel--empty"
        style={{ fontFamily: reportFont }}
        initial={{ opacity: reducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={reportFadeTransition(reducedMotion)}
      >
        <ReportEmptyState
          icon={<Play size={22} aria-hidden />}
          title="Select a report"
          description="Choose a report from the list to view details, preview output, and take action."
          action={{ label: "New Report", onClick: onGenerateReport }}
        />
      </motion.div>
    );
  }

  const isStarred = starredIds.has(report.id) || report.starred;
  const sc = statusConfig[report.status];
  const runConfig = getReportRunConfig(report);
  const configRows = runConfig ? formatRunConfigForDisplay(runConfig) : [];
  const apiConfigRows = report.apiPayload?.basicFilters
    ? [
        {
          label: "Date Range",
          value: `${report.apiPayload.basicFilters.StartDate || "—"} to ${report.apiPayload.basicFilters.EndDate || "—"}`,
        },
        {
          label: "Departments",
          value: report.apiPayload.basicFilters.Departments.length
            ? report.apiPayload.basicFilters.Departments.join(", ")
            : "All departments",
        },
        {
          label: "Vendors",
          value: report.apiPayload.basicFilters.Vendor.length
            ? report.apiPayload.basicFilters.Vendor.join(", ")
            : "All vendors",
        },
      ]
    : [];
  const parameterRows = configRows.length > 0 ? configRows : apiConfigRows;

  const previewState = reportPreviews[report.id];
  const preview = {
    columns: previewState?.columns ?? [],
    rows: previewState?.rows ?? [],
  };

  const reportActivity = useMemo(
    () => (report ? [{ id: `${report.id}-created`, description: `Created on ${report.created}`, user: "—", timestamp: report.created }] : []),
    [report],
  );

  const metaItems = [
    { label: "Created", value: report.created },
    { label: "Last run", value: report.lastRun },
    { label: "Format", value: runConfig?.outputFormatLabel ?? "Excel (.xlsx)" },
    {
      label: "Records",
      value:
        previewState?.totalCount != null
          ? previewState.totalCount.toLocaleString()
          : report.records != null
            ? report.records.toLocaleString()
            : "—",
    },
  ];

  const panelClass = `app-report-detail-panel${variant === "modal" ? " app-report-detail-panel--modal app-report-modal__panel app-report-modal__panel--detail" : ""}`;

  const panelContent = (
    <>
      <header className="app-report-detail-header app-report-detail-header--compact">
        <div className="app-report-detail-header__top">
          <div className="app-report-detail-header__title-block">
            <div className="app-report-detail-header__title-row">
              {onClose && (
                <button
                  type="button"
                  className="app-report-detail-close"
                  onClick={onClose}
                  aria-label="Close detail panel"
                >
                  <X size={18} aria-hidden />
                </button>
              )}
              <h2 className="app-report-detail-header__title">{report.reportName}</h2>
              <span className="app-report-status-badge" style={{ background: sc.bg, color: sc.color }} aria-label={`Status: ${sc.label}`}>
                {sc.label}
              </span>
            </div>
            <p className="app-report-detail-header__subtitle">
              <span className="app-report-detail-header__meta-line">
                <Tag size={11} aria-hidden />
                {report.type}
              </span>
              <span className="app-report-detail-header__meta-sep" aria-hidden>·</span>
              <span className="app-report-detail-header__meta-line">
                <User size={11} aria-hidden />
                {report.owner || "—"}
              </span>
              {(
                <>
                  <span className="app-report-detail-header__meta-sep" aria-hidden>·</span>
                  <span className="app-report-detail-header__meta-line app-report-detail-header__meta-line--saved">
                    <Bookmark size={11} aria-hidden />
                    Saved
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="app-report-detail-header__controls">
            <button
              type="button"
              onClick={() => toggleStar(report.id)}
              aria-pressed={isStarred}
              aria-label={isStarred ? "Unstar report" : "Star report"}
              className={`app-report-detail-header__star${isStarred ? " app-report-detail-header__star--active" : ""}`}
            >
              <Star size={16} color={isStarred ? "#D97706" : "#98A2B3"} fill={isStarred ? "#FEF3C7" : "none"} aria-hidden />
            </button>

            {report.status === "failed" ? (
              <button
                type="button"
                onClick={() => retryFailedReport(report.id)}
                className="app-report-detail-actions__primary-btn"
                onMouseEnter={(e) => onPrimaryBtnHover(e, true)}
                onMouseLeave={(e) => onPrimaryBtnHover(e, false)}
              >
                <RefreshCw size={13} aria-hidden /> Retry
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onRunAgain(report)}
                className="app-report-detail-actions__primary-btn"
                onMouseEnter={(e) => onPrimaryBtnHover(e, true)}
                onMouseLeave={(e) => onPrimaryBtnHover(e, false)}
              >
                <Play size={13} aria-hidden /> Run Again
              </button>
            )}

            <div className="app-report-detail-actions__low" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-label="More actions"
                className="app-report-detail-actions__more"
              >
                <MoreHorizontal size={16} aria-hidden />
              </button>
              {menuOpen && (
                <div className="app-report-detail-actions__low-menu">
                  <button type="button" onClick={() => { downloadReport(report.id); setMenuOpen(false); }} style={reportTertiaryBtnStyle}>
                    <Download size={13} aria-hidden /> Download
                  </button>
                  <button type="button" onClick={() => { setEmailDrawerOpen(true); setMenuOpen(false); }} style={reportTertiaryBtnStyle}>
                    <Mail size={13} aria-hidden /> Email
                  </button>
                  <button type="button" onClick={() => { onScheduleReport(); setMenuOpen(false); }} style={reportTertiaryBtnStyle}>
                    <CalendarClock size={13} aria-hidden /> Schedule
                  </button>
                  <button type="button" onClick={() => { toggleSave(report.id); setMenuOpen(false); }} aria-pressed={report.saved} style={reportTertiaryBtnStyle}>
                    <Bookmark size={13} aria-hidden /> {report.saved ? "Unsave" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (onDeleteRequest) onDeleteRequest(report.id, report.reportName);
                      else deleteHistoryItem(report.id);
                    }}
                    style={reportDestructiveBtnStyle}
                    onMouseEnter={(e) => onDestructiveHover(e, true)}
                    onMouseLeave={(e) => onDestructiveHover(e, false)}
                  >
                    <Trash2 size={13} aria-hidden /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div role="tablist" aria-label="Report detail sections" className="app-report-detail-tabs">
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`report-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`report-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`app-report-detail-tabs__item${activeTab === tab.id ? " app-report-detail-tabs__item--active" : ""}`}
            >
              <span className="app-report-detail-tabs__icon">{tab.icon}</span>
              {tab.label}
              {tab.id === "activity" && (
                <span className="app-report-detail-tabs__count">{reportActivity.length}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="app-report-detail-body"
          role="tabpanel"
          id={`report-panel-${activeTab}`}
          aria-labelledby={`report-tab-${activeTab}`}
          initial={{ opacity: reducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reducedMotion ? 1 : 0 }}
          transition={reportFadeTransition(reducedMotion)}
        >
          {activeTab === "preview" && (
            <>
              <button
                type="button"
                className="app-report-detail-details-toggle"
                onClick={() => setDetailsExpanded((v) => !v)}
                aria-expanded={detailsExpanded}
              >
                <span>Report details</span>
                {detailsExpanded ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
              </button>

              {detailsExpanded && (
                <section className="app-report-detail-info app-report-detail-info--accordion" aria-label="Report information">
                  <dl className="app-report-detail-info__grid">
                    {metaItems.map((meta) => (
                      <div key={meta.label} className="app-report-detail-info__item">
                        <dt className="app-report-detail-info__label">{meta.label}</dt>
                        <dd className="app-report-detail-info__value">{meta.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {report.fileSize && (
                <div className="app-report-detail-body__toolbar">
                  <span>Output size</span>
                  <span>{report.fileSize}</span>
                </div>
              )}

              {previewState?.loading ? (
                <div className="app-report-detail-empty" aria-busy="true" aria-live="polite">
                  Loading preview…
                </div>
              ) : previewState?.error ? (
                <ReportEmptyState
                  variant="error"
                  title="Preview not available"
                  description={previewState.error}
                  action={{ label: "Retry", onClick: () => void loadReportPreview(report.id) }}
                />
              ) : report.status === "running" ? (
                <div className="app-report-detail-empty">Report is generating…</div>
              ) : report.status === "failed" ? (
                <ReportEmptyState variant="error" title="Generation failed" description="Check parameters and retry." />
              ) : preview.columns.length === 0 ? (
                <ReportEmptyState
                  title="Preview not available"
                  description="The original report parameters were not stored. Run a new report to see a preview."
                />
              ) : (
                <div className="app-report-detail-preview-table">
                  <table className="app-report-data-table app-report-data-table--compact">
                    <thead>
                      <tr>
                        {preview.columns.map((col) => (
                          <th key={col.key} scope="col">{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, i) => (
                        <tr key={i}>
                          {preview.columns.map((col) => (
                            <td
                              key={col.key}
                              style={col.key === preview.columns[0]?.key ? { fontWeight: 500, color: reportText } : undefined}
                            >
                              {row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="app-report-detail-preview-foot">
                    Showing {preview.rows.length} of {previewState?.totalCount ?? report.records ?? preview.rows.length} rows
                    {previewState?.fileSize ? ` · Output size: ${previewState.fileSize}` : ""}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "parameters" && (
            parameterRows.length > 0 ? (
              <dl className="app-report-param-list">
                {parameterRows.map((row) => (
                  <div key={row.label} className="app-report-param-list__row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="app-report-detail-empty">Parameters were not recorded for this report.</p>
            )
          )}

          {activeTab === "schedule" && (
            schedule ? (
              <div className="app-report-schedule-detail">
                <dl className="app-report-param-list">
                  {[
                    { label: "Frequency", value: schedule.frequency },
                    { label: "Next run", value: schedule.nextRun },
                    { label: "Recipients", value: schedule.recipients },
                    { label: "Timezone", value: schedule.timezone ?? "-" },
                    { label: "Delivery time", value: schedule.deliveryTime ?? "-" },
                    { label: "Status", value: schedule.status === "active" ? "Active" : "Paused" },
                  ].map((row) => (
                    <div key={row.label} className="app-report-param-list__row">
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
                {onEditSchedule && (
                  <button
                    type="button"
                    onClick={() => onEditSchedule(schedule.id)}
                    className="app-report-detail-actions__secondary-btn"
                    style={{ marginTop: "8px", alignSelf: "flex-start" }}
                  >
                    <CalendarClock size={13} aria-hidden /> Edit schedule
                  </button>
                )}
              </div>
            ) : (
              <div>
                <p className="app-report-detail-empty" style={{ marginBottom: "12px" }}>
                  This report is not scheduled. Use the Schedule button to set up automated delivery.
                </p>
                <button type="button" onClick={onScheduleReport} className="app-report-detail-actions__secondary-btn">
                  <CalendarClock size={13} aria-hidden /> Set up schedule
                </button>
              </div>
            )
          )}

          {activeTab === "activity" && (
            <ul className="app-report-activity-list">
              {reportActivity.map((a) => (
                <li key={a.id} className="app-report-activity-list__item">
                  <div className="app-report-activity-list__desc">{a.description}</div>
                  <div className="app-report-activity-list__meta">{a.timestamp}</div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );

  if (variant === "modal") {
    return (
      <>
        {createPortal(
          <AnimatePresence>
            <div key={report.id} className="app-report-modal" role="presentation">
              <motion.div
                className="app-report-modal__backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reportModalBackdropTransition(reducedMotion)}
                onClick={onClose}
                aria-hidden
              />
              <div className="app-report-modal__viewport">
                <motion.div
                  ref={panelRef}
                  className={panelClass}
                  style={{ fontFamily: reportFont, ...reportDetailModalPanelStyle }}
                  initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
                  transition={reportModalPanelTransition(reducedMotion)}
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Report details: ${report.reportName}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {panelContent}
                </motion.div>
              </div>
            </div>
          </AnimatePresence>,
          document.body,
        )}
        <EmailReportDrawer open={emailDrawerOpen} onOpenChange={setEmailDrawerOpen} fixedReportId={report.id} />
      </>
    );
  }

  return (
    <>
      <motion.div
        key={report.id}
        className={panelClass}
        style={{ fontFamily: reportFont }}
        initial={{ opacity: reducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={reportFadeTransition(reducedMotion)}
      >
        {panelContent}
      </motion.div>
      <EmailReportDrawer open={emailDrawerOpen} onOpenChange={setEmailDrawerOpen} fixedReportId={report.id} />
    </>
  );
}
