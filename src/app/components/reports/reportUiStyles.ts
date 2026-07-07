import type { CSSProperties } from "react";
import { P2P_BRAND } from "../../tokens/brand";
import { UI_FONT_STACK as F } from "../../tokens/typography";

export const REPORT_DRAWER_WIDTH = 540;
export const REPORT_NAV_WIDTH = 266;

export const reportFont = F;

/** 4px-based spacing scale */
export const reportSpace = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

/** Consistent control sizing */
export const REPORT_CONTROL_HEIGHT = 36;
export const REPORT_RADIUS = "8px";
export const REPORT_RADIUS_SM = "6px";

/** Shared badge sizing — status labels vs numeric counts */
export const REPORT_BADGE_RADIUS = REPORT_RADIUS_SM;
export const reportStatusBadgeClassName = "app-report-status-badge";
export const reportCountBadgeClassName = "app-report-count-badge";

/** Shared neutral palette */
export const reportBorder = "#EAECF0";
export const reportBorderLight = "#F2F4F7";
export const reportMuted = "#667085";
export const reportMutedLight = "#98A2B3";
export const reportText = "#101828";
export const reportSurface = "#FAFBFC";
export const reportPageBg = "#F8F9FB";

/** Typography hierarchy: Page → Section → Label → Metadata */
export const reportPageTitleStyle: CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: reportText,
  margin: 0,
  letterSpacing: "-0.02em",
  lineHeight: 1.25,
};

export const reportPageSubtitleStyle: CSSProperties = {
  fontSize: "13px",
  color: reportMuted,
  margin: "6px 0 0",
  lineHeight: 1.45,
  maxWidth: "52ch",
};

export const reportSectionTitleStyle: CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: reportText,
  letterSpacing: "-0.01em",
  lineHeight: 1.3,
};

export const reportSectionSubtitleStyle: CSSProperties = {
  fontSize: "12px",
  color: reportMuted,
  lineHeight: 1.4,
};

export const reportCardTitleStyle: CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: reportText,
  lineHeight: 1.3,
};

export const reportMetadataStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
  color: reportMutedLight,
  lineHeight: 1.4,
};

export const reportCardShellStyle: CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${reportBorder}`,
  borderRadius: "8px",
  overflow: "hidden",
};

/** Flat workspace pane — separation via layout dividers, not card chrome */
export const reportPaneStyle: CSSProperties = {
  background: "#FFFFFF",
  overflow: "hidden",
};

export const reportPanelStyle: CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${reportBorder}`,
  borderRadius: REPORT_RADIUS,
  padding: "16px",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.03)",
};

export const reportWidgetHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  borderBottom: `1px solid ${reportBorderLight}`,
};

export const reportSectionLabelStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: reportMutedLight,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  lineHeight: 1.3,
};

export const reportFilterLabelStyle: CSSProperties = {
  ...reportSectionLabelStyle,
  fontSize: "10px",
};

export const reportTabBarStyle: CSSProperties = {
  display: "flex",
  gap: "4px",
  borderBottom: `1px solid ${reportBorder}`,
  marginBottom: "16px",
};

export const reportInputStyle: CSSProperties = {
  padding: "8px 12px",
  minHeight: `${REPORT_CONTROL_HEIGHT}px`,
  border: "1px solid #D0D5DD",
  borderRadius: REPORT_RADIUS,
  fontSize: "12px",
  color: "#344054",
  fontFamily: F,
  background: "#FFFFFF",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const reportLabelStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#344054",
  lineHeight: 1.3,
};

export const reportSearchBoxStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  minHeight: `${REPORT_CONTROL_HEIGHT}px`,
  background: reportSurface,
  border: `1px solid ${reportBorder}`,
  borderRadius: REPORT_RADIUS,
  padding: "6px 10px",
  transition: "border-color 0.15s, background 0.15s",
};

export const reportPrimaryBtnStyle: CSSProperties = {
  padding: "8px 12px",
  minHeight: `${REPORT_CONTROL_HEIGHT}px`,
  border: "none",
  borderRadius: REPORT_RADIUS,
  background: P2P_BRAND.primary,
  color: "#FFFFFF",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: F,
  transition: "background 0.2s ease",
};

export const reportSecondaryBtnStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px 12px",
  minHeight: `${REPORT_CONTROL_HEIGHT}px`,
  border: `1px solid ${reportBorder}`,
  borderRadius: REPORT_RADIUS,
  background: "#FFFFFF",
  color: "#344054",
  fontSize: "12px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: F,
  transition: "background 0.2s ease, border-color 0.2s ease",
};

/** Compact ghost action in detail panel */
export const reportGhostActionBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 10px",
  minHeight: `${REPORT_CONTROL_HEIGHT}px`,
  border: "none",
  borderRadius: REPORT_RADIUS_SM,
  background: "transparent",
  color: "#667085",
  fontSize: "12px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: F,
  transition: "background 0.2s ease, color 0.2s ease",
};

/** Low-priority text action */
export const reportTertiaryBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 10px",
  minHeight: `${REPORT_CONTROL_HEIGHT}px`,
  border: "none",
  borderRadius: REPORT_RADIUS_SM,
  background: "transparent",
  color: "#667085",
  fontSize: "12px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: F,
  transition: "background 0.2s ease, color 0.2s ease",
};

/** Destructive text action */
export const reportDestructiveBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 10px",
  minHeight: `${REPORT_CONTROL_HEIGHT}px`,
  border: "none",
  borderRadius: REPORT_RADIUS_SM,
  background: "transparent",
  color: "#D92D20",
  fontSize: "12px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: F,
  transition: "background 0.12s",
};

export const reportCancelBtnStyle: CSSProperties = {
  padding: "8px 12px",
  minHeight: `${REPORT_CONTROL_HEIGHT}px`,
  border: "1px solid #D0D5DD",
  borderRadius: REPORT_RADIUS,
  background: "#FFFFFF",
  color: "#344054",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: F,
  transition: "background 0.2s ease, border-color 0.2s ease",
};

export const reportIconBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  width: `${REPORT_CONTROL_HEIGHT}px`,
  height: `${REPORT_CONTROL_HEIGHT}px`,
  padding: 0,
  border: "1px solid #E4E7EC",
  borderRadius: REPORT_RADIUS_SM,
  background: "#FFFFFF",
  color: "#667085",
  fontSize: "11px",
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: F,
  transition: "background 0.2s ease, border-color 0.2s ease",
};

export const reportGhostIconBtnStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: `${REPORT_CONTROL_HEIGHT}px`,
  height: `${REPORT_CONTROL_HEIGHT}px`,
  border: "none",
  borderRadius: REPORT_RADIUS,
  background: "transparent",
  cursor: "pointer",
  flexShrink: 0,
  transition: "background 0.2s ease",
};

/** @deprecated Prefer `reportCountBadgeClassName` — kept for legacy inline usage */
export const reportCountBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "20px",
  height: "18px",
  padding: "0 7px",
  borderRadius: REPORT_BADGE_RADIUS,
  fontSize: "10px",
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
  lineHeight: 1,
  color: reportMuted,
  background: reportBorderLight,
  flexShrink: 0,
  boxSizing: "border-box",
};

export const reportInfoPanelStyle: CSSProperties = {
  padding: "12px",
  borderRadius: REPORT_RADIUS,
  border: "1px solid #E4E7EC",
  background: "#FAFBFC",
  fontSize: "12px",
  color: "#667085",
  lineHeight: 1.45,
};

export function onGhostActionHover(e: React.MouseEvent<HTMLButtonElement>, enter: boolean) {
  const btn = e.currentTarget as HTMLButtonElement;
  btn.style.background = enter ? "#F9FAFB" : "transparent";
  btn.style.color = enter ? "#344054" : "#667085";
}

export function onDestructiveHover(e: React.MouseEvent<HTMLButtonElement>, enter: boolean) {
  const btn = e.currentTarget as HTMLButtonElement;
  btn.style.background = enter ? "#FEF2F2" : "transparent";
}

export function onPrimaryBtnHover(e: React.MouseEvent<HTMLButtonElement>, enter: boolean) {
  (e.currentTarget as HTMLButtonElement).style.background = enter ? P2P_BRAND.primaryHover : P2P_BRAND.primary;
}

export function onSurfaceHover(e: React.MouseEvent<HTMLElement>, enter: boolean) {
  (e.currentTarget as HTMLElement).style.background = enter ? "#F9FAFB" : "transparent";
}

export function onGhostBtnHover(e: React.MouseEvent<HTMLButtonElement>, enter: boolean) {
  (e.currentTarget as HTMLButtonElement).style.background = enter ? "#F9FAFB" : "transparent";
}

export function onIconBtnHover(e: React.MouseEvent<HTMLButtonElement>, enter: boolean) {
  const btn = e.currentTarget as HTMLButtonElement;
  btn.style.background = enter ? "#F9FAFB" : "#FFFFFF";
  btn.style.borderColor = enter ? P2P_BRAND.surfaceBorder : "#E4E7EC";
}

export function onSearchFocus(e: React.FocusEvent<HTMLElement>, focused: boolean) {
  const box = e.currentTarget as HTMLElement;
  box.style.borderColor = focused ? P2P_BRAND.surfaceBorder : reportBorder;
  box.style.background = focused ? "#FFFFFF" : reportSurface;
}

export function onInputFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, focused: boolean) {
  const el = e.currentTarget;
  el.style.borderColor = focused ? P2P_BRAND.primary : "#D0D5DD";
  el.style.boxShadow = focused ? `0 0 0 3px ${P2P_BRAND.surface}` : "none";
}
