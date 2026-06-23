import { motion } from 'motion/react';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type DeleteConfirmPopoverProps = {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  /** Popover opens upward when there isn't room below (e.g. last table row). */
  placement?: 'below' | 'above';
};

function getMessage(count: number) {
  if (count === 1) return 'Are you sure you want to delete this item?';
  return `Are you sure you want to delete these ${count} items?`;
}

export function DeleteConfirmPopover({
  count,
  onConfirm,
  onCancel,
  placement = 'below',
}: DeleteConfirmPopoverProps) {
  return (
    <motion.div
      role="alertdialog"
      aria-labelledby="delete-confirm-label"
      initial={{ opacity: 0, y: placement === 'below' ? -4 : 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: placement === 'below' ? -2 : 2, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute',
        right: 0,
        ...(placement === 'below'
          ? { top: 'calc(100% + 6px)' }
          : { bottom: 'calc(100% + 6px)' }),
        zIndex: 30,
        width: 'max-content',
        maxWidth: 'min(280px, calc(100vw - 24px))',
        padding: '10px 12px',
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(16,24,40,0.1)',
        fontFamily: F,
      }}
      data-delete-confirm
      onClick={(e) => e.stopPropagation()}
    >
      <p
        id="delete-confirm-label"
        style={{
          margin: 0,
          fontSize: '12px',
          fontWeight: 500,
          color: '#344054',
          lineHeight: 1.45,
        }}
      >
        {getMessage(count)}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          marginTop: '10px',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            height: '28px',
            padding: '0 12px',
            background: '#FFFFFF',
            border: '1px solid #D0D5DD',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#344054',
            fontFamily: F,
            cursor: 'pointer',
            transition: 'background 0.12s, border-color 0.12s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = '#F9FAFB';
            el.style.borderColor = '#98A2B3';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = '#FFFFFF';
            el.style.borderColor = '#D0D5DD';
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            height: '28px',
            padding: '0 12px',
            background: '#F04438',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#FFFFFF',
            fontFamily: F,
            cursor: 'pointer',
            transition: 'background 0.12s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#D92D20';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#F04438';
          }}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}
