import { Search, Plus, ArrowUpDown, Trash2, Mail, Phone, Star, Archive, Upload, Sparkles, ExternalLink, CreditCard, ShoppingBag } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { ListPagination } from '../ListPagination';
import { usePagination } from '../../hooks/usePagination';
import {
  getVendorInitials,
  type SetupVendor,
  type VendorStatusFilter,
} from '../../data/vendorSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type VendorDirectoryViewProps = {
  vendors: SetupVendor[];
  search: string;
  statusFilter: VendorStatusFilter;
  selectedIds: Set<string>;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: VendorStatusFilter) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onImport: () => void;
  onAiInvoice: () => void;
  onOpenPortal: (vendor: SetupVendor) => void;
  onToggleSelect: (id: string, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean, ids: string[]) => void;
  onBulkActivate: (active: boolean) => void;
  onBulkArchive: (archived: boolean) => void;
  onBulkDelete: () => void;
};

export function VendorDirectoryView({
  vendors,
  search,
  statusFilter,
  selectedIds,
  onSearchChange,
  onStatusFilterChange,
  onSelect,
  onCreate,
  onImport,
  onAiInvoice,
  onOpenPortal,
  onToggleSelect,
  onToggleSelectAll,
  onBulkActivate,
  onBulkArchive,
  onBulkDelete,
}: VendorDirectoryViewProps) {
  const query = search.trim().toLowerCase();
  const filtered = vendors.filter((vendor) => {
    if (statusFilter === 'active' && (!vendor.active || vendor.archived)) return false;
    if (statusFilter === 'archived' && !vendor.archived) return false;
    if (statusFilter === 'approved' && !vendor.approved) return false;
    if (!query) return true;
    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.vendorCode.toLowerCase().includes(query) ||
      vendor.email.toLowerCase().includes(query) ||
      vendor.phone.toLowerCase().includes(query)
    );
  });

  const pagination = usePagination(filtered, { resetKey: `${search}-${statusFilter}` });
  const { paginatedItems } = pagination;

  const activeCount = vendors.filter((v) => v.active && !v.archived).length;
  const archivedCount = vendors.filter((v) => v.archived).length;
  const approvedCount = vendors.filter((v) => v.approved).length;

  const allVisibleSelected =
    paginatedItems.length > 0 && paginatedItems.every((v) => selectedIds.has(v.id));
  const someVisibleSelected =
    paginatedItems.some((v) => selectedIds.has(v.id)) && !allVisibleSelected;

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
          <StatChip label="Total vendors" value={vendors.length} />
          <StatChip label="Active" value={activeCount} accent="green" />
          <StatChip label="Approved" value={approvedCount} />
          <StatChip label="Archived" value={archivedCount} accent="muted" />
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
              placeholder="Search vendors…"
              aria-label="Search vendors"
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
          <button type="button" onClick={onImport} style={outlineBtnStyle}>
            <Upload size={15} aria-hidden />
            Import vendor
          </button>
          <button type="button" onClick={onAiInvoice} style={outlineBtnStyle}>
            <Sparkles size={15} aria-hidden />
            AI invoice
          </button>
          <button type="button" onClick={onCreate} style={primaryBtnStyle}>
            <Plus size={16} strokeWidth={2.25} aria-hidden />
            New vendor
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
          <OutlineBtn onClick={() => onBulkArchive(true)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Archive size={14} aria-hidden />
              Archive
            </span>
          </OutlineBtn>
          <button
            type="button"
            onClick={onBulkDelete}
            aria-label="Delete selected vendors"
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
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1040px' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
              <th style={{ ...thStyle, width: '44px' }}>
                <Checkbox
                  checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                  onCheckedChange={(c) =>
                    onToggleSelectAll(
                      c === true,
                      paginatedItems.map((v) => v.id),
                    )
                  }
                  aria-label="Select all vendors on page"
                />
              </th>
              <th style={thStyle}>
                <SortLabel>Vendor</SortLabel>
              </th>
              <th style={{ ...thStyle, width: '130px' }}>Type</th>
              <th style={thStyle}>
                <SortLabel>Contact</SortLabel>
              </th>
              <th style={thStyle}>
                <SortLabel>Rating</SortLabel>
              </th>
              <th style={thStyle}>
                <SortLabel>Status</SortLabel>
              </th>
              <th style={{ ...thStyle, width: '180px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '56px 24px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
                    {vendors.length === 0 ? 'No vendors yet' : 'No matching vendors'}
                  </p>
                  <p style={{ margin: '6px 0 16px', fontSize: '13px', color: '#64748B' }}>
                    {vendors.length === 0
                      ? 'Add your first vendor to manage procurement relationships.'
                      : 'Try adjusting your search or filter.'}
                  </p>
                  {vendors.length === 0 && (
                    <button type="button" onClick={onCreate} style={primaryBtnStyle}>
                      <Plus size={16} aria-hidden />
                      New vendor
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedItems.map((vendor) => (
                <tr
                  key={vendor.id}
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
                      checked={selectedIds.has(vendor.id)}
                      onCheckedChange={(c) => onToggleSelect(vendor.id, c === true)}
                      aria-label={`Select ${vendor.name}`}
                    />
                  </td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => onSelect(vendor.id)}
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
                          background: getVendorAvatarStyle(vendor.name).bg,
                          color: getVendorAvatarStyle(vendor.name).color,
                          border: `1px solid ${getVendorAvatarStyle(vendor.name).border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {getVendorInitials(vendor)}
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
                          {vendor.name}
                        </span>
                        <span style={{ display: 'block', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          {vendor.vendorCode}
                        </span>
                      </span>
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <VendorTypeBadges vendor={vendor} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {vendor.email && (
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
                          {vendor.email}
                        </span>
                      )}
                      {vendor.phone && (
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
                          {vendor.phone}
                        </span>
                      )}
                      {!vendor.email && !vendor.phone && (
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <RatingStars value={vendor.rating} readOnly size={14} />
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {vendor.archived ? (
                        <TagBadge label="Archived" tone="muted" />
                      ) : vendor.active ? (
                        <TagBadge label="Active" tone="green" />
                      ) : (
                        <TagBadge label="Inactive" tone="muted" />
                      )}
                      {vendor.approved && <TagBadge label="Approved" tone="blue" />}
                      {vendor.assigned && <TagBadge label="Assigned" tone="slate" />}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => onSelect(vendor.id)}
                        style={actionBtnStyle}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenPortal(vendor)}
                        title={`Open ${vendor.name} vendor portal`}
                        style={{
                          ...actionBtnStyle,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <ExternalLink size={13} aria-hidden />
                        Portal
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <ListPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          rangeStart={pagination.rangeStart}
          rangeEnd={pagination.rangeEnd}
          totalItems={filtered.length}
          onPageChange={pagination.setPage}
        />
      )}
    </section>
  );
}

function getVendorAvatarStyle(name: string) {
  const palette = [
    { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
    { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
    { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  ];
  const index = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length;
  return palette[index];
}

function RatingStars({
  value,
  readOnly,
  size = 16,
  onChange,
}: {
  value: number;
  readOnly?: boolean;
  size?: number;
  onChange?: (value: number) => void;
}) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }} role={readOnly ? 'img' : 'group'} aria-label={`Rating ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            aria-label={readOnly ? undefined : `Rate ${star} stars`}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: readOnly ? 'default' : 'pointer',
              color: filled ? '#F59E0B' : '#CBD5E1',
              display: 'inline-flex',
            }}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} aria-hidden />
          </button>
        );
      })}
    </span>
  );
}

function VendorTypeBadges({ vendor }: { vendor: SetupVendor }) {
  if (!vendor.isPunchout && !vendor.markAsCc) {
    return <span style={{ color: '#94A3B8', fontSize: '12px' }}>—</span>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
      {vendor.isPunchout && <PunchoutBadge />}
      {vendor.markAsCc && <CreditCardBadge />}
    </div>
  );
}

function PunchoutBadge() {
  return (
    <span
      title="Punchout vendor"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: '#EFF6FF',
        color: '#1D4ED8',
        border: '1px solid #BFDBFE',
      }}
    >
      <ShoppingBag size={11} aria-hidden />
      Punchout
    </span>
  );
}

function CreditCardBadge() {
  return (
    <span
      title="Credit card vendor"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: '#FFF7ED',
        color: '#C2410C',
        border: '1px solid #FED7AA',
      }}
    >
      <CreditCard size={11} aria-hidden />
      CC
    </span>
  );
}

function TagBadge({
  label,
  tone,
}: {
  label: string;
  tone: 'green' | 'blue' | 'slate' | 'muted';
}) {
  const styles = {
    green: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
    blue: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    slate: { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' },
    muted: { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' },
  }[tone];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
      }}
    >
      {label}
    </span>
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
        background: '#FAFBFC',
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
          color: accent === 'green' ? P2P_BRAND.primaryStrong : accent === 'muted' ? '#64748B' : '#0F172A',
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
  value: VendorStatusFilter;
  onChange: (v: VendorStatusFilter) => void;
}) {
  const options: { id: VendorStatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'approved', label: 'Approved' },
    { id: 'archived', label: 'Archived' },
  ];
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: '3px',
        borderRadius: '9px',
        background: '#F1F5F9',
        border: '1px solid #E2E8F0',
        flexWrap: 'wrap',
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

const outlineBtnStyle: React.CSSProperties = {
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

const actionBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: `1px solid ${P2P_BRAND.surfaceBorder}`,
  borderRadius: '8px',
  background: '#FFFFFF',
  color: P2P_BRAND.primaryStrong,
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};

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
