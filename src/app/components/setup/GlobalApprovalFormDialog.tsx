import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import {
  TRIGGER_TYPES,
  TRIGGER_VALUES,
  addLevelFromStep,
  cloneGlobalApproval,
  createEmptyLevel,
  formatLimit,
  type ApprovalLevel,
  type GlobalApproval,
} from '../../data/globalApprovalSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type GlobalApprovalFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: GlobalApproval | null;
  onOpenChange: (open: boolean) => void;
  onSave: (approval: GlobalApproval) => void;
};

const emptyDraft = (): Omit<GlobalApproval, 'id'> => ({
  name: '',
  triggerType: 'Request Type',
  triggerValue: '',
  limitStepSize: 100,
  levels: [createEmptyLevel(0, 0, 100)],
  active: true,
});

const inputStyle: CSSProperties = {
  width: '100%',
  height: '40px',
  padding: '0 12px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: F,
  color: '#0F172A',
  background: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
};

const cellInputStyle: CSSProperties = {
  width: '100%',
  height: '34px',
  padding: '0 10px',
  border: '1px solid #E4E7EC',
  borderRadius: '6px',
  fontSize: '13px',
  fontFamily: F,
  color: '#0F172A',
  background: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
};

export function GlobalApprovalFormDialog({
  open,
  mode,
  initial,
  onOpenChange,
  onSave,
}: GlobalApprovalFormDialogProps) {
  const [draft, setDraft] = useState(emptyDraft());

  useEffect(() => {
    if (!open) return;
    if (initial) setDraft(cloneGlobalApproval(initial));
    else setDraft(emptyDraft());
  }, [open, initial]);

  const triggerValues = TRIGGER_VALUES[draft.triggerType] ?? [];

  const canSave =
    draft.name.trim().length > 0 &&
    draft.triggerValue.length > 0 &&
    draft.levels.length > 0 &&
    draft.levels.every((l) => l.label.trim().length > 0);

  const updateLevel = (id: string, patch: Partial<ApprovalLevel>) => {
    setDraft((d) => ({
      ...d,
      levels: d.levels.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  };

  const removeLevel = (id: string) => {
    setDraft((d) => ({
      ...d,
      levels: d.levels.length <= 1 ? d.levels : d.levels.filter((l) => l.id !== id),
    }));
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id ?? `ga-${crypto.randomUUID()}`,
      name: draft.name.trim(),
      triggerType: draft.triggerType,
      triggerValue: draft.triggerValue,
      limitStepSize: draft.limitStepSize,
      levels: draft.levels,
      active: draft.active,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[860px]"
        style={{ fontFamily: F, padding: 0, gap: 0, overflow: 'hidden', maxWidth: 'min(860px, calc(100vw - 2rem))' }}
      >
        <DialogHeader style={{ padding: '20px 24px', borderBottom: '1px solid #E4E7EC' }}>
          <DialogTitle style={{ fontSize: '17px', fontWeight: 600, color: '#0F172A' }}>
            {mode === 'create' ? 'Create Global Approval' : 'Modify Global Approval'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Approval name" required>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Approval name"
                style={inputStyle}
              />
            </Field>
            <Field label="Select trigger type" required>
              <select
                value={draft.triggerType}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    triggerType: e.target.value,
                    triggerValue: '',
                  }))
                }
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {TRIGGER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Select trigger value" required>
              <select
                value={draft.triggerValue}
                onChange={(e) => setDraft((d) => ({ ...d, triggerValue: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">Select trigger value</option>
                {triggerValues.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ width: '200px' }}>
              <Label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                Select limit step size
              </Label>
              <input
                type="number"
                min={1}
                value={draft.limitStepSize}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, limitStepSize: Number(e.target.value) || 1 }))
                }
                style={inputStyle}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setDraft((d) => ({ ...d, levels: addLevelFromStep(d.levels, d.limitStepSize) }))
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                border: 'none',
                borderRadius: '8px',
                background: P2P_BRAND.primary,
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: F,
              }}
            >
              <Plus size={16} aria-hidden />
              New level
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #E4E7EC', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                  {['Sr no', 'Level', 'Lower limit', 'Upper limit', 'Action'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#667085',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {draft.levels.map((level, index) => (
                  <tr key={level.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 14px', color: '#64748B', width: '64px' }}>{index + 1}</td>
                    <td style={{ padding: '8px 14px 8px 0', minWidth: '120px' }}>
                      <input
                        type="text"
                        value={level.label}
                        onChange={(e) => updateLevel(level.id, { label: e.target.value })}
                        aria-label={`Level ${index + 1} name`}
                        style={cellInputStyle}
                      />
                    </td>
                    <td style={{ padding: '8px 14px 8px 0', minWidth: '110px' }}>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={level.lowerLimit}
                        onChange={(e) =>
                          updateLevel(level.id, { lowerLimit: Number(e.target.value) || 0 })
                        }
                        aria-label={`Level ${index + 1} lower limit`}
                        style={cellInputStyle}
                      />
                    </td>
                    <td style={{ padding: '8px 14px 8px 0', minWidth: '110px' }}>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={level.upperLimit}
                        onChange={(e) =>
                          updateLevel(level.id, { upperLimit: Number(e.target.value) || 0 })
                        }
                        aria-label={`Level ${index + 1} upper limit`}
                        style={cellInputStyle}
                      />
                    </td>
                    <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '12px', color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>
                        {formatLimit(level.lowerLimit)} – {formatLimit(level.upperLimit)}
                      </span>
                      {index > 0 ? (
                        <button
                          type="button"
                          onClick={() => removeLevel(level.id)}
                          aria-label={`Delete level ${index + 1}`}
                          style={{
                            marginLeft: '10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            border: 'none',
                            borderRadius: '6px',
                            background: 'transparent',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            verticalAlign: 'middle',
                          }}
                        >
                          <Trash2 size={15} aria-hidden />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E4E7EC',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            style={{
              padding: '10px 18px',
              border: '1px solid #E4E7EC',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: F,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              background: canSave ? P2P_BRAND.primary : '#94A3B8',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: F,
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
  children: ReactNode;
}) {
  return (
    <div>
      <Label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
        {label}
        {required ? <span style={{ color: '#DC2626' }}> *</span> : null}
      </Label>
      {children}
    </div>
  );
}
