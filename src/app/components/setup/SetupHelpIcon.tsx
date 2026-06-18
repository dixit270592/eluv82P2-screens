import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type SetupHelpIconProps = {
  label: string;
  className?: string;
};

export function SetupHelpIcon({ label, className }: SetupHelpIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={className}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            padding: 0,
            border: 'none',
            borderRadius: '50%',
            background: 'transparent',
            color: '#94A3B8',
            cursor: 'help',
            flexShrink: 0,
            verticalAlign: 'middle',
            fontFamily: F,
          }}
        >
          <HelpCircle size={14} strokeWidth={2} aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={6}
        className="max-w-[260px] border border-[#E4E7EC] bg-[#0F172A] px-3 py-2 text-[12px] leading-relaxed text-white shadow-lg"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

type FieldLabelWithHelpProps = {
  label: string;
  help: string;
  children?: React.ReactNode;
};

export function FieldLabelWithHelp({ label, help, children }: FieldLabelWithHelpProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: children ? '6px' : 0 }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{label}</span>
      <SetupHelpIcon label={help} />
      {children}
    </div>
  );
}
