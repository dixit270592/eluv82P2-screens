import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import {
  APPROVAL_USERS,
  cloneApprovalGroup,
  type ApprovalGroup,
} from '../../data/approvalGroupSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type ApprovalGroupFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: ApprovalGroup | null;
  onOpenChange: (open: boolean) => void;
  onSave: (group: ApprovalGroup) => void;
};

const emptyDraft = (): Omit<ApprovalGroup, 'id'> => ({
  name: '',
  userIds: [],
  active: true,
});

export function ApprovalGroupFormDialog({
  open,
  mode,
  initial,
  onOpenChange,
  onSave,
}: ApprovalGroupFormDialogProps) {
  const [draft, setDraft] = useState(emptyDraft());
  const [usersOpen, setUsersOpen] = useState(false);
  const usersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) setDraft(cloneApprovalGroup(initial));
    else setDraft(emptyDraft());
    setUsersOpen(false);
  }, [open, initial]);

  useEffect(() => {
    if (!usersOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (usersRef.current && !usersRef.current.contains(e.target as Node)) {
        setUsersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [usersOpen]);

  const canSave = draft.name.trim().length > 0 && draft.userIds.length > 0;

  const toggleUser = (userId: string) => {
    setDraft((d) => {
      const has = d.userIds.includes(userId);
      return {
        ...d,
        userIds: has ? d.userIds.filter((id) => id !== userId) : [...d.userIds, userId],
      };
    });
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id ?? `ag-${crypto.randomUUID()}`,
      name: draft.name.trim(),
      userIds: draft.userIds,
      active: draft.active,
    });
    onOpenChange(false);
  };

  const selectedLabel =
    draft.userIds.length === 0
      ? 'Select users'
      : draft.userIds
          .map((id) => APPROVAL_USERS.find((u) => u.id === id)?.name)
          .filter(Boolean)
          .join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px]"
        style={{ fontFamily: F, padding: 0, gap: 0, overflow: 'hidden' }}
      >
        <DialogHeader style={{ padding: '20px 24px', borderBottom: '1px solid #E4E7EC' }}>
          <DialogTitle style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
            {mode === 'create' ? 'Add Approval Group' : 'Edit Approval Group'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Field label="Group name" required>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Group name"
              style={inputStyle}
            />
          </Field>

          <Field label="Users" required>
            <div ref={usersRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUsersOpen((v) => !v)}
                aria-expanded={usersOpen}
                aria-haspopup="listbox"
                style={{
                  ...inputStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: draft.userIds.length ? '#0F172A' : '#94A3B8',
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {selectedLabel}
                </span>
                <ChevronDown size={16} color="#94A3B8" aria-hidden />
              </button>

              {usersOpen && (
                <ul
                  role="listbox"
                  aria-multiselectable
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    margin: 0,
                    padding: '6px',
                    listStyle: 'none',
                    background: '#FFFFFF',
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    zIndex: 50,
                  }}
                >
                  {APPROVAL_USERS.map((user) => {
                    const selected = draft.userIds.includes(user.id);
                    return (
                      <li key={user.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => toggleUser(user.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '9px 10px',
                            border: 'none',
                            borderRadius: '6px',
                            background: selected ? P2P_BRAND.surface : 'transparent',
                            color: selected ? P2P_BRAND.primaryStrong : '#334155',
                            fontSize: '13px',
                            fontWeight: selected ? 600 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: F,
                          }}
                        >
                          <Checkbox checked={selected} tabIndex={-1} aria-hidden />
                          {user.name}
                          {selected && <Check size={14} style={{ marginLeft: 'auto' }} aria-hidden />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
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
            <Label htmlFor="ag-active" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Active
            </Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>{draft.active ? 'On' : 'Off'}</span>
              <Switch
                id="ag-active"
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
