import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ModuleNavIcon } from '../../components/ModuleNavIcon';
import {
  InvoiceDocumentView,
  InvoiceExtractedFieldsPanel,
  InvoiceHistoryDrawer,
  InvoiceListPanel,
  PortalEmptyState,
  PortalQuoteActionBar,
  DEFAULT_EXTRACTED_PANEL_WIDTH,
} from '../../components/vendor/InvoicePortalPanels';
import {
  PortalContextualDrawer,
  PortalWorkspaceDetailView,
  PortalWorkspaceEmpty,
  PortalWorkspaceListPanel,
} from '../../components/vendor/PortalDocumentWorkspace';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../../components/ui/resizable';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { createSeedVendors } from '../../data/vendorSetup';
import {
  clonePortalDocument,
  createVendorPortalDocuments,
  getPortalDocumentsForSection,
  sumLineTotal,
  type PortalDocument,
  type PortalLineItem,
  type PortalSection,
} from '../../data/vendorPortal';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

const SECTION_META: Record<
  PortalSection,
  { label: string; short: string; colorStart: string; colorEnd: string }
> = {
  rfq: { label: 'RFQ', short: 'RFQ', colorStart: '#E8C86A', colorEnd: '#C9A227' },
  po: { label: 'PO', short: 'PO', colorStart: '#5EC9A8', colorEnd: '#1FA97A' },
  invoice: { label: 'Invoice', short: 'INV', colorStart: '#F472B6', colorEnd: '#E11D8D' },
};

export function VendorPortal() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const vendor = useMemo(
    () => createSeedVendors().find((item) => item.id === vendorId) ?? null,
    [vendorId],
  );

  const [section, setSection] = useState<PortalSection>('po');
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<PortalDocument[]>(() =>
    vendorId ? createVendorPortalDocuments(vendorId, vendor?.name ?? 'Vendor') : [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);
  const [aiInvoiceNotice, setAiInvoiceNotice] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'closed' | 'history'>('closed');
  const [historyOpen, setHistoryOpen] = useState(false);

  const isInvoiceSection = section === 'invoice';

  const sectionDocs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return getPortalDocumentsForSection(documents, section).filter((doc) => {
      if (!query) return true;
      return (
        doc.documentNumber.toLowerCase().includes(query) ||
        doc.contact.toLowerCase().includes(query) ||
        doc.organization.toLowerCase().includes(query)
      );
    });
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
    setHistoryOpen(false);
    setDrawerMode('closed');
  };

  const handleDocumentSelect = (id: string) => {
    setSelectedId(id);
    setSavedMessage(false);
    setHistoryOpen(false);
    setDrawerMode('closed');
  };

  const openHistoryDrawer = () => {
    setDrawerMode((prev) => (prev === 'history' ? 'closed' : 'history'));
  };

  const closeContextualDrawer = () => {
    setDrawerMode('closed');
  };

  const updateExtractedField = (docId: string, fieldId: string, value: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId || !doc.invoiceMeta) return doc;
        return {
          ...doc,
          invoiceMeta: {
            ...doc.invoiceMeta,
            fieldSections: doc.invoiceMeta.fieldSections.map((fieldSection) => ({
              ...fieldSection,
              fields: fieldSection.fields.map((field) =>
                field.id === fieldId ? { ...field, value } : field,
              ),
            })),
          },
        };
      }),
    );
  };

  const updateLineItem = (docId: string, lineId: string, patch: Partial<PortalLineItem>) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        return {
          ...doc,
          lineItems: doc.lineItems.map((line) => (line.id === lineId ? { ...line, ...patch } : line)),
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
    <AppShell>
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
            position: 'relative',
            background: '#FFFFFF',
            borderTop: '1px solid #E4E7EC',
            overflow: 'hidden',
          }}
        >
          {isInvoiceSection ? (
            <>
              <InvoiceListPanel
                documents={sectionDocs}
                activeDocId={activeDoc?.id ?? null}
                search={search}
                onSearchChange={setSearch}
                onSelect={handleDocumentSelect}
                onAiInvoice={() => setAiInvoiceNotice(true)}
              />

              {activeDoc ? (
                <ResizablePanelGroup
                  direction="horizontal"
                  style={{ flex: 1, minWidth: 0, height: '100%' }}
                >
                  <ResizablePanel defaultSize={58} minSize={38} style={{ minWidth: 0, display: 'flex' }}>
                    <main
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        width: '100%',
                        background: '#FFFFFF',
                      }}
                    >
                      <InvoiceDocumentView doc={activeDoc} vendorName={vendor.name} />
                    </main>
                  </ResizablePanel>

                  <ResizableHandle
                    withHandle
                    style={{ width: '1px', background: '#E4E7EC', flexShrink: 0 }}
                  />

                  <ResizablePanel
                    defaultSize={42}
                    minSize={30}
                    maxSize={55}
                    style={{ minWidth: DEFAULT_EXTRACTED_PANEL_WIDTH * 0.65, display: 'flex' }}
                  >
                    <InvoiceExtractedFieldsPanel
                      key={activeDoc.id}
                      doc={activeDoc}
                      onFieldChange={(fieldId, value) =>
                        updateExtractedField(activeDoc.id, fieldId, value)
                      }
                      historyOpen={historyOpen}
                      onHistoryToggle={() => setHistoryOpen((prev) => !prev)}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                <PortalEmptyState section="invoice" />
              )}

              <InvoiceHistoryDrawer
                history={activeDoc?.history ?? []}
                open={historyOpen}
                onToggle={() => setHistoryOpen((prev) => !prev)}
              />
            </>
          ) : (
            <>
              <PortalWorkspaceListPanel
                section={section}
                documents={sectionDocs}
                activeDocId={activeDoc?.id ?? null}
                search={search}
                onSearchChange={setSearch}
                onSelect={handleDocumentSelect}
              />

              <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#FFFFFF' }}>
                {activeDoc ? (
                  <>
                    <PortalWorkspaceDetailView
                      doc={activeDoc}
                      vendorName={vendor.name}
                      drawerMode={drawerMode}
                      onOpenHistory={openHistoryDrawer}
                      onUpdateLine={(lineId, patch) => updateLineItem(activeDoc.id, lineId, patch)}
                    />
                    {activeDoc.type === 'rfq' && (
                      <PortalQuoteActionBar
                        lineTotal={sumLineTotal(activeDoc.lineItems)}
                        saved={savedMessage}
                        onSave={handleSaveQuote}
                      />
                    )}
                  </>
                ) : (
                  <PortalWorkspaceEmpty section={section} />
                )}
              </main>

              {drawerMode === 'history' && activeDoc && (
                <PortalContextualDrawer
                  doc={activeDoc}
                  onClose={closeContextualDrawer}
                />
              )}
            </>
          )}
        </section>

        {aiInvoiceNotice && (
          <div
            role="status"
            style={{
              position: 'fixed',
              top: '72px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 16px',
              background: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(16,24,40,0.12)',
              fontSize: '13px',
              color: '#334155',
              zIndex: 50,
              fontFamily: F,
            }}
          >
            AI invoice capture will open when the integration is connected.
            <button
              type="button"
              onClick={() => setAiInvoiceNotice(false)}
              style={{
                marginLeft: '12px',
                border: 'none',
                background: 'none',
                color: P2P_BRAND.primary,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: F,
                fontSize: '13px',
              }}
            >
              Dismiss
            </button>
          </div>
        )}
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
        borderRadius: '0',
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
                background: 'transparent',
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
              <ModuleNavIcon
                label={meta.short}
                colorStart={meta.colorStart}
                colorEnd={meta.colorEnd}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#FFFFFF',
        fontFamily: F,
        overflow: 'hidden',
      }}
    >
      <SkipToMainContent />

      <TopHeader />

      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          overflow: 'hidden',
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </main>
    </div>
  );
}

const primaryBtn: CSSProperties = {
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
