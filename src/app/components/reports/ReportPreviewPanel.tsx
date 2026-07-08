import { useState } from "react";
import { CalendarClock, CheckCircle2, FileText, Loader2, Maximize2, X } from "lucide-react";
import { toast } from "sonner";

import { P2P_BRAND } from "../../tokens/brand";

import type { PreviewColumn, PreviewRow } from "../../utils/reportPreviewData";
import { downloadPreviewReport } from "../../utils/downloadPreviewReport";

import { ReportPreviewCharts } from "./ReportPreviewCharts";
import {
  onPrimaryBtnHover,
  reportFont,
  reportPageSubtitleStyle,
  reportPrimaryBtnStyle,
  reportSectionTitleStyle,
} from "./reportUiStyles";

export type PreviewState =
  | { status: "idle" }
  | { status: "loading"; reportName: string; scheduleMode?: boolean }
  | {
      status: "success";
      reportName: string;
      columns: PreviewColumn[];
      rows: PreviewRow[];
      totalCount: number;
      generatedOn?: string;
    }
  | {
      status: "scheduled";
      reportName: string;
      frequency: string;
      recipients: string;
      deliveryTime: string;
      timezone: string;
    }
  | { status: "error"; message: string };

type PreviewContentTab = "preview" | "charts";

const PREVIEW_TABS: { id: PreviewContentTab; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "charts", label: "Charts" },
];

function PreviewTableContent({
  columns,
  rows,
  totalCount,
}: {
  columns: PreviewColumn[];
  rows: PreviewRow[];
  totalCount: number;
}) {
  if (columns.length === 0) {
    return (
      <div className="app-report-preview-panel__summary">
        <FileText size={20} color={P2P_BRAND.primary} aria-hidden />
        <p>Report generated with {totalCount.toLocaleString()} records.</p>
      </div>
    );
  }

  return (
    <div className="app-report-preview-panel__table-wrap">
      <table className="app-report-preview-panel__table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.slice(0, 50).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key] ?? "—"}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="app-report-preview-panel__no-rows">
                No records match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {rows.length > 50 && (
        <p className="app-report-preview-panel__truncated">
          Showing first 50 of {totalCount.toLocaleString()} records.
        </p>
      )}
    </div>
  );
}

function PreviewSuccessCard({
  preview,
  expanded = false,
  onExpandToggle,
}: {
  preview: Extract<PreviewState, { status: "success" }>;
  expanded?: boolean;
  onExpandToggle?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<PreviewContentTab>("preview");
  const showTabs = preview.columns.length > 0 && preview.rows.length > 0;

  return (
    <div
      className={`app-report-preview-card${expanded ? " app-report-preview-card--expanded" : ""}`}
    >
      <div className="app-report-preview-card__header">
        <div className="app-report-preview-card__heading">
          <h3 className="app-report-preview-card__title">{preview.reportName}</h3>
          <p className="app-report-preview-card__subtitle">
            Preview of your report based on selected filters.
          </p>
        </div>
        {onExpandToggle && (
          <button
            type="button"
            className="app-report-preview-card__expand"
            onClick={onExpandToggle}
            aria-label={expanded ? "Close expanded preview" : "Expand preview"}
          >
            {expanded ? <X size={14} aria-hidden /> : <Maximize2 size={14} aria-hidden />}
            {expanded ? "Close" : "Expand"}
          </button>
        )}
      </div>

      {showTabs && (
        <div className="app-report-preview-tabs" role="tablist" aria-label="Preview content">
          {PREVIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`preview-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`preview-tabpanel-${tab.id}`}
              className={`app-report-preview-tabs__item${
                activeTab === tab.id ? " app-report-preview-tabs__item--active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="app-report-preview-card__body">
        {!showTabs || activeTab === "preview" ? (
          <div
            role="tabpanel"
            id="preview-tabpanel-preview"
            aria-labelledby="preview-tab-preview"
            className="app-report-preview-card__panel"
          >
            <PreviewTableContent
              columns={preview.columns}
              rows={preview.rows}
              totalCount={preview.totalCount}
            />
          </div>
        ) : (
          <div
            role="tabpanel"
            id="preview-tabpanel-charts"
            aria-labelledby="preview-tab-charts"
            className="app-report-preview-card__panel"
          >
            <ReportPreviewCharts columns={preview.columns} rows={preview.rows} />
          </div>
        )}
      </div>

      {preview.generatedOn && (
        <div className="app-report-preview-card__footer">
          Generated on {preview.generatedOn}
        </div>
      )}
    </div>
  );
}

export function ReportPreviewPanel({ preview }: { preview: PreviewState }) {
  const [expanded, setExpanded] = useState(false);

  if (preview.status === "idle") {
    return (
      <div className="app-report-preview-panel app-report-preview-panel--empty">
        <div className="app-report-preview-panel__empty-icon" aria-hidden>
          <FileText size={32} color="#D0D5DD" />
        </div>
        <h3 className="app-report-preview-panel__empty-title">No Report Generated Yet</h3>
        <p className="app-report-preview-panel__empty-desc">
          Configure your report filters and click &ldquo;Generate Report&rdquo; to preview your data here.
        </p>
      </div>
    );
  }

  if (preview.status === "loading") {
    const loadingLabel = preview.scheduleMode ? "Saving Schedule" : "Generating Report";

    return (
      <div
        className="app-report-preview-panel app-report-preview-panel--loading"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2
          size={28}
          color={P2P_BRAND.primary}
          className="app-report-preview-panel__spinner"
          aria-hidden
        />
        <div style={{ ...reportSectionTitleStyle, marginBottom: "4px" }}>{loadingLabel}</div>
        <p style={{ ...reportPageSubtitleStyle, margin: 0, fontFamily: reportFont }}>
          Processing <strong style={{ color: "#344054" }}>{preview.reportName}</strong>…
        </p>
      </div>
    );
  }

  if (preview.status === "error") {
    return (
      <div className="app-report-preview-panel app-report-preview-panel--error" role="alert">
        <div className="app-report-preview-panel__error-title">Unable to complete request</div>
        <p className="app-report-preview-panel__error-desc">{preview.message}</p>
      </div>
    );
  }

  if (preview.status === "scheduled") {
    return (
      <div
        className="app-report-preview-panel app-report-preview-panel--scheduled"
        role="status"
        aria-live="polite"
      >
        <div className="app-report-preview-panel__scheduled-icon" aria-hidden>
          <CheckCircle2 size={32} color="#059669" />
        </div>
        <h3 className="app-report-preview-panel__empty-title">Report Scheduled</h3>
        <p className="app-report-preview-panel__empty-desc" style={{ marginBottom: "20px" }}>
          <strong style={{ color: "#344054" }}>{preview.reportName}</strong> will be delivered
          automatically.
        </p>
        <div className="app-report-preview-panel__meta">
          <div>
            <div className="app-report-preview-panel__meta-label">Frequency</div>
            <div className="app-report-preview-panel__meta-value">{preview.frequency}</div>
          </div>
          <div>
            <div className="app-report-preview-panel__meta-label">Delivery Time</div>
            <div className="app-report-preview-panel__meta-value">{preview.deliveryTime || "—"}</div>
          </div>
          {preview.timezone && (
            <div>
              <div className="app-report-preview-panel__meta-label">Timezone</div>
              <div className="app-report-preview-panel__meta-value">{preview.timezone}</div>
            </div>
          )}
          <div style={{ flexBasis: "100%" }}>
            <div className="app-report-preview-panel__meta-label">Recipients</div>
            <div className="app-report-preview-panel__meta-value">{preview.recipients}</div>
          </div>
        </div>
        <div className="app-report-preview-panel__schedule-note">
          <CalendarClock size={14} aria-hidden />
          <span>View and manage this schedule from the Schedules section.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="app-report-preview-panel app-report-preview-panel--data">
        <div className="app-report-preview-panel__main">
          <PreviewSuccessCard
            preview={preview}
            onExpandToggle={() => setExpanded((value) => !value)}
          />
        </div>
        <div className="app-report-preview-panel__save-bar">
          <button
            type="button"
            className="app-report-preview-panel__save-btn"
            style={reportPrimaryBtnStyle}
            aria-label="Save report"
            onClick={() => {
              downloadPreviewReport({
                reportName: preview.reportName,
                columns: preview.columns,
                rows: preview.rows,
                totalCount: preview.totalCount,
                generatedOn: preview.generatedOn,
              });
              toast.success("Report downloaded with preview data and charts.");
            }}
            onMouseEnter={(e) => onPrimaryBtnHover(e, true)}
            onMouseLeave={(e) => onPrimaryBtnHover(e, false)}
          >
            Save Report
          </button>
        </div>
      </div>

      {expanded && (
        <div className="app-report-preview-expand-overlay" role="dialog" aria-modal="true">
          <button
            type="button"
            className="app-report-preview-expand-overlay__backdrop"
            aria-label="Close expanded preview"
            onClick={() => setExpanded(false)}
          />
          <div className="app-report-preview-expand-overlay__panel">
            <PreviewSuccessCard
              preview={preview}
              expanded
              onExpandToggle={() => setExpanded(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
