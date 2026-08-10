import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  Edit3,
  ExternalLink,
  Layers,
  Maximize2,
  Minimize2,
  Search,
  X,
} from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { LINE_ITEM_CHECKBOX_CLASS } from '../pr-line-items/lineItemSelectionStyles';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

export type DocumentLineItemView = {
  id: string;
  description: string;
  type?: string;
  quantity: number;
  unitCost: number;
  uom?: string;
  vendor?: string;
  vendorTerms?: string;
  requiredBy?: string;
  glAccount?: string;
  project?: string;
  taxGroup?: string;
  taxAmount?: number;
  deliveryLocation?: string;
  shippingMethod?: string;
  partNumber?: string;
};

export type DocumentLineItemsTableProps = {
  items: DocumentLineItemView[];
  currencyPrefix?: string;
  /** When true, unit cost + part number are editable in the expanded panel. */
  priceEditable?: boolean;
  hint?: string;
  onUpdateItem?: (id: string, patch: Partial<DocumentLineItemView>) => void;
  onEditItem?: (id: string) => void;
};

function formatMoney(amount: number, prefix = '$') {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return prefix === 'Rs.' ? `${prefix} ${formatted}` : `${prefix}${formatted}`;
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={expandedFieldLabelStyle}>{label}</div>
      <div style={expandedFieldValueStyle}>{children}</div>
    </div>
  );
}

export function DocumentLineItemsTable({
  items,
  currencyPrefix = '$',
  priceEditable = false,
  hint = 'Expand a row to view details · Edit icon to change fields · Search inventory when adding or editing a row',
  onUpdateItem,
  onEditItem,
}: DocumentLineItemsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = [
        item.description,
        item.vendor,
        item.type,
        item.glAccount,
        item.partNumber,
        item.deliveryLocation,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, searchQuery]);

  useEffect(() => {
    if (!showViewMenu) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!viewMenuRef.current?.contains(event.target as Node)) {
        setShowViewMenu(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [showViewMenu]);

  useEffect(() => {
    if (!focusMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocusMode(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [focusMode]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(filteredItems.map((item) => item.id)));
  const collapseAll = () => setExpandedIds(new Set());

  const allVisibleSelected =
    filteredItems.length > 0 && filteredItems.every((item) => selectedIds.has(item.id));
  const someVisibleSelected = filteredItems.some((item) => selectedIds.has(item.id));

  const toggleSelectAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredItems.forEach((item) => {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      });
      return next;
    });
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const subtotalAll = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const taxTotal = items.reduce((sum, item) => sum + (item.taxAmount ?? 0), 0);
  const colCount = 8;

  const shell = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: 1,
        background: '#FFFFFF',
        border: focusMode ? 'none' : '1px solid #E4E7EC',
        borderRadius: focusMode ? 0 : 10,
        overflow: 'hidden',
        fontFamily: F,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 14px',
          borderBottom: '1px solid #EEF1F5',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 34,
            padding: '0 12px',
            border: '1px solid #E4E7EC',
            borderRadius: 6,
            background: '#F9FAFB',
            flex: '1 1 180px',
            maxWidth: 260,
          }}
        >
          <Search size={13} color="#98A2B3" strokeWidth={2} aria-hidden />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search here..."
            aria-label="Search line items"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 13,
              color: '#101828',
              fontFamily: F,
              outline: 'none',
              flex: 1,
              minWidth: 0,
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              aria-label="Clear search"
            >
              <X size={12} color="#98A2B3" />
            </button>
          )}
        </div>

        {filteredItems.length > 1 && (
          <div ref={viewMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowViewMenu((v) => !v)}
              style={secondaryButtonStyle}
              aria-expanded={showViewMenu}
              aria-haspopup="menu"
            >
              Row details
              <ChevronDown size={13} strokeWidth={2} aria-hidden />
            </button>
            <AnimatePresence>
              {showViewMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  role="menu"
                  style={viewMenuStyle}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      expandAll();
                      setShowViewMenu(false);
                    }}
                    style={viewMenuItemStyle}
                  >
                    Expand all rows
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      collapseAll();
                      setShowViewMenu(false);
                    }}
                    style={viewMenuItemStyle}
                  >
                    Collapse all rows
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <button
          type="button"
          onClick={() => setFocusMode((v) => !v)}
          style={secondaryButtonStyle}
          title={focusMode ? 'Exit focus mode' : 'Open focus mode'}
          aria-label={focusMode ? 'Exit focus mode' : 'Open focus mode'}
        >
          {focusMode ? (
            <Minimize2 size={13} strokeWidth={2} aria-hidden />
          ) : (
            <Maximize2 size={13} strokeWidth={2} aria-hidden />
          )}
          {focusMode ? 'Exit focus' : 'Focus mode'}
        </button>
      </div>

      {hint && (
        <div style={interactionHintBarStyle}>{hint}</div>
      )}

      <div
        style={{
          overflowX: 'auto',
          flex: focusMode ? 1 : undefined,
          overflowY: focusMode ? 'auto' : undefined,
        }}
      >
        <table
          role="table"
          aria-label="Line items"
          style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}
        >
          <thead>
            <tr
              style={{
                background: '#F9FAFB',
                borderBottom: '1px solid #E4E7EC',
                position: focusMode ? 'sticky' : undefined,
                top: focusMode ? 0 : undefined,
                zIndex: focusMode ? 2 : undefined,
              }}
            >
              <th style={{ width: 44, padding: '10px 8px 10px 14px' }}>
                <Checkbox
                  checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                  onCheckedChange={(c) => toggleSelectAllVisible(c === true)}
                  aria-label="Select all line items"
                  className={LINE_ITEM_CHECKBOX_CLASS}
                />
              </th>
              <th style={{ width: 40, padding: '10px 8px 10px 0' }} />
              <th style={{ ...thStyle, width: 40 }}>#</th>
              <th style={{ ...thStyle, minWidth: 180 }}>Description</th>
              <th style={{ ...thStyle, width: 64 }}>Qty</th>
              <th style={{ ...thStyle, width: 100 }}>Unit cost</th>
              <th style={{ ...thStyle, width: 104 }}>Subtotal</th>
              <th
                style={{
                  minWidth: 148,
                  padding: '10px 14px',
                  position: 'sticky',
                  right: 0,
                  background: '#F9FAFB',
                  zIndex: 1,
                }}
              >
                <span style={{ ...thStyle, padding: 0 }}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={colCount} style={{ padding: 28, textAlign: 'center', color: '#98A2B3', fontSize: 13 }}>
                  {searchQuery ? 'No line items match your search.' : 'No line items yet.'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => {
                const isExpanded = expandedIds.has(item.id);
                const isRowSelected = selectedIds.has(item.id);
                const subtotal = item.quantity * item.unitCost;
                const glCode = item.glAccount?.split(' - ')[0] ?? item.glAccount;
                const rowBg =
                  isRowSelected || isExpanded || hoveredRow === item.id ? '#FAFBFC' : '#FFFFFF';

                return (
                  <Fragment key={item.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        borderBottom: isExpanded ? 'none' : '1px solid #F2F4F7',
                        background: rowBg,
                        boxShadow:
                          isExpanded || hoveredRow === item.id
                            ? `inset 2px 0 0 ${P2P_BRAND.primary}`
                            : isRowSelected
                              ? 'inset 2px 0 0 #E4E7EC'
                              : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.1s, box-shadow 0.1s',
                      }}
                      onMouseEnter={() => setHoveredRow(item.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td
                        style={{ padding: '12px 8px 12px 14px', width: 44 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isRowSelected}
                          onCheckedChange={(c) => toggleSelectRow(item.id, c === true)}
                          aria-label={`Select line item ${index + 1}`}
                          className={LINE_ITEM_CHECKBOX_CLASS}
                        />
                      </td>
                      <td style={{ padding: '12px 8px 12px 0', width: 40 }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          aria-expanded={isExpanded}
                          aria-controls={`doc-line-item-detail-${item.id}`}
                          title={isExpanded ? 'Collapse details' : 'View item details'}
                          aria-label={isExpanded ? 'Collapse details' : 'View item details'}
                          style={iconButtonStyle}
                        >
                          {isExpanded ? (
                            <ChevronDown size={15} color="#667085" strokeWidth={2} />
                          ) : (
                            <ChevronRight size={15} color="#667085" strokeWidth={2} />
                          )}
                        </button>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#98A2B3', fontFamily: F }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '12px 14px', maxWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: '#101828',
                                  fontFamily: F,
                                  minWidth: 0,
                                }}
                              >
                                {item.description}
                              </span>
                              {!isExpanded && item.type && <span style={typeChipStyle}>{item.type}</span>}
                              {!isExpanded && item.vendor && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: '#98A2B3',
                                    fontFamily: F,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 120,
                                  }}
                                >
                                  {item.vendor}
                                </span>
                              )}
                            </div>
                            {!isExpanded && (
                              <div style={{ fontSize: 11, color: '#98A2B3', fontFamily: F, marginTop: 3 }}>
                                {item.quantity} {(item.uom || 'each').toLowerCase()}
                                {glCode ? ` · GL ${glCode}` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '12px 14px',
                          fontSize: 13,
                          color: '#101828',
                          fontFamily: F,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {item.quantity}
                      </td>
                      <td
                        style={{
                          padding: '12px 14px',
                          fontSize: 13,
                          color: '#101828',
                          fontFamily: F,
                          fontVariantNumeric: 'tabular-nums',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatMoney(item.unitCost, currencyPrefix)}
                      </td>
                      <td
                        style={{
                          padding: '12px 14px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#101828',
                          fontFamily: F,
                          fontVariantNumeric: 'tabular-nums',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatMoney(subtotal, currencyPrefix)}
                      </td>
                      <td
                        style={{
                          padding: '12px 14px',
                          position: 'sticky',
                          right: 0,
                          background: rowBg,
                          zIndex: 1,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                          <ActionIcon label="Allocations" icon={<Layers size={14} strokeWidth={2} />} />
                          <ActionIcon label="GL / amounts" icon={<DollarSign size={14} strokeWidth={2} />} />
                          <ActionIcon label="Open related" icon={<ExternalLink size={14} strokeWidth={2} />} />
                          <ActionIcon
                            label="Edit item"
                            icon={<Edit3 size={14} strokeWidth={2} />}
                            onClick={() => {
                              if (!expandedIds.has(item.id)) toggleExpand(item.id);
                              onEditItem?.(item.id);
                            }}
                          />
                        </div>
                      </td>
                    </motion.tr>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          key={`${item.id}-details`}
                          id={`doc-line-item-detail-${item.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <td
                            colSpan={colCount}
                            style={{
                              padding: '4px 14px 12px 58px',
                              borderBottom: '1px solid #F2F4F7',
                              background: '#FFFFFF',
                            }}
                          >
                            <div style={expandedDetailBodyStyle}>
                              <div style={expandedDetailGridStyle}>
                                <DetailField label="Description">{item.description}</DetailField>
                                <DetailField label="Type">{item.type || '—'}</DetailField>
                                <DetailField label="Quantity">{item.quantity}</DetailField>
                                <DetailField label="Cost">
                                  {priceEditable ? (
                                    <input
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      value={item.unitCost}
                                      onChange={(e) =>
                                        onUpdateItem?.(item.id, {
                                          unitCost: Number.parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      aria-label={`Unit cost for ${item.description}`}
                                      style={inlineInputStyle}
                                    />
                                  ) : (
                                    formatMoney(item.unitCost, currencyPrefix)
                                  )}
                                </DetailField>
                                <DetailField label="Vendor">{item.vendor || '—'}</DetailField>
                                <DetailField label="Vendor terms">{item.vendorTerms || '—'}</DetailField>
                                <DetailField label="Required by">{item.requiredBy || '—'}</DetailField>
                                <DetailField label="GL account">{item.glAccount || '—'}</DetailField>
                                <DetailField label="Project">{item.project || '—'}</DetailField>
                                {item.uom && <DetailField label="Unit of measure">{item.uom}</DetailField>}
                                {item.taxGroup && <DetailField label="Tax group">{item.taxGroup}</DetailField>}
                                {item.deliveryLocation && (
                                  <DetailField label="Delivery location">{item.deliveryLocation}</DetailField>
                                )}
                                {item.shippingMethod && (
                                  <DetailField label="Shipping method">{item.shippingMethod}</DetailField>
                                )}
                                {(priceEditable || item.partNumber) && (
                                  <DetailField label="Part number">
                                    {priceEditable ? (
                                      <input
                                        type="text"
                                        value={item.partNumber ?? ''}
                                        onChange={(e) =>
                                          onUpdateItem?.(item.id, { partNumber: e.target.value })
                                        }
                                        aria-label={`Part number for ${item.description}`}
                                        placeholder="—"
                                        style={inlineInputStyle}
                                      />
                                    ) : (
                                      item.partNumber || '—'
                                    )}
                                  </DetailField>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {items.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '12px 16px',
            borderTop: '2px solid #E4E7EC',
            background: '#F9FAFB',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#667085', fontFamily: F }}>
              Sub total:{' '}
              <strong style={{ color: '#101828' }}>{formatMoney(subtotalAll, currencyPrefix)}</strong>
            </span>
            {taxTotal > 0 && (
              <span style={{ fontSize: 12, color: '#667085', fontFamily: F }}>
                Tax: <strong style={{ color: '#101828' }}>{formatMoney(taxTotal, currencyPrefix)}</strong>
              </span>
            )}
            <span style={{ fontSize: 14, fontWeight: 700, color: '#101828', fontFamily: F }}>
              Total: {formatMoney(subtotalAll + taxTotal, currencyPrefix)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (!focusMode) return shell;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
      }}
    >
      {shell}
    </div>
  );
}

function ActionIcon({
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
      style={rowQuickActionIconStyle}
    >
      {icon}
    </button>
  );
}

const thStyle: CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: '#667085',
  fontFamily: F,
  letterSpacing: '0.01em',
  whiteSpace: 'nowrap',
};

const secondaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 34,
  padding: '0 10px',
  border: '1px solid #E4E7EC',
  borderRadius: 6,
  background: '#FFFFFF',
  fontSize: 12,
  fontWeight: 600,
  color: '#344054',
  fontFamily: F,
  cursor: 'pointer',
};

const iconButtonStyle: CSSProperties = {
  width: 28,
  height: 28,
  border: 'none',
  borderRadius: 6,
  background: 'transparent',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
};

const rowQuickActionIconStyle: CSSProperties = {
  width: 28,
  height: 28,
  border: '1px solid transparent',
  borderRadius: 6,
  background: 'transparent',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#667085',
  padding: 0,
};

const typeChipStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 10,
  fontWeight: 700,
  color: P2P_BRAND.primaryStrong,
  background: P2P_BRAND.surface,
  border: `1px solid ${P2P_BRAND.surfaceBorder}`,
  borderRadius: 999,
  padding: '2px 7px',
  fontFamily: F,
  whiteSpace: 'nowrap',
};

const interactionHintBarStyle: CSSProperties = {
  padding: '8px 14px',
  fontSize: 11,
  color: '#98A2B3',
  fontFamily: F,
  borderBottom: '1px solid #EEF1F5',
  background: '#FFFFFF',
};

const viewMenuStyle: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  zIndex: 50,
  background: '#FFFFFF',
  border: '1px solid #E4E7EC',
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(16,24,40,0.08)',
  padding: 4,
  minWidth: 160,
};

const viewMenuItemStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  border: 'none',
  borderRadius: 5,
  background: 'transparent',
  fontSize: 12,
  fontWeight: 500,
  color: '#344054',
  fontFamily: F,
  textAlign: 'left',
  cursor: 'pointer',
};

const expandedDetailBodyStyle: CSSProperties = {
  padding: '11px 0 0',
  background: 'transparent',
};

const expandedDetailGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
  gap: '12px 16px',
};

const expandedFieldLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#98A2B3',
  fontFamily: F,
  marginBottom: 3,
};

const expandedFieldValueStyle: CSSProperties = {
  fontSize: 13,
  color: '#101828',
  fontFamily: F,
  fontWeight: 500,
  wordBreak: 'break-word',
};

const inlineInputStyle: CSSProperties = {
  width: '100%',
  maxWidth: 140,
  height: 30,
  padding: '0 8px',
  border: '1px solid #E4E7EC',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: F,
  color: '#101828',
  background: '#FFFFFF',
  boxSizing: 'border-box',
};
