import {
  BarChart2,
  BookOpen,
  CalendarClock,
  LayoutTemplate,
} from "lucide-react";
import { reportFont } from "./reportUiStyles";

export type ReportCenterSection = "library" | "schedules" | "templates" | "insights";

export type LibraryCollection = "all" | "saved" | "starred" | "failed" | "running" | "scheduled" | "recent";

const mainNav: { id: ReportCenterSection; label: string; icon: React.ReactNode }[] = [
  { id: "library", label: "Library", icon: <BookOpen size={16} aria-hidden /> },
  { id: "schedules", label: "Schedules", icon: <CalendarClock size={16} aria-hidden /> },
  { id: "templates", label: "Templates", icon: <LayoutTemplate size={16} aria-hidden /> },
  { id: "insights", label: "Insights", icon: <BarChart2 size={16} aria-hidden /> },
];

const collections: { id: LibraryCollection; label: string }[] = [
  { id: "all", label: "All Reports" },
  { id: "recent", label: "Recent" },
  { id: "saved", label: "Saved" },
  { id: "starred", label: "Starred" },
  { id: "running", label: "Running" },
  { id: "scheduled", label: "Scheduled" },
  { id: "failed", label: "Failed" },
];

type ReportCenterNavProps = {
  activeSection: ReportCenterSection;
  onSectionChange: (section: ReportCenterSection) => void;
  libraryCollection: LibraryCollection;
  onLibraryCollectionChange: (collection: LibraryCollection) => void;
  counts: {
    library: number;
    schedules: number;
    templates: number;
    saved: number;
    starred: number;
    failed: number;
    running: number;
    scheduled: number;
    recent: number;
  };
};

export function ReportCenterNav({
  activeSection,
  onSectionChange,
  libraryCollection,
  onLibraryCollectionChange,
  counts,
}: ReportCenterNavProps) {
  const sectionCount = (id: ReportCenterSection) => {
    if (id === "library") return counts.library;
    if (id === "schedules") return counts.schedules;
    if (id === "templates") return counts.templates;
    return null;
  };

  const collectionCount = (id: LibraryCollection) => {
    if (id === "all") return counts.library;
    if (id === "saved") return counts.saved;
    if (id === "starred") return counts.starred;
    if (id === "failed") return counts.failed;
    if (id === "running") return counts.running;
    if (id === "scheduled") return counts.scheduled;
    if (id === "recent") return counts.recent;
    return 0;
  };

  return (
    <nav aria-label="Report Center sections" className="app-report-center-nav">
      <div className="app-report-center-nav__group">
        {mainNav.map((item) => {
          const active = activeSection === item.id;
          const count = sectionCount(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onSectionChange(item.id)}
              className={`app-report-center-nav__item${active ? " app-report-center-nav__item--active" : ""}`}
              style={{ fontFamily: reportFont }}
            >
              <span className="app-report-center-nav__icon">{item.icon}</span>
              <span className="app-report-center-nav__label">{item.label}</span>
              {count !== null && (
                <span className="app-report-center-nav__count app-report-center-nav__count--primary">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {activeSection === "library" && (
        <div className="app-report-center-nav__collections">
          <div className="app-report-center-nav__collections-label">Collections</div>
          {collections.map((col) => {
            const active = libraryCollection === col.id;
            return (
              <button
                key={col.id}
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => onLibraryCollectionChange(col.id)}
                className={`app-report-center-nav__collection${active ? " app-report-center-nav__collection--active" : ""}`}
                style={{ fontFamily: reportFont }}
              >
                <span className="app-report-center-nav__collection-label">{col.label}</span>
                <span className="app-report-center-nav__count app-report-center-nav__count--collection">{collectionCount(col.id)}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
