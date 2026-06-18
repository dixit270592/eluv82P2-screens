import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, FileUp, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { PoDocumentPreview } from '../../components/po-template/PoDocumentPreview';
import {
  SetupShell,
  ghostButtonStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from '../../components/po-template/SetupShell';
import {
  createDefaultPoTemplateDraft,
  loadPoTemplateDraft,
  savePoTemplateDraft,
  type PoTemplateDraft,
} from '../../data/poTemplate';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

export function PurchaseOrderTemplateSettings() {
  const navigate = useNavigate();
  const uploadRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<PoTemplateDraft>(() => loadPoTemplateDraft());
  const [saved, setSaved] = useState<PoTemplateDraft>(() => loadPoTemplateDraft());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const hasTemplate = Boolean(draft.fileName);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const patch = (partial: Partial<PoTemplateDraft>) => setDraft((c) => ({ ...c, ...partial }));

  const handleFile = (file: File | undefined, isReplace: boolean) => {
    if (!file) return;
    const name = file.name.replace(/\.docx$/i, '') || 'Company PO Template';
    patch({
      fileName: file.name,
      templateName: isReplace ? name : draft.templateName || name,
      uploadedAt: new Date().toISOString(),
    });
  };

  const handleSave = () => {
    savePoTemplateDraft(draft);
    setSaved(draft);
    setToast('Template saved.');
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleDelete = () => {
    const empty = createDefaultPoTemplateDraft();
    setDraft(empty);
    setSaved(empty);
    savePoTemplateDraft(empty);
    setDeleteOpen(false);
    setToast('Template removed.');
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <SetupShell
      breadcrumbs={[
        { label: 'Setup & configuration' },
        { label: 'Transaction Setup' },
        { label: 'Purchase Order Options' },
        { label: 'Document template', active: true },
      ]}
      title="Purchase Order Template"
      description="Upload your company purchase order document. The system will place live PO data into your layout when generating orders."
      badge={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {isDirty ? (
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
          ) : null}
          <button
            type="button"
            onClick={() => navigate('/setup/purchase-order-options')}
            style={{
              padding: '6px 12px',
              border: `1px solid ${P2P_BRAND.surfaceBorder}`,
              borderRadius: '8px',
              background: '#FFFFFF',
              color: P2P_BRAND.primaryStrong,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: F,
            }}
          >
            Back to PO options
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
          }}
        >
          <h2 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Upload template</h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
            Upload your company Purchase Order document. This template will become the final generated PO layout.
          </p>

          {!hasTemplate ? (
            <div
              style={{
                border: `1.5px dashed ${P2P_BRAND.surfaceBorder}`,
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center',
                background: P2P_BRAND.surface,
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  border: `1px solid ${P2P_BRAND.surfaceBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                <FileUp size={22} color={P2P_BRAND.primary} aria-hidden />
              </div>
              <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                Upload your PO document
              </p>
              <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748B' }}>DOCX format · Max 10 MB</p>
              <button type="button" onClick={() => uploadRef.current?.click()} style={primaryButtonStyle(true)}>
                Upload DOCX
              </button>
              <input
                ref={uploadRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                hidden
                onChange={(e) => {
                  handleFile(e.target.files?.[0], false);
                  e.target.value = '';
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                background: '#F8FAFC',
                border: '1px solid #E4E7EC',
                borderRadius: '10px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #E4E7EC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: P2P_BRAND.primaryStrong,
                }}
              >
                DOC
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{draft.fileName}</p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                  Uploaded {draft.uploadedAt ? new Date(draft.uploadedAt).toLocaleDateString() : 'today'}
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <Label htmlFor="template-name" style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Template name
              </Label>
              <input
                id="template-name"
                type="text"
                value={draft.templateName}
                disabled={!hasTemplate}
                placeholder="e.g. Standard Company PO"
                onChange={(e) => patch({ templateName: e.target.value })}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '10px 12px',
                  border: '1px solid #E4E7EC',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: F,
                  color: '#0F172A',
                  background: hasTemplate ? '#FFFFFF' : '#F8FAFC',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                border: '1px solid #E4E7EC',
                borderRadius: '10px',
                background: '#FAFBFC',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Set as default</p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Use this template when generating new purchase orders
                </p>
              </div>
              <Switch
                checked={draft.isDefault}
                disabled={!hasTemplate}
                onCheckedChange={(checked) => patch({ isDefault: checked })}
                aria-label="Set as default template"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '4px', borderTop: '1px solid #F1F5F9' }}>
            <button
              type="button"
              disabled={!hasTemplate}
              onClick={() => replaceRef.current?.click()}
              style={ghostButtonStyle()}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} aria-hidden />
                Replace template
              </span>
            </button>
            <input
              ref={replaceRef}
              type="file"
              accept=".docx"
              hidden
              onChange={(e) => {
                handleFile(e.target.files?.[0], true);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={!hasTemplate}
              onClick={() => navigate('/setup/po-template/preview', { state: { draft } })}
              style={secondaryButtonStyle()}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={14} aria-hidden />
                Preview
              </span>
            </button>
            <button
              type="button"
              disabled={!hasTemplate}
              onClick={() => setDeleteOpen(true)}
              style={{ ...ghostButtonStyle(), color: '#B42318', borderColor: '#FECDCA' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Trash2 size={14} aria-hidden />
                Delete
              </span>
            </button>
          </div>

          {hasTemplate ? (
            <div
              style={{
                marginTop: '20px',
                padding: '14px 16px',
                background: P2P_BRAND.surface,
                border: `1px solid ${P2P_BRAND.surfaceBorder}`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <p style={{ margin: 0, fontSize: '13px', color: P2P_BRAND.primaryStrong, fontWeight: 500 }}>
                Ready to generate a purchase order with this layout?
              </p>
              <button
                type="button"
                onClick={() => navigate('/purchase-orders/generate')}
                style={{
                  ...secondaryButtonStyle(),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  background: '#FFFFFF',
                }}
              >
                Generate purchase order
                <ArrowRight size={14} aria-hidden />
              </button>
            </div>
          ) : null}
        </section>

        <aside>
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Output preview
          </p>
          <PoDocumentPreview
            mode="template"
            templateName={draft.templateName || undefined}
            compact={!hasTemplate}
          />
        </aside>
      </div>

      <div
        style={{
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
          {toast ?? 'Your document design is kept intact — only data fields are filled in at generation time.'}
        </p>
        <button
          type="button"
          disabled={!hasTemplate || !draft.templateName.trim() || !isDirty}
          onClick={handleSave}
          style={primaryButtonStyle(hasTemplate && Boolean(draft.templateName.trim()) && isDirty)}
        >
          Save template
        </button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the uploaded document from your template library. You can upload a new one at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SetupShell>
  );
}
