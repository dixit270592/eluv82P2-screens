import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

export type LineItemsLayoutVersion = 'v1' | 'v2' | 'v3';

const VERSION_LABELS: Record<LineItemsLayoutVersion, string> = {
  v1: 'V1 · Expandable rows',
  v2: 'V2 · Compact + drawer',
  v3: 'V3 · Auto-populate entity',
};

type LineItemsLayoutToggleProps = {
  value: LineItemsLayoutVersion;
  onChange: (value: LineItemsLayoutVersion) => void;
  compact?: boolean;
};

export function LineItemsLayoutToggle({ value, onChange, compact }: LineItemsLayoutToggleProps) {
  return (
    <div
      role="group"
      aria-label="Line items layout version"
      style={{
        display: 'inline-flex',
        padding: '2px',
        background: '#F2F4F7',
        borderRadius: '7px',
        border: '1px solid #E4E7EC',
        flexShrink: 0,
        flexWrap: 'wrap',
        gap: '2px',
      }}
    >
      {(['v1', 'v2', 'v3'] as const).map((version) => {
        const active = value === version;
        return (
          <button
            key={version}
            type="button"
            onClick={() => onChange(version)}
            aria-pressed={active}
            style={{
              height: compact ? '26px' : '28px',
              padding: compact ? '0 8px' : '0 10px',
              border: 'none',
              borderRadius: '5px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: F,
              cursor: 'pointer',
              background: active ? '#FFFFFF' : 'transparent',
              color: active ? P2P_BRAND.primaryStrong : '#667085',
              boxShadow: active ? '0 1px 2px rgba(16,24,40,0.06)' : 'none',
              transition: 'background 0.12s, color 0.12s, box-shadow 0.12s',
              whiteSpace: 'nowrap',
            }}
          >
            {VERSION_LABELS[version]}
          </button>
        );
      })}
    </div>
  );
}
