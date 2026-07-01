import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { ValidationResult, ValidationRowStatus } from '../../../types/globalImport';
import { statCardStyle, tableTdStyle, tableThStyle } from './importWizardStyles';
import { P2P_BRAND } from '../../../tokens/brand';

type PreviewValidationStepProps = {
  validation: ValidationResult | null;
  compact?: boolean;
};

type StatusFilter = 'all' | ValidationRowStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string; countKey: keyof Pick<ValidationResult, 'totalRecords' | 'validRecords' | 'warningCount' | 'invalidRecords'> }[] = [
  { id: 'all', label: 'All rows', countKey: 'totalRecords' },
  { id: 'valid', label: 'Valid', countKey: 'validRecords' },
  { id: 'warning', label: 'Warnings', countKey: 'warningCount' },
  { id: 'invalid', label: 'Errors', countKey: 'invalidRecords' },
];

const TAB_COUNT_VARIANT: Record<StatusFilter, StatVariant> = {
  all: 'total',
  valid: 'valid',
  warning: 'warning',
  invalid: 'invalid',
};

function rowBackground(status: ValidationRowStatus): string {
  if (status === 'invalid') return '#FEF3F2';
  if (status === 'warning') return '#FFFAF5';
  return '#FFFFFF';
}

export function PreviewValidationStep({
  validation,
  compact = false,
}: PreviewValidationStepProps) {
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filteredRows = useMemo(() => {
    if (!validation) return [];
    if (filter === 'all') return validation.rows;
    return validation.rows.filter((row) => row.status === filter);
  }, [validation, filter]);

  if (!validation) {
    return (
      <p style={{ margin: 0, fontSize: '13px', color: '#667085' }}>
        Validation results will appear here after field mapping is confirmed.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '8px' : '18px' }}>
      {!compact && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={statCardStyle('#667085')}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
              Total records
            </div>
            <div style={{ marginTop: '6px', fontSize: '22px', fontWeight: 700, color: '#101828' }}>
              {validation.totalRecords}
            </div>
          </div>
          <div style={statCardStyle(P2P_BRAND.primary)}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
              Valid records
            </div>
            <div style={{ marginTop: '6px', fontSize: '22px', fontWeight: 700, color: P2P_BRAND.primaryStrong }}>
              {validation.validRecords}
            </div>
          </div>
          <div style={statCardStyle('#F04438')}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
              Invalid records
            </div>
            <div style={{ marginTop: '6px', fontSize: '22px', fontWeight: 700, color: '#B42318' }}>
              {validation.invalidRecords}
            </div>
          </div>
          <div style={statCardStyle('#F79009')}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#667085', textTransform: 'uppercase' }}>
              Warning count
            </div>
            <div style={{ marginTop: '6px', fontSize: '22px', fontWeight: 700, color: '#B54708' }}>
              {validation.warningCount}
            </div>
          </div>
        </div>
      )}

      <ValidationFilterTabs
        filter={filter}
        validation={validation}
        compact={compact}
        onFilterChange={setFilter}
      />

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '640px',
            borderTop: '1px solid #E4E7EC',
          }}
        >
          <thead>
            <tr>
              <th style={{ ...tableThStyle, width: '72px' }}>Row</th>
              <th style={{ ...tableThStyle, width: '96px' }}>Status</th>
              {validation.columns.map((column) => (
                <th key={column} style={tableThStyle}>
                  {column}
                </th>
              ))}
              <th style={tableThStyle}>Issues</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={validation.columns.length + 3}
                  style={{ ...tableTdStyle, textAlign: 'center', color: '#667085', padding: '32px' }}
                >
                  No rows match the selected filter.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr key={row.rowIndex} style={{ background: rowBackground(row.status) }}>
                  <td style={{ ...tableTdStyle, color: '#667085' }}>{row.rowIndex}</td>
                  <td style={tableTdStyle}>
                    <StatusBadge status={row.status} />
                  </td>
                  {validation.columns.map((column) => (
                    <td key={column} style={tableTdStyle}>
                      {String(row.data[column] ?? '')}
                    </td>
                  ))}
                  <td style={{ ...tableTdStyle, fontSize: '12px', color: '#667085', maxWidth: '220px' }}>
                    {[...row.errors, ...row.warnings].join(' · ') || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ValidationFilterTabs({
  filter,
  validation,
  compact,
  onFilterChange,
}: {
  filter: StatusFilter;
  validation: ValidationResult;
  compact: boolean;
  onFilterChange: (filter: StatusFilter) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter validation rows"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        borderBottom: '1px solid #E4E7EC',
        overflowX: compact ? 'auto' : undefined,
      }}
    >
      {STATUS_FILTERS.map((item) => {
        const active = filter === item.id;
        const count = validation[item.countKey];
        const countVariant = TAB_COUNT_VARIANT[item.id];
        const countColors = STAT_VARIANT_STYLES[countVariant];

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onFilterChange(item.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: compact ? '8px 14px' : '10px 16px',
              border: 'none',
              borderBottom: active ? `2px solid ${P2P_BRAND.primary}` : '2px solid transparent',
              marginBottom: '-1px',
              background: 'transparent',
              fontSize: '12px',
              fontWeight: active ? 600 : 500,
              color: active ? P2P_BRAND.primaryStrong : '#667085',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {item.label}
            <span
              aria-label={`${count} ${item.label.toLowerCase()}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '20px',
                padding: '1px 6px',
                borderRadius: '999px',
                border: `1px solid ${countColors.border}`,
                background: active ? countColors.background : '#F9FAFB',
                color: countColors.valueColor,
                fontSize: '11px',
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

type StatVariant = 'total' | 'valid' | 'invalid' | 'warning';

const STAT_VARIANT_STYLES: Record<
  StatVariant,
  { background: string; border: string; labelColor: string; valueColor: string }
> = {
  total: {
    background: '#F2F4F7',
    border: '#E4E7EC',
    labelColor: '#667085',
    valueColor: '#344054',
  },
  valid: {
    background: P2P_BRAND.surface,
    border: P2P_BRAND.surfaceBorder,
    labelColor: '#0E7A54',
    valueColor: P2P_BRAND.primaryStrong,
  },
  invalid: {
    background: '#FEF3F2',
    border: '#FECDCA',
    labelColor: '#B42318',
    valueColor: '#912018',
  },
  warning: {
    background: '#FFFAF5',
    border: '#FEDF89',
    labelColor: '#B54708',
    valueColor: '#93370D',
  },
};

function StatusBadge({ status }: { status: ValidationRowStatus }) {
  if (status === 'valid') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: P2P_BRAND.primaryStrong, fontSize: '12px', fontWeight: 600 }}>
        <CheckCircle2 size={14} aria-hidden />
        Valid
      </span>
    );
  }
  if (status === 'warning') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#B54708', fontSize: '12px', fontWeight: 600 }}>
        <AlertTriangle size={14} aria-hidden />
        Warning
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#B42318', fontSize: '12px', fontWeight: 600 }}>
      <XCircle size={14} aria-hidden />
      Error
    </span>
  );
}
