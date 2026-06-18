import { useState, type CSSProperties } from 'react';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { PrOptionSectionHeader } from '../../components/setup/PrOptionHelp';
import { SetupOptionGrid, SetupOptionRow } from '../../components/setup/SetupOptionRow';
import {
  createDefaultReceivingOptions,
  type ReceivingOptionsState,
} from '../../data/receivingOptions';
import { RECEIVING_OPTION_HELP, RECEIVING_OPTION_SECTIONS } from '../../data/receivingOptionsHelp';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

function InlineNumberInput({
  value,
  onChange,
  disabled,
  ariaLabel,
  min = 0,
  max = 999999,
  width = 52,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  ariaLabel: string;
  min?: number;
  max?: number;
  width?: number;
  suffix?: string;
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => {
          const next = Number.parseFloat(e.target.value);
          if (!Number.isNaN(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
        style={{
          width,
          height: '32px',
          padding: '0 8px',
          border: `1px solid ${disabled ? '#E4E7EC' : P2P_BRAND.surfaceBorder}`,
          borderRadius: '6px',
          fontSize: '13px',
          fontFamily: F,
          color: '#0F172A',
          background: disabled ? '#F8FAFC' : '#FFFFFF',
          outline: 'none',
          textAlign: 'center',
        }}
      />
      {suffix ? <span style={{ fontSize: '13px', color: '#64748B' }}>{suffix}</span> : null}
    </span>
  );
}

const footerStyle: CSSProperties = {
  padding: '16px 24px',
  borderTop: '1px solid #E4E7EC',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  background: '#FAFBFC',
};

export function ReceivingOptions() {
  const [saved, setSaved] = useState(() => createDefaultReceivingOptions());
  const [draft, setDraft] = useState(() => createDefaultReceivingOptions());
  const [showSavedToast, setShowSavedToast] = useState(false);

  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);

  const patch = (partial: Partial<ReceivingOptionsState>) => {
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopHeader />

        <main
          id="main-content"
          tabIndex={-1}
          style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 32px', minWidth: 0 }}
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
                flexWrap: 'wrap',
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
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Receiving Options</li>
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
                Receiving Options
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '62ch', lineHeight: 1.5 }}>
                Configure how goods are received, when change orders are required, and who gets notified. Use the{' '}
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
                title={RECEIVING_OPTION_SECTIONS[0].title}
                description={RECEIVING_OPTION_SECTIONS[0].description}
                isFirst
              />

              <SetupOptionRow
                id="force-change-percent"
                helpId="force-change-percent"
                helpText={RECEIVING_OPTION_HELP['force-change-percent']}
                label={
                  <>
                    Force change order when over receiving by{' '}
                    <InlineNumberInput
                      value={draft.overReceivePercent}
                      disabled={!draft.forceChangeOrderOverReceivePercent}
                      ariaLabel="Over-receiving percentage threshold"
                      min={1}
                      max={100}
                      suffix="%"
                      onChange={(overReceivePercent) => patch({ overReceivePercent })}
                    />
                  </>
                }
                checked={draft.forceChangeOrderOverReceivePercent}
                onCheckedChange={(checked) => patch({ forceChangeOrderOverReceivePercent: checked })}
              />

              <SetupOptionRow
                id="force-change-amount"
                helpId="force-change-amount"
                helpText={RECEIVING_OPTION_HELP['force-change-amount']}
                label={
                  <>
                    Force change order when over spending by{' '}
                    <InlineNumberInput
                      value={draft.overSpendAmount}
                      disabled={!draft.forceChangeOrderOverSpendAmount}
                      ariaLabel="Over-spending amount threshold"
                      min={1}
                      max={999999}
                      width={72}
                      suffix="USD"
                      onChange={(overSpendAmount) => patch({ overSpendAmount })}
                    />
                  </>
                }
                checked={draft.forceChangeOrderOverSpendAmount}
                onCheckedChange={(checked) => patch({ forceChangeOrderOverSpendAmount: checked })}
              />

              <PrOptionSectionHeader
                title={RECEIVING_OPTION_SECTIONS[1].title}
                description={RECEIVING_OPTION_SECTIONS[1].description}
              />

              <SetupOptionGrid>
                <SetupOptionRow
                  id="allow-price-changes"
                  helpId="allow-price-changes"
                  helpText={RECEIVING_OPTION_HELP['allow-price-changes']}
                  label="Allow line item price changes on the receiving screen"
                  checked={draft.allowLineItemPriceChanges}
                  onCheckedChange={(checked) => patch({ allowLineItemPriceChanges: checked })}
                />

                <SetupOptionRow
                  id="allow-edit-accounts"
                  helpId="allow-edit-accounts"
                  helpText={RECEIVING_OPTION_HELP['allow-edit-accounts']}
                  label="Allow editing of accounts on receipts"
                  checked={draft.allowEditingAccountsOnReceipts}
                  onCheckedChange={(checked) => patch({ allowEditingAccountsOnReceipts: checked })}
                />

                <SetupOptionRow
                  id="allow-edit-projects"
                  helpId="allow-edit-projects"
                  helpText={RECEIVING_OPTION_HELP['allow-edit-projects']}
                  label="Allow editing of projects on receipts"
                  checked={draft.allowEditingProjectsOnReceipts}
                  onCheckedChange={(checked) => patch({ allowEditingProjectsOnReceipts: checked })}
                />

                <SetupOptionRow
                  id="allow-payment-terms"
                  helpId="allow-payment-terms"
                  helpText={RECEIVING_OPTION_HELP['allow-payment-terms']}
                  label="Allow users to change payment terms on receipts"
                  checked={draft.allowChangePaymentTermsOnReceipts}
                  onCheckedChange={(checked) => patch({ allowChangePaymentTermsOnReceipts: checked })}
                />
              </SetupOptionGrid>

              <PrOptionSectionHeader
                title={RECEIVING_OPTION_SECTIONS[2].title}
                description={RECEIVING_OPTION_SECTIONS[2].description}
              />

              <SetupOptionRow
                id="alert-non-receipt"
                helpId="alert-non-receipt"
                helpText={RECEIVING_OPTION_HELP['alert-non-receipt']}
                label={
                  <>
                    Alert receivers on non-receipt after{' '}
                    <InlineNumberInput
                      value={draft.nonReceiptAlertDays}
                      disabled={!draft.alertNonReceiptAfterDays}
                      ariaLabel="Days before non-receipt alert"
                      min={1}
                      max={365}
                      onChange={(nonReceiptAlertDays) => patch({ nonReceiptAlertDays })}
                    />{' '}
                    days
                  </>
                }
                checked={draft.alertNonReceiptAfterDays}
                onCheckedChange={(checked) => patch({ alertNonReceiptAfterDays: checked })}
              />

              <PrOptionSectionHeader
                title={RECEIVING_OPTION_SECTIONS[3].title}
                description={RECEIVING_OPTION_SECTIONS[3].description}
              />

              <SetupOptionGrid>
                <SetupOptionRow
                  id="email-invoicing-full"
                  helpId="email-invoicing-full"
                  helpText={RECEIVING_OPTION_HELP['email-invoicing-full']}
                  label="Send email to users with invoicing rights when a request is fully received"
                  checked={draft.emailInvoicingFullyReceived}
                  onCheckedChange={(checked) => patch({ emailInvoicingFullyReceived: checked })}
                />

                <SetupOptionRow
                  id="email-invoicing-partial"
                  helpId="email-invoicing-partial"
                  helpText={RECEIVING_OPTION_HELP['email-invoicing-partial']}
                  label="Send email to users with invoicing rights when partially received but closed for receiving"
                  checked={draft.emailInvoicingPartiallyClosed}
                  onCheckedChange={(checked) => patch({ emailInvoicingPartiallyClosed: checked })}
                />

                <SetupOptionRow
                  id="email-requester-any"
                  helpId="email-requester-any"
                  helpText={RECEIVING_OPTION_HELP['email-requester-any']}
                  label="Send email to original requester when any receipt is created"
                  checked={draft.emailRequesterAnyReceipt}
                  onCheckedChange={(checked) => patch({ emailRequesterAnyReceipt: checked })}
                />

                <SetupOptionRow
                  id="email-requester-full"
                  helpId="email-requester-full"
                  helpText={RECEIVING_OPTION_HELP['email-requester-full']}
                  label="Send email to original requester when a requisition is fully received"
                  checked={draft.emailRequesterFullyReceived}
                  onCheckedChange={(checked) => patch({ emailRequesterFullyReceived: checked })}
                />
              </SetupOptionGrid>

              <PrOptionSectionHeader
                title={RECEIVING_OPTION_SECTIONS[4].title}
                description={RECEIVING_OPTION_SECTIONS[4].description}
              />

              <SetupOptionRow
                id="require-attachments"
                helpId="require-attachments"
                helpText={RECEIVING_OPTION_HELP['require-attachments']}
                label="Require attachments for saving receipts"
                checked={draft.requireAttachmentsForReceipts}
                onCheckedChange={(checked) => patch({ requireAttachmentsForReceipts: checked })}
              />
            </div>

            <footer style={footerStyle}>
              <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                {showSavedToast ? (
                  <span style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Settings saved.</span>
                ) : (
                  'Changes apply to new and edited receipts.'
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
