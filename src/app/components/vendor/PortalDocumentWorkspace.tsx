import { useState, type CSSProperties } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Search,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { DocumentLineItemsTable } from '../document-line-items/DocumentLineItemsTable';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import {
  formatPortalCurrency,
  getPortalSectionLabel,
  sumLineQty,
  sumLineTotal,
  type PortalDocument,
  type PortalHistoryEntry,
  type PortalLineItem,
} from '../../data/vendorPortal';

const N = {
  text: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  border: '#E4E7EC',
  borderLight: '#EEF1F5',
  surface: '#FAFBFC',
  white: '#FFFFFF',
  ink: '#0F172A',
} as const;

const LIST_WIDTH = 280;
const DRAWER_WIDTH = 340;

export type PortalDrawerMode = 'closed' | 'history';
type DetailTab = 'items' | 'preview';

const SECTION_STATUS: Record<
  'rfq' | 'po',
  { label: string; bg: string; text: string; border: string }
> = {
  rfq: { label: 'Awaiting quote', bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  po: { label: 'Confirmed order', bg: '#ECFAF5', text: P2P_BRAND.primaryStrong, border: P2P_BRAND.surfaceBorder },
};

const SECTION_FILTER_LABEL: Record<'rfq' | 'po', string> = {
  rfq: 'RFQs',
  po: 'Purchase Orders',
};

function StatusBadge({ section }: { section: 'rfq' | 'po' }) {
  const tone = SECTION_STATUS[section];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 600,
        background: tone.bg,
        color: tone.text,
        border: `1px solid ${tone.border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        fontFamily: F,
      }}
    >
      {tone.label}
    </span>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: N.faint,
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: N.text, lineHeight: 1.35 }}>{value}</div>
    </div>
  );
}

function TotalsRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: N.muted, fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontSize: strong ? 14 : 12,
          fontWeight: strong ? 700 : 600,
          color: strong ? N.ink : N.text,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

type PortalDocumentListPanelProps = {
  section: 'rfq' | 'po';
  documents: PortalDocument[];
  activeDocId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
};

export function PortalWorkspaceListPanel({
  section,
  documents,
  activeDocId,
  search,
  onSearchChange,
  onSelect,
}: PortalDocumentListPanelProps) {
  return (
    <aside
      style={{
        width: LIST_WIDTH,
        background: N.white,
        borderRight: `1px solid ${N.border}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '14px', borderBottom: `1px solid ${N.border}` }}>
        <label style={{ display: 'block', fontSize: '11px', color: N.muted, marginBottom: '6px' }}>
          Filter Elements
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            border: `1px solid ${N.border}`,
            borderRadius: '8px',
            fontSize: '13px',
            color: N.text,
            background: N.surface,
            fontFamily: F,
          }}
        >
          {SECTION_FILTER_LABEL[section]}
          <ChevronDown size={14} color={N.faint} aria-hidden />
        </div>
      </div>

      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${N.border}` }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            color={N.faint}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search here..."
            aria-label={`Search ${getPortalSectionLabel(section).toLowerCase()}s`}
            style={{
              width: '100%',
              height: 34,
              padding: '0 10px 0 32px',
              border: `1px solid ${N.border}`,
              borderRadius: 8,
              fontSize: 12,
              fontFamily: F,
              color: N.text,
              background: N.surface,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {documents.length === 0 ? (
          <p style={{ padding: '16px 14px', fontSize: 12, color: N.faint, margin: 0 }}>
            No {getPortalSectionLabel(section).toLowerCase()} records found.
          </p>
        ) : (
          documents.map((doc) => {
            const selected = activeDocId === doc.id;
            const total = sumLineTotal(doc.lineItems);
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelect(doc.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: 'none',
                  borderBottom: `1px solid ${N.borderLight}`,
                  background: selected ? P2P_BRAND.surface : N.white,
                  cursor: 'pointer',
                  fontFamily: F,
                  boxShadow: selected ? `inset 3px 0 0 ${P2P_BRAND.primary}` : 'none',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.background = N.surface;
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.background = N.white;
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: N.text, lineHeight: 1.35, minWidth: 0 }}>
                    {doc.documentNumber}
                  </div>
                  <StatusBadge section={section} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: N.ink, marginBottom: 2 }}>
                  ${formatPortalCurrency(total)}
                </div>
                <div style={{ fontSize: 11, color: N.muted }}>{doc.listTimestamp}</div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

type PortalWorkspaceDetailProps = {
  doc: PortalDocument;
  vendorName: string;
  drawerMode: PortalDrawerMode;
  onOpenHistory: () => void;
  onUpdateLine: (lineId: string, patch: Partial<PortalLineItem>) => void;
};

export function PortalWorkspaceDetailView({
  doc,
  vendorName,
  drawerMode,
  onOpenHistory,
  onUpdateLine,
}: PortalWorkspaceDetailProps) {
  const [tab, setTab] = useState<DetailTab>('items');
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const section = doc.type === 'invoice' ? 'po' : doc.type;
  const sectionLabel = getPortalSectionLabel(doc.type);
  const lineTotal = sumLineTotal(doc.lineItems);
  const totalQty = sumLineQty(doc.lineItems);
  const priceEditable = doc.type === 'rfq';
  const historyOpen = drawerMode === 'history';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, background: N.white }}>
      <div
        style={{
          padding: '16px 20px 14px',
          borderBottom: `1px solid ${N.borderLight}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: detailsExpanded ? 14 : 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: N.ink,
                  letterSpacing: '-0.01em',
                  fontFamily: F,
                }}
              >
                {sectionLabel} {doc.documentNumber}
              </h1>
              <StatusBadge section={section} />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: N.muted, fontFamily: F }}>
              {detailsExpanded
                ? doc.organization
                : `${doc.organization} · $${formatPortalCurrency(lineTotal)}`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setDetailsExpanded((prev) => !prev)}
              aria-expanded={detailsExpanded}
              aria-label={detailsExpanded ? 'Collapse document details' : 'Expand document details'}
              title={detailsExpanded ? 'Collapse details' : 'Expand details'}
              style={collapseToggleStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = N.surface;
                e.currentTarget.style.borderColor = '#D0D5DD';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = N.white;
                e.currentTarget.style.borderColor = N.border;
              }}
            >
              {detailsExpanded ? (
                <ChevronUp size={14} color="#667085" strokeWidth={1.8} aria-hidden />
              ) : (
                <ChevronDown size={14} color="#667085" strokeWidth={1.8} aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={onOpenHistory}
              aria-expanded={historyOpen}
              aria-label={historyOpen ? 'Close history' : 'Open history'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 10px',
                border: `1px solid ${historyOpen ? P2P_BRAND.surfaceBorder : N.border}`,
                borderRadius: 6,
                background: historyOpen ? P2P_BRAND.surface : N.white,
                color: historyOpen ? P2P_BRAND.primaryStrong : N.muted,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: F,
                flexShrink: 0,
              }}
            >
              <Clock size={13} aria-hidden />
              History
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {detailsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr auto',
                  gap: 20,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: N.surface,
                  border: `1px solid ${N.borderLight}`,
                  fontFamily: F,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px' }}>
                  <MetaField label="Organization" value={doc.organization} />
                  <MetaField label="Contact" value={doc.contact || `${vendorName} vendor admin`} />
                  <MetaField label="Document date" value={doc.date} />
                  <MetaField label="Document #" value={doc.documentNumber} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  <MetaField
                    label="Primary delivery"
                    value={doc.lineItems[0]?.deliveryLocation ?? '—'}
                  />
                  <MetaField
                    label="Shipping method"
                    value={doc.lineItems[0]?.shippingMethod ?? '—'}
                  />
                  <MetaField label="Required by" value={doc.lineItems[0]?.requiredBy ?? '—'} />
                </div>
                <div
                  style={{
                    minWidth: 140,
                    paddingLeft: 18,
                    borderLeft: `1px solid ${N.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <TotalsRow label="Lines" value={String(doc.lineItems.length)} />
                  <TotalsRow label="Qty" value={String(totalQty)} />
                  <TotalsRow label="Total" value={`$${formatPortalCurrency(lineTotal)}`} strong />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: '0 20px', borderBottom: `1px solid ${N.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(
            [
              { id: 'items', label: 'Item Details' },
              { id: 'preview', label: `${sectionLabel} Preview` },
            ] as const
          ).map((entry) => {
            const active = tab === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                style={{
                  padding: '11px 14px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? P2P_BRAND.primaryStrong : N.muted,
                  borderBottom: active ? `2px solid ${P2P_BRAND.primary}` : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '0 20px 20px', fontFamily: F }}>
        {tab === 'items' ? (
          <DocumentLineItemsTable
            items={doc.lineItems.map((item) => ({
              id: item.id,
              description: item.description,
              type: doc.type === 'rfq' ? 'Quote' : 'Goods',
              quantity: item.qty,
              unitCost: item.unitPrice,
              uom: item.uom || 'Each',
              vendor: vendorName,
              deliveryLocation: item.deliveryLocation,
              shippingMethod: item.shippingMethod,
              requiredBy: item.requiredBy,
              partNumber: item.partNumber,
              taxAmount: item.tax,
              glAccount: doc.type === 'po' ? '6100 - Computer Equipment' : undefined,
              project: doc.type === 'po' ? 'Project A - Operations' : undefined,
              vendorTerms: doc.type === 'po' ? 'Net 30' : undefined,
            }))}
            priceEditable={priceEditable}
            onUpdateItem={
              priceEditable
                ? (id, patch) => {
                    onUpdateLine(id, {
                      ...(patch.unitCost !== undefined ? { unitPrice: patch.unitCost } : {}),
                      ...(patch.quantity !== undefined ? { qty: patch.quantity } : {}),
                      ...(patch.description !== undefined ? { description: patch.description } : {}),
                      ...(patch.partNumber !== undefined ? { partNumber: patch.partNumber } : {}),
                      ...(patch.deliveryLocation !== undefined
                        ? { deliveryLocation: patch.deliveryLocation }
                        : {}),
                      ...(patch.shippingMethod !== undefined
                        ? { shippingMethod: patch.shippingMethod }
                        : {}),
                      ...(patch.requiredBy !== undefined ? { requiredBy: patch.requiredBy } : {}),
                      ...(patch.uom !== undefined ? { uom: patch.uom } : {}),
                      ...(patch.taxAmount !== undefined ? { tax: patch.taxAmount } : {}),
                    });
                  }
                : undefined
            }
          />
        ) : (
          <div style={{ paddingTop: 16 }}>
            <DocumentPreview doc={doc} vendorName={vendorName} lineTotal={lineTotal} />
          </div>
        )}
      </div>
    </div>
  );
}

const collapseToggleStyle: CSSProperties = {
  width: 32,
  height: 32,
  border: `1px solid ${N.border}`,
  borderRadius: 6,
  background: N.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.15s, border-color 0.15s',
  padding: 0,
  flexShrink: 0,
};

function DocumentPreview({
  doc,
  vendorName,
  lineTotal,
}: {
  doc: PortalDocument;
  vendorName: string;
  lineTotal: number;
}) {
  const sectionLabel = getPortalSectionLabel(doc.type);
  return (
    <div
      style={{
        border: `1px solid ${N.border}`,
        borderRadius: 10,
        background: N.white,
        padding: 28,
        maxWidth: 720,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: P2P_BRAND.surface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FileText size={18} color={P2P_BRAND.primaryStrong} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: N.ink }}>{sectionLabel} Preview</div>
          <div style={{ fontSize: 12, color: N.muted }}>{doc.documentNumber}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <MetaField label="Vendor" value={vendorName} />
        <MetaField label="Organization" value={doc.organization} />
        <MetaField label="Contact" value={doc.contact} />
        <MetaField label="Date" value={doc.date} />
      </div>
      <div style={{ borderTop: `1px solid ${N.borderLight}`, paddingTop: 14 }}>
        {doc.lineItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              padding: '10px 0',
              borderBottom: `1px solid ${N.borderLight}`,
              fontSize: 13,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: N.text }}>{item.description}</div>
              <div style={{ fontSize: 12, color: N.muted }}>
                Qty {item.qty.toFixed(2)} · {item.deliveryLocation}
              </div>
            </div>
            <div style={{ fontWeight: 600, color: N.ink, whiteSpace: 'nowrap' }}>
              ${formatPortalCurrency(item.qty * item.unitPrice)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, textAlign: 'right', fontSize: 15, fontWeight: 700, color: N.ink }}>
        Total ${formatPortalCurrency(lineTotal)}
      </div>
    </div>
  );
}

type PortalContextualDrawerProps = {
  doc: PortalDocument;
  onClose: () => void;
};

export function PortalContextualDrawer({ doc, onClose }: PortalContextualDrawerProps) {
  return (
    <>
      <aside
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          background: N.white,
          borderLeft: `1px solid ${N.border}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 25,
          boxShadow: '-4px 0 16px rgba(16,24,40,0.08)',
          fontFamily: F,
        }}
        aria-label="History"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: `1px solid ${N.border}`,
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: N.ink }}>History</div>
            <div style={{ fontSize: 11, color: N.faint, marginTop: 2 }}>
              {doc.history.length} {doc.history.length === 1 ? 'entry' : 'entries'}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close drawer"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: `1px solid ${N.border}`,
              background: N.white,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: N.muted,
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <HistoryFeed entries={doc.history} />
        </div>
      </aside>

      <button
        type="button"
        aria-label="Close drawer overlay"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(16,24,40,0.12)',
          border: 'none',
          zIndex: 20,
          cursor: 'default',
        }}
      />
    </>
  );
}

function HistoryFeed({ entries }: { entries: PortalHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p style={{ padding: 16, fontSize: 12, color: N.faint, margin: 0 }}>No history yet.</p>;
  }

  return (
    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map((entry) => (
        <div
          key={entry.id}
          style={{
            padding: 12,
            borderRadius: 8,
            border: `1px solid ${N.borderLight}`,
            background: N.white,
          }}
        >
          <div style={{ fontSize: 12, lineHeight: 1.45, color: N.muted }}>
            <strong style={{ color: N.text }}>{entry.actor}</strong>
            {': '}
            {entry.action}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: N.faint }}>{entry.timestamp}</div>
        </div>
      ))}
    </div>
  );
}

export function PortalWorkspaceEmpty({ section }: { section: 'rfq' | 'po' }) {
  const label = getPortalSectionLabel(section);
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        color: N.muted,
        textAlign: 'center',
        fontFamily: F,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: N.surface,
          border: `1px solid ${N.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Search size={18} color={N.faint} aria-hidden />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: N.text, margin: '0 0 4px' }}>
        No {label.toLowerCase()} records
      </p>
      <p style={{ fontSize: 13, color: N.muted, margin: 0, maxWidth: 280, lineHeight: 1.5 }}>
        Records will appear here when they are available for this vendor.
      </p>
    </div>
  );
}
