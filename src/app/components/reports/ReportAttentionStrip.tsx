import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { useReports } from "../../context/ReportsContext";
import { reportFont } from "./reportUiStyles";

type ReportAttentionStripProps = {
  onSelectReport: (id: string) => void;
  onNavigateToSchedules?: () => void;
  onViewAll?: (focus: "failed" | "running") => void;
  onDismiss?: () => void;
  dismissed?: boolean;
};

type AlertItem = {
  key: string;
  tone: "danger" | "info";
  label: string;
  reportId: string;
};

function formatUpdatedTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * Phase 3 status bar: surfaces only running and failed saved reports.
 * Hidden when neither state is present. When GetSavedReport exposes live
 * Status fields (running/failed), counts and chips activate automatically
 * via mapSavedReportStatus — no schedule or due-soon alerts here.
 */
export function ReportAttentionStrip({
  onSelectReport,
  onViewAll,
  onDismiss,
  dismissed = false,
}: ReportAttentionStripProps) {
  const { history, retryFailedReport, refreshKey } = useReports();
  const [collapsed, setCollapsed] = useState(false);

  const failed = useMemo(() => history.filter((r) => r.status === "failed"), [history]);
  const running = useMemo(() => history.filter((r) => r.status === "running"), [history]);

  const lastUpdated = useMemo(() => formatUpdatedTime(new Date()), [history, refreshKey]);

  const items = useMemo(() => {
    const list: AlertItem[] = [];
    failed.forEach((r) => {
      list.push({ key: `failed-${r.id}`, tone: "danger", label: r.reportName, reportId: r.id });
    });
    running.forEach((r) => {
      list.push({ key: `running-${r.id}`, tone: "info", label: r.reportName, reportId: r.id });
    });
    return list;
  }, [failed, running]);

  if (dismissed || items.length === 0) return null;

  const toneStyles = {
    danger: { bg: "#FEF2F2", color: "#B42318", icon: <AlertTriangle size={11} aria-hidden /> },
    info: { bg: "#EFF8FF", color: "#175CD3", icon: <Loader2 size={11} aria-hidden /> },
  };

  const viewAllFocus: "failed" | "running" | null =
    failed.length > 0 ? "failed" : running.length > 0 ? "running" : null;

  const handleRetryAll = async () => {
    for (const report of failed) {
      await retryFailedReport(report.id);
    }
  };

  return (
    <div role="status" aria-live="polite" className="app-report-notifications" style={{ fontFamily: reportFont }}>
      <div className="app-report-notifications__bar">
        <div className="app-report-notifications__summary">
          {failed.length > 0 && (
            <span className="app-report-notifications__stat app-report-notifications__stat--danger">
              <span className="app-report-notifications__dot app-report-notifications__dot--danger" aria-hidden />
              {failed.length} failed
            </span>
          )}
          {running.length > 0 && (
            <span className="app-report-notifications__stat app-report-notifications__stat--info">
              <span className="app-report-notifications__dot app-report-notifications__dot--info" aria-hidden />
              {running.length} running
            </span>
          )}
        </div>

        {!collapsed && (
          <div className="app-report-notifications__chips">
            {items.map((item) => {
              const tone = toneStyles[item.tone];
              const prefix = item.tone === "danger" ? "Failed" : "Running";
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectReport(item.reportId)}
                  className={`app-report-notifications__chip app-report-notifications__chip--${item.tone}`}
                  style={{ background: tone.bg, color: tone.color }}
                >
                  {tone.icon}
                  <span className="app-report-notifications__chip-prefix">{prefix}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="app-report-notifications__actions">
          <span className="app-report-notifications__updated" title="Last refreshed">
            <Clock size={11} aria-hidden />
            {lastUpdated}
          </span>

          {failed.length > 0 && (
            <button
              type="button"
              onClick={handleRetryAll}
              className="app-report-notifications__action app-report-notifications__action--retry"
            >
              <RefreshCw size={11} aria-hidden />
              Retry{failed.length > 1 ? ` (${failed.length})` : ""}
            </button>
          )}

          {onViewAll && viewAllFocus && (
            <button
              type="button"
              onClick={() => onViewAll(viewAllFocus)}
              className="app-report-notifications__action"
            >
              View all
            </button>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            className="app-report-notifications__action"
          >
            {collapsed ? <ChevronDown size={12} aria-hidden /> : <ChevronUp size={12} aria-hidden />}
            {collapsed ? "Expand" : "Collapse"}
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss alerts"
              className="app-report-notifications__action app-report-notifications__action--icon"
            >
              <X size={12} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
