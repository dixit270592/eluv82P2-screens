import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronDown,
  Menu,
  User,
  Bell,
  FileText,
  Receipt,
  Plus,
  HelpCircle,
  LogOut,
  Settings,
  X,
  Building2,
  FileStack,
  Landmark,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import logoSvg from '../../imports/Eluv8P2P-final-logo.svg';
import { UI_FONT_STACK as F } from '../tokens/typography';

interface TopHeaderProps {
  onNewRequest?: () => void;
  prStatus?: string;
  prId?: string;
}

const newItems = [
  { icon: FileText, label: 'New Request', color: '#1FA97A' },
  { icon: Receipt, label: 'New Expense', color: '#667085' },
  { icon: Plus, label: 'New Invoice', color: '#667085' },
];

type SettingsSectionDef = { title: string; icon: LucideIcon; items: string[] };

const settingsSectionDefs: SettingsSectionDef[] = [
  {
    title: 'Company Setup',
    icon: Building2,
    items: [
      'Group Setup',
      'Department / Location Setup',
      'Approval Group',
      'Filter Profiles',
      'Address Setup',
      'User Setup',
      'Unit of Measure',
      'Item Setup',
      'Shipping Method',
    ],
  },
  {
    title: 'Transaction Setup',
    icon: FileStack,
    items: [
      'Purchase Request Options',
      'Purchase Order Options',
      'Receiving Options',
      'Invoice Options',
      'Budget Options',
      'Custom Field Options',
      'Global Approvals',
      'Approval Workflow Setup',
    ],
  },
  {
    title: 'Accounting Setup',
    icon: Landmark,
    items: ['Account Setup', 'Project Setup', 'Budget Setup', 'Vendor Setup', 'Tax', 'Currency'],
  },
];

const panelStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  width: 220,
  background: '#FFFFFF',
  border: '1px solid #E4E7EC',
  borderRadius: 8,
  boxShadow: '0 6px 20px rgba(16,24,40,0.12)',
  zIndex: 200,
  overflow: 'hidden',
  padding: '10px 12px',
  fontFamily: F,
};

export function TopHeader({ onNewRequest, prId }: TopHeaderProps) {
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (dropRef.current && !dropRef.current.contains(t)) setDropOpen(false);
      if (menuRef.current && !menuRef.current.contains(t)) setMenuOpen(false);
      if (accountRef.current && !accountRef.current.contains(t)) setAccountOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(t)) setSettingsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropOpen(false);
        setMenuOpen(false);
        setAccountOpen(false);
        setSettingsOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      style={{
        height: '50px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E4E7EC',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0, marginRight: '4px' }}>
        <img
          src={logoSvg}
          alt="eluv8P2P"
          onClick={() => navigate('/')}
          style={{ height: '28px', width: 'auto', cursor: 'pointer', display: 'block' }}
        />
      </div>

      {prId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F }} aria-hidden>•</span>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              fontSize: '12px',
              color: '#667085',
              fontFamily: F,
              cursor: 'pointer',
              transition: 'color 0.15s',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#1FA97A'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#667085'; }}
          >
            Back to Dashboard
          </button>
          <span style={{ fontSize: '11px', color: '#D0D5DD', fontFamily: F }}>›</span>
          <span style={{ fontSize: '12px', color: '#101828', fontWeight: 600, fontFamily: F }}>PR</span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            type="button"
            aria-expanded={dropOpen}
            aria-haspopup="menu"
            onClick={() => {
              setDropOpen((p) => !p);
              setSettingsOpen(false);
            }}
            style={{
              height: '32px',
              padding: '0 13px',
              background: '#1FA97A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: F,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#178F67')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#1FA97A')}
          >
            <Plus size={13} strokeWidth={2.5} />
            New
            <ChevronDown size={11} strokeWidth={2.5} />
          </button>

          <AnimatePresence>
            {dropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                role="menu"
                aria-label="Create new"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '170px',
                  background: '#FFFFFF',
                  border: '1px solid #E4E7EC',
                  borderRadius: '8px',
                  boxShadow: '0 6px 20px rgba(16,24,40,0.12)',
                  zIndex: 200,
                  overflow: 'hidden',
                  padding: '4px 0',
                }}
              >
                {newItems.map(({ icon: Icon, label, color }) => (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setDropOpen(false);
                      if (label === 'New Request' && onNewRequest) onNewRequest();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      padding: '9px 14px',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#101828',
                      fontFamily: F,
                      transition: 'background 0.12s',
                      background: 'transparent',
                      border: 'none',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#F5F7FA'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <Icon size={14} color={color} strokeWidth={2} />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            aria-label="Main menu"
            onClick={() => {
              setMenuOpen((p) => !p);
              setAccountOpen(false);
              setSettingsOpen(false);
            }}
            style={{
              width: '32px', height: '32px', border: '1px solid #E4E7EC', borderRadius: '6px',
              background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Menu size={15} color="#667085" strokeWidth={1.8} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                id="header-main-menu"
                role="dialog"
                aria-label="App menu"
                style={panelStyle}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <HelpCircle size={16} color="#667085" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
                  <p style={{ margin: 0, fontSize: 12, color: '#475467', lineHeight: 1.45 }}>
                    Help and app settings will appear here in a future release.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={settingsRef} style={{ position: 'relative' }}>
          <button
            type="button"
            aria-expanded={settingsOpen}
            aria-haspopup="dialog"
            aria-label="Open settings and setup"
            onClick={() => {
              setSettingsOpen((p) => !p);
              setDropOpen(false);
              setMenuOpen(false);
              setAccountOpen(false);
            }}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid #E4E7EC',
              borderRadius: '6px',
              background: settingsOpen ? '#F5F7FA' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
              boxShadow: settingsOpen ? '0 0 0 2px rgba(31, 169, 122, 0.2)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!settingsOpen) {
                e.currentTarget.style.background = '#F5F7FA';
                e.currentTarget.style.borderColor = '#D0D5DD';
              }
            }}
            onMouseLeave={(e) => {
              if (!settingsOpen) {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E4E7EC';
              }
            }}
          >
            <Settings size={17} color={settingsOpen ? '#1FA97A' : '#667085'} strokeWidth={1.85} aria-hidden />
          </button>

          <AnimatePresence>
            {settingsOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  role="presentation"
                  aria-hidden
                  onClick={() => setSettingsOpen(false)}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 240,
                    background: 'rgba(15, 23, 42, 0.08)',
                    backdropFilter: 'blur(2px)',
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  id="header-settings-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="settings-panel-title"
                  style={{
                    position: 'fixed',
                    top: '50px',
                    right: '20px',
                    zIndex: 250,
                    width: 'min(960px, calc(100vw - 28px))',
                    maxHeight: 'min(640px, calc(100vh - 56px))',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E4E7EC',
                    boxShadow:
                      '0 24px 48px -12px rgba(16, 24, 40, 0.18), 0 12px 24px -8px rgba(16, 24, 40, 0.1)',
                    fontFamily: F,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '20px',
                      padding: '20px 24px',
                      borderBottom: '1px solid #ECEFF3',
                      background: '#FFFFFF',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <h2
                        id="settings-panel-title"
                        style={{
                          margin: 0,
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#0F172A',
                          letterSpacing: '-0.025em',
                          lineHeight: 1.35,
                        }}
                      >
                        Setup & configuration
                      </h2>
                      <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#64748B', lineHeight: 1.5, fontWeight: 400 }}>
                        Company, transaction, and accounting setup in one place.
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Close settings"
                      onClick={() => setSettingsOpen(false)}
                      style={{
                        flexShrink: 0,
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        borderRadius: '6px',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F1F5F9';
                        e.currentTarget.style.color = '#0F172A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94A3B8';
                      }}
                    >
                      <X size={18} strokeWidth={2} aria-hidden />
                    </button>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '20px 24px 24px',
                      WebkitOverflowScrolling: 'touch',
                      background: '#FAFBFC',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                        gap: '16px',
                        alignItems: 'stretch',
                        minWidth: 0,
                      }}
                    >
                      {settingsSectionDefs.map((section) => {
                        const Icon = section.icon;
                        return (
                          <div
                            key={section.title}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                              minHeight: 0,
                              background: '#FFFFFF',
                              border: '1px solid #E8ECF1',
                              borderRadius: '8px',
                              padding: '18px 16px 16px',
                              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                              boxSizing: 'border-box',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flexShrink: 0,
                                marginBottom: '14px',
                                paddingBottom: '14px',
                                borderBottom: '1px solid #EEF2F6',
                              }}
                            >
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: 'rgba(31, 169, 122, 0.08)',
                                  flexShrink: 0,
                                }}
                              >
                                <Icon size={17} color="#159A72" strokeWidth={1.75} aria-hidden />
                              </span>
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#0F172A',
                                  lineHeight: 1.35,
                                  letterSpacing: '-0.01em',
                                }}
                              >
                                {section.title}
                              </span>
                            </div>
                            <ul
                              style={{
                                flex: 1,
                                margin: 0,
                                padding: 0,
                                listStyle: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                minHeight: 0,
                              }}
                            >
                              {section.items.map((item) => (
                                <li key={item}>
                                  <button
                                    type="button"
                                    onClick={() => setSettingsOpen(false)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '8px',
                                      width: '100%',
                                      padding: '8px 10px',
                                      margin: 0,
                                      border: 'none',
                                      borderRadius: '6px',
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      fontSize: '13px',
                                      fontWeight: 500,
                                      color: '#475569',
                                      fontFamily: F,
                                      lineHeight: 1.4,
                                      letterSpacing: '-0.01em',
                                      transition: 'background 0.14s ease, color 0.14s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#F8FAFC';
                                      e.currentTarget.style.color = '#0F172A';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'transparent';
                                      e.currentTarget.style.color = '#475569';
                                    }}
                                  >
                                    <span
                                      style={{
                                        flex: 1,
                                        minWidth: 0,
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {item}
                                    </span>
                                    <ChevronRight
                                      size={14}
                                      color="#CBD5E1"
                                      strokeWidth={2}
                                      style={{ flexShrink: 0, opacity: 0.65 }}
                                      aria-hidden
                                    />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div ref={accountRef} style={{ position: 'relative' }}>
          <button
            type="button"
            aria-expanded={accountOpen}
            aria-haspopup="dialog"
            aria-label="Account menu"
            onClick={() => {
              setAccountOpen((p) => !p);
              setMenuOpen(false);
              setSettingsOpen(false);
            }}
            style={{
              width: '32px', height: '32px', border: '1px solid #E4E7EC', borderRadius: '6px',
              background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <User size={15} color="#667085" strokeWidth={1.8} />
          </button>
          <AnimatePresence>
            {accountOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                role="dialog"
                aria-label="Account"
                style={panelStyle}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <LogOut size={16} color="#667085" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
                  <p style={{ margin: 0, fontSize: 12, color: '#475467', lineHeight: 1.45 }}>
                    Profile and sign-in options will be connected here when authentication is available.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          aria-label="Notifications, 1 unread"
          onClick={() => setSettingsOpen(false)}
          style={{
            position: 'relative', width: '32px', height: '32px', border: '1px solid #E4E7EC',
            borderRadius: '6px', background: '#FFFFFF', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <Bell size={15} color="#667085" strokeWidth={1.8} />
          <span
            style={{
              position: 'absolute', top: '5px', right: '5px', width: '6px', height: '6px',
              background: '#F04438', borderRadius: '50%', border: '1.5px solid #FFFFFF',
            }}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
