import { Printer } from 'lucide-react';
import { WF } from './workflowTokens';

interface PrintButtonProps {
  onClick: () => void;
  title?: string;
  disabled?: boolean;
}

export function PrintButton({ onClick, title = 'Print transaction', disabled = false }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      style={{
        width: WF.btnHeight,
        height: WF.btnHeight,
        border: '1px solid #D0D5DD',
        borderRadius: 6,
        background: '#FFFFFF',
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
        el.style.background = '#F9FAFB';
        el.style.borderColor = '#1FA97A';
        el.style.boxShadow = '0 1px 2px rgba(31, 169, 122, 0.12)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = '#FFFFFF';
        el.style.borderColor = '#D0D5DD';
        el.style.boxShadow = 'none';
      }}
    >
      <Printer size={13} color="#667085" strokeWidth={2} />
    </button>
  );
}
