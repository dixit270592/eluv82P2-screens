import type { LibraryCollection } from "./ReportCenterNav";
import { reportFont } from "./reportUiStyles";

export const LIBRARY_COLLECTIONS: { id: LibraryCollection; label: string }[] = [
  { id: "all", label: "All Reports" },
  { id: "recent", label: "Recent" },
  { id: "saved", label: "Saved" },
  { id: "starred", label: "Starred" },
  { id: "running", label: "Running" },
  { id: "scheduled", label: "Scheduled" },
  { id: "failed", label: "Failed" },
];

export const LIBRARY_COLLECTION_LABELS: Record<LibraryCollection, string> = {
  all: "All Reports",
  recent: "Recent",
  saved: "Saved",
  starred: "Starred",
  running: "Running",
  scheduled: "Scheduled",
  failed: "Failed",
};

type LibraryCollectionPillsProps = {
  active: LibraryCollection;
  onChange: (collection: LibraryCollection) => void;
  counts: Partial<Record<LibraryCollection, number>>;
};

export function LibraryCollectionPills({ active, onChange, counts }: LibraryCollectionPillsProps) {
  return (
    <div
      className="app-report-collection-pills"
      role="tablist"
      aria-label="Report collections"
      style={{ fontFamily: reportFont }}
    >
      {LIBRARY_COLLECTIONS.map((col) => {
        const isActive = active === col.id;
        const count = counts[col.id];
        return (
          <button
            key={col.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(col.id)}
            className={`app-report-collection-pills__item${isActive ? " app-report-collection-pills__item--active" : ""}`}
          >
            {col.label}
            {count != null && count > 0 && (
              <span className="app-report-collection-pills__count">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
