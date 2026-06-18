import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  ADDRESS_TYPE_OPTIONS,
  COUNTRY_OPTIONS,
  cloneAddressRecord,
  type AddressRecord,
  type AddressType,
} from '../../data/addressSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type AddressFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: AddressRecord | null;
  onOpenChange: (open: boolean) => void;
  onSave: (record: AddressRecord) => void;
};

const emptyDraft = (): Omit<AddressRecord, 'id'> => ({
  name: '',
  addressType: null,
  line1: '',
  line2: '',
  line3: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  email: '',
  phone: '',
  active: true,
});

export function AddressFormDialog({
  open,
  mode,
  initial,
  onOpenChange,
  onSave,
}: AddressFormDialogProps) {
  const [draft, setDraft] = useState(emptyDraft());

  useEffect(() => {
    if (!open) return;
    if (initial) setDraft(cloneAddressRecord(initial));
    else setDraft(emptyDraft());
  }, [open, initial]);

  const canSave =
    draft.name.trim() &&
    draft.addressType &&
    draft.line1.trim() &&
    draft.city.trim() &&
    draft.state.trim() &&
    draft.country &&
    draft.zipCode.trim() &&
    draft.email.trim() &&
    draft.phone.trim();

  const handleSave = () => {
    if (!canSave || !draft.addressType) return;
    onSave({
      id: initial?.id ?? `addr-${crypto.randomUUID()}`,
      name: draft.name.trim(),
      addressType: draft.addressType,
      line1: draft.line1.trim(),
      line2: draft.line2?.trim() || undefined,
      line3: draft.line3?.trim() || undefined,
      city: draft.city.trim(),
      state: draft.state.trim(),
      country: draft.country,
      zipCode: draft.zipCode.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      active: draft.active,
    });
    onOpenChange(false);
  };

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[640px]"
        style={{ fontFamily: F, padding: 0, gap: 0, overflow: 'hidden' }}
      >
        <DialogHeader style={{ padding: '20px 24px', borderBottom: '1px solid #E4E7EC' }}>
          <DialogTitle style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
            {mode === 'create' ? 'Create Address' : 'Edit Address'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Name" required>
              <input type="text" value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Name" style={inputStyle} />
            </Field>
            <Field label="Address type" required>
              <select
                value={draft.addressType ?? ''}
                onChange={(e) => set('addressType', (e.target.value || null) as AddressType | null)}
                style={inputStyle}
              >
                <option value="">Select address type</option>
                {ADDRESS_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Address line 1" required>
              <input type="text" value={draft.line1} onChange={(e) => set('line1', e.target.value)} placeholder="Address line 1" style={inputStyle} />
            </Field>
            <Field label="Address line 2">
              <input type="text" value={draft.line2 ?? ''} onChange={(e) => set('line2', e.target.value)} placeholder="Address line 2" style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Address line 3">
              <input type="text" value={draft.line3 ?? ''} onChange={(e) => set('line3', e.target.value)} placeholder="Address line 3" style={inputStyle} />
            </Field>
            <Field label="City" required>
              <input type="text" value={draft.city} onChange={(e) => set('city', e.target.value)} placeholder="City" style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="State" required>
              <input type="text" value={draft.state} onChange={(e) => set('state', e.target.value)} placeholder="State" style={inputStyle} />
            </Field>
            <Field label="Country" required>
              <select value={draft.country} onChange={(e) => set('country', e.target.value)} style={inputStyle}>
                <option value="">Select country</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Zip code" required>
              <input type="text" value={draft.zipCode} onChange={(e) => set('zipCode', e.target.value)} placeholder="Zip code" style={inputStyle} />
            </Field>
            <Field label="Email" required>
              <input type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} placeholder="Email" style={inputStyle} />
            </Field>
          </div>

          <Field label="Phone" required>
            <input type="tel" value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Phone" style={inputStyle} />
          </Field>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              border: '1px solid #E4E7EC',
              borderRadius: '8px',
              background: '#F8FAFC',
            }}
          >
            <Label htmlFor="addr-active" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Active
            </Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>{draft.active ? 'On' : 'Off'}</span>
              <Switch id="addr-active" checked={draft.active} onCheckedChange={(checked) => set('active', checked)} />
            </div>
          </div>
        </div>

        <DialogFooter
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E4E7EC',
            background: '#FAFBFC',
          }}
        >
          <button type="button" onClick={() => onOpenChange(false)} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            style={{
              ...primaryButtonStyle,
              background: canSave ? P2P_BRAND.primary : '#94A3B8',
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <div>
      <Label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
        {label}
        {required && (
          <span style={{ color: '#DC2626', marginLeft: '2px' }} aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#0F172A',
  background: '#FFFFFF',
  outline: 'none',
  fontFamily: F,
  boxSizing: 'border-box',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '9px 18px',
  border: 'none',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: F,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '9px 18px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  background: '#FFFFFF',
  color: '#334155',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};
