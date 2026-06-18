import { Search, Plus, Trash2 } from 'lucide-react';
import type { UserGroup } from '../../data/groupSetup';
import { ListPagination } from '../ListPagination';
import { usePagination } from '../../hooks/usePagination';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type GroupListPanelProps = {
  groups: UserGroup[];
  selectedId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDeleteRequest: (group: UserGroup) => void;
};

export function GroupListPanel({
  groups,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  onCreate,
  onDeleteRequest,
}: GroupListPanelProps) {
  const query = search.trim().toLowerCase();
  const filtered = query
    ? groups.filter((g) => g.name.toLowerCase().includes(query))
    : groups;

  const pagination = usePagination(filtered, { resetKey: search });
  const { paginatedItems } = pagination;

  return (
    <aside
      aria-label="Groups"
      style={{
        width: '280px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: F,
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #E4E7EC',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Groups</span>
          <button
            type="button"
            onClick={onCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              border: 'none',
              borderRadius: '8px',
              background: P2P_BRAND.primary,
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: F,
            }}
          >
            <Plus size={14} strokeWidth={2.25} aria-hidden />
            New
          </button>
        </div>

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
            placeholder="Search groups…"
            aria-label="Search groups"
            style={{
              width: '100%',
              padding: '8px 10px 8px 32px',
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

      <ul
        style={{
          flex: 1,
          margin: 0,
          padding: '8px',
          listStyle: 'none',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {filtered.length === 0 ? (
          <li
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              fontSize: '13px',
              color: '#64748B',
              lineHeight: 1.5,
            }}
          >
            {groups.length === 0
              ? 'No groups yet. Create your first group to get started.'
              : 'No groups match your search.'}
          </li>
        ) : (
          paginatedItems.map((group) => {
            const isSelected = group.id === selectedId;
            return (
              <li key={group.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '8px',
                    background: isSelected ? P2P_BRAND.surface : 'transparent',
                    border: isSelected ? `1px solid ${P2P_BRAND.surfaceBorder}` : '1px solid transparent',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(group.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '2px',
                      padding: '10px 12px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: F,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? P2P_BRAND.primaryStrong : '#0F172A',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                      }}
                    >
                      {group.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {group.permissions.size} permission{group.permissions.size === 1 ? '' : 's'}
                    </span>
                  </button>
                  {!group.isSystem && (
                    <button
                      type="button"
                      onClick={() => onDeleteRequest(group)}
                      aria-label={`Delete ${group.name}`}
                      style={{
                        flexShrink: 0,
                        marginRight: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        borderRadius: '6px',
                        background: 'transparent',
                        color: '#94A3B8',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEF2F2';
                        e.currentTarget.style.color = '#DC2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94A3B8';
                      }}
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>

      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        totalItems={pagination.totalItems}
        onPageChange={pagination.setPage}
      />
    </aside>
  );
}
