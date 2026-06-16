import { useMemo, useState } from 'react';
import { ChevronRight, Plus, Search, ArrowUpDown, Trash2 } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { Checkbox } from '../../components/ui/checkbox';
import { Switch } from '../../components/ui/switch';
import { ListPagination } from '../../components/ListPagination';
import { AddressPreviewPopover } from '../../components/setup/AddressPreviewPopover';
import { DepartmentLocationFormDialog } from '../../components/setup/DepartmentLocationFormDialog';
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
import { usePagination } from '../../hooks/usePagination';
import {
  createSeedDepartmentsLocations,
  getAddressById,
  type DepartmentLocation,
  type DeptLocType,
} from '../../data/departmentLocationSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type SortKey = 'name' | 'type' | 'address' | 'active';
type SortDir = 'asc' | 'desc';
type TypeFilter = 'all' | DeptLocType;
type DeleteMode = { type: 'single'; id: string; name: string } | { type: 'bulk'; count: number };

export function DepartmentLocationSetup() {
  const [items, setItems] = useState<DepartmentLocation[]>(() => createSeedDepartmentsLocations());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DepartmentLocation | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<DeleteMode | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => {
        if (typeFilter !== 'all' && item.type !== typeFilter) return false;
        if (!query) return true;
        const address = getAddressById(item.addressId);
        return (
          item.name.toLowerCase().includes(query) ||
          item.type.includes(query) ||
          address?.label.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
        if (sortKey === 'type') return a.type.localeCompare(b.type) * dir;
        if (sortKey === 'active') return (Number(a.active) - Number(b.active)) * dir;
        const addrA = getAddressById(a.addressId)?.label ?? '';
        const addrB = getAddressById(b.addressId)?.label ?? '';
        return addrA.localeCompare(addrB) * dir;
      });
  }, [items, search, typeFilter, sortKey, sortDir]);

  const pagination = usePagination(filtered, {
    resetKey: `${search}-${typeFilter}-${sortKey}-${sortDir}`,
  });
  const { paginatedItems } = pagination;

  const allVisibleSelected =
    paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.has(item.id));
  const someVisibleSelected =
    paginatedItems.some((item) => selectedIds.has(item.id)) && !allVisibleSelected;

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
      if (checked) {
        for (const item of paginatedItems) next.add(item.id);
      } else {
        for (const item of paginatedItems) next.delete(item.id);
      }
      return next;
    });
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (item: DepartmentLocation) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSave = (saved: DepartmentLocation) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === saved.id);
      if (exists) return prev.map((i) => (i.id === saved.id ? saved : i));
      return [...prev, saved];
    });
  };

  const toggleActive = (id: string, active: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, active } : i)));
  };

  const bulkSetActive = (active: boolean) => {
    setItems((prev) =>
      prev.map((i) => (selectedIds.has(i.id) ? { ...i, active } : i)),
    );
  };

  const confirmDelete = () => {
    if (!deletePrompt) return;
    if (deletePrompt.type === 'single') {
      setItems((prev) => prev.filter((i) => i.id !== deletePrompt.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deletePrompt.id);
        return next;
      });
    } else {
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
    }
    setDeletePrompt(null);
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
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>
                Department / Location Setup
              </li>
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
              <h1
                style={{
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                }}
              >
                Department / Location
              </h1>
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: '14px',
                  color: '#64748B',
                  maxWidth: '56ch',
                  lineHeight: 1.5,
                }}
              >
                Manage organizational departments and physical locations used across purchase
                requests, approvals, and reporting.
              </p>
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
                flexShrink: 0,
              }}
            >
              <Plus size={16} strokeWidth={2.25} aria-hidden />
              Department / Location
            </button>
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
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #EEF1F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#101828' }}>All entries</span>
                <span
                  style={{
                    padding: '2px 9px',
                    background: '#F2F4F7',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#667085',
                  }}
                >
                  {filtered.length}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                  aria-label="Filter by type"
                  style={{
                    height: '36px',
                    padding: '0 12px',
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#334155',
                    background: '#FFFFFF',
                    fontFamily: F,
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All types</option>
                  <option value="department">Department</option>
                  <option value="location">Location</option>
                </select>

                <div style={{ position: 'relative' }}>
                  <Search
                    size={15}
                    color="#94A3B8"
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search here…"
                    aria-label="Search departments and locations"
                    style={{
                      height: '36px',
                      width: '220px',
                      padding: '0 10px 0 32px',
                      border: '1px solid #E4E7EC',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#0F172A',
                      background: '#F8FAFC',
                      outline: 'none',
                      fontFamily: F,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {selectedIds.size > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  borderBottom: '1px solid #EEF1F5',
                  background: '#FAFBFC',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  {selectedIds.size} selected
                </span>
                <BulkActionButton onClick={() => bulkSetActive(true)}>Activate</BulkActionButton>
                <BulkActionButton onClick={() => bulkSetActive(false)}>Deactivate</BulkActionButton>
                <button
                  type="button"
                  onClick={() => setDeletePrompt({ type: 'bulk', count: selectedIds.size })}
                  aria-label={`Delete ${selectedIds.size} selected entries`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: '#DC2626',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table
                aria-label="Departments and locations"
                style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}
              >
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                    <th style={{ ...thStyle, width: '44px' }}>
                      <Checkbox
                        checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                        onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                        aria-label="Select all rows"
                      />
                    </th>
                    <SortableHeader label="Name" active={sortKey === 'name'} onClick={() => toggleSort('name')} />
                    <SortableHeader label="Type" active={sortKey === 'type'} onClick={() => toggleSort('type')} />
                    <SortableHeader
                      label="Address"
                      active={sortKey === 'address'}
                      onClick={() => toggleSort('address')}
                    />
                    <th style={{ ...thStyle, width: '140px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: '48px 20px',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#64748B',
                        }}
                      >
                        {items.length === 0
                          ? 'No departments or locations yet. Add your first entry to get started.'
                          : 'No entries match your search or filter.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => {
                      const address = getAddressById(item.addressId);
                      return (
                        <tr
                          key={item.id}
                          style={{ borderBottom: '1px solid #EEF1F5' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FAFBFC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <td style={tdStyle}>
                            <Checkbox
                              checked={selectedIds.has(item.id)}
                              onCheckedChange={(checked) => toggleSelectRow(item.id, checked === true)}
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
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: P2P_BRAND.primaryStrong,
                                fontFamily: F,
                                textAlign: 'left',
                              }}
                            >
                              {item.name}
                            </button>
                          </td>
                          <td style={tdStyle}>
                            <TypeBadge type={item.type} />
                          </td>
                          <td style={tdStyle}>
                            {address ? (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  maxWidth: '100%',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => openEdit(item)}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: 0,
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: P2P_BRAND.primaryStrong,
                                    fontFamily: F,
                                    textAlign: 'left',
                                  }}
                                >
                                  {address.label}
                                </button>
                                <AddressPreviewPopover addressId={item.addressId} compact />
                              </div>
                            ) : (
                              <span style={{ fontSize: '13px', color: '#94A3B8' }}>—</span>
                            )}
                          </td>
                          <td style={{ ...tdStyle, width: '140px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Switch
                                checked={item.active}
                                onCheckedChange={(checked) => toggleActive(item.id, checked)}
                                aria-label={`${item.active ? 'Deactivate' : 'Activate'} ${item.name}`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setDeletePrompt({ type: 'single', id: item.id, name: item.name })
                                }
                                aria-label={`Delete ${item.name}`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  border: '1px solid #FECACA',
                                  borderRadius: '8px',
                                  background: '#FFFFFF',
                                  color: '#DC2626',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              >
                                <Trash2 size={14} aria-hidden />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <ListPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              rangeStart={pagination.rangeStart}
              rangeEnd={pagination.rangeEnd}
              totalItems={pagination.totalItems}
              onPageChange={pagination.setPage}
            />
          </section>
        </main>
      </div>

      <DepartmentLocationFormDialog
        open={dialogOpen}
        mode={editingItem ? 'edit' : 'create'}
        initial={editingItem}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />

      <AlertDialog open={Boolean(deletePrompt)} onOpenChange={(open) => !open && setDeletePrompt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deletePrompt?.type === 'bulk' ? 'Delete selected entries?' : 'Delete entry?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletePrompt?.type === 'bulk'
                ? `${deletePrompt.count} department/location entries will be permanently removed.`
                : deletePrompt?.type === 'single'
                  ? `"${deletePrompt.name}" will be permanently removed.`
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

function BulkActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '7px 14px',
        border: `1px solid ${P2P_BRAND.surfaceBorder}`,
        borderRadius: '8px',
        background: '#FFFFFF',
        color: P2P_BRAND.primaryStrong,
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: F,
      }}
    >
      {children}
    </button>
  );
}

function SortableHeader({
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

function TypeBadge({ type }: { type: DeptLocType }) {
  const isDepartment = type === 'department';
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        color: isDepartment ? '#1D4ED8' : '#7C3AED',
        background: isDepartment ? '#EFF6FF' : '#F5F3FF',
        border: `1px solid ${isDepartment ? '#BFDBFE' : '#DDD6FE'}`,
        textTransform: 'capitalize',
      }}
    >
      {type}
    </span>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};
