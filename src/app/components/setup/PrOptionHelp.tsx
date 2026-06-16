import { CircleHelp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type PrOptionHelpProps = {
  helpId: string;
  text: string;
  optionLabel?: string;
};

export function PrOptionHelp({ helpId, text, optionLabel }: PrOptionHelpProps) {
  const ariaLabel = optionLabel ? `Help: ${optionLabel}` : `Help for option ${helpId}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            padding: 0,
            margin: 0,
            border: 'none',
            borderRadius: '999px',
            background: 'transparent',
            color: '#94A3B8',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#64748B';
            e.currentTarget.style.background = '#F1F5F9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94A3B8';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <CircleHelp size={14} strokeWidth={2} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        className="w-[min(320px,calc(100vw-2rem))] border-[#E4E7EC] p-3 shadow-lg"
        style={{ fontFamily: F }}
      >
        <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.55 }}>{text}</p>
      </PopoverContent>
    </Popover>
  );
}

type PrOptionSectionHeaderProps = {
  title: string;
  description: string;
  isFirst?: boolean;
};

export function PrOptionSectionHeader({ title, description, isFirst }: PrOptionSectionHeaderProps) {
  return (
    <div
      style={{
        padding: isFirst ? '12px 0 6px' : '20px 0 6px',
        marginTop: isFirst ? 0 : '4px',
        borderTop: isFirst ? 'none' : '1px solid #EEF1F5',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: '11px',
          fontWeight: 700,
          color: '#64748B',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h2>
      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94A3B8', lineHeight: 1.45, maxWidth: '72ch' }}>
        {description}
      </p>
    </div>
  );
}
