/** Standard Element P2P API envelope (ASP.NET backend). TransactionStatus 0 = success. */
export type ReportApiEnvelope<T> = {
  Data: T | null;
  TransactionStatus: number;
  ResultMsg?: string;
  PageIndex?: number;
  PageSize?: number;
  TotalCount?: number;
  TotalPages?: number;
};

export type BasicFiltersApi = {
  StartDate: string;
  EndDate: string;
  Vendor: string[];
  DeliveryLocation: string[];
  Departments: string[];
  MinAmount: number | null;
  MaxAmount: number | null;
  RequestType: string[];
  RequestStatus: string[];
  GLAccounts: string[];
  User: string;
  InvoiceNumber: string[];
};

export type AdvancedFiltersApi = {
  IncludeRejectedItems: boolean;
  RejectReasons: Record<string, boolean>;
  QuantityVariance: { minVariance: number | null; maxVariance: number | null };
  ProcessingTime: { minTime: string; maxTime: string };
  ProcessingDays: { minDays: number | null; maxDays: number | null };
  User: string;
  IncludeRejections: boolean;
  IncludeClosedPO: boolean;
};

export type ScheduleReportApi = {
  Frequency: string;
  EmailReceipents: string[];
  DayOfWeek: string;
  DayOfMonth: number;
  Time: string;
  IsRescheduleMessage: boolean;
  TimeZoneId: string;
};

/** Preserve backend typo: DelieveryOptions */
export type DelieveryOptionsApi = {
  IsEmail: boolean;
  EmailReceipents: string[];
  IsScheduleReport: boolean;
  ScheduleReport: ScheduleReportApi;
};

export type SavedReportApiItem = {
  Id?: number | string;
  ReportName?: string;
  ReportTemplateType?: string;
  CreatedAt?: string;
  Created?: string;
  LastRunAt?: string;
  LastRun?: string;
  Owner?: string;
  CreatedBy?: string;
  UserName?: string;
  BasicFilters?: BasicFiltersApi;
  AdvancedFilters?: AdvancedFiltersApi;
  DelieveryOptions?: DelieveryOptionsApi;
  RecordCount?: number;
  TotalRecords?: number;
  FileSize?: string;
  [key: string]: unknown;
};

export type SavedReportListApiData =
  | SavedReportApiItem[]
  | {
      items?: SavedReportApiItem[];
      Items?: SavedReportApiItem[];
      totalCount?: number;
      TotalCount?: number;
      pageIndex?: number;
      PageIndex?: number;
      pageSize?: number;
      PageSize?: number;
    };

export type ScheduledReportApiItem = {
  Id?: number | string;
  ReportName?: string;
  Frequency?: string;
  CreatedAt?: string;
  Created?: string;
  NextRun?: string;
  NextRunAt?: string;
  NextScheduleDateTime?: string;
  Recipients?: string | string[];
  EmailReceipents?: string | string[];
  Owner?: string;
  CreatedBy?: string;
  IsPaused?: boolean;
  Status?: string;
  TimeZoneId?: string;
  Time?: string;
  EmailSubject?: string;
  ReportId?: number | string;
  SequenceNumber?: number;
  sequenceNumber?: number;
  DelieveryOptions?: DelieveryOptionsApi;
  ScheduleReport?: ScheduleReportApi;
  [key: string]: unknown;
};

export type ScheduleMessagePayload = {
  Id?: string;
  MessageId?: string;
  ReportId?: string;
  SequenceNumber?: number;
  ReportName?: string;
  ReportTemplateType?: string;
  BasicFilters?: BasicFiltersApi;
  AdvancedFilters?: AdvancedFiltersApi;
  DelieveryOptions?: DelieveryOptionsApi;
  ScheduleReport?: ScheduleReportApi;
  IsPaused?: boolean;
  NextScheduleDateTime?: string;
};

export type SendSavedReportEmailRequest = {
  ReportName: string;
  Emails: string[];
  BasicFilters?: BasicFiltersApi;
  AdvancedFilters?: AdvancedFiltersApi;
  ReportTemplateType?: string;
  UserTimeZoneId?: string;
};

export type ReportTemplateApiItem = {
  Id?: number | string;
  ReportTemplateType?: string;
  Name?: string;
  TemplateName?: string;
  Description?: string;
  Category?: string;
  CategoryName?: string;
  Parameters?: string[];
  ParameterTags?: string[];
  IsCustom?: boolean;
  IsCloned?: boolean;
  [key: string]: unknown;
};

export type ReportTemplateListApiData =
  | ReportTemplateApiItem[]
  | {
      categories?: Array<{ Category?: string; CategoryName?: string; Templates?: ReportTemplateApiItem[] }>;
      Categories?: Array<{ Category?: string; CategoryName?: string; Templates?: ReportTemplateApiItem[] }>;
      templates?: ReportTemplateApiItem[];
      Templates?: ReportTemplateApiItem[];
    };

export type OverviewDataApi = {
  PurchaseRequestCount?: number;
  PurchaseRequests?: number;
  PurchaseOrderCount?: number;
  PurchaseOrders?: number;
  InvoiceCount?: number;
  Invoices?: number;
  ExpenseCount?: number;
  Expenses?: number;
  CapExPRCount?: number;
  CapExPRs?: number;
  DepartmentBreakdown?: Array<Record<string, unknown>>;
  departmentBreakdown?: Array<Record<string, unknown>>;
  StatusDistribution?: Array<Record<string, unknown>> | Record<string, unknown>;
  statusDistribution?: Array<Record<string, unknown>> | Record<string, unknown>;
  [key: string]: unknown;
};

export type GenerateReportRequest = {
  ReportName: string;
  ReportTemplateType: string;
  UserTimeZoneId: string;
  BasicFilters: BasicFiltersApi;
  AdvancedFilters: AdvancedFiltersApi;
};

export type SaveReportRequest = GenerateReportRequest & {
  DelieveryOptions: DelieveryOptionsApi;
};

export type GenerateReportTableColumn = {
  key?: string;
  Key?: string;
  field?: string;
  Field?: string;
  label?: string;
  Label?: string;
  header?: string;
  Header?: string;
};

export type GenerateReportApiData = {
  Columns?: GenerateReportTableColumn[];
  columns?: GenerateReportTableColumn[];
  Rows?: Array<Record<string, unknown>>;
  rows?: Array<Record<string, unknown>>;
  Items?: Array<Record<string, unknown>>;
  items?: Array<Record<string, unknown>>;
  TotalCount?: number;
  totalCount?: number;
  PageIndex?: number;
  pageIndex?: number;
  PageSize?: number;
  pageSize?: number;
  GeneratedOn?: string;
  generatedOn?: string;
  RecordCount?: number;
  recordCount?: number;
  FileSize?: string;
  fileSize?: string;
  ReportId?: number | string;
  Id?: number | string;
  [key: string]: unknown;
};

export type GetSavedReportParams = {
  month: number;
  year: number;
  sortBy?: string;
  sortParam?: "asc" | "desc";
  pageIndex?: number;
  pageSize?: number;
};

export type GetScheduleReportParams = {
  timeZoneId: string;
  month: number;
  year: number;
  sortBy?: string;
  sortParam?: "asc" | "desc";
  pageIndex?: number;
  pageSize?: number;
};

export type DownloadReportRequest = {
  ReportName: string;
  HtmlBase64?: string;
};

export type PaginatedResult<T> = {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages?: number;
};

export const DEFAULT_TIMEZONE = "Asia/Calcutta";

export const DEFAULT_REJECT_REASONS: AdvancedFiltersApi["RejectReasons"] = {
  "Item arrived damaged.": false,
  "Item shipped is different than item ordered.": false,
  "Item not needed": false,
  "Item arrived after required by date indicated on PO": false,
  Other: false,
};

export function emptyBasicFilters(): BasicFiltersApi {
  return {
    StartDate: "",
    EndDate: "",
    Vendor: [],
    DeliveryLocation: [],
    Departments: [],
    MinAmount: null,
    MaxAmount: null,
    RequestType: [],
    RequestStatus: [],
    GLAccounts: [],
    User: "",
    InvoiceNumber: [],
  };
}

export function emptyAdvancedFilters(): AdvancedFiltersApi {
  return {
    IncludeRejectedItems: false,
    RejectReasons: { ...DEFAULT_REJECT_REASONS },
    QuantityVariance: { minVariance: null, maxVariance: null },
    ProcessingTime: { minTime: "", maxTime: "" },
    ProcessingDays: { minDays: null, maxDays: null },
    User: "",
    IncludeRejections: false,
    IncludeClosedPO: false,
  };
}

export function emptyDelieveryOptions(): DelieveryOptionsApi {
  return {
    IsEmail: false,
    EmailReceipents: [],
    IsScheduleReport: false,
    ScheduleReport: {
      Frequency: "daily",
      EmailReceipents: [],
      DayOfWeek: "monday",
      DayOfMonth: 1,
      Time: "",
      IsRescheduleMessage: false,
      TimeZoneId: DEFAULT_TIMEZONE,
    },
  };
}
