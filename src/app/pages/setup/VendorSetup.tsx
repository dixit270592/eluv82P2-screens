import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { VendorDirectoryView } from '../../components/setup/VendorDirectoryView';
import { VendorFormPanel } from '../../components/setup/VendorFormPanel';
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
  cloneSetupVendor,
  createEmptyVendor,
  createSeedVendors,
  nextVendorCode,
  vendorsEqual,
  type SetupVendor,
  type VendorStatusFilter,
} from '../../data/vendorSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type DeleteMode = { type: 'bulk'; count: number };

export function VendorSetup() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<SetupVendor[]>(() => createSeedVendors());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SetupVendor | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VendorStatusFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletePrompt, setDeletePrompt] = useState<DeleteMode | null>(null);
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);
  const [pendingClose, setPendingClose] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const savedVendor = useMemo(
    () => vendors.find((v) => v.id === selectedId) ?? null,
    [vendors, selectedId],
  );

  const isDirty =
    draft && savedVendor ? !vendorsEqual(draft, savedVendor) : Boolean(draft && isNew);

  const openFormForVendor = useCallback(
    (id: string) => {
      const vendor = vendors.find((v) => v.id === id);
      if (!vendor) return;
      setSelectedId(id);
      setDraft(cloneSetupVendor(vendor));
      setIsNew(false);
      setFormOpen(true);
    },
    [vendors],
  );

  const openCreateForm = () => {
    const newVendor: SetupVendor = {
      id: `vendor-${crypto.randomUUID()}`,
      ...createEmptyVendor(nextVendorCode(vendors)),
    };
    setSelectedId(newVendor.id);
    setDraft(newVendor);
    setIsNew(true);
    setFormOpen(true);
  };

  const requestSelectVendor = (id: string) => {
    if (formOpen && isDirty) {
      setPendingSelectId(id);
      return;
    }
    openFormForVendor(id);
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
    if (!draft || !draft.name.trim() || !draft.vendorCode.trim()) return;

    setVendors((prev) => {
      const exists = prev.some((v) => v.id === draft.id);
      const saved = cloneSetupVendor({
        ...draft,
        name: draft.name.trim(),
        vendorCode: draft.vendorCode.trim(),
        email: draft.email.trim(),
      });
      if (exists) return prev.map((v) => (v.id === saved.id ? saved : v));
      return [...prev, saved];
    });
    setIsNew(false);
  };

  const bulkDelete = () => {
    setVendors((prev) => prev.filter((v) => !selectedIds.has(v.id)));
    if (draft && selectedIds.has(draft.id)) closeForm();
    setSelectedIds(new Set());
    setDeletePrompt(null);
  };

  const bulkSetActive = (active: boolean) => {
    setVendors((prev) => prev.map((v) => (selectedIds.has(v.id) ? { ...v, active } : v)));
    if (draft && selectedIds.has(draft.id)) {
      setDraft((d) => (d ? { ...d, active } : d));
    }
  };

  const bulkSetArchived = (archived: boolean) => {
    setVendors((prev) =>
      prev.map((v) =>
        selectedIds.has(v.id)
          ? { ...v, archived, active: archived ? false : v.active }
          : v,
      ),
    );
    if (draft && selectedIds.has(draft.id)) {
      setDraft((d) => (d ? { ...d, archived, active: archived ? false : d.active } : d));
    }
  };

  const handleOpenPortal = (vendor: SetupVendor) => {
    navigate(`/vendor-portal/${vendor.id}`);
  };

  const handleImportVendor = () => {
    setActionNotice('Import vendor will open a file picker when the integration is connected.');
  };

  const handleAiInvoice = () => {
    setActionNotice('AI invoice capture will open when the integration is connected.');
  };

  const toggleSelectAll = (checked: boolean, ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
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
              <li>Accounting Setup</li>
              <li aria-hidden>
                <ChevronRight size={14} color="#CBD5E1" />
              </li>
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Vendor Setup</li>
              {formOpen && (
                <>
                  <li aria-hidden>
                    <ChevronRight size={14} color="#CBD5E1" />
                  </li>
                  <li style={{ color: '#334155', fontWeight: 600 }}>
                    {isNew ? 'Add vendor' : 'Modify vendor'}
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
                Vendor Setup
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '56ch', lineHeight: 1.5 }}>
                Manage vendor profiles, contacts, documents, and procurement relationships.
              </p>
            </header>
          )}

          {formOpen && draft ? (
            <VendorFormPanel
              vendor={draft}
              isNew={isNew}
              isDirty={Boolean(isDirty)}
              onChange={(updater) => setDraft((current) => (current ? updater(current) : current))}
              onSave={handleSave}
              onCancel={requestCloseForm}
            />
          ) : (
            <VendorDirectoryView
              vendors={vendors}
              search={search}
              statusFilter={statusFilter}
              selectedIds={selectedIds}
              onSearchChange={setSearch}
              onStatusFilterChange={setStatusFilter}
              onSelect={requestSelectVendor}
              onCreate={openCreateForm}
              onImport={handleImportVendor}
              onAiInvoice={handleAiInvoice}
              onOpenPortal={handleOpenPortal}
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
              onBulkArchive={bulkSetArchived}
              onBulkDelete={() => setDeletePrompt({ type: 'bulk', count: selectedIds.size })}
            />
          )}
        </main>
      </div>

      <AlertDialog open={Boolean(actionNotice)} onOpenChange={(open) => !open && setActionNotice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vendor setup</AlertDialogTitle>
            <AlertDialogDescription>{actionNotice}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setActionNotice(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(deletePrompt)} onOpenChange={(open) => !open && setDeletePrompt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected vendors?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletePrompt ? `${deletePrompt.count} vendors will be permanently removed.` : ''}
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
                  openFormForVendor(pendingSelectId);
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
    </div>
  );
}
