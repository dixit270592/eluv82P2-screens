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
import { cloneShippingMethod, type ShippingMethod } from '../../data/shippingMethodSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type ShippingMethodFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: ShippingMethod | null;
  onOpenChange: (open: boolean) => void;
  onSave: (method: ShippingMethod) => void;
};

const emptyDraft = (): Omit<ShippingMethod, 'id'> => ({
  name: '',
  description: '',
  active: true,
});

export function ShippingMethodFormDialog({
  open,
  mode,
  initial,
  onOpenChange,
  onSave,
}: ShippingMethodFormDialogProps) {
  const [draft, setDraft] = useState(emptyDraft());

  useEffect(() => {
    if (!open) return;
    if (initial) setDraft(cloneShippingMethod(initial));
    else setDraft(emptyDraft());
  }, [open, initial]);

  const canSave = draft.name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id ?? `ship-${crypto.randomUUID()}`,
      name: draft.name.trim(),
      description: draft.description.trim(),
      active: draft.active,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[440px]"
        style={{ fontFamily: F, padding: 0, gap: 0, overflow: 'hidden' }}
      >
        <DialogHeader style={{ padding: '20px 24px', borderBottom: '1px solid #E4E7EC' }}>
          <DialogTitle style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
            {mode === 'create' ? 'Create Shipping Method' : 'Edit Shipping Method'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Name" required>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Name"
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Description"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
            />
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
            <Label htmlFor="shipping-method-active" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Active
            </Label>
            <Switch
              id="shipping-method-active"
              checked={draft.active}
              onCheckedChange={(checked) => setDraft((d) => ({ ...d, active: checked }))}
            />
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
