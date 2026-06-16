import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { type PredefinedGlSplit } from '../../data/accountSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type PredefinedGlSplitFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: PredefinedGlSplit | null;
  onOpenChange: (open: boolean) => void;
  onSave: (split: PredefinedGlSplit) => void;
};

export function PredefinedGlSplitFormDialog({
  open,
  mode,
  initial,
  onOpenChange,
  onSave,
}: PredefinedGlSplitFormDialogProps) {
  const [splitName, setSplitName] = useState('');

  useEffect(() => {
    if (!open) return;
    setSplitName(initial?.splitName ?? '');
  }, [open, initial]);

  const canSave = splitName.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id ?? `pgs-${crypto.randomUUID()}`,
      splitName: splitName.trim(),
      lines: initial?.lines ?? [],
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
            {mode === 'create' ? 'Add Predefined GL Split' : 'Edit Predefined GL Split'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '20px 24px' }}>
          <Label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Split name
            <span style={{ color: '#DC2626', marginLeft: '2px' }} aria-hidden>
              *
            </span>
          </Label>
          <input
            type="text"
            value={splitName}
            onChange={(e) => setSplitName(e.target.value)}
            placeholder="Split name"
            style={inputStyle}
          />
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
