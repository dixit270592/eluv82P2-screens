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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  buildAccountDisplay,
  type AccountDataRow,
} from '../../data/accountSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type AccountDataFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: AccountDataRow | null;
  departments: string[];
  accounts: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (row: AccountDataRow) => void;
};

const emptyDraft = (): Omit<AccountDataRow, 'id' | 'accountName' | 'accountDetails'> => ({
  department: '',
  account: '',
  description: '',
  active: true,
});

export function AccountDataFormDialog({
  open,
  mode,
  initial,
  departments,
  accounts,
  onOpenChange,
  onSave,
}: AccountDataFormDialogProps) {
  const [draft, setDraft] = useState(emptyDraft());
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowErrors(false);
    if (initial) {
      setDraft({
        department: initial.department,
        account: initial.account,
        description: initial.description,
        active: initial.active,
      });
    } else {
      setDraft({
        ...emptyDraft(),
        department: departments[0] ?? '',
        account: accounts[0] ?? '',
      });
    }
  }, [open, initial, departments, accounts]);

  const departmentMissing = !draft.department.trim();
  const accountMissing = !draft.account.trim();
  const canSave = !departmentMissing && !accountMissing;

  const handleSave = () => {
    if (!canSave) {
      setShowErrors(true);
      return;
    }
    const display = buildAccountDisplay(draft.department, draft.account, draft.description);
    onSave({
      id: initial?.id ?? `ad-${crypto.randomUUID()}`,
      department: draft.department,
      account: draft.account,
      description: draft.description.trim(),
      active: draft.active,
      accountName: display.accountName,
      accountDetails: display.accountDetails,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[560px]"
        style={{ fontFamily: F, padding: 0, gap: 0, overflow: 'hidden' }}
      >
        <DialogHeader style={{ padding: '20px 24px', borderBottom: '1px solid #E4E7EC' }}>
          <DialogTitle style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
            {mode === 'create' ? 'Create Account Data' : 'Edit Account Data'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Select Department" required error={showErrors && departmentMissing}>
              <Select
                value={draft.department || undefined}
                onValueChange={(value) => setDraft((d) => ({ ...d, department: value }))}
              >
                <SelectTrigger
                  className="h-10 w-full border-[#E4E7EC] bg-white text-[13px] shadow-none focus-visible:border-[var(--p2p-brand)] focus-visible:ring-[color-mix(in_srgb,var(--p2p-brand)_18%,transparent)]"
                  style={{ fontFamily: F }}
                >
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept} className="text-[13px]">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Select Account" required error={showErrors && accountMissing}>
              <Select
                value={draft.account || undefined}
                onValueChange={(value) => setDraft((d) => ({ ...d, account: value }))}
              >
                <SelectTrigger
                  className="h-10 w-full border-[#E4E7EC] bg-white text-[13px] shadow-none focus-visible:border-[var(--p2p-brand)] focus-visible:ring-[color-mix(in_srgb,var(--p2p-brand)_18%,transparent)]"
                  style={{ fontFamily: F }}
                >
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account} value={account} className="text-[13px]">
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Description"
              rows={4}
              style={textareaStyle}
            />
          </Field>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Switch
              checked={draft.active}
              onCheckedChange={(checked) => setDraft((d) => ({ ...d, active: checked }))}
              aria-label="Active"
            />
            <Label style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>Active</Label>
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
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
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
      {error && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#DC2626' }}>This field is required</p>
      )}
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
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
  resize: 'vertical',
  minHeight: '96px',
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
