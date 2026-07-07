import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  Activity,
  Bookmark,
  CalendarClock,
  ChevronLeft,
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
  reportFont,
  reportTertiaryBtnStyle,
  reportText,
} from "./reportUiStyles";
import { reportFadeTransition, useReportReducedMotion } from "./reportMotion";



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

  onClose?: () => void;

  onGenerateReport: () => void;

  onScheduleReport: () => void;

  onRunAgain: (report: ReportHistoryItem) => void;

  onEditSchedule?: (scheduleId: string) => void;

  onDeleteRequest?: (id: string, name: string) => void;

};



export function ReportDetailPanel({

  report,

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

    activity,

    getScheduleForReport,

    loadReportPreview,

    reportPreviews,

    runReportAgain,

  } = useReports();

  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<DetailTab>("preview");

  const [showLowPriority, setShowLowPriority] = useState(false);
  const reducedMotion = useReportReducedMotion();



  const schedule = useMemo(

    () => (report ? getScheduleForReport(report.id, report.reportName) : undefined),

    [report, getScheduleForReport],

  );

  useEffect(() => {
    setActiveTab("preview");
    setShowLowPriority(false);
  }, [report?.id]);

  useEffect(() => {
    if (report && activeTab === "preview") {
      void loadReportPreview(report.id);
    }
  }, [report, activeTab, loadReportPreview]);


  if (!report) {

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

  const isSaved = report.saved;

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

  const reportActivity = activity.filter((a) =>

    a.description.toLowerCase().includes(report.reportName.toLowerCase()),

  );



  const metaItems = [
    { label: "Created", value: report.created },
    { label: "Last run", value: report.lastRun },
    { label: "Format", value: runConfig?.outputFormatLabel ?? "Excel (.xlsx)" },
    { label: "Records", value: previewState?.totalCount != null ? previewState.totalCount.toLocaleString() : report.records != null ? report.records.toLocaleString() : "—" },
  ];



  return (

    <>

      <motion.div
        key={report.id}
        className="app-report-detail-panel"
        style={{ fontFamily: reportFont }}
        initial={{ opacity: reducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={reportFadeTransition(reducedMotion)}
      >
          <div className="app-report-detail-header">

            <div className="app-report-detail-header__top">

              <div className="app-report-detail-header__title-block">

                <div className="app-report-detail-header__title-row">

                  {onClose && (
                    <button
                      type="button"
                      className="app-report-detail-back"
                      onClick={onClose}
                      aria-label="Back to report list"
                    >
                      <ChevronLeft size={18} aria-hidden />
                    </button>
                  )}

                  <h2 className="app-report-detail-header__title">{report.reportName}</h2>

                  <span className="app-report-status-badge" style={{ background: sc.bg, color: sc.color }}>

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
                    {report.owner}
                  </span>
                  {isSaved && (
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

              <button

                type="button"

                onClick={() => toggleStar(report.id)}

                aria-pressed={isStarred}

                aria-label={isStarred ? "Remove from favorites" : "Add to favorites"}

                className={`app-report-detail-header__star${isStarred ? " app-report-detail-header__star--active" : ""}`}

              >

                <Star size={16} color={isStarred ? "#D97706" : "#98A2B3"} fill={isStarred ? "#FEF3C7" : "none"} aria-hidden />

              </button>

            </div>



            <section className="app-report-detail-info" aria-label="Report information">
              <dl className="app-report-detail-info__grid">
                {metaItems.map((meta) => (
                  <div key={meta.label} className="app-report-detail-info__item">
                    <dt className="app-report-detail-info__label">{meta.label}</dt>
                    <dd className="app-report-detail-info__value">{meta.value}</dd>
                  </div>
                ))}
              </dl>
            </section>



            <div className="app-report-detail-actions">

              <div className="app-report-detail-actions__primary">

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
                    onClick={async () => {
                      const result = await runReportAgain(report);
                      if (result) void loadReportPreview(report.id);
                    }}
                    disabled={!runConfig && !report.apiPayload?.reportTemplateType}
                    className="app-report-detail-actions__primary-btn"
                    style={{ opacity: runConfig || report.apiPayload?.reportTemplateType ? 1 : 0.5 }}
                    title={
                      runConfig || report.apiPayload?.reportTemplateType
                        ? undefined
                        : "Original parameters not available."
                    }
                    onMouseEnter={(e) => (runConfig || report.apiPayload?.reportTemplateType) && onPrimaryBtnHover(e, true)}
                    onMouseLeave={(e) => (runConfig || report.apiPayload?.reportTemplateType) && onPrimaryBtnHover(e, false)}
                  >
                    <Play size={13} aria-hidden /> Run Again
                  </button>

                )}

              </div>

              <div className="app-report-detail-actions__secondary">

                <button
                  type="button"
                  onClick={() => downloadReport(report.id)}
                  className="app-report-detail-actions__secondary-btn"
                >
                  <Download size={13} aria-hidden /> Download
                </button>
                <button
                  type="button"
                  onClick={() => setEmailDrawerOpen(true)}
                  className="app-report-detail-actions__secondary-btn"
                >
                  <Mail size={13} aria-hidden /> Email
                </button>
                <button
                  type="button"
                  onClick={onScheduleReport}
                  className="app-report-detail-actions__secondary-btn"
                >
                  <CalendarClock size={13} aria-hidden /> Schedule
                </button>

              </div>

              <div className="app-report-detail-actions__low">

                <button

                  type="button"

                  onClick={() => setShowLowPriority((v) => !v)}

                  aria-expanded={showLowPriority}

                  aria-label="More actions"

                  className="app-report-detail-actions__more"

                >

                  <MoreHorizontal size={16} aria-hidden />

                </button>

                {showLowPriority && (

                  <div className="app-report-detail-actions__low-menu">

                    <button

                      type="button"

                      onClick={() => toggleSave(report.id)}

                      aria-pressed={isSaved}

                      style={reportTertiaryBtnStyle}

                    >

                      <Bookmark size={13} aria-hidden /> {isSaved ? "Unsave" : "Save"}

                    </button>

                    <button

                      type="button"

                      onClick={() =>
                        onDeleteRequest
                          ? onDeleteRequest(report.id, report.reportName)
                          : deleteHistoryItem(report.id)
                      }

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

                  {tab.id === "activity" && reportActivity.length > 0 && (

                    <span className="app-report-detail-tabs__count">{reportActivity.length}</span>

                  )}

                </button>

              ))}

            </div>

          </div>



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

                  <ReportEmptyState
                    variant="error"
                    title="Generation failed"
                    description="Check parameters and retry."
                  />

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

                              <td key={col.key} style={col.key === preview.columns[0]?.key ? { fontWeight: 500, color: reportText } : undefined}>

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

                <p className="app-report-detail-empty">Filter parameters were not recorded for this report.</p>

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

                  <p className="app-report-detail-empty" style={{ marginBottom: "12px" }}>This report is not on a recurring schedule.</p>

                  <button
                    type="button"
                    onClick={onScheduleReport}
                    className="app-report-detail-actions__secondary-btn"
                  >
                    <CalendarClock size={13} aria-hidden /> Set up schedule
                  </button>

                </div>

              )

            )}



            {activeTab === "activity" && (

              reportActivity.length > 0 ? (

                <ul className="app-report-activity-list">

                  {reportActivity.map((a) => (

                    <li key={a.id} className="app-report-activity-list__item">

                      <div className="app-report-activity-list__desc">{a.description}</div>

                      <div className="app-report-activity-list__meta">{a.user} · {a.timestamp}</div>

                    </li>

                  ))}

                </ul>

              ) : (

                <p className="app-report-detail-empty">No activity recorded for this report yet.</p>

              )

            )}

            </motion.div>
          </AnimatePresence>
      </motion.div>

      <EmailReportDrawer open={emailDrawerOpen} onOpenChange={setEmailDrawerOpen} fixedReportId={report.id} />

    </>

  );

}


