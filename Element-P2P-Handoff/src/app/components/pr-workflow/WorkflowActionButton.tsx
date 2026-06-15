import { UI_FONT_STACK as F } from '../../tokens/typography';
import { WF } from './workflowTokens';

type ButtonVariant = 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'outline-amber';

const colorMap: Record<
  ButtonVariant,
  { bg: string; hover: string; text: string; border?: string; shadow?: string }
> = {
  blue: { bg: '#2D9CDB', hover: '#1A7AB8', text: '#FFFFFF', shadow: '0 1px 2px rgba(45, 156, 219, 0.25)' },
  green: { bg: '#1FA97A', hover: '#178F67', text: '#FFFFFF', shadow: '0 1px 2px rgba(31, 169, 122, 0.28)' },
  amber: { bg: '#D97706', hover: '#B45309', text: '#FFFFFF', shadow: '0 1px 2px rgba(217, 119, 6, 0.25)' },
  red: { bg: '#F04438', hover: '#D92D20', text: '#FFFFFF', shadow: '0 1px 2px rgba(240, 68, 56, 0.25)' },
  gray: { bg: '#FFFFFF', hover: '#F9FAFB', text: '#344054', border: '1px solid #D0D5DD' },
  'outline-amber': {
    bg: '#FFFFFF',
    hover: '#FFFBEB',
    text: '#B45309',
    border: '1px solid #FDE68A',
  },
};

interface WorkflowActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  variant: ButtonVariant;
  disabled?: boolean;
  children: React.ReactNode;
}

export function WorkflowActionButton({
  onClick,
  icon,
  variant,
  disabled,
  children,
}: WorkflowActionButtonProps) {
  const colors = colorMap[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height: WF.btnHeight,
        padding: '0 14px',
        background: disabled ? '#98A2B3' : colors.bg,
        border: colors.border || 'none',
        borderRadius: 5,
        fontSize: '12px',
        fontWeight: 600,
        color: disabled ? '#FFFFFF' : colors.text,
        fontFamily: F,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        transition: 'background 0.12s, box-shadow 0.12s, transform 0.1s',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        boxShadow: disabled ? 'none' : colors.shadow || 'none',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLElement).style.background = colors.hover;
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLElement).style.background = colors.bg;
      }}
    >
      {icon}
      {children}
    </button>
  );
}
