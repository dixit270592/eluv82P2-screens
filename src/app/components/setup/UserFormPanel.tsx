import { ArrowLeft } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  DEFAULT_TYPE_OPTIONS,
  DEFAULT_VIEW_OPTIONS,
  EXPENSE_VENDOR_OPTIONS,
  MANAGER_OPTIONS,
  TIME_ZONE_OPTIONS,
  USER_APPROVAL_GROUP_OPTIONS,
  USER_DELIVERY_LOCATION_OPTIONS,
  USER_DEPARTMENT_OPTIONS,
  USER_FILTER_PROFILE_OPTIONS,
  USER_RIGHT_GROUP_OPTIONS,
  getUserAvatarStyle,
  getUserDisplayName,
  getUserInitials,
  type SetupUser,
} from '../../data/userSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type UserFormPanelProps = {
  user: SetupUser;
  isNew: boolean;
  isDirty: boolean;
  onChange: (updater: (current: SetupUser) => SetupUser) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function UserFormPanel({
  user,
  isNew,
  isDirty,
  onChange,
  onSave,
  onCancel,
}: UserFormPanelProps) {
  const set = <K extends keyof SetupUser>(key: K, value: SetupUser[K]) => {
    onChange((current) => ({ ...current, [key]: value }));
  };

  const canSave = user.userName.trim() && user.email.trim() && user.firstName.trim() && user.lastName.trim();
  const displayName = getUserDisplayName(user) || 'New user';
  const avatar = getUserAvatarStyle(user);

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
        <button
          type="button"
          onClick={onCancel}
          style={{
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
          }}
        >
          <ArrowLeft size={16} aria-hidden />
          Back to users
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isDirty && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#B45309',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '999px',
                padding: '4px 10px',
              }}
            >
              Unsaved changes
            </span>
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
            Save user
          </button>
        </div>
      </div>

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E4E7EC',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
        }}
      >
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
            {getUserInitials(user)}
          </span>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {isNew ? 'Add new user' : displayName}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
              {user.email || 'Enter account details below'}
              {user.title ? ` · ${user.title}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ToggleChip label="Active" checked={user.active} onCheckedChange={(v) => set('active', v)} />
            <ToggleChip
              label="Show budget info"
              checked={user.showBudgetInfo}
              onCheckedChange={(v) => set('showBudgetInfo', v)}
            />
          </div>
        </div>
      </section>

      <FormSection title="Account information" description="Login credentials and identity.">
        <FormGrid columns={3}>
          <Field label="User name" required>
            <input value={user.userName} onChange={(e) => set('userName', e.target.value)} placeholder="jane.doe" style={inputStyle} />
          </Field>
          <Field label="Email" required>
            <input type="email" value={user.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@company.com" style={inputStyle} />
          </Field>
          <Field label="Title">
            <input value={user.title} onChange={(e) => set('title', e.target.value)} placeholder="Job title" style={inputStyle} />
          </Field>
          <Field label="First name" required>
            <input value={user.firstName} onChange={(e) => set('firstName', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Last name" required>
            <input value={user.lastName} onChange={(e) => set('lastName', e.target.value)} style={inputStyle} />
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection title="Contact details" description="Phone numbers for notifications and support.">
        <FormGrid columns={2}>
          <Field label="Physical phone">
            <input value={user.physicalPhone} onChange={(e) => set('physicalPhone', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Cell phone">
            <input value={user.cellPhone} onChange={(e) => set('cellPhone', e.target.value)} style={inputStyle} />
          </Field>
        </FormGrid>
      </FormSection>

      <FormSection title="Defaults" description="Pre-selected values when this user creates transactions.">
        <FormGrid columns={2}>
          <SelectField label="Default department" value={user.defaultDepartmentId} options={USER_DEPARTMENT_OPTIONS} placeholder="Select department" onChange={(v) => set('defaultDepartmentId', v)} />
          <SelectField label="Default type" value={user.defaultType} options={DEFAULT_TYPE_OPTIONS.map((o) => ({ id: o, label: o }))} placeholder="Select type" onChange={(v) => set('defaultType', v ?? 'Standard')} />
          <SelectField label="Default view" value={user.defaultView} options={DEFAULT_VIEW_OPTIONS.map((o) => ({ id: o, label: o }))} placeholder="Select view" onChange={(v) => set('defaultView', v ?? 'Dashboard')} />
          <SelectField label="Default delivery location" value={user.defaultDeliveryLocationId} options={USER_DELIVERY_LOCATION_OPTIONS} placeholder="Select location" onChange={(v) => set('defaultDeliveryLocationId', v)} />
        </FormGrid>
      </FormSection>

      <FormSection title="Access & permissions" description="Groups, filter profiles, and approval routing.">
        <FormGrid columns={2}>
          <SelectField label="Right groups" value={user.rightGroupId} options={USER_RIGHT_GROUP_OPTIONS} placeholder="Select group" onChange={(v) => set('rightGroupId', v)} />
          <SelectField label="Filter profile" value={user.filterProfileId} options={USER_FILTER_PROFILE_OPTIONS} placeholder="Select filter profile" onChange={(v) => set('filterProfileId', v)} />
          <SelectField label="Approval group" value={user.approvalGroupId} options={USER_APPROVAL_GROUP_OPTIONS} placeholder="Select approval group" onChange={(v) => set('approvalGroupId', v)} />
          <SelectField label="Time zone" value={user.timeZone} options={TIME_ZONE_OPTIONS.map((o) => ({ id: o, label: o }))} placeholder="Select time zone" onChange={(v) => set('timeZone', v ?? 'America/New_York')} />
          <SelectField label="Manager" value={user.managerId} options={MANAGER_OPTIONS} placeholder="Select manager" onChange={(v) => set('managerId', v)} />
          <SelectField label="Proxy approver" value={user.proxyApproverId} options={MANAGER_OPTIONS} placeholder="Select proxy approver" onChange={(v) => set('proxyApproverId', v)} />
        </FormGrid>
      </FormSection>

      <FormSection title="Expense settings" description="Corporate card and expense vendor configuration.">
        <FormGrid columns={2}>
          <Field label="Last 4 digits of CC">
            <input value={user.last4Cc} maxLength={4} onChange={(e) => set('last4Cc', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="4242" style={inputStyle} />
          </Field>
          <SelectField label="Expense vendor" value={user.expenseVendor} options={EXPENSE_VENDOR_OPTIONS.map((o) => ({ id: o, label: o }))} placeholder="Select vendor" onChange={(v) => set('expenseVendor', v ?? 'None')} />
          <Field label="Create expense for users">
            <input value={user.createExpenseForUsers} onChange={(e) => set('createExpenseForUsers', e.target.value)} style={inputStyle} />
          </Field>
        </FormGrid>
        <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <CheckRow label="Create reports" checked={user.createReports} onChange={(v) => set('createReports', v)} />
          <CheckRow label="Out of office" checked={user.outOfOffice} onChange={(v) => set('outOfOffice', v)} />
        </div>
      </FormSection>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
      }}
    >
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #EEF1F5',
          background: '#FAFBFC',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{title}</h3>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>{description}</p>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </section>
  );
}

function FormGrid({ columns, children }: { columns: 2 | 3; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: '16px',
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
        {label}
        {required && <span style={{ color: '#DC2626' }}> *</span>}
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
  onChange: (value: string | null) => void;
}) {
  return (
    <Field label={label}>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} style={inputStyle}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function ToggleChip({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 14px',
        borderRadius: '999px',
        border: `1px solid ${checked ? P2P_BRAND.surfaceBorder : '#E4E7EC'}`,
        background: checked ? P2P_BRAND.surface : '#FFFFFF',
      }}
    >
      <Label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        color: '#334155',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #E4E7EC',
        background: checked ? '#FAFBFC' : '#FFFFFF',
      }}
    >
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(c === true)} />
      {label}
    </label>
  );
}

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
  transition: 'border-color 0.15s, box-shadow 0.15s',
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
