import { useCallback, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { UserDirectoryView } from '../../components/setup/UserDirectoryView';
import { UserFormPanel } from '../../components/setup/UserFormPanel';
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
  cloneSetupUser,
  createEmptyUser,
  createSeedUsers,
  usersEqual,
  type SetupUser,
  type UserStatusFilter,
} from '../../data/userSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type DeleteMode = { type: 'bulk'; count: number };

export function UserSetup() {
  const [users, setUsers] = useState<SetupUser[]>(() => createSeedUsers());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SetupUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletePrompt, setDeletePrompt] = useState<DeleteMode | null>(null);
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);
  const [pendingClose, setPendingClose] = useState(false);

  const savedUser = useMemo(
    () => users.find((u) => u.id === selectedId) ?? null,
    [users, selectedId],
  );

  const isDirty =
    draft && savedUser ? !usersEqual(draft, savedUser) : Boolean(draft && isNew);

  const openFormForUser = useCallback(
    (id: string) => {
      const user = users.find((u) => u.id === id);
      if (!user) return;
      setSelectedId(id);
      setDraft(cloneSetupUser(user));
      setIsNew(false);
      setFormOpen(true);
    },
    [users],
  );

  const openCreateForm = () => {
    const newUser: SetupUser = {
      id: `user-${crypto.randomUUID()}`,
      ...createEmptyUser(),
    };
    setSelectedId(newUser.id);
    setDraft(newUser);
    setIsNew(true);
    setFormOpen(true);
  };

  const requestSelectUser = (id: string) => {
    if (formOpen && isDirty) {
      setPendingSelectId(id);
      return;
    }
    openFormForUser(id);
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
    if (!draft || !draft.userName.trim() || !draft.email.trim()) return;

    setUsers((prev) => {
      const exists = prev.some((u) => u.id === draft.id);
      const saved = cloneSetupUser({
        ...draft,
        userName: draft.userName.trim(),
        email: draft.email.trim(),
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
      });
      if (exists) return prev.map((u) => (u.id === saved.id ? saved : u));
      return [...prev, saved];
    });
    setIsNew(false);
  };

  const bulkDelete = () => {
    setUsers((prev) => prev.filter((u) => !selectedIds.has(u.id)));
    if (draft && selectedIds.has(draft.id)) closeForm();
    setSelectedIds(new Set());
    setDeletePrompt(null);
  };

  const bulkSetActive = (active: boolean) => {
    setUsers((prev) => prev.map((u) => (selectedIds.has(u.id) ? { ...u, active } : u)));
    if (draft && selectedIds.has(draft.id)) {
      setDraft((d) => (d ? { ...d, active } : d));
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
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>User Setup</li>
              {formOpen && (
                <>
                  <li aria-hidden>
                    <ChevronRight size={14} color="#CBD5E1" />
                  </li>
                  <li style={{ color: '#334155', fontWeight: 600 }}>
                    {isNew ? 'Add user' : 'Edit user'}
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
                User Setup
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '56ch', lineHeight: 1.5 }}>
                Manage team members, access groups, and default settings across the organization.
              </p>
            </header>
          )}

          {formOpen && draft ? (
            <UserFormPanel
              user={draft}
              isNew={isNew}
              isDirty={Boolean(isDirty)}
              onChange={(updater) => setDraft((current) => (current ? updater(current) : current))}
              onSave={handleSave}
              onCancel={requestCloseForm}
            />
          ) : (
            <UserDirectoryView
              users={users}
              search={search}
              statusFilter={statusFilter}
              selectedIds={selectedIds}
              onSearchChange={setSearch}
              onStatusFilterChange={setStatusFilter}
              onSelect={requestSelectUser}
              onCreate={openCreateForm}
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
            <AlertDialogTitle>Delete selected users?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletePrompt ? `${deletePrompt.count} users will be permanently removed.` : ''}
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
                  openFormForUser(pendingSelectId);
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
