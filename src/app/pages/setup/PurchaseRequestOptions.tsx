import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { PrOptionHelp, PrOptionSectionHeader } from '../../components/setup/PrOptionHelp';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  createDefaultPurchaseRequestOptions,
  SHIPPING_METHOD_OPTIONS,
  TAX_DIFF_OPTIONS,
  UOM_DEFAULT_OPTIONS,
  type PurchaseRequestOptionsState,
} from '../../data/purchaseRequestOptions';
import { PR_OPTION_HELP, PR_OPTION_SECTIONS } from '../../data/purchaseRequestOptionsHelp';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

const CHECKBOX_CLASS =
  'size-[18px] shrink-0 rounded-[5px] border-[#D0D5DD] data-[state=checked]:border-[var(--p2p-brand)] data-[state=checked]:bg-[var(--p2p-brand)] data-[state=checked]:text-white';

type OptionRowProps = {
  id: string;
  helpId: string;
  label: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  disabledHint?: string;
  children?: React.ReactNode;
};

function OptionRow({
  id,
  helpId,
  label,
  checked,
  onCheckedChange,
  disabled,
  disabledHint,
  children,
}: OptionRowProps) {
  const helpText = PR_OPTION_HELP[helpId];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '11px 0',
        borderBottom: '1px solid #F1F5F9',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
        <Checkbox
          id={id}
          checked={checked}
          disabled={disabled}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          className={`${CHECKBOX_CLASS} mt-0.5`}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexWrap: 'wrap',
            }}
          >
            <label
              htmlFor={id}
              style={{
                fontSize: '13px',
                color: '#334155',
                lineHeight: 1.45,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {label}
            </label>
            {helpText ? <PrOptionHelp helpId={helpId} text={helpText} /> : null}
          </div>
          {disabled && disabledHint ? (
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8', lineHeight: 1.4 }}>{disabledHint}</p>
          ) : null}
        </div>
      </div>
      {children ? <div style={{ flexShrink: 0 }}>{children}</div> : null}
    </div>
  );
}

function InlineNumberInput({
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <input
      type="number"
      min={1}
      max={365}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => {
        const next = Number.parseInt(e.target.value, 10);
        if (!Number.isNaN(next)) onChange(Math.min(365, Math.max(1, next)));
      }}
      style={{
        width: '52px',
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
  );
}

function InlineSelect({
  value,
  onChange,
  options,
  disabled,
  ariaLabel,
  width = 168,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  disabled?: boolean;
  ariaLabel: string;
  width?: number;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-8 border-[#E4E7EC] bg-white text-[13px] shadow-none focus-visible:border-[var(--p2p-brand)] focus-visible:ring-[color-mix(in_srgb,var(--p2p-brand)_18%,transparent)]"
        style={{ width, fontFamily: F }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option} className="text-[13px]">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PurchaseRequestOptions() {
  const [saved, setSaved] = useState(() => createDefaultPurchaseRequestOptions());
  const [draft, setDraft] = useState(() => createDefaultPurchaseRequestOptions());
  const [showSavedToast, setShowSavedToast] = useState(false);

  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);

  const patch = (partial: Partial<PurchaseRequestOptionsState>) => {
    setDraft((current) => ({ ...current, ...partial }));
  };

  const handleSave = () => {
    setSaved(draft);
    setShowSavedToast(true);
    window.setTimeout(() => setShowSavedToast(false), 2400);
  };

  const handleReset = () => setDraft(saved);

  const hideVendorInputDisabled = draft.lineItemVendorSelection;

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
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Purchase Request Options</li>
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
                Purchase Request Options
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '62ch', lineHeight: 1.5 }}>
                Configure how purchase requests behave for vendors, line items, dates, and approvals across your
                organization. Use the <span style={{ color: '#94A3B8' }}>?</span> icon beside any option for details.
              </p>
            </div>
            {isDirty && (
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
            )}
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
                title={PR_OPTION_SECTIONS[0].title}
                description={PR_OPTION_SECTIONS[0].description}
                isFirst
              />

              <OptionRow
                id="allow-freeform-vendor"
                helpId="allow-freeform-vendor"
                label="Allow freeform vendor entry (require vendor approval workflow)"
                checked={draft.allowFreeformVendorEntry}
                onCheckedChange={(checked) => patch({ allowFreeformVendorEntry: checked })}
              />

              <OptionRow
                id="hide-vendor-input"
                helpId="hide-vendor-input"
                label="Hide the vendor input field (requires quoting)"
                checked={draft.hideVendorInputField}
                disabled={hideVendorInputDisabled}
                disabledHint="Unavailable while line-item vendor selection is enabled."
                onCheckedChange={(checked) => patch({ hideVendorInputField: checked })}
              />

              <OptionRow
                id="line-item-vendor"
                helpId="line-item-vendor"
                label="Line item Vendor Selection (allow multiple vendors per request)"
                checked={draft.lineItemVendorSelection}
                onCheckedChange={(checked) =>
                  patch({
                    lineItemVendorSelection: checked,
                    hideVendorInputField: checked ? false : draft.hideVendorInputField,
                  })
                }
              />

              <OptionRow
                id="hide-vendor-terms"
                helpId="hide-vendor-terms"
                label="Hide the vendor terms selection field"
                checked={draft.hideVendorTermsField}
                onCheckedChange={(checked) => patch({ hideVendorTermsField: checked })}
              />

              <OptionRow
                id="default-vendor-terms"
                helpId="default-vendor-terms"
                label="Default the vendor terms from vendor setup"
                checked={draft.defaultVendorTermsFromSetup}
                onCheckedChange={(checked) => patch({ defaultVendorTermsFromSetup: checked })}
              />

              <OptionRow
                id="allow-no-vendor"
                helpId="allow-no-vendor"
                label="Allow PR submission with No vendor (requires quoting)"
                checked={draft.allowPrSubmissionNoVendor}
                onCheckedChange={(checked) => patch({ allowPrSubmissionNoVendor: checked })}
              />

              <OptionRow
                id="require-vendor-header"
                helpId="require-vendor-header"
                label="Require vendor selection on purchase request header"
                checked={draft.requireVendorOnHeader}
                onCheckedChange={(checked) => patch({ requireVendorOnHeader: checked })}
              />

              <PrOptionSectionHeader
                title={PR_OPTION_SECTIONS[1].title}
                description={PR_OPTION_SECTIONS[1].description}
              />

              <OptionRow
                id="hide-required-by-date"
                helpId="hide-required-by-date"
                label="Hide required by date on item detail screen"
                checked={draft.hideRequiredByDate}
                onCheckedChange={(checked) => patch({ hideRequiredByDate: checked })}
              />

              <OptionRow
                id="set-require-by-offset"
                helpId="set-require-by-offset"
                label={
                  <>
                    Set require by date to{' '}
                    <InlineNumberInput
                      value={draft.requireByDays}
                      disabled={!draft.setRequireByDateOffset}
                      ariaLabel="Days after item creation"
                      onChange={(requireByDays) => patch({ requireByDays })}
                    />{' '}
                    days after item creation
                  </>
                }
                checked={draft.setRequireByDateOffset}
                onCheckedChange={(checked) => patch({ setRequireByDateOffset: checked })}
              />

              <PrOptionSectionHeader
                title={PR_OPTION_SECTIONS[2].title}
                description={PR_OPTION_SECTIONS[2].description}
              />

              <OptionRow
                id="view-other-dept-requests"
                helpId="view-other-dept-requests"
                label="Allow user to view other requests within their departments"
                checked={draft.allowViewOtherDeptRequests}
                onCheckedChange={(checked) => patch({ allowViewOtherDeptRequests: checked })}
              />

              <OptionRow
                id="update-dept-loc-templates"
                helpId="update-dept-loc-templates"
                label="Update department and location on copied templates from the user profile"
                checked={draft.updateDeptLocOnCopiedTemplates}
                onCheckedChange={(checked) => patch({ updateDeptLocOnCopiedTemplates: checked })}
              />

              <PrOptionSectionHeader
                title={PR_OPTION_SECTIONS[3].title}
                description={PR_OPTION_SECTIONS[3].description}
              />

              <OptionRow
                id="require-account"
                helpId="require-account"
                label="Required account entry on item detail screen"
                checked={draft.requireAccountOnItemDetail}
                onCheckedChange={(checked) => patch({ requireAccountOnItemDetail: checked })}
              />

              <OptionRow
                id="hide-account"
                helpId="hide-account"
                label="Hide account field on item detail screen"
                checked={draft.hideAccountOnItemDetail}
                onCheckedChange={(checked) => patch({ hideAccountOnItemDetail: checked })}
              />

              <OptionRow
                id="require-project"
                helpId="require-project"
                label="Require project entry on item detail screen"
                checked={draft.requireProjectOnItemDetail}
                onCheckedChange={(checked) => patch({ requireProjectOnItemDetail: checked })}
              />

              <OptionRow
                id="hide-project"
                helpId="hide-project"
                label="Hide project field on item detail screen"
                checked={draft.hideProjectOnItemDetail}
                onCheckedChange={(checked) => patch({ hideProjectOnItemDetail: checked })}
              />

              <OptionRow
                id="hide-tax"
                helpId="hide-tax"
                label="Hide tax field on item detail screen"
                checked={draft.hideTaxField}
                onCheckedChange={(checked) => patch({ hideTaxField: checked })}
              >
                <InlineSelect
                  value={draft.taxDiffMode}
                  options={TAX_DIFF_OPTIONS}
                  disabled={!draft.hideTaxField}
                  ariaLabel="Tax diff mode"
                  onChange={(taxDiffMode) => patch({ taxDiffMode })}
                />
              </OptionRow>

              <OptionRow
                id="hide-uom"
                helpId="hide-uom"
                label="Hide UOM field on item detail screen"
                checked={draft.hideUomField}
                onCheckedChange={(checked) => patch({ hideUomField: checked })}
              >
                <InlineSelect
                  value={draft.uomDefault}
                  options={UOM_DEFAULT_OPTIONS}
                  disabled={!draft.hideUomField}
                  ariaLabel="Default unit of measure"
                  width={148}
                  onChange={(uomDefault) => patch({ uomDefault })}
                />
              </OptionRow>

              <PrOptionSectionHeader
                title={PR_OPTION_SECTIONS[4].title}
                description={PR_OPTION_SECTIONS[4].description}
              />

              <OptionRow
                id="alert-delayed-approvals"
                helpId="alert-delayed-approvals"
                label="Alert approvers of delayed approvals"
                checked={draft.alertDelayedApprovals}
                onCheckedChange={(checked) => patch({ alertDelayedApprovals: checked })}
              />

              <OptionRow
                id="include-attachments"
                helpId="include-attachments"
                label="Include attachments with approval required emails"
                checked={draft.includeAttachmentsWithApprovalEmails}
                onCheckedChange={(checked) => patch({ includeAttachmentsWithApprovalEmails: checked })}
              />

              <PrOptionSectionHeader
                title={PR_OPTION_SECTIONS[5].title}
                description={PR_OPTION_SECTIONS[5].description}
              />

              <OptionRow
                id="default-shipping"
                helpId="default-shipping"
                label="Default shipping method"
                checked={draft.defaultShippingMethod}
                onCheckedChange={(checked) => patch({ defaultShippingMethod: checked })}
              >
                <InlineSelect
                  value={draft.shippingMethod}
                  options={SHIPPING_METHOD_OPTIONS}
                  disabled={!draft.defaultShippingMethod}
                  ariaLabel="Default shipping method"
                  width={132}
                  onChange={(shippingMethod) => patch({ shippingMethod })}
                />
              </OptionRow>
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
                  'Changes apply to new and edited purchase requests.'
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
