import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { type ProjectSegmentDataRow } from '../../data/projectSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type ProjectSegmentDataFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: ProjectSegmentDataRow | null;
  segmentTypes: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (row: ProjectSegmentDataRow) => void;
};

const emptyDraft = (): Omit<ProjectSegmentDataRow, 'id'> => ({
  segmentType: '',
  segmentData: '',
  description: '',
});

export function ProjectSegmentDataFormDialog({
  open,
  mode,
  initial,
  segmentTypes,
  onOpenChange,
  onSave,
}: ProjectSegmentDataFormDialogProps) {
  const [draft, setDraft] = useState(emptyDraft());

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setDraft({
        segmentType: initial.segmentType,
        segmentData: initial.segmentData,
        description: initial.description,
      });
    } else {
      setDraft({
        ...emptyDraft(),
        segmentType: segmentTypes[0] ?? '',
      });
    }
  }, [open, initial, segmentTypes]);

  const canSave = draft.segmentType.trim().length > 0 && draft.segmentData.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id ?? `psd-${crypto.randomUUID()}`,
      segmentType: draft.segmentType,
      segmentData: draft.segmentData.trim(),
      description: draft.description.trim(),
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
            {mode === 'create' ? 'Create Segment Data' : 'Edit Segment Data'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Field label="Select Project Segment" required>
            <Select
              value={draft.segmentType || undefined}
              onValueChange={(value) => setDraft((d) => ({ ...d, segmentType: value }))}
            >
              <SelectTrigger
                className="h-10 w-full border-[#E4E7EC] bg-white text-[13px] shadow-none focus-visible:border-[var(--p2p-brand)] focus-visible:ring-[color-mix(in_srgb,var(--p2p-brand)_18%,transparent)]"
                style={{ fontFamily: F }}
              >
                <SelectValue placeholder="Select Project Segment" />
              </SelectTrigger>
              <SelectContent>
                {segmentTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-[13px]">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Segment Data Name" required>
            <input
              type="text"
              value={draft.segmentData}
              onChange={(e) => setDraft((d) => ({ ...d, segmentData: e.target.value }))}
              placeholder="Segment Data Name"
              style={inputStyle}
            />
          </Field>

          <Field label="Segment Description">
            <input
              type="text"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Segment Description"
              style={inputStyle}
            />
          </Field>
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
