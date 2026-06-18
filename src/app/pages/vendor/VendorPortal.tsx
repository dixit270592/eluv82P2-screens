import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { createSeedVendors } from '../../data/vendorSetup';
import {
  clonePortalDocument,
  createVendorPortalDocuments,
  formatPortalCurrency,
  getPortalDocumentsForSection,
  getPortalSectionLabel,
  sumLineQty,
  sumLineTotal,
  type PortalDocument,
  type PortalLineItem,
  type PortalSection,
} from '../../data/vendorPortal';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

const SECTION_META: Record<
  PortalSection,
  { label: string; short: string; bg: string }
> = {
  rfq: { label: 'RFQ', short: 'Rfq', bg: '#C9A227' },
  po: { label: 'PO', short: 'Po', bg: P2P_BRAND.primary },
  invoice: { label: 'Invoice', short: 'Inv', bg: '#E11D8D' },
};

export function VendorPortal() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const vendor = useMemo(
    () => createSeedVendors().find((item) => item.id === vendorId) ?? null,
    [vendorId],
  );

  const [section, setSection] = useState<PortalSection>('rfq');
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<PortalDocument[]>(() =>
    vendorId ? createVendorPortalDocuments(vendorId, vendor?.name ?? 'Vendor') : [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const sectionDocs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = getPortalDocumentsForSection(documents, section).filter((doc) => {
      if (!query) return true;
      return (
        doc.documentNumber.toLowerCase().includes(query) ||
        doc.contact.toLowerCase().includes(query)
      );
    });
    return filtered;
  }, [documents, section, search]);

  const activeDoc = useMemo(() => {
    const fallback = sectionDocs[0] ?? null;
    if (!selectedId) return fallback;
    return sectionDocs.find((doc) => doc.id === selectedId) ?? fallback;
  }, [sectionDocs, selectedId]);

  const handleSectionChange = (next: PortalSection) => {
    setSection(next);
    setSelectedId(null);
    setSearch('');
    setSavedMessage(false);
  };

  const updateLineItem = (docId: string, lineId: string, unitPrice: number) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          lineItems: doc.lineItems.map((line) =>
            line.id === lineId ? { ...line, unitPrice } : line,
          ),
        };
      }),
    );
    setSavedMessage(false);
  };

  const handleSaveQuote = () => {
    if (!activeDoc || activeDoc.type !== 'rfq') return;
    setSavedMessage(true);
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== activeDoc.id) return doc;
        const updated = clonePortalDocument(doc);
        updated.history = [
          {
            id: `h-${crypto.randomUUID()}`,
            actor: vendor?.name ?? 'Vendor',
            action: `submitted quote for ${doc.documentNumber}`,
            timestamp: new Date().toLocaleString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
          },
          ...updated.history,
        ];
        return updated;
      }),
    );
  };

  if (!vendor) {
    return (
      <AppShell>
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: 0 }}>Vendor not found</p>
          <button
            type="button"
            onClick={() => navigate('/setup/vendor')}
            style={{ marginTop: '16px', ...primaryBtn }}
          >
            Back to vendor setup
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      vendorName={vendor.name}
      vendorCode={vendor.vendorCode}
      onBack={() => navigate('/setup/vendor')}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <VendorPortalSidebar section={section} onSectionChange={handleSectionChange} />

        <section
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            background: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderLeft: 'none',
            borderRadius: '0 12px 12px 0',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
          }}
        >
        <aside
          style={{
            width: '260px',
            background: '#FFFFFF',
            borderRight: '1px solid #EEF1F5',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          <div style={{ padding: '12px', borderBottom: '1px solid #E4E7EC' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
              Filter Elements
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                border: '1px solid #E4E7EC',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#334155',
                background: '#FAFBFC',
              }}
            >
              All
              <ChevronDown size={14} color="#94A3B8" aria-hidden />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderBottom: '1px solid #E4E7EC',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            {getPortalSectionLabel(section)}
            <ChevronDown size={14} color="#94A3B8" aria-hidden />
          </div>

          <div style={{ padding: '10px 12px', borderBottom: '1px solid #E4E7EC' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                color="#94A3B8"
                style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search here"
                style={{
                  width: '100%',
                  padding: '8px 8px 8px 28px',
                  border: '1px solid #E4E7EC',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: F,
                  boxSizing: 'border-box',
                  background: '#F8FAFC',
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sectionDocs.length === 0 ? (
              <p style={{ padding: '16px 12px', fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                No {getPortalSectionLabel(section)} records found.
              </p>
            ) : (
              sectionDocs.map((doc) => {
                const selected = activeDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(doc.id);
                      setSavedMessage(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px',
                      border: 'none',
                      borderBottom: '1px solid #EEF1F5',
                      background: selected ? P2P_BRAND.surface : '#FFFFFF',
                      cursor: 'pointer',
                      fontFamily: F,
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: P2P_BRAND.primaryStrong }}>
                      {doc.documentNumber}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      {doc.listTimestamp}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#FFFFFF' }}>
          {activeDoc ? (
            <>
              <DocumentDetail
                doc={activeDoc}
                vendorName={vendor.name}
                onUpdateLine={updateLineItem}
              />
              {activeDoc.type === 'rfq' && (
                <div
                  style={{
                    padding: '12px 20px',
                    borderTop: '1px solid #E4E7EC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    background: '#FAFBFC',
                  }}
                >
                  {savedMessage && (
                    <span style={{ fontSize: '12px', color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>
                      Quote saved successfully
                    </span>
                  )}
                  <button type="button" onClick={handleSaveQuote} style={primaryBtn}>
                    Save Quote
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '48px 24px', color: '#64748B', fontSize: '14px' }}>
              Select a document from the list to view details.
            </div>
          )}
        </main>

        <aside
          style={{
            width: '240px',
            background: '#FAFBFC',
            borderLeft: '1px solid #EEF1F5',
            flexShrink: 0,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid #E4E7EC',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
            }}
          >
            History
          </div>
          {activeDoc ? (
            <div style={{ padding: '8px 0' }}>
              {activeDoc.history.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #F1F5F9',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: '#475569',
                  }}
                >
                  <strong style={{ color: '#334155' }}>{entry.actor}:</strong> {entry.action}
                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#94A3B8' }}>
                    {entry.timestamp}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ padding: '14px', fontSize: '12px', color: '#94A3B8', margin: 0 }}>No history yet.</p>
          )}
        </aside>
        </section>
      </div>
    </AppShell>
  );
}

function VendorPortalSidebar({
  section,
  onSectionChange,
}: {
  section: PortalSection;
  onSectionChange: (section: PortalSection) => void;
}) {
  return (
    <nav
      aria-label="Vendor portal sections"
      style={{
        width: '52px',
        background: '#1E2D3D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        paddingTop: '14px',
        paddingBottom: '14px',
        borderRadius: '12px 0 0 12px',
        border: '1px solid #1E2D3D',
        borderRight: 'none',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
        {(Object.keys(SECTION_META) as PortalSection[]).map((key) => {
          const meta = SECTION_META[key];
          const active = section === key;
          return (
            <button
              key={key}
              type="button"
              title={meta.label}
              aria-label={meta.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => onSectionChange(key)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: meta.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: active ? '0 0 0 2.5px rgba(255,255,255,0.35)' : 'none',
                transition: 'box-shadow 0.18s, transform 0.15s',
                border: 'none',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span
                style={{
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: F,
                  userSelect: 'none',
                }}
              >
                {meta.short}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function AppShell({
  children,
  vendorName,
  vendorCode,
  onBack,
}: {
  children: React.ReactNode;
  vendorName?: string;
  vendorCode?: string;
  onBack?: () => void;
}) {
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
            overflow: 'hidden',
            padding: '24px 28px 32px',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <nav aria-label="Breadcrumb" style={{ marginBottom: '16px', flexShrink: 0 }}>
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
              <li>Accounting Setup</li>
              <li aria-hidden>
                <ChevronRight size={14} color="#CBD5E1" />
              </li>
              <li>Vendor Setup</li>
              {vendorName && (
                <>
                  <li aria-hidden>
                    <ChevronRight size={14} color="#CBD5E1" />
                  </li>
                  <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>
                    {vendorName} portal
                  </li>
                </>
              )}
            </ol>
          </nav>

          {vendorName && onBack && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '20px',
                flexShrink: 0,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <button type="button" onClick={onBack} style={backBtnStyle}>
                  <ArrowLeft size={16} aria-hidden />
                  Back to vendors
                </button>
                <h1
                  style={{
                    margin: '12px 0 0',
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Vendor Portal
                </h1>
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B' }}>
                  {vendorName}
                  {vendorCode ? ` · ${vendorCode}` : ''}
                </p>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}

function DocumentDetail({
  doc,
  vendorName,
  onUpdateLine,
}: {
  doc: PortalDocument;
  vendorName: string;
  onUpdateLine: (docId: string, lineId: string, unitPrice: number) => void;
}) {
  const sectionLabel = getPortalSectionLabel(doc.type);
  const totalQty = sumLineQty(doc.lineItems);
  const lineTotal = sumLineTotal(doc.lineItems);
  const priceEditable = doc.type === 'rfq';

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.7 }}>
          <div>
            <strong>Organization:</strong> {doc.organization}
          </div>
          <div>
            <strong>Contact:</strong> {doc.contact || `${vendorName} vendor admin`}
          </div>
          <div>
            <strong>Date:</strong> {doc.date}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1E293B', letterSpacing: '-0.02em' }}>
            {sectionLabel}
          </div>
          <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>#{doc.documentNumber}</div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #E4E7EC', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {[
                'DESCRIPTION',
                'DELIVERY LOCATION',
                'SHIPPING METHOD',
                'REQUIRED BY',
                'QTY',
                'UNIT PRICE',
              ].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    borderBottom: '1px solid #E4E7EC',
                    fontWeight: 600,
                    color: '#475569',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doc.lineItems.map((line) => (
              <LineRow
                key={line.id}
                line={line}
                editable={priceEditable}
                onPriceChange={(price) => onUpdateLine(doc.id, line.id, price)}
              />
            ))}
            <tr style={{ background: '#FAFBFC', fontWeight: 600 }}>
              <td colSpan={4} style={{ padding: '10px 12px', borderTop: '1px solid #E4E7EC' }}>
                Total
              </td>
              <td style={{ padding: '10px 12px', borderTop: '1px solid #E4E7EC' }}>{totalQty}</td>
              <td style={{ padding: '10px 12px', borderTop: '1px solid #E4E7EC' }}>
                {formatPortalCurrency(lineTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LineRow({
  line,
  editable,
  onPriceChange,
}: {
  line: PortalLineItem;
  editable: boolean;
  onPriceChange: (price: number) => void;
}) {
  return (
    <tr>
      <td style={cellStyle}>{line.description}</td>
      <td style={cellStyle}>{line.deliveryLocation}</td>
      <td style={cellStyle}>{line.shippingMethod}</td>
      <td style={cellStyle}>{line.requiredBy}</td>
      <td style={cellStyle}>{line.qty}</td>
      <td style={cellStyle}>
        {editable ? (
          <input
            type="number"
            min={0}
            step="0.01"
            value={line.unitPrice}
            onChange={(e) => onPriceChange(Number.parseFloat(e.target.value) || 0)}
            style={{
              width: '80px',
              padding: '6px 8px',
              border: '1px solid #E4E7EC',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: F,
            }}
          />
        ) : (
          formatPortalCurrency(line.unitPrice)
        )}
      </td>
    </tr>
  );
}

const cellStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #EEF1F5',
  color: '#334155',
  verticalAlign: 'middle',
};

const primaryBtn: React.CSSProperties = {
  padding: '10px 18px',
  border: 'none',
  borderRadius: '8px',
  background: P2P_BRAND.primary,
  color: '#FFFFFF',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};

const backBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  background: '#FFFFFF',
  color: '#334155',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};
