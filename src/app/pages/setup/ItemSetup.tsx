import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { ItemDirectoryView } from '../../components/setup/ItemDirectoryView';
import { ItemDetailPanel } from '../../components/setup/ItemDetailPanel';
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
  applyItemImageImports,
  cloneSetupItem,
  createEmptyItem,
  createSeedItems,
  itemsEqual,
  parseItemsImportCsv,
  type ItemInventoryFilter,
  type SetupItem,
} from '../../data/itemSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type DeleteMode = { type: 'bulk'; count: number };
type ToastState = { msg: string; type: 'success' | 'info' | 'error' };

export function ItemSetup() {
  const [items, setItems] = useState<SetupItem[]>(() => createSeedItems());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SetupItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ItemInventoryFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletePrompt, setDeletePrompt] = useState<DeleteMode | null>(null);
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);
  const [pendingClose, setPendingClose] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const savedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const isDirty =
    draft && savedItem ? !itemsEqual(draft, savedItem) : Boolean(draft && isNew);

  const openFormForItem = useCallback(
    (id: string) => {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      setSelectedId(id);
      setDraft(cloneSetupItem(item));
      setIsNew(false);
      setFormOpen(true);
    },
    [items],
  );

  const openCreateForm = () => {
    const newItem: SetupItem = {
      id: `item-${crypto.randomUUID()}`,
      ...createEmptyItem(),
    };
    setSelectedId(newItem.id);
    setDraft(newItem);
    setIsNew(true);
    setFormOpen(true);
  };

  const requestSelectItem = (id: string) => {
    if (formOpen && isDirty) {
      setPendingSelectId(id);
      return;
    }
    openFormForItem(id);
  };

  const closeForm = () => {
    setFormOpen(false);
    setDraft(null);
    setIsNew(false);
    if (isNew) setSelectedId(null);
  };

  const requestCloseForm = () => {
    if (isDirty) {
      setPendingClose(true);
      return;
    }
    closeForm();
  };

  const handleSave = () => {
    if (!draft || !draft.itemId.trim() || !draft.name.trim()) return;

    const saved = cloneSetupItem({
      ...draft,
      itemId: draft.itemId.trim(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      keywords: draft.keywords.trim(),
    });

    setItems((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      if (exists) return prev.map((item) => (item.id === saved.id ? saved : item));
      return [...prev, saved];
    });
    setIsNew(false);
  };

  const bulkDelete = () => {
    setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    if (draft && selectedIds.has(draft.id)) closeForm();
    setSelectedIds(new Set());
    setDeletePrompt(null);
  };

  const bulkSetActive = (active: boolean) => {
    setItems((prev) => prev.map((item) => (selectedIds.has(item.id) ? { ...item, active } : item)));
    if (draft && selectedIds.has(draft.id)) {
      setDraft((current) => (current ? { ...current, active } : current));
    }
  };

  const toggleSelectAll = (checked: boolean, ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleImportItems = async (file: File) => {
    try {
      const text = await file.text();
      const result = parseItemsImportCsv(text, items);
      setItems(result.items);
      if (draft) {
        const updatedDraft = result.items.find((item) => item.id === draft.id);
        if (updatedDraft) setDraft(cloneSetupItem(updatedDraft));
      }
      if (result.imported === 0) {
        setToast({ type: 'error', msg: 'No items found in the import file.' });
        return;
      }
      const skippedNote = result.skipped > 0 ? ` (${result.skipped} rows skipped)` : '';
      setToast({
        type: 'success',
        msg: `Imported ${result.imported} item${result.imported === 1 ? '' : 's'}${skippedNote}.`,
      });
    } catch {
      setToast({ type: 'error', msg: 'Could not read the items import file.' });
    }
  };

  const handleImportItemImages = (files: FileList) => {
    const fileList = Array.from(files);
    const result = applyItemImageImports(items, fileList);
    setItems(result.items);
    if (draft) {
      const updatedDraft = result.items.find((item) => item.id === draft.id);
      if (updatedDraft) setDraft(cloneSetupItem(updatedDraft));
    }

    if (result.matched === 0) {
      setToast({
        type: 'error',
        msg: 'No images matched an item. Name files using the item ID (e.g. 22346.jpg).',
      });
      return;
    }

    const unmatchedNote =
      result.unmatched.length > 0 ? ` ${result.unmatched.length} file(s) had no match.` : '';
    setToast({
      type: 'success',
      msg: `Linked ${result.matched} item image${result.matched === 1 ? '' : 's'}.${unmatchedNote}`,
    });
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
            overflowY: 'auto',
            padding: '24px 28px 32px',
            minWidth: 0,
          }}
        >
          <nav aria-label="Breadcrumb" style={{ marginBottom: '16px' }}>
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
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Item Setup</li>
              {formOpen && (
                <>
                  <li aria-hidden>
                    <ChevronRight size={14} color="#CBD5E1" />
                  </li>
                  <li style={{ color: '#334155', fontWeight: 600 }}>
                    {isNew ? 'Add item' : 'Edit item'}
                  </li>
                </>
              )}
            </ol>
          </nav>

          {!formOpen && (
            <header style={{ marginBottom: '20px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                Item Setup
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '56ch', lineHeight: 1.5 }}>
                Manage your item catalog, default GL accounts, and vendor pricing across the organization.
              </p>
            </header>
          )}

          {formOpen && draft ? (
            <ItemDetailPanel
              item={draft}
              isNew={isNew}
              isDirty={Boolean(isDirty)}
              onChange={(updater) => setDraft((current) => (current ? updater(current) : current))}
              onSave={handleSave}
              onCancel={requestCloseForm}
            />
          ) : (
            <ItemDirectoryView
              items={items}
              search={search}
              statusFilter={statusFilter}
              selectedIds={selectedIds}
              onSearchChange={setSearch}
              onStatusFilterChange={setStatusFilter}
              onSelect={requestSelectItem}
              onCreate={openCreateForm}
              onImportItems={handleImportItems}
              onImportItemImages={handleImportItemImages}
              onToggleSelect={(id, checked) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(id);
                  else next.delete(id);
                  return next;
                });
              }}
              onToggleSelectAll={toggleSelectAll}
              onBulkActivate={bulkSetActive}
              onBulkDelete={() => setDeletePrompt({ type: 'bulk', count: selectedIds.size })}
            />
          )}
        </main>
      </div>

      <AlertDialog open={Boolean(deletePrompt)} onOpenChange={(open) => !open && setDeletePrompt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected items?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletePrompt ? `${deletePrompt.count} items will be permanently removed.` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={bulkDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(pendingSelectId || pendingClose)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingSelectId(null);
            setPendingClose(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Continuing will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingSelectId) {
                  openFormForItem(pendingSelectId);
                  setPendingSelectId(null);
                }
                if (pendingClose) {
                  closeForm();
                  setPendingClose(false);
                }
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            padding: '10px 18px',
            background: '#FFFFFF',
            border: `1px solid ${toast.type === 'success' ? '#BBF7E0' : toast.type === 'error' ? '#FEE4E2' : '#E4E7EC'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(16,24,40,0.1)',
            minWidth: '280px',
            fontFamily: F,
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={14} color="#1FA97A" aria-hidden />}
          {toast.type === 'error' && <AlertCircle size={14} color="#F04438" aria-hidden />}
          {toast.type === 'info' && <AlertCircle size={14} color="#667085" aria-hidden />}
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#101828' }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
