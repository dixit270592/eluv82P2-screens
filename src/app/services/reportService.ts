import {
  apiDownloadBlob,
  apiReportPaginatedRequest,
  apiReportRequest,
} from "./apiClient";
import type {
  DownloadReportRequest,
  GenerateReportApiData,
  GenerateReportRequest,
  GetSavedReportParams,
  GetScheduleReportParams,
  OverviewDataApi,
  PaginatedResult,
  ReportTemplateApiItem,
  ReportTemplateListApiData,
  SavedReportApiItem,
  SaveReportRequest,
  ScheduleMessagePayload,
  ScheduledReportApiItem,
  SendSavedReportEmailRequest,
} from "../types/reportApi";

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function getOverviewData(): Promise<OverviewDataApi> {
  return apiReportRequest<OverviewDataApi>("GetOverviewData");
}

export async function getSavedReports(
  params: GetSavedReportParams,
): Promise<PaginatedResult<SavedReportApiItem>> {
  const query = toQuery({
    month: params.month,
    year: params.year,
    sortBy: params.sortBy ?? "CreatedAt",
    sortParam: params.sortParam ?? "desc",
    pageIndex: params.pageIndex ?? 1,
    pageSize: params.pageSize ?? 10,
  });
  return apiReportPaginatedRequest<SavedReportApiItem>(`GetSavedReport${query}`);
}

export async function getSavedReportsForYear(
  year: number,
  pageSize = 100,
): Promise<PaginatedResult<SavedReportApiItem>> {
  const monthResults = await Promise.allSettled(
    Array.from({ length: 12 }, (_, index) =>
      getSavedReports({
        month: index + 1,
        year,
        sortBy: "CreatedAt",
        sortParam: "desc",
        pageIndex: 1,
        pageSize,
      }),
    ),
  );

  const fulfilled = monthResults.filter(
    (result): result is PromiseFulfilledResult<PaginatedResult<SavedReportApiItem>> =>
      result.status === "fulfilled",
  );

  if (fulfilled.length === 0) {
    const firstRejected = monthResults.find((result) => result.status === "rejected");
    if (firstRejected?.status === "rejected") {
      throw firstRejected.reason;
    }
    return { items: [], totalCount: 0, pageIndex: 1, pageSize: 0 };
  }

  const merged = new Map<string, SavedReportApiItem>();
  fulfilled.forEach((result) => {
    result.value.items.forEach((item) => {
      const id = String(item.Id ?? item.ReportName ?? crypto.randomUUID());
      merged.set(id, item);
    });
  });

  const items = [...merged.values()].sort((a, b) => {
    const da = Date.parse(String(a.CreatedAt ?? a.Created ?? ""));
    const db = Date.parse(String(b.CreatedAt ?? b.Created ?? ""));
    return (Number.isNaN(db) ? 0 : db) - (Number.isNaN(da) ? 0 : da);
  });

  return {
    items,
    totalCount: items.length,
    pageIndex: 1,
    pageSize: items.length,
  };
}

export async function getScheduleReports(
  params: GetScheduleReportParams,
): Promise<PaginatedResult<ScheduledReportApiItem>> {
  const query = toQuery({
    timeZoneId: params.timeZoneId,
    month: params.month,
    year: params.year,
    sortBy: params.sortBy ?? "CreatedAt",
    sortParam: params.sortParam ?? "desc",
    pageIndex: params.pageIndex ?? 1,
    pageSize: params.pageSize ?? 10,
  });
  return apiReportPaginatedRequest<ScheduledReportApiItem>(`GetScheduleReport${query}`);
}

export async function getReportTemplates(): Promise<ReportTemplateListApiData> {
  return apiReportRequest<ReportTemplateListApiData>("GetReportTemplates");
}

export async function generateReport(body: GenerateReportRequest): Promise<GenerateReportApiData> {
  return apiReportRequest<GenerateReportApiData>("GenerateReport", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function generateReportPage(
  body: GenerateReportRequest,
  pageIndex: number,
  pageSize: number,
): Promise<GenerateReportApiData> {
  // pageIndex/pageSize are used by the production UI; not listed in staging swagger but kept for parity.
  return apiReportRequest<GenerateReportApiData>(
    `GenerateReport${toQuery({ pageIndex, pageSize })}`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function saveReport(body: SaveReportRequest): Promise<unknown> {
  return apiReportRequest<unknown>("SavedReport", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function downloadReportFile(payload: DownloadReportRequest): Promise<Blob> {
  return apiDownloadBlob("DownloadReport", payload);
}

export async function deleteSavedReport(id: number | string): Promise<void> {
  await apiReportRequest<unknown>(`DeleteReport/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
  });
}

export async function pauseOrResumeSchedule(sequenceNumber: number, pause: boolean): Promise<void> {
  await apiReportRequest<unknown>(
    `SchedulePauseAndResume${toQuery({ sequenceNumber, pause })}`,
    { method: "POST" },
  );
}

export async function editSchedule(payload: ScheduleMessagePayload): Promise<void> {
  await apiReportRequest<unknown>("EditSchedule", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function sendSavedReportEmail(body: SendSavedReportEmailRequest): Promise<void> {
  await apiReportRequest<unknown>("SendSavedReportEmail", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function flattenTemplateList(data: ReportTemplateListApiData): ReportTemplateApiItem[] {
  if (Array.isArray(data)) return data;

  const direct = data.templates ?? data.Templates;
  if (Array.isArray(direct)) return direct;

  const categories = data.categories ?? data.Categories ?? [];
  return categories.flatMap((category) => {
    const templates = category.Templates ?? [];
    return templates.map((template) => ({
      ...template,
      Category: template.Category ?? category.Category ?? category.CategoryName,
      CategoryName: template.CategoryName ?? category.CategoryName ?? category.Category,
    }));
  });
}
