import type { ReportHistoryStatus } from "../data/reportHistory";
import type { SavedReportApiItem } from "../types/reportApi";

function pickStatusRaw(item: SavedReportApiItem): string {
  const record = item as Record<string, unknown>;
  const candidates = [record.Status, record.ReportStatus, record.status, record.State];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim().toLowerCase();
  }
  return "";
}

export function mapSavedReportStatus(item: SavedReportApiItem): ReportHistoryStatus {
  const status = pickStatusRaw(item);
  if (status.includes("fail")) return "failed";
  if (status.includes("run") && !status.includes("rerun")) return "running";
  if (status.includes("sched")) return "scheduled";
  return "completed";
}
