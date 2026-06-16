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
  FILTER_ACCOUNT_OPTIONS,
  FILTER_DEPARTMENT_LOCATION_OPTIONS,
  FILTER_DEPARTMENT_OPTIONS,
  cloneFilterProfile,
  hasAtLeastOneFilter,
  type FilterProfile,
} from '../../data/filterProfileSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type FilterProfileFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: FilterProfile | null;
  onOpenChange: (open: boolean) => void;
  onSave: (profile: FilterProfile) => void;
};

const emptyDraft = (): Omit<FilterProfile, 'id'> => ({
  name: '',
  projectEnabled: false,
  departmentLocationId: null,
  departmentId: null,
  accountId: null,
  active: true,
});

export function FilterProfileFormDialog({
  open,
  mode,
  initial,
  onOpenChange,
  onSave,
}: FilterProfileFormDialogProps) {
  const [draft, setDraft] = useState(emptyDraft());
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) setDraft(cloneFilterProfile(initial));
    else setDraft(emptyDraft());
    setShowValidation(false);
  }, [open, initial]);

  const hasDropdown = hasAtLeastOneFilter(draft);
  const canSave = draft.name.trim().length > 0 && hasDropdown;

  const handleSave = () => {
    if (!canSave) {
      setShowValidation(true);
      return;
    }
    onSave({
      id: initial?.id ?? `fp-${crypto.randomUUID()}`,
      name: draft.name.trim(),
      projectEnabled: draft.projectEnabled,
      departmentLocationId: draft.departmentLocationId,
      departmentId: draft.departmentId,
      accountId: draft.accountId,
      active: draft.active,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[520px]"
        style={{ fontFamily: F, padding: 0, gap: 0, overflow: 'hidden' }}
      >
        <DialogHeader style={{ padding: '20px 24px', borderBottom: '1px solid #E4E7EC' }}>
          <DialogTitle style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
            {mode === 'create' ? 'Create Filter List' : 'Edit Filter List'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Field label="Filter profile name" required>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Filter profile name"
              style={inputStyle}
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
            <Label htmlFor="fp-project" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Project
            </Label>
            <Switch
              id="fp-project"
              checked={draft.projectEnabled}
              onCheckedChange={(checked) => setDraft((d) => ({ ...d, projectEnabled: checked }))}
            />
          </div>

          {showValidation && !hasDropdown && (
            <p style={{ margin: 0, fontSize: '12px', color: '#DC2626', lineHeight: 1.45 }}>
              Please select at least one of the below dropdown(s)*
            </p>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <SelectField
              label="Department / Location"
              value={draft.departmentLocationId}
              options={FILTER_DEPARTMENT_LOCATION_OPTIONS}
              placeholder="Select Department/Location"
              onChange={(id) => setDraft((d) => ({ ...d, departmentLocationId: id }))}
            />
            <SelectField
              label="Department"
              value={draft.departmentId}
              options={FILTER_DEPARTMENT_OPTIONS}
              placeholder="Select Department"
              onChange={(id) => setDraft((d) => ({ ...d, departmentId: id }))}
            />
            <SelectField
              label="Account"
              value={draft.accountId}
              options={FILTER_ACCOUNT_OPTIONS}
              placeholder="Select Account"
              onChange={(id) => setDraft((d) => ({ ...d, accountId: id }))}
            />
          </div>

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
            <Label htmlFor="fp-active" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Active
            </Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>{draft.active ? 'On' : 'Off'}</span>
              <Switch
                id="fp-active"
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
          <button type="button" onClick={() => onOpenChange(false)} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.name.trim()}
            style={{
              ...primaryButtonStyle,
              background: draft.name.trim() ? P2P_BRAND.primary : '#94A3B8',
              cursor: draft.name.trim() ? 'pointer' : 'not-allowed',
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

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string | null;
  options: { id: string; label: string }[];
  placeholder: string;
  onChange: (id: string | null) => void;
}) {
  return (
    <div>
      <Label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
        {label}
      </Label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        style={inputStyle}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
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
