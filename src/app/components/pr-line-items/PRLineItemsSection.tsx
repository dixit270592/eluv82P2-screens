import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit3,
  DollarSign,
  ExternalLink,
  AlertCircle,
  Copy,
  X,
  CheckCircle2,
  Maximize2,
  Minimize2,
  MoreHorizontal,
} from 'lucide-react';
import {
  createDefaultPurchaseRequestOptions,
  type PurchaseRequestOptionsState,
} from '../../data/purchaseRequestOptions';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import { getLineItemFieldDefinitions } from './lineItemFieldConfig';
import { validateLineItemForm, type LineItemFormValues } from './lineItemValidation';
import { LineItemFormModal } from './LineItemFormModal';
import type { PRLineItem } from './types';
import { Checkbox } from '../ui/checkbox';
import { LINE_ITEM_CHECKBOX_CLASS } from './lineItemSelectionStyles';
import { LineItemSelectionBar } from './LineItemSelectionBar';

// ─── Currency ───────────────────────────────────────────────────────────────
export const fmtRs = (n: number) =>
  `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Types ───────────────────────────────────────────────────────────────────
export type PRLineItemsSectionHandle = {
  /** Returns true if any item has errors; auto-scrolls + expands first offender */
  focusFirstError: () => boolean;
  /** Returns count of items with validation errors */
  errorCount: () => number;
};

type InlineEdit = { id: string; field: 'description' | 'quantity' | 'cost' };

type PRLineItemsSectionProps = {
  items: PRLineItem[];
  onChange: (items: PRLineItem[]) => void;
  options?: PurchaseRequestOptionsState;
  disabled?: boolean;
  defaultVendor?: string;
  onOpenGL?: (itemId: string) => void;
  onOpenBudget?: (itemId: string) => void;
  onOpenBudgetReport?: (itemId: string) => void;
  onItemAdded?: (description: string) => void;
  onItemRemoved?: () => void;
  onRequestQuote?: (selectedItemIds: string[]) => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toFormValues(item: PRLineItem): LineItemFormValues {
  return {
    description: item.item,
    type: item.type || 'Goods',
    unitOfMeasure: item.unitOfMeasure || 'Each',
    quantity: item.quantity,
    cost: item.cost,
    requiredBy: item.requiredBy || '',
    vendorTerms: item.vendorTerms || 'Net 15',
    taxGroup: item.taxGroup || '',
    vendor: item.vendor,
    projectAccount: item.projectAccount || '',
    glAccount: item.glAccount,
    glAccountsCount: item.glAccountsCount || 1,
  };
}

function fromFormValues(
  id: string,
  data: LineItemFormValues & {
    glAccounts: Array<{ account: string; name: string; amount: number; percentage: number }>;
  },
): PRLineItem {
  return {
    id,
    item: data.description,
    vendor: data.vendor || '84 Lumber',
    quantity: data.quantity,
    cost: data.cost,
    subtotal: data.quantity * data.cost,
    glAccount:
      data.glAccounts.length > 0
        ? `${data.glAccounts[0].account} - ${data.glAccounts[0].name}`
        : data.glAccount,
    type: data.type,
    unitOfMeasure: data.unitOfMeasure,
    taxGroup: data.taxGroup,
    glAccountsCount: data.glAccounts.length || data.glAccountsCount,
    requiredBy: data.requiredBy,
    vendorTerms: data.vendorTerms,
    projectAccount: data.projectAccount,
  };
}

function useWindowWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

function parseGlAccount(gl: string) {
  const sep = gl.indexOf(' - ');
  if (sep === -1) return { code: gl, name: '' };
  return { code: gl.slice(0, sep), name: gl.slice(sep + 3) };
}

function formatRequiredBy(value?: string) {
  if (!value?.trim()) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return value;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const PRLineItemsSection = forwardRef<PRLineItemsSectionHandle, PRLineItemsSectionProps>(
  function PRLineItemsSection(
    {
      items,
      onChange,
      options = createDefaultPurchaseRequestOptions(),
      disabled = false,
      defaultVendor,
      onOpenGL,
      onOpenBudget,
      onOpenBudgetReport,
      onItemAdded,
      onItemRemoved,
      onRequestQuote,
    },
    ref,
  ) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [formModal, setFormModal] = useState<{ mode: 'add' | 'edit'; itemId?: string } | null>(
      null,
    );
    const [inlineEdit, setInlineEdit] = useState<InlineEdit | null>(null);
    const [inlineValue, setInlineValue] = useState('');
    const [focusMode, setFocusMode] = useState(false);
    const [showViewMenu, setShowViewMenu] = useState(false);
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const viewMenuRef = useRef<HTMLDivElement>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<Map<string, HTMLElement>>(new Map());
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    const fieldDefs = useMemo(() => getLineItemFieldDefinitions(options), [options]);
    const showTax = !options.hideTaxField;

    const getItemErrors = useCallback(
      (item: PRLineItem) => validateLineItemForm(toFormValues(item), options),
      [options],
    );
    const getErrorCount = useCallback(
      (item: PRLineItem) => Object.keys(getItemErrors(item)).length,
      [getItemErrors],
    );

    const filteredItems = useMemo(() => {
      return items.filter((i) => {
        if (searchQuery && !i.item.toLowerCase().includes(searchQuery.toLowerCase()) && !i.vendor.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      });
    }, [items, searchQuery]);

    const visibleItemIds = useMemo(() => filteredItems.map((i) => i.id), [filteredItems]);
    const allVisibleSelected =
      visibleItemIds.length > 0 && visibleItemIds.every((id) => selectedIds.has(id));
    const someVisibleSelected =
      visibleItemIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;

    const toggleSelectRow = (id: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) next.add(id);
        else next.delete(id);
        return next;
      });
    };

    const toggleSelectAllVisible = (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleItemIds.forEach((id) => {
          if (checked) next.add(id);
          else next.delete(id);
        });
        return next;
      });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const bulkDeleteSelected = () => {
      if (selectedIds.size === 0 || disabled) return;
      onChange(items.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
      onItemRemoved?.();
    };

    const requestQuoteForSelected = () => {
      if (selectedIds.size === 0 || !onRequestQuote) return;
      onRequestQuote(Array.from(selectedIds));
      setSelectedIds(new Set());
    };

    const subtotalAll = items.reduce((s, i) => s + i.subtotal, 0);
    const taxTotal = showTax ? items.reduce((s, i) => s + i.subtotal * 0.1, 0) : 0; // demo 10 % rate
    const totalItemErrors = items.reduce((n, i) => n + (getErrorCount(i) > 0 ? 1 : 0), 0);

    // ── Expose imperative handle ──────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      focusFirstError() {
        const first = items.find((i) => getErrorCount(i) > 0);
        if (!first) return false;
        setExpandedIds((prev) => new Set([...prev, first.id]));
        requestAnimationFrame(() => {
          const el = rowRefs.current.get(first.id);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (el?.querySelector('button') as HTMLElement | null)?.focus();
        });
        return true;
      },
      errorCount() {
        return totalItemErrors;
      },
    }));

    // ── Close view / action menus on outside click ────────────────────────────
    useEffect(() => {
      if (!showViewMenu && !openActionMenuId) return;
      const handler = (e: MouseEvent) => {
        if (showViewMenu && viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
          setShowViewMenu(false);
        }
        if (
          openActionMenuId &&
          actionMenuRef.current &&
          !actionMenuRef.current.contains(e.target as Node)
        ) {
          setOpenActionMenuId(null);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [showViewMenu, openActionMenuId]);

    // ── Focus mode: lock body scroll while full-screen ────────────────────────
    useEffect(() => {
      if (!focusMode) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }, [focusMode]);

    // ── Expand/collapse ───────────────────────────────────────────────────────
    const toggleExpand = (id: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const expandAll = () => setExpandedIds(new Set(filteredItems.map((i) => i.id)));
    const collapseAll = () => setExpandedIds(new Set());

    // ── Modal save ────────────────────────────────────────────────────────────
    const handleSaveForm = (
      data: LineItemFormValues & {
        glAccounts: Array<{ account: string; name: string; amount: number; percentage: number }>;
      },
    ) => {
      if (formModal?.mode === 'edit' && formModal.itemId) {
        onChange(items.map((i) => (i.id === formModal.itemId ? fromFormValues(i.id, data) : i)));
      } else {
        const newItem = fromFormValues(Date.now().toString(), data);
        if (!newItem.vendor && defaultVendor) newItem.vendor = defaultVendor;
        onChange([...items, newItem]);
        onItemAdded?.(data.description);
        setExpandedIds((prev) => new Set([...prev, newItem.id]));
      }
      setFormModal(null);
    };

    // ── Inline editing ────────────────────────────────────────────────────────
    const startInline = (id: string, field: InlineEdit['field'], currentVal: string | number) => {
      if (disabled) return;
      setInlineEdit({ id, field });
      setInlineValue(String(currentVal));
    };

    const commitInline = () => {
      if (!inlineEdit) return;
      const { id, field } = inlineEdit;
      onChange(
        items.map((item) => {
          if (item.id !== id) return item;
          if (field === 'description') return { ...item, item: inlineValue };
          if (field === 'quantity') {
            const q = Math.max(0.01, parseFloat(inlineValue) || item.quantity);
            return { ...item, quantity: q, subtotal: q * item.cost };
          }
          if (field === 'cost') {
            const c = Math.max(0, parseFloat(inlineValue) || item.cost);
            return { ...item, cost: c, subtotal: item.quantity * c };
          }
          return item;
        }),
      );
      setInlineEdit(null);
    };

    const cancelInline = () => setInlineEdit(null);
    const isInline = (id: string, field: InlineEdit['field']) =>
      inlineEdit?.id === id && inlineEdit.field === field;

    // ── Duplicate ─────────────────────────────────────────────────────────────
    const duplicateItem = (item: PRLineItem) => {
      const copy: PRLineItem = { ...item, id: Date.now().toString() };
      const idx = items.findIndex((i) => i.id === item.id);
      const next = [...items];
      next.splice(idx + 1, 0, copy);
      onChange(next);
    };

    // ── Shared inline cell ────────────────────────────────────────────────────
    const InlineCell = ({
      id,
      field,
      display,
      type = 'text',
      bold,
    }: {
      id: string;
      field: InlineEdit['field'];
      display: string;
      type?: 'text' | 'number';
      bold?: boolean;
    }) => {
      const active = isInline(id, field);
      if (active) {
        return (
          <input
            autoFocus
            type={type}
            value={inlineValue}
            onChange={(e) => setInlineValue(e.target.value)}
            onBlur={commitInline}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitInline();
              if (e.key === 'Escape') cancelInline();
            }}
            style={{
              width: '100%',
              height: '30px',
              border: `1.5px solid ${P2P_BRAND.primary}`,
              borderRadius: '4px',
              padding: '0 8px',
              fontSize: '13px',
              fontFamily: F,
              color: '#101828',
              outline: 'none',
              background: P2P_BRAND.surface,
              boxSizing: 'border-box',
            }}
          />
        );
      }
      const cellIdleStyle: React.CSSProperties = {
        fontSize: '13px',
        fontWeight: bold ? 700 : 400,
        color: bold ? '#101828' : '#344054',
        fontFamily: F,
        cursor: disabled ? 'default' : 'text',
        padding: '4px 8px',
        borderRadius: '4px',
        display: 'block',
        minHeight: '28px',
        lineHeight: '20px',
        boxSizing: 'border-box',
        border: disabled ? '1px solid transparent' : `1px solid transparent`,
        background: 'transparent',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        transition: 'border-color 0.12s, background 0.12s, box-shadow 0.12s',
      };

      const applyCellHighlight = (el: HTMLElement, on: boolean) => {
        if (disabled) return;
        el.style.borderColor = on ? P2P_BRAND.primary : 'transparent';
        el.style.background = on ? P2P_BRAND.surface : 'transparent';
        el.style.boxShadow = on ? `0 0 0 1px ${P2P_BRAND.surfaceBorder}` : 'none';
      };

      return (
        <span
          role="button"
          tabIndex={disabled ? -1 : 0}
          title={disabled ? undefined : 'Click to edit'}
          onClick={() => !disabled && startInline(id, field, display.replace('Rs. ', ''))}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled)
              startInline(id, field, display.replace('Rs. ', ''));
          }}
          style={cellIdleStyle}
          onMouseEnter={(e) => applyCellHighlight(e.currentTarget, true)}
          onMouseLeave={(e) => applyCellHighlight(e.currentTarget, false)}
          onFocus={(e) => applyCellHighlight(e.currentTarget, true)}
          onBlur={(e) => applyCellHighlight(e.currentTarget, false)}
        >
          {display}
        </span>
      );
    };

    // ── Editing item ref ───────────────────────────────────────────────────────
    const editingItem =
      formModal?.mode === 'edit' && formModal.itemId
        ? items.find((i) => i.id === formModal.itemId)
        : undefined;

    // ── Mobile card layout ────────────────────────────────────────────────────
    const MobileCard = ({ item, index }: { item: PRLineItem; index: number }) => {
      const isExpanded = expandedIds.has(item.id);
      const errorCount = getErrorCount(item);
      const itemErrors = getItemErrors(item);

      return (
        <div
          ref={(el) => { if (el) rowRefs.current.set(item.id, el); }}
          style={{
            background: selectedIds.has(item.id) ? '#FAFBFC' : '#FFFFFF',
            border: errorCount > 0 ? '1.5px solid #FECDCA' : selectedIds.has(item.id) ? '1px solid #E4E7EC' : '1px solid #E4E7EC',
            borderRadius: '10px',
            marginBottom: '10px',
            overflow: 'hidden',
          }}
        >
          {/* Card header row */}
          <div
            style={{
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <Checkbox
              checked={selectedIds.has(item.id)}
              onCheckedChange={(c) => toggleSelectRow(item.id, c === true)}
              aria-label={`Select line item ${index + 1}`}
              className={LINE_ITEM_CHECKBOX_CLASS}
            />
            <button
              type="button"
              onClick={() => toggleExpand(item.id)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              style={{
                ...iconButtonStyle,
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {isExpanded ? (
                <ChevronDown size={16} color="#667085" strokeWidth={2} />
              ) : (
                <ChevronRight size={16} color="#667085" strokeWidth={2} />
              )}
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F }}>
                  #{index + 1}
                </span>
                {errorCount > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#B42318',
                      background: '#FEF3F2',
                      border: '1px solid #FECDCA',
                      borderRadius: '999px',
                      padding: '2px 7px',
                    }}
                  >
                    <AlertCircle size={10} strokeWidth={2.5} aria-hidden />
                    {errorCount} issue{errorCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <InlineCell id={item.id} field="description" display={item.item || 'Untitled item'} bold />
              <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginTop: '3px' }}>
                {item.type || 'Goods'}
                {item.unitOfMeasure ? ` · ${item.unitOfMeasure}` : ''}
                {' · '}
                {item.vendor}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#101828', fontFamily: F }}>
                {fmtRs(item.subtotal)}
              </div>
              <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginTop: '2px' }}>
                <InlineCell id={item.id} field="quantity" display={String(item.quantity)} type="number" />
                {' × '}
                <InlineCell id={item.id} field="cost" display={fmtRs(item.cost)} type="number" />
              </div>
            </div>
          </div>

          {/* Expanded detail */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden', padding: '0 12px 12px' }}
              >
                <div style={expandedDetailShellStyle}>
                  <div style={expandedDetailBodyStyle}>
                    <div style={expandedDetailGridStyle}>
                  {fieldDefs
                    .filter((f) => f.visible)
                    .map((field) => {
                      const hasError = Boolean(itemErrors[field.key]);
                      return (
                        <div key={field.key}>
                          <div style={expandedFieldLabelStyle}>
                            {field.label}
                          </div>
                          <div
                            style={{
                              ...expandedFieldValueStyle,
                              color: hasError ? '#B42318' : '#101828',
                              fontWeight: hasError ? 600 : 500,
                            }}
                          >
                            {getDetailValue(item, field.key)}
                          </div>
                          {hasError && (
                            <div style={{ fontSize: '10px', color: '#B42318', fontFamily: F, marginTop: '2px' }}>
                              {itemErrors[field.key]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    </div>
                  </div>

                {/* Card actions */}
                <div style={expandedDetailFooterStyle}>
                  <button
                    type="button"
                    onClick={() => setFormModal({ mode: 'edit', itemId: item.id })}
                    style={{ ...secondaryButtonStyle, fontSize: '12px', height: '30px' }}
                  >
                    <Edit3 size={13} strokeWidth={2} aria-hidden />
                    Edit all fields
                  </button>
                  {onOpenGL && (
                    <button type="button" onClick={() => onOpenGL(item.id)} style={glChipStyle}>
                      {item.glAccountsCount || 1} GL
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => duplicateItem(item)}
                    disabled={disabled}
                    title="Duplicate item"
                    style={{ ...secondaryButtonStyle, fontSize: '12px', height: '30px' }}
                  >
                    <Copy size={13} color="#667085" strokeWidth={2} />
                    Duplicate
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => { onChange(items.filter((i) => i.id !== item.id)); onItemRemoved?.(); }}
                    style={{ ...secondaryButtonStyle, fontSize: '12px', height: '30px', color: '#F04438', borderColor: '#FECDCA', marginLeft: 'auto' }}
                  >
                    <Trash2 size={13} color="#F04438" strokeWidth={2} />
                    <span style={{ fontSize: '12px', fontFamily: F, color: '#F04438' }}>Remove</span>
                  </button>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    };

    const getDetailValue = (item: PRLineItem, key: string): string => {
      switch (key) {
        case 'description': return item.item || '—';
        case 'type': return item.type || '—';
        case 'unitOfMeasure': return item.unitOfMeasure || '—';
        case 'quantity': return String(item.quantity);
        case 'cost': return fmtRs(item.cost);
        case 'taxGroup': return item.taxGroup || '—';
        case 'vendor': return item.vendor || '—';
        case 'vendorTerms': return item.vendorTerms || '—';
        case 'requiredBy': return item.requiredBy || '—';
        case 'glAccount': return item.glAccount || '—';
        case 'projectAccount': return item.projectAccount || '—';
        default: return '—';
      }
    };

    const desktopColCount = (showTax ? 12 : 11);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
      <div
        style={
          focusMode
            ? {
                position: 'fixed',
                inset: 0,
                zIndex: 1200,
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }
            : { overflow: 'hidden' }
        }
      >
        {focusMode && (
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid #E4E7EC',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#FAFBFC',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#101828', fontFamily: F }}>
              Line Items — Focus Mode
            </span>
            <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>
              {items.length} item{items.length !== 1 ? 's' : ''} · {fmtRs(subtotalAll + taxTotal)} total
            </span>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => setFocusMode(false)}
              style={{ ...secondaryButtonStyle, height: '32px' }}
              aria-label="Exit focus mode"
            >
              <Minimize2 size={14} strokeWidth={2} aria-hidden />
              Exit focus
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #EEF1F5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '34px',
              padding: '0 12px',
              border: '1px solid #E4E7EC',
              borderRadius: '6px',
              background: '#F9FAFB',
              flex: '1 1 180px',
              maxWidth: '260px',
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
                fontSize: '13px',
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
              >
                <X size={12} color="#98A2B3" />
              </button>
            )}
          </div>

          {/* Row details menu — tucks away expand/collapse bulk actions */}
          {!isMobile && filteredItems.length > 1 && (
            <div ref={viewMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowViewMenu((v) => !v)}
                style={{ ...secondaryButtonStyle, height: '34px', paddingRight: '8px' }}
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
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      zIndex: 50,
                      background: '#FFFFFF',
                      border: '1px solid #E4E7EC',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(16,24,40,0.08)',
                      padding: '4px',
                      minWidth: '160px',
                    }}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { expandAll(); setShowViewMenu(false); }}
                      style={viewMenuItemStyle}
                    >
                      Expand all rows
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { collapseAll(); setShowViewMenu(false); }}
                      style={viewMenuItemStyle}
                    >
                      Collapse all rows
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {!isMobile && (
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
          )}

          <div style={{ flex: 1 }} />

          <button
            type="button"
            onClick={() => setFormModal({ mode: 'add' })}
            disabled={disabled}
            style={{
              ...primaryButtonStyle,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <Plus size={14} strokeWidth={2.5} aria-hidden />
            {isMobile ? 'Add' : 'Add item'}
          </button>
        </div>

        {/* Bulk selection bar */}
        <LineItemSelectionBar
          count={selectedIds.size}
          disabled={disabled}
          showRequestQuote={Boolean(onRequestQuote)}
          onClear={clearSelection}
          onRequestQuote={onRequestQuote ? requestQuoteForSelected : undefined}
          onDelete={bulkDeleteSelected}
        />

        {/* Mobile card list */}
        {isMobile ? (
          <div style={{ padding: '12px 14px' }}>
            {filteredItems.length === 0 ? (
              <EmptyState searchQuery={searchQuery} onAdd={() => setFormModal({ mode: 'add' })} />
            ) : (
              filteredItems.map((item, index) => (
                <MobileCard key={item.id} item={item} index={index} />
              ))
            )}
          </div>
        ) : (
          /* Desktop table */
          <div style={{ overflowX: 'auto', flex: focusMode ? 1 : undefined, overflowY: focusMode ? 'auto' : undefined }}>
            <table
              role="table"
              aria-label="Line items"
              style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1080px' }}
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
                  <th style={{ width: '44px', padding: '10px 8px 10px 14px' }}>
                    <Checkbox
                      checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                      onCheckedChange={(c) => toggleSelectAllVisible(c === true)}
                      aria-label="Select all line items"
                      className={LINE_ITEM_CHECKBOX_CLASS}
                    />
                  </th>
                  <th style={{ width: '40px', padding: '10px 8px 10px 0' }} />
                  <th style={{ ...thStyle, width: '40px' }}>#</th>
                  <th style={{ ...thStyle, minWidth: '200px' }}>Description</th>
                  <th style={{ ...thStyle, minWidth: '140px' }}>GL account</th>
                  <th style={{ ...thStyle, width: '120px' }}>Vendor</th>
                  <th style={{ ...thStyle, width: '96px' }}>Required by</th>
                  <th style={{ ...thStyle, width: '64px' }}>Qty</th>
                  <th style={{ ...thStyle, width: '100px' }}>Unit cost</th>
                  {showTax && <th style={{ ...thStyle, width: '88px' }}>Tax</th>}
                  <th style={{ ...thStyle, width: '104px' }}>Subtotal</th>
                  <th style={{ width: '108px', padding: '10px 14px' }} />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredItems.map((item, index) => {
                    const isExpanded = expandedIds.has(item.id);
                    const errorCount = getErrorCount(item);
                    const itemErrors = getItemErrors(item);
                    const taxAmt = showTax ? item.subtotal * 0.1 : 0;
                    const gl = parseGlAccount(item.glAccount);
                    const requiredByLabel = formatRequiredBy(item.requiredBy);
                    const isRowSelected = selectedIds.has(item.id);

                    return (
                      <Fragment key={item.id}>
                        {/* Summary row */}
                        <motion.tr
                          ref={(el) => { if (el) rowRefs.current.set(item.id, el); }}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            borderBottom: isExpanded ? 'none' : '1px solid #F2F4F7',
                            background:
                              errorCount > 0
                                ? '#FFFBFA'
                                : isRowSelected
                                  ? '#FAFBFC'
                                  : isExpanded
                                    ? '#FAFBFC'
                                    : hoveredRow === item.id
                                      ? '#FAFBFC'
                                      : '#FFFFFF',
                            boxShadow:
                              hoveredRow === item.id || isExpanded
                                ? `inset 2px 0 0 ${P2P_BRAND.primary}`
                                : isRowSelected
                                  ? 'inset 2px 0 0 #E4E7EC'
                                  : 'none',
                            transition: 'background 0.1s, box-shadow 0.1s',
                          }}
                          onMouseEnter={() => setHoveredRow(item.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {/* Select */}
                          <td style={{ padding: '12px 8px 12px 14px', width: '44px' }}>
                            <Checkbox
                              checked={isRowSelected}
                              onCheckedChange={(c) => toggleSelectRow(item.id, c === true)}
                              aria-label={`Select line item ${index + 1}`}
                              className={LINE_ITEM_CHECKBOX_CLASS}
                            />
                          </td>
                          {/* Chevron */}
                          <td style={{ padding: '12px 8px 12px 0', width: '40px' }}>
                            <button
                              type="button"
                              onClick={() => toggleExpand(item.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowDown') {
                                  e.preventDefault();
                                  setExpandedIds((p) => new Set([...p, item.id]));
                                }
                                if (e.key === 'ArrowUp') {
                                  e.preventDefault();
                                  setExpandedIds((p) => { const n = new Set(p); n.delete(item.id); return n; });
                                }
                              }}
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                              style={iconButtonStyle}
                            >
                              {isExpanded ? (
                                <ChevronDown size={15} color="#667085" strokeWidth={2} />
                              ) : (
                                <ChevronRight size={15} color="#667085" strokeWidth={2} />
                              )}
                            </button>
                          </td>

                          {/* # */}
                          <td style={{ padding: '12px 14px', fontSize: '12px', color: '#98A2B3', fontFamily: F }}>
                            {index + 1}
                          </td>

                          {/* Description */}
                          <td style={{ padding: '12px 14px', maxWidth: '260px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <InlineCell
                                    id={item.id}
                                    field="description"
                                    display={item.item || 'Untitled item'}
                                    bold
                                  />
                                  {!isExpanded && (
                                    <span style={typeChipStyle}>{item.type || 'Goods'}</span>
                                  )}
                                </div>
                                {!isExpanded && item.unitOfMeasure && (
                                  <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginTop: '3px' }}>
                                    {item.quantity} {item.unitOfMeasure.toLowerCase()}
                                    {item.vendorTerms ? ` · ${item.vendorTerms}` : ''}
                                  </div>
                                )}
                              </div>
                              {errorCount > 0 && (
                                <span
                                  title={`${errorCount} validation issue${errorCount !== 1 ? 's' : ''}`}
                                  role="img"
                                  aria-label={`${errorCount} validation issue${errorCount !== 1 ? 's' : ''}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#B42318',
                                    background: '#FEF3F2',
                                    border: '1px solid #FECDCA',
                                    borderRadius: '999px',
                                    padding: '2px 7px',
                                    flexShrink: 0,
                                  }}
                                >
                                  <AlertCircle size={10} strokeWidth={2.5} aria-hidden />
                                  {errorCount}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* GL account */}
                          <td style={{ padding: '12px 14px', maxWidth: '180px' }}>
                            <button
                              type="button"
                              onClick={() => onOpenGL?.(item.id)}
                              disabled={!onOpenGL}
                              title={item.glAccount}
                              style={{
                                border: 'none',
                                background: 'none',
                                padding: 0,
                                cursor: onOpenGL ? 'pointer' : 'default',
                                textAlign: 'left',
                                maxWidth: '100%',
                              }}
                            >
                              <span style={glCodeChipStyle}>{gl.code}</span>
                              {gl.name && (
                                <div
                                  style={{
                                    fontSize: '11px',
                                    color: '#667085',
                                    fontFamily: F,
                                    marginTop: '3px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {gl.name}
                                  {(item.glAccountsCount || 1) > 1
                                    ? ` · +${(item.glAccountsCount || 1) - 1} more`
                                    : ''}
                                </div>
                              )}
                            </button>
                          </td>

                          {/* Vendor */}
                          <td style={{ padding: '12px 14px', fontSize: '13px', color: '#344054', fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                            {item.vendor}
                          </td>

                          {/* Required by */}
                          <td style={{ padding: '12px 14px', fontSize: '12px', color: requiredByLabel ? '#344054' : '#98A2B3', fontFamily: F, whiteSpace: 'nowrap' }}>
                            {requiredByLabel || '—'}
                          </td>

                          {/* Qty - inline editable */}
                          <td style={{ padding: '12px 14px' }}>
                            <InlineCell
                              id={item.id}
                              field="quantity"
                              display={String(item.quantity)}
                              type="number"
                            />
                          </td>

                          {/* Cost - inline editable */}
                          <td style={{ padding: '12px 14px' }}>
                            <InlineCell
                              id={item.id}
                              field="cost"
                              display={fmtRs(item.cost)}
                              type="number"
                            />
                          </td>

                          {/* Tax */}
                          {showTax && (
                            <td style={{ padding: '12px 14px', fontSize: '13px', color: '#667085', fontFamily: F }}>
                              {fmtRs(taxAmt)}
                            </td>
                          )}

                          {/* Sub total */}
                          <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: '#101828', fontFamily: F }}>
                            {fmtRs(item.subtotal)}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 14px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '6px',
                                opacity: hoveredRow === item.id || isExpanded ? 1 : 0.6,
                                transition: 'opacity 0.12s',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => setFormModal({ mode: 'edit', itemId: item.id })}
                                disabled={disabled}
                                title="Edit"
                                style={iconButtonStyle}
                              >
                                <Edit3 size={14} color="#667085" strokeWidth={2} />
                              </button>

                              <div
                                ref={openActionMenuId === item.id ? actionMenuRef : undefined}
                                style={{ position: 'relative' }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenActionMenuId((prev) => (prev === item.id ? null : item.id))
                                  }
                                  title="More actions"
                                  aria-expanded={openActionMenuId === item.id}
                                  aria-haspopup="menu"
                                  style={iconButtonStyle}
                                >
                                  <MoreHorizontal size={14} color="#667085" strokeWidth={2} />
                                </button>
                                <AnimatePresence>
                                  {openActionMenuId === item.id && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -4 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -4 }}
                                      transition={{ duration: 0.12 }}
                                      role="menu"
                                      style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 4px)',
                                        right: 0,
                                        zIndex: 30,
                                        background: '#FFFFFF',
                                        border: '1px solid #E4E7EC',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(16,24,40,0.1)',
                                        padding: '4px',
                                        minWidth: '168px',
                                      }}
                                    >
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                          duplicateItem(item);
                                          setOpenActionMenuId(null);
                                        }}
                                        disabled={disabled}
                                        style={rowActionMenuItemStyle}
                                      >
                                        <Copy size={13} strokeWidth={2} aria-hidden />
                                        Duplicate
                                      </button>
                                      {onOpenGL && (
                                        <button
                                          type="button"
                                          role="menuitem"
                                          onClick={() => {
                                            onOpenGL(item.id);
                                            setOpenActionMenuId(null);
                                          }}
                                          style={rowActionMenuItemStyle}
                                        >
                                          GL distribution ({item.glAccountsCount || 1})
                                        </button>
                                      )}
                                      {onOpenBudget && (
                                        <button
                                          type="button"
                                          role="menuitem"
                                          onClick={() => {
                                            onOpenBudget(item.id);
                                            setOpenActionMenuId(null);
                                          }}
                                          style={rowActionMenuItemStyle}
                                        >
                                          <DollarSign size={13} color="#EF4444" strokeWidth={2} aria-hidden />
                                          Check budget
                                        </button>
                                      )}
                                      {onOpenBudgetReport && (
                                        <button
                                          type="button"
                                          role="menuitem"
                                          onClick={() => {
                                            onOpenBudgetReport(item.id);
                                            setOpenActionMenuId(null);
                                          }}
                                          style={rowActionMenuItemStyle}
                                        >
                                          <ExternalLink size={13} strokeWidth={2} aria-hidden />
                                          Budget report
                                        </button>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expanded detail row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              key={`${item.id}-details`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <td
                                colSpan={desktopColCount}
                                style={{ padding: '0 14px 12px', borderBottom: '1px solid #E4E7EC', background: '#FFFFFF' }}
                              >
                                <div style={{ ...expandedDetailShellStyle, marginLeft: '44px' }}>
                                  <div style={expandedDetailBodyStyle}>
                                    <div style={expandedDetailGridStyle}>
                                    {fieldDefs
                                      .filter((f) => f.visible)
                                      .map((field) => {
                                        const hasError = Boolean(itemErrors[field.key]);
                                        return (
                                          <div key={field.key}>
                                            <div style={expandedFieldLabelStyle}>
                                              {field.label}
                                            </div>
                                            <div
                                              style={{
                                                ...expandedFieldValueStyle,
                                                color: hasError ? '#B42318' : '#101828',
                                                fontWeight: hasError ? 600 : 500,
                                              }}
                                            >
                                              {getDetailValue(item, field.key)}
                                            </div>
                                            {hasError && (
                                              <div
                                                style={{
                                                  fontSize: '10px',
                                                  color: '#B42318',
                                                  fontFamily: F,
                                                  marginTop: '2px',
                                                }}
                                              >
                                                {itemErrors[field.key]}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div style={expandedDetailFooterStyle}>
                                    <button
                                      type="button"
                                      onClick={() => setFormModal({ mode: 'edit', itemId: item.id })}
                                      style={{ ...secondaryButtonStyle, fontSize: '12px', height: '30px' }}
                                    >
                                      <Edit3 size={12} strokeWidth={2} aria-hidden />
                                      Edit all fields
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { duplicateItem(item); toggleExpand(item.id); }}
                                      style={{ ...secondaryButtonStyle, fontSize: '12px', height: '30px' }}
                                    >
                                      <Copy size={12} strokeWidth={2} aria-hidden />
                                      Duplicate
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    );
                  })}
                </AnimatePresence>

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={desktopColCount}>
                      <EmptyState searchQuery={searchQuery} onAdd={() => setFormModal({ mode: 'add' })} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer totals */}
        {items.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderTop: '2px solid #E4E7EC',
              background: '#F9FAFB',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#344054', fontFamily: F }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              {totalItemErrors > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#B42318',
                    background: '#FEF3F2',
                    border: '1px solid #FECDCA',
                    borderRadius: '999px',
                    padding: '2px 8px',
                  }}
                >
                  <AlertCircle size={11} strokeWidth={2.5} aria-hidden />
                  {totalItemErrors} item{totalItemErrors !== 1 ? 's have' : ' has'} errors
                </span>
              )}
              {totalItemErrors === 0 && items.length > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#027A48',
                    background: '#ECFDF3',
                    border: '1px solid #A7F3D0',
                    borderRadius: '999px',
                    padding: '2px 8px',
                  }}
                >
                  <CheckCircle2 size={11} strokeWidth={2.5} aria-hidden />
                  All items valid
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>
                Sub total: <strong style={{ color: '#101828' }}>{fmtRs(subtotalAll)}</strong>
              </span>
              {showTax && (
                <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>
                  Tax (10%): <strong style={{ color: '#101828' }}>{fmtRs(taxTotal)}</strong>
                </span>
              )}
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#101828', fontFamily: F }}>
                Total: {fmtRs(subtotalAll + taxTotal)}
              </span>
            </div>
          </div>
        )}

        {/* Edit / Add modal */}
        <AnimatePresence>
          {formModal && (
            <LineItemFormModal
              mode={formModal.mode}
              initial={
                editingItem
                  ? toFormValues(editingItem)
                  : { vendor: defaultVendor || '', vendorTerms: 'Net 15' }
              }
              options={options}
              onClose={() => setFormModal(null)}
              onSave={handleSaveForm}
            />
          )}
        </AnimatePresence>
      </div>
    );
  },
);

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({
  searchQuery,
  onAdd,
}: {
  searchQuery: string;
  onAdd: () => void;
}) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        color: '#98A2B3',
        fontFamily: F,
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#F2F4F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
        }}
      >
        {searchQuery ? (
          <Search size={22} color="#98A2B3" strokeWidth={1.8} />
        ) : (
          <Plus size={22} color="#98A2B3" strokeWidth={1.8} />
        )}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#344054', marginBottom: '6px' }}>
        {searchQuery ? 'No matching items' : 'No line items yet'}
      </div>
      <div style={{ fontSize: '13px', marginBottom: '16px', maxWidth: '300px', margin: '0 auto 16px' }}>
        {searchQuery
          ? 'Try a different search term or clear the search.'
          : 'Add your first item to get started.'}
      </div>
      {!searchQuery && (
        <button type="button" onClick={onAdd} style={primaryButtonStyle}>
          <Plus size={14} strokeWidth={2.5} aria-hidden />
          Add item
        </button>
      )}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const primaryButtonStyle: React.CSSProperties = {
  height: '34px',
  padding: '0 14px',
  background: P2P_BRAND.primary,
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#FFFFFF',
  fontFamily: F,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const secondaryButtonStyle: React.CSSProperties = {
  height: '34px',
  padding: '0 12px',
  background: '#FFFFFF',
  border: '1.5px solid #D0D5DD',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#344054',
  fontFamily: F,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const iconButtonStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '5px',
  border: 'none',
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

const glChipStyle: React.CSSProperties = {
  height: '24px',
  padding: '0 8px',
  background: '#FFFFFF',
  border: '1px solid #E4E7EC',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  fontFamily: F,
  cursor: 'pointer',
};

const glCodeChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: '22px',
  padding: '0 7px',
  background: '#F9FAFB',
  border: '1px solid #E4E7EC',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#475467',
  fontFamily: F,
};

const typeChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  height: '20px',
  padding: '0 6px',
  background: P2P_BRAND.surface,
  border: `1px solid ${P2P_BRAND.surfaceBorder}`,
  borderRadius: '4px',
  fontSize: '10px',
  fontWeight: 600,
  color: P2P_BRAND.primaryStrong,
  fontFamily: F,
  flexShrink: 0,
};

const rowActionMenuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 10px',
  border: 'none',
  borderRadius: '5px',
  background: 'transparent',
  fontSize: '12px',
  fontWeight: 500,
  color: '#344054',
  fontFamily: F,
  textAlign: 'left',
  cursor: 'pointer',
};

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  fontFamily: F,
  letterSpacing: '0.01em',
  whiteSpace: 'nowrap',
};

const expandedDetailShellStyle: React.CSSProperties = {
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  overflow: 'hidden',
  background: '#FFFFFF',
  boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
};

const expandedDetailBodyStyle: React.CSSProperties = {
  padding: '14px 16px',
  background: '#FFFFFF',
};

const expandedDetailGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))',
  gap: '12px 24px',
};

const expandedDetailFooterStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderTop: '1px solid #EEF1F5',
  background: '#FAFBFC',
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const expandedFieldLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  color: '#98A2B3',
  fontFamily: F,
  marginBottom: '3px',
};

const expandedFieldValueStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#101828',
  fontFamily: F,
  fontWeight: 500,
  wordBreak: 'break-word',
};

const viewMenuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  border: 'none',
  borderRadius: '5px',
  background: 'transparent',
  fontSize: '12px',
  fontWeight: 500,
  color: '#344054',
  fontFamily: F,
  textAlign: 'left',
  cursor: 'pointer',
};
