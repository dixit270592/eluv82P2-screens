import { useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, ShoppingBag, FileText, BarChart2, Bell, Settings, HelpCircle, Users } from 'lucide-react';
import logoSvg from '../../imports/Logo-for-Figma.svg';

import { UI_FONT_STACK as F } from '../tokens/typography';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingBag, label: 'Purchase Requests', path: '/' },
  { icon: Users, label: 'Vendors', path: '#' },
  { icon: FileText, label: 'Documents', path: '#' },
  { icon: BarChart2, label: 'Reports', path: '#' },
  { icon: Bell, label: 'Notifications', path: '#' },
];

const bottomItems = [
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help' },
];

export function SidebarV1() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (label: string) =>
    label === 'Purchase Requests' ? pathname === '/' || pathname.startsWith('/pr') : false;

  return (
    <div
      style={{
        width: '72px',
        height: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid #E4E7EC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '18px 0 20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <img
          src={logoSvg}
          alt="eluv8P2P"
          onClick={() => navigate('/')}
          style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
        />
      </div>

      <div style={{ width: '36px', height: '1px', background: '#EEF1F5', marginBottom: '12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0' }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = isActive(label);
          return (
            <div
              key={label}
              title={label}
              onClick={() => path !== '#' && navigate(path)}
              style={{
                width: '72px', height: '48px', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: path !== '#' ? 'pointer' : 'default',
              }}
            >
              {active && (
                <div
                  style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: '3px', height: '24px', background: '#1FA97A', borderRadius: '0 3px 3px 0',
                  }}
                />
              )}
              <div
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: active ? '#E6F7F1' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = '#F5F7FA'; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Icon size={18} color={active ? '#1FA97A' : '#667085'} strokeWidth={active ? 2.2 : 1.8} />
              </div>
            </div>
          );
        })}
      </nav>

      <div style={{ width: '36px', height: '1px', background: '#EEF1F5', marginBottom: '8px' }} />

      {/* Bottom */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', paddingBottom: '16px' }}>
        {bottomItems.map(({ icon: Icon, label }) => (
          <div
            key={label} title={label}
            style={{ width: '72px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <div
              style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#F5F7FA')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <Icon size={17} color="#98A2B3" strokeWidth={1.8} />
            </div>
          </div>
        ))}

        {/* Avatar */}
        <div
          title="John Davidson"
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1FA97A, #0E7A54)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 0 0 2.5px #E6F7F1', marginTop: '4px',
          }}
        >
          <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600, fontFamily: F }}>JD</span>
        </div>
      </div>
    </div>
  );
}
