import type { ReportHistoryItem } from "../data/reportHistory";

export type ExportFormat = "csv" | "xlsx" | "pdf" | "print";

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadReportAsCsv(report: ReportHistoryItem) {
  const rows = [
    ["Report Name", "Type", "Owner", "Created", "Last Run", "Status"],
    [report.reportName, report.type, report.owner, report.created, report.lastRun, report.status],
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  triggerDownload(`${sanitizeFilename(report.reportName)}.csv`, csv, "text/csv;charset=utf-8");
}

export function downloadReportsBulk(reports: ReportHistoryItem[], format: ExportFormat) {
  if (format === "print") {
    const html = `<html><head><title>Reports Export</title></head><body>
      <h1>Reports Export</h1>
      <table border="1" cellpadding="6"><tr><th>Name</th><th>Type</th><th>Status</th><th>Last Run</th></tr>
      ${reports.map((r) => `<tr><td>${r.reportName}</td><td>${r.type}</td><td>${r.status}</td><td>${r.lastRun}</td></tr>`).join("")}
      </table></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
    return;
  }

  const ext = format === "xlsx" ? "csv" : format;
  const header = "Report Name,Type,Owner,Created,Last Run,Status\n";
  const body = reports
    .map((r) =>
      [r.reportName, r.type, r.owner, r.created, r.lastRun, r.status]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  triggerDownload(`reports-export.${ext}`, header + body, "text/csv;charset=utf-8");
}

function sanitizeFilename(name: string) {
  return name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) || "report";
}

export function downloadGeneratedReport(reportName: string, format: string) {
  const content = `Report: ${reportName}\nFormat: ${format}\nGenerated: ${new Date().toISOString()}\n\n[Demo export - connect to API for live data]`;
  const ext = format.toLowerCase().includes("csv") ? "csv" : format.toLowerCase().includes("excel") ? "csv" : "txt";
  triggerDownload(`${sanitizeFilename(reportName)}.${ext}`, content, "text/plain;charset=utf-8");
}
