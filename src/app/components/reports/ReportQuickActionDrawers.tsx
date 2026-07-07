import { useEffect, useState } from "react";
import { outputFormatOptions } from "../../data/reportConfigureOptions";
import { useReports } from "../../context/ReportsContext";
import { toast } from "sonner";
import { ReportCenterModal } from "./ReportCenterModal";
import {
  onInputFocus,
  onPrimaryBtnHover,
  onSurfaceHover,
  reportCancelBtnStyle,
  reportInfoPanelStyle,
  reportInputStyle,
  reportLabelStyle,
  reportPrimaryBtnStyle,
} from "./reportUiStyles";

export function ExportAllDrawer({
  open,
  onOpenChange,
  fixedReportIds,
  title = "Export All",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixedReportIds?: string[];
  title?: string;
}) {
  const { exportAllReports, exportReportsByIds, history } = useReports();
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState("all");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormat("pdf");
      setScope("all");
      setExporting(false);
    }
  }, [open]);

  const handleExport = () => {
    setExporting(true);
    window.setTimeout(() => {
      if (fixedReportIds && fixedReportIds.length > 0) {
        exportReportsByIds(fixedReportIds, format === "pdf" ? "pdf" : format === "csv" ? "csv" : "xlsx");
      } else {
        exportAllReports(scope, format === "pdf" ? "pdf" : format === "csv" ? "csv" : "xlsx");
      }
      setExporting(false);
      onOpenChange(false);
    }, 400);
  };

  const lockedCount = fixedReportIds?.length ?? 0;

  return (
    <ReportCenterModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      subtitle={
        lockedCount > 0
          ? `Download ${lockedCount} report${lockedCount === 1 ? "" : "s"} in your preferred format.`
          : "Download all reports in your preferred format."
      }
      ariaLabel="Export all reports"
      footer={
        <>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            style={reportCancelBtnStyle}
            onMouseEnter={(e) => onSurfaceHover(e, true)}
            onMouseLeave={(e) => onSurfaceHover(e, false)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            aria-busy={exporting}
            style={{
              ...reportPrimaryBtnStyle,
              opacity: exporting ? 0.85 : 1,
              cursor: exporting ? "wait" : "pointer",
            }}
            onMouseEnter={(e) => !exporting && onPrimaryBtnHover(e, true)}
            onMouseLeave={(e) => !exporting && onPrimaryBtnHover(e, false)}
          >
            {exporting ? "Exporting…" : "Export"}
          </button>
        </>
      }
    >
      <div className="app-report-modal-fields">
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={reportLabelStyle}>Output Format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={reportInputStyle}
            onFocus={(e) => onInputFocus(e, true)}
            onBlur={(e) => onInputFocus(e, false)}
          >
            {outputFormatOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {!fixedReportIds && (
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={reportLabelStyle}>Reports to Include</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              style={reportInputStyle}
              onFocus={(e) => onInputFocus(e, true)}
              onBlur={(e) => onInputFocus(e, false)}
            >
              <option value="all">All reports ({history.length})</option>
              <option value="completed">Completed only</option>
              <option value="saved">Saved reports</option>
              <option value="starred">Starred reports</option>
            </select>
          </label>
        )}

        {lockedCount > 0 && (
          <div style={reportInfoPanelStyle}>
            Exporting {lockedCount} report{lockedCount === 1 ? "" : "s"} from your current selection or filter.
          </div>
        )}

        {!fixedReportIds && (
          <div style={reportInfoPanelStyle}>
            Exports will include report metadata, run history, and the selected output format for each matching report.
          </div>
        )}
      </div>
    </ReportCenterModal>
  );
}

export function EmailReportDrawer({
  open,
  onOpenChange,
  fixedReportId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixedReportId?: string | null;
}) {
  const { history, emailReport } = useReports();
  const [reportId, setReportId] = useState(fixedReportId ?? history[0]?.id ?? "");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) {
      setReportId(fixedReportId ?? history[0]?.id ?? "");
      setRecipients("");
      setSubject("");
      setSending(false);
      return;
    }
    if (fixedReportId) setReportId(fixedReportId);
  }, [open, history, fixedReportId]);

  useEffect(() => {
    if (!open) return;
    const report = history.find((r) => r.id === reportId);
    if (report) setSubject(`${report.reportName} - Report Delivery`);
  }, [reportId, open, history]);

  const handleSend = async () => {
    if (!recipients.trim()) {
      toast.error("Enter at least one recipient email");
      return;
    }
    setSending(true);
    const ok = await emailReport(reportId, recipients, subject);
    setSending(false);
    if (ok) onOpenChange(false);
  };

  return (
    <ReportCenterModal
      open={open}
      onOpenChange={onOpenChange}
      title="Email Report"
      subtitle="Send a report to one or more recipients."
      ariaLabel="Email report"
      footer={
        <>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            style={reportCancelBtnStyle}
            onMouseEnter={(e) => onSurfaceHover(e, true)}
            onMouseLeave={(e) => onSurfaceHover(e, false)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            aria-busy={sending}
            style={{
              ...reportPrimaryBtnStyle,
              opacity: sending ? 0.85 : 1,
              cursor: sending ? "wait" : "pointer",
            }}
            onMouseEnter={(e) => !sending && onPrimaryBtnHover(e, true)}
            onMouseLeave={(e) => !sending && onPrimaryBtnHover(e, false)}
          >
            {sending ? "Sending…" : "Send Email"}
          </button>
        </>
      }
    >
      <div className="app-report-modal-fields">
        {!fixedReportId && (
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={reportLabelStyle}>Report</span>
            <select
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              style={reportInputStyle}
              onFocus={(e) => onInputFocus(e, true)}
              onBlur={(e) => onInputFocus(e, false)}
            >
              {history.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.reportName}
                </option>
              ))}
            </select>
          </label>
        )}

        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={reportLabelStyle}>Recipients</span>
          <input
            type="text"
            placeholder="email@company.com, team@company.com"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            style={reportInputStyle}
            onFocus={(e) => onInputFocus(e, true)}
            onBlur={(e) => onInputFocus(e, false)}
            aria-required="true"
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={reportLabelStyle}>Email Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={reportInputStyle}
            onFocus={(e) => onInputFocus(e, true)}
            onBlur={(e) => onInputFocus(e, false)}
          />
        </label>
      </div>
    </ReportCenterModal>
  );
}
