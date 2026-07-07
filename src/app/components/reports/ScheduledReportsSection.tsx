import { CalendarClock, Edit3, Pause, Play, Trash2, Users } from "lucide-react";

import { useEffect, useState } from "react";

import { useReports } from "../../context/ReportsContext";

import type { ScheduledReportStatus } from "../../data/scheduledReports";

import { ReportDeleteConfirmDialog } from "./ReportDeleteConfirmDialog";

import { ReportEmptyState } from "./ReportEmptyState";

import { ReportScheduleTableSkeleton } from "./ReportSkeletons";

import { ReportSectionErrorBanner } from "./ReportSectionErrorBanner";

import { ReportTooltipButton } from "./ReportTooltipButton";

import { reportCardShellStyle, reportFont } from "./reportUiStyles";



const statusConfig: Record<ScheduledReportStatus, { bg: string; color: string; label: string }> = {

  active: { bg: "#ECFDF5", color: "#059669", label: "Active" },

  paused: { bg: "#F2F4F7", color: "#667085", label: "Paused" },

};



const ACTION_ICON_SIZE = 13;



export function ScheduledReportsSection({

  onScheduleNew,

  onEditSchedule,

}: {

  onScheduleNew: () => void;

  onEditSchedule: (scheduleId: string) => void;

}) {

  const { scheduledReports, pauseScheduled, resumeScheduled, deleteScheduled, reloadSchedules, isLoadingSchedules, schedulesError } = useReports();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [schedulesErrorDismissed, setSchedulesErrorDismissed] = useState(false);

  useEffect(() => {
    setSchedulesErrorDismissed(false);
  }, [schedulesError]);

  const togglePause = (id: string, status: ScheduledReportStatus) => {

    if (status === "active") pauseScheduled(id);

    else resumeScheduled(id);

  };



  const activeCount = scheduledReports.filter((r) => r.status === "active").length;

  const pausedCount = scheduledReports.filter((r) => r.status === "paused").length;



  return (

    <div style={{ fontFamily: reportFont }}>

      {schedulesError && scheduledReports.length > 0 && !schedulesErrorDismissed && (
        <ReportSectionErrorBanner
          message={schedulesError}
          onRetry={() => void reloadSchedules()}
          onDismiss={() => setSchedulesErrorDismissed(true)}
        />
      )}

      <div style={reportCardShellStyle}>

        <div className="app-report-schedule-card__header app-report-schedule-card__header--compact">

          <div className="app-report-schedule-card__stats">
            <span className="app-report-schedule-card__stat">
              <strong>{scheduledReports.length}</strong> total
            </span>
            <span className="app-report-schedule-card__stat">
              <strong>{activeCount}</strong> active
            </span>
            {pausedCount > 0 && (
              <span className="app-report-schedule-card__stat app-report-schedule-card__stat--muted">
                <strong>{pausedCount}</strong> paused
              </span>
            )}
          </div>

        </div>

        {isLoadingSchedules && scheduledReports.length === 0 ? (

          <ReportScheduleTableSkeleton rows={4} />

        ) : schedulesError && scheduledReports.length === 0 ? (

          <ReportEmptyState

            variant="error"

            title="Unable to load schedules"

            description={schedulesError}

            action={{ label: "Try again", onClick: () => void reloadSchedules() }}

          />

        ) : scheduledReports.length === 0 ? (

          <ReportEmptyState

            icon={<CalendarClock size={22} aria-hidden />}

            title="No scheduled reports yet"

            description="Set up automated reports to be delivered on a recurring schedule."

            action={{ label: "Schedule Report", onClick: onScheduleNew }}

          />

        ) : (

          <>

            <div className="app-report-table-scroll">

              <table className="app-report-data-table app-report-data-table--wide app-report-data-table--schedule">

                <thead>

                  <tr>

                    {["Report Name", "Frequency", "Owner", "Next Run", "Recipients", "Status", "Actions"].map((h) => (

                      <th key={h} scope="col">{h}</th>

                    ))}

                  </tr>

                </thead>

                <tbody>

                  {scheduledReports.map((row) => {

                    const sc = statusConfig[row.status];

                    const isPaused = row.status === "paused";

                    return (

                      <tr key={row.id}>

                        <td style={{ fontWeight: 600, color: "#101828" }}>{row.reportName}</td>

                        <td>{row.frequency}</td>

                        <td>{row.owner}</td>

                        <td style={{ fontVariantNumeric: "tabular-nums" }}>{row.nextRun}</td>

                        <td>

                          <span className="app-report-recipients" title={row.recipients}>

                            <Users size={12} aria-hidden style={{ flexShrink: 0, color: "#98A2B3" }} />

                            <span className="app-report-recipients__text">{row.recipients}</span>

                          </span>

                        </td>

                        <td>

                          <span className="app-report-status-badge" style={{ background: sc.bg, color: sc.color }}>

                            {sc.label}

                          </span>

                        </td>

                        <td>

                          <div className="app-report-schedule-actions">

                            <ReportTooltipButton label={isPaused ? "Resume schedule" : "Pause schedule"}>

                              <button

                                type="button"

                                className="app-report-icon-action"

                                onClick={() => togglePause(row.id, row.status)}

                                aria-label={isPaused ? "Resume schedule" : "Pause schedule"}

                              >

                                {isPaused ? <Play size={ACTION_ICON_SIZE} /> : <Pause size={ACTION_ICON_SIZE} />}

                              </button>

                            </ReportTooltipButton>

                            <ReportTooltipButton label="Edit schedule">

                              <button

                                type="button"

                                className="app-report-icon-action"

                                onClick={() => onEditSchedule(row.id)}

                                aria-label="Edit schedule"

                              >

                                <Edit3 size={ACTION_ICON_SIZE} />

                              </button>

                            </ReportTooltipButton>

                            <ReportTooltipButton label="Delete schedule">

                              <button

                                type="button"

                                className="app-report-icon-action app-report-icon-action--danger"

                                onClick={() => setDeleteTarget({ id: row.id, name: row.reportName })}

                                aria-label="Delete schedule"

                              >

                                <Trash2 size={ACTION_ICON_SIZE} />

                              </button>

                            </ReportTooltipButton>

                          </div>

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

            <div className="app-report-schedule-footer">

              <span style={{ fontSize: "11px", color: "#98A2B3" }}>

                {activeCount} active · {pausedCount} paused

              </span>

              <span style={{ fontSize: "11px", color: "#667085", fontWeight: 500 }}>

                {scheduledReports.length} scheduled total

              </span>

            </div>

          </>

        )}

      </div>



      <ReportDeleteConfirmDialog
        open={deleteTarget !== null}
        reportName={deleteTarget?.name ?? ""}
        entityLabel="schedule"
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) deleteScheduled(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />

    </div>

  );

}

