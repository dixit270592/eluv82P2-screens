export type ReportRunConfig = {
  reportName: string;
  templateId: string;
  templateCategory?: string;
  outputFormat: string;
  outputFormatLabel: string;
  datePreset: string;
  customStartDate?: string;
  customEndDate?: string;
  departments: string[];
  vendor: string;
  category: string;
  amountMin: string;
  amountMax: string;
  approvalStatus: string;
  requestType: string;
  includeRejectedItems?: boolean;
  processingTimeMin?: string;
  processingTimeMax?: string;
  emailOnGenerate?: boolean;
  scheduleEnabled: boolean;
  frequency?: string;
  recipients?: string;
  timezone?: string;
  deliveryTime?: string;
  emailSubject?: string;
};

export type GeneratedReportResult = {
  reportName: string;
  generatedTime: string;
  records: number;
  fileSize: string;
  exportFormat: string;
  config: ReportRunConfig;
};

export function buildGeneratedReportResult(config: ReportRunConfig): GeneratedReportResult {
  const formatSizes: Record<string, string> = {
    pdf: "2.4 MB",
    csv: "840 KB",
    xlsx: "1.1 MB",
  };

  let records = 120;
  if (config.departments.length > 0) records = Math.max(12, records - config.departments.length * 8);
  if (config.vendor !== "All Vendors") records = Math.round(records * 0.45);
  if (config.amountMin) records = Math.round(records * 0.7);
  if (config.approvalStatus !== "All Statuses") records = Math.round(records * 0.55);

  return {
    reportName: config.reportName,
    generatedTime: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    records: Math.max(1, records),
    fileSize: formatSizes[config.outputFormat] ?? "1.2 MB",
    exportFormat: config.outputFormatLabel,
    config,
  };
}
