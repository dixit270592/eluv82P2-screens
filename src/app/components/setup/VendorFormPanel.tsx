import { useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Star, MinusCircle, Briefcase } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  CONTACT_CATEGORY_OPTIONS,
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  TIME_ZONE_OPTIONS,
  VENDOR_TERMS_OPTIONS,
  cloneVendorContact,
  formatCurrencyInputValue,
  formatVendorCurrency,
  getSpendingAvailable,
  getSpendingUtilization,
  getVendorInitials,
  parseCurrencyInput,
  type SetupVendor,
  type VendorContact,
} from '../../data/vendorSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type VendorFormPanelProps = {
  vendor: SetupVendor;
  isNew: boolean;
  isDirty: boolean;
  onChange: (updater: (current: SetupVendor) => SetupVendor) => void;
  onSave: () => void;
  onCancel: () => void;
};

type DetailTab = 'details' | 'purchase-request' | 'purchase-order' | 'receipt' | 'invoice' | 'rfq';

export function VendorFormPanel({
  vendor,
  isNew,
  isDirty,
  onChange,
  onSave,
  onCancel,
}: VendorFormPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('details');
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  const set = <K extends keyof SetupVendor>(key: K, value: SetupVendor[K]) => {
    onChange((current) => ({ ...current, [key]: value }));
  };

  const canSave = vendor.name.trim().length > 0 && vendor.vendorCode.trim().length > 0;
  const displayName = vendor.name.trim() || 'New vendor';
  const avatar = getVendorAvatarStyle(vendor.name);

  const addContact = () => {
    const contact: VendorContact = {
      id: `vc-${crypto.randomUUID()}`,
      name: '',
      email: '',
      phone: '',
      phone2: '',
      category: 'General',
    };
    onChange((current) => ({ ...current, contacts: [...current.contacts, contact] }));
    setEditingContactId(contact.id);
  };

  const updateContact = (id: string, patch: Partial<VendorContact>) => {
    onChange((current) => ({
      ...current,
      contacts: current.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const removeContact = (id: string) => {
    onChange((current) => ({
      ...current,
      contacts: current.contacts.filter((c) => c.id !== id),
    }));
    if (editingContactId === id) setEditingContactId(null);
  };

  return (
    <div style={{ fontFamily: F, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button type="button" onClick={onCancel} style={backButtonStyle}>
          <ArrowLeft size={16} aria-hidden />
          Back to vendors
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isDirty && (
            <span style={unsavedBadgeStyle}>Unsaved changes</span>
          )}
          <button type="button" onClick={onCancel} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            style={{
              ...primaryButtonStyle,
              background: canSave ? P2P_BRAND.primary : '#94A3B8',
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            Save vendor
          </button>
        </div>
      </div>

      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: avatar.bg,
              color: avatar.color,
              border: `1px solid ${avatar.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {getVendorInitials(vendor)}
          </span>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {isNew ? 'Add new vendor' : displayName}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
              {vendor.vendorCode || 'Assign vendor ID'}
              {vendor.email ? ` · ${vendor.email}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {vendor.isPunchout && <StatusPill label="Punchout" tone="punchout" />}
            {vendor.markAsCc && <StatusPill label="CC" tone="cc" />}
            {vendor.assigned && <StatusPill label="Assigned" />}
            {vendor.approved && <StatusPill label="Approved" tone="blue" />}
            {vendor.archived && <StatusPill label="Archived" tone="muted" />}
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <SectionTitle>Vendor information</SectionTitle>
        <div style={gridStyle}>
          <Field label="Vendor ID">
            <input
              value={vendor.vendorCode}
              onChange={(e) => set('vendorCode', e.target.value)}
              readOnly={!isNew}
              style={{ ...inputStyle, ...(isNew ? {} : readOnlyInputStyle) }}
            />
          </Field>
          <Field label="Vendor name" required>
            <input value={vendor.name} onChange={(e) => set('name', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Email">
            <input type="email" value={vendor.email} onChange={(e) => set('email', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Phone">
            <input value={vendor.phone} onChange={(e) => set('phone', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Website">
            <input value={vendor.website} onChange={(e) => set('website', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Vendor portal URL">
            <input
              value={vendor.portalUrl}
              onChange={(e) => set('portalUrl', e.target.value)}
              placeholder={vendor.website || 'https://vendor-portal.example.com'}
              style={inputStyle}
            />
          </Field>
          {vendor.isPunchout && (
            <Field label="Punchout URL">
              <input
                value={vendor.punchoutUrl}
                onChange={(e) => set('punchoutUrl', e.target.value)}
                placeholder="#punchout-vendor"
                style={inputStyle}
              />
            </Field>
          )}
          <Field label="TIN">
            <input value={vendor.tin} onChange={(e) => set('tin', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Vendor terms">
            <select value={vendor.terms} onChange={(e) => set('terms', e.target.value)} style={inputStyle}>
              {VENDOR_TERMS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>
          <Field label="Currency">
            <select value={vendor.currency} onChange={(e) => set('currency', e.target.value)} style={inputStyle}>
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>
          <Field label="Time zone">
            <select value={vendor.timeZone} onChange={(e) => set('timeZone', e.target.value)} style={inputStyle}>
              {TIME_ZONE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
          <ToggleRow label="Assigned" checked={vendor.assigned} onChange={(v) => set('assigned', v)} />
          <ToggleRow label="Approved" checked={vendor.approved} onChange={(v) => set('approved', v)} />
          <ToggleRow label="Punchout vendor" checked={vendor.isPunchout} onChange={(v) => set('isPunchout', v)} />
          <ToggleRow label="Credit card vendor" checked={vendor.markAsCc} onChange={(v) => set('markAsCc', v)} />
        </div>
      </section>

      <section style={cardStyle}>
        <SectionTitle>Address information</SectionTitle>
        <div style={gridStyle}>
          <Field label="Address line 1">
            <input value={vendor.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Address line 2">
            <input value={vendor.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Address line 3">
            <input value={vendor.addressLine3} onChange={(e) => set('addressLine3', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="City">
            <input value={vendor.city} onChange={(e) => set('city', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="State">
            <input value={vendor.state} onChange={(e) => set('state', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Zip code">
            <input value={vendor.zip} onChange={(e) => set('zip', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Country">
            <select value={vendor.country} onChange={(e) => set('country', e.target.value)} style={inputStyle}>
              {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
          <ToggleRow label="Active" checked={vendor.active} onChange={(v) => set('active', v)} />
        </div>
      </section>

      <section style={cardStyle}>
        <SectionTitle>Documents</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <ToggleRow label="Contract documents" checked={vendor.contractDocs} onChange={(v) => set('contractDocs', v)} />
          <ToggleRow label="W9 documents" checked={vendor.w9Docs} onChange={(v) => set('w9Docs', v)} />
          <ToggleRow label="Misc documents" checked={vendor.miscDocs} onChange={(v) => set('miscDocs', v)} />
        </div>

        {vendor.contractDocs && (
          <div
            style={{
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #EEF1F5',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div>
              <h4 style={subsectionTitleStyle}>Contract documents</h4>
              <div style={{ maxWidth: '320px' }}>
                <Field label="Contract expiration warning days">
                  <input
                    type="number"
                    min={0}
                    value={vendor.contractExpirationWarningDays}
                    onChange={(e) =>
                      set('contractExpirationWarningDays', Math.max(0, Number.parseInt(e.target.value, 10) || 0))
                    }
                    style={inputStyle}
                  />
                </Field>
              </div>
            </div>

            <SpendingControlsSection vendor={vendor} onChange={onChange} />
          </div>
        )}
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {([
              ['details', 'Details'],
              ['purchase-request', 'Purchase Request'],
              ['purchase-order', 'Purchase Order'],
              ['receipt', 'Receipt'],
              ['invoice', 'Invoice'],
              ['rfq', 'RFQ'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '8px',
                  background: activeTab === id ? '#ECFDF5' : 'transparent',
                  color: activeTab === id ? P2P_BRAND.primaryStrong : '#64748B',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: F,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {activeTab === 'details' && (
            <button type="button" onClick={addContact} style={addContactBtnStyle}>
              <Plus size={15} aria-hidden />
              Add contact
            </button>
          )}
        </div>

        {activeTab === 'details' ? (
          vendor.contacts.length === 0 ? (
            <EmptyTabState
              title="No contacts yet"
              description="Add vendor contacts for procurement, billing, and support."
              actionLabel="Add contact"
              onAction={addContact}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E4E7EC' }}>
                    {['#', 'Name', 'Email', 'Phone', 'Phone 2', 'Category', 'Action'].map((col) => (
                      <th key={col} style={contactThStyle}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendor.contacts.map((contact, index) => (
                    <tr key={contact.id} style={{ borderBottom: '1px solid #EEF1F5' }}>
                      <td style={contactTdStyle}>{index + 1}</td>
                      <td style={contactTdStyle}>
                        <input
                          value={contact.name}
                          onChange={(e) => updateContact(contact.id, { name: e.target.value })}
                          style={tableInputStyle}
                          placeholder="Name"
                        />
                      </td>
                      <td style={contactTdStyle}>
                        <input
                          value={contact.email}
                          onChange={(e) => updateContact(contact.id, { email: e.target.value })}
                          style={tableInputStyle}
                          placeholder="Email"
                        />
                      </td>
                      <td style={contactTdStyle}>
                        <input
                          value={contact.phone}
                          onChange={(e) => updateContact(contact.id, { phone: e.target.value })}
                          style={tableInputStyle}
                          placeholder="Phone"
                        />
                      </td>
                      <td style={contactTdStyle}>
                        <input
                          value={contact.phone2}
                          onChange={(e) => updateContact(contact.id, { phone2: e.target.value })}
                          style={tableInputStyle}
                          placeholder="Phone 2"
                        />
                      </td>
                      <td style={contactTdStyle}>
                        <select
                          value={contact.category}
                          onChange={(e) => updateContact(contact.id, { category: e.target.value })}
                          style={tableInputStyle}
                        >
                          {CONTACT_CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td style={contactTdStyle}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <IconBtn
                            label="Duplicate contact"
                            onClick={() => {
                              const copy = cloneVendorContact(contact);
                              copy.id = `vc-${crypto.randomUUID()}`;
                              onChange((current) => ({
                                ...current,
                                contacts: [...current.contacts, copy],
                              }));
                            }}
                          >
                            <Pencil size={14} aria-hidden />
                          </IconBtn>
                          <IconBtn label="Remove contact" onClick={() => removeContact(contact.id)} danger>
                            <Trash2 size={14} aria-hidden />
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <EmptyTabState
            title="No records yet"
            description={`${tabLabel(activeTab)} history for this vendor will appear here once transactions are created.`}
          />
        )}
      </section>

      <section style={cardStyle}>
        <SectionTitle>Rating</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= vendor.rating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => set('rating', star)}
                aria-label={`Rate ${star} stars`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  color: filled ? '#F59E0B' : '#CBD5E1',
                }}
              >
                <Star size={22} fill={filled ? 'currentColor' : 'none'} aria-hidden />
              </button>
            );
          })}
          <span style={{ fontSize: '13px', color: '#64748B', marginLeft: '4px' }}>
            {vendor.rating > 0 ? `${vendor.rating} of 5` : 'Not rated'}
          </span>
        </div>
      </section>
    </div>
  );
}

function SpendingControlsSection({
  vendor,
  onChange,
}: {
  vendor: SetupVendor;
  onChange: (updater: (current: SetupVendor) => SetupVendor) => void;
}) {
  const cap = vendor.totalAllowedSpendingCap;
  const used = vendor.spendingUsedAmount;
  const available = getSpendingAvailable(cap, used);
  const utilization = getSpendingUtilization(used, cap);

  const set = <K extends keyof SetupVendor>(key: K, value: SetupVendor[K]) => {
    onChange((current) => ({ ...current, [key]: value }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '999px',
            background: '#EFF6FF',
            color: '#2563EB',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden
        >
          <MinusCircle size={16} strokeWidth={2.25} />
        </span>
        <h4 style={{ ...subsectionTitleStyle, margin: 0 }}>Spending Controls</h4>
      </div>

      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E4E7EC',
          borderRadius: '12px',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={16} color="#D97706" aria-hidden />
            <span style={{ fontSize: '13px', fontWeight: 600, color: P2P_BRAND.primaryStrong }}>
              Total Allowed Spending Cap
            </span>
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: P2P_BRAND.primaryStrong,
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '999px',
              padding: '4px 10px',
              whiteSpace: 'nowrap',
            }}
          >
            {utilization}% used
          </span>
        </div>

        <div
          style={{
            marginTop: '10px',
            fontSize: '28px',
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {formatVendorCurrency(cap, vendor.currency)}
        </div>

        <div
          style={{
            marginTop: '16px',
            height: '10px',
            borderRadius: '999px',
            background: '#F1F5F9',
            overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={utilization}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Spending utilization"
        >
          <div
            style={{
              width: `${utilization}%`,
              height: '100%',
              borderRadius: '999px',
              background: `linear-gradient(90deg, ${P2P_BRAND.primary} 0%, #34D399 100%)`,
              transition: 'width 0.25s ease',
            }}
          />
        </div>

        <div
          style={{
            marginTop: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            fontSize: '13px',
          }}
        >
          <span style={{ color: '#64748B' }}>
            Used: <strong style={{ color: '#334155', fontWeight: 600 }}>{formatVendorCurrency(used, vendor.currency)}</strong>
          </span>
          <span style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>
            Available: {formatVendorCurrency(available, vendor.currency)}
          </span>
        </div>
      </div>

      <div style={twoColGridStyle}>
        <Field label="Total allowed spending cap">
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '13px',
                color: '#64748B',
                pointerEvents: 'none',
              }}
            >
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={formatCurrencyInputValue(cap)}
              onChange={(e) => set('totalAllowedSpendingCap', parseCurrencyInput(e.target.value))}
              placeholder="0"
              style={{ ...inputStyle, paddingLeft: '28px' }}
            />
          </div>
        </Field>
        <Field label="PO spending cap warning threshold (%)">
          <input
            type="number"
            min={0}
            max={100}
            value={vendor.poSpendingCapWarningThreshold}
            onChange={(e) =>
              set(
                'poSpendingCapWarningThreshold',
                Math.min(100, Math.max(0, Number.parseInt(e.target.value, 10) || 0)),
              )
            }
            style={inputStyle}
          />
        </Field>
      </div>
    </div>
  );
}

function tabLabel(tab: DetailTab): string {
  const labels: Record<DetailTab, string> = {
    details: 'Details',
    'purchase-request': 'Purchase request',
    'purchase-order': 'Purchase order',
    receipt: 'Receipt',
    invoice: 'Invoice',
    rfq: 'RFQ',
  };
  return labels[tab];
}

function getVendorAvatarStyle(name: string) {
  const palette = [
    { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
    { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
    { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  ];
  const index = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em' }}>
      {children}
    </h3>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
        {label}
        {required && <span style={{ color: '#DC2626' }}> *</span>}
      </span>
      {children}
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Switch id={label} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={label} style={{ fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
        {label}
      </Label>
    </div>
  );
}

function StatusPill({
  label,
  tone = 'green',
}: {
  label: string;
  tone?: 'green' | 'blue' | 'muted' | 'cc' | 'punchout';
}) {
  const styles = {
    green: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
    blue: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    muted: { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' },
    cc: { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
    punchout: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  }[tone];

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
      }}
    >
      {label}
    </span>
  );
}

function EmptyTabState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div style={{ padding: '40px 24px', textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{title}</p>
      <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748B', maxWidth: '42ch', marginInline: 'auto' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} style={{ ...addContactBtnStyle, marginTop: '16px' }}>
          <Plus size={15} aria-hidden />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: `1px solid ${danger ? '#FECACA' : '#E4E7EC'}`,
        borderRadius: '8px',
        background: '#FFFFFF',
        color: danger ? '#DC2626' : '#475569',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E4E7EC',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '16px',
};

const twoColGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
};

const subsectionTitleStyle: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#1E3A5F',
  letterSpacing: '-0.01em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #D0D5DD',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#0F172A',
  background: '#FFFFFF',
  outline: 'none',
  fontFamily: F,
  boxSizing: 'border-box',
};

const readOnlyInputStyle: React.CSSProperties = {
  background: '#F8FAFC',
  color: '#64748B',
};

const tableInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #E4E7EC',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#0F172A',
  background: '#FFFFFF',
  outline: 'none',
  fontFamily: F,
  boxSizing: 'border-box',
};

const contactThStyle: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const contactTdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'middle',
};

const backButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  background: '#FFFFFF',
  color: '#334155',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};

const unsavedBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#B45309',
  background: '#FFFBEB',
  border: '1px solid #FDE68A',
  borderRadius: '999px',
  padding: '4px 10px',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '10px 18px',
  border: 'none',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: F,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '10px 18px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  background: '#FFFFFF',
  color: '#334155',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};

const addContactBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  border: 'none',
  borderRadius: '8px',
  background: P2P_BRAND.primary,
  color: '#FFFFFF',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};
