import { Search, Plus, ArrowUpDown, Trash2, Mail, Phone } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { ListPagination } from '../ListPagination';
import { usePagination } from '../../hooks/usePagination';
import {
  USER_DEPARTMENT_OPTIONS,
  getUserAvatarStyle,
  getUserDisplayName,
  getUserInitials,
  type SetupUser,
  type UserStatusFilter,
} from '../../data/userSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type UserDirectoryViewProps = {
  users: SetupUser[];
  search: string;
  statusFilter: UserStatusFilter;
  selectedIds: Set<string>;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: UserStatusFilter) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean, ids: string[]) => void;
  onBulkActivate: (active: boolean) => void;
  onBulkDelete: () => void;
};

export function UserDirectoryView({
  users,
  search,
  statusFilter,
  selectedIds,
  onSearchChange,
  onStatusFilterChange,
  onSelect,
  onCreate,
  onToggleSelect,
  onToggleSelectAll,
  onBulkActivate,
  onBulkDelete,
}: UserDirectoryViewProps) {
  const query = search.trim().toLowerCase();
  const filtered = users.filter((user) => {
    if (statusFilter === 'active' && !user.active) return false;
    if (statusFilter === 'inactive' && user.active) return false;
    if (!query) return true;
    const name = getUserDisplayName(user).toLowerCase();
    return (
      name.includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.userName.toLowerCase().includes(query) ||
      user.title.toLowerCase().includes(query)
    );
  });

  const pagination = usePagination(filtered, { resetKey: `${search}-${statusFilter}` });
  const { paginatedItems } = pagination;

  const activeCount = users.filter((u) => u.active).length;
  const inactiveCount = users.length - activeCount;

  const allVisibleSelected =
    paginatedItems.length > 0 && paginatedItems.every((u) => selectedIds.has(u.id));
  const someVisibleSelected =
    paginatedItems.some((u) => selectedIds.has(u.id)) && !allVisibleSelected;

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
          <StatChip label="Total users" value={users.length} />
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
              placeholder="Search users…"
              aria-label="Search users"
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
          <button type="button" onClick={onCreate} style={primaryBtnStyle}>
            <Plus size={16} strokeWidth={2.25} aria-hidden />
            Add user
          </button>
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
            aria-label="Delete selected users"
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
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '880px' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
              <th style={{ ...thStyle, width: '44px' }}>
                <Checkbox
                  checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                  onCheckedChange={(c) =>
                    onToggleSelectAll(
                      c === true,
                      paginatedItems.map((u) => u.id),
                    )
                  }
                  aria-label="Select all users on page"
                />
              </th>
              <th style={thStyle}>
                <SortLabel>User</SortLabel>
              </th>
              <th style={thStyle}>
                <SortLabel>Title</SortLabel>
              </th>
              <th style={thStyle}>
                <SortLabel>Department</SortLabel>
              </th>
              <th style={thStyle}>
                <SortLabel>Contact</SortLabel>
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
                <td colSpan={7} style={{ padding: '56px 24px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
                    {users.length === 0 ? 'No users yet' : 'No matching users'}
                  </p>
                  <p style={{ margin: '6px 0 16px', fontSize: '13px', color: '#64748B' }}>
                    {users.length === 0
                      ? 'Add your first team member to configure access and defaults.'
                      : 'Try adjusting your search or filter.'}
                  </p>
                  {users.length === 0 && (
                    <button type="button" onClick={onCreate} style={primaryBtnStyle}>
                      <Plus size={16} aria-hidden />
                      Add user
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedItems.map((user) => {
                const displayName = getUserDisplayName(user);
                const avatar = getUserAvatarStyle(user);
                const dept =
                  USER_DEPARTMENT_OPTIONS.find((d) => d.id === user.defaultDepartmentId)?.label ?? '—';
                return (
                  <tr
                    key={user.id}
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
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={(c) => onToggleSelect(user.id, c === true)}
                        aria-label={`Select ${displayName}`}
                      />
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => onSelect(user.id)}
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
                          {getUserInitials(user)}
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
                            {displayName}
                          </span>
                          <span style={{ display: 'block', fontSize: '12px', color: '#64748B' }}>
                            @{user.userName}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td style={{ ...tdStyle, fontSize: '13px', color: '#334155' }}>
                      {user.title || '—'}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '13px', color: '#334155' }}>{dept}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: '#475569',
                          }}
                        >
                          <Mail size={13} color="#94A3B8" aria-hidden />
                          {user.email}
                        </span>
                        {(user.cellPhone || user.physicalPhone) && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              color: '#475569',
                            }}
                          >
                            <Phone size={13} color="#94A3B8" aria-hidden />
                            {user.cellPhone || user.physicalPhone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge active={user.active} />
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => onSelect(user.id)}
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
  value: UserStatusFilter;
  onChange: (v: UserStatusFilter) => void;
}) {
  const options: { id: UserStatusFilter; label: string }[] = [
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

function SortLabel({ children }: { children: React.ReactNode }) {
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

function OutlineBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
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

const primaryBtnStyle: React.CSSProperties = {
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

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};
