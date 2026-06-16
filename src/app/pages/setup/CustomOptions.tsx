import { useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import {
  CustomOptionsEditor,
  CustomOptionsStructureGuide,
  CustomOptionsSummary,
} from '../../components/setup/CustomOptionsEditor';
import {
  countSubTypes,
  createEmptyTransaction,
  createSeedCustomOptions,
  type CustomTransaction,
} from '../../data/customOptions';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

export function CustomOptions() {
  const [saved, setSaved] = useState<CustomTransaction[]>(() => createSeedCustomOptions());
  const [draft, setDraft] = useState<CustomTransaction[]>(() => createSeedCustomOptions());
  const [expandedTxnIds, setExpandedTxnIds] = useState<Set<string>>(
    () => new Set(['txn-expense', 'txn-spr']),
  );
  const [showSavedToast, setShowSavedToast] = useState(false);

  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);

  const toggleTxn = (id: string) => {
    setExpandedTxnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addTransaction = () => {
    const txn = createEmptyTransaction('Standard Purchase Request');
    setDraft((prev) => [...prev, txn]);
    setExpandedTxnIds((prev) => new Set([...prev, txn.id]));
  };

  const handleSave = () => {
    setSaved(draft);
    setShowSavedToast(true);
    window.setTimeout(() => setShowSavedToast(false), 2400);
  };

  const handleCancel = () => setDraft(saved);

  const totalSubTypes = countSubTypes(draft);

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
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Custom Options</li>
            </ol>
          </nav>

          <header
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '16px',
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
                Custom Options
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '62ch', lineHeight: 1.5 }}>
                Define custom types and sub-types for each transaction. Users pick from these options when creating
                records — no manual coding required.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {isDirty ? (
                <span
                  style={{
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
              <button
                type="button"
                onClick={addTransaction}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: P2P_BRAND.primary,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: F,
                  boxShadow: '0 1px 2px rgba(31, 169, 122, 0.28)',
                }}
              >
                <Plus size={16} strokeWidth={2.25} aria-hidden />
                Add transaction
              </button>
            </div>
          </header>

          <CustomOptionsStructureGuide />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
            <section>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  <strong style={{ color: '#334155' }}>{draft.length}</strong> transactions ·{' '}
                  <strong style={{ color: '#334155' }}>{totalSubTypes}</strong> sub-types total
                </p>
              </div>

              <CustomOptionsEditor
                transactions={draft}
                onChange={setDraft}
                expandedTxnIds={expandedTxnIds}
                onToggleTxn={toggleTxn}
              />
            </section>

            <CustomOptionsSummary transactions={draft} />
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '16px 20px',
              borderTop: '1px solid #E4E7EC',
              background: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
              {showSavedToast ? (
                <span style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Custom options saved.</span>
              ) : (
                'Expand a transaction card to edit its types and sub-types.'
              )}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={!isDirty}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #E4E7EC',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  color: isDirty ? '#475569' : '#94A3B8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDirty ? 'pointer' : 'not-allowed',
                  fontFamily: F,
                }}
              >
                Cancel
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
          </div>
        </main>
      </div>
    </div>
  );
}
