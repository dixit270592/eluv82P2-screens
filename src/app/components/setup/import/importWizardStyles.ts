import type { CSSProperties } from 'react';
import { P2P_BRAND } from '../../../tokens/brand';
import { UI_FONT_STACK as F } from '../../../tokens/typography';

export const importWizardFont = F;

export const wizardOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(16, 24, 40, 0.45)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '24px',
};

export const wizardPanelStyle: CSSProperties = {
  width: '900px',
  maxWidth: '96vw',
  height: 'min(880px, 92vh)',
  minHeight: '640px',
  background: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 20px 48px rgba(16, 24, 40, 0.18)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  fontFamily: F,
};

export const wizardHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px 0',
  flexShrink: 0,
};

export const wizardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 600,
  color: '#0F172A',
  letterSpacing: '-0.02em',
};

export const wizardBodyStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px 24px 24px',
  minHeight: 0,
  scrollBehavior: 'smooth',
  WebkitOverflowScrolling: 'touch',
};

export const wizardFooterStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '10px',
  padding: '16px 24px',
  borderTop: '1px solid #EEF1F5',
  background: '#FAFBFC',
  flexShrink: 0,
};

export const primaryBtnStyle = (enabled = true): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  height: '40px',
  padding: '0 18px',
  border: 'none',
  borderRadius: '8px',
  background: enabled ? P2P_BRAND.primary : '#D0D5DD',
  color: '#FFFFFF',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: F,
  cursor: enabled ? 'pointer' : 'not-allowed',
  opacity: enabled ? 1 : 0.85,
});

export const secondaryBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  height: '40px',
  padding: '0 18px',
  border: '1px solid #D0D5DD',
  borderRadius: '8px',
  background: '#FFFFFF',
  color: '#344054',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: F,
  cursor: 'pointer',
};

export const outlineAccentBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  height: '38px',
  padding: '0 14px',
  border: `1px solid ${P2P_BRAND.primary}`,
  borderRadius: '8px',
  background: '#FFFFFF',
  color: P2P_BRAND.primaryStrong,
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: F,
  cursor: 'pointer',
};

export const previewIconBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '38px',
  height: '38px',
  padding: 0,
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  background: '#FFFFFF',
  color: '#475467',
  cursor: 'pointer',
  flexShrink: 0,
};

export const fieldLabelStyle: CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#344054',
  minWidth: '120px',
  flexShrink: 0,
};

export const helperTextStyle: CSSProperties = {
  margin: '6px 0 0',
  fontSize: '12px',
  color: '#667085',
  lineHeight: 1.45,
};

export const tableThStyle: CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
  background: '#F9FAFB',
  borderBottom: '1px solid #E4E7EC',
};

export const tableTdStyle: CSSProperties = {
  padding: '12px 14px',
  verticalAlign: 'middle',
  fontSize: '13px',
  color: '#0F172A',
  borderBottom: '1px solid #EEF1F5',
};

export const statCardStyle = (accent: string): CSSProperties => ({
  flex: 1,
  minWidth: '120px',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #E4E7EC',
  background: '#FFFFFF',
  borderTop: `3px solid ${accent}`,
});

export const inlineErrorStyle: CSSProperties = {
  marginTop: '6px',
  fontSize: '12px',
  color: '#F04438',
  lineHeight: 1.4,
};

export const inlineWarningStyle: CSSProperties = {
  marginTop: '6px',
  fontSize: '12px',
  color: '#B54708',
  lineHeight: 1.4,
};

export const mappedBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  background: P2P_BRAND.surface,
  color: P2P_BRAND.primaryStrong,
  border: `1px solid ${P2P_BRAND.surfaceBorder}`,
};

export const progressTrackStyle: CSSProperties = {
  height: '6px',
  borderRadius: '999px',
  background: '#EEF1F5',
  overflow: 'hidden',
};

export const progressFillStyle = (pct: number): CSSProperties => ({
  height: '100%',
  width: `${pct}%`,
  borderRadius: '999px',
  background: `linear-gradient(90deg, ${P2P_BRAND.primary} 0%, #2DD4A7 100%)`,
  transition: 'width 0.25s ease',
});

export const fileChipStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid #E4E7EC',
  background: '#F8FAFC',
  fontSize: '13px',
  color: '#334155',
  maxWidth: '100%',
};

export const removeFileBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  border: '1px solid #FEE4E2',
  borderRadius: '6px',
  background: '#FEF3F2',
  color: '#F04438',
  cursor: 'pointer',
  flexShrink: 0,
};

export const dropZoneStyle = (active: boolean, hasFile: boolean): CSSProperties => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  minHeight: hasFile ? 'auto' : '148px',
  padding: hasFile ? '14px 16px' : '28px 20px',
  borderRadius: '10px',
  border: `2px dashed ${active ? P2P_BRAND.primary : hasFile ? P2P_BRAND.surfaceBorder : '#D0D5DD'}`,
  background: active ? P2P_BRAND.surface : hasFile ? '#FAFFFD' : '#FAFBFC',
  cursor: hasFile ? 'default' : 'pointer',
  transition: 'border-color 0.2s, background 0.2s',
  textAlign: 'center',
});

export const collapseToggleStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: P2P_BRAND.primaryStrong,
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: F,
  cursor: 'pointer',
};
