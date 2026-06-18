import { CheckCircle2, Circle } from 'lucide-react';
import { PO_TEMPLATE_MAPPINGS } from '../../data/poTemplate';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

export function MappingSummaryPanel() {
  return (
    <section
      style={{
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        padding: '20px',
        fontFamily: F,
      }}
    >
      <h2 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>Mapping summary</h2>
      <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748B', lineHeight: 1.45 }}>
        Purchase order data will be placed into these areas of your uploaded document.
      </p>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {PO_TEMPLATE_MAPPINGS.map((item) => (
          <li
            key={item.id}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              padding: '12px 14px',
              background: item.mapped ? P2P_BRAND.surface : '#F8FAFC',
              border: `1px solid ${item.mapped ? P2P_BRAND.surfaceBorder : '#E4E7EC'}`,
              borderRadius: '10px',
            }}
          >
            {item.mapped ? (
              <CheckCircle2 size={18} color={P2P_BRAND.primary} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
            ) : (
              <Circle size={18} color="#CBD5E1" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
            )}
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{item.label}</p>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p
        style={{
          margin: '16px 0 0',
          fontSize: '12px',
          color: '#94A3B8',
          lineHeight: 1.45,
          padding: '10px 12px',
          background: '#F8FAFC',
          borderRadius: '8px',
        }}
      >
        Your uploaded layout is preserved. Only the labeled areas receive live purchase order information when a PO is
        generated.
      </p>
    </section>
  );
}
