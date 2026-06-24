import { useEffect, useRef, useState } from 'react';
import { ChevronDown, AlertCircle, Search } from 'lucide-react';
import {
  createDefaultPurchaseRequestOptions,
  type PurchaseRequestOptionsState,
} from '../../data/purchaseRequestOptions';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import { P2P_BRAND } from '../../tokens/brand';
import { getVisibleFieldsBySection, type LineItemFieldKey } from './lineItemFieldConfig';
import type { LineItemFormValues, LineItemValidationErrors } from './lineItemValidation';
import {
  LINE_ITEM_GL_ACCOUNTS,
  LINE_ITEM_PROJECT_ACCOUNTS,
  LINE_ITEM_TAX_GROUPS,
  LINE_ITEM_TYPES,
  LINE_ITEM_UNITS,
  LINE_ITEM_VENDOR_TERMS,
  LINE_ITEM_VENDORS,
} from './lineItemFieldOptions';
import { LINE_ITEM_CURRENCY_PREFIX } from './lineItemCurrency';

export type LineItemInlineFormProps = {
  itemId: string;
  values: LineItemFormValues;
  onChange: (values: LineItemFormValues) => void;
  onFieldBlur?: (key: LineItemFieldKey) => void;
  errors: LineItemValidationErrors;
  touched: Partial<Record<LineItemFieldKey, boolean>>;
  /** When true, show validation messages for all fields with errors (e.g. after Save). */
  showAllErrors?: boolean;
  options?: PurchaseRequestOptionsState;
  isNewItem?: boolean;
  autoFocus?: boolean;
  highlightedFields?: Set<LineItemFieldKey>;
  onOpenItemSearch?: () => void;
  onFieldManualEdit?: (key: LineItemFieldKey) => void;
  onSaveRequest?: () => void;
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#667085',
  fontFamily: F,
  marginBottom: '4px',
  lineHeight: 1.33,
};

/** Dense multi-column grid — uses horizontal space like the read-only detail reference. */
const fieldGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
  gap: '12px 16px',
  alignItems: 'start',
  padding: '11px 0',
};

export function LineItemInlineForm({
  itemId,
  values,
  onChange,
  onFieldBlur,
  errors,
  touched,
  showAllErrors = false,
  options = createDefaultPurchaseRequestOptions(),
  isNewItem = false,
  autoFocus = false,
  highlightedFields,
  onOpenItemSearch,
  onFieldManualEdit,
  onSaveRequest,
}: LineItemInlineFormProps) {
  const [focused, setFocused] = useState<string | null>(null);
  const [inventorySearchActive, setInventorySearchActive] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const sections = getVisibleFieldsBySection(options);
  const allFields = [
    ...sections.basic,
    ...sections.pricing,
    ...sections.vendor,
    ...sections.accounting,
  ];

  useEffect(() => {
    if (!autoFocus || !formRef.current) return;
    requestAnimationFrame(() => {
      const el = formRef.current?.querySelector<HTMLElement>('[data-field="description"]');
      el?.focus();
    });
  }, [autoFocus, itemId]);

  const setField = <K extends keyof LineItemFormValues>(key: K, value: LineItemFormValues[K]) => {
    onFieldManualEdit?.(key as LineItemFieldKey);
    onChange({ ...values, [key]: value });
  };

  const isHighlighted = (key: LineItemFieldKey) => Boolean(highlightedFields?.has(key));

  const showFieldError = (key: LineItemFieldKey) =>
    Boolean(errors[key] && (showAllErrors || touched[key]));

  const fieldBorder = (id: LineItemFieldKey) => {
    if (showFieldError(id)) return '#FDA29B';
    if (focused === id) return '#98A2B3';
    return '#D0D5DD';
  };

  const fieldShadow = (id: LineItemFieldKey) => {
    if (showFieldError(id)) return '0 0 0 3px rgba(240, 68, 56, 0.12)';
    if (focused === id) return '0 0 0 3px rgba(16, 24, 40, 0.06)';
    if (isHighlighted(id)) return '0 0 0 3px rgba(16, 24, 40, 0.04)';
    return 'none';
  };

  const inp = (id: LineItemFieldKey): React.CSSProperties => ({
    width: '100%',
    height: '36px',
    border: `1px solid ${fieldBorder(id)}`,
    borderRadius: '6px',
    padding: '0 12px',
    fontSize: '13px',
    color: '#101828',
    fontFamily: F,
    outline: 'none',
    background: '#FFFFFF',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: fieldShadow(id),
  });

  const sel = (id: LineItemFieldKey): React.CSSProperties => ({
    ...inp(id),
    appearance: 'none',
    paddingRight: '32px',
    cursor: 'pointer',
  });

  const FieldError = ({ fieldKey }: { fieldKey: LineItemFieldKey }) =>
    showFieldError(fieldKey) ? (
      <span
        role="alert"
        id={`li-inline-err-${itemId}-${fieldKey}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          color: '#B42318',
          fontFamily: F,
          marginTop: '3px',
        }}
      >
        <AlertCircle size={11} strokeWidth={2.5} aria-hidden />
        {errors[fieldKey]}
      </span>
    ) : null;

  const SelectWrap = ({ children }: { children: React.ReactNode }) => (
    <div style={{ position: 'relative' }}>
      {children}
      <ChevronDown
        size={14}
        color="#98A2B3"
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );

  const InventorySearchButton = ({ onClick }: { onClick: () => void }) => {
    const isFocused = focused === 'inventorySearch';

    return (
      <button
        type="button"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        title="Search inventory items"
        aria-label="Search inventory items"
        onFocus={() => setFocused('inventorySearch')}
        onBlur={() => setFocused((prev) => (prev === 'inventorySearch' ? null : prev))}
        onMouseEnter={() => setInventorySearchActive(true)}
        onMouseLeave={() => setInventorySearchActive(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }
        }}
        style={{
          width: '36px',
          height: '36px',
          flexShrink: 0,
          border: `1px solid ${isFocused ? P2P_BRAND.primary : P2P_BRAND.surfaceBorder}`,
          borderRadius: '6px',
          background: inventorySearchActive ? '#E4F7F0' : P2P_BRAND.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isFocused ? '0 0 0 3px rgba(31, 169, 122, 0.18)' : 'none',
          transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        }}
      >
        <Search size={16} color={P2P_BRAND.primaryStrong} strokeWidth={2.25} aria-hidden />
      </button>
    );
  };

  const renderField = (key: LineItemFieldKey, label: string, required?: boolean) => {
    const fieldId = `li-inline-${itemId}-${key}`;
    const fieldLabel = (
      <label htmlFor={fieldId} style={labelStyle}>
        {label}
        {required && <span style={{ color: '#F04438', marginLeft: '2px' }}>*</span>}
        {isHighlighted(key) && (
          <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 500, color: '#98A2B3' }}>
            · Auto-filled
          </span>
        )}
      </label>
    );

    const commonProps = {
      id: fieldId,
      'data-field': key,
      onFocus: () => setFocused(key),
      onBlur: () => {
        setFocused(null);
        onFieldBlur?.(key);
      },
      'aria-invalid': showFieldError(key) || undefined,
      'aria-describedby': showFieldError(key) ? `li-inline-err-${itemId}-${key}` : undefined,
    };

    switch (key) {
      case 'description':
        return (
          <div key={key} style={{ gridColumn: '1 / -1' }}>
            {fieldLabel}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input
                {...commonProps}
                value={values.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="What are you purchasing?"
                style={{
                  ...inp('description'),
                  flex: 1,
                  minWidth: 0,
                }}
              />
              {onOpenItemSearch && <InventorySearchButton onClick={onOpenItemSearch} />}
            </div>
            <FieldError fieldKey="description" />
          </div>
        );
      case 'type':
        return (
          <div key={key}>
            {fieldLabel}
            <SelectWrap>
              <select
                {...commonProps}
                value={values.type}
                onChange={(e) => setField('type', e.target.value)}
                style={sel('type')}
              >
                {LINE_ITEM_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </SelectWrap>
            <FieldError fieldKey="type" />
          </div>
        );
      case 'unitOfMeasure':
        return (
          <div key={key}>
            {fieldLabel}
            <SelectWrap>
              <select
                {...commonProps}
                value={values.unitOfMeasure}
                onChange={(e) => setField('unitOfMeasure', e.target.value)}
                style={sel('unitOfMeasure')}
              >
                {LINE_ITEM_UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </SelectWrap>
            <FieldError fieldKey="unitOfMeasure" />
          </div>
        );
      case 'quantity':
        return (
          <div key={key}>
            {fieldLabel}
            <input
              {...commonProps}
              type="number"
              min={0.01}
              step={0.01}
              value={values.quantity}
              onChange={(e) => setField('quantity', parseFloat(e.target.value) || 0)}
              style={inp('quantity')}
            />
            <FieldError fieldKey="quantity" />
          </div>
        );
      case 'cost':
        return (
          <div key={key}>
            {fieldLabel}
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '12px',
                  color: '#667085',
                  fontFamily: F,
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              >
                {LINE_ITEM_CURRENCY_PREFIX}
              </span>
              <input
                {...commonProps}
                type="number"
                min={0}
                step={0.01}
                value={values.cost}
                onChange={(e) => setField('cost', parseFloat(e.target.value) || 0)}
                style={{ ...inp('cost'), paddingLeft: '40px' }}
              />
            </div>
            <FieldError fieldKey="cost" />
          </div>
        );
      case 'taxGroup':
        return (
          <div key={key}>
            {fieldLabel}
            <SelectWrap>
              <select
                {...commonProps}
                value={values.taxGroup}
                onChange={(e) => setField('taxGroup', e.target.value)}
                style={sel('taxGroup')}
              >
                <option value="">Select tax group…</option>
                {LINE_ITEM_TAX_GROUPS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </SelectWrap>
            <FieldError fieldKey="taxGroup" />
          </div>
        );
      case 'vendor':
        return (
          <div key={key}>
            {fieldLabel}
            <SelectWrap>
              <select
                {...commonProps}
                value={values.vendor}
                onChange={(e) => setField('vendor', e.target.value)}
                style={sel('vendor')}
              >
                <option value="">Select vendor…</option>
                {LINE_ITEM_VENDORS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </SelectWrap>
            <FieldError fieldKey="vendor" />
          </div>
        );
      case 'vendorTerms':
        return (
          <div key={key}>
            {fieldLabel}
            <SelectWrap>
              <select
                {...commonProps}
                value={values.vendorTerms}
                onChange={(e) => setField('vendorTerms', e.target.value)}
                style={sel('vendorTerms')}
              >
                {LINE_ITEM_VENDOR_TERMS.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </SelectWrap>
          </div>
        );
      case 'requiredBy':
        return (
          <div key={key}>
            {fieldLabel}
            <input
              {...commonProps}
              type="date"
              value={values.requiredBy}
              onChange={(e) => setField('requiredBy', e.target.value)}
              style={inp('requiredBy')}
            />
            <FieldError fieldKey="requiredBy" />
          </div>
        );
      case 'glAccount':
        return (
          <div key={key}>
            {fieldLabel}
            <SelectWrap>
              <select
                {...commonProps}
                value={values.glAccount}
                onChange={(e) => setField('glAccount', e.target.value)}
                style={sel('glAccount')}
              >
                {LINE_ITEM_GL_ACCOUNTS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </SelectWrap>
            <FieldError fieldKey="glAccount" />
          </div>
        );
      case 'projectAccount':
        return (
          <div key={key}>
            {fieldLabel}
            <SelectWrap>
              <select
                {...commonProps}
                value={values.projectAccount}
                onChange={(e) => setField('projectAccount', e.target.value)}
                style={sel('projectAccount')}
              >
                <option value="">Select project…</option>
                {LINE_ITEM_PROJECT_ACCOUNTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </SelectWrap>
            <FieldError fieldKey="projectAccount" />
          </div>
        );
      default:
        return null;
    }
  };

  const errorCount = allFields.filter((f) => showFieldError(f.key)).length;

  return (
    <div
      ref={formRef}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          onSaveRequest?.();
        }
      }}
    >
      {isNewItem && (
        <p style={newItemHintStyle}>
          Search inventory or enter details below, then save to add another line item.
        </p>
      )}
      {errorCount > 0 && (
        <p
          role="status"
          style={{
            margin: '0 0 10px',
            fontSize: '12px',
            color: '#B42318',
            fontFamily: F,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <AlertCircle size={12} strokeWidth={2.5} aria-hidden />
          {errorCount} required field{errorCount !== 1 ? 's' : ''} need attention
        </p>
      )}

      <div style={fieldGridStyle} aria-label={isNewItem ? 'Add line item' : 'Edit line item'}>
        {allFields.map((field) => renderField(field.key, field.label, field.required))}
      </div>
    </div>
  );
}

const newItemHintStyle: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: '12px',
  color: '#667085',
  fontFamily: F,
  lineHeight: 1.45,
};
