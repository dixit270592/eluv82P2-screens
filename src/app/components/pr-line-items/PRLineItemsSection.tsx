import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit3,
  DollarSign,
  ExternalLink,
  AlertCircle,
  X,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  createDefaultPurchaseRequestOptions,
  type PurchaseRequestOptionsState,
} from '../../data/purchaseRequestOptions';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import { getLineItemFieldDefinitions, type LineItemFieldKey } from './lineItemFieldConfig';
import {
  validateLineItemForm,
  hasLineItemErrors,
  type LineItemFormValues,
  type LineItemValidationErrors,
} from './lineItemValidation';
import { LineItemInlineForm } from './LineItemInlineForm';
import { SelectItemModal } from './SelectItemModal';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { isDraftDirty, hasAnyUnsavedDrafts } from './lineItemDraftUtils';
import {
  catalogItemToLineItemFields,
  catalogPopulatedFieldKeys,
  type InventoryCatalogItem,
} from '../../data/inventoryCatalog';
import {
  createBlankLineItem,
  filledLineItems,
  isBlankLineItem,
  isTrailingBlankItem,
} from './lineItemBlank';
import { LineItemFormModal } from './LineItemFormModal';
import type { PRLineItem } from './types';
import { Checkbox } from '../ui/checkbox';
import { LINE_ITEM_CHECKBOX_CLASS } from './lineItemSelectionStyles';
import { LineItemSelectionBar } from './LineItemSelectionBar';
import { formatLineItemCurrency, LINE_ITEM_CURRENCY_PREFIX } from './lineItemCurrency';

// ─── Currency ───────────────────────────────────────────────────────────────
export const fmtRs = formatLineItemCurrency;

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
  onItemRemoved?: (count?: number) => void;
  onRequestQuote?: (selectedItemIds: string[]) => void;
  /** When true, appends a blank row after the last row is fully valid (V3). */
  autoPopulateBlankRow?: boolean;
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
      autoPopulateBlankRow = false,
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
    const [deleteConfirm, setDeleteConfirm] = useState<{
      ids: string[];
      source: 'row' | 'bulk';
    } | null>(null);
    const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
    const [unsavedNewIds, setUnsavedNewIds] = useState<Set<string>>(new Set());
    const [draftValues, setDraftValues] = useState<Record<string, LineItemFormValues>>({});
    const [draftTouched, setDraftTouched] = useState<
      Record<string, Partial<Record<LineItemFieldKey, boolean>>>
    >({});
    const [draftErrors, setDraftErrors] = useState<Record<string, LineItemValidationErrors>>({});
    const [saveAttemptedIds, setSaveAttemptedIds] = useState<Set<string>>(new Set());
    const [itemSelectTargetId, setItemSelectTargetId] = useState<string | null>(null);
    const itemSelectOpenedAtRef = useRef(0);
    const [autoPopulatedFields, setAutoPopulatedFields] = useState<
      Record<string, Set<LineItemFieldKey>>
    >({});
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
    const [saveErrorIds, setSaveErrorIds] = useState<Set<string>>(new Set());
    const [unsavedPrompt, setUnsavedPrompt] = useState<{ itemId: string; action: () => void } | null>(
      null,
    );
    const [savedFlashIds, setSavedFlashIds] = useState<Set<string>>(new Set());
    const [saveAnnouncement, setSaveAnnouncement] = useState('');
    const viewMenuRef = useRef<HTMLDivElement>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<Map<string, HTMLElement>>(new Map());
    const focusBlankRowRef = useRef(false);
    const saveAnnouncementTimerRef = useRef<number | null>(null);
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 768;

    const fieldDefs = useMemo(() => getLineItemFieldDefinitions(options), [options]);
    const showTax = !options.hideTaxField;

    const getItemErrors = useCallback(
      (item: PRLineItem) => validateLineItemForm(toFormValues(item), options),
      [options],
    );
    const getErrorCount = useCallback(
      (item: PRLineItem, index?: number) => {
        if (editingIds.has(item.id)) return 0;
        if (
          autoPopulateBlankRow &&
          index !== undefined &&
          isTrailingBlankItem(items, item, index)
        ) {
          return 0;
        }
        return Object.keys(getItemErrors(item)).length;
      },
      [autoPopulateBlankRow, editingIds, getItemErrors, items],
    );

    const isItemEditing = useCallback((id: string) => editingIds.has(id), [editingIds]);
    const isUnsavedNewItem = useCallback((id: string) => unsavedNewIds.has(id), [unsavedNewIds]);

    const enterEditMode = useCallback((itemId: string, item: PRLineItem, isNew: boolean) => {
      setEditingIds((prev) => new Set([...prev, itemId]));
      if (isNew) setUnsavedNewIds((prev) => new Set([...prev, itemId]));
      setDraftValues((prev) => ({ ...prev, [itemId]: toFormValues(item) }));
      setDraftTouched((prev) => ({ ...prev, [itemId]: {} }));
      setDraftErrors((prev) => ({ ...prev, [itemId]: {} }));
      setSaveAttemptedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      setExpandedIds((prev) => new Set([...prev, itemId]));
    }, []);

    const exitEditMode = useCallback((itemId: string) => {
      setEditingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      setUnsavedNewIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      setDraftValues((prev) => {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      });
      setDraftTouched((prev) => {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      });
      setDraftErrors((prev) => {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      });
      setSaveAttemptedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      setAutoPopulatedFields((prev) => {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      });
    }, []);

    const updateDraft = useCallback(
      (itemId: string, values: LineItemFormValues, skipHighlightClear?: boolean) => {
        setDraftValues((prev) => ({ ...prev, [itemId]: values }));
        setDraftErrors((prev) => ({
          ...prev,
          [itemId]: validateLineItemForm(values, options),
        }));
        if (!skipHighlightClear) {
          setAutoPopulatedFields((prev) => {
            if (!prev[itemId]) return prev;
            const next = { ...prev };
            delete next[itemId];
            return next;
          });
        }
      },
      [options],
    );

    const clearFieldHighlight = useCallback((itemId: string, key: LineItemFieldKey) => {
      setAutoPopulatedFields((prev) => {
        const current = prev[itemId];
        if (!current?.has(key)) return prev;
        const nextSet = new Set(current);
        nextSet.delete(key);
        const next = { ...prev };
        if (nextSet.size === 0) delete next[itemId];
        else next[itemId] = nextSet;
        return next;
      });
    }, []);

    const findNextRequiredField = useCallback(
      (values: LineItemFormValues): LineItemFieldKey | null => {
        const errors = validateLineItemForm(values, options);
        const fields = getLineItemFieldDefinitions(options).filter((f) => f.visible);
        return fields.find((f) => errors[f.key])?.key ?? null;
      },
      [options],
    );

    const focusFormField = useCallback((itemId: string, fieldKey: LineItemFieldKey) => {
      requestAnimationFrame(() => {
        const el = rowRefs.current
          .get(itemId)
          ?.querySelector<HTMLElement>(`[data-field="${fieldKey}"]`);
        el?.focus();
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }, []);

    const announceSaveSuccess = useCallback((message: string) => {
      setSaveAnnouncement(message);
      if (saveAnnouncementTimerRef.current) {
        window.clearTimeout(saveAnnouncementTimerRef.current);
      }
      saveAnnouncementTimerRef.current = window.setTimeout(() => {
        setSaveAnnouncement('');
        saveAnnouncementTimerRef.current = null;
      }, 4500);
    }, []);

    const dismissSaveAnnouncement = useCallback(() => {
      setSaveAnnouncement('');
      if (saveAnnouncementTimerRef.current) {
        window.clearTimeout(saveAnnouncementTimerRef.current);
        saveAnnouncementTimerRef.current = null;
      }
    }, []);

    const flashSavedRow = useCallback((itemId: string) => {
      setSavedFlashIds((prev) => new Set([...prev, itemId]));
      window.setTimeout(() => {
        setSavedFlashIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 2400);
    }, []);

    const focusTrailingBlankRow = useCallback(() => {
      if (!autoPopulateBlankRow) return;
      focusBlankRowRef.current = true;
    }, [autoPopulateBlankRow]);

    const openItemSelect = useCallback(
      (lineItemId: string) => {
        if (disabled) return;
        const item = items.find((i) => i.id === lineItemId);
        if (!item) return;

        setExpandedIds((prev) => new Set([...prev, lineItemId]));
        if (!editingIds.has(lineItemId)) {
          enterEditMode(
            lineItemId,
            item,
            isBlankLineItem(item) || unsavedNewIds.has(lineItemId),
          );
        }

        // Open immediately — InventorySearchButton uses pointerdown before blur/click races
        itemSelectOpenedAtRef.current = Date.now();
        setItemSelectTargetId(lineItemId);
      },
      [disabled, editingIds, enterEditMode, items, unsavedNewIds],
    );

    const applyInventorySelection = useCallback(
      (catalogItem: InventoryCatalogItem) => {
        if (!itemSelectTargetId || disabled) return;
        const lineItemId = itemSelectTargetId;
        const populated = catalogItemToLineItemFields(catalogItem);
        const highlightKeys = new Set<LineItemFieldKey>(
          catalogPopulatedFieldKeys(catalogItem) as LineItemFieldKey[],
        );

        const mergeValues = (base: LineItemFormValues): LineItemFormValues => ({
          ...base,
          ...populated,
          quantity: base.quantity > 0 ? base.quantity : 1,
        });

        const item = items.find((i) => i.id === lineItemId);
        if (!item) return;

        const baseValues = draftValues[lineItemId] ?? toFormValues(item);
        const nextValues = mergeValues(baseValues);

        if (!editingIds.has(lineItemId)) {
          setEditingIds((prev) => new Set([...prev, lineItemId]));
          setDraftTouched((prev) => ({ ...prev, [lineItemId]: {} }));
          setSaveAttemptedIds((prev) => {
            const next = new Set(prev);
            next.delete(lineItemId);
            return next;
          });
        }

        setDraftValues((prev) => ({ ...prev, [lineItemId]: nextValues }));
        setDraftErrors((prev) => ({
          ...prev,
          [lineItemId]: validateLineItemForm(nextValues, options),
        }));
        setAutoPopulatedFields((prev) => ({ ...prev, [lineItemId]: highlightKeys }));
        setExpandedIds((prev) => new Set([...prev, lineItemId]));
        setItemSelectTargetId(null);

        const nextRequired = findNextRequiredField(nextValues);
        if (nextRequired) {
          focusFormField(lineItemId, nextRequired);
        }
      },
      [
        disabled,
        draftValues,
        editingIds,
        findNextRequiredField,
        focusFormField,
        itemSelectTargetId,
        items,
        options,
      ],
    );

    const blurDraftField = useCallback(
      (itemId: string, key: LineItemFieldKey) => {
        setDraftTouched((prev) => ({
          ...prev,
          [itemId]: { ...(prev[itemId] || {}), [key]: true },
        }));
        const draft = draftValues[itemId];
        if (draft) {
          setDraftErrors((prev) => ({
            ...prev,
            [itemId]: validateLineItemForm(draft, options),
          }));
        }
      },
      [draftValues, options],
    );

    const itemsForValidation = useMemo(
      () => (autoPopulateBlankRow ? filledLineItems(items) : items),
      [autoPopulateBlankRow, items],
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
      setDeleteConfirm({ ids: Array.from(selectedIds), source: 'bulk' });
    };

    const requestQuoteForSelected = () => {
      if (selectedIds.size === 0 || !onRequestQuote) return;
      onRequestQuote(Array.from(selectedIds));
      setSelectedIds(new Set());
    };

    const subtotalAll = itemsForValidation.reduce((s, i) => s + i.subtotal, 0);
    const taxTotal = showTax ? itemsForValidation.reduce((s, i) => s + i.subtotal * 0.1, 0) : 0; // demo 10 % rate
    const totalItemErrors = itemsForValidation.reduce((n, i) => {
      const itemIndex = items.findIndex((item) => item.id === i.id);
      return n + (getErrorCount(i, itemIndex) > 0 ? 1 : 0);
    }, 0);
    const filledItemCount = itemsForValidation.length;
    const hasTrailingBlankDraft =
      autoPopulateBlankRow &&
      items.length > 0 &&
      isBlankLineItem(items[items.length - 1]);
    /** V3: toolbar Add only for true empty state; continuous entry uses the trailing blank row. */
    const showAddItemButton =
      !disabled &&
      (!autoPopulateBlankRow || (filledItemCount === 0 && !hasTrailingBlankDraft));

    const finalizeItemsAfterRemoval = useCallback(
      (next: PRLineItem[]) => {
        if (!autoPopulateBlankRow) return next;
        if (filledLineItems(next).length === 0) return [];
        return next;
      },
      [autoPopulateBlankRow],
    );

    const guardUnsavedDraft = useCallback(
      (itemId: string, action: () => void) => {
        const draft = draftValues[itemId];
        const item = items.find((i) => i.id === itemId);
        if (!draft || !item || !editingIds.has(itemId)) {
          action();
          return;
        }
        if (!isDraftDirty(draft, item, unsavedNewIds.has(itemId))) {
          exitEditMode(itemId);
          action();
          return;
        }
        setUnsavedPrompt({ itemId, action });
      },
      [draftValues, editingIds, exitEditMode, items, unsavedNewIds],
    );

    const confirmDiscardUnsaved = useCallback(() => {
      if (!unsavedPrompt) return;
      const { itemId, action } = unsavedPrompt;
      if (unsavedNewIds.has(itemId)) {
        onChange(finalizeItemsAfterRemoval(items.filter((i) => i.id !== itemId)));
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
      exitEditMode(itemId);
      setUnsavedPrompt(null);
      action();
    }, [exitEditMode, finalizeItemsAfterRemoval, items, onChange, unsavedNewIds, unsavedPrompt]);

    const focusOrCreateBlank = useCallback(() => {
      if (!autoPopulateBlankRow) {
        setFormModal({ mode: 'add' });
        return;
      }
      focusBlankRowRef.current = false;
      const last = items[items.length - 1];
      if (last && isBlankLineItem(last)) {
        setExpandedIds((prev) => new Set([...prev, last.id]));
        enterEditMode(last.id, last, unsavedNewIds.has(last.id) || !last.item.trim());
        requestAnimationFrame(() => focusFormField(last.id, 'description'));
        return;
      }
      const blank = createBlankLineItem(`blank-${Date.now()}`, defaultVendor, options);
      onChange([...items, blank]);
      enterEditMode(blank.id, blank, true);
      requestAnimationFrame(() => focusFormField(blank.id, 'description'));
    }, [
      autoPopulateBlankRow,
      defaultVendor,
      enterEditMode,
      focusFormField,
      items,
      onChange,
      options,
      unsavedNewIds,
    ]);

    const handleAddItem = useCallback(() => {
      if (disabled) return;
      const dirtyId = [...editingIds].find((id) => {
        const draft = draftValues[id];
        const item = items.find((i) => i.id === id);
        return draft && item && isDraftDirty(draft, item, unsavedNewIds.has(id));
      });
      if (dirtyId) {
        guardUnsavedDraft(dirtyId, focusOrCreateBlank);
        return;
      }
      focusOrCreateBlank();
    }, [
      disabled,
      draftValues,
      editingIds,
      focusOrCreateBlank,
      guardUnsavedDraft,
      items,
      unsavedNewIds,
    ]);

    // ── Expose imperative handle ──────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      focusFirstError() {
        const first = itemsForValidation.find((i) => {
          const itemIndex = items.findIndex((item) => item.id === i.id);
          return getErrorCount(i, itemIndex) > 0;
        });
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
      if (!deleteConfirm) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setDeleteConfirm(null);
      };
      const onPointerDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-delete-confirm]')) return;
        setDeleteConfirm(null);
      };
      document.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onPointerDown);
      return () => {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('mousedown', onPointerDown);
      };
    }, [deleteConfirm]);

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

    // ── V3: keep a trailing blank row for continuous item entry ─────────────
    useEffect(() => {
      if (!autoPopulateBlankRow || disabled || items.length === 0) return;

      const last = items[items.length - 1];
      if (isBlankLineItem(last)) return;

      const blank = createBlankLineItem(`blank-${Date.now()}`, defaultVendor, options);
      onChange([...items, blank]);
    }, [autoPopulateBlankRow, disabled, defaultVendor, items, onChange, options]);

    // Focus trailing blank row only after explicit Add or successful Save
    useEffect(() => {
      if (!autoPopulateBlankRow || disabled || !focusBlankRowRef.current) return;
      const last = items[items.length - 1];
      if (!last || !isBlankLineItem(last)) return;

      const otherEditing = [...editingIds].filter((id) => id !== last.id);
      if (otherEditing.length > 0) return;

      if (!editingIds.has(last.id)) {
        enterEditMode(last.id, last, true);
      }

      requestAnimationFrame(() => {
        focusFormField(last.id, 'description');
        rowRefs.current.get(last.id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        focusBlankRowRef.current = false;
      });
    }, [autoPopulateBlankRow, disabled, editingIds, enterEditMode, focusFormField, items]);

    // Warn before page unload when drafts are dirty
    useEffect(() => {
      const handler = (e: BeforeUnloadEvent) => {
        if (hasAnyUnsavedDrafts(editingIds, draftValues, items, unsavedNewIds)) {
          e.preventDefault();
          e.returnValue = '';
        }
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }, [draftValues, editingIds, items, unsavedNewIds]);

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
    // ── Expand/collapse ───────────────────────────────────────────────────────
    const doToggleExpand = (id: string) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const toggleExpand = (id: string) => {
      if (expandedIds.has(id) && editingIds.has(id)) {
        guardUnsavedDraft(id, () => doToggleExpand(id));
        return;
      }
      doToggleExpand(id);
    };
    const expandAll = () => setExpandedIds(new Set(filteredItems.map((i) => i.id)));
    const collapseAll = () => setExpandedIds(new Set());

    const handleInlineSave = async (itemId: string) => {
      if (savingIds.has(itemId)) return;
      const draft = draftValues[itemId];
      if (!draft || disabled) return;

      const fieldDefsAll = getLineItemFieldDefinitions(options).filter((f) => f.visible);
      const nextErrors = validateLineItemForm(draft, options);

      setSaveAttemptedIds((prev) => new Set([...prev, itemId]));
      setDraftErrors((prev) => ({ ...prev, [itemId]: nextErrors }));
      setDraftTouched((prev) => ({
        ...prev,
        [itemId]: Object.fromEntries(fieldDefsAll.map((f) => [f.key, true])) as Partial<
          Record<LineItemFieldKey, boolean>
        >,
      }));

      if (hasLineItemErrors(nextErrors)) {
        requestAnimationFrame(() => {
          const firstKey = fieldDefsAll.find((f) => nextErrors[f.key])?.key;
          if (!firstKey) return;
          const el = rowRefs.current
            .get(itemId)
            ?.querySelector<HTMLElement>(`[data-field="${firstKey}"]`);
          el?.focus();
        });
        return;
      }

      setSavingIds((prev) => new Set([...prev, itemId]));
      setSaveErrorIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });

      try {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 300);
        });

        const wasNew = unsavedNewIds.has(itemId);
        onChange(
          items.map((i) =>
            i.id === itemId ? fromFormValues(i.id, { ...draft, glAccounts: [] }) : i,
          ),
        );
        exitEditMode(itemId);
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
        flashSavedRow(itemId);
        announceSaveSuccess(
          wasNew
            ? 'Item saved — continue with the next row below.'
            : 'Changes saved successfully.',
        );
        if (autoPopulateBlankRow) {
          focusTrailingBlankRow();
        }
        if (wasNew) onItemAdded?.(draft.description);
      } catch {
        setSaveErrorIds((prev) => new Set([...prev, itemId]));
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    };

    const handleCancelEdit = (itemId: string) => {
      if (disabled) return;
      if (unsavedNewIds.has(itemId)) {
        onChange(finalizeItemsAfterRemoval(items.filter((i) => i.id !== itemId)));
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
      exitEditMode(itemId);
    };

    // Keyboard: Ctrl/Cmd+Enter saves the active inline edit
    useEffect(() => {
      if (editingIds.size === 0 || disabled) return;
      const onKey = (e: KeyboardEvent) => {
        if (!(e.metaKey || e.ctrlKey) || e.key !== 'Enter') return;
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA') return;
        const activeId = [...editingIds][0];
        if (!activeId || savingIds.has(activeId)) return;
        e.preventDefault();
        handleInlineSave(activeId);
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
      // handleInlineSave is stable enough for this session-scoped shortcut
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled, editingIds, savingIds]);

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
        let next = [...items];
        const last = next[next.length - 1];
        if (autoPopulateBlankRow && last && isBlankLineItem(last)) {
          exitEditMode(last.id);
          next[next.length - 1] = newItem;
        } else {
          next = [...next, newItem];
        }
        onChange(next);
        onItemAdded?.(data.description);
        setExpandedIds((prev) => new Set([...prev, newItem.id]));
      }
      setFormModal(null);
    };

    // ── Inline editing ────────────────────────────────────────────────────────
    const startInline = (
      id: string,
      field: InlineEdit['field'],
      currentVal: string | number,
      e?: MouseEvent,
    ) => {
      if (disabled || editingIds.has(id)) return;
      e?.stopPropagation();
      setInlineEdit({ id, field });
      setInlineValue(String(currentVal));
    };

    const commitInline = () => {
      if (!inlineEdit) return;
      const { id, field } = inlineEdit;
      onChange(
        items.map((item) => {
          if (item.id !== id) return item;
          if (field === 'description') return { ...item, item: inlineValue.trim() };
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

    const stopRowToggle = (e: MouseEvent) => {
      e.stopPropagation();
    };

    const isBulkDeletePending = deleteConfirm?.source === 'bulk';

    const confirmDelete = () => {
      if (!deleteConfirm?.ids.length || disabled) return;
      const idsToRemove = new Set(deleteConfirm.ids);
      onChange(finalizeItemsAfterRemoval(items.filter((i) => !idsToRemove.has(i.id))));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        deleteConfirm.ids.forEach((id) => next.delete(id));
        return next;
      });
      setDeleteConfirm(null);
      onItemRemoved?.(deleteConfirm.ids.length);
    };

    const cancelDelete = () => setDeleteConfirm(null);

    const performRowEdit = (item: PRLineItem) => {
      if (autoPopulateBlankRow) {
        setExpandedIds((prev) => new Set([...prev, item.id]));
        enterEditMode(item.id, item, isBlankLineItem(item) || unsavedNewIds.has(item.id));
      } else {
        setFormModal({ mode: 'edit', itemId: item.id });
      }
    };

    const handleRowEdit = (item: PRLineItem) => {
      if (disabled) return;
      const otherEditing = [...editingIds].find((id) => id !== item.id);
      if (otherEditing) {
        guardUnsavedDraft(otherEditing, () => performRowEdit(item));
        return;
      }
      performRowEdit(item);
    };

    // ── Shared inline cell ────────────────────────────────────────────────────
    const InlineCell = ({
      id,
      field,
      display,
      type = 'text',
      bold,
      muted,
      editValue,
      placeholder,
      currency = false,
      inline = false,
    }: {
      id: string;
      field: InlineEdit['field'];
      display: string;
      type?: 'text' | 'number';
      bold?: boolean;
      muted?: boolean;
      editValue?: string | number;
      placeholder?: string;
      currency?: boolean;
      inline?: boolean;
    }) => {
      const active = isInline(id, field);
      const resolvedEditValue = editValue ?? display.replace(/^[^\d.-]+/, '').replace(/,/g, '');

      const inputStyle: React.CSSProperties = {
        width: inline ? '88px' : '100%',
        height: '30px',
        border: `1.5px solid ${P2P_BRAND.primary}`,
        borderRadius: '4px',
        padding: currency ? '0 8px 0 36px' : '0 8px',
        fontSize: '13px',
        fontFamily: F,
        color: '#101828',
        outline: 'none',
        background: P2P_BRAND.surface,
        boxSizing: 'border-box',
      };

      if (active) {
        const input = (
          <input
            autoFocus
            type={type}
            value={inlineValue}
            placeholder={placeholder}
            data-inline-cell
            onMouseDown={stopRowToggle}
            onClick={stopRowToggle}
            onChange={(e) => setInlineValue(e.target.value)}
            onBlur={commitInline}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitInline();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                cancelInline();
              }
            }}
            style={inputStyle}
          />
        );

        if (currency) {
          return (
            <div
              style={{ position: 'relative', width: '100%', minWidth: '88px' }}
              data-inline-cell
              onMouseDown={stopRowToggle}
              onClick={stopRowToggle}
            >
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '12px',
                  color: '#667085',
                  fontFamily: F,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
                {LINE_ITEM_CURRENCY_PREFIX}
              </span>
              {input}
            </div>
          );
        }

        return input;
      }

      const cellIdleStyle: React.CSSProperties = {
        fontSize: '13px',
        fontWeight: bold && !muted ? 700 : 400,
        color: muted ? '#98A2B3' : bold ? '#101828' : '#344054',
        fontStyle: muted ? 'italic' : undefined,
        fontFamily: F,
        cursor: disabled ? 'default' : 'text',
        padding: '4px 8px',
        borderRadius: '4px',
        display: inline ? 'inline-block' : 'block',
        minHeight: '28px',
        lineHeight: '20px',
        boxSizing: 'border-box',
        border: '1px solid transparent',
        background: 'transparent',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'middle',
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
          data-inline-cell
          tabIndex={disabled ? -1 : 0}
          title={disabled ? undefined : 'Click to edit'}
          onMouseDown={(e) => {
            stopRowToggle(e);
            if (!disabled) startInline(id, field, resolvedEditValue, e);
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              startInline(id, field, resolvedEditValue);
            }
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

    const DraftRowPrompt = ({
      onClick,
      label,
    }: {
      onClick: () => void;
      label: string;
    }) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        title="Start adding the next line item"
        style={draftRowPromptStyle}
      >
        {label}
      </button>
    );

    // ── Mobile card layout ────────────────────────────────────────────────────
    const MobileCard = ({ item, index }: { item: PRLineItem; index: number }) => {
      const isExpanded = expandedIds.has(item.id);
      const errorCount = getErrorCount(item, index);
      const itemErrors = getItemErrors(item);
      const rowDisplay = getRowDisplay(item);
      const isEditing = rowDisplay.isEditing;
      const isSavedFlash = savedFlashIds.has(item.id);
      const isDraftRow = autoPopulateBlankRow && isTrailingBlankItem(items, item, index);

      return (
        <div
          ref={(el) => { if (el) rowRefs.current.set(item.id, el); }}
          style={{
            background: isSavedFlash
              ? '#F6FEF9'
              : isDraftRow && !isEditing
                ? '#FAFBFC'
                : isEditing
                  ? P2P_BRAND.surface
                  : selectedIds.has(item.id)
                    ? '#FAFBFC'
                    : '#FFFFFF',
            border: isSavedFlash
              ? '1.5px solid #A7F3D0'
              : isDraftRow && !isEditing
                ? '1.5px dashed #D0D5DD'
                : isEditing
                  ? `1.5px solid ${P2P_BRAND.surfaceBorder}`
                  : errorCount > 0
                    ? '1.5px solid #FECDCA'
                    : '1px solid #E4E7EC',
            borderRadius: '10px',
            marginBottom: '10px',
            overflow: 'hidden',
            boxShadow: isSavedFlash
              ? 'inset 3px 0 0 #12B76A'
              : isDraftRow && !isEditing
                ? `inset 3px 0 0 ${P2P_BRAND.primary}`
                : undefined,
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
              aria-label={isExpanded ? 'Collapse details' : 'View item details'}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F }}>
                  #{index + 1}
                </span>
                {isEditing && (
                  <span style={editingBadgeStyle}>
                    {rowDisplay.isNew ? 'New item' : 'Editing'}
                  </span>
                )}
                {isDraftRow && !isEditing && (
                  <span style={draftRowBadgeStyle}>Next item</span>
                )}
                {errorCount > 0 && !isEditing && (
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
                {isSavedFlash && !isEditing && (
                  <span style={savedBadgeStyle} role="status">
                    <CheckCircle2 size={10} strokeWidth={2.5} aria-hidden />
                    Saved
                  </span>
                )}
              </div>
              {isEditing ? (
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: rowDisplay.muted ? 500 : 700,
                    color: rowDisplay.muted ? '#667085' : '#101828',
                    fontStyle: rowDisplay.muted ? 'italic' : undefined,
                    fontFamily: F,
                    minWidth: 0,
                  }}
                >
                  {rowDisplay.description}
                </div>
              ) : rowDisplay.isDraftBlank ? (
                <DraftRowPrompt
                  label={rowDisplay.description}
                  onClick={() => handleRowEdit(item)}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <InlineCell
                      id={item.id}
                      field="description"
                      display={rowDisplay.description}
                      editValue={item.item}
                      placeholder="Add description…"
                      muted={rowDisplay.muted}
                      bold
                    />
                  </div>
                </div>
              )}
              {!isEditing && !rowDisplay.isDraftBlank && (
                <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>
                    {item.type || 'Goods'}
                    {item.unitOfMeasure ? ` · ${item.unitOfMeasure}` : ''}
                    {' · '}
                    {item.vendor}
                  </span>
                </div>
              )}
              {rowDisplay.isDraftBlank && !isEditing && (
                <div style={{ fontSize: '11px', color: '#667085', fontFamily: F, marginTop: '3px' }}>
                  Tap to start the next line item
                </div>
              )}
              {isEditing && !isExpanded && (
                <div style={{ fontSize: '11px', color: '#667085', fontFamily: F, marginTop: '3px' }}>
                  Expand to fill in item details
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              {!isEditing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleRowEdit(item)}
                    disabled={disabled}
                    title="Edit all fields"
                    style={iconButtonStyle}
                  >
                    <Edit3 size={14} color="#667085" strokeWidth={2} />
                  </button>
                </div>
              )}
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#101828', fontFamily: F }}>
                {fmtRs(rowDisplay.subtotal)}
              </div>
              <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginTop: '2px' }}>
                {isEditing ? (
                  <>
                    {rowDisplay.quantity} × {fmtRs(rowDisplay.cost)}
                  </>
                ) : (
                  <>
                    <InlineCell
                      id={item.id}
                      field="quantity"
                      display={String(item.quantity)}
                      editValue={item.quantity}
                      type="number"
                      inline
                    />
                    {' × '}
                    <InlineCell
                      id={item.id}
                      field="cost"
                      display={fmtRs(item.cost)}
                      editValue={item.cost}
                      type="number"
                      currency
                      inline
                    />
                  </>
                )}
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
                style={{ overflow: 'hidden', padding: isEditing ? '0 12px 0' : '0 12px 12px' }}
              >
                {isEditing ? (
                  renderExpandedPanel(item, itemErrors, autoPopulateBlankRow)
                ) : (
                  renderExpandedPanel(item, itemErrors, autoPopulateBlankRow)
                )}
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

    const getRowDisplay = (item: PRLineItem) => {
      const draft = draftValues[item.id];
      if (isItemEditing(item.id) && draft) {
        const isNew = isUnsavedNewItem(item.id);
        return {
          description: draft.description.trim() || (isNew ? 'New line item' : 'Editing…'),
          quantity: draft.quantity,
          cost: draft.cost,
          subtotal: draft.quantity * draft.cost,
          muted: !draft.description.trim(),
          isEditing: true,
          isNew,
          isDraftBlank: false,
        };
      }
      return {
        description:
          item.item ||
          (autoPopulateBlankRow && isBlankLineItem(item)
            ? 'Add next line item…'
            : 'Untitled item'),
        quantity: item.quantity,
        cost: item.cost,
        subtotal: item.subtotal,
        muted: autoPopulateBlankRow && isBlankLineItem(item),
        isEditing: false,
        isNew: false,
        isDraftBlank: autoPopulateBlankRow && isBlankLineItem(item),
      };
    };

    const editingBadgeStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '10px',
      fontWeight: 700,
      color: P2P_BRAND.primaryStrong,
      background: P2P_BRAND.surface,
      border: `1px solid ${P2P_BRAND.surfaceBorder}`,
      borderRadius: '999px',
      padding: '2px 8px',
      flexShrink: 0,
      fontFamily: F,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    };

    const renderExpandedPanel = (
      item: PRLineItem,
      itemErrors: LineItemValidationErrors,
      isV3: boolean,
    ) => {
      const isEditing = isItemEditing(item.id);
      const isNew = isUnsavedNewItem(item.id);
      const draft = draftValues[item.id];

      if (isEditing && draft) {
        const isSaving = savingIds.has(item.id);
        const saveFailed = saveErrorIds.has(item.id);
        return (
          <>
            <LineItemInlineForm
              itemId={item.id}
              values={draft}
              onChange={(values) => updateDraft(item.id, values)}
              onFieldBlur={(key) => blurDraftField(item.id, key)}
              onFieldManualEdit={(key) => clearFieldHighlight(item.id, key)}
              errors={draftErrors[item.id] || {}}
              touched={draftTouched[item.id] || {}}
              showAllErrors={saveAttemptedIds.has(item.id)}
              options={options}
              isNewItem={isNew}
              autoFocus={isNew && !autoPopulatedFields[item.id]?.size}
              highlightedFields={autoPopulatedFields[item.id]}
              onOpenItemSearch={() => openItemSelect(item.id)}
              onSaveRequest={() => handleInlineSave(item.id)}
            />
            <div style={{ ...expandedDetailFooterStyle, flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #EEF1F5', padding: '11px 0 0', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => handleInlineSave(item.id)}
                disabled={disabled || isSaving}
                aria-busy={isSaving}
                style={{
                  ...primaryButtonStyle,
                  height: '32px',
                  opacity: disabled || isSaving ? 0.65 : 1,
                  cursor: disabled || isSaving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} strokeWidth={2.5} aria-hidden className="animate-spin" />
                    Saving…
                  </>
                ) : isNew ? (
                  'Save item'
                ) : (
                  'Save changes'
                )}
              </button>
              <button
                type="button"
                onClick={() => handleCancelEdit(item.id)}
                disabled={disabled || isSaving}
                style={{
                  ...secondaryButtonStyle,
                  height: '32px',
                  opacity: isSaving ? 0.5 : 1,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {isNew ? 'Discard' : 'Cancel'}
              </button>
              {!isSaving && (
                <span style={saveShortcutHintStyle}>Ctrl+Enter to save</span>
              )}
              {saveFailed && (
                <span
                  role="alert"
                  style={{
                    flexBasis: '100%',
                    fontSize: '11px',
                    color: '#B42318',
                    fontFamily: F,
                    fontWeight: 500,
                  }}
                >
                  Save failed. Please try again.
                </span>
              )}
            </div>
          </>
        );
      }

      return (
        <>
          <div style={expandedDetailBodyStyle}>
            <div style={expandedDetailGridStyle}>
              {fieldDefs
                .filter((f) => f.visible)
                .map((field) => {
                  const hasError = Boolean(itemErrors[field.key]);
                  return (
                    <div key={field.key}>
                      <div style={expandedFieldLabelStyle}>{field.label}</div>
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

          <div style={{ ...expandedDetailFooterStyle, borderTop: '1px solid #EEF1F5', marginTop: '4px' }}>
            {isV3 && (
              <button
                type="button"
                onClick={() => handleRowEdit(item)}
                disabled={disabled}
                style={{ ...secondaryButtonStyle, fontSize: '12px', height: '30px' }}
              >
                <Edit3 size={12} strokeWidth={2} aria-hidden />
                Edit fields
              </button>
            )}
            {onOpenGL && (
              <button
                type="button"
                onClick={() => onOpenGL(item.id)}
                style={{ ...secondaryButtonStyle, fontSize: '12px', height: '30px' }}
              >
                GL distribution ({item.glAccountsCount || 1})
              </button>
            )}
            {onOpenBudget && (
              <button
                type="button"
                onClick={() => onOpenBudget(item.id)}
                style={{ ...secondaryButtonStyle, fontSize: '12px', height: '30px' }}
              >
                <DollarSign size={12} color="#EF4444" strokeWidth={2} aria-hidden />
                Check budget
              </button>
            )}
            {onOpenBudgetReport && (
              <button
                type="button"
                onClick={() => onOpenBudgetReport(item.id)}
                style={{ ...secondaryButtonStyle, fontSize: '12px', height: '30px' }}
              >
                <ExternalLink size={12} strokeWidth={2} aria-hidden />
                Budget report
              </button>
            )}
          </div>
        </>
      );
    };

    const isV3Layout = autoPopulateBlankRow;
    const desktopColCount = isV3Layout ? 8 : showTax ? 12 : 11;
    const tableMinWidth = isV3Layout ? '640px' : '1080px';

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
              Line Items — Focus Mode
            </span>
            <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>
              {filledItemCount} item{filledItemCount !== 1 ? 's' : ''} · {fmtRs(subtotalAll + taxTotal)} total
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

        {/* Screen reader announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {saveAnnouncement}
        </div>

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

          {showAddItemButton && (
            <button
              type="button"
              onClick={handleAddItem}
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
          )}
        </div>

        {/* Save confirmation toast */}
        <AnimatePresence>
          {saveAnnouncement && (
            <motion.div
              key="save-toast"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
            >
              <div style={saveToastBarStyle} role="status" aria-live="polite">
                <CheckCircle2 size={15} color="#027A48" strokeWidth={2.25} aria-hidden />
                <span style={saveToastTextStyle}>{saveAnnouncement}</span>
                <button
                  type="button"
                  onClick={dismissSaveAnnouncement}
                  aria-label="Dismiss notification"
                  style={saveToastDismissStyle}
                >
                  <X size={14} color="#667085" strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interaction hint — V3 only, hidden while toast is visible */}
        {autoPopulateBlankRow && filledItemCount > 0 && !saveAnnouncement && !isMobile && (
          <div style={interactionHintBarStyle}>
            Expand a row to view details · Edit icon to change fields · Search inventory when adding or editing a row
          </div>
        )}

        {/* Bulk selection bar */}
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

        {/* Mobile card list */}
        {isMobile ? (
          <div style={{ padding: '12px 14px' }}>
            {filteredItems.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                onAdd={handleAddItem}
                hideAddButton={!showAddItemButton}
              />
            ) : (
              filteredItems.map((item) => (
                <MobileCard
                  key={item.id}
                  item={item}
                  index={items.findIndex((i) => i.id === item.id)}
                />
              ))
            )}
          </div>
        ) : (
          /* Desktop table */
          <div
            style={{
              overflowX: isV3Layout ? 'visible' : 'auto',
              flex: focusMode ? 1 : undefined,
              overflowY: focusMode ? 'auto' : deleteConfirm?.source === 'row' ? 'visible' : undefined,
            }}
          >
            <table
              role="table"
              aria-label="Line items"
              style={{ width: '100%', borderCollapse: 'collapse', minWidth: tableMinWidth }}
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
                  <th style={{ ...thStyle, minWidth: isV3Layout ? '180px' : '200px' }}>Description</th>
                  {!isV3Layout && (
                    <>
                      <th style={{ ...thStyle, minWidth: '140px' }}>GL account</th>
                      <th style={{ ...thStyle, width: '120px' }}>Vendor</th>
                      <th style={{ ...thStyle, width: '96px' }}>Required by</th>
                    </>
                  )}
                  <th style={{ ...thStyle, width: '64px' }}>Qty</th>
                  <th style={{ ...thStyle, width: '100px' }}>Unit cost</th>
                  {!isV3Layout && showTax && <th style={{ ...thStyle, width: '88px' }}>Tax</th>}
                  <th style={{ ...thStyle, width: '104px' }}>Subtotal</th>
                  <th
                    style={{
                      width: isV3Layout ? '96px' : '108px',
                      padding: '10px 14px',
                      ...(isV3Layout
                        ? { position: 'sticky', right: 0, background: '#F9FAFB', zIndex: 1 }
                        : {}),
                    }}
                  >
                    {isV3Layout && (
                      <span style={{ ...thStyle, padding: 0 }}>Actions</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredItems.map((item, index) => {
                    const itemIndex = items.findIndex((i) => i.id === item.id);
                    const isExpanded = expandedIds.has(item.id);
                    const errorCount = getErrorCount(item, itemIndex);
                    const itemErrors = getItemErrors(item);
                    const taxAmt = showTax ? item.subtotal * 0.1 : 0;
                    const gl = parseGlAccount(item.glAccount);
                    const requiredByLabel = formatRequiredBy(item.requiredBy);
                    const isDraftRow = autoPopulateBlankRow && isTrailingBlankItem(items, item, itemIndex);
                    const isRowSelected = selectedIds.has(item.id);
                    const rowDisplay = getRowDisplay(item);
                    const isEditing = rowDisplay.isEditing;

                    const isSavedFlash = savedFlashIds.has(item.id);

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
                              isSavedFlash
                                ? '#F6FEF9'
                                : isEditing
                                  ? P2P_BRAND.surface
                                  : errorCount > 0
                                    ? '#FFFBFA'
                                    : isDraftRow
                                      ? '#FAFBFC'
                                      : isRowSelected
                                        ? '#FAFBFC'
                                        : isExpanded
                                          ? '#FAFBFC'
                                          : hoveredRow === item.id
                                            ? '#FAFBFC'
                                            : '#FFFFFF',
                            outline: isEditing
                              ? `1px solid ${P2P_BRAND.surfaceBorder}`
                              : isDraftRow
                                ? '1px dashed #D0D5DD'
                                : undefined,
                            outlineOffset: isEditing || isDraftRow ? '-1px' : undefined,
                            boxShadow: isSavedFlash
                              ? 'inset 2px 0 0 #12B76A'
                              : isDraftRow && !isEditing
                                ? `inset 2px 0 0 ${P2P_BRAND.primary}`
                                : isEditing || hoveredRow === item.id || isExpanded
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
                              aria-expanded={isExpanded}
                              aria-controls={`line-item-detail-${item.id}`}
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

                          {/* # */}
                          <td style={{ padding: '12px 14px', fontSize: '12px', color: '#98A2B3', fontFamily: F }}>
                            {index + 1}
                          </td>

                          {/* Description — compact preview only; full form lives in expanded panel */}
                          <td style={{ padding: '12px 14px', maxWidth: '260px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  {isEditing && (
                                    <span style={editingBadgeStyle}>
                                      {rowDisplay.isNew ? 'New item' : 'Editing'}
                                    </span>
                                  )}
                                  {isDraftRow && !isEditing && (
                                    <span style={draftRowBadgeStyle}>Next item</span>
                                  )}
                                  {isEditing ? (
                                    <span
                                      style={{
                                        fontSize: '13px',
                                        fontWeight: rowDisplay.muted ? 500 : 700,
                                        color: rowDisplay.muted ? '#667085' : '#101828',
                                        fontStyle: rowDisplay.muted ? 'italic' : undefined,
                                        fontFamily: F,
                                        minWidth: 0,
                                        flex: 1,
                                      }}
                                    >
                                      {rowDisplay.description}
                                    </span>
                                  ) : rowDisplay.isDraftBlank ? (
                                    <DraftRowPrompt
                                      label={rowDisplay.description}
                                      onClick={() => handleRowEdit(item)}
                                    />
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                                      <div style={{ minWidth: 0, flex: 1 }}>
                                        <InlineCell
                                          id={item.id}
                                          field="description"
                                          display={rowDisplay.description}
                                          editValue={item.item}
                                          placeholder="Add description…"
                                          muted={rowDisplay.muted}
                                          bold
                                        />
                                      </div>
                                    </div>
                                  )}
                                  {!isExpanded && !isEditing && (
                                  <>
                                    <span style={typeChipStyle}>{item.type || 'Goods'}</span>
                                    {isV3Layout && item.vendor && (
                                      <span
                                        style={{
                                          fontSize: '11px',
                                          color: '#98A2B3',
                                          fontFamily: F,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          maxWidth: '120px',
                                        }}
                                      >
                                        {item.vendor}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                              {!isExpanded && !isEditing && item.unitOfMeasure && (
                                <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginTop: '3px' }}>
                                  {item.quantity} {item.unitOfMeasure.toLowerCase()}
                                  {!isV3Layout && item.vendorTerms ? ` · ${item.vendorTerms}` : ''}
                                  {isV3Layout && gl.code ? ` · GL ${gl.code}` : ''}
                                </div>
                              )}
                              {isEditing && !isExpanded && (
                                <div style={{ fontSize: '11px', color: '#667085', fontFamily: F, marginTop: '3px' }}>
                                  Expand row to fill in item details
                                </div>
                              )}
                              </div>
                                  {errorCount > 0 && !isEditing && (
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
                              {isSavedFlash && !isEditing && (
                                <span style={savedBadgeStyle} role="status">
                                  <CheckCircle2 size={10} strokeWidth={2.5} aria-hidden />
                                  Saved
                                </span>
                              )}
                            </div>
                          </td>

                          {!isV3Layout && (
                            <>
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
                            </>
                          )}

                          {/* Qty — inline editable when collapsed */}
                          <td style={{ padding: '12px 14px' }}>
                            {isEditing ? (
                              <span style={{ fontSize: '13px', color: '#344054', fontFamily: F }}>
                                {rowDisplay.quantity}
                              </span>
                            ) : (
                              <InlineCell
                                id={item.id}
                                field="quantity"
                                display={String(item.quantity)}
                                editValue={item.quantity}
                                type="number"
                                inline
                              />
                            )}
                          </td>

                          {/* Unit cost — inline editable */}
                          <td style={{ padding: '12px 14px' }}>
                            {isEditing ? (
                              <span style={{ fontSize: '13px', color: '#344054', fontFamily: F }}>
                                {fmtRs(rowDisplay.cost)}
                              </span>
                            ) : (
                              <InlineCell
                                id={item.id}
                                field="cost"
                                display={fmtRs(item.cost)}
                                editValue={item.cost}
                                type="number"
                                currency
                              />
                            )}
                          </td>

                          {/* Tax */}
                          {!isV3Layout && showTax && (
                            <td style={{ padding: '12px 14px', fontSize: '13px', color: '#667085', fontFamily: F }}>
                              {fmtRs(taxAmt)}
                            </td>
                          )}

                          {/* Sub total */}
                          <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: '#101828', fontFamily: F }}>
                            {fmtRs(isEditing ? rowDisplay.subtotal : item.subtotal)}
                          </td>

                          {/* Actions */}
                          <td
                            style={{
                              padding: '12px 14px',
                              ...(isV3Layout
                                ? {
                                    position: 'sticky',
                                    right: 0,
                                    background:
                                      isSavedFlash
                                        ? '#F6FEF9'
                                        : isEditing
                                          ? P2P_BRAND.surface
                                          : errorCount > 0
                                            ? '#FFFBFA'
                                            : isDraftRow
                                              ? '#FAFBFC'
                                              : isRowSelected || isExpanded || hoveredRow === item.id
                                                ? '#FAFBFC'
                                                : '#FFFFFF',
                                    zIndex: 1,
                                  }
                                : {}),
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '4px',
                                opacity: isV3Layout || hoveredRow === item.id || isExpanded ? 1 : 0.6,
                                transition: 'opacity 0.12s',
                              }}
                            >
                              {isV3Layout ? (
                                !isEditing ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRowEdit(item)}
                                    disabled={disabled}
                                    title="Edit all fields"
                                    aria-label="Edit all fields"
                                    style={iconButtonStyle}
                                  >
                                    <Edit3 size={14} color="#667085" strokeWidth={2} />
                                  </button>
                                ) : null
                              ) : (
                                <>
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
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expanded detail row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              key={`${item.id}-details`}
                              id={`line-item-detail-${item.id}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <td
                                colSpan={desktopColCount}
                                style={{
                                  padding: isEditing ? '4px 14px 12px 58px' : '4px 14px 12px 58px',
                                  borderBottom: '1px solid #E4E7EC',
                                  background: '#FFFFFF',
                                }}
                              >
                                {renderExpandedPanel(item, itemErrors, isV3Layout)}
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
                      <EmptyState
                        searchQuery={searchQuery}
                        onAdd={handleAddItem}
                        hideAddButton={!showAddItemButton}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer totals */}
        {filledItemCount > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: '12px 16px',
              borderTop: '2px solid #E4E7EC',
              background: '#F9FAFB',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
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

        <UnsavedChangesDialog
          open={Boolean(unsavedPrompt)}
          onConfirm={confirmDiscardUnsaved}
          onCancel={() => setUnsavedPrompt(null)}
        />

        {itemSelectTargetId && (
          <SelectItemModal
            open
            openedAt={itemSelectOpenedAtRef.current}
            onClose={() => setItemSelectTargetId(null)}
            onConfirm={applyInventorySelection}
          />
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
  hideAddButton = false,
}: {
  searchQuery: string;
  onAdd: () => void;
  hideAddButton?: boolean;
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
      <div style={{ fontSize: '13px', marginBottom: '16px', maxWidth: '320px', margin: '0 auto 16px' }}>
        {searchQuery
          ? 'Try a different search term or clear the search.'
          : 'Add your first item to get started.'}
      </div>
      {!searchQuery && !hideAddButton && (
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

const expandedDetailBodyStyle: React.CSSProperties = {
  padding: '11px 0 0',
  background: 'transparent',
};

const expandedDetailGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
  gap: '12px 16px',
};

const expandedDetailFooterStyle: React.CSSProperties = {
  padding: '10px 0 0',
  borderTop: 'none',
  background: 'transparent',
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  alignItems: 'center',
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

const savedBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  fontSize: '10px',
  fontWeight: 700,
  color: '#027A48',
  background: '#ECFDF3',
  border: '1px solid #A7F3D0',
  borderRadius: '999px',
  padding: '2px 7px',
  flexShrink: 0,
  fontFamily: F,
};

const saveShortcutHintStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#98A2B3',
  fontFamily: F,
  fontWeight: 500,
  marginLeft: 'auto',
};

const saveToastBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 16px',
  background: '#F6FEF9',
  borderBottom: '1px solid #A7F3D0',
};

const saveToastTextStyle: React.CSSProperties = {
  flex: 1,
  fontSize: '13px',
  fontWeight: 500,
  color: '#027A48',
  fontFamily: F,
  lineHeight: 1.4,
};

const saveToastDismissStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  border: 'none',
  borderRadius: '6px',
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

const interactionHintBarStyle: React.CSSProperties = {
  padding: '6px 16px',
  borderBottom: '1px solid #F2F4F7',
  background: '#FAFBFC',
  fontSize: '11px',
  color: '#98A2B3',
  fontFamily: F,
  lineHeight: 1.45,
  flexShrink: 0,
};

const draftRowBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '10px',
  fontWeight: 700,
  color: P2P_BRAND.primaryStrong,
  background: P2P_BRAND.surface,
  border: `1px solid ${P2P_BRAND.surfaceBorder}`,
  borderRadius: '999px',
  padding: '2px 8px',
  flexShrink: 0,
  fontFamily: F,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

const draftRowPromptStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  padding: '3px 0',
  margin: 0,
  fontSize: '13px',
  fontWeight: 500,
  fontStyle: 'italic',
  color: '#667085',
  fontFamily: F,
  cursor: 'pointer',
  textAlign: 'left',
  minWidth: 0,
  flex: 1,
  transition: 'color 0.12s',
};
