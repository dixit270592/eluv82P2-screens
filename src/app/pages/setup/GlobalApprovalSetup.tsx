import { useMemo, useState, type CSSProperties } from 'react';
import { ChevronRight, Plus, Search, ArrowUpDown, Trash2 } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { Checkbox } from '../../components/ui/checkbox';
import { Switch } from '../../components/ui/switch';
import { GlobalApprovalFormDialog } from '../../components/setup/GlobalApprovalFormDialog';
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
  createSeedGlobalApprovals,
  levelsSummary,
  type GlobalApproval,
} from '../../data/globalApprovalSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type SortKey = 'name' | 'triggerType' | 'triggerValue' | 'levels' | 'active';
type SortDir = 'asc' | 'desc';

export function GlobalApprovalSetup() {
  const [items, setItems] = useState<GlobalApproval[]>(() => createSeedGlobalApprovals());
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GlobalApproval | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GlobalApproval | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => {
        if (!query) return true;
        return (
          item.name.toLowerCase().includes(query) ||
          item.triggerType.toLowerCase().includes(query) ||
          item.triggerValue.toLowerCase().includes(query) ||
          levelsSummary(item.levels).toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
        if (sortKey === 'triggerType') return a.triggerType.localeCompare(b.triggerType) * dir;
        if (sortKey === 'triggerValue') return a.triggerValue.localeCompare(b.triggerValue) * dir;
        if (sortKey === 'levels')
          return levelsSummary(a.levels).localeCompare(levelsSummary(b.levels)) * dir;
        return (Number(a.active) - Number(b.active)) * dir;
      });
  }, [items, search, sortKey, sortDir]);

  const allSelected = filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id));
  const someSelected = filtered.some((i) => selectedIds.has(i.id)) && !allSelected;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) filtered.forEach((i) => next.add(i.id));
      else filtered.forEach((i) => next.delete(i.id));
      return next;
    });
  };

  const openCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (item: GlobalApproval) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSave = (saved: GlobalApproval) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === saved.id);
      if (exists) return prev.map((i) => (i.id === saved.id ? saved : i));
      return [...prev, saved];
    });
  };

  const toggleActive = (id: string, active: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, active } : i)));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(deleteTarget.id);
      return next;
    });
    setDeleteTarget(null);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F5F7FA', fontFamily: F, overflow: 'hidden' }}>
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
              }}
            >
              <li>Setup &amp; configuration</li>
              <li aria-hidden>
                <ChevronRight size={14} color="#CBD5E1" />
              </li>
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Global Approval</li>
            </ol>
          </nav>

          <header
            style={{
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Global Approval
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '56ch', lineHeight: 1.5 }}>
                Set amount-based approval levels that apply when a trigger condition is met on purchase requests and
                other transactions.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  color="#94A3B8"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                  aria-hidden
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search here…"
                  aria-label="Search approvals"
                  style={{
                    height: '40px',
                    width: 'min(280px, 70vw)',
                    padding: '0 10px 0 32px',
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    outline: 'none',
                    fontFamily: F,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={openCreate}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
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
                New approval
              </button>
            </div>
          </header>

          <section
            style={{
              background: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table aria-label="Global approvals" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                    <th style={{ ...thStyle, width: '44px' }}>
                      <Checkbox
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={(c) => toggleSelectAll(c === true)}
                        aria-label="Select all"
                      />
                    </th>
                    <SortHeader label="Approval name" active={sortKey === 'name'} onClick={() => toggleSort('name')} />
                    <SortHeader label="Trigger name" active={sortKey === 'triggerType'} onClick={() => toggleSort('triggerType')} />
                    <SortHeader label="Trigger value" active={sortKey === 'triggerValue'} onClick={() => toggleSort('triggerValue')} />
                    <SortHeader label="Levels" active={sortKey === 'levels'} onClick={() => toggleSort('levels')} />
                    <SortHeader label="Active" active={sortKey === 'active'} onClick={() => toggleSort('active')} />
                    <th style={{ ...thStyle, width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                        No approvals match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={tdStyle}>
                          <Checkbox
                            checked={selectedIds.has(item.id)}
                            onCheckedChange={(c) =>
                              setSelectedIds((prev) => {
                                const next = new Set(prev);
                                if (c) next.add(item.id);
                                else next.delete(item.id);
                                return next;
                              })
                            }
                            aria-label={`Select ${item.name}`}
                          />
                        </td>
                        <td style={tdStyle}>
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              padding: 0,
                              color: P2P_BRAND.primaryStrong,
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: F,
                              textAlign: 'left',
                            }}
                          >
                            {item.name}
                          </button>
                        </td>
                        <td style={{ ...tdStyle, color: '#334155', fontSize: '13px' }}>{item.triggerType}</td>
                        <td style={{ ...tdStyle, color: '#334155', fontSize: '13px' }}>{item.triggerValue}</td>
                        <td style={{ ...tdStyle, color: '#334155', fontSize: '13px' }}>{levelsSummary(item.levels)}</td>
                        <td style={tdStyle}>
                          <Switch
                            checked={item.active}
                            onCheckedChange={(active) => toggleActive(item.id, active)}
                            aria-label={`${item.active ? 'Deactivate' : 'Activate'} ${item.name}`}
                          />
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: P2P_BRAND.primaryStrong,
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: F,
                                padding: 0,
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              aria-label={`Delete ${item.name}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                border: 'none',
                                borderRadius: '6px',
                                background: 'transparent',
                                color: '#94A3B8',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={16} aria-hidden />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <GlobalApprovalFormDialog
        open={dialogOpen}
        mode={editingItem ? 'edit' : 'create'}
        initial={editingItem}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete approval?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be permanently removed. Transactions using this rule may no longer route correctly.`
                : ''}
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

function SortHeader({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <th style={thStyle}>
      <button
        type="button"
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 600,
          color: active ? P2P_BRAND.primaryStrong : '#667085',
          fontFamily: F,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
        <ArrowUpDown size={12} aria-hidden />
      </button>
    </th>
  );
}

const thStyle: CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  whiteSpace: 'nowrap',
};

const tdStyle: CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};
