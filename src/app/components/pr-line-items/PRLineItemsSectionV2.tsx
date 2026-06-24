import {
  forwardRef,
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
  Edit3,
  DollarSign,
  ExternalLink,
  AlertCircle,
  X,
  CheckCircle2,
  Maximize2,
  Minimize2,
  PanelRightOpen,
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
import { fmtRs } from './PRLineItemsSection';
import type { PRLineItemsSectionHandle } from './PRLineItemsSection';
import { Checkbox } from '../ui/checkbox';
import { LINE_ITEM_CHECKBOX_CLASS } from './lineItemSelectionStyles';
import { LineItemSelectionBar } from './LineItemSelectionBar';
import { DeleteConfirmPopover } from './DeleteConfirmPopover';

type InlineEdit = { id: string; field: 'description' | 'quantity' | 'cost' };

type PRLineItemsSectionV2Props = {
  items: PRLineItem[];
  onChange: (items: PRLineItem[]) => void;
  options?: PurchaseRequestOptionsState;
  disabled?: boolean;
  defaultVendor?: string;
  onOpenGL?: (itemId: string) => void;
  onOpenBudget?: (itemId: string) => void;
  onOpenBudgetReport?: (itemId: string) => void;
  onItemAdded?: (description: string) => void;
  onItemRemoved?: (count?: number) => void;
  onRequestQuote?: (selectedItemIds: string[]) => void;
};

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

export const PRLineItemsSectionV2 = forwardRef<PRLineItemsSectionHandle, PRLineItemsSectionV2Props>(
  function PRLineItemsSectionV2(
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
    const [detailItemId, setDetailItemId] = useState<string | null>(null);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [formModal, setFormModal] = useState<{ mode: 'add' | 'edit'; itemId?: string } | null>(
      null,
    );
    const [inlineEdit, setInlineEdit] = useState<InlineEdit | null>(null);
    const [inlineValue, setInlineValue] = useState('');
    const [focusMode, setFocusMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState<{
      ids: string[];
      source: 'bulk';
    } | null>(null);
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
        if (
          searchQuery &&
          !i.item.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !i.vendor.toLowerCase().includes(searchQuery.toLowerCase())
        )
          return false;
        return true;
      });
    }, [items, searchQuery]);

    const visibleItemIds = useMemo(() => filteredItems.map((i) => i.id), [filteredItems]);
    const allVisibleSelected =
      visibleItemIds.length > 0 && visibleItemIds.every((id) => selectedIds.has(id));
    const someVisibleSelected =
      visibleItemIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;
    const tableColCount = showTax ? 11 : 10;

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
      setDeleteConfirm({ ids: Array.from(selectedIds), source: 'bulk' });
    };

    const confirmDelete = () => {
      if (!deleteConfirm?.ids.length || disabled) return;
      const idsToRemove = new Set(deleteConfirm.ids);
      onChange(items.filter((i) => !idsToRemove.has(i.id)));
      if (detailItemId && idsToRemove.has(detailItemId)) setDetailItemId(null);
      setSelectedIds(new Set());
      setDeleteConfirm(null);
      onItemRemoved?.(deleteConfirm.ids.length);
    };

    const cancelDelete = () => setDeleteConfirm(null);
    const isBulkDeletePending = deleteConfirm?.source === 'bulk';

    const requestQuoteForSelected = () => {
      if (selectedIds.size === 0 || !onRequestQuote) return;
      onRequestQuote(Array.from(selectedIds));
      setSelectedIds(new Set());
    };

    const subtotalAll = items.reduce((s, i) => s + i.subtotal, 0);
    const taxTotal = showTax ? items.reduce((s, i) => s + i.subtotal * 0.1, 0) : 0;
    const totalItemErrors = items.reduce((n, i) => n + (getErrorCount(i) > 0 ? 1 : 0), 0);

    const detailItem = detailItemId ? items.find((i) => i.id === detailItemId) : undefined;

    useImperativeHandle(ref, () => ({
      focusFirstError() {
        const first = items.find((i) => getErrorCount(i) > 0);
        if (!first) return false;
        setDetailItemId(first.id);
        requestAnimationFrame(() => {
          const el = rowRefs.current.get(first.id);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        return true;
      },
      errorCount() {
        return totalItemErrors;
      },
    }));

    useEffect(() => {
      if (!focusMode) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }, [focusMode]);

    useEffect(() => {
      if (!detailItemId) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setDetailItemId(null);
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [detailItemId]);

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
        setDetailItemId(newItem.id);
      }
      setFormModal(null);
    };

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

    const getDetailValue = (item: PRLineItem, key: string): string => {
      switch (key) {
        case 'description':
          return item.item || '—';
        case 'type':
          return item.type || '—';
        case 'unitOfMeasure':
          return item.unitOfMeasure || '—';
        case 'quantity':
          return String(item.quantity);
        case 'cost':
          return fmtRs(item.cost);
        case 'taxGroup':
          return item.taxGroup || '—';
        case 'vendor':
          return item.vendor || '—';
        case 'vendorTerms':
          return item.vendorTerms || '—';
        case 'requiredBy':
          return item.requiredBy || '—';
        case 'glAccount':
          return item.glAccount || '—';
        case 'projectAccount':
          return item.projectAccount || '—';
        default:
          return '—';
      }
    };

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
              height: '28px',
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
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) startInline(id, field, display.replace('Rs. ', ''));
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.stopPropagation();
              startInline(id, field, display.replace('Rs. ', ''));
            }
          }}
          style={{
            fontSize: '13px',
            fontWeight: bold ? 600 : 400,
            color: bold ? '#101828' : '#344054',
            fontFamily: F,
            cursor: disabled ? 'default' : 'text',
            padding: '3px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            maxWidth: '100%',
            boxSizing: 'border-box',
            border: '1px solid transparent',
            background: 'transparent',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            verticalAlign: 'middle',
            transition: 'border-color 0.12s, background 0.12s, box-shadow 0.12s',
          }}
          onMouseEnter={(e) => applyCellHighlight(e.currentTarget, true)}
          onMouseLeave={(e) => applyCellHighlight(e.currentTarget, false)}
          onFocus={(e) => applyCellHighlight(e.currentTarget, true)}
          onBlur={(e) => applyCellHighlight(e.currentTarget, false)}
        >
          {display}
        </span>
      );
    };

    const editingItem =
      formModal?.mode === 'edit' && formModal.itemId
        ? items.find((i) => i.id === formModal.itemId)
        : undefined;

    const glShort = (gl: string) => {
      const code = gl.split(' - ')[0];
      return code.length > 12 ? `${code.slice(0, 10)}…` : code;
    };

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
            : { overflow: 'hidden', position: 'relative' }
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
              Line Items — Focus Mode (V2)
            </span>
            <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>
              Compact view · {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => setFocusMode(false)}
              style={{ ...secondaryButtonStyle, height: '32px' }}
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

          {!isMobile && (
            <button
              type="button"
              onClick={() => setFocusMode((v) => !v)}
              style={secondaryButtonStyle}
              title={focusMode ? 'Exit focus mode' : 'Open focus mode'}
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
            Add item
          </button>
        </div>

        <LineItemSelectionBar
          count={selectedIds.size}
          disabled={disabled}
          showRequestQuote={Boolean(onRequestQuote)}
          deletePending={isBulkDeletePending}
          onClear={clearSelection}
          onRequestQuote={onRequestQuote ? requestQuoteForSelected : undefined}
          onDelete={bulkDeleteSelected}
          onConfirmDelete={confirmDelete}
          onCancelDelete={cancelDelete}
        />

        {/* Compact table */}
        <div
          style={{
            overflowX: 'auto',
            flex: focusMode ? 1 : undefined,
            overflowY: focusMode ? 'auto' : undefined,
          }}
        >
          <table
            role="table"
            aria-label="Line items compact view"
            style={{ width: '100%', borderCollapse: 'collapse', minWidth: '960px' }}
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
                <th style={{ ...thStyle, width: '36px' }}>#</th>
                <th style={{ ...thStyle, minWidth: '200px' }}>Description</th>
                <th style={{ ...thStyle, width: '72px' }}>Type</th>
                <th style={{ ...thStyle, width: '100px' }}>GL</th>
                <th style={{ ...thStyle, width: '110px' }}>Vendor</th>
                <th style={{ ...thStyle, width: '56px' }}>Qty</th>
                <th style={{ ...thStyle, width: '96px' }}>Unit</th>
                {showTax && <th style={{ ...thStyle, width: '88px' }}>Tax</th>}
                <th style={{ ...thStyle, width: '100px' }}>Subtotal</th>
                <th style={{ width: '156px', padding: '10px 14px' }} />
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={tableColCount}>
                    <EmptyState searchQuery={searchQuery} onAdd={() => setFormModal({ mode: 'add' })} />
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const errorCount = getErrorCount(item);
                  const taxAmt = showTax ? item.subtotal * 0.1 : 0;
                  const isSelected = detailItemId === item.id;
                  const isRowChecked = selectedIds.has(item.id);

                  return (
                    <motion.tr
                      key={item.id}
                      ref={(el) => {
                        if (el) rowRefs.current.set(item.id, el);
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        borderBottom: '1px solid #F2F4F7',
                        background: isRowChecked
                          ? '#FAFBFC'
                          : isSelected
                            ? '#FAFBFC'
                            : errorCount > 0
                              ? '#FFFBFA'
                              : hoveredRow === item.id
                                ? '#FAFBFC'
                                : '#FFFFFF',
                        boxShadow:
                          hoveredRow === item.id || isSelected
                            ? `inset 2px 0 0 ${P2P_BRAND.primary}`
                            : isRowChecked
                              ? 'inset 2px 0 0 #E4E7EC'
                              : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.1s, box-shadow 0.1s',
                      }}
                      onMouseEnter={() => setHoveredRow(item.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => setDetailItemId((prev) => (prev === item.id ? null : item.id))}
                    >
                      <td
                        style={{ padding: '8px 8px 8px 14px', width: '44px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isRowChecked}
                          onCheckedChange={(c) => toggleSelectRow(item.id, c === true)}
                          aria-label={`Select line item ${index + 1}`}
                          className={LINE_ITEM_CHECKBOX_CLASS}
                        />
                      </td>
                      <td style={{ padding: '8px 14px', fontSize: '12px', color: '#98A2B3', fontFamily: F }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '8px 10px', maxWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <InlineCell
                            id={item.id}
                            field="description"
                            display={item.item || 'Untitled item'}
                            bold
                          />
                          {errorCount > 0 && (
                            <span
                              title={`${errorCount} validation issue${errorCount !== 1 ? 's' : ''}`}
                              style={errorBadgeStyle}
                            >
                              <AlertCircle size={10} strokeWidth={2.5} aria-hidden />
                              {errorCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={typeChipStyle}>{item.type || 'Goods'}</span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={glChipStyle} title={item.glAccount}>
                          {glShort(item.glAccount)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          fontSize: '12px',
                          color: '#667085',
                          fontFamily: F,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '110px',
                        }}
                      >
                        {item.vendor}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <InlineCell id={item.id} field="quantity" display={String(item.quantity)} type="number" />
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <InlineCell id={item.id} field="cost" display={fmtRs(item.cost)} type="number" />
                      </td>
                      {showTax && (
                        <td style={{ padding: '8px 10px', fontSize: '12px', color: '#667085', fontFamily: F, whiteSpace: 'nowrap' }}>
                          {fmtRs(taxAmt)}
                        </td>
                      )}
                      <td style={{ padding: '8px 10px', fontSize: '13px', fontWeight: 700, color: '#101828', fontFamily: F, whiteSpace: 'nowrap' }}>
                        {fmtRs(item.subtotal)}
                      </td>
                      <td style={{ padding: '8px 10px' }} onClick={(e) => e.stopPropagation()}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '10px',
                            opacity: hoveredRow === item.id || isSelected ? 1 : 0.55,
                            transition: 'opacity 0.12s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => setDetailItemId(item.id)}
                              title="View details"
                              style={{
                                ...iconButtonStyle,
                                background: isSelected ? P2P_BRAND.surface : 'transparent',
                                border: isSelected ? `1px solid ${P2P_BRAND.surfaceBorder}` : 'none',
                              }}
                            >
                              <PanelRightOpen size={14} color={isSelected ? P2P_BRAND.primaryStrong : '#667085'} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormModal({ mode: 'edit', itemId: item.id })}
                              disabled={disabled}
                              title="Edit all fields"
                              style={iconButtonStyle}
                            >
                              <Edit3 size={14} color="#667085" strokeWidth={2} />
                            </button>
                            {onOpenGL && (
                              <button type="button" onClick={() => onOpenGL(item.id)} style={{ ...glChipStyle, whiteSpace: 'nowrap' }}>
                                {item.glAccountsCount || 1} GL
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer totals */}
        {items.length > 0 && (
          <div style={footerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#344054', fontFamily: F }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              {totalItemErrors > 0 ? (
                <span style={{ ...errorBadgeStyle, fontSize: '11px', padding: '2px 8px' }}>
                  <AlertCircle size={11} strokeWidth={2.5} aria-hidden />
                  {totalItemErrors} with errors
                </span>
              ) : (
                <span style={validBadgeStyle}>
                  <CheckCircle2 size={11} strokeWidth={2.5} aria-hidden />
                  All valid
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>
                Sub total: <strong style={{ color: '#101828' }}>{fmtRs(subtotalAll)}</strong>
              </span>
              {showTax && (
                <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>
                  Tax: <strong style={{ color: '#101828' }}>{fmtRs(taxTotal)}</strong>
                </span>
              )}
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#101828', fontFamily: F }}>
                Total: {fmtRs(subtotalAll + taxTotal)}
              </span>
            </div>
          </div>
        )}

        {/* Detail drawer — does not disrupt table layout */}
        <AnimatePresence>
          {detailItem && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: focusMode ? 'fixed' : 'absolute',
                  inset: 0,
                  background: 'rgba(16,24,40,0.25)',
                  zIndex: 40,
                }}
                onClick={() => setDetailItemId(null)}
                aria-hidden
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                role="dialog"
                aria-label="Line item details"
                style={{
                  position: focusMode ? 'fixed' : 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 'min(380px, 92vw)',
                  background: '#FFFFFF',
                  borderLeft: '1px solid #E4E7EC',
                  boxShadow: '-8px 0 24px rgba(16,24,40,0.08)',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 18px',
                    borderBottom: '1px solid #EEF1F5',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#98A2B3', fontFamily: F, marginBottom: '4px' }}>
                      LINE ITEM DETAILS
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#101828', fontFamily: F, lineHeight: 1.35 }}>
                      {detailItem.item || 'Untitled item'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#667085', fontFamily: F, marginTop: '4px' }}>
                      {fmtRs(detailItem.subtotal)} · {detailItem.vendor}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailItemId(null)}
                    style={iconButtonStyle}
                    aria-label="Close details"
                  >
                    <X size={18} color="#667085" strokeWidth={2} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '14px 16px',
                    }}
                  >
                    {fieldDefs
                      .filter((f) => f.visible)
                      .map((field) => {
                        const itemErrors = getItemErrors(detailItem);
                        const hasError = Boolean(itemErrors[field.key]);
                        return (
                          <div key={field.key}>
                            <div style={detailLabelStyle}>{field.label}</div>
                            <div
                              style={{
                                fontSize: '13px',
                                color: hasError ? '#B42318' : '#101828',
                                fontFamily: F,
                                fontWeight: hasError ? 600 : 500,
                                wordBreak: 'break-word',
                              }}
                            >
                              {getDetailValue(detailItem, field.key)}
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

                <div
                  style={{
                    padding: '14px 18px',
                    borderTop: '1px solid #EEF1F5',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFormModal({ mode: 'edit', itemId: detailItem.id })}
                    style={{
                      ...secondaryButtonStyle,
                      borderColor: P2P_BRAND.primary,
                      color: P2P_BRAND.primaryStrong,
                    }}
                  >
                    <Edit3 size={13} strokeWidth={2} aria-hidden />
                    Edit all fields
                  </button>
                  {onOpenBudget && (
                    <button type="button" onClick={() => onOpenBudget(detailItem.id)} style={secondaryButtonStyle}>
                      <DollarSign size={13} color="#EF4444" strokeWidth={2} aria-hidden />
                      Budget
                    </button>
                  )}
                  {onOpenBudgetReport && (
                    <button type="button" onClick={() => onOpenBudgetReport(detailItem.id)} style={secondaryButtonStyle}>
                      <ExternalLink size={13} strokeWidth={2} aria-hidden />
                      Report
                    </button>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

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

function EmptyState({ searchQuery, onAdd }: { searchQuery: string; onAdd: () => void }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: '#98A2B3', fontFamily: F }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#344054', marginBottom: '6px' }}>
        {searchQuery ? 'No matching items' : 'No line items yet'}
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
  height: '22px',
  padding: '0 7px',
  background: '#F9FAFB',
  border: '1px solid #E4E7EC',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#475467',
  fontFamily: F,
  cursor: 'default',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
};

const typeChipStyle: React.CSSProperties = {
  ...glChipStyle,
  background: '#FFFFFF',
  color: '#667085',
};

const thStyle: React.CSSProperties = {
  padding: '9px 10px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  fontFamily: F,
  letterSpacing: '0.01em',
  whiteSpace: 'nowrap',
};

const detailLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  color: '#667085',
  fontFamily: F,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  marginBottom: '4px',
};

const errorBadgeStyle: React.CSSProperties = {
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
};

const validBadgeStyle: React.CSSProperties = {
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
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderTop: '2px solid #E4E7EC',
  background: '#F9FAFB',
  flexWrap: 'wrap',
  gap: '8px',
  flexShrink: 0,
};
