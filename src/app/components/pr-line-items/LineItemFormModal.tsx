import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Plus, AlertCircle } from 'lucide-react';
import { GLDistributionModal } from '../GLDistributionModal';
import {
  createDefaultPurchaseRequestOptions,
  type PurchaseRequestOptionsState,
} from '../../data/purchaseRequestOptions';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import {
  getVisibleFieldsBySection,
  type LineItemFieldKey,
} from './lineItemFieldConfig';
import {
  validateLineItemForm,
  hasLineItemErrors,
  type LineItemFormValues,
  type LineItemValidationErrors,
} from './lineItemValidation';
import { fmtRs } from './PRLineItemsSection';
import { LINE_ITEM_CURRENCY_PREFIX } from './lineItemCurrency';

export type { LineItemFormValues };

const TYPES = ['Goods', 'Services', 'Fixed Assets', 'Inventory Item'];
const UNITS = ['Each', 'Box', 'Dozen', 'Kilogram', 'Meter', 'Liter', 'Piece', 'Kilo Gram (Kg)'];
const VENDOR_TERMS = ['Net 15', 'Net 30', 'Net 60', 'Net 90', 'Due on Receipt', 'COD'];
const TAX_GROUPS = ['Standard Tax', 'Tax diff percentage', 'Zero Rated', 'Exempt', 'Out of Scope'];
const VENDORS = ['84 Lumber', 'Vendor 1', 'Dell Technologies', 'Microsoft Corporation', 'Amazon Web Services'];
const PROJECT_ACCOUNTS = [
  'Project A - Operations',
  'Project B - Marketing',
  'Project C - Development',
  'General - Admin',
];
const GL_ACCOUNTS = [
  '6100 - Office Supplies',
  '6200 - Software & Licenses',
  'DEP 2:Bank:NEWSEGMENT:Test Sales',
];

type LineItemFormModalProps = {
  mode: 'add' | 'edit';
  initial?: Partial<LineItemFormValues>;
  options?: PurchaseRequestOptionsState;
  onClose: () => void;
  onSave: (
    data: LineItemFormValues & {
      glAccounts: Array<{ account: string; name: string; amount: number; percentage: number }>;
    },
  ) => void;
};

const emptyForm = (options: PurchaseRequestOptionsState): LineItemFormValues => ({
  description: '',
  type: 'Goods',
  unitOfMeasure: options.uomDefault || 'Each',
  quantity: 1,
  cost: 0,
  requiredBy: '',
  vendorTerms: 'Net 15',
  taxGroup: '',
  vendor: '',
  projectAccount: '',
  glAccount: GL_ACCOUNTS[0],
  glAccountsCount: 1,
});

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#667085',
  fontFamily: F,
  marginBottom: '4px',
  lineHeight: 1.33,
};

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1100) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1099px)');

    const update = () => {
      if (mobileQuery.matches) setBreakpoint('mobile');
      else if (tabletQuery.matches) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };

    update();
    mobileQuery.addEventListener('change', update);
    tabletQuery.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mobileQuery.removeEventListener('change', update);
      tabletQuery.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return breakpoint;
}

export function LineItemFormModal({
  mode,
  initial,
  options = createDefaultPurchaseRequestOptions(),
  onClose,
  onSave,
}: LineItemFormModalProps) {
  const [form, setForm] = useState<LineItemFormValues>(() => ({
    ...emptyForm(options),
    ...initial,
  }));
  const [errors, setErrors] = useState<LineItemValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<LineItemFieldKey, boolean>>>({});
  const [showGLModal, setShowGLModal] = useState(false);
  const [glAccounts, setGLAccounts] = useState<
    Array<{ account: string; name: string; amount: number; percentage: number }>
  >([]);
  const [focused, setFocused] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const modalWidth =
    breakpoint === 'mobile'
      ? '100%'
      : breakpoint === 'tablet'
        ? 'min(760px, calc(100vw - 40px))'
        : 'min(960px, calc(100vw - 48px))';

  useEffect(() => {
    setForm({ ...emptyForm(options), ...initial });
    setErrors({});
    setTouched({});
    setGLAccounts([]);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]',
    );
    if (focusables.length) focusables[0].focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const sections = useMemo(() => getVisibleFieldsBySection(options), [options]);

  const setField = <K extends keyof LineItemFormValues>(key: K, value: LineItemFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key as LineItemFieldKey]: true }));
  };

  const blurValidate = (key: LineItemFieldKey) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors(validateLineItemForm({ ...form }, options));
  };

  const handleSave = () => {
    const allFields = [
      ...sections.basic,
      ...sections.pricing,
      ...sections.vendor,
      ...sections.accounting,
    ];
    const nextErrors = validateLineItemForm(form, options);
    setErrors(nextErrors);
    setTouched(
      Object.fromEntries(allFields.map((f) => [f.key, true])) as Partial<
        Record<LineItemFieldKey, boolean>
      >,
    );
    if (hasLineItemErrors(nextErrors)) {
      const firstKey = allFields.find((f) => nextErrors[f.key])?.key;
      requestAnimationFrame(() => {
        const el = dialogRef.current?.querySelector<HTMLElement>(`[data-field="${firstKey}"]`);
        el?.focus();
      });
      return;
    }
    onSave({ ...form, glAccounts });
  };

  const fieldBorder = (id: LineItemFieldKey) => {
    if (touched[id] && errors[id]) return '#FDA29B';
    if (focused === id) return '#98A2B3';
    return '#D0D5DD';
  };

  const fieldBg = (_id: LineItemFieldKey) => '#FFFFFF';

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
    background: fieldBg(id),
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow:
      touched[id] && errors[id]
        ? '0 0 0 3px rgba(240, 68, 56, 0.12)'
        : focused === id
          ? '0 0 0 3px rgba(16, 24, 40, 0.06)'
          : 'none',
  });

  const sel = (id: LineItemFieldKey): React.CSSProperties => ({
    ...inp(id),
    appearance: 'none',
    paddingRight: '32px',
    cursor: 'pointer',
  });

  const showFieldError = (key: LineItemFieldKey) => Boolean(touched[key] && errors[key]);

  const FieldError = ({ fieldKey }: { fieldKey: LineItemFieldKey }) =>
    showFieldError(fieldKey) ? (
      <span
        role="alert"
        id={`li-err-${fieldKey}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          color: '#B42318',
          fontFamily: F,
          marginTop: '5px',
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

  const renderField = (key: LineItemFieldKey, label: string, required?: boolean) => {
    const fieldLabel = (
      <label htmlFor={`li-field-${key}`} style={labelStyle}>
        {label}
        {required && <span style={{ color: '#F04438', marginLeft: '2px' }}>*</span>}
      </label>
    );

    const commonProps = {
      id: `li-field-${key}`,
      'data-field': key,
      onFocus: () => setFocused(key),
      onBlur: () => {
        setFocused(null);
        blurValidate(key);
      },
      'aria-invalid': showFieldError(key) || undefined,
      'aria-describedby': showFieldError(key) ? `li-err-${key}` : undefined,
    };

    switch (key) {
      case 'description':
        return (
          <div key={key} style={{ gridColumn: '1 / -1' }}>
            <input
              {...commonProps}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="What are you purchasing?"
              aria-label="Description"
              aria-required={required || undefined}
              style={{ ...inp('description'), height: '42px', fontSize: '14px', fontWeight: 500 }}
            />
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
                value={form.type}
                onChange={(e) => setField('type', e.target.value)}
                style={sel('type')}
              >
                {TYPES.map((t) => (
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
                value={form.unitOfMeasure}
                onChange={(e) => setField('unitOfMeasure', e.target.value)}
                style={sel('unitOfMeasure')}
              >
                {UNITS.map((u) => (
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
              value={form.quantity}
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
                value={form.cost}
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
                value={form.taxGroup}
                onChange={(e) => setField('taxGroup', e.target.value)}
                style={sel('taxGroup')}
              >
                <option value="">Select tax group…</option>
                {TAX_GROUPS.map((t) => (
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
                value={form.vendor}
                onChange={(e) => setField('vendor', e.target.value)}
                style={sel('vendor')}
              >
                <option value="">Select vendor…</option>
                {VENDORS.map((v) => (
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
                value={form.vendorTerms}
                onChange={(e) => setField('vendorTerms', e.target.value)}
                style={sel('vendorTerms')}
              >
                {VENDOR_TERMS.map((v) => (
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
              value={form.requiredBy}
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
                value={form.glAccount}
                onChange={(e) => setField('glAccount', e.target.value)}
                style={sel('glAccount')}
              >
                {GL_ACCOUNTS.map((g) => (
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
                value={form.projectAccount}
                onChange={(e) => setField('projectAccount', e.target.value)}
                style={sel('projectAccount')}
              >
                <option value="">Select project…</option>
                {PROJECT_ACCOUNTS.map((p) => (
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

  const hasAccountingSection = sections.accounting.length > 0;
  const subtotalPreview = form.quantity * form.cost;
  const visibleErrorCount = Object.keys(errors).filter(
    (k) => touched[k as LineItemFieldKey] && errors[k as LineItemFieldKey],
  ).length;
  const allFields = [
    ...sections.basic,
    ...sections.pricing,
    ...sections.vendor,
    ...sections.accounting,
  ];

  const fieldGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(148px, 1fr))',
    gap: '12px 16px',
    alignItems: 'start',
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(16,24,40,0.4)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: isMobile ? 0 : '24px',
          backdropFilter: 'blur(3px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          ref={dialogRef}
          initial={isMobile ? { y: '100%' } : { scale: 0.96, opacity: 0 }}
          animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
          exit={isMobile ? { y: '100%' } : { scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="li-modal-title"
          style={{
            width: modalWidth,
            maxHeight: isMobile ? '92dvh' : 'min(860px, calc(100vh - 40px))',
            background: '#FFFFFF',
            borderRadius: isMobile ? '16px 16px 0 0' : '12px',
            boxShadow: isMobile
              ? '0 -8px 32px rgba(16,24,40,0.12)'
              : '0 20px 48px rgba(16,24,40,0.16), 0 0 0 1px rgba(16,24,40,0.04)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: isMobile ? 'none' : '1px solid #E4E7EC',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: isMobile ? '16px 16px 12px' : '16px 20px 12px',
              borderBottom: '1px solid #E4E7EC',
              flexShrink: 0,
              background: '#FFFFFF',
            }}
          >
            {isMobile && (
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  borderRadius: '2px',
                  background: '#D0D5DD',
                  margin: '0 auto 14px',
                }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2
                  id="li-modal-title"
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#101828',
                    fontFamily: F,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {mode === 'add' ? 'Add line item' : 'Edit line item'}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#667085', fontFamily: F }}>
                  Required fields are marked with <span style={{ color: '#F04438' }}>*</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#F2F4F7';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <X size={16} color="#667085" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {visibleErrorCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', flexShrink: 0 }}
              >
                <div
                  role="alert"
                  style={{
                    margin: '12px 20px 0',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#FEF3F2',
                    border: '1px solid #FECDCA',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={15} color="#B42318" strokeWidth={2} aria-hidden />
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#B42318', fontFamily: F }}>
                    {visibleErrorCount} field{visibleErrorCount !== 1 ? 's need' : ' needs'} attention
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Body */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: isMobile ? '12px 16px' : '12px 20px',
            }}
          >
            <div
              style={{
                border: '1px solid #E4E7EC',
                borderRadius: '8px',
                padding: '12px 16px',
                background: '#FFFFFF',
              }}
            >
              <div style={fieldGridStyle}>
                {allFields.map((field) => renderField(field.key, field.label, field.required))}
                {hasAccountingSection && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <button
                      type="button"
                      onClick={() => setShowGLModal(true)}
                      style={{
                        height: '36px',
                        padding: '0 12px',
                        background: '#FFFFFF',
                        border: '1px solid #D0D5DD',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#344054',
                        fontFamily: F,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'border-color 0.12s, background 0.12s',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = '#98A2B3';
                        el.style.background = '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = '#D0D5DD';
                        el.style.background = '#FFFFFF';
                      }}
                    >
                      <Plus size={13} strokeWidth={2.5} aria-hidden />
                      {form.glAccountsCount > 1
                        ? `${form.glAccountsCount} GL accounts configured`
                        : 'Split across multiple GL accounts'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: isMobile ? '10px 16px' : '10px 20px',
              borderTop: '1px solid #E4E7EC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              background: '#FFFFFF',
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginBottom: '2px' }}>
                Line subtotal
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#101828', fontFamily: F }}>
                {fmtRs(subtotalPreview)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onClose} style={secondaryBtn}>
                Cancel
              </button>
              <button type="button" onClick={handleSave} style={primaryBtn}>
                {mode === 'add' ? 'Add item' : 'Save changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showGLModal && (
          <GLDistributionModal
            onClose={() => setShowGLModal(false)}
            onApply={(accounts) => {
              setGLAccounts(accounts);
              setForm((prev) => ({
                ...prev,
                glAccountsCount: accounts.length || 1,
                glAccount:
                  accounts.length > 0
                    ? `${accounts[0].account} - ${accounts[0].name}`
                    : prev.glAccount,
              }));
              setShowGLModal(false);
            }}
            totalAmount={subtotalPreview}
          />
        )}
      </AnimatePresence>
    </>
  );
}

const secondaryBtn: React.CSSProperties = {
  height: '36px',
  padding: '0 14px',
  background: '#FFFFFF',
  border: '1px solid #D0D5DD',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#344054',
  fontFamily: F,
  cursor: 'pointer',
};

const primaryBtn: React.CSSProperties = {
  height: '36px',
  padding: '0 16px',
  background: P2P_BRAND.primary,
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: F,
  cursor: 'pointer',
};
