import type { ReportRunConfig } from "../components/reports/reportGenerationTypes";
import { resolveConfigureDateRange } from "./reportConfigureDateRange";
import type {
  AdvancedFiltersApi,
  BasicFiltersApi,
  DelieveryOptionsApi,
  GenerateReportRequest,
  SaveReportRequest,
} from "../types/reportApi";
import {
  DEFAULT_REJECT_REASONS,
  DEFAULT_TIMEZONE,
  emptyAdvancedFilters,
  emptyBasicFilters,
  emptyDelieveryOptions,
} from "../types/reportApi";

function resolveDateRange(config: ReportRunConfig): { start: string; end: string } {
  return resolveConfigureDateRange(config.datePreset, config.customStartDate, config.customEndDate);
}

function parseRecipients(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function mapFrequency(value?: string): string {
  if (!value) return "daily";
  return value.toLowerCase();
}

/** Strip display suffix e.g. "America/New_York (ET)" → "America/New_York" */
export function normalizeTimezoneId(value?: string): string {
  if (!value?.trim()) return DEFAULT_TIMEZONE;
  return value.replace(/\s*\([^)]*\)\s*$/, "").trim() || DEFAULT_TIMEZONE;
}

export function buildBasicFiltersFromConfig(config: ReportRunConfig): BasicFiltersApi {
  const range = resolveDateRange(config);
  const filters = emptyBasicFilters();
  filters.StartDate = range.start;
  filters.EndDate = range.end;
  filters.Departments = [...config.departments];
  if (config.vendor && config.vendor !== "All Vendors") {
    filters.Vendor = [config.vendor];
  }
  filters.MinAmount = config.amountMin ? Number(config.amountMin) : null;
  filters.MaxAmount = config.amountMax ? Number(config.amountMax) : null;
  if (config.requestType && config.requestType !== "All Types") {
    filters.RequestType = [config.requestType];
  }
  if (config.approvalStatus && config.approvalStatus !== "All Statuses") {
    filters.RequestStatus = [config.approvalStatus];
  }
  if (config.category && config.category !== "All Categories") {
    filters.GLAccounts = [config.category];
  }
  return filters;
}

export function buildAdvancedFiltersFromConfig(config: ReportRunConfig): AdvancedFiltersApi {
  const filters = emptyAdvancedFilters();
  filters.IncludeRejectedItems = config.includeRejectedItems ?? false;
  filters.ProcessingTime = {
    minTime: config.processingTimeMin ?? "",
    maxTime: config.processingTimeMax ?? "",
  };
  filters.RejectReasons = { ...DEFAULT_REJECT_REASONS };
  return filters;
}

export function buildDelieveryOptionsFromConfig(config: ReportRunConfig): DelieveryOptionsApi {
  const options = emptyDelieveryOptions();
  const recipients = parseRecipients(config.recipients);
  options.IsScheduleReport = config.scheduleEnabled;
  options.IsEmail = (config.emailOnGenerate ?? false) || (recipients.length > 0 && !config.scheduleEnabled);
  options.EmailReceipents = recipients;
  options.ScheduleReport = {
    Frequency: mapFrequency(config.frequency),
    EmailReceipents: recipients,
    DayOfWeek: "monday",
    DayOfMonth: 1,
    Time: config.deliveryTime ?? "",
    IsRescheduleMessage: false,
    TimeZoneId: normalizeTimezoneId(config.timezone),
  };
  return options;
}

export function buildGenerateReportRequest(config: ReportRunConfig): GenerateReportRequest {
  return {
    ReportName: config.reportName,
    ReportTemplateType: config.templateId,
    UserTimeZoneId: normalizeTimezoneId(config.timezone),
    BasicFilters: buildBasicFiltersFromConfig(config),
    AdvancedFilters: buildAdvancedFiltersFromConfig(config),
  };
}

export function buildSaveReportRequest(config: ReportRunConfig): SaveReportRequest {
  return {
    ...buildGenerateReportRequest(config),
    DelieveryOptions: buildDelieveryOptionsFromConfig(config),
  };
}

export function buildGenerateReportRequestFromSaved(item: {
  reportName: string;
  apiPayload?: {
    reportTemplateType: string;
    basicFilters?: BasicFiltersApi;
    advancedFilters?: AdvancedFiltersApi;
  };
  type?: string;
}): GenerateReportRequest | null {
  const templateType = item.apiPayload?.reportTemplateType || item.type;
  if (!templateType) return null;

  return {
    ReportName: item.reportName,
    ReportTemplateType: templateType,
    UserTimeZoneId: DEFAULT_TIMEZONE,
    BasicFilters: item.apiPayload?.basicFilters ?? emptyBasicFilters(),
    AdvancedFilters: item.apiPayload?.advancedFilters ?? emptyAdvancedFilters(),
  };
}
