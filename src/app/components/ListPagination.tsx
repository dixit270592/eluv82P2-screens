import { ChevronLeft, ChevronRight } from 'lucide-react';
import { P2P_BRAND } from '../tokens/brand';
import { UI_FONT_STACK as F } from '../tokens/typography';

type ListPaginationProps = {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function ListPagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  totalItems,
  onPageChange,
}: ListPaginationProps) {
  if (totalItems === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 20px',
        borderTop: '1px solid #EEF1F5',
        background: '#FAFBFC',
        fontFamily: F,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: '12px', color: '#64748B' }}>
        Showing {rangeStart}–{rangeEnd} of {totalItems}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <PageButton
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} aria-hidden />
        </PageButton>

        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', minWidth: '72px', textAlign: 'center' }}>
          Page {page} of {totalPages}
        </span>

        <PageButton
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} aria-hidden />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  disabled,
  onClick,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  'aria-label': string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: '1px solid #E4E7EC',
        borderRadius: '8px',
        background: '#FFFFFF',
        color: disabled ? '#CBD5E1' : P2P_BRAND.primaryStrong,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}
