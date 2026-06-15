/** Routes where page comments / feedback UI should not appear. */
export const AUTH_ROUTE_PATHS = ['/login', '/signup', '/forgot-password'] as const;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTE_PATHS.some((p) => pathname === p || pathname.endsWith(p));
}
