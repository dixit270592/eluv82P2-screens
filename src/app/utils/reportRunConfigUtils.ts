import type { ReportHistoryItem } from "../data/reportHistory";
import { dateRangePresets } from "../data/reportConfigureOptions";
import type { ReportTemplateGroup } from "../data/reportTemplates";
import type { ReportRunConfig } from "../components/reports/reportGenerationTypes";

export function findTemplateById(templateId: string, groups: ReportTemplateGroup[]) {
  for (const group of groups) {
    const match = group.templates.find((t) => t.id === templateId);
    if (match) return match;
  }
  return null;
}

export function getReportRunConfig(item: ReportHistoryItem): ReportRunConfig | null {
  return item.runConfig ?? null;
}

export function formatDatePresetLabel(presetId: string): string {
  return dateRangePresets.find((p) => p.id === presetId)?.label ?? presetId;
}

export type ConfigDisplayRow = { label: string; value: string };

export function formatRunConfigForDisplay(config: ReportRunConfig): ConfigDisplayRow[] {
  const rows: ConfigDisplayRow[] = [
    { label: "Date range", value: formatDatePresetLabel(config.datePreset) },
    {
      label: "Departments",
      value: config.departments.length > 0 ? config.departments.join(", ") : "All departments",
    },
    { label: "Vendor", value: config.vendor },
    { label: "Category", value: config.category },
  ];

  if (config.amountMin || config.amountMax) {
    rows.push({
      label: "Amount range",
      value: `${config.amountMin ? `$${Number(config.amountMin).toLocaleString()}` : "Any"} – ${config.amountMax ? `$${Number(config.amountMax).toLocaleString()}` : "Any"}`,
    });
  }

  rows.push(
    { label: "Approval status", value: config.approvalStatus },
    { label: "Request type", value: config.requestType },
    { label: "Output format", value: config.outputFormatLabel },
  );

  if (config.scheduleEnabled) {
    rows.push(
      { label: "Schedule", value: config.frequency ?? "-" },
      { label: "Recipients", value: config.recipients ?? "-" },
    );
  }

  return rows;
}

export function parseReportDate(dateStr: string): Date | null {
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed);
}
