import { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { BudgetListPanel } from '../../components/setup/BudgetListPanel';
import { BudgetConfigPanel } from '../../components/setup/BudgetConfigPanel';
import { SetupHelpIcon } from '../../components/setup/SetupHelpIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  cloneBudget,
  createEmptyBudget,
  createSeedBudgets,
  type BudgetConfiguration,
} from '../../data/budgetSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type ViewMode = 'list' | 'detail';

export function BudgetSetup() {
  const [budgets, setBudgets] = useState<BudgetConfiguration[]>(() => createSeedBudgets());
  const [view, setView] = useState<ViewMode>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BudgetConfiguration | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [listSearch, setListSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const activeBudgetName = useMemo(() => {
    if (!draft) return '';
    return draft.name.trim() || 'Untitled budget';
  }, [draft]);

  const openBudget = (id: string) => {
    const budget = budgets.find((item) => item.id === id);
    if (!budget) return;
    setSelectedId(id);
    setDraft(cloneBudget(budget));
    setIsNew(false);
    setSavedMessage(false);
    setView('detail');
  };

  const handleCreate = () => {
    const empty = createEmptyBudget();
    setSelectedId(empty.id);
    setDraft(empty);
    setIsNew(true);
    setSavedMessage(false);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setDraft(null);
    setSelectedId(null);
    setIsNew(false);
    setSavedMessage(false);
  };

  const handleSave = () => {
    if (!draft) return;
    const saved = cloneBudget({ ...draft, name: draft.name.trim() || 'Untitled budget' });
    setBudgets((prev) => {
      const exists = prev.some((budget) => budget.id === saved.id);
      if (exists) return prev.map((budget) => (budget.id === saved.id ? saved : budget));
      return [...prev, saved];
    });
    setDraft(saved);
    setSelectedId(saved.id);
    setIsNew(false);
    setSavedMessage(true);
    window.setTimeout(() => setSavedMessage(false), 2400);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const wasViewingDeleted = view === 'detail' && selectedId === deleteId;
    setBudgets((prev) => prev.filter((budget) => budget.id !== deleteId));
    if (wasViewingDeleted) {
      setView('list');
      setDraft(null);
      setSelectedId(null);
      setIsNew(false);
    }
    setDeleteId(null);
  };

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
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '24px 28px 28px',
            minWidth: 0,
            gap: '16px',
          }}
        >
          <nav aria-label="Breadcrumb" style={{ flexShrink: 0 }}>
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
              {view === 'list' ? (
                <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Budget Setup</li>
              ) : (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={handleBack}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        fontSize: '12px',
                        color: '#64748B',
                        cursor: 'pointer',
                        fontFamily: F,
                      }}
                    >
                      Budget Setup
                    </button>
                  </li>
                  <li aria-hidden>
                    <ChevronRight size={14} color="#CBD5E1" />
                  </li>
                  <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>{activeBudgetName}</li>
                </>
              )}
            </ol>
          </nav>

          <header style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                {view === 'list' ? 'Budget Setup' : activeBudgetName}
              </h1>
              <SetupHelpIcon
                label={
                  view === 'list'
                    ? 'Browse all budgets in list view. Open a budget to configure GL and project account amounts.'
                    : 'Configure the fiscal period and monthly amounts for this budget on the GL Account or Project Account tab.'
                }
              />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
              {view === 'list'
                ? 'View and manage all fiscal budgets. Select a budget to open its configuration.'
                : isNew
                  ? 'Set up a new budget period and add account allocations below.'
                  : 'Modify budget settings and monthly allocations for GL and project accounts.'}
            </p>
          </header>

          <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
            {view === 'list' ? (
              <BudgetListPanel
                budgets={budgets}
                search={listSearch}
                onSearchChange={setListSearch}
                onSelect={openBudget}
                onCreate={handleCreate}
                onDelete={setDeleteId}
              />
            ) : draft ? (
              <BudgetConfigPanel
                budget={draft}
                isNew={isNew}
                onChange={setDraft}
                onSave={handleSave}
                onBack={handleBack}
                savedMessage={savedMessage}
              />
            ) : null}
          </div>
        </main>
      </div>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete budget?</AlertDialogTitle>
            <AlertDialogDescription>
              This budget configuration and all entered amounts will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
