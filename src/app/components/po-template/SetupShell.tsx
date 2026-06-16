import type { CSSProperties, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from '../Sidebar';
import { TopHeader } from '../TopHeader';
import { SkipToMainContent } from '../SkipToMainContent';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type Breadcrumb = { label: string; active?: boolean };

type SetupShellProps = {
  breadcrumbs: Breadcrumb[];
  title: string;
  description?: string;
  badge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function SetupShell({ breadcrumbs, title, description, badge, children, footer }: SetupShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: '#F5F7FA',
        fontFamily: F,
        overflow: 'hidden',
      }}
    >
      <SkipToMainContent />
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopHeader />

        <main
          id="main-content"
          tabIndex={-1}
          style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 32px', minWidth: 0 }}
        >
          <nav aria-label="Breadcrumb" style={{ marginBottom: '20px' }}>
            <ol
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
                padding: 0,
                listStyle: 'none',
                fontSize: '12px',
                color: '#64748B',
                flexWrap: 'wrap',
              }}
            >
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {i > 0 ? <ChevronRight size={14} color="#CBD5E1" aria-hidden /> : null}
                  <span style={crumb.active ? { color: P2P_BRAND.primaryStrong, fontWeight: 600 } : undefined}>
                    {crumb.label}
                  </span>
                </li>
              ))}
            </ol>
          </nav>

          <header
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </h1>
              {description ? (
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '62ch', lineHeight: 1.5 }}>
                  {description}
                </p>
              ) : null}
            </div>
            {badge}
          </header>

          {children}
        </main>

        {footer}
      </div>
    </div>
  );
}

export function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    <footer
      style={{
        flexShrink: 0,
        padding: '14px 28px',
        borderTop: '1px solid #E4E7EC',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '10px',
        flexWrap: 'wrap',
      }}
    >
      {children}
    </footer>
  );
}

export function primaryButtonStyle(enabled = true): CSSProperties {
  return {
    padding: '10px 18px',
    border: 'none',
    borderRadius: '8px',
    background: enabled ? P2P_BRAND.primary : '#94A3B8',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontFamily: F,
    boxShadow: enabled ? '0 1px 2px rgba(31, 169, 122, 0.28)' : 'none',
  };
}

export function secondaryButtonStyle(): CSSProperties {
  return {
    padding: '10px 16px',
    border: `1px solid ${P2P_BRAND.surfaceBorder}`,
    borderRadius: '8px',
    background: '#FFFFFF',
    color: P2P_BRAND.primaryStrong,
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: F,
  };
}

export function ghostButtonStyle(): CSSProperties {
  return {
    padding: '10px 16px',
    border: '1px solid #E4E7EC',
    borderRadius: '8px',
    background: '#FFFFFF',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: F,
  };
}
