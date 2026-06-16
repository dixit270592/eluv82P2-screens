import {
  createSampleGeneratePoDetails,
  formatCurrency,
  lineItemsTotal,
  type GeneratePoDetails,
} from '../../data/poTemplate';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type PoDocumentPreviewProps = {
  mode?: 'template' | 'generated';
  details?: GeneratePoDetails;
  templateName?: string;
  compact?: boolean;
};

export function PoDocumentPreview({
  mode = 'template',
  details,
  templateName,
  compact = false,
}: PoDocumentPreviewProps) {
  const data = details ?? createSampleGeneratePoDetails();
  const subtotal = lineItemsTotal(data.lineItems);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;
  const isGenerated = mode === 'generated';

  return (
    <div
      style={{
        background: '#E8ECF1',
        borderRadius: compact ? '8px' : '10px',
        padding: compact ? '16px' : '24px',
        minHeight: compact ? '360px' : '480px',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: F,
      }}
    >
      <article
        aria-label="Purchase order document preview"
        style={{
          width: '100%',
          maxWidth: compact ? '100%' : '640px',
          background: '#FFFFFF',
          border: '1px solid #DDE3EA',
          borderRadius: '4px',
          boxShadow: '0 8px 28px rgba(16, 24, 40, 0.1)',
          padding: compact ? '20px 22px' : '28px 32px',
          color: '#1E293B',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            paddingBottom: '18px',
            borderBottom: '2px solid #0F172A',
            marginBottom: '20px',
          }}
        >
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${P2P_BRAND.primary}, ${P2P_BRAND.primaryStrong})`,
                marginBottom: '10px',
              }}
              aria-hidden
            />
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Your Company Name
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
              1200 Main Street · Dallas, TX 75201
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#0F172A',
              }}
            >
              PURCHASE ORDER
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#475569' }}>
              <span style={{ color: '#94A3B8' }}>No.</span>{' '}
              <strong style={{ color: isGenerated ? '#0F172A' : P2P_BRAND.primaryStrong }}>
                {isGenerated ? data.poNumber : '{{ PO Number }}'}
              </strong>
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>
              <span style={{ color: '#94A3B8' }}>Date</span> {isGenerated ? data.orderDate : '{{ Date }}'}
            </p>
          </div>
        </header>

        {!compact && templateName ? (
          <p
            style={{
              margin: '0 0 16px',
              fontSize: '11px',
              color: P2P_BRAND.primaryStrong,
              background: P2P_BRAND.surface,
              border: `1px solid ${P2P_BRAND.surfaceBorder}`,
              borderRadius: '6px',
              padding: '6px 10px',
              display: 'inline-block',
            }}
          >
            Template: {templateName}
          </p>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '22px',
          }}
        >
          <section>
            <p
              style={{
                margin: '0 0 6px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Vendor
            </p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
              {isGenerated ? data.vendorName : '{{ Vendor Name }}'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748B', lineHeight: 1.45 }}>
              {isGenerated ? data.vendorAddress : '{{ Vendor Address }}'}
            </p>
          </section>
          <section>
            <p
              style={{
                margin: '0 0 6px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Ship to
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748B', lineHeight: 1.45 }}>
              {isGenerated ? data.shipTo : '{{ Ship To Address }}'}
            </p>
          </section>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Description', 'Qty', 'Unit price', 'Amount'].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '8px 10px',
                    textAlign: col === 'Description' ? 'left' : 'right',
                    fontWeight: 600,
                    color: '#64748B',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(isGenerated ? data.lineItems : [{ description: '{{ Line items }}', qty: 0, unitPrice: 0 }]).map(
              (item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '9px 10px', color: '#334155' }}>{item.description}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', color: '#64748B' }}>
                    {isGenerated ? item.qty : '—'}
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', color: '#64748B' }}>
                    {isGenerated ? formatCurrency(item.unitPrice) : '—'}
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 500 }}>
                    {isGenerated ? formatCurrency(item.qty * item.unitPrice) : '—'}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{ width: '180px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
              <span>Subtotal</span>
              <span>{isGenerated ? formatCurrency(subtotal) : '{{ Subtotal }}'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748B' }}>
              <span>Tax</span>
              <span>{isGenerated ? formatCurrency(tax) : '{{ Tax }}'}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0 0',
                marginTop: '4px',
                borderTop: '1px solid #E2E8F0',
                fontWeight: 700,
                fontSize: '12px',
                color: '#0F172A',
              }}
            >
              <span>Total</span>
              <span>{isGenerated ? formatCurrency(total) : '{{ Total }}'}</span>
            </div>
          </div>
        </div>

        <footer
          style={{
            paddingTop: '16px',
            borderTop: '1px dashed #CBD5E1',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}
        >
          {['Authorized by', 'Approved by'].map((label) => (
            <div key={label}>
              <p style={{ margin: '0 0 28px', fontSize: '10px', fontWeight: 600, color: '#94A3B8' }}>{label}</p>
              <div style={{ borderBottom: '1px solid #CBD5E1' }} />
              <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#CBD5E1' }}>
                {isGenerated ? '' : '{{ Signature }}'}
              </p>
            </div>
          ))}
        </footer>
      </article>
    </div>
  );
}
