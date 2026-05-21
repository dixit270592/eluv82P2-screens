import { Star } from 'lucide-react';
import { WF } from './workflowTokens';

interface StarButtonProps {
  onClick: () => void;
  active?: boolean;
  title?: string;
  disabled?: boolean;
}

export function StarButton({
  onClick,
  active = false,
  title,
  disabled = false,
}: StarButtonProps) {
  const label = title ?? (active ? 'Remove from starred' : 'Star transaction');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      style={{
        width: WF.btnHeight,
        height: WF.btnHeight,
        border: active ? '1px solid #FDE68A' : '1px solid #D0D5DD',
        borderRadius: 6,
        background: active ? '#FFFBEB' : '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        const el = e.currentTarget as HTMLElement;
        el.style.background = active ? '#FEF3C7' : '#F9FAFB';
        el.style.borderColor = active ? '#F59E0B' : '#1FA97A';
        el.style.boxShadow = active
          ? '0 1px 2px rgba(245, 158, 11, 0.2)'
          : '0 1px 2px rgba(31, 169, 122, 0.12)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = active ? '#FFFBEB' : '#FFFFFF';
        el.style.borderColor = active ? '#FDE68A' : '#D0D5DD';
        el.style.boxShadow = 'none';
      }}
    >
      <Star
        size={13}
        color={active ? '#D97706' : '#667085'}
        strokeWidth={2}
        fill={active ? '#F59E0B' : 'none'}
      />
    </button>
  );
}
