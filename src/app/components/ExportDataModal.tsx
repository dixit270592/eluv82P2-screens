import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { X, ChevronDown, Download, Check, Minus } from 'lucide-react';
import { toast } from 'sonner';

import { UI_FONT_STACK as F } from '../tokens/typography';
import { P2P_BRAND } from '../tokens/brand';
import {
  EXPORT_DATASETS,
  EXPORT_FORMATS,
  getColumnsForDataset,
  getRequestTypesForDataset,
  type ExportDatasetId,
  type ExportFormatId,
} from '../data/exportDataConfig';

const TOKENS = {
  border: '#E4E7EC',
  borderInput: '#D0D5DD',
  text: '#101828',
  textMuted: '#667085',
  textSecondary: '#475467',
  surface: '#FFFFFF',
  surfaceMuted: '#F9FAFB',
  overlay: 'rgba(16,24,40,0.45)',
  headerRule: '#EEF1F5',
  shadow: '0 10px 40px rgba(16,24,40,0.2)',
  focusRing: P2P_BRAND.primary,
} as const;

export interface ExportDataPayload {
  dataset: ExportDatasetId;
  requestTypes: string[];
  format: ExportFormatId;
  columns: string[];
}

export interface ExportDataModalProps {
  onClose: () => void;
  onExport?: (payload: ExportDataPayload) => void;
}

function ReqMark() {
  return (
    <span style={{ color: '#F04438', marginLeft: 2 }} aria-hidden>
      *
    </span>
  );
}

function ExportCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
  bold,
  id,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
  bold?: boolean;
  id?: string;
}) {
  const active = checked || indeterminate;

  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        fontSize: bold ? '13px' : '13px',
        fontWeight: bold ? 600 : 400,
        color: bold ? TOKENS.text : TOKENS.textSecondary,
        fontFamily: F,
        lineHeight: 1.4,
        userSelect: 'none',
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          minWidth: 18,
          borderRadius: 5,
          border: `2px solid ${active ? TOKENS.focusRing : TOKENS.borderInput}`,
          background: active ? TOKENS.focusRing : TOKENS.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          transition: 'background 0.12s, border-color 0.12s',
        }}
      >
        {checked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
        {!checked && indeterminate && <Minus size={12} color="#FFFFFF" strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </label>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: 600,
        color: TOKENS.textSecondary,
        fontFamily: F,
        marginBottom: 6,
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </span>
  );
}

function SelectField({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { id: string; label: string }[];
}) {
  const [focused, setFocused] = useState(false);

  const wrap: CSSProperties = {
    position: 'relative',
    width: '100%',
  };

  const select: CSSProperties = {
    width: '100%',
    height: 40,
    border: `1px solid ${focused ? TOKENS.focusRing : TOKENS.borderInput}`,
    borderRadius: 8,
    padding: '0 36px 0 12px',
    fontSize: '13px',
    color: TOKENS.text,
    fontFamily: F,
    outline: 'none',
    background: TOKENS.surface,
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: focused ? `0 0 0 3px rgba(31, 169, 122, 0.12)` : 'none',
  };

  return (
    <div style={wrap}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={select}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        color={TOKENS.textMuted}
        strokeWidth={2}
        aria-hidden
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      />
    </div>
  );
}

export function ExportDataModal({ onClose, onExport }: ExportDataModalProps) {
  const [dataset, setDataset] = useState<ExportDatasetId>('purchase-request');
  const [format, setFormat] = useState<ExportFormatId>('xlsx');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(() => new Set());
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(() => new Set());

  const columns = useMemo(() => getColumnsForDataset(dataset), [dataset]);
  const requestTypes = useMemo(() => getRequestTypesForDataset(dataset), [dataset]);

  const selectedCount = selectedColumns.size;
  const totalCount = columns.length;
  const allColumnsSelected = selectedCount === totalCount && totalCount > 0;
  const someColumnsSelected = selectedCount > 0 && !allColumnsSelected;

  const canExport = selectedCount > 0;

  useEffect(() => {
    setSelectedColumns(new Set());
    setSelectedTypes(new Set());
  }, [dataset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleColumn = useCallback((column: string) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      return next;
    });
  }, []);

  const toggleRequestType = useCallback((type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const toggleAllColumns = useCallback(() => {
    setSelectedColumns((prev) => {
      if (prev.size === columns.length) return new Set();
      return new Set(columns);
    });
  }, [columns]);

  const handleExport = useCallback(() => {
    if (!canExport) return;

    const payload: ExportDataPayload = {
      dataset,
      requestTypes: requestTypes ? Array.from(selectedTypes) : [],
      format,
      columns: Array.from(selectedColumns),
    };

    onExport?.(payload);

    const datasetLabel = EXPORT_DATASETS.find((d) => d.id === dataset)?.label ?? dataset;
    toast.success('Export started', {
      description: `${payload.columns.length} columns from ${datasetLabel} will download as ${EXPORT_FORMATS.find((f) => f.id === format)?.label ?? format}.`,
    });

    onClose();
  }, [canExport, dataset, format, onClose, onExport, requestTypes, selectedColumns, selectedTypes]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        background: TOKENS.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 'clamp(12px, 3vw, 24px)',
        backdropFilter: 'blur(2px)',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-data-title"
        style={{
          width: '100%',
          maxWidth: 1000,
          minWidth: 0,
          maxHeight: 'min(95vh, 1000px)',
          background: TOKENS.surface,
          borderRadius: 12,
          boxShadow: TOKENS.shadow,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: F,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '28px 32px 24px',
            borderBottom: `1px solid ${TOKENS.headerRule}`,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <h2
              id="export-data-title"
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 700,
                color: TOKENS.text,
                fontFamily: F,
                lineHeight: 1.2,
              }}
            >
              Export Data
            </h2>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: '14px',
                color: TOKENS.textMuted,
                fontFamily: F,
                lineHeight: 1.5,
              }}
            >
              Select the dataset, file format, and columns you want to export.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              border: 'none',
              background: 'transparent',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = TOKENS.surfaceMuted;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <X size={20} color={TOKENS.textMuted} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Configuration Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 700,
                color: TOKENS.textMuted,
                fontFamily: F,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Export Settings
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {/* Dataset */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="export-dataset"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: TOKENS.text,
                    fontFamily: F,
                  }}
                >
                  Dataset <ReqMark />
                </label>
                <SelectField
                  id="export-dataset"
                  value={dataset}
                  onChange={(v) => setDataset(v as ExportDatasetId)}
                  options={EXPORT_DATASETS}
                />
              </div>

              {/* Export Format */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  htmlFor="export-format"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: TOKENS.text,
                    fontFamily: F,
                  }}
                >
                  Export Format <ReqMark />
                </label>
                <SelectField
                  id="export-format"
                  value={format}
                  onChange={(v) => setFormat(v as ExportFormatId)}
                  options={EXPORT_FORMATS}
                />
              </div>
            </div>

            {/* Request Types */}
            {requestTypes && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: TOKENS.text,
                    fontFamily: F,
                  }}
                >
                  Purchase Request Types
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '14px 20px',
                  }}
                >
                  {requestTypes.map((type) => (
                    <ExportCheckbox
                      key={type}
                      id={`pr-type-${type}`}
                      checked={selectedTypes.has(type)}
                      onChange={() => toggleRequestType(type)}
                      label={type}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columns Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 700,
                    color: TOKENS.textMuted,
                    fontFamily: F,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Export Columns ({totalCount} total)
                </h3>
              </div>
              {selectedCount > 0 && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: P2P_BRAND.primaryStrong,
                    fontFamily: F,
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: P2P_BRAND.surface,
                    border: `1px solid ${P2P_BRAND.surfaceBorder}`,
                  }}
                >
                  {selectedCount} selected
                </span>
              )}
            </div>

            {selectedCount === 0 && (
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: TOKENS.textMuted,
                  fontFamily: F,
                  lineHeight: 1.5,
                }}
              >
                Pick columns below, or use Select All ({totalCount}).
              </p>
            )}

            {/* Select All row */}
            <div style={{ paddingBottom: 12, borderBottom: `1.5px solid ${TOKENS.border}` }}>
              <ExportCheckbox
                id="export-select-all"
                checked={allColumnsSelected}
                indeterminate={someColumnsSelected}
                onChange={toggleAllColumns}
                label={`Select All (${totalCount})`}
                bold
              />
            </div>

            {/* Columns Grid - Always visible with 4 columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '14px 18px',
              }}
            >
              {columns.map((column) => (
                <ExportCheckbox
                  key={column}
                  id={`col-${column}`}
                  checked={selectedColumns.has(column)}
                  onChange={() => toggleColumn(column)}
                  label={column}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '24px 36px 32px',
            borderTop: `1px solid ${TOKENS.headerRule}`,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: 42,
              padding: '0 24px',
              background: TOKENS.surface,
              color: TOKENS.textSecondary,
              border: `1.5px solid ${TOKENS.borderInput}`,
              borderRadius: 8,
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: F,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = TOKENS.surfaceMuted;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = TOKENS.surface;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!canExport}
            style={{
              height: 42,
              padding: '0 24px',
              background: canExport ? P2P_BRAND.primary : '#A1A7B3',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: F,
              cursor: canExport ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
              boxShadow: canExport ? '0 2px 8px rgba(31, 169, 122, 0.2)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (canExport) {
                (e.currentTarget as HTMLButtonElement).style.background = P2P_BRAND.primaryHover;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(31, 169, 122, 0.28)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (canExport) {
                (e.currentTarget as HTMLButtonElement).style.background = P2P_BRAND.primary;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(31, 169, 122, 0.2)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }
            }}
          >
            <Download size={16} strokeWidth={2.2} aria-hidden />
            Export
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
