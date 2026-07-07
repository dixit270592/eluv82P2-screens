import type { ReportApiEnvelope } from "../types/reportApi";

import {
  applyAuthorizationHeader,
  isApiAuthenticated,
  resolveAccessToken,
} from "./accessToken";

import {

  isReportAuthMessage,

} from "../utils/reportApiErrors";

import {

  createReportApiLogId,

  logReportApiCall,

  logReportApiHeaders,

  parseResponseBody,

} from "../utils/reportApiLogger";



export type ApiErrorDetails = {

  url?: string;

  method?: string;

  responseBody?: unknown;

};



export class ApiError extends Error {

  readonly status?: number;

  readonly transactionStatus?: number;

  readonly url?: string;

  readonly method?: string;

  readonly responseBody?: unknown;



  constructor(

    message: string,

    status?: number,

    transactionStatus?: number,

    details?: ApiErrorDetails,

  ) {

    super(message);

    this.name = "ApiError";

    this.status = status;

    this.transactionStatus = transactionStatus;

    this.url = details?.url;

    this.method = details?.method;

    this.responseBody = details?.responseBody;

  }

}



const API_ROOT = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

/** Max time to wait for any single API response before aborting (ms). */
const FETCH_TIMEOUT_MS = 30_000;

/** @deprecated Prefer {@link isApiAuthenticated} from accessToken.ts */
export const isReportApiConfigured = isApiAuthenticated;

/** @deprecated Prefer {@link resolveAccessToken} from accessToken.ts */
export const resolveApiAccessToken = resolveAccessToken;

function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/api/Report/${path}`;
  return API_ROOT ? `${API_ROOT}${normalized}` : normalized;
}

function prepareRequestHeaders(init: RequestInit): Headers {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  applyAuthorizationHeader(headers);
  return headers;
}



function parseRequestBody(init: RequestInit): unknown {

  if (!init.body || init.body instanceof FormData) return undefined;

  if (typeof init.body !== "string") return init.body;

  return parseResponseBody(init.body);

}



function extractErrorMessage(body: unknown, fallback: string): string {

  if (!body || typeof body !== "object") return fallback;

  const record = body as Record<string, unknown>;

  if (typeof record.ResultMsg === "string" && record.ResultMsg.trim()) return record.ResultMsg;

  if (typeof record.message === "string" && record.message.trim()) return record.message;

  if (typeof record.title === "string" && record.title.trim()) return record.title;

  return fallback;

}



function extractTransactionStatus(body: unknown): number | undefined {

  if (!body || typeof body !== "object") return undefined;

  const status = (body as Record<string, unknown>).TransactionStatus;

  return typeof status === "number" ? status : undefined;

}



function throwHttpError(

  response: Response,

  message: string,

  responseBody: unknown,

  url: string,

  method: string,

): never {

  if (response.status === 401 || response.status === 403) {

    // Do NOT call redirectToLogin() here: the demo GuestRoute would intercept the
    // /login navigation and bounce an already-authenticated user to Dashboard ("/").
    // Auth errors surface as ApiError so the report module can show inline error UI.
    throw new ApiError("Your session has expired. Please sign in again.", response.status, undefined, {

      url,

      method,

      responseBody,

    });

  }

  throw new ApiError(message, response.status, extractTransactionStatus(responseBody), {

    url,

    method,

    responseBody,

  });

}



async function fetchWithAuth(path: string, init: RequestInit = {}): Promise<Response> {
  if (import.meta.env.DEV && !resolveAccessToken()) {
    console.warn(
      "[Report API] No Authorization header — set VITE_API_TOKEN in .env or sign in via Element P2P Authenticate (localStorage Token).",
    );
  }

  const headers = prepareRequestHeaders(init);

  logReportApiHeaders(headers);

  const url = buildUrl(path);
  const method = (init.method ?? "GET").toUpperCase();

  // Abort the request if the server does not respond within FETCH_TIMEOUT_MS.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {

    const response = await fetch(url, {

      ...init,

      headers,

      credentials: "include",

      signal: controller.signal,

    });

    clearTimeout(timeoutId);
    return response;

  } catch (error) {

    clearTimeout(timeoutId);

    // AbortError means the FETCH_TIMEOUT_MS deadline was reached.
    if (error instanceof DOMException && error.name === "AbortError") {
      logReportApiCall({
        id: createReportApiLogId(),
        timestamp: new Date().toISOString(),
        method,
        url,
        requestBody: parseRequestBody(init),
        error: `Request timed out after ${FETCH_TIMEOUT_MS}ms`,
      });
      throw new ApiError(
        "Request timed out. Check your connection and try again.",
        undefined,
        undefined,
        { url, method },
      );
    }

    logReportApiCall({

      id: createReportApiLogId(),

      timestamp: new Date().toISOString(),

      method,

      url,

      requestBody: parseRequestBody(init),

      error: error instanceof Error ? error.message : "Network error",

    });

    throw new ApiError("Network error. Check your connection and try again.", undefined, undefined, {

      url,

      method,

    });

  }

}



function throwEnvelopeAuthFailure(message: string, details?: ApiErrorDetails): never {

  // Do NOT call redirectToLogin() here: the demo GuestRoute would intercept the
  // /login navigation and bounce an already-authenticated user to Dashboard ("/").
  throw new ApiError(message || "Your session has expired. Please sign in again.", 401, undefined, details);

}



function assertEnvelopeSuccess<T>(envelope: ReportApiEnvelope<T>, details?: ApiErrorDetails): void {

  if (envelope.TransactionStatus === 0) return;

  const message = envelope.ResultMsg || "Report API request failed";

  if (isReportAuthMessage(message)) {

    throwEnvelopeAuthFailure(message, details);

  }

  throw new ApiError(message, undefined, envelope.TransactionStatus, details);

}



async function readLoggedResponse(

  path: string,

  init: RequestInit,

  response: Response,

  startedAt: number,

): Promise<string> {

  const text = await response.text();

  const url = buildUrl(path);

  const method = (init.method ?? "GET").toUpperCase();



  logReportApiCall({

    id: createReportApiLogId(),

    timestamp: new Date().toISOString(),

    method,

    url,

    requestBody: parseRequestBody(init),

    status: response.status,

    durationMs: Date.now() - startedAt,

    responseBody: parseResponseBody(text),

    error: response.ok ? undefined : `HTTP ${response.status}`,

  });



  return text;

}



export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {

  const startedAt = Date.now();

  const response = await fetchWithAuth(path, init);

  const text = await readLoggedResponse(path, init, response, startedAt);

  const url = buildUrl(path);

  const method = (init.method ?? "GET").toUpperCase();

  const parsedBody = parseResponseBody(text);



  if (!response.ok) {

    const message = extractErrorMessage(parsedBody, `Request failed (${response.status})`);

    throwHttpError(response, message, parsedBody, url, method);

  }



  if (!text) return {} as T;



  try {

    return JSON.parse(text) as T;

  } catch {

    throw new ApiError(`Invalid JSON response (${response.status})`, response.status, undefined, {

      url,

      method,

      responseBody: text,

    });

  }

}



export async function apiReportRequest<T>(path: string, init: RequestInit = {}): Promise<T> {

  const url = buildUrl(path);

  const method = (init.method ?? "GET").toUpperCase();

  const envelope = await apiRequest<ReportApiEnvelope<T>>(path, init);

  assertEnvelopeSuccess(envelope, { url, method, responseBody: envelope });

  // TransactionStatus === 0 (success) with null Data means the endpoint returned an empty result.
  // Treat this as an empty object rather than an error so callers like getOverviewData and
  // getReportTemplates degrade gracefully instead of surfacing a misleading error toast.
  if (envelope.Data === null || envelope.Data === undefined) {
    return {} as T;
  }

  return envelope.Data;

}



export async function apiReportPaginatedRequest<TItem>(

  path: string,

  init: RequestInit = {},

): Promise<{ items: TItem[]; totalCount: number; pageIndex: number; pageSize: number; totalPages?: number }> {

  const url = buildUrl(path);

  const method = (init.method ?? "GET").toUpperCase();

  const envelope = await apiRequest<ReportApiEnvelope<unknown>>(path, init);

  assertEnvelopeSuccess(envelope, { url, method, responseBody: envelope });



  const data = envelope.Data;

  let items: TItem[] = [];

  if (Array.isArray(data)) {
    items = data as TItem[];
  } else if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const rawItems = record.items ?? record.Items;
    if (Array.isArray(rawItems)) items = rawItems as TItem[];
  }

  // Some paginated endpoints return Items on the envelope root instead of inside Data.
  if (items.length === 0) {
    const root = envelope as Record<string, unknown>;
    const rootItems = root.items ?? root.Items;
    if (Array.isArray(rootItems)) items = rootItems as TItem[];
  }

  return {
    items,
    totalCount: envelope.TotalCount ?? items.length,

    pageIndex: envelope.PageIndex ?? 1,

    pageSize: envelope.PageSize ?? items.length,

    totalPages: envelope.TotalPages,

  };

}



export async function apiDownloadBlob(path: string, body?: unknown): Promise<Blob> {
  const init: RequestInit = {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  };
  const url = buildUrl(path);
  const method = "POST";
  const startedAt = Date.now();

  let response: Response;
  try {
    response = await fetchWithAuth(path, init);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logReportApiCall({
      id: createReportApiLogId(),
      timestamp: new Date().toISOString(),
      method,
      url,
      requestBody: body,
      error: error instanceof Error ? error.message : "Network error",
    });
    throw new ApiError("Network error. Check your connection and try again.", undefined, undefined, {
      url,
      method,
    });
  }



  const contentType = response.headers.get("content-type") ?? "";



  if (!response.ok) {

    const text = await response.text();

    const parsedBody = parseResponseBody(text);

    logReportApiCall({

      id: createReportApiLogId(),

      timestamp: new Date().toISOString(),

      method,

      url,

      requestBody: body,

      status: response.status,

      durationMs: Date.now() - startedAt,

      responseBody: parsedBody,

      error: `HTTP ${response.status}`,

    });

    const message = extractErrorMessage(parsedBody, `Download failed (${response.status})`);

    throwHttpError(response, message, parsedBody, url, method);

  }



  const blob = await response.blob();

  logReportApiCall({

    id: createReportApiLogId(),

    timestamp: new Date().toISOString(),

    method,

    url,

    requestBody: body,

    status: response.status,

    durationMs: Date.now() - startedAt,

    responseBody: {

      contentType,

      size: blob.size,

      type: blob.type,

    },

  });

  return blob;

}



/** Expose resolved URL builder for diagnostics. */

export function resolveReportApiUrl(path: string): string {

  return buildUrl(path);

}


