import type { ReportHistoryItem } from "../data/reportHistory";
import type { ReportTemplate, ReportTemplateGroup } from "../data/reportTemplates";
import type { ScheduledReport, ScheduledReportStatus } from "../data/scheduledReports";
import type { ReportRunConfig } from "../components/reports/reportGenerationTypes";
import type {
  BasicFiltersApi,
  DelieveryOptionsApi,
  GenerateReportApiData,
  GenerateReportTableColumn,
  OverviewDataApi,
  ReportTemplateApiItem,
  SavedReportApiItem,
  ScheduledReportApiItem,
} from "../types/reportApi";
import type { PreviewColumn, PreviewRow } from "./reportPreviewData";
import { dateRangePresets } from "../data/reportConfigureOptions";
import { mapSavedReportStatus } from "./reportStatusUtils";

export type OverviewKpiCounts = {
  purchaseRequests: number;
  purchaseOrders: number;
  invoices: number;
  expenses: number;
  capExPRs: number;
};

export type OverviewChartSeries = {
  departmentBreakdown: Array<{ department: string; prs: number; pos: number; invoices: number }>;
  statusDistribution: Array<{ label: string; value: number }>;
};

function pickNumber(source: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && !Number.isNaN(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
}

function pickString(source: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback;
}

export function formatApiDate(value?: string): string {
  if (!value) return "—";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function mapOverviewCounts(data: OverviewDataApi): OverviewKpiCounts {
  const record = data as Record<string, unknown>;
  return {
    purchaseRequests: pickNumber(record, ["PurchaseRequestCount", "PurchaseRequests", "purchaseRequests"]),
    purchaseOrders: pickNumber(record, ["PurchaseOrderCount", "PurchaseOrders", "purchaseOrders"]),
    invoices: pickNumber(record, ["InvoiceCount", "Invoices", "invoices"]),
    expenses: pickNumber(record, ["ExpenseCount", "Expenses", "expenses"]),
    capExPRs: pickNumber(record, ["CapExPRCount", "CapExPRs", "capExPRs", "CapExPrCount"]),
  };
}

/** True when the API returned an empty object or all-zero counts with no chart data. */
export function isOverviewDataEmpty(data: OverviewDataApi): boolean {
  const record = data as Record<string, unknown>;
  if (Object.keys(record).length === 0) return true;
  const counts = mapOverviewCounts(data);
  const hasCounts = Object.values(counts).some((value) => value > 0);
  if (hasCounts) return false;
  const charts = mapOverviewCharts(data);
  return charts.departmentBreakdown.length === 0 && charts.statusDistribution.length === 0;
}

export function mapOverviewCharts(data: OverviewDataApi): OverviewChartSeries {
  const record = data as Record<string, unknown>;
  const deptRaw =
    (record.DepartmentBreakdown as Array<Record<string, unknown>> | undefined) ??
    (record.departmentBreakdown as Array<Record<string, unknown>> | undefined) ??
    [];

  const departmentBreakdown = deptRaw.map((row) => ({
    department: pickString(row, ["Department", "department", "Dept", "dept"], "Unknown"),
    prs: pickNumber(row, ["PRs", "PRCount", "PurchaseRequests", "prs"]),
    pos: pickNumber(row, ["POs", "POCount", "PurchaseOrders", "pos"]),
    invoices: pickNumber(row, ["Invoices", "InvoiceCount", "invoices"]),
  }));

  const statusRaw = record.StatusDistribution ?? record.statusDistribution;
  let statusDistribution: Array<{ label: string; value: number }> = [];

  if (Array.isArray(statusRaw)) {
    statusDistribution = statusRaw.map((row) => {
      const item = row as Record<string, unknown>;
      return {
        label: pickString(item, ["Status", "Label", "status", "label"], "Unknown"),
        value: pickNumber(item, ["Count", "Value", "count", "value"]),
      };
    });
  } else if (statusRaw && typeof statusRaw === "object") {
    statusDistribution = Object.entries(statusRaw as Record<string, unknown>).map(([label, value]) => ({
      label,
      value: typeof value === "number" ? value : Number(value) || 0,
    }));
  }

  return { departmentBreakdown, statusDistribution };
}

export function mapSavedReportItem(
  item: SavedReportApiItem,
  starredIds: Set<string>,
  savedIds: Set<string>,
): ReportHistoryItem {
  const id = String(item.Id ?? item.ReportName ?? crypto.randomUUID());
  const createdRaw = item.CreatedAt ?? item.Created;
  const lastRunRaw = item.LastRunAt ?? item.LastRun ?? createdRaw;

  return {
    id,
    reportName: item.ReportName ?? "Untitled report",
    type: item.ReportTemplateType ?? "Custom Reports",
    owner: item.Owner ?? item.CreatedBy ?? item.UserName ?? "—",
    created: formatApiDate(typeof createdRaw === "string" ? createdRaw : undefined),
    lastRun: formatApiDate(typeof lastRunRaw === "string" ? lastRunRaw : undefined),
    status: mapSavedReportStatus(item),
    saved: savedIds.has(id),
    starred: starredIds.has(id),
    runConfig: mapSavedReportToRunConfig(item),
    records: item.RecordCount ?? item.TotalRecords,
    fileSize: item.FileSize,
    apiPayload: {
      reportTemplateType: item.ReportTemplateType ?? "",
      basicFilters: item.BasicFilters,
      advancedFilters: item.AdvancedFilters,
      delieveryOptions: item.DelieveryOptions,
    },
  };
}

export function mapScheduledReportItem(item: ScheduledReportApiItem): ScheduledReport {
  const id = String(item.Id ?? item.ReportName ?? crypto.randomUUID());
  const recipientsRaw = item.Recipients ?? item.EmailReceipents ?? "";
  const recipients = Array.isArray(recipientsRaw) ? recipientsRaw.join(", ") : recipientsRaw;
  const paused =
    item.IsPaused === true ||
    String(item.Status ?? "").toLowerCase().includes("pause") ||
    String(item.NextRun ?? "").toLowerCase() === "paused";

  const delivery = item.DelieveryOptions?.ScheduleReport ?? item.ScheduleReport;
  const deliveryTime =
    (typeof delivery === "object" && delivery && "Time" in delivery
      ? String((delivery as { Time?: string }).Time ?? "")
      : "") ||
    (typeof item.Time === "string" ? item.Time : "");

  return {
    id,
    reportName: item.ReportName ?? "Scheduled report",
    status: (paused ? "paused" : "active") as ScheduledReportStatus,
    nextRun: paused ? "Paused" : formatApiDate(String(item.NextRun ?? item.NextRunAt ?? item.NextScheduleDateTime ?? "")),
    recipients: recipients || "—",
    frequency: item.Frequency ?? "Weekly",
    owner: item.Owner ?? item.CreatedBy ?? "—",
    timezone: item.TimeZoneId ?? (typeof delivery === "object" && delivery && "TimeZoneId" in delivery
      ? String((delivery as { TimeZoneId?: string }).TimeZoneId ?? "")
      : undefined),
    deliveryTime: deliveryTime || undefined,
    emailSubject: typeof item.EmailSubject === "string" ? item.EmailSubject : undefined,
    linkedReportId: item.ReportId != null ? String(item.ReportId) : undefined,
    sequenceNumber:
      typeof item.SequenceNumber === "number"
        ? item.SequenceNumber
        : typeof item.sequenceNumber === "number"
          ? item.sequenceNumber
          : undefined,
  };
}

function slugifyTemplateType(type: string): string {
  return type
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function mapTemplateItem(item: ReportTemplateApiItem, index: number): ReportTemplate {
  const templateType = item.ReportTemplateType ?? item.Name ?? item.TemplateName ?? `template-${index}`;
  return {
    id: String(templateType),
    name: item.Name ?? item.TemplateName ?? String(templateType),
    description: item.Description ?? "",
    popular: index === 0,
    category: item.Category ?? item.CategoryName,
    parameters: item.Parameters ?? item.ParameterTags ?? [],
    isCustom: item.IsCustom === true || item.IsCloned === true,
  };
}

export function groupTemplates(templates: ReportTemplate[]): ReportTemplateGroup[] {
  const groups = new Map<string, ReportTemplate[]>();

  templates.forEach((template) => {
    const category = template.category ?? inferCategoryFromTemplateType(template.id);
    const list = groups.get(category) ?? [];
    list.push({ ...template, category });
    groups.set(category, list);
  });

  const order = ["AP Reports", "Approval Reports", "Budget Reports", "Custom Reports"];
  return [...groups.entries()]
    .sort(([a], [b]) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map(([label, items]) => ({
      id: categoryToSlug(label),
      label,
      templates: items,
    }));
}

function inferCategoryFromTemplateType(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("approval")) return "Approval Reports";
  if (lower.includes("budget") || lower.includes("capex")) return "Budget Reports";
  if (lower.includes("invoice") || lower.includes("vendor") || lower.includes("ap")) return "AP Reports";
  return "Custom Reports";
}

function categoryToSlug(category: string): "ap" | "approval" | "budget" | "custom" {
  const lower = category.toLowerCase();
  if (lower.includes("approval")) return "approval";
  if (lower.includes("budget")) return "budget";
  if (lower.includes("custom")) return "custom";
  return "ap";
}

function mapSavedReportToRunConfig(item: SavedReportApiItem): ReportRunConfig | undefined {
  if (!item.ReportTemplateType && !item.BasicFilters) return undefined;

  const basic = item.BasicFilters;
  const delivery = item.DelieveryOptions;

  return {
    reportName: item.ReportName ?? "Report",
    templateId: String(item.ReportTemplateType ?? ""),
    templateCategory: inferCategoryFromTemplateType(String(item.ReportTemplateType ?? "")),
    outputFormat: "xlsx",
    outputFormatLabel: "Excel (.xlsx)",
    datePreset: inferDatePreset(basic),
    departments: basic?.Departments ?? [],
    vendor: basic?.Vendor?.[0] ?? "All Vendors",
    category: "All Categories",
    amountMin: basic?.MinAmount != null ? String(basic.MinAmount) : "",
    amountMax: basic?.MaxAmount != null ? String(basic.MaxAmount) : "",
    approvalStatus: basic?.RequestStatus?.[0] ?? "All Statuses",
    requestType: basic?.RequestType?.[0] ?? "All Types",
    scheduleEnabled: delivery?.IsScheduleReport ?? false,
    frequency: delivery?.ScheduleReport?.Frequency,
    recipients: (delivery?.EmailReceipents ?? delivery?.ScheduleReport?.EmailReceipents ?? []).join(", "),
    timezone: delivery?.ScheduleReport?.TimeZoneId,
    deliveryTime: delivery?.ScheduleReport?.Time,
  };
}

function inferDatePreset(basic?: BasicFiltersApi): string {
  if (!basic?.StartDate && !basic?.EndDate) return "ytd";
  return dateRangePresets.find((preset) => preset.id === "custom")?.id ?? "ytd";
}

export function mapGenerateReportPreview(data: GenerateReportApiData): {
  columns: PreviewColumn[];
  rows: PreviewRow[];
  totalCount: number;
  generatedOn?: string;
  fileSize?: string;
} {
  const record = data as Record<string, unknown>;
  const rawColumns =
    (record.Columns as GenerateReportTableColumn[] | undefined) ??
    (record.columns as GenerateReportTableColumn[] | undefined) ??
    [];

  const columns: PreviewColumn[] = rawColumns.map((col, index) => {
    const key =
      col.key ?? col.Key ?? col.field ?? col.Field ?? col.label ?? col.Label ?? col.header ?? col.Header ?? `col_${index}`;
    const label = col.label ?? col.Label ?? col.header ?? col.Header ?? String(key);
    return { key: String(key), label: String(label) };
  });

  const rawRows =
    (record.Rows as Array<Record<string, unknown>> | undefined) ??
    (record.rows as Array<Record<string, unknown>> | undefined) ??
    (record.Items as Array<Record<string, unknown>> | undefined) ??
    (record.items as Array<Record<string, unknown>> | undefined) ??
    [];

  const rows: PreviewRow[] = rawRows.map((row) => {
    const mapped: PreviewRow = {};
    columns.forEach((col) => {
      const value = row[col.key] ?? row[col.label];
      mapped[col.key] = value == null ? "" : String(value);
    });
    return mapped;
  });

  return {
    columns,
    rows,
    totalCount: pickNumber(record, ["TotalCount", "totalCount", "RecordCount", "recordCount"]) || rows.length,
    generatedOn: pickString(record, ["GeneratedOn", "generatedOn"]),
    fileSize: pickString(record, ["FileSize", "fileSize"]),
  };
}

export { slugifyTemplateType };
