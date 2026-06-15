import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Minus, Check } from 'lucide-react';

import { UI_FONT_STACK as F } from '../tokens/typography';

/** ~40% wider than original 560px; caps on large screens, scales inside overlay padding on smaller */
const MODAL_MAX_WIDTH_PX = 784;

/** Design tokens aligned with Dashboard / TopHeader */
const TOKENS = {
  border: '#E4E7EC',
  borderInput: '#D0D5DD',
  text: '#101828',
  textMuted: '#667085',
  surface: '#FFFFFF',
  overlay: 'rgba(16,24,40,0.45)',
  primary: '#1FA97A',
  primaryHover: '#178F67',
  /** Section accent — matches chart / metric teal used on Dashboard */
  sectionTeal: '#4ECDC4',
  headerRule: '#EEF1F5',
  shadow: '0 10px 40px rgba(16,24,40,0.2)',
} as const;

type SectionDef = { id: string; title: string; items: readonly string[] };

const SECTIONS: readonly SectionDef[] = [
  {
    id: 'general',
    title: 'General',
    items: [
      'All Capex Purchases',
      'All Capex Purchases in Approval',
      'All Capex Receipts',
      'All Capex invoices',
      'Your Blanket POs',
      'Your PRs waiting more than 24 hours for approval',
      'Purchase Request that need your attention',
      'Releases against your Blanket POs',
      'Purchase Requests that mention you',
      'Your Expenses Requests',
      'Your Newly created POs',
      'Your Purchase Requests in Approval',
    ],
  },
  {
    id: 'pr',
    title: 'PR',
    items: [
      'Newly approved PRs that need to converted to PO',
      'All PRs that need quoting',
      'Purchase Requests that need your approval',
    ],
  },
  {
    id: 'po',
    title: 'PO',
    items: [
      'Open POs with no Receipts',
      'POs that you have recently received',
      'All recently created Purchase Orders',
      'All open POs in the last 30 days',
      'All open POs in the last 60 days',
      'All open POs in the last 90 days',
      'All fully received PO that need invoicing',
      'All open POs',
    ],
  },
  {
    id: 'invoice',
    title: 'Invoice',
    items: [
      'All Invoices in waiting more than 24 hours for approval',
      'All Invoices in Approval',
      'All Invoices waiting for you to approve',
      'All Invoices that can be paid',
    ],
  },
  {
    id: 'expense',
    title: 'Expense',
    items: ['Expense Requests that need your approval'],
  },
  {
    id: 'receipt',
    title: 'Receipt',
    items: ['All Recent receipts activity against all Purchase Orders'],
  },
  {
    id: 'charts',
    title: 'Charts',
    items: [
      'POs by Department(30 days)',
      'POs by Requester(30 days)',
      'Requests by Department(30 days)',
      'Requests by Status(30 days)',
      'Requests by Type(30 days)',
    ],
  },
] as const;

export function getDefaultDashboardConfigSelections(): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  for (const sec of SECTIONS) {
    sec.items.forEach((_, i) => {
      next[`${sec.id}-${i}`] = true;
    });
  }
  return next;
}

export interface DashboardConfigurationModalProps {
  onClose: () => void;
  onSave?: (selections: Record<string, boolean>) => void;
  /** When provided (e.g. after a prior Save), form opens with these values */
  initialSelections?: Record<string, boolean>;
}

export function DashboardConfigurationModal({
  onClose,
  onSave,
  initialSelections: initialProp,
}: DashboardConfigurationModalProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SECTIONS.map((s) => [s.id, false])),
  );
  const [selections, setSelections] = useState<Record<string, boolean>>(() =>
    initialProp ? { ...initialProp } : getDefaultDashboardConfigSelections(),
  );

  const toggleSection = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleOption = useCallback((key: string) => {
    setSelections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(selections);
    onClose();
  }, [onSave, onClose, selections]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sectionList = useMemo(() => SECTIONS, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        background: TOKENS.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 'clamp(12px, 3vw, 24px)',
        backdropFilter: 'blur(2px)',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-config-title"
        style={{
          width: '100%',
          maxWidth: `min(${MODAL_MAX_WIDTH_PX}px, 100%)`,
          minWidth: 0,
          boxSizing: 'border-box',
          maxHeight: 'min(90vh, 900px)',
          background: TOKENS.surface,
          borderRadius: '8px',
          boxShadow: TOKENS.shadow,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: F,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '18px 22px 14px',
            borderBottom: `1px solid ${TOKENS.headerRule}`,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <h2
            id="dashboard-config-title"
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              color: TOKENS.text,
              fontFamily: F,
              lineHeight: 1.3,
            }}
          >
            Dashboard Configuration
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              border: 'none',
              background: 'transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: -2,
              marginRight: -6,
            }}
          >
            <X size={18} color={TOKENS.textMuted} strokeWidth={2} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 22px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {sectionList.map((section) => {
            const isOpen = expanded[section.id];
            return (
              <div key={section.id} style={{ display: 'flex', flexDirection: 'column' }}>
                {!isOpen ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: TOKENS.surface,
                      border: `1px solid ${TOKENS.border}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontFamily: F,
                      fontSize: '14px',
                      fontWeight: 600,
                      color: TOKENS.text,
                      textAlign: 'left',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span>{section.title}</span>
                    <Plus size={18} color={TOKENS.text} strokeWidth={2} aria-hidden />
                  </button>
                ) : (
                  <div
                    style={{
                      border: `1px solid ${TOKENS.sectionTeal}`,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: TOKENS.surface,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: TOKENS.sectionTeal,
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: F,
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        textAlign: 'left',
                        boxSizing: 'border-box',
                        borderRadius: '5px 5px 0 0',
                      }}
                    >
                      <span>{section.title}</span>
                      <Minus size={18} color="#FFFFFF" strokeWidth={2} aria-hidden />
                    </button>
                    <div
                      style={{
                        padding: '14px 16px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        background: TOKENS.surface,
                      }}
                    >
                      {section.items.map((label, i) => {
                        const key = `${section.id}-${i}`;
                        const checked = selections[key] ?? false;
                        return (
                          <label
                            key={key}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: TOKENS.text,
                              fontFamily: F,
                              lineHeight: 1.45,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleOption(key)}
                              style={{
                                position: 'absolute',
                                opacity: 0,
                                width: 0,
                                height: 0,
                              }}
                            />
                            <span
                              aria-hidden
                              style={{
                                width: 18,
                                height: 18,
                                minWidth: 18,
                                marginTop: 2,
                                borderRadius: 4,
                                border: `2px solid ${checked ? TOKENS.sectionTeal : TOKENS.borderInput}`,
                                background: checked ? TOKENS.sectionTeal : TOKENS.surface,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxSizing: 'border-box',
                              }}
                            >
                              {checked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                            </span>
                            <span>{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            padding: '14px 22px 18px',
            borderTop: `1px solid ${TOKENS.headerRule}`,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              height: 36,
              padding: '0 18px',
              background: TOKENS.surface,
              color: TOKENS.text,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: F,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              height: 36,
              padding: '0 18px',
              background: TOKENS.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: F,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = TOKENS.primaryHover;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = TOKENS.primary;
            }}
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
