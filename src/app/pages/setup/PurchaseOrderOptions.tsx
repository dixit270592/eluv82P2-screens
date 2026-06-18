import { useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, FileText, Upload, ArrowRight } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { PrOptionSectionHeader } from '../../components/setup/PrOptionHelp';
import { SetupOptionGrid, SetupOptionRow } from '../../components/setup/SetupOptionRow';
import {
  createDefaultPurchaseOrderOptions,
  type PurchaseOrderOptionsState,
} from '../../data/purchaseOrderOptions';
import { PO_OPTION_HELP, PO_OPTION_SECTIONS } from '../../data/purchaseOrderOptionsHelp';
import { loadPoTemplateDraft } from '../../data/poTemplate';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

function FileUploadControl({
  disabled,
  fileName,
  accept,
  ariaLabel,
  onFileSelect,
}: {
  disabled?: boolean;
  fileName: string | null;
  accept: string;
  ariaLabel: string;
  onFileSelect: (name: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={() => inputRef.current?.click()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          height: '32px',
          padding: '0 12px',
          border: `1px solid ${disabled ? '#E4E7EC' : P2P_BRAND.surfaceBorder}`,
          borderRadius: '6px',
          background: disabled ? '#F8FAFC' : '#FFFFFF',
          color: disabled ? '#94A3B8' : P2P_BRAND.primaryStrong,
          fontSize: '12px',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: F,
        }}
      >
        <Upload size={14} aria-hidden />
        Upload
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          onFileSelect(file?.name ?? null);
          e.target.value = '';
        }}
      />
      {fileName ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#475569',
            flex: '1 1 auto',
            minWidth: 0,
          }}
        >
          <FileText size={14} color="#94A3B8" aria-hidden />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</span>
          {!disabled ? (
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94A3B8',
                fontSize: '11px',
                cursor: 'pointer',
                padding: 0,
                fontFamily: F,
              }}
            >
              Remove
            </button>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: F,
  color: '#0F172A',
  background: '#FFFFFF',
  outline: 'none',
  lineHeight: 1.5,
  boxSizing: 'border-box',
};

function PoDocumentPreview({ draft }: { draft: PurchaseOrderOptionsState }) {
  const template = loadPoTemplateDraft();
  return (
    <aside
      aria-label="PO document preview"
      style={{
        position: 'sticky',
        top: '12px',
        background: '#F8FAFC',
        border: '1px solid #E4E7EC',
        borderRadius: '10px',
        padding: '16px',
        minHeight: '280px',
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#64748B',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Document preview
      </p>

      <div
        style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            flexShrink: 0,
            borderRadius: '8px',
            border: `1.5px dashed ${draft.logoOnPo && draft.logoFileName ? P2P_BRAND.surfaceBorder : '#D0D5DD'}`,
            background: draft.logoOnPo ? '#FFFFFF' : '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#94A3B8',
            textAlign: 'center',
            lineHeight: 1.3,
            padding: '4px',
          }}
        >
          {draft.logoOnPo && draft.logoFileName ? 'Logo' : 'No logo'}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Purchase Order</p>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8' }}>Preview of emailed / printed output</p>
        </div>
      </div>

      {draft.termsAndConditions ? (
        <div
          style={{
            marginBottom: '12px',
            padding: '10px 12px',
            background: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '8px',
          }}
        >
          <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
            Terms
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: '#475569',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {draft.termsText || 'No terms entered.'}
          </p>
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
          Attachments
        </p>
        {draft.termsAsAttachment && draft.termsAttachmentFileName ? (
          <span style={{ fontSize: '12px', color: '#475569' }}>{draft.termsAttachmentFileName}</span>
        ) : null}
        {template.fileName ? (
          <span style={{ fontSize: '12px', color: '#475569' }}>{template.fileName}</span>
        ) : null}
        {!(draft.termsAsAttachment && draft.termsAttachmentFileName) && !template.fileName ? (
          <span style={{ fontSize: '12px', color: '#CBD5E1' }}>No attachments configured</span>
        ) : null}
      </div>
    </aside>
  );
}

function PoTemplateManageCard() {
  const navigate = useNavigate();
  const template = loadPoTemplateDraft();

  return (
    <div
      style={{
        padding: '14px 0',
        borderBottom: '1px solid #F1F5F9',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          padding: '14px 16px',
          background: template.fileName ? P2P_BRAND.surface : '#F8FAFC',
          border: `1px solid ${template.fileName ? P2P_BRAND.surfaceBorder : '#E4E7EC'}`,
          borderRadius: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#FFFFFF',
              border: '1px solid #E4E7EC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={18} color={P2P_BRAND.primary} aria-hidden />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
              Purchase order document template
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B', lineHeight: 1.45 }}>
              {template.fileName
                ? `${template.templateName || 'Company template'} · ${template.fileName}`
                : 'Upload your company PO document — it becomes the final generated layout.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/setup/po-template')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            border: 'none',
            borderRadius: '8px',
            background: P2P_BRAND.primary,
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: F,
            flexShrink: 0,
          }}
        >
          {template.fileName ? 'Manage template' : 'Set up template'}
          <ArrowRight size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function PurchaseOrderOptions() {
  const [saved, setSaved] = useState(() => createDefaultPurchaseOrderOptions());
  const [draft, setDraft] = useState(() => createDefaultPurchaseOrderOptions());
  const [showSavedToast, setShowSavedToast] = useState(false);

  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);

  const patch = (partial: Partial<PurchaseOrderOptionsState>) => {
    setDraft((current) => ({ ...current, ...partial }));
  };

  const handleSave = () => {
    setSaved(draft);
    setShowSavedToast(true);
    window.setTimeout(() => setShowSavedToast(false), 2400);
  };

  const handleReset = () => setDraft(saved);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: '#F5F7FA',
        fontFamily: F,
        overflow: 'hidden',
      }}
    >
      <SkipToMainContent />
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <TopHeader />

        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px 32px',
            minWidth: 0,
          }}
        >
          <nav aria-label="Breadcrumb" style={{ marginBottom: '20px' }}>
            <ol
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
                padding: 0,
                listStyle: 'none',
                fontSize: '12px',
                color: '#64748B',
              }}
            >
              <li>Setup &amp; configuration</li>
              <li aria-hidden>
                <ChevronRight size={14} color="#CBD5E1" />
              </li>
              <li>Transaction Setup</li>
              <li aria-hidden>
                <ChevronRight size={14} color="#CBD5E1" />
              </li>
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Purchase Order Options</li>
            </ol>
          </nav>

          <header
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                Purchase Order Options
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '62ch', lineHeight: 1.5 }}>
                Configure how purchase orders are created, emailed, and displayed. Use the{' '}
                <span style={{ color: '#94A3B8' }}>?</span> icon beside any option for details.
              </p>
            </div>
            {isDirty ? (
              <span
                style={{
                  flexShrink: 0,
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
          </header>

          <section
            style={{
              background: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
            }}
          >
            <div style={{ padding: '8px 24px 0' }}>
              <PrOptionSectionHeader
                title={PO_OPTION_SECTIONS[0].title}
                description={PO_OPTION_SECTIONS[0].description}
                isFirst
              />

              <SetupOptionGrid>
                <SetupOptionRow
                  id="auto-create-po"
                  helpId="auto-create-po"
                  helpText={PO_OPTION_HELP['auto-create-po']}
                  label="Auto create PO upon final approval"
                  checked={draft.autoCreatePoOnFinalApproval}
                  onCheckedChange={(checked) => patch({ autoCreatePoOnFinalApproval: checked })}
                />

                <SetupOptionRow
                  id="allow-consolidation"
                  helpId="allow-consolidation"
                  helpText={PO_OPTION_HELP['allow-consolidation']}
                  label="Allow purchase order consolidation"
                  checked={draft.allowPoConsolidation}
                  onCheckedChange={(checked) => patch({ allowPoConsolidation: checked })}
                />

                <SetupOptionRow
                  id="allow-users-create-pos"
                  helpId="allow-users-create-pos"
                  helpText={PO_OPTION_HELP['allow-users-create-pos']}
                  label="Allow users to create their own purchase orders"
                  checked={draft.allowUsersCreateOwnPos}
                  onCheckedChange={(checked) => patch({ allowUsersCreateOwnPos: checked })}
                />
              </SetupOptionGrid>

              <PrOptionSectionHeader
                title={PO_OPTION_SECTIONS[1].title}
                description={PO_OPTION_SECTIONS[1].description}
              />

              <SetupOptionGrid>
                <SetupOptionRow
                  id="send-link-coordinators"
                  helpId="send-link-coordinators"
                  helpText={PO_OPTION_HELP['send-link-coordinators']}
                  label="Send PO link to PO coordinators"
                  checked={draft.sendPoLinkToCoordinators}
                  onCheckedChange={(checked) => patch({ sendPoLinkToCoordinators: checked })}
                />

                <SetupOptionRow
                  id="send-link-requester"
                  helpId="send-link-requester"
                  helpText={PO_OPTION_HELP['send-link-requester']}
                  label="Send PO link to requester"
                  checked={draft.sendPoLinkToRequester}
                  onCheckedChange={(checked) => patch({ sendPoLinkToRequester: checked })}
                />

                <SetupOptionRow
                  id="cc-on-email"
                  helpId="cc-on-email"
                  helpText={PO_OPTION_HELP['cc-on-email']}
                  label="Automatically send a CC notification email when emailing POs"
                  checked={draft.ccNotificationWhenEmailingPos}
                  onCheckedChange={(checked) => patch({ ccNotificationWhenEmailingPos: checked })}
                />

                <SetupOptionRow
                  id="include-attachments-email"
                  helpId="include-attachments-email"
                  helpText={PO_OPTION_HELP['include-attachments-email']}
                  label="Include attachments with PO email"
                  checked={draft.includeAttachmentsWithPoEmail}
                  onCheckedChange={(checked) => patch({ includeAttachmentsWithPoEmail: checked })}
                />

                <SetupOptionRow
                  id="select-all-attachments"
                  helpId="select-all-attachments"
                  helpText={PO_OPTION_HELP['select-all-attachments']}
                  label="Select all attachments by default when emailing a PO"
                  checked={draft.selectAllAttachmentsByDefault}
                  onCheckedChange={(checked) => patch({ selectAllAttachmentsByDefault: checked })}
                />
              </SetupOptionGrid>

              <PrOptionSectionHeader
                title={PO_OPTION_SECTIONS[2].title}
                description={PO_OPTION_SECTIONS[2].description}
              />

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
                <div style={{ minWidth: 0 }}>
                  <SetupOptionRow
                    id="logo-on-po"
                    helpId="logo-on-po"
                    helpText={PO_OPTION_HELP['logo-on-po']}
                    label="Logo on PO"
                    checked={draft.logoOnPo}
                    onCheckedChange={(checked) => patch({ logoOnPo: checked })}
                    showSideWhenUnchecked
                    sideContent={
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '14px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                          <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#94A3B8', lineHeight: 1.45 }}>
                            Image must be 150 × 150 pixels. JPG or PNG only.
                          </p>
                          <FileUploadControl
                            disabled={!draft.logoOnPo}
                            fileName={draft.logoFileName}
                            accept=".jpg,.jpeg,.png"
                            ariaLabel="Upload PO logo"
                            onFileSelect={(logoFileName) => patch({ logoFileName })}
                          />
                        </div>
                        <div
                          aria-hidden
                          style={{
                            width: '150px',
                            height: '150px',
                            flexShrink: 0,
                            borderRadius: '8px',
                            border: `1.5px dashed ${draft.logoFileName ? P2P_BRAND.surfaceBorder : '#D0D5DD'}`,
                            background: '#F8FAFC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            color: '#94A3B8',
                            textAlign: 'center',
                            padding: '8px',
                          }}
                        >
                          {draft.logoFileName ? draft.logoFileName : 'Logo preview'}
                        </div>
                      </div>
                    }
                  />

                  <SetupOptionRow
                    id="terms-and-conditions"
                    helpId="terms-and-conditions"
                    helpText={PO_OPTION_HELP['terms-and-conditions']}
                    label="Terms and conditions"
                    checked={draft.termsAndConditions}
                    onCheckedChange={(checked) => patch({ termsAndConditions: checked })}
                    sideContent={
                      <textarea
                        value={draft.termsText}
                        disabled={!draft.termsAndConditions}
                        onChange={(e) => patch({ termsText: e.target.value })}
                        rows={5}
                        aria-label="Terms and conditions text"
                        style={{
                          ...fieldStyle,
                          resize: 'vertical',
                          minHeight: '120px',
                        }}
                      />
                    }
                  />

                  <SetupOptionRow
                    id="terms-as-attachment"
                    helpId="terms-as-attachment"
                    helpText={PO_OPTION_HELP['terms-as-attachment']}
                    label="Terms and conditions as attachment to emailed POs"
                    checked={draft.termsAsAttachment}
                    onCheckedChange={(checked) => patch({ termsAsAttachment: checked })}
                    sideContent={
                      <FileUploadControl
                        disabled={!draft.termsAsAttachment}
                        fileName={draft.termsAttachmentFileName}
                        accept=".pdf,.doc,.docx"
                        ariaLabel="Upload terms and conditions attachment"
                        onFileSelect={(termsAttachmentFileName) => patch({ termsAttachmentFileName })}
                      />
                    }
                  />

                  <PoTemplateManageCard />
                </div>

                <PoDocumentPreview draft={draft} />
              </div>

              <PrOptionSectionHeader
                title={PO_OPTION_SECTIONS[3].title}
                description={PO_OPTION_SECTIONS[3].description}
              />

              <SetupOptionGrid>
                <SetupOptionRow
                  id="show-ship-method"
                  helpId="show-ship-method"
                  helpText={PO_OPTION_HELP['show-ship-method']}
                  label="Show ship method on the form"
                  checked={draft.showShipMethodOnForm}
                  onCheckedChange={(checked) => patch({ showShipMethodOnForm: checked })}
                />

                <SetupOptionRow
                  id="show-account"
                  helpId="show-account"
                  helpText={PO_OPTION_HELP['show-account']}
                  label="Show column 'account' on the PO form"
                  checked={draft.showAccountColumn}
                  onCheckedChange={(checked) => patch({ showAccountColumn: checked })}
                />

                <SetupOptionRow
                  id="show-project-name"
                  helpId="show-project-name"
                  helpText={PO_OPTION_HELP['show-project-name']}
                  label="Show column 'project name' on the PO form"
                  checked={draft.showProjectNameColumn}
                  onCheckedChange={(checked) => patch({ showProjectNameColumn: checked })}
                />

                <SetupOptionRow
                  id="show-required-by"
                  helpId="show-required-by"
                  helpText={PO_OPTION_HELP['show-required-by']}
                  label="Show column 'required by' on PO form"
                  checked={draft.showRequiredByColumn}
                  onCheckedChange={(checked) => patch({ showRequiredByColumn: checked })}
                />

                <SetupOptionRow
                  id="show-po-coordinator"
                  helpId="show-po-coordinator"
                  helpText={PO_OPTION_HELP['show-po-coordinator']}
                  label="Show PO coordinator on the PO form"
                  checked={draft.showPoCoordinatorOnForm}
                  onCheckedChange={(checked) => patch({ showPoCoordinatorOnForm: checked })}
                />

                <SetupOptionRow
                  id="show-revision-number"
                  helpId="show-revision-number"
                  helpText={PO_OPTION_HELP['show-revision-number']}
                  label="Show revision number on PO form for change orders"
                  checked={draft.showRevisionNumberOnForm}
                  onCheckedChange={(checked) => patch({ showRevisionNumberOnForm: checked })}
                />
              </SetupOptionGrid>
            </div>

            <footer
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E4E7EC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                background: '#FAFBFC',
              }}
            >
              <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                {showSavedToast ? (
                  <span style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Settings saved.</span>
                ) : (
                  'Changes apply to new and edited purchase orders.'
                )}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!isDirty}
                  style={{
                    padding: '10px 16px',
                    border: `1px solid ${P2P_BRAND.surfaceBorder}`,
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: isDirty ? P2P_BRAND.primaryStrong : '#94A3B8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isDirty ? 'pointer' : 'not-allowed',
                    fontFamily: F,
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    background: isDirty ? P2P_BRAND.primary : '#94A3B8',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isDirty ? 'pointer' : 'not-allowed',
                    fontFamily: F,
                    boxShadow: isDirty ? '0 1px 2px rgba(31, 169, 122, 0.28)' : 'none',
                  }}
                >
                  Save
                </button>
              </div>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}
