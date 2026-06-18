import { Checkbox } from '../ui/checkbox';
import { PrOptionHelp } from './PrOptionHelp';

const CHECKBOX_CLASS =
  'size-[18px] shrink-0 rounded-[5px] border-[#D0D5DD] data-[state=checked]:border-[var(--p2p-brand)] data-[state=checked]:bg-[var(--p2p-brand)] data-[state=checked]:text-white';

export type SetupOptionRowProps = {
  id: string;
  helpId: string;
  helpText?: string;
  label: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  disabledHint?: string;
  children?: React.ReactNode;
  /** Renders in a right column on the same row (split layout). */
  sideContent?: React.ReactNode;
  /** When true, side column stays visible but dimmed while unchecked. */
  showSideWhenUnchecked?: boolean;
};

export function SetupOptionGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 xl:grid-cols-2" style={{ alignItems: 'start' }}>
      {children}
    </div>
  );
}

export function SetupOptionRow({
  id,
  helpId,
  helpText,
  label,
  checked,
  onCheckedChange,
  disabled,
  disabledHint,
  children,
  sideContent,
  showSideWhenUnchecked = false,
}: SetupOptionRowProps) {
  const hasSplit = Boolean(sideContent);
  const showSide = hasSplit && (checked || showSideWhenUnchecked);

  return (
    <div style={{ borderBottom: '1px solid #F1F5F9' }}>
      <div
        style={{
          display: hasSplit ? 'grid' : 'flex',
          gridTemplateColumns: hasSplit ? 'minmax(220px, 38%) minmax(0, 1fr)' : undefined,
          alignItems: hasSplit ? 'start' : 'center',
          justifyContent: hasSplit ? undefined : 'space-between',
          gap: hasSplit ? '20px 28px' : '16px',
          padding: '11px 0',
          opacity: disabled ? 0.45 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
          <Checkbox
            id={id}
            checked={checked}
            disabled={disabled}
            onCheckedChange={(value) => onCheckedChange(value === true)}
            className={`${CHECKBOX_CLASS} mt-0.5`}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <label
                htmlFor={id}
                style={{
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.45,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {label}
              </label>
              {helpText ? <PrOptionHelp helpId={helpId} text={helpText} /> : null}
            </div>
            {disabled && disabledHint ? (
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8', lineHeight: 1.4 }}>{disabledHint}</p>
            ) : null}
          </div>
        </div>

        {showSide ? (
          <div
            style={{
              minWidth: 0,
              width: '100%',
              opacity: checked ? 1 : 0.5,
              pointerEvents: checked ? 'auto' : 'none',
            }}
          >
            {sideContent}
          </div>
        ) : null}

        {!hasSplit && children ? <div style={{ flexShrink: 0 }}>{children}</div> : null}
      </div>
    </div>
  );
}
