import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import {
  areInvoiceRequiredFieldsComplete,
  formatConfidence,
  formatPortalCurrency,
  getConfidenceTone,
  getPortalSectionLabel,
  invoiceHasLowConfidenceFields,
  sumLineQty,
  sumLineTotal,
  type InvoiceExtractedField,
  type InvoiceFieldSection,
  type PortalDocument,
  type PortalHistoryEntry,
  type PortalLineItem,
  type PortalSection,
} from '../../data/vendorPortal';

const DRAWER_WIDTH = 300;
const SECTION_INSET = 14;
/** Default extracted-fields width (+20% vs prior 396px). Panel is user-resizable in the invoice layout. */
export const DEFAULT_EXTRACTED_PANEL_WIDTH = 475;

const NEUTRAL = {
  text: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  border: '#E4E7EC',
  borderLight: '#EEF1F5',
  surface: '#FAFBFC',
  fieldBg: '#F5F5F5',
  white: '#FFFFFF',
} as const;

const CONFIDENCE_TONES = {
  high: { border: P2P_BRAND.surfaceBorder, bg: P2P_BRAND.surface, color: P2P_BRAND.primaryStrong },
  medium: { border: '#E4E7EC', bg: NEUTRAL.surface, color: '#78716C' },
  low: { border: '#FECACA', bg: '#FEF2F2', color: '#B91C1C' },
} as const;

const LEGEND_PATCHES = {
  high: { bg: '#ECFAF5', dot: '#6EE7B7', text: P2P_BRAND.primaryStrong },
  medium: { bg: '#F4F4F5', dot: '#A8A29E', text: '#57534E' },
  low: { bg: '#FEF2F2', dot: '#FCA5A5', text: '#B91C1C' },
} as const;

const META_BADGE_TONES: Record<string, { bg: string; text: string }> = {
  'Pending Verification': { bg: '#FFF4E6', text: '#EA580C' },
  Extracted: { bg: '#ECFAF5', text: P2P_BRAND.primaryStrong },
  'Non-PO': { bg: '#F4F4F5', text: '#57534E' },
};

const NON_PO_BANNER = {
  bg: '#FFF4E6',
  border: '#FED7AA',
  title: '#EA580C',
  icon: '#EA580C',
  body: '#57534E',
  selectBorder: '#FED7AA',
  actionBg: '#EA580C',
  actionText: '#FFFFFF',
} as const;

function getMetaBadgeTone(label: string) {
  return META_BADGE_TONES[label] ?? { bg: '#F8FAFC', text: NEUTRAL.muted };
}

function MetaBadge({ label }: { label: string }) {
  const tone = getMetaBadgeTone(label);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 600,
        background: tone.bg,
        color: tone.text,
        whiteSpace: 'nowrap',
        fontFamily: F,
        lineHeight: 1.2,
      }}
    >
      {label}
    </span>
  );
}

function AiBadge({ confidence }: { confidence: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 600,
        background: NEUTRAL.surface,
        color: NEUTRAL.text,
        border: `1px solid ${NEUTRAL.border}`,
        fontFamily: F,
      }}
    >
      <Sparkles size={10} color={P2P_BRAND.primary} aria-hidden />
      {formatConfidence(confidence)} AI
    </span>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const tone = CONFIDENCE_TONES[getConfidenceTone(confidence)];
  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: 600,
        color: tone.color,
        fontFamily: F,
      }}
    >
      {formatConfidence(confidence)}
    </span>
  );
}

type InvoiceListPanelProps = {
  documents: PortalDocument[];
  activeDocId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onAiInvoice: () => void;
};

export function InvoiceListPanel({
  documents,
  activeDocId,
  search,
  onSearchChange,
  onSelect,
  onAiInvoice,
}: InvoiceListPanelProps) {
  return (
    <aside style={listPanelStyle}>
      <div style={{ padding: '14px', borderBottom: `1px solid ${NEUTRAL.border}` }}>
        <label style={filterLabelStyle}>Filter Elements</label>
        <div style={filterSelectStyle}>
          Invoices
          <ChevronDown size={14} color={NEUTRAL.faint} aria-hidden />
        </div>
        <button type="button" onClick={onAiInvoice} style={aiInvoiceBtnStyle}>
          <Plus size={14} strokeWidth={2.5} aria-hidden />
          AI Invoice
        </button>
      </div>

      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${NEUTRAL.border}` }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            color={NEUTRAL.faint}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search here"
            aria-label="Search invoices"
            style={searchInputStyle}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {documents.length === 0 ? (
          <p style={{ padding: '16px 14px', fontSize: '12px', color: NEUTRAL.faint, margin: 0 }}>
            No invoice records found.
          </p>
        ) : (
          documents.map((doc) => {
            const meta = doc.invoiceMeta;
            const selected = activeDocId === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelect(doc.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: 'none',
                  borderBottom: `1px solid ${NEUTRAL.borderLight}`,
                  background: selected ? P2P_BRAND.surface : NEUTRAL.white,
                  cursor: 'pointer',
                  fontFamily: F,
                  boxShadow: selected ? `inset 3px 0 0 ${P2P_BRAND.primary}` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  {meta?.needsAttention && (
                    <span
                      aria-label="Needs attention"
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#EF4444',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: NEUTRAL.text }}>
                    {doc.documentNumber}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                  {meta && <AiBadge confidence={meta.aiConfidence} />}
                  {meta?.isNonPo && <MetaBadge label="Non-PO" />}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                  {meta?.workflowStatus === 'extracted' && <MetaBadge label="Extracted" />}
                  {meta?.verificationLabel && <MetaBadge label={meta.verificationLabel} />}
                </div>
                <div style={{ fontSize: '11px', color: NEUTRAL.muted }}>{doc.listTimestamp}</div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

type InvoiceDocumentViewProps = {
  doc: PortalDocument;
  vendorName: string;
};

const DOC = {
  ink: '#1A1A1A',
  inkMuted: '#525252',
  inkFaint: '#737373',
  rule: '#D4D4D4',
  ruleDark: '#A3A3A3',
  ruleLight: '#E5E5E5',
  paper: '#FFFFFF',
  paperBg: '#F5F5F4',
  gridBg: '#FAFAFA',
} as const;

function formatInvoiceCurrency(amount: number): string {
  return `$${formatPortalCurrency(amount)}`;
}

function computeDueDate(invoiceDate: string, termsDays = 15): string {
  const parsed = new Date(invoiceDate);
  if (Number.isNaN(parsed.getTime())) return '—';
  parsed.setDate(parsed.getDate() + termsDays);
  return parsed.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function amountInWords(amount: number): string {
  const whole = Math.floor(amount);
  const cents = Math.round((amount - whole) * 100);
  const units = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function underThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return units[n];
    if (n < 100) return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${units[n % 10]}` : ''}`.trim();
    return `${units[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${underThousand(n % 100)}` : ''}`.trim();
  }

  if (whole === 0) return 'Zero Dollars';

  const parts: string[] = [];
  const millions = Math.floor(whole / 1_000_000);
  const thousands = Math.floor((whole % 1_000_000) / 1_000);
  const remainder = whole % 1_000;

  if (millions) parts.push(`${underThousand(millions)} Million`);
  if (thousands) parts.push(`${underThousand(thousands)} Thousand`);
  if (remainder) parts.push(underThousand(remainder));

  let result = `${parts.join(' ')} Dollar${whole === 1 ? '' : 's'}`;
  if (cents) result += ` and ${cents}/100`;
  return result;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', lineHeight: 1.55 }}>
      <span style={{ fontWeight: 600, color: DOC.inkMuted, minWidth: '72px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: DOC.ink, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function AddressBlock({ title, name, lines }: { title: string; name: string; lines: string[] }) {
  return (
    <div style={{ flex: '1 1 180px', minWidth: 0 }}>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: DOC.inkMuted,
          marginBottom: '6px',
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: DOC.ink, marginBottom: '3px' }}>{name}</div>
      {lines.map((line) => (
        <div key={line} style={{ fontSize: '11px', color: DOC.inkMuted, lineHeight: 1.5 }}>
          {line}
        </div>
      ))}
    </div>
  );
}

function TotalsRow({
  label,
  value,
  bold = false,
  highlight = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '16px',
        padding: highlight ? '8px 10px' : '4px 0',
        borderTop: highlight ? `1.5px solid ${DOC.ink}` : undefined,
        borderBottom: highlight ? `1.5px solid ${DOC.ink}` : undefined,
        marginTop: highlight ? '4px' : undefined,
      }}
    >
      <span
        style={{
          fontSize: highlight ? '12px' : '11px',
          fontWeight: bold || highlight ? 700 : 500,
          color: DOC.inkMuted,
          textAlign: 'right',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: highlight ? '13px' : '11px',
          fontWeight: bold || highlight ? 700 : 500,
          color: DOC.ink,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          minWidth: '88px',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function NonPoInvoiceBanner() {
  return (
    <div style={nonPoBannerStyle} role="status">
      <div style={nonPoBannerMessageStyle}>
        <div style={nonPoBannerIconWrapStyle} aria-hidden>
          <AlertTriangle size={16} color={NON_PO_BANNER.icon} strokeWidth={2.25} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={nonPoBannerTitleStyle}>Non-PO Invoice</div>
          <div style={nonPoBannerBodyStyle}>
            No PO detected. Link a PO or continue as non-PO.
          </div>
        </div>
      </div>

      <div style={nonPoBannerActionsStyle}>
        <span style={nonPoBannerActionLabelStyle}>Link to PO</span>
        <button type="button" style={poSelectStyle} aria-haspopup="listbox">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Select PO or post as Non-PO
          </span>
          <ChevronDown size={14} color={NEUTRAL.faint} aria-hidden style={{ flexShrink: 0 }} />
        </button>
        <button type="button" style={nonPoBtnStyle}>
          Non-PO
        </button>
      </div>
    </div>
  );
}

export function InvoiceDocumentView({ doc, vendorName }: InvoiceDocumentViewProps) {
  const meta = doc.invoiceMeta;
  const lineTotal = sumLineTotal(doc.lineItems);
  const totalTax = doc.lineItems.reduce((sum, line) => sum + (line.tax ?? 0), 0);
  const grandTotal = meta?.amount ?? lineTotal + totalTax;
  const poNumber = meta?.linkedPoNumber ?? (meta?.isNonPo ? '—' : 'N/A');
  const terms = 'Net 15';
  const dueDate = computeDueDate(doc.date);
  const shipLocation = doc.lineItems[0]?.deliveryLocation ?? '—';
  const vendorEmail = meta?.vendorEmail ?? doc.contact;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
      {meta?.isNonPo && <NonPoInvoiceBanner />}

      <div className="portal-scroll" style={{ flex: 1, overflow: 'auto', padding: '16px 20px', background: DOC.paperBg }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A', fontFamily: F }}>
              Invoice Document
            </h2>
            {meta?.verificationLabel && <MetaBadge label={meta.verificationLabel} />}
          </div>
          <button type="button" aria-label="Download invoice" style={iconBtnStyle}>
            <Download size={16} color={NEUTRAL.muted} aria-hidden />
          </button>
        </div>

        <article
          style={{
            background: DOC.paper,
            border: `1px solid ${DOC.rule}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
            padding: '28px 32px 24px',
            fontFamily: F,
            color: DOC.ink,
            maxWidth: '820px',
            margin: '0 auto',
          }}
          aria-label={`Tax invoice ${doc.documentNumber}`}
        >
          {/* Header: vendor info + title */}
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: DOC.ink, marginBottom: '6px' }}>
                {vendorName}
              </div>
              <div style={{ fontSize: '11px', color: DOC.inkMuted, lineHeight: 1.55 }}>{doc.contact}</div>
              {vendorEmail && (
                <div style={{ fontSize: '11px', color: DOC.inkMuted, lineHeight: 1.55, marginTop: '2px' }}>
                  {vendorEmail}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: DOC.ink,
                  lineHeight: 1.1,
                }}
              >
                TAX INVOICE
              </div>
            </div>
          </header>

          {/* Invoice metadata grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              border: `1px solid ${DOC.rule}`,
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                borderRight: `1px solid ${DOC.rule}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: DOC.gridBg,
              }}
            >
              <MetaRow label="#" value={doc.documentNumber} />
              <MetaRow label="Invoice Date" value={doc.date} />
              <MetaRow label="Terms" value={terms} />
              <MetaRow label="Due Date" value={dueDate} />
              <MetaRow label="P.O.#" value={poNumber} />
            </div>
            <div
              style={{
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: DOC.gridBg,
              }}
            >
              <MetaRow label="Place Of Supply" value={doc.organization} />
              <MetaRow label="Amount Due" value={formatInvoiceCurrency(grandTotal)} />
            </div>
          </div>

          {/* Bill To / Ship To */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              paddingBottom: '16px',
              borderBottom: `1px solid ${DOC.rule}`,
            }}
          >
            <AddressBlock
              title="Bill To"
              name={doc.organization}
              lines={['Accounts Payable', 'United States']}
            />
            <AddressBlock title="Ship To" name={doc.organization} lines={[shipLocation]} />
          </div>

          {/* Subject */}
          <div
            style={{
              fontSize: '11px',
              color: DOC.inkMuted,
              marginBottom: '14px',
              padding: '8px 0',
              borderBottom: `1px solid ${DOC.ruleLight}`,
            }}
          >
            <span style={{ fontWeight: 600, color: DOC.ink }}>Subject: </span>
            Invoice {doc.documentNumber} from {vendorName}
          </div>

          {/* Line items table */}
          <div className="portal-scroll" style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '560px',
                fontSize: '11px',
                border: `1px solid ${DOC.rule}`,
              }}
            >
              <thead>
                <tr style={{ background: DOC.gridBg }}>
                  {['#', 'Item & Description', 'Qty', 'Rate', 'Tax', 'Amount'].map((col, i) => (
                    <th
                      key={col}
                      style={{
                        ...invoiceDocThStyle,
                        textAlign: i >= 2 ? 'right' : 'left',
                        borderRight: i < 5 ? `1px solid ${DOC.rule}` : undefined,
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doc.lineItems.map((line, index) => {
                  const lineAmount = line.qty * line.unitPrice;
                  const taxRate = line.tax && lineAmount > 0 ? Math.round((line.tax / lineAmount) * 100) : 0;
                  return (
                    <tr key={line.id}>
                      <td style={{ ...invoiceDocTdStyle, borderRight: `1px solid ${DOC.rule}`, width: '32px' }}>
                        {index + 1}
                      </td>
                      <td style={{ ...invoiceDocTdStyle, borderRight: `1px solid ${DOC.rule}` }}>
                        <div style={{ fontWeight: 600, color: DOC.ink, marginBottom: '2px' }}>
                          {line.description}
                        </div>
                        <div style={{ fontSize: '10px', color: DOC.inkFaint }}>{line.deliveryLocation}</div>
                      </td>
                      <td
                        style={{
                          ...invoiceDocTdStyle,
                          borderRight: `1px solid ${DOC.rule}`,
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {line.qty.toFixed(2)}
                      </td>
                      <td
                        style={{
                          ...invoiceDocTdStyle,
                          borderRight: `1px solid ${DOC.rule}`,
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {formatPortalCurrency(line.unitPrice)}
                      </td>
                      <td
                        style={{
                          ...invoiceDocTdStyle,
                          borderRight: `1px solid ${DOC.rule}`,
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                          color: DOC.inkMuted,
                        }}
                      >
                        {taxRate > 0 ? `${taxRate}%` : '0%'}
                      </td>
                      <td
                        style={{
                          ...invoiceDocTdStyle,
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                          fontWeight: 600,
                        }}
                      >
                        {formatPortalCurrency(lineAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer: notes + totals */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '28px',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: DOC.inkMuted, marginBottom: '4px' }}>
                Total In Words
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: DOC.ink,
                  marginBottom: '14px',
                  lineHeight: 1.5,
                }}
              >
                {amountInWords(grandTotal)}
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: DOC.inkMuted, marginBottom: '4px' }}>
                Notes
              </div>
              <div style={{ fontSize: '11px', color: DOC.inkMuted, lineHeight: 1.5, marginBottom: '12px' }}>
                Thanks for your business. This invoice was extracted and submitted via the vendor portal.
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: DOC.inkMuted, marginBottom: '4px' }}>
                Terms &amp; Conditions
              </div>
              <div style={{ fontSize: '11px', color: DOC.inkMuted, lineHeight: 1.5 }}>
                Payment is due within {terms.replace('Net ', '')} days of invoice date. Late payments may incur
                additional fees.
              </div>
            </div>

            <div style={{ flex: '0 0 240px', minWidth: '200px' }}>
              <TotalsRow label="Sub Total" value={formatPortalCurrency(lineTotal)} />
              {totalTax > 0 && <TotalsRow label="Tax" value={formatPortalCurrency(totalTax)} />}
              <TotalsRow label="Total" value={formatInvoiceCurrency(grandTotal)} bold highlight />
              <TotalsRow label="Balance Due" value={formatInvoiceCurrency(grandTotal)} bold highlight />

              <div
                style={{
                  marginTop: '16px',
                  border: `1px solid ${DOC.ruleDark}`,
                  height: '72px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '6px',
                }}
              >
                <span style={{ fontSize: '10px', color: DOC.inkFaint }}>Authorized Signature</span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '20px',
              textAlign: 'right',
              fontSize: '10px',
              color: DOC.inkFaint,
            }}
          >
            1
          </div>
        </article>
      </div>
    </div>
  );
}

type InvoiceExtractedFieldsPanelProps = {
  doc: PortalDocument;
  onFieldChange: (fieldId: string, value: string) => void;
  historyOpen?: boolean;
  onHistoryToggle?: () => void;
};

function getDefaultExpandedLineSection(sections: InvoiceFieldSection[]): string | null {
  return sections.find((section) => section.id.startsWith('line-'))?.id ?? null;
}

function VerifyInvoiceButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const background = disabled
    ? '#E2E8F0'
    : hovered
      ? P2P_BRAND.primaryHover
      : P2P_BRAND.primary;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        marginTop: '12px',
        padding: '10px 16px',
        border: 'none',
        borderRadius: '8px',
        background,
        color: disabled ? NEUTRAL.faint : NEUTRAL.white,
        fontSize: '13px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: F,
        boxShadow:
          focused && !disabled
            ? `0 0 0 2px ${NEUTRAL.white}, 0 0 0 4px ${P2P_BRAND.primary}`
            : 'none',
        transition: 'background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease',
      }}
    >
      <Check size={15} strokeWidth={2.5} aria-hidden />
      Verify Invoice Data
    </button>
  );
}

export function HistoryToggleButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? 'Close history' : 'Open history'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 10px',
        border: `1px solid ${open ? P2P_BRAND.surfaceBorder : NEUTRAL.border}`,
        borderRadius: '6px',
        background: open ? P2P_BRAND.surface : hovered ? '#F8FAFC' : NEUTRAL.white,
        color: open ? P2P_BRAND.primaryStrong : NEUTRAL.muted,
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: F,
        flexShrink: 0,
        transition: 'background 0.12s ease, border-color 0.12s ease, color 0.12s ease',
      }}
    >
      {open ? (
        <>
          <ChevronRight size={13} aria-hidden />
          Close
        </>
      ) : (
        <>
          <Clock size={13} aria-hidden />
          History
        </>
      )}
    </button>
  );
}

export function InvoiceExtractedFieldsPanel({
  doc,
  onFieldChange,
  historyOpen = false,
  onHistoryToggle,
}: InvoiceExtractedFieldsPanelProps) {
  const meta = doc.invoiceMeta;
  const [expandedLineId, setExpandedLineId] = useState<string | null>(() =>
    meta ? getDefaultExpandedLineSection(meta.fieldSections) : null,
  );
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  if (!meta) return null;

  const showLowConfidenceWarning = invoiceHasLowConfidenceFields(meta);
  const canVerify = areInvoiceRequiredFieldsComplete(meta);

  const toggleLineSection = (sectionId: string) => {
    setExpandedLineId((prev) => (prev === sectionId ? null : sectionId));
  };

  return (
    <aside style={extractedPanelStyle}>
      <div style={{ ...panelHeaderStyle, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span>Extracted Fields</span>
          <AiBadge confidence={meta.aiConfidence} />
        </div>
        {onHistoryToggle && <HistoryToggleButton open={historyOpen} onToggle={onHistoryToggle} />}
      </div>

      <div style={legendStyle}>
        <LegendItem tone="high" label="High" />
        <LegendItem tone="medium" label="Medium" />
        <LegendItem tone="low" label="Low" />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0 8px' }}>
        {meta.fieldSections.map((section, index) => {
          const isHeader = index === 0;
          const isExpanded = isHeader ? true : expandedLineId === section.id;

          return (
            <FieldSection
              key={section.id}
              section={section}
              isHeader={isHeader}
              isExpanded={isExpanded}
              showTopSeparator={!isHeader}
              focusedField={focusedField}
              onToggle={() => toggleLineSection(section.id)}
              onFieldChange={onFieldChange}
              onFocus={setFocusedField}
              onBlur={() => setFocusedField(null)}
            />
          );
        })}
      </div>

      <div style={extractedFooterStyle}>
        <p style={footerNoteStyle}>Auto-post threshold: All critical fields ≥ 90%</p>
        <p style={{ ...footerNoteStyle, marginTop: '4px' }}>
          Tolerances: Price ±10% | Qty ±10% | Tax ±5%
        </p>
        <VerifyInvoiceButton disabled={!canVerify} onClick={() => setVerified(true)} />
        {!canVerify ? (
          <p style={footerWarningStyle}>Complete all required fields to verify invoice data</p>
        ) : (
          showLowConfidenceWarning &&
          !verified && (
            <p style={footerWarningStyle}>Low confidence fields detected — verify before posting</p>
          )
        )}
      </div>
    </aside>
  );
}

function FieldSection({
  section,
  isHeader,
  isExpanded,
  showTopSeparator,
  focusedField,
  onToggle,
  onFieldChange,
  onFocus,
  onBlur,
}: {
  section: InvoiceFieldSection;
  isHeader: boolean;
  isExpanded: boolean;
  showTopSeparator: boolean;
  focusedField: string | null;
  onToggle: () => void;
  onFieldChange: (fieldId: string, value: string) => void;
  onFocus: (fieldId: string) => void;
  onBlur: () => void;
}) {
  const [headerHovered, setHeaderHovered] = useState(false);
  const [headerFocused, setHeaderFocused] = useState(false);

  const titleRow = (
    <span
      style={{
        fontSize: '12px',
        fontWeight: 600,
        color: headerHovered || headerFocused ? '#0F172A' : NEUTRAL.text,
        transition: 'color 0.15s ease',
      }}
    >
      {section.title}
    </span>
  );

  return (
    <section
      style={{
        padding: `0 ${SECTION_INSET}px`,
        paddingBottom: isHeader ? 14 : isExpanded ? 6 : 0,
      }}
    >
      {showTopSeparator && (
        <div
          role="presentation"
          style={{
            height: '1px',
            background: NEUTRAL.border,
            marginLeft: -SECTION_INSET,
            marginRight: -SECTION_INSET,
          }}
        />
      )}

      {isHeader ? (
        <div
          style={{
            ...sectionTitleBarStyle,
            borderBottom: `1px solid ${NEUTRAL.borderLight}`,
            marginBottom: '10px',
            paddingTop: '4px',
          }}
        >
          {titleRow}
        </div>
      ) : (
        <div style={{ marginLeft: -SECTION_INSET, marginRight: -SECTION_INSET }}>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            onMouseEnter={() => setHeaderHovered(true)}
            onMouseLeave={() => setHeaderHovered(false)}
            onFocus={() => setHeaderFocused(true)}
            onBlur={() => setHeaderFocused(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              margin: 0,
              padding: '10px 14px',
              border: 'none',
              borderBottom: isExpanded ? `1px solid ${NEUTRAL.borderLight}` : 'none',
              marginBottom: isExpanded ? '12px' : 0,
              background:
                headerFocused
                  ? '#E6F7F0'
                  : headerHovered
                    ? P2P_BRAND.surface
                    : 'transparent',
              cursor: 'pointer',
              fontFamily: F,
              textAlign: 'left',
              outline: 'none',
              transition: 'background 0.15s ease',
            }}
          >
            {titleRow}
            <ChevronDown
              size={14}
              color={headerHovered || headerFocused ? NEUTRAL.muted : NEUTRAL.faint}
              aria-hidden
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease, color 0.15s ease',
                flexShrink: 0,
              }}
            />
          </button>
        </div>
      )}

      {isExpanded && (
        <div
          style={{
            ...fieldGridStyle,
            paddingBottom: isHeader ? 0 : '14px',
            paddingTop: isHeader ? 0 : '2px',
          }}
        >
          {section.fields.map((field) => (
            <InlineField
              key={field.id}
              field={field}
              isFocused={focusedField === field.id}
              onChange={(value) => onFieldChange(field.id, value)}
              onFocus={() => onFocus(field.id)}
              onBlur={onBlur}
              spanFull={field.id.endsWith('-tax')}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function InlineField({
  field,
  isFocused,
  onChange,
  onFocus,
  onBlur,
  spanFull = false,
}: {
  field: InvoiceExtractedField;
  isFocused: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  spanFull?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const tone = CONFIDENCE_TONES[getConfidenceTone(field.confidence)];

  const borderColor = isFocused
    ? P2P_BRAND.primary
    : isHovered
      ? tone.border
      : NEUTRAL.border;

  const background = isFocused ? NEUTRAL.white : isHovered ? tone.bg : NEUTRAL.fieldBg;

  return (
    <div style={{ minWidth: 0, gridColumn: spanFull ? '1 / -1' : undefined, maxWidth: spanFull ? '50%' : undefined }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          marginBottom: '4px',
        }}
      >
        <label style={fieldLabelStyle} htmlFor={field.id}>
          {field.label}
          {field.required && <span style={{ color: '#DC2626' }}> *</span>}
        </label>
        <ConfidenceBadge confidence={field.confidence} />
      </div>
      <input
        id={field.id}
        type="text"
        value={field.value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '100%',
          height: '34px',
          padding: '0 10px',
          border: `1px solid ${borderColor}`,
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: F,
          color: '#0F172A',
          background,
          boxSizing: 'border-box',
          outline: 'none',
          boxShadow: isFocused ? `0 0 0 2px ${P2P_BRAND.surfaceBorder}` : 'none',
          transition: 'border-color 0.12s ease, box-shadow 0.12s ease, background 0.12s ease',
        }}
      />
    </div>
  );
}

function LegendItem({ tone, label }: { tone: keyof typeof CONFIDENCE_TONES; label: string }) {
  const patch = LEGEND_PATCHES[tone];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 9px',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: 600,
        color: patch.text,
        background: patch.bg,
        fontFamily: F,
        lineHeight: 1.2,
      }}
    >
      <span
        aria-hidden
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '3px',
          background: patch.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}

type InvoiceHistoryDrawerProps = {
  history: PortalHistoryEntry[];
  open: boolean;
  onToggle: () => void;
};

export function InvoiceHistoryDrawer({ history, open, onToggle }: InvoiceHistoryDrawerProps) {
  return (
    <>
      <aside
        aria-hidden={!open}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          background: NEUTRAL.white,
          borderLeft: `1px solid ${NEUTRAL.border}`,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : `translateX(100%)`,
          transition: 'transform 0.22s ease',
          zIndex: 25,
          boxShadow: open ? '-4px 0 16px rgba(16,24,40,0.08)' : 'none',
        }}
      >
        <div style={{ ...panelHeaderStyle, justifyContent: 'space-between' }}>
          <span>History</span>
          <span style={{ fontSize: '11px', fontWeight: 500, color: NEUTRAL.faint }}>
            {history.length} {history.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {history.length === 0 ? (
            <p style={{ padding: '14px', fontSize: '12px', color: NEUTRAL.faint, margin: 0 }}>No history yet.</p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} style={historyEntryStyle}>
                <div style={{ fontSize: '12px', lineHeight: 1.5, color: NEUTRAL.muted }}>
                  <strong style={{ color: NEUTRAL.text }}>{entry.actor}:</strong> {entry.action}
                </div>
                <div style={{ marginTop: '4px', fontSize: '11px', color: NEUTRAL.faint }}>{entry.timestamp}</div>
              </div>
            ))
          )}
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close history overlay"
          onClick={onToggle}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(16,24,40,0.12)',
            border: 'none',
            zIndex: 20,
            cursor: 'default',
          }}
        />
      )}
    </>
  );
}

const SECTION_STATUS: Record<
  'rfq' | 'po',
  { label: string; bg: string; text: string; border: string }
> = {
  rfq: { label: 'Awaiting quote', bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  po: { label: 'Confirmed order', bg: '#ECFAF5', text: P2P_BRAND.primaryStrong, border: P2P_BRAND.surfaceBorder },
};

const SECTION_FILTER_LABEL: Record<'rfq' | 'po', string> = {
  rfq: 'RFQs',
  po: 'POs',
};

type PortalDocumentListPanelProps = {
  section: 'rfq' | 'po';
  documents: PortalDocument[];
  activeDocId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
};

export function PortalDocumentListPanel({
  section,
  documents,
  activeDocId,
  search,
  onSearchChange,
  onSelect,
}: PortalDocumentListPanelProps) {
  const sectionLabel = getPortalSectionLabel(section);
  const filterLabel = SECTION_FILTER_LABEL[section];

  return (
    <aside style={listPanelStyle}>
      <div style={{ padding: '14px', borderBottom: `1px solid ${NEUTRAL.border}` }}>
        <label style={filterLabelStyle}>Filter Elements</label>
        <div style={{ ...filterSelectStyle, marginBottom: 0 }}>
          {filterLabel}
          <ChevronDown size={14} color={NEUTRAL.faint} aria-hidden />
        </div>
      </div>

      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${NEUTRAL.border}` }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            color={NEUTRAL.faint}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search here"
            aria-label={`Search ${sectionLabel.toLowerCase()}s`}
            style={searchInputStyle}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {documents.length === 0 ? (
          <p style={{ padding: '16px 14px', fontSize: '12px', color: NEUTRAL.faint, margin: 0 }}>
            No {sectionLabel.toLowerCase()} records found.
          </p>
        ) : (
          documents.map((doc) => {
            const selected = activeDocId === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelect(doc.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: 'none',
                  borderBottom: `1px solid ${NEUTRAL.borderLight}`,
                  background: selected ? P2P_BRAND.surface : NEUTRAL.white,
                  cursor: 'pointer',
                  fontFamily: F,
                  boxShadow: selected ? `inset 3px 0 0 ${P2P_BRAND.primary}` : 'none',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!selected) e.currentTarget.style.background = NEUTRAL.surface;
                }}
                onMouseLeave={(e) => {
                  if (!selected) e.currentTarget.style.background = NEUTRAL.white;
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: NEUTRAL.text, marginBottom: '4px' }}>
                  {doc.documentNumber}
                </div>
                <div style={{ fontSize: '11px', color: NEUTRAL.muted }}>{doc.listTimestamp}</div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

function StatusBadge({ section }: { section: 'rfq' | 'po' }) {
  const tone = SECTION_STATUS[section];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 600,
        background: tone.bg,
        color: tone.text,
        border: `1px solid ${tone.border}`,
        fontFamily: F,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {tone.label}
    </span>
  );
}

function PortalMetaField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: NEUTRAL.faint,
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: NEUTRAL.text, lineHeight: 1.4 }}>{value}</div>
    </div>
  );
}

function PortalTextInput({
  value,
  onChange,
  ariaLabel,
  align = 'left',
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  align?: 'left' | 'right';
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={ariaLabel}
      style={{
        width: '100%',
        minWidth: '72px',
        height: '34px',
        padding: '0 10px',
        border: `1px solid ${focused ? P2P_BRAND.primary : hovered ? '#CBD5E1' : NEUTRAL.border}`,
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: F,
        color: '#0F172A',
        background: NEUTRAL.white,
        textAlign: align,
        boxSizing: 'border-box',
        outline: 'none',
        boxShadow: focused ? `0 0 0 2px ${P2P_BRAND.surfaceBorder}` : 'none',
        transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
      }}
    />
  );
}

function PortalPriceInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (price: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <input
      type="number"
      min={0}
      step="0.01"
      value={value}
      onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Unit price"
      style={{
        width: '88px',
        height: '34px',
        padding: '0 10px',
        border: `1px solid ${focused ? P2P_BRAND.primary : hovered ? '#CBD5E1' : NEUTRAL.border}`,
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: F,
        color: '#0F172A',
        background: NEUTRAL.white,
        textAlign: 'right',
        boxSizing: 'border-box',
        outline: 'none',
        boxShadow: focused ? `0 0 0 2px ${P2P_BRAND.surfaceBorder}` : 'none',
        transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
      }}
    />
  );
}

function PortalScrollTable({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    left: false,
    right: false,
    hint: true,
    overflow: false,
  });

  const updateScrollState = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth > clientWidth + 2;
    setScrollState({
      overflow,
      left: overflow && scrollLeft > 6,
      right: overflow && scrollLeft < scrollWidth - clientWidth - 6,
      hint: overflow && scrollLeft < 12,
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = wrapRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  const wrapClass = [
    'portal-table-wrap',
    scrollState.overflow ? 'portal-table-wrap--overflow' : '',
    scrollState.left ? 'portal-table-wrap--scroll-left' : '',
    scrollState.right ? 'portal-table-wrap--scroll-right' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapClass}>
      {scrollState.overflow && scrollState.right && scrollState.hint && (
        <div className="portal-table-scroll-notice" aria-hidden>
          <ChevronRight size={13} strokeWidth={2.25} className="portal-table-scroll-notice__icon" />
          <span>Description stays visible · scroll for line details</span>
        </div>
      )}
      <div
        ref={wrapRef}
        className="portal-table-scroll portal-scroll"
        tabIndex={0}
        role="region"
        aria-label="Line items table. Description column stays visible; scroll horizontally for other fields."
        onScroll={updateScrollState}
      >
        {children}
      </div>
    </div>
  );
}

type PortalDocumentDetailViewProps = {
  doc: PortalDocument;
  vendorName: string;
  onUpdateLine: (docId: string, lineId: string, unitPrice: number) => void;
  onUpdatePartNumber?: (docId: string, lineId: string, partNumber: string) => void;
  historyOpen?: boolean;
  onHistoryToggle?: () => void;
};

export function PortalDocumentDetailView({
  doc,
  vendorName,
  onUpdateLine,
  onUpdatePartNumber,
  historyOpen = false,
  onHistoryToggle,
}: PortalDocumentDetailViewProps) {
  const sectionLabel = getPortalSectionLabel(doc.type);
  const totalQty = sumLineQty(doc.lineItems);
  const lineTotal = sumLineTotal(doc.lineItems);
  const priceEditable = doc.type === 'rfq';
  const showRfqColumns = doc.type === 'rfq';
  const statusSection = doc.type === 'rfq' || doc.type === 'po' ? doc.type : null;

  const columns = [
    { key: 'description', label: 'Description', align: 'left' as const },
    { key: 'deliveryLocation', label: 'Delivery location', align: 'left' as const },
    { key: 'shippingMethod', label: 'Shipping method', align: 'left' as const },
    { key: 'requiredBy', label: 'Required by', align: 'left' as const },
    { key: 'qty', label: 'Qty', align: 'right' as const },
    { key: 'unitPrice', label: 'Unit price', align: 'right' as const },
    ...(showRfqColumns
      ? [
          { key: 'partNumber', label: 'Part number', align: 'left' as const },
          { key: 'notes', label: 'Notes', align: 'center' as const },
        ]
      : []),
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
      <div
        style={{
          ...panelHeaderStyle,
          justifyContent: 'space-between',
          borderBottom: `1px solid ${NEUTRAL.border}`,
          background: NEUTRAL.white,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: NEUTRAL.text }}>{doc.documentNumber}</span>
            {statusSection && <StatusBadge section={statusSection} />}
          </div>
          <div style={{ fontSize: '11px', color: NEUTRAL.muted, marginTop: '3px' }}>
            {sectionLabel} · {doc.date}
          </div>
        </div>
        {onHistoryToggle && <HistoryToggleButton open={historyOpen} onToggle={onHistoryToggle} />}
      </div>

      <div className="portal-scroll" style={{ flex: 1, overflow: 'auto', padding: '16px 20px 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px 24px',
            marginBottom: '20px',
            padding: '14px 16px',
            background: NEUTRAL.surface,
            border: `1px solid ${NEUTRAL.borderLight}`,
            borderRadius: '8px',
          }}
        >
          <PortalMetaField label="Organization" value={doc.organization} />
          <PortalMetaField label="Contact" value={doc.contact || `${vendorName} vendor admin`} />
          <PortalMetaField label="Document date" value={doc.date} />
        </div>

        <PortalScrollTable>
          <table
            className="portal-line-items-table"
            style={{
              width: '100%',
              minWidth: showRfqColumns ? '980px' : '720px',
              fontSize: '12px',
            }}
          >
            <thead>
              <tr style={{ background: NEUTRAL.surface }}>
                {columns.map((col, index) => (
                  <th
                    key={col.key}
                    className={index === 0 ? 'portal-table-sticky-col portal-table-desc-cell' : undefined}
                    style={{
                      ...portalTableThStyle,
                      textAlign: col.align,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doc.lineItems.map((line) => (
                <PortalLineRow
                  key={line.id}
                  line={line}
                  editable={priceEditable}
                  showRfqColumns={showRfqColumns}
                  onPriceChange={(price) => onUpdateLine(doc.id, line.id, price)}
                  onPartNumberChange={
                    onUpdatePartNumber
                      ? (partNumber) => onUpdatePartNumber(doc.id, line.id, partNumber)
                      : undefined
                  }
                />
              ))}
              <tr className="portal-table-total-row" style={{ background: NEUTRAL.surface }}>
                <td
                  className="portal-table-sticky-col"
                  style={{
                    ...portalTableTdStyle,
                    fontWeight: 600,
                    borderTop: `1px solid ${NEUTRAL.border}`,
                    borderBottom: 'none',
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    ...portalTableTdStyle,
                    borderTop: `1px solid ${NEUTRAL.border}`,
                    borderBottom: 'none',
                  }}
                />
                <td
                  style={{
                    ...portalTableTdStyle,
                    borderTop: `1px solid ${NEUTRAL.border}`,
                    borderBottom: 'none',
                  }}
                />
                <td
                  style={{
                    ...portalTableTdStyle,
                    borderTop: `1px solid ${NEUTRAL.border}`,
                    borderBottom: 'none',
                  }}
                />
                <td
                  style={{
                    ...portalTableTdStyle,
                    textAlign: 'right',
                    fontWeight: 600,
                    borderTop: `1px solid ${NEUTRAL.border}`,
                    borderBottom: 'none',
                  }}
                >
                  {totalQty}
                </td>
                <td
                  style={{
                    ...portalTableTdStyle,
                    textAlign: 'right',
                    fontWeight: 600,
                    borderTop: `1px solid ${NEUTRAL.border}`,
                    borderBottom: 'none',
                    color: P2P_BRAND.primaryStrong,
                  }}
                >
                  {formatPortalCurrency(lineTotal)}
                </td>
                {showRfqColumns && (
                  <>
                    <td
                      style={{
                        ...portalTableTdStyle,
                        borderTop: `1px solid ${NEUTRAL.border}`,
                        borderBottom: 'none',
                      }}
                    />
                    <td
                      style={{
                        ...portalTableTdStyle,
                        borderTop: `1px solid ${NEUTRAL.border}`,
                        borderBottom: 'none',
                      }}
                    />
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </PortalScrollTable>
      </div>
    </div>
  );
}

function PortalLineRow({
  line,
  editable,
  showRfqColumns,
  onPriceChange,
  onPartNumberChange,
}: {
  line: PortalLineItem;
  editable: boolean;
  showRfqColumns: boolean;
  onPriceChange: (price: number) => void;
  onPartNumberChange?: (partNumber: string) => void;
}) {
  return (
    <tr>
      <td
        className="portal-table-sticky-col portal-table-desc-cell"
        style={portalTableTdStyle}
        title={line.description}
      >
        {line.description}
      </td>
      <td style={portalTableTdStyle}>{line.deliveryLocation}</td>
      <td style={portalTableTdStyle}>{line.shippingMethod}</td>
      <td style={portalTableTdStyle}>{line.requiredBy}</td>
      <td style={{ ...portalTableTdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{line.qty}</td>
      <td style={{ ...portalTableTdStyle, textAlign: 'right' }}>
        {editable ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <PortalPriceInput value={line.unitPrice} onChange={onPriceChange} />
          </div>
        ) : (
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatPortalCurrency(line.unitPrice)}</span>
        )}
      </td>
      {showRfqColumns && (
        <>
          <td style={{ ...portalTableTdStyle, minWidth: '100px' }}>
            {editable && onPartNumberChange ? (
              <PortalTextInput
                value={line.partNumber ?? ''}
                onChange={onPartNumberChange}
                ariaLabel={`Part number for ${line.description}`}
              />
            ) : (
              line.partNumber || '—'
            )}
          </td>
          <td style={{ ...portalTableTdStyle, textAlign: 'center', width: '56px' }}>
            <button
              type="button"
              aria-label={`Notes for ${line.description}`}
              style={portalNotesBtnStyle}
            >
              <MessageSquare size={15} color={NEUTRAL.faint} aria-hidden />
            </button>
          </td>
        </>
      )}
    </tr>
  );
}

type PortalQuoteActionBarProps = {
  lineTotal: number;
  saved: boolean;
  onSave: () => void;
};

export function PortalQuoteActionBar({ lineTotal, saved, onSave }: PortalQuoteActionBarProps) {
  return (
    <div style={quoteActionBarStyle}>
      <div>
        <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: NEUTRAL.faint }}>
          Quote total
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: NEUTRAL.text, marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
          ${formatPortalCurrency(lineTotal)}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {saved && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              color: P2P_BRAND.primaryStrong,
              fontWeight: 600,
            }}
          >
            <Check size={14} strokeWidth={2.5} aria-hidden />
            Quote saved
          </span>
        )}
        <button type="button" onClick={onSave} style={portalPrimaryBtnStyle}>
          Save Quote
        </button>
      </div>
    </div>
  );
}

export function PortalEmptyState({ section }: { section: PortalSection }) {
  const label = getPortalSectionLabel(section);
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        color: NEUTRAL.muted,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: NEUTRAL.surface,
          border: `1px solid ${NEUTRAL.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
        }}
      >
        <Search size={18} color={NEUTRAL.faint} aria-hidden />
      </div>
      <p style={{ fontSize: '14px', fontWeight: 600, color: NEUTRAL.text, margin: '0 0 4px' }}>
        No {label.toLowerCase()} records
      </p>
      <p style={{ fontSize: '13px', color: NEUTRAL.muted, margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
        Records will appear here when they are available for this vendor.
      </p>
    </div>
  );
}

const listPanelStyle: React.CSSProperties = {
  width: '260px',
  background: NEUTRAL.white,
  borderRight: `1px solid ${NEUTRAL.borderLight}`,
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
};

const filterLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: NEUTRAL.muted,
  marginBottom: '6px',
};

const filterSelectStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 10px',
  border: `1px solid ${NEUTRAL.border}`,
  borderRadius: '8px',
  fontSize: '13px',
  color: NEUTRAL.text,
  background: NEUTRAL.surface,
  marginBottom: '8px',
};

const aiInvoiceBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  width: '100%',
  padding: '8px 12px',
  border: 'none',
  borderRadius: '8px',
  background: P2P_BRAND.primary,
  color: NEUTRAL.white,
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  height: '36px',
  padding: '0 10px 0 32px',
  border: `1px solid ${NEUTRAL.border}`,
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: F,
  boxSizing: 'border-box',
  background: NEUTRAL.surface,
  color: '#0F172A',
  outline: 'none',
};

const nonPoBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px 20px',
  padding: '14px 20px',
  background: NON_PO_BANNER.bg,
  borderBottom: `1px solid ${NON_PO_BANNER.border}`,
  flexWrap: 'wrap',
  fontFamily: F,
};

const nonPoBannerMessageStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  flex: '1 1 240px',
  minWidth: 0,
};

const nonPoBannerIconWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'rgba(234, 88, 12, 0.12)',
  flexShrink: 0,
  marginTop: '1px',
};

const nonPoBannerTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: NON_PO_BANNER.title,
  lineHeight: 1.3,
  marginBottom: '2px',
};

const nonPoBannerBodyStyle: React.CSSProperties = {
  fontSize: '12px',
  color: NON_PO_BANNER.body,
  lineHeight: 1.45,
};

const nonPoBannerActionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flex: '0 1 420px',
  minWidth: 'min(100%, 280px)',
};

const nonPoBannerActionLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: NON_PO_BANNER.body,
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const poSelectStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  flex: '1 1 180px',
  minWidth: 0,
  height: '36px',
  padding: '0 12px',
  border: `1px solid ${NON_PO_BANNER.selectBorder}`,
  borderRadius: '8px',
  background: NEUTRAL.white,
  fontSize: '12px',
  color: NEUTRAL.muted,
  fontFamily: F,
  boxSizing: 'border-box',
  cursor: 'pointer',
  textAlign: 'left',
};

const nonPoBtnStyle: React.CSSProperties = {
  height: '36px',
  padding: '0 16px',
  border: 'none',
  borderRadius: '8px',
  background: NON_PO_BANNER.actionBg,
  color: NON_PO_BANNER.actionText,
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

const documentCardStyle: React.CSSProperties = {
  background: NEUTRAL.white,
  border: `1px solid ${NEUTRAL.border}`,
  borderRadius: '10px',
  padding: '20px',
};

const invoiceDocThStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 600,
  color: DOC.inkMuted,
  whiteSpace: 'nowrap',
  fontSize: '10px',
  letterSpacing: '0.02em',
  borderBottom: `1px solid ${DOC.rule}`,
};

const invoiceDocTdStyle: React.CSSProperties = {
  padding: '9px 10px',
  borderBottom: `1px solid ${DOC.rule}`,
  color: DOC.ink,
  verticalAlign: 'top',
};

const invoiceThStyle: React.CSSProperties = {
  padding: '9px 12px',
  textAlign: 'left',
  fontWeight: 600,
  color: NEUTRAL.muted,
  whiteSpace: 'nowrap',
  fontSize: '11px',
  letterSpacing: '0.03em',
  borderBottom: `1px solid ${NEUTRAL.border}`,
};

const invoiceTdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: `1px solid ${NEUTRAL.borderLight}`,
  color: NEUTRAL.text,
  verticalAlign: 'middle',
};

const extractedPanelStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  background: NEUTRAL.white,
  borderLeft: `1px solid ${NEUTRAL.borderLight}`,
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  overflow: 'hidden',
};

const fieldGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '12px',
  paddingBottom: '14px',
};

const sectionTitleBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '8px 0',
  fontFamily: F,
};

const extractedFooterStyle: React.CSSProperties = {
  padding: '12px 14px 14px',
  borderTop: `1px solid ${NEUTRAL.border}`,
  background: NEUTRAL.surface,
  flexShrink: 0,
};

const footerNoteStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '11px',
  color: NEUTRAL.muted,
  lineHeight: 1.5,
  fontFamily: F,
};

const footerWarningStyle: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: '11px',
  color: NEUTRAL.muted,
  lineHeight: 1.45,
  fontFamily: F,
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 14px',
  borderBottom: `1px solid ${NEUTRAL.border}`,
  fontSize: '13px',
  fontWeight: 600,
  color: NEUTRAL.text,
  flexShrink: 0,
  fontFamily: F,
};

const legendStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 14px',
  borderBottom: `1px solid ${NEUTRAL.borderLight}`,
  background: NEUTRAL.white,
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: NEUTRAL.muted,
};

const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  border: `1px solid ${NEUTRAL.border}`,
  borderRadius: '6px',
  background: NEUTRAL.white,
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
};

const historyEntryStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderBottom: `1px solid ${NEUTRAL.borderLight}`,
};

const portalTableThStyle: React.CSSProperties = {
  padding: '9px 12px',
  fontWeight: 600,
  color: NEUTRAL.muted,
  whiteSpace: 'nowrap',
  fontSize: '11px',
  letterSpacing: '0.02em',
  borderBottom: `1px solid ${NEUTRAL.border}`,
  fontFamily: F,
};

const portalTableTdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: `1px solid ${NEUTRAL.borderLight}`,
  color: NEUTRAL.text,
  verticalAlign: 'middle',
  fontFamily: F,
};

const quoteActionBarStyle: React.CSSProperties = {
  padding: '14px 20px',
  borderTop: `1px solid ${NEUTRAL.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  background: NEUTRAL.surface,
  flexShrink: 0,
};

const portalPrimaryBtnStyle: React.CSSProperties = {
  padding: '10px 18px',
  border: 'none',
  borderRadius: '8px',
  background: P2P_BRAND.primary,
  color: NEUTRAL.white,
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
  transition: 'background 0.12s ease',
};

const portalNotesBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  border: `1px solid ${NEUTRAL.border}`,
  borderRadius: '6px',
  background: NEUTRAL.white,
  cursor: 'pointer',
  padding: 0,
  flexShrink: 0,
};
