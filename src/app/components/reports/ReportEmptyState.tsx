import {
  reportFont,
  reportMuted,
  reportMutedLight,
  reportText,
} from "./reportUiStyles";
type ReportEmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  variant?: "empty" | "error";
};

export function ReportEmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "empty",
}: ReportEmptyStateProps) {
  const isError = variant === "error";

  return (
    <div role={isError ? "alert" : "status"} className="app-report-empty-state">
      {icon && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", color: "#98A2B3" }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: "14px", fontWeight: 600, color: isError ? "#B42318" : reportText, marginBottom: description ? "4px" : 0, lineHeight: 1.3 }}>
        {title}
      </div>
      {description && (
        <p style={{ fontSize: "12px", color: isError ? "#D92D20" : reportMutedLight, margin: 0, lineHeight: 1.45 }}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="app-report-header-btn app-report-header-btn--primary"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button type="button" onClick={secondaryAction.onClick} className="app-report-header-btn">
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
