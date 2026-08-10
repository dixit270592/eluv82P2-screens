import { useMemo, useState, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  Search,
  X,
  Paperclip,
  Pencil,
  FileText,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import {
  DocumentLineItemsTable,
  type DocumentLineItemView,
} from '../../components/document-line-items/DocumentLineItemsTable';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import {
  createSeedPurchaseOrders,
  formatPoMoney,
  PO_STATUS_META,
  type PoHistoryEntry,
  type PurchaseOrder,
} from '../../data/purchaseOrders';

const N = {
  text: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  border: '#E4E7EC',
  borderLight: '#EEF1F5',
  surface: '#FAFBFC',
  white: '#FFFFFF',
  page: '#F5F7FA',
  ink: '#0F172A',
} as const;

const LIST_WIDTH = 280;
const DRAWER_WIDTH = 340;

type DrawerMode = 'closed' | 'history';
type DetailTab = 'items' | 'preview';

function StatusBadge({ status }: { status: PurchaseOrder['status'] }) {
  const tone = PO_STATUS_META[status];
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

function PoListPanel({
  orders,
  selectedId,
  search,
  onSearchChange,
  onSelect,
}: {
  orders: PurchaseOrder[];
  selectedId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
}) {
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
          Purchase Orders
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
            aria-label="Search purchase orders"
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
        {orders.length === 0 ? (
          <p style={{ padding: '16px 14px', fontSize: 12, color: N.faint, margin: 0 }}>
            No purchase orders found.
          </p>
        ) : (
          orders.map((po) => {
            const selected = selectedId === po.id;
            return (
              <button
                key={po.id}
                type="button"
                onClick={() => onSelect(po.id)}
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
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: N.text,
                      lineHeight: 1.35,
                      minWidth: 0,
                    }}
                  >
                    {po.description}
                  </div>
                  <StatusBadge status={po.status} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: N.ink, marginBottom: 2 }}>
                  {formatPoMoney(po.total, po.currencyPrefix)}
                </div>
                <div style={{ fontSize: 11, color: N.muted }}>{po.department}</div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

function PoPreview({ po }: { po: PurchaseOrder }) {
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
          <div style={{ fontSize: 15, fontWeight: 700, color: N.ink }}>Purchase Order Preview</div>
          <div style={{ fontSize: 12, color: N.muted }}>{po.poNumber}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <MetaField label="Vendor" value={po.vendor} />
        <MetaField label="Department" value={po.department} />
        <MetaField label="Ship to" value={po.deliveryLocation} />
        <MetaField label="Shipping" value={po.shippingMethod} />
      </div>
      <div style={{ borderTop: `1px solid ${N.borderLight}`, paddingTop: 14 }}>
        {po.items.map((item) => (
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
              <div style={{ fontWeight: 600, color: N.text }}>{item.name}</div>
              <div style={{ fontSize: 12, color: N.muted }}>
                Qty {item.quantity.toFixed(2)} · {item.uom}
              </div>
            </div>
            <div style={{ fontWeight: 600, color: N.ink, whiteSpace: 'nowrap' }}>
              {formatPoMoney(item.quantity * item.cost, po.currencyPrefix)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ fontSize: 12, color: N.muted }}>
          Sub Total {formatPoMoney(po.subTotal, po.currencyPrefix)}
        </div>
        <div style={{ fontSize: 12, color: N.muted }}>Tax {formatPoMoney(po.tax, po.currencyPrefix)}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: N.ink }}>
          Total {formatPoMoney(po.total, po.currencyPrefix)}
        </div>
      </div>
    </div>
  );
}

function ContextualDrawer({ po, onClose }: { po: PurchaseOrder; onClose: () => void }) {
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
              {po.history.length} {po.history.length === 1 ? 'entry' : 'entries'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconGhostButton label="Attachments" icon={<Paperclip size={14} />} />
            <IconGhostButton label="Add note" icon={<Pencil size={14} />} />
            <IconGhostButton label="Close drawer" icon={<X size={15} />} onClick={onClose} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <HistoryFeed entries={po.history} />
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

function IconGhostButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
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
      {icon}
    </button>
  );
}

function HistoryFeed({ entries }: { entries: PoHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p style={{ padding: 16, fontSize: 12, color: N.faint, margin: 0 }}>No history yet.</p>;
  }

  return (
    <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map((entry) => (
        <div
          key={entry.id}
          style={{
            padding: '12px',
            borderRadius: 8,
            border: `1px solid ${entry.kind === 'note' ? '#FDE68A' : N.borderLight}`,
            background: entry.kind === 'note' ? '#FFFBEB' : N.white,
          }}
        >
          <div style={{ fontSize: 12, lineHeight: 1.45, color: N.muted }}>
            <strong style={{ color: N.text }}>{entry.actor}</strong>
            {': '}
            {entry.action}
          </div>
          {entry.detail && (
            <div style={{ marginTop: 6, fontSize: 12, color: N.text, lineHeight: 1.4 }}>{entry.detail}</div>
          )}
          <div style={{ marginTop: 6, fontSize: 11, color: N.faint }}>{entry.timestamp}</div>
        </div>
      ))}
    </div>
  );
}

export function PurchaseOrdersWorkspace() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => createSeedPurchaseOrders());
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>('po-288');
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('closed');
  const [tab, setTab] = useState<DetailTab>('items');
  const [toast, setToast] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (po) =>
        po.poNumber.toLowerCase().includes(q) ||
        po.description.toLowerCase().includes(q) ||
        po.vendor.toLowerCase().includes(q) ||
        po.department.toLowerCase().includes(q) ||
        PO_STATUS_META[po.status].label.toLowerCase().includes(q),
    );
  }, [orders, search]);

  const activePo = useMemo(() => {
    const fallback = filtered[0] ?? orders[0] ?? null;
    if (!selectedId) return fallback;
    return filtered.find((po) => po.id === selectedId) ?? fallback;
  }, [filtered, orders, selectedId]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const selectPo = (id: string) => {
    setSelectedId(id);
    setDrawerMode('closed');
    setTab('items');
  };

  const openHistory = () => {
    setDrawerMode((prev) => (prev === 'history' ? 'closed' : 'history'));
  };

  const closeDrawer = () => {
    setDrawerMode('closed');
  };

  const runPrimaryAction = () => {
    if (!activePo) return;
    const label = PO_STATUS_META[activePo.status].cta;
    showToast(`${label} — ${activePo.poNumber}`);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: N.page,
        fontFamily: F,
        overflow: 'hidden',
      }}
    >
      <SkipToMainContent />
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopHeader />

        <section
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            position: 'relative',
            background: N.white,
            borderTop: `1px solid ${N.border}`,
            overflow: 'hidden',
          }}
        >
          <PoListPanel
            orders={filtered}
            selectedId={activePo?.id ?? null}
            search={search}
            onSearchChange={setSearch}
            onSelect={selectPo}
          />

          <main
            id="main-content"
            tabIndex={-1}
            style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: N.white }}
          >
            {!activePo ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: N.faint,
                  fontSize: 13,
                }}
              >
                Select a purchase order to review.
              </div>
            ) : (
              <>
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
                          }}
                        >
                          Purchase Order {activePo.poNumber}
                        </h1>
                        <StatusBadge status={activePo.status} />
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: N.muted }}>
                        {detailsExpanded
                          ? activePo.description
                          : `${activePo.description} · ${formatPoMoney(activePo.total, activePo.currencyPrefix)}`}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => setDetailsExpanded((prev) => !prev)}
                        aria-expanded={detailsExpanded}
                        aria-label={detailsExpanded ? 'Collapse document details' : 'Expand document details'}
                        title={detailsExpanded ? 'Collapse details' : 'Expand details'}
                        style={{
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
                        }}
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
                        onClick={openHistory}
                        aria-expanded={drawerMode === 'history'}
                        aria-label={drawerMode === 'history' ? 'Close history' : 'Open history'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '6px 10px',
                          border: `1px solid ${drawerMode === 'history' ? P2P_BRAND.surfaceBorder : N.border}`,
                          borderRadius: 6,
                          background: drawerMode === 'history' ? P2P_BRAND.surface : N.white,
                          color: drawerMode === 'history' ? P2P_BRAND.primaryStrong : N.muted,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: F,
                        }}
                      >
                        <Clock size={13} aria-hidden />
                        History
                      </button>
                      <button
                        type="button"
                        aria-label="More actions"
                        style={{
                          width: 32,
                          height: 32,
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
                        <MoreHorizontal size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={runPrimaryAction}
                        style={{
                          height: 32,
                          padding: '0 14px',
                          borderRadius: 6,
                          border: 'none',
                          background: P2P_BRAND.primary,
                          color: N.white,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: F,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = P2P_BRAND.primaryHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = P2P_BRAND.primary;
                        }}
                      >
                        {PO_STATUS_META[activePo.status].cta}
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
                          }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 18px' }}>
                            <MetaField label="Description" value={activePo.description} />
                            <MetaField label="Vendor" value={activePo.vendor} />
                            <MetaField label="Required By" value={activePo.requiredBy} />
                            <MetaField label="PO Number" value={activePo.poNumber} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                            <MetaField label="Department / Location" value={activePo.department} />
                            <MetaField label="Delivery Location" value={activePo.deliveryLocation} />
                            <MetaField label="Shipping Method" value={activePo.shippingMethod} />
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
                            <TotalsRow
                              label="Sub Total"
                              value={formatPoMoney(activePo.subTotal, activePo.currencyPrefix)}
                            />
                            <TotalsRow label="Tax" value={formatPoMoney(activePo.tax, activePo.currencyPrefix)} />
                            <TotalsRow
                              label="Total"
                              value={formatPoMoney(activePo.total, activePo.currencyPrefix)}
                              strong
                            />
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
                        { id: 'preview', label: 'PO Preview' },
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

                <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '0 20px 20px' }}>
                  {tab === 'items' ? (
                    <DocumentLineItemsTable
                      items={activePo.items.map(
                        (item): DocumentLineItemView => ({
                          id: item.id,
                          description: item.description || item.name,
                          type: item.type,
                          quantity: item.quantity,
                          unitCost: item.cost,
                          uom: item.uom,
                          vendor: item.vendor,
                          vendorTerms: item.vendorTerms,
                          requiredBy: item.requiredBy,
                          glAccount: item.glAccount,
                          project: item.project,
                          taxGroup: item.taxGroup,
                          taxAmount: item.taxAmount,
                        }),
                      )}
                      currencyPrefix={activePo.currencyPrefix}
                      onUpdateItem={(id, patch) => {
                        setOrders((prev) =>
                          prev.map((po) => {
                            if (po.id !== activePo.id) return po;
                            const items = po.items.map((item) => {
                              if (item.id !== id) return item;
                              return {
                                ...item,
                                ...(patch.unitCost !== undefined ? { cost: patch.unitCost } : {}),
                                ...(patch.description !== undefined ? { description: patch.description } : {}),
                                ...(patch.quantity !== undefined ? { quantity: patch.quantity } : {}),
                                ...(patch.vendor !== undefined ? { vendor: patch.vendor } : {}),
                                ...(patch.vendorTerms !== undefined ? { vendorTerms: patch.vendorTerms } : {}),
                                ...(patch.requiredBy !== undefined ? { requiredBy: patch.requiredBy } : {}),
                                ...(patch.uom !== undefined ? { uom: patch.uom } : {}),
                                ...(patch.taxGroup !== undefined ? { taxGroup: patch.taxGroup } : {}),
                                ...(patch.taxAmount !== undefined ? { taxAmount: patch.taxAmount } : {}),
                                ...(patch.glAccount !== undefined ? { glAccount: patch.glAccount } : {}),
                                ...(patch.project !== undefined ? { project: patch.project } : {}),
                              };
                            });
                            const subTotal = items.reduce((sum, item) => sum + item.quantity * item.cost, 0);
                            const tax = items.reduce((sum, item) => sum + item.taxAmount, 0);
                            return { ...po, items, subTotal, tax, total: subTotal + tax };
                          }),
                        );
                      }}
                    />
                  ) : (
                    <div style={{ paddingTop: 16 }}>
                      <PoPreview po={activePo} />
                    </div>
                  )}
                </div>
              </>
            )}
          </main>

          {drawerMode === 'history' && activePo && (
            <ContextualDrawer po={activePo} onClose={closeDrawer} />
          )}
        </section>
      </div>

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            padding: '10px 16px',
            borderRadius: 8,
            background: N.ink,
            color: N.white,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: F,
            boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
          }}
        >
          {toast}
        </div>
      )}
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
