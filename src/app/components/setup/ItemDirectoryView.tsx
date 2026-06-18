import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Search, Plus, ArrowUpDown, Trash2, Package, Upload, ImageIcon } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { ListPagination } from '../ListPagination';
import { usePagination } from '../../hooks/usePagination';
import {
  formatCurrency,
  getItemAvatarStyle,
  getItemInitials,
  type ItemInventoryFilter,
  type SetupItem,
} from '../../data/itemSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type ItemDirectoryViewProps = {
  items: SetupItem[];
  search: string;
  statusFilter: ItemInventoryFilter;
  selectedIds: Set<string>;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: ItemInventoryFilter) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onImportItems: (file: File) => void;
  onImportItemImages: (files: FileList) => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean, ids: string[]) => void;
  onBulkActivate: (active: boolean) => void;
  onBulkDelete: () => void;
};

export function ItemDirectoryView({
  items,
  search,
  statusFilter,
  selectedIds,
  onSearchChange,
  onStatusFilterChange,
  onSelect,
  onCreate,
  onImportItems,
  onImportItemImages,
  onToggleSelect,
  onToggleSelectAll,
  onBulkActivate,
  onBulkDelete,
}: ItemDirectoryViewProps) {
  const itemsImportRef = useRef<HTMLInputElement>(null);
  const imagesImportRef = useRef<HTMLInputElement>(null);

  const query = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (statusFilter === 'active' && !item.active) return false;
    if (statusFilter === 'inactive' && item.active) return false;
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.itemId.toLowerCase().includes(query) ||
      item.keywords.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.glAccount.toLowerCase().includes(query) ||
      item.unitOfMeasure.toLowerCase().includes(query)
    );
  });

  const pagination = usePagination(filtered, { resetKey: `${search}-${statusFilter}` });
  const { paginatedItems } = pagination;

  const activeCount = items.filter((item) => item.active).length;
  const inactiveCount = items.length - activeCount;

  const allVisibleSelected =
    paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.has(item.id));
  const someVisibleSelected =
    paginatedItems.some((item) => selectedIds.has(item.id)) && !allVisibleSelected;

  return (
    <section
      style={{
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
        fontFamily: F,
      }}
    >
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #EEF1F5',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <StatChip label="Total items" value={items.length} />
          <StatChip label="Active" value={activeCount} accent="green" />
          <StatChip label="Inactive" value={inactiveCount} accent="muted" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <FilterPills value={statusFilter} onChange={onStatusFilterChange} />
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
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search items…"
              aria-label="Search items"
              style={{
                height: '36px',
                width: '240px',
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
          <button type="button" onClick={() => itemsImportRef.current?.click()} style={outlineBtnStyle}>
            <Upload size={15} strokeWidth={2} aria-hidden />
            Import items
          </button>
          <button type="button" onClick={() => imagesImportRef.current?.click()} style={outlineBtnStyle}>
            <ImageIcon size={15} strokeWidth={2} aria-hidden />
            Item images
          </button>
          <button type="button" onClick={onCreate} style={primaryBtnStyle}>
            <Plus size={16} strokeWidth={2.25} aria-hidden />
            Add item
          </button>
          <input
            ref={itemsImportRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportItems(file);
              event.target.value = '';
            }}
          />
          <input
            ref={imagesImportRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(event) => {
              const files = event.target.files;
              if (files && files.length > 0) onImportItemImages(files);
              event.target.value = '';
            }}
          />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 24px',
            borderBottom: '1px solid #EEF1F5',
            background: '#FAFBFC',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            {selectedIds.size} selected
          </span>
          <OutlineBtn onClick={() => onBulkActivate(true)}>Activate</OutlineBtn>
          <OutlineBtn onClick={() => onBulkActivate(false)}>Deactivate</OutlineBtn>
          <button
            type="button"
            onClick={onBulkDelete}
            aria-label="Delete selected items"
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
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '960px' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
              <th style={{ ...thStyle, width: '44px' }}>
                <Checkbox
                  checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                  onCheckedChange={(c) =>
                    onToggleSelectAll(
                      c === true,
                      paginatedItems.map((item) => item.id),
                    )
                  }
                  aria-label="Select all items on page"
                />
              </th>
              <th style={thStyle}>
                <SortLabel>Item</SortLabel>
              </th>
              <th style={thStyle}>
                <SortLabel>Unit of Measure</SortLabel>
              </th>
              <th style={thStyle}>
                <SortLabel>GL Account</SortLabel>
              </th>
              <th style={thStyle}>
                <SortLabel>Cost</SortLabel>
              </th>
              <th style={thStyle}>
                <SortLabel>Vendors</SortLabel>
              </th>
              <th style={thStyle}>
                <SortLabel>Status</SortLabel>
              </th>
              <th style={{ ...thStyle, width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '56px 24px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
                    {items.length === 0 ? 'No items yet' : 'No matching items'}
                  </p>
                  <p style={{ margin: '6px 0 16px', fontSize: '13px', color: '#64748B' }}>
                    {items.length === 0
                      ? 'Add your first catalog item to configure pricing and vendor links.'
                      : 'Try adjusting your search or filter.'}
                  </p>
                  {items.length === 0 && (
                    <button type="button" onClick={onCreate} style={primaryBtnStyle}>
                      <Plus size={16} aria-hidden />
                      Add item
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => {
                const avatar = getItemAvatarStyle(item);
                return (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid #EEF1F5', transition: 'background 0.12s' }}
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
                        onCheckedChange={(c) => onToggleSelect(item.id, c === true)}
                        aria-label={`Select ${item.name}`}
                      />
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => onSelect(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          padding: 0,
                          textAlign: 'left',
                          fontFamily: F,
                        }}
                      >
                        <span
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: avatar.bg,
                            color: avatar.color,
                            border: `1px solid ${avatar.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                            />
                          ) : getItemInitials(item) ? (
                            getItemInitials(item)
                          ) : (
                            <Package size={18} aria-hidden />
                          )}
                        </span>
                        <span>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: P2P_BRAND.primaryStrong,
                            }}
                          >
                            {item.name || 'Untitled item'}
                          </span>
                          <span style={{ display: 'block', fontSize: '12px', color: '#64748B' }}>
                            #{item.itemId || '—'}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '13px', color: '#334155' }}>
                      {item.unitOfMeasure || '—'}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        fontSize: '13px',
                        color: '#334155',
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.glAccount}
                    >
                      {item.glAccount || '—'}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '13px', color: '#334155', fontWeight: 500 }}>
                      ${formatCurrency(item.cost)}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '13px', color: '#334155' }}>
                      {item.vendors.length}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge active={item.active} />
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => onSelect(item.id)}
                        style={{
                          padding: '6px 12px',
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
                        Edit
                      </button>
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
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'green' | 'muted';
}) {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid #E4E7EC',
        background: accent === 'green' ? P2P_BRAND.surface : '#FAFBFC',
        minWidth: '100px',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div
        style={{
          marginTop: '2px',
          fontSize: '20px',
          fontWeight: 700,
          color: accent === 'green' ? P2P_BRAND.primaryStrong : '#0F172A',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FilterPills({
  value,
  onChange,
}: {
  value: ItemInventoryFilter;
  onChange: (v: ItemInventoryFilter) => void;
}) {
  const options: { id: ItemInventoryFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
  ];
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: '3px',
        borderRadius: '9px',
        background: '#F1F5F9',
        border: '1px solid #E2E8F0',
      }}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '7px',
              background: active ? '#FFFFFF' : 'transparent',
              color: active ? P2P_BRAND.primaryStrong : '#64748B',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: F,
              boxShadow: active ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: 600,
        color: active ? P2P_BRAND.primaryStrong : '#64748B',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '999px',
          background: active ? P2P_BRAND.primary : '#CBD5E1',
        }}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function SortLabel({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        fontWeight: 600,
        color: '#667085',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
      <ArrowUpDown size={12} aria-hidden />
    </span>
  );
}

function OutlineBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
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

const outlineBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 14px',
  border: `1px solid ${P2P_BRAND.surfaceBorder}`,
  borderRadius: '8px',
  background: '#FFFFFF',
  color: P2P_BRAND.primaryStrong,
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};

const primaryBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 14px',
  border: 'none',
  borderRadius: '8px',
  background: P2P_BRAND.primary,
  color: '#FFFFFF',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};

const thStyle: CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const tdStyle: CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};
