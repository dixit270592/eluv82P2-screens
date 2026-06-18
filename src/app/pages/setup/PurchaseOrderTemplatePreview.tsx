import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { MappingSummaryPanel } from '../../components/po-template/MappingSummaryPanel';
import { PoDocumentPreview } from '../../components/po-template/PoDocumentPreview';
import {
  SetupShell,
  StickyActionBar,
  ghostButtonStyle,
  primaryButtonStyle,
} from '../../components/po-template/SetupShell';
import { loadPoTemplateDraft, savePoTemplateDraft, type PoTemplateDraft } from '../../data/poTemplate';

export function PurchaseOrderTemplatePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = (location.state as { draft?: PoTemplateDraft } | null)?.draft ?? loadPoTemplateDraft();
  const [draft] = useState<PoTemplateDraft>(initial);
  const missingTemplate = !draft.fileName;

  useEffect(() => {
    if (missingTemplate) navigate('/setup/po-template', { replace: true });
  }, [missingTemplate, navigate]);

  if (missingTemplate) return null;

  const handleSave = () => {
    savePoTemplateDraft(draft);
    navigate('/setup/po-template');
  };

  return (
    <SetupShell
      breadcrumbs={[
        { label: 'Setup & configuration' },
        { label: 'Transaction Setup' },
        { label: 'Purchase Order Options' },
        { label: 'Document template' },
        { label: 'Preview', active: true },
      ]}
      title="Template preview"
      description="Review how your uploaded document will look with purchase order data applied."
      footer={
        <StickyActionBar>
          <button type="button" onClick={() => navigate('/setup/po-template')} style={ghostButtonStyle()}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} style={primaryButtonStyle(true)}>
            Save template
          </button>
        </StickyActionBar>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)]">
        <section>
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
            Uploaded document
          </p>
          <PoDocumentPreview mode="template" templateName={draft.templateName} />
          <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#94A3B8' }}>
            Source file: <span style={{ color: '#475569' }}>{draft.fileName}</span>
          </p>
        </section>

        <MappingSummaryPanel />
      </div>
    </SetupShell>
  );
}
