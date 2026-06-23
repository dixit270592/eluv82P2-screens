import { FileText, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import { DeleteConfirmPopover } from './DeleteConfirmPopover';

type LineItemSelectionBarProps = {
  count: number;
  disabled?: boolean;
  showRequestQuote?: boolean;
  deletePending?: boolean;
  onClear: () => void;
  onRequestQuote?: () => void;
  onDelete: () => void;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
};

export function LineItemSelectionBar({
  count,
  disabled,
  showRequestQuote,
  deletePending = false,
  onClear,
  onRequestQuote,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}: LineItemSelectionBarProps) {
  if (count <= 0) return null;

  return (
    <div style={barStyle}>
      <span style={countStyle}>
        {count} selected
      </span>
      <button type="button" onClick={onClear} style={linkButtonStyle}>
        Clear
      </button>

      <div style={{ flex: 1, minWidth: '8px' }} />

      <div style={actionsGroupStyle}>
        {showRequestQuote && onRequestQuote && (
          <button
            type="button"
            onClick={onRequestQuote}
            disabled={disabled}
            style={actionButtonStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <FileText size={14} color="#667085" strokeWidth={2} aria-hidden />
            Request for Quote
          </button>
        )}
        {showRequestQuote && onRequestQuote && (
          <span style={dividerStyle} aria-hidden />
        )}
        <div
          style={{ position: 'relative', display: 'inline-flex' }}
          data-delete-confirm={deletePending ? true : undefined}
        >
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            style={actionButtonStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <Trash2 size={14} color="#667085" strokeWidth={2} aria-hidden />
            Delete line item{count !== 1 ? 's' : ''}
          </button>
          <AnimatePresence>
            {deletePending && onConfirmDelete && onCancelDelete && (
              <DeleteConfirmPopover
                count={count}
                placement="below"
                onConfirm={onConfirmDelete}
                onCancel={onCancelDelete}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const barStyle: React.CSSProperties = {
  padding: '7px 16px',
  borderBottom: '1px solid #EEF1F5',
  background: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  flexShrink: 0,
  position: 'relative',
  zIndex: 2,
};

const countStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: '#667085',
  fontFamily: F,
};

const linkButtonStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  fontSize: '12px',
  fontWeight: 500,
  color: '#98A2B3',
  fontFamily: F,
  cursor: 'pointer',
  padding: '2px 0',
};

const actionsGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flexWrap: 'wrap',
};

const actionButtonStyle: React.CSSProperties = {
  height: '28px',
  padding: '0 8px',
  background: 'transparent',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 500,
  color: '#344054',
  fontFamily: F,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const dividerStyle: React.CSSProperties = {
  width: '1px',
  height: '16px',
  background: '#E4E7EC',
  margin: '0 4px',
};
