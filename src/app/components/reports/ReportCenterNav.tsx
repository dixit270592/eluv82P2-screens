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
  { id: "insights", label: "Insights", icon: <BarChart2 size={16} aria-hidden /> },
  { id: "library", label: "Library", icon: <BookOpen size={16} aria-hidden /> },
  { id: "schedules", label: "Schedules", icon: <CalendarClock size={16} aria-hidden /> },
  { id: "templates", label: "Templates", icon: <LayoutTemplate size={16} aria-hidden /> },
];

type ReportCenterNavProps = {
  activeSection: ReportCenterSection;
  onSectionChange: (section: ReportCenterSection) => void;
  counts: {
    library: number;
    schedules: number;
    templates: number;
  };
};

export function ReportCenterNav({
  activeSection,
  onSectionChange,
  counts,
}: ReportCenterNavProps) {
  const sectionCount = (id: ReportCenterSection) => {
    if (id === "library") return counts.library;
    if (id === "schedules") return counts.schedules;
    if (id === "templates") return counts.templates;
    return null;
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
    </nav>
  );
}
