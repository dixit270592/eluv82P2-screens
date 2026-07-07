type ReportApiLogEntry = {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  requestBody?: unknown;
  status?: number;
  durationMs?: number;
  responseBody?: unknown;
  error?: string;
};

const LOG_PREFIX = "[Report API]";

function isDebugEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_REPORT_API_DEBUG === "true";
}

function redactHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "authorization") {
      result[key] = value ? `Bearer ***${value.slice(-8)}` : "";
      return;
    }
    result[key] = value;
  });
  return result;
}

function safeParseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function printEntry(entry: ReportApiLogEntry): void {
  const style = entry.error || (entry.status != null && entry.status >= 400) ? "color:#B42318" : "color:#027A48";
  console.groupCollapsed(
    `%c${LOG_PREFIX} ${entry.method} ${entry.url} → ${entry.status ?? "ERR"} (${entry.durationMs ?? 0}ms)`,
    style,
  );
  console.log("id:", entry.id);
  console.log("timestamp:", entry.timestamp);
  if (entry.requestBody !== undefined) console.log("request:", entry.requestBody);
  if (entry.responseBody !== undefined) console.log("response:", entry.responseBody);
  if (entry.error) console.log("error:", entry.error);
  console.groupEnd();
}

const recentLogs: ReportApiLogEntry[] = [];
const MAX_RECENT = 50;

export function logReportApiCall(entry: ReportApiLogEntry): void {
  recentLogs.unshift(entry);
  if (recentLogs.length > MAX_RECENT) recentLogs.pop();
  if (!isDebugEnabled()) return;
  printEntry(entry);
}

export function getRecentReportApiLogs(): readonly ReportApiLogEntry[] {
  return recentLogs;
}

export function createReportApiLogId(): string {
  return `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function parseResponseBody(text: string): unknown {
  return safeParseJson(text);
}

export function logReportApiHeaders(headers: Headers): void {
  if (!isDebugEnabled()) return;
  console.debug(`${LOG_PREFIX} request headers`, redactHeaders(headers));
}
