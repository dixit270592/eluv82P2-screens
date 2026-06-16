import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Download, FileText, Mail, RefreshCw } from 'lucide-react';
import { PoDocumentPreview } from '../../components/po-template/PoDocumentPreview';
import {
  SetupShell,
  StickyActionBar,
  ghostButtonStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from '../../components/po-template/SetupShell';
import {
  createSampleGeneratePoDetails,
  formatCurrency,
  lineItemsTotal,
  loadPoTemplateDraft,
} from '../../data/poTemplate';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

export function GeneratePurchaseOrder() {
  const navigate = useNavigate();
  const template = loadPoTemplateDraft();
  const [details] = useState(createSampleGeneratePoDetails);
  const [generated, setGenerated] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const subtotal = lineItemsTotal(details.lineItems);
  const hasTemplate = Boolean(template.fileName);

  const runAction = (label: string) => {
    setGenerated(true);
    setStatus(label);
    window.setTimeout(() => setStatus(null), 2800);
  };

  return (
    <SetupShell
      breadcrumbs={[
        { label: 'Procurement' },
        { label: 'Generate Purchase Order', active: true },
      ]}
      title="Generate Purchase Order"
      description="Choose your template, confirm order details, and produce a purchase order that matches your company document."
      footer={
        <StickyActionBar>
          <button
            type="button"
            disabled={!hasTemplate}
            onClick={() => runAction('PDF generated')}
            style={primaryButtonStyle(hasTemplate)}
          >
            Generate PDF
          </button>
          <button
            type="button"
            disabled={!generated}
            onClick={() => runAction('Download started')}
            style={secondaryButtonStyle()}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} aria-hidden />
              Download
            </span>
          </button>
          <button
            type="button"
            disabled={!generated}
            onClick={() => runAction('Sent to vendor')}
            style={ghostButtonStyle()}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} aria-hidden />
              Send to vendor
            </span>
          </button>
        </StickyActionBar>
      }
    >
      {status ? (
        <div
          role="status"
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            background: P2P_BRAND.surface,
            border: `1px solid ${P2P_BRAND.surfaceBorder}`,
            borderRadius: '8px',
            fontSize: '13px',
            color: P2P_BRAND.primaryStrong,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={16} aria-hidden />
          {status}
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '12px',
            padding: '20px 22px',
          }}
        >
          <h2 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Selected template</h2>
          {hasTemplate ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: P2P_BRAND.surface,
                    border: `1px solid ${P2P_BRAND.surfaceBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={20} color={P2P_BRAND.primary} aria-hidden />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                    {template.templateName || template.fileName}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>{template.fileName}</p>
                </div>
                {template.isDefault ? (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: P2P_BRAND.primaryStrong,
                      background: P2P_BRAND.surface,
                      border: `1px solid ${P2P_BRAND.surfaceBorder}`,
                      borderRadius: '999px',
                      padding: '3px 8px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Default
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => navigate('/setup/po-template')}
                style={{ ...ghostButtonStyle(), display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} aria-hidden />
                Change template
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: '16px',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '10px',
              }}
            >
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#92400E' }}>
                No template uploaded yet. Upload your company PO document before generating.
              </p>
              <button type="button" onClick={() => navigate('/setup/po-template')} style={secondaryButtonStyle()}>
                Upload template
              </button>
            </div>
          )}
        </section>

        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '12px',
            padding: '20px 22px',
          }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
            Purchase order details
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              { label: 'PO number', value: details.poNumber },
              { label: 'Vendor', value: details.vendorName },
              { label: 'Order date', value: details.orderDate },
              { label: 'Requested by', value: details.requestedBy },
              { label: 'Ship to', value: details.shipTo, wide: true },
            ].map((field) => (
              <div key={field.label} className={field.wide ? 'md:col-span-2 xl:col-span-3' : undefined}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                  {field.label}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.45 }}>{field.value}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '18px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: F }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E4E7EC', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Unit price</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {details.lineItems.map((item) => (
                  <tr key={item.description} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px', color: '#334155' }}>{item.description}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#64748B' }}>{item.qty}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#64748B' }}>
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 500 }}>
                      {formatCurrency(item.qty * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ margin: '12px 0 0', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
              Total {formatCurrency(subtotal * 1.0825)}
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
            Preview generated PO
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748B' }}>
            This is how your purchase order will appear using your uploaded document layout.
          </p>
          <PoDocumentPreview
            mode={generated || hasTemplate ? 'generated' : 'template'}
            details={details}
            templateName={template.templateName}
          />
        </section>
      </div>
    </SetupShell>
  );
}
