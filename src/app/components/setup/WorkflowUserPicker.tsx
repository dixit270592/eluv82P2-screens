import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { APPROVAL_USERS } from '../../data/approvalGroupSetup';
import { formatUserSummary } from '../../data/approvalWorkflowSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type WorkflowUserPickerProps = {
  userIds: string[];
  onChange: (userIds: string[]) => void;
  disabled?: boolean;
};

export function WorkflowUserPicker({ userIds, onChange, disabled }: WorkflowUserPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (id: string) => {
    onChange(userIds.includes(id) ? userIds.filter((u) => u !== id) : [...userIds, id]);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          height: '36px',
          padding: '0 12px',
          border: '1px solid #E4E7EC',
          borderRadius: '8px',
          background: disabled ? '#F8FAFC' : '#FFFFFF',
          fontSize: '13px',
          fontFamily: F,
          color: userIds.length ? '#0F172A' : '#94A3B8',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {formatUserSummary(userIds)}
        </span>
        <ChevronDown size={14} color="#94A3B8" aria-hidden />
      </button>
      {open ? (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            background: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
            padding: '6px',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {APPROVAL_USERS.map((user) => (
            <label
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#334155',
              }}
            >
              <Checkbox checked={userIds.includes(user.id)} onCheckedChange={() => toggle(user.id)} />
              {user.name}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function WorkflowUserChips({ userIds }: { userIds: string[] }) {
  const users = userIds
    .map((id) => APPROVAL_USERS.find((u) => u.id === id))
    .filter(Boolean);

  if (users.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
      {users.map((user) => (
        <span
          key={user!.id}
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: P2P_BRAND.primaryStrong,
            background: P2P_BRAND.surface,
            border: `1px solid ${P2P_BRAND.surfaceBorder}`,
            borderRadius: '999px',
            padding: '3px 10px',
          }}
        >
          {user!.name}
        </span>
      ))}
    </div>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  ariaLabel,
  fullWidth,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel: string;
  fullWidth?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: fullWidth ? '100%' : undefined,
        height: '36px',
        minWidth: fullWidth ? undefined : '120px',
        flex: fullWidth ? undefined : '1 1 120px',
        padding: '0 12px',
        border: '1px solid #E4E7EC',
        borderRadius: '8px',
        fontSize: '13px',
        fontFamily: F,
        color: value ? '#0F172A' : '#94A3B8',
        background: disabled ? '#F8FAFC' : '#FFFFFF',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function IconButton({
  onClick,
  disabled,
  variant,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant: 'add' | 'remove';
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const isAdd = variant === 'add';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        border: `1px solid ${isAdd ? P2P_BRAND.surfaceBorder : '#FECDCA'}`,
        borderRadius: '8px',
        background: '#FFFFFF',
        color: isAdd ? P2P_BRAND.primaryStrong : '#B42318',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  onClick,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary';
}) {
  const primary = variant === 'primary';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 12px',
        border: `1px solid ${primary ? P2P_BRAND.surfaceBorder : '#E4E7EC'}`,
        borderRadius: '8px',
        background: primary ? P2P_BRAND.surface : '#FFFFFF',
        color: primary ? P2P_BRAND.primaryStrong : '#475569',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: F,
      }}
    >
      {children}
    </button>
  );
}

export function CheckIcon() {
  return <Check size={14} aria-hidden />;
}
