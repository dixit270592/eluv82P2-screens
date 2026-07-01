import { useCallback, useRef, useState, type DragEvent } from 'react';
import {
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import type { ImportWizardConfig } from '../../../data/importWizardConfig';
import { downloadSampleCsv } from '../../../services/globalImportService';
import { SampleDataPreviewModal } from './SampleDataPreviewModal';
import {
  collapseToggleStyle,
  dropZoneStyle,
  fileChipStyle,
  helperTextStyle,
  outlineAccentBtnStyle,
  previewIconBtnStyle,
  removeFileBtnStyle,
} from './importWizardStyles';
import { P2P_BRAND } from '../../../tokens/brand';
import { importWizardFont } from './importWizardStyles';

type ImportDataStepProps = {
  config: ImportWizardConfig;
  file: File | null;
  fileError: string | null;
  isProcessing?: boolean;
  processingMessage?: string;
  isPrefetching?: boolean;
  compact?: boolean;
  onFileSelect: (file: File | null) => void;
};

function isAllowedFile(file: File, acceptedFileTypes: string): boolean {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  const allowed = acceptedFileTypes.split(',').map((item) => item.trim().toLowerCase());
  return allowed.includes(extension);
}

export function ImportDataStep({
  config,
  file,
  fileError,
  isProcessing = false,
  processingMessage,
  isPrefetching = false,
  compact = false,
  onFileSelect,
}: ImportDataStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sampleExpanded, setSampleExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const formatsLabel = config.acceptedFileTypes.replace(/\./g, '').toUpperCase();

  const handleDownloadSample = () => {
    downloadSampleCsv(config.sampleFileName, config.sampleColumns, config.sampleRows);
  };

  const acceptFile = useCallback(
    (next: File | null) => {
      if (!next) {
        onFileSelect(null);
        return;
      }
      if (!isAllowedFile(next, config.acceptedFileTypes)) {
        onFileSelect(null);
        return;
      }
      onFileSelect(next);
    },
    [config.acceptedFileTypes, onFileSelect],
  );

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    acceptFile(event.dataTransfer.files?.[0] ?? null);
  };

  const dropZoneInteractive = !file && !isProcessing;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact && file ? '8px' : '20px', fontFamily: importWizardFont }}>
        {compact && file && !isProcessing ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              border: '1px solid #E4E7EC',
              borderRadius: '8px',
              background: '#FAFBFC',
            }}
          >
            <div style={{ ...fileChipStyle, flex: 1, minWidth: 0, border: 'none', background: 'transparent', padding: 0 }}>
              <FileSpreadsheet size={16} color={P2P_BRAND.primaryStrong} aria-hidden />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  textAlign: 'left',
                  fontWeight: 500,
                }}
                title={file.name}
              >
                {file.name}
              </span>
              <span style={{ fontSize: '11px', color: '#98A2B3' }}>
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{ ...outlineAccentBtnStyle, height: '34px', fontSize: '12px', padding: '0 12px' }}
            >
              Replace
            </button>
            <button
              type="button"
              aria-label="Remove uploaded file"
              onClick={() => {
                onFileSelect(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              style={removeFileBtnStyle}
            >
              <Trash2 size={14} aria-hidden />
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={config.acceptedFileTypes}
              style={{ display: 'none' }}
              disabled={isProcessing}
              onChange={(event) => acceptFile(event.target.files?.[0] ?? null)}
            />
          </div>
        ) : (
        <div
          role={dropZoneInteractive ? 'button' : undefined}
          tabIndex={dropZoneInteractive ? 0 : undefined}
          onClick={() => dropZoneInteractive && inputRef.current?.click()}
          onKeyDown={(event) => {
            if (dropZoneInteractive && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!isProcessing) setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={onDrop}
          style={{
            ...dropZoneStyle(isDragging, Boolean(file)),
            minHeight: compact && file ? 'auto' : isDragging || !file ? (compact ? '100px' : '148px') : undefined,
            padding: compact && file ? '10px 12px' : undefined,
          }}
          aria-label={file ? `Uploaded file: ${file.name}` : 'Upload import file drop zone'}
        >
          <input
            ref={inputRef}
            type="file"
            accept={config.acceptedFileTypes}
            style={{ display: 'none' }}
            disabled={isProcessing}
            onChange={(event) => acceptFile(event.target.files?.[0] ?? null)}
          />

          {isProcessing ? (
            <>
              <Loader2
                size={28}
                color={P2P_BRAND.primary}
                aria-hidden
                style={{ animation: 'import-wizard-spin 1s linear infinite' }}
              />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                {processingMessage ?? 'Processing your file…'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#667085' }}>
                Mapping fields and validating data automatically.
              </p>
            </>
          ) : file ? (
            <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <div style={{ ...fileChipStyle, flex: 1, minWidth: 0 }}>
                <FileSpreadsheet size={16} color={P2P_BRAND.primaryStrong} aria-hidden />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    textAlign: 'left',
                  }}
                  title={file.name}
                >
                  {file.name}
                </span>
                <span style={{ fontSize: '11px', color: '#98A2B3' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{ ...outlineAccentBtnStyle, height: '36px', fontSize: '12px' }}
              >
                Replace
              </button>
              <button
                type="button"
                aria-label="Remove uploaded file"
                onClick={() => {
                  onFileSelect(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                style={removeFileBtnStyle}
              >
                <Trash2 size={14} aria-hidden />
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: P2P_BRAND.surface,
                  border: `1px solid ${P2P_BRAND.surfaceBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={20} color={P2P_BRAND.primaryStrong} aria-hidden />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  Drop your file here, or{' '}
                  <span style={{ color: P2P_BRAND.primaryStrong, textDecoration: 'underline' }}>browse</span>
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#667085' }}>
                  {formatsLabel} · Fields map and validate automatically after upload
                </p>
              </div>
            </>
          )}
        </div>
        )}

        {!file && isPrefetching && !isProcessing && (
          <p style={{ margin: 0, fontSize: '12px', color: '#667085' }}>Preparing field definitions…</p>
        )}

        <div aria-live="polite" aria-atomic="true">
          {fileError && (
            <p role="alert" style={{ ...helperTextStyle, color: '#F04438', margin: 0 }}>
              {fileError}
            </p>
          )}
        </div>

        {!compact && (
          <div>
            <button
              type="button"
              onClick={() => setSampleExpanded((prev) => !prev)}
              aria-expanded={sampleExpanded}
              style={collapseToggleStyle}
            >
              <ChevronDown
                size={16}
                aria-hidden
                style={{
                  transform: sampleExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
              Need a template?
            </button>

            {sampleExpanded && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #E4E7EC',
                  background: '#FAFBFC',
                }}
              >
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#667085', lineHeight: 1.45 }}>
                  Download or preview the expected column layout before preparing your file.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  <button type="button" onClick={handleDownloadSample} style={outlineAccentBtnStyle}>
                    <Download size={15} aria-hidden />
                    Download sample file
                  </button>
                  <button
                    type="button"
                    aria-label="Preview sample format"
                    title="Preview sample format"
                    onClick={() => setPreviewOpen(true)}
                    style={previewIconBtnStyle}
                  >
                    <Eye size={16} aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {compact && !file && (
          <button type="button" onClick={() => setPreviewOpen(true)} style={collapseToggleStyle}>
            Need a template?
          </button>
        )}
      </div>

      <SampleDataPreviewModal open={previewOpen} onOpenChange={setPreviewOpen} config={config} />
    </>
  );
}
