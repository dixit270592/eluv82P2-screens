import { CalendarClock, CheckCircle2, FileText, Loader2 } from "lucide-react";

import { P2P_BRAND } from "../../tokens/brand";

import type { PreviewColumn, PreviewRow } from "../../utils/reportPreviewData";

import { reportFont, reportPageSubtitleStyle, reportSectionTitleStyle } from "./reportUiStyles";



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



export function ReportPreviewPanel({ preview }: { preview: PreviewState }) {

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

      <div className="app-report-preview-panel app-report-preview-panel--loading" role="status" aria-live="polite" aria-busy="true">

        <Loader2 size={28} color={P2P_BRAND.primary} className="app-report-preview-panel__spinner" aria-hidden />

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

      <div className="app-report-preview-panel app-report-preview-panel--scheduled" role="status" aria-live="polite">

        <div className="app-report-preview-panel__scheduled-icon" aria-hidden>

          <CheckCircle2 size={32} color="#059669" />

        </div>

        <h3 className="app-report-preview-panel__empty-title">Report Scheduled</h3>

        <p className="app-report-preview-panel__empty-desc" style={{ marginBottom: "20px" }}>

          <strong style={{ color: "#344054" }}>{preview.reportName}</strong> will be delivered automatically.

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

    <div className="app-report-preview-panel app-report-preview-panel--data">

      <div className="app-report-preview-panel__meta">

        <div>

          <div className="app-report-preview-panel__meta-label">Report</div>

          <div className="app-report-preview-panel__meta-value">{preview.reportName}</div>

        </div>

        <div>

          <div className="app-report-preview-panel__meta-label">Records</div>

          <div className="app-report-preview-panel__meta-value">{preview.totalCount.toLocaleString()}</div>

        </div>

        {preview.generatedOn && (

          <div>

            <div className="app-report-preview-panel__meta-label">Generated</div>

            <div className="app-report-preview-panel__meta-value">{preview.generatedOn}</div>

          </div>

        )}

      </div>



      {preview.columns.length > 0 ? (

        <div className="app-report-preview-panel__table-wrap">

          <table className="app-report-preview-panel__table">

            <thead>

              <tr>

                {preview.columns.map((col) => (

                  <th key={col.key} scope="col">

                    {col.label}

                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {preview.rows.length > 0 ? (

                preview.rows.slice(0, 50).map((row, rowIndex) => (

                  <tr key={rowIndex}>

                    {preview.columns.map((col) => (

                      <td key={col.key}>{row[col.key] ?? "—"}</td>

                    ))}

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan={preview.columns.length} className="app-report-preview-panel__no-rows">

                    No records match your filters.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

          {preview.rows.length > 50 && (

            <p className="app-report-preview-panel__truncated">

              Showing first 50 of {preview.totalCount.toLocaleString()} records.

            </p>

          )}

        </div>

      ) : (

        <div className="app-report-preview-panel__summary">

          <FileText size={20} color={P2P_BRAND.primary} aria-hidden />

          <p>Report generated with {preview.totalCount.toLocaleString()} records.</p>

        </div>

      )}

    </div>

  );

}

