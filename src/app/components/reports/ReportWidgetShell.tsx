import {
  reportCardTitleStyle,
  reportCardShellStyle,
  reportCountBadgeClassName,
  reportFont,
  reportWidgetHeaderStyle,
} from "./reportUiStyles";

type ReportWidgetShellProps = {
  title: string;
  icon?: React.ReactNode;
  count?: number;
  footer?: React.ReactNode;
  maxHeight?: number;
  children: React.ReactNode;
  ariaLabel?: string;
};

export function ReportWidgetShell({
  title,
  icon,
  count,
  footer,
  maxHeight,
  children,
  ariaLabel,
}: ReportWidgetShellProps) {
  return (
    <section
      aria-label={ariaLabel ?? title}
      style={{
        width: "100%",
        flexShrink: 0,
        ...reportCardShellStyle,
        display: "flex",
        flexDirection: "column",
        maxHeight,
      }}
    >
      <div style={reportWidgetHeaderStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          {icon}
          <span style={{ ...reportCardTitleStyle, fontFamily: reportFont }}>{title}</span>
        </div>
        {count !== undefined && <span className={reportCountBadgeClassName}>{count}</span>}
      </div>
      {children}
      {footer}
    </section>
  );
}
