import { useCallback, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { GroupListPanel } from '../../components/setup/GroupListPanel';
import { GroupPermissionsEditor } from '../../components/setup/GroupPermissionsEditor';
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
  ALL_PERMISSION_IDS,
  PERMISSION_CATEGORIES,
  cloneGroup,
  createSeedGroups,
  type PermissionId,
  type UserGroup,
} from '../../data/groupSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

function groupsEqual(a: UserGroup, b: UserGroup): boolean {
  if (a.name !== b.name) return false;
  if (a.permissions.size !== b.permissions.size) return false;
  for (const id of a.permissions) {
    if (!b.permissions.has(id)) return false;
  }
  return true;
}

export function GroupSetup() {
  const [groups, setGroups] = useState<UserGroup[]>(() => createSeedGroups());
  const [selectedId, setSelectedId] = useState<string | null>('group-general');
  const [draft, setDraft] = useState<UserGroup | null>(() => {
    const initial = createSeedGroups().find((g) => g.id === 'group-general');
    return initial ? cloneGroup(initial) : null;
  });
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UserGroup | null>(null);
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);

  const savedGroup = useMemo(
    () => groups.find((g) => g.id === selectedId) ?? null,
    [groups, selectedId],
  );

  const isDirty = draft && savedGroup ? !groupsEqual(draft, savedGroup) : Boolean(draft && isNew);

  const selectGroup = useCallback(
    (id: string) => {
      const group = groups.find((g) => g.id === id);
      if (!group) return;
      setSelectedId(id);
      setDraft(cloneGroup(group));
      setIsNew(false);
    },
    [groups],
  );

  const requestSelectGroup = (id: string) => {
    if (isDirty) {
      setPendingSelectId(id);
      return;
    }
    selectGroup(id);
  };

  const handleCreate = () => {
    const newGroup: UserGroup = {
      id: `group-${crypto.randomUUID()}`,
      name: '',
      permissions: new Set(),
    };
    setSelectedId(newGroup.id);
    setDraft(newGroup);
    setIsNew(true);
    setSearch('');
  };

  const handleSave = () => {
    if (!draft || !draft.name.trim()) return;

    setGroups((prev) => {
      const exists = prev.some((g) => g.id === draft.id);
      if (exists) {
        return prev.map((g) => (g.id === draft.id ? cloneGroup({ ...draft, name: draft.name.trim() }) : g));
      }
      return [...prev, cloneGroup({ ...draft, name: draft.name.trim() })];
    });
    setIsNew(false);
  };

  const handleReset = () => {
    if (savedGroup) setDraft(cloneGroup(savedGroup));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setGroups((prev) => prev.filter((g) => g.id !== deleteTarget.id));
    if (selectedId === deleteTarget.id) {
      const remaining = groups.filter((g) => g.id !== deleteTarget.id);
      const next = remaining[0];
      if (next) {
        setSelectedId(next.id);
        setDraft(cloneGroup(next));
        setIsNew(false);
      } else {
        setSelectedId(null);
        setDraft(null);
        setIsNew(false);
      }
    }
    setDeleteTarget(null);
  };

  const updateDraft = (updater: (current: UserGroup) => UserGroup) => {
    setDraft((current) => (current ? updater(current) : current));
  };

  const togglePermission = (id: PermissionId, checked: boolean) => {
    updateDraft((current) => {
      const permissions = new Set(current.permissions);
      if (checked) permissions.add(id);
      else permissions.delete(id);
      return { ...current, permissions };
    });
  };

  const toggleCategory = (categoryId: string, checked: boolean) => {
    const category = PERMISSION_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return;
    updateDraft((current) => {
      const permissions = new Set(current.permissions);
      for (const permission of category.permissions) {
        if (checked) permissions.add(permission.id);
        else permissions.delete(permission.id);
      }
      return { ...current, permissions };
    });
  };

  const selectAll = (checked: boolean) => {
    updateDraft((current) => ({
      ...current,
      permissions: checked ? new Set(ALL_PERMISSION_IDS) : new Set(),
    }));
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
              }}
            >
              <li>Setup &amp; configuration</li>
              <li aria-hidden>
                <ChevronRight size={14} color="#CBD5E1" />
              </li>
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Group Setup</li>
            </ol>
          </nav>

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
              Group Setup
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '56ch', lineHeight: 1.5 }}>
              Create permission groups and control what each role can do across purchase requests, orders,
              invoices, and more.
            </p>
          </header>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'stretch',
              minHeight: 'calc(100vh - 220px)',
            }}
          >
            <GroupListPanel
              groups={groups}
              selectedId={selectedId}
              search={search}
              onSearchChange={setSearch}
              onSelect={requestSelectGroup}
              onCreate={handleCreate}
              onDeleteRequest={setDeleteTarget}
            />
            <GroupPermissionsEditor
              group={draft}
              isNew={isNew}
              isDirty={Boolean(isDirty)}
              onNameChange={(name) => updateDraft((current) => ({ ...current, name }))}
              onTogglePermission={togglePermission}
              onToggleCategory={toggleCategory}
              onSelectAll={selectAll}
              onExpandAll={() => undefined}
              onCollapseAll={() => undefined}
              onReset={handleReset}
              onSave={handleSave}
            />
          </div>
        </main>
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete group?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be permanently removed. Users assigned to this group may lose access.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(pendingSelectId)}
        onOpenChange={(open) => !open && setPendingSelectId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes for this group. Switching groups will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingSelectId) selectGroup(pendingSelectId);
                setPendingSelectId(null);
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
