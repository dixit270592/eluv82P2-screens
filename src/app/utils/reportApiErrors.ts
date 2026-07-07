import { ApiError } from "../services/apiClient";

export type ReportApiErrorKind = "auth" | "network" | "server" | "client" | "unknown";

export type ResolvedReportApiError = {
  kind: ReportApiErrorKind;
  message: string;
  isAuthError: boolean;
  isRetryable: boolean;
  status?: number;
};

const AUTH_MESSAGE_PATTERN =
  /unauthorized|unauthorised|not authenticated|authentication|access denied|forbidden|login required|invalid token|session expired/i;

const NULL_REFERENCE_PATTERN =
  /object reference not set to an instance of an object|nullreferenceexception/i;

const AUTH_STATUS = new Set([401, 403]);

export function isReportAuthHttpStatus(status?: number): boolean {
  return status != null && AUTH_STATUS.has(status);
}

export function isReportAuthMessage(message?: string): boolean {
  if (!message) return false;
  return AUTH_MESSAGE_PATTERN.test(message);
}

/** Redirect to login using the same pattern as RequireAuth. */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/login") || path.startsWith("/signup")) return;
  const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
  window.location.assign(`/login?redirect=${redirect}`);
}

function sanitizeBackendMessage(message: string): string {
  if (NULL_REFERENCE_PATTERN.test(message)) {
    return "Report data is unavailable. Sign in to the procurement API and ensure a tenant is selected.";
  }
  return message;
}

function extractEnvelopeMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const record = body as Record<string, unknown>;
  if (typeof record.ResultMsg === "string" && record.ResultMsg.trim()) return record.ResultMsg;
  if (typeof record.message === "string" && record.message.trim()) return record.message;
  return fallback;
}

function formatEndpointHint(error: ApiError): string {
  if (!error.url) return "";
  try {
    const path = new URL(error.url, "http://localhost").pathname;
    return path.replace(/^\/api\/Report\//, "");
  } catch {
    return error.url;
  }
}

function formatServerDiagnostic(error: ApiError): string | undefined {
  const endpoint = formatEndpointHint(error);
  const raw =
    error.responseBody && typeof error.responseBody === "object"
      ? extractEnvelopeMessage(error.responseBody, error.message)
      : error.message;
  if (!endpoint) return undefined;
  return `Endpoint: ${endpoint} · ${raw}`;
}

export function resolveReportApiError(error: unknown): ResolvedReportApiError {
  if (error instanceof ApiError) {
    const sanitizedMessage = sanitizeBackendMessage(error.message);
    const diagnostic = formatServerDiagnostic(error);
    const isAuthError =
      isReportAuthHttpStatus(error.status) ||
      isReportAuthMessage(error.message) ||
      NULL_REFERENCE_PATTERN.test(error.message);

    if (error.status != null && error.status >= 500) {
      const isMissingSession =
        NULL_REFERENCE_PATTERN.test(error.message) ||
        (error.responseBody &&
          typeof error.responseBody === "object" &&
          NULL_REFERENCE_PATTERN.test(
            extractEnvelopeMessage(error.responseBody, error.message),
          ));
      if (diagnostic && (import.meta.env.DEV || import.meta.env.VITE_REPORT_API_DEBUG === "true")) {
        console.error("[Report API] HTTP 500", diagnostic, error.responseBody);
      }
      return {
        kind: isMissingSession ? "auth" : "server",
        message: isMissingSession
          ? sanitizedMessage
          : "The server is temporarily unavailable. Please try again.",
        isAuthError: isMissingSession,
        isRetryable: !isMissingSession,
        status: error.status,
      };
    }

    // 429 Too Many Requests — retryable, specific guidance for the user.
    if (error.status === 429) {
      return {
        kind: "client",
        message: "Too many requests. Please wait a moment before trying again.",
        isAuthError: false,
        isRetryable: true,
        status: 429,
      };
    }

    // 422 Unprocessable Entity — validation error from the backend; surface the server message.
    if (error.status === 422) {
      return {
        kind: "client",
        message: sanitizedMessage || "The request contained invalid data. Please review your inputs and try again.",
        isAuthError: false,
        isRetryable: false,
        status: 422,
      };
    }

    if (error.status != null && error.status >= 400 && error.status < 500 && !isAuthError) {
      return {
        kind: "client",
        message: sanitizedMessage || "The request could not be completed.",
        isAuthError: false,
        isRetryable: false,
        status: error.status,
      };
    }

    if (isAuthError) {
      return {
        kind: "auth",
        message: NULL_REFERENCE_PATTERN.test(error.message)
          ? sanitizedMessage
          : "Your session has expired. Please sign in again.",
        isAuthError: true,
        isRetryable: false,
        status: error.status,
      };
    }

    if (error.transactionStatus != null && error.transactionStatus !== 0) {
      const isMissingSession =
        NULL_REFERENCE_PATTERN.test(error.message) || isReportAuthMessage(error.message);
      if (diagnostic && (import.meta.env.DEV || import.meta.env.VITE_REPORT_API_DEBUG === "true")) {
        console.error("[Report API] envelope failure", diagnostic, error.responseBody);
      }
      return {
        kind: isMissingSession ? "auth" : "server",
        message: sanitizedMessage || "Report API request failed.",
        isAuthError: isMissingSession,
        isRetryable: !isMissingSession,
        status: error.status,
      };
    }

    return {
      kind: "unknown",
      message: sanitizedMessage || "Something went wrong. Please try again.",
      isAuthError: false,
      isRetryable: true,
      status: error.status,
    };
  }

  if (error instanceof TypeError) {
    return {
      kind: "network",
      message: "Network error. Check your connection and try again.",
      isAuthError: false,
      isRetryable: true,
    };
  }

  // AbortError from the fetch timeout (DOMException wraps AbortError in some environments).
  if (
    error instanceof DOMException && error.name === "AbortError" ||
    (error instanceof ApiError && error.message.startsWith("Request timed out"))
  ) {
    return {
      kind: "network",
      message: "Request timed out. Check your connection and try again.",
      isAuthError: false,
      isRetryable: true,
    };
  }

  return {
    kind: "unknown",
    message: "Something went wrong. Please try again.",
    isAuthError: false,
    isRetryable: true,
  };
}

export function shouldToastReportApiFailure(error: unknown): boolean {
  return !resolveReportApiError(error).isAuthError;
}
