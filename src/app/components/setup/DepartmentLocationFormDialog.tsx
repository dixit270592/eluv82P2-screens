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
import { AddressPreviewPopover } from './AddressPreviewPopover';
import {
  COMPANY_ADDRESSES,
  cloneDepartmentLocation,
  type DepartmentLocation,
  type DeptLocType,
} from '../../data/departmentLocationSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

export type DepartmentLocationDraft = Omit<DepartmentLocation, 'id'> & { id?: string };

type DepartmentLocationFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: DepartmentLocation | null;
  onOpenChange: (open: boolean) => void;
  onSave: (item: DepartmentLocation) => void;
};

const emptyDraft = (): DepartmentLocationDraft => ({
  name: '',
  type: 'department',
  addressId: null,
  active: true,
});

export function DepartmentLocationFormDialog({
  open,
  mode,
  initial,
  onOpenChange,
  onSave,
}: DepartmentLocationFormDialogProps) {
  const [draft, setDraft] = useState<DepartmentLocationDraft>(emptyDraft());

  useEffect(() => {
    if (!open) return;
    if (initial) setDraft(cloneDepartmentLocation(initial));
    else setDraft(emptyDraft());
  }, [open, initial]);

  const canSave = draft.name.trim().length > 0 && draft.addressId;

  const handleSave = () => {
    if (!canSave || !draft.addressId) return;
    onSave({
      id: initial?.id ?? `dl-${crypto.randomUUID()}`,
      name: draft.name.trim(),
      type: draft.type,
      addressId: draft.addressId,
      active: draft.active,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px]"
        style={{ fontFamily: F, padding: 0, gap: 0, overflow: 'hidden' }}
      >
        <DialogHeader style={{ padding: '20px 24px', borderBottom: '1px solid #E4E7EC' }}>
          <DialogTitle style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
            {mode === 'create' ? 'Create Department / Location' : 'Edit Department / Location'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Field label="Name" required>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Department / Location name"
              style={inputStyle}
            />
          </Field>

          <Field label="Type" required>
            <select
              value={draft.type}
              onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as DeptLocType }))}
              style={inputStyle}
            >
              <option value="department">Department</option>
              <option value="location">Location</option>
            </select>
          </Field>

          <Field label="Address" required>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <select
                value={draft.addressId ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, addressId: e.target.value || null }))
                }
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="">Select Department / Location address</option>
                {COMPANY_ADDRESSES.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label}
                  </option>
                ))}
              </select>
              <AddressPreviewPopover addressId={draft.addressId} />
            </div>
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
            <Label htmlFor="dept-loc-active" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Active
            </Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>{draft.active ? 'On' : 'Off'}</span>
              <Switch
                id="dept-loc-active"
                checked={draft.active}
                onCheckedChange={(checked) => setDraft((d) => ({ ...d, active: checked }))}
              />
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
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            style={secondaryButtonStyle}
          >
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
