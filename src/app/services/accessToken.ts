/**
 * Shared access-token resolution for all backend API calls.
 *
 * Sources (in priority order):
 * 1. VITE_API_TOKEN — build-time dev/prod override from .env (see .env.example)
 * 2. localStorage/sessionStorage "Token" — Element P2P Authenticate flow
 *    (swagger TokenModel.Token, set after Login + SelectTenant in the host app)
 *
 * The demo UI login (AuthContext / element_p2p_demo_session) gates routes only;
 * it does not set an API token. When embedded in Element P2P, the host app
 * provides localStorage.Token. When developing locally, set VITE_API_TOKEN.
 */
const TOKEN_STORAGE_KEY = "Token";

function normalizeBearerToken(raw: string | null | undefined): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^Bearer\s+/i, "");
}

function readStoredToken(): string | undefined {
  if (typeof window === "undefined") return undefined;

  for (const store of [localStorage, sessionStorage]) {
    try {
      const token = normalizeBearerToken(store.getItem(TOKEN_STORAGE_KEY));
      if (token) return token;
    } catch {
      // Storage may be blocked in embedded or private contexts.
    }
  }

  return undefined;
}

/** Returns the JWT used for Authorization: Bearer on /api/* requests, if available. */
export function resolveAccessToken(): string | undefined {
  const envToken = normalizeBearerToken(import.meta.env.VITE_API_TOKEN);
  if (envToken) return envToken;
  return readStoredToken();
}

export function isApiAuthenticated(): boolean {
  return Boolean(resolveAccessToken());
}

/** Apply Authorization header when a token is available. */
export function applyAuthorizationHeader(headers: Headers): void {
  const token = resolveAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
}
