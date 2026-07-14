import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { AnimatePresence } from 'motion/react';
import { Home, Download } from 'lucide-react';

import { UI_FONT_STACK as F } from '../tokens/typography';
import { ExportDataModal } from './ExportDataModal';

const avatarNav = [
  { label: 'Pr', bg: '#E8956D', title: 'Purchase Requests', path: '/purchase-requests' },
  { label: 'Nv', bg: '#1A7A6E', title: 'Vendors', path: '#' },
  { label: 'Xp', bg: '#7B5EA7', title: 'Expenses', path: '#' },
  { label: 'Ro', bg: '#2887C8', title: 'Reports', path: '/reports' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
    <nav
      aria-label="Primary module navigation"
      style={{
        width: '52px',
        height: '100vh',
        background: '#1E2D3D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        zIndex: 20,
        paddingTop: '14px',
        paddingBottom: '14px',
        boxSizing: 'border-box',
      }}
    >
      {/* Home */}
      <button
        type="button"
        aria-label="Home"
        aria-current={pathname === '/' ? 'page' : undefined}
        title="Home"
        onClick={() => navigate('/')}
        style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: '8px',
          border: 'none',
          padding: 0,
          background: pathname === '/' ? 'rgba(255,255,255,0.12)' : 'transparent',
          transition: 'background 0.15s',
          marginBottom: '10px',
        }}
        onMouseEnter={(e) => { if (pathname !== '/') (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
        onMouseLeave={(e) => { if (pathname !== '/') (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Home size={17} color={pathname === '/' ? '#FFFFFF' : '#94A3B8'} strokeWidth={1.8} />
      </button>

      {/* Divider */}
      <div style={{ width: '28px', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '10px' }} />

      {/* Avatar nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', flex: 1 }}>
        {avatarNav.map((item) => {
          const active = item.path !== '#' && (pathname === item.path || (item.path === '/purchase-requests' && pathname.startsWith('/pr')) || (item.path === '/reports' && pathname.startsWith('/reports')));
          return (
            <button
              key={item.label}
              type="button"
              title={item.title}
              aria-label={item.title}
              aria-current={active ? 'page' : undefined}
              disabled={item.path === '#'}
              onClick={() => item.path !== '#' && navigate(item.path)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: item.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: item.path !== '#' ? 'pointer' : 'not-allowed',
                boxShadow: active ? `0 0 0 2.5px rgba(255,255,255,0.35)` : 'none',
                transition: 'box-shadow 0.18s, transform 0.15s',
                opacity: item.path === '#' ? 0.75 : 1,
                border: 'none',
                padding: 0,
              }}
              onMouseEnter={(e) => { if (item.path !== '#') (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            >
              <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 700, fontFamily: F, userSelect: 'none' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Download / Export */}
      <button
        type="button"
        title="Export"
        aria-label="Export"
        onClick={() => setExportOpen(true)}
        style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: '8px',
          border: 'none',
          padding: 0,
          background: exportOpen ? 'rgba(255,255,255,0.12)' : 'transparent',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { if (!exportOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
        onMouseLeave={(e) => { if (!exportOpen) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Download size={16} color={exportOpen ? '#FFFFFF' : '#94A3B8'} strokeWidth={1.8} />
      </button>
    </nav>

    <AnimatePresence>
      {exportOpen && (
        <ExportDataModal onClose={() => setExportOpen(false)} />
      )}
    </AnimatePresence>
    </>
  );
}
