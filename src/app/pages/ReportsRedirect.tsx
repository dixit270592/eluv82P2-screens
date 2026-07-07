import { Navigate, useSearchParams } from "react-router";

const LEGACY_TAB_ROUTES: Record<string, string> = {
  "0": "/reports/insights",
  "1": "/reports/library",
  "2": "/reports/schedules",
  "3": "/reports/templates",
};

const LEGACY_SECTION_ROUTES: Record<string, string> = {
  insights: "/reports/insights",
  library: "/reports/library",
  schedules: "/reports/schedules",
  templates: "/reports/templates",
};

/**
 * Default landing: /reports → /reports/library (Library is the new home, not Overview/Insights).
 * Legacy query-param routes from the horizontal tab layout redirect gracefully:
 *   ?tab=0 → insights, ?tab=1 → library, ?tab=2 → schedules, ?tab=3 → templates
 *   ?section=insights|library|schedules|templates → same paths
 */
export function ReportsRedirect() {
  const [searchParams] = useSearchParams();

  const tab = searchParams.get("tab");
  if (tab !== null && LEGACY_TAB_ROUTES[tab]) {
    return <Navigate to={LEGACY_TAB_ROUTES[tab]} replace />;
  }

  const section = searchParams.get("section");
  if (section && LEGACY_SECTION_ROUTES[section]) {
    return <Navigate to={LEGACY_SECTION_ROUTES[section]} replace />;
  }

  return <Navigate to="/reports/library" replace />;
}
