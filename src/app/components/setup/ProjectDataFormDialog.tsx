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
import { type ProjectDataRow } from '../../data/projectSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type ProjectDataFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initial: ProjectDataRow | null;
  projects: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (row: ProjectDataRow) => void;
};

const emptyDraft = (): Omit<ProjectDataRow, 'id' | 'fullAccountName' | 'accountDescription'> => ({
  project: '',
  description: '',
  active: true,
});

export function ProjectDataFormDialog({
  open,
  mode,
  initial,
  projects,
  onOpenChange,
  onSave,
}: ProjectDataFormDialogProps) {
  const [draft, setDraft] = useState(emptyDraft());
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowErrors(false);
    if (initial) {
      setDraft({
        project: initial.project,
        description: initial.description,
        active: initial.active,
      });
    } else {
      setDraft({
        ...emptyDraft(),
        project: projects[0] ?? '',
      });
    }
  }, [open, initial, projects]);

  const projectMissing = !draft.project.trim();
  const canSave = !projectMissing;

  const handleSave = () => {
    if (!canSave) {
      setShowErrors(true);
      return;
    }
    const description = draft.description.trim() || draft.project;
    onSave({
      id: initial?.id ?? `pd-${crypto.randomUUID()}`,
      project: draft.project,
      description,
      active: draft.active,
      fullAccountName: draft.project,
      accountDescription: description,
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
            {mode === 'create' ? 'Create Project Data' : 'Edit Project Data'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Field label="Select Project" required error={showErrors && projectMissing}>
            <Select
              value={draft.project || undefined}
              onValueChange={(value) => setDraft((d) => ({ ...d, project: value }))}
            >
              <SelectTrigger
                className="h-10 w-full border-[#E4E7EC] bg-white text-[13px] shadow-none focus-visible:border-[var(--p2p-brand)] focus-visible:ring-[color-mix(in_srgb,var(--p2p-brand)_18%,transparent)]"
                style={{ fontFamily: F }}
              >
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project} value={project} className="text-[13px]">
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

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
