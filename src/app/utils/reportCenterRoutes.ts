import type { LibraryCollection, ReportCenterSection } from "../components/reports/ReportCenterNav";
import type { ReportTemplateCategory } from "../data/reportTemplates";

const VALID_SECTIONS: ReportCenterSection[] = ["library", "schedules", "templates", "insights"];
const VALID_COLLECTIONS: LibraryCollection[] = [
  "all",
  "saved",
  "starred",
  "failed",
  "running",
  "scheduled",
  "recent",
];
const VALID_TEMPLATE_CATEGORIES: ReportTemplateCategory[] = ["all", "ap", "approval", "budget"];

export type ReportCenterRouteState = {
  section: ReportCenterSection;
  reportId: string | null;
  collection: LibraryCollection;
};

export function parseReportCenterPath(pathname: string, search: string): ReportCenterRouteState {
  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const reportsIdx = segments.indexOf("reports");
  const sectionSegment = reportsIdx >= 0 ? segments[reportsIdx + 1] : undefined;

  let section: ReportCenterSection = "library";
  let reportId: string | null = null;

  if (sectionSegment && VALID_SECTIONS.includes(sectionSegment as ReportCenterSection)) {
    section = sectionSegment as ReportCenterSection;
    if (section === "library") {
      reportId = segments[reportsIdx + 2] ?? null;
    }
  }

  const params = new URLSearchParams(search);
  const collectionParam = params.get("collection");
  const collection =
    collectionParam && VALID_COLLECTIONS.includes(collectionParam as LibraryCollection)
      ? (collectionParam as LibraryCollection)
      : "all";

  return { section, reportId, collection };
}

export function buildReportCenterPath(
  section: ReportCenterSection,
  options?: {
    reportId?: string | null;
    collection?: LibraryCollection;
    templateCategory?: ReportTemplateCategory;
  },
): string {
  if (section === "library") {
    const base = options?.reportId ? `/reports/library/${options.reportId}` : "/reports/library";
    if (options?.collection && options.collection !== "all") {
      return `${base}?collection=${encodeURIComponent(options.collection)}`;
    }
    return base;
  }
  if (section === "templates") {
    const category = options?.templateCategory;
    if (category && category !== "all" && VALID_TEMPLATE_CATEGORIES.includes(category)) {
      return `/reports/templates?category=${encodeURIComponent(category)}`;
    }
    return "/reports/templates";
  }
  return `/reports/${section}`;
}

export function parseTemplateCategoryFromSearch(search: string): ReportTemplateCategory {
  const category = new URLSearchParams(search).get("category");
  if (category && VALID_TEMPLATE_CATEGORIES.includes(category as ReportTemplateCategory)) {
    return category as ReportTemplateCategory;
  }
  return "all";
}
