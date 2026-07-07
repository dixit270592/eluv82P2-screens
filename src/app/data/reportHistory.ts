import type { ReportRunConfig } from "../components/reports/reportGenerationTypes";

export type ReportHistoryStatus = "completed" | "running" | "scheduled" | "failed";

export type ReportHistoryItem = {
  id: string;
  reportName: string;
  type: string;
  owner: string;
  created: string;
  lastRun: string;
  status: ReportHistoryStatus;
  saved: boolean;
  starred: boolean;
  runConfig?: ReportRunConfig;
  records?: number;
  fileSize?: string;
  /** Stored API filter payload for re-run / preview. */
  apiPayload?: {
    reportTemplateType: string;
    basicFilters?: import("../types/reportApi").BasicFiltersApi;
    advancedFilters?: import("../types/reportApi").AdvancedFiltersApi;
    delieveryOptions?: import("../types/reportApi").DelieveryOptionsApi;
  };
};
