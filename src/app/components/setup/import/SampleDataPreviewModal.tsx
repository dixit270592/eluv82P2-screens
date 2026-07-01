import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ImportWizardConfig } from '../../../data/importWizardConfig';
import {
  copySampleCsvToClipboard,
  downloadSampleCsv,
} from '../../../services/globalImportService';
import {
  helperTextStyle,
  importWizardFont,
  primaryBtnStyle,
  secondaryBtnStyle,
  tableTdStyle,
  tableThStyle,
} from './importWizardStyles';
import { P2P_BRAND } from '../../../tokens/brand';

type SampleDataPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ImportWizardConfig;
};

export function SampleDataPreviewModal({ open, onOpenChange, config }: SampleDataPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    window.setTimeout(() => setCopied(false), 200);
  };

  const handleCopy = async () => {
    try {
      await copySampleCsvToClipboard(config.sampleColumns, config.sampleRows);
      setCopied(true);
      toast.success('Sample copied — paste into Excel, Sheets, or a CSV file.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Unable to copy to clipboard. Try downloading the sample file instead.');
    }
  };

  const handleDownload = () => {
    downloadSampleCsv(config.sampleFileName, config.sampleColumns, config.sampleRows);
    toast.success('Sample file downloaded.');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16, 24, 40, 0.5)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '24px',
            fontFamily: importWizardFont,
          }}
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sample-preview-title"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              width: '720px',
              maxWidth: '96vw',
              maxHeight: '80vh',
              background: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 20px 48px rgba(16, 24, 40, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '20px 24px 0',
                flexShrink: 0,
              }}
            >
              <div>
                <h3
                  id="sample-preview-title"
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Sample import format
                </h3>
                <p style={{ ...helperTextStyle, marginTop: '4px' }}>
                  Review expected columns and example rows. Copy the sample to paste into your spreadsheet, or
                  download the full template file.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close sample preview"
                onClick={handleClose}
                style={{
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#F2F4F7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={16} color="#667085" aria-hidden />
              </button>
            </div>

            <div style={{ padding: '16px 24px', flex: 1, overflow: 'auto', minHeight: 0 }}>
              <div
                style={{
                  border: '1px solid #E4E7EC',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                  <thead>
                    <tr>
                      {config.sampleColumns.map((column) => (
                        <th key={column} style={tableThStyle}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {config.sampleRows.map((row, rowIndex) => (
                      <tr key={`sample-row-${rowIndex}`}>
                        {config.sampleColumns.map((column, columnIndex) => (
                          <td key={`${column}-${rowIndex}`} style={tableTdStyle}>
                            {row[columnIndex] ?? ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p
                style={{
                  margin: '12px 0 0',
                  fontSize: '12px',
                  color: '#667085',
                  lineHeight: 1.45,
                }}
              >
                <span style={{ fontWeight: 600, color: P2P_BRAND.primaryStrong }}>Tip:</span> Use{' '}
                <strong>Copy as CSV</strong> to paste directly into Excel or Google Sheets, then save as{' '}
                {config.acceptedFileTypes.replace(/\./g, '').toUpperCase()} before uploading.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                gap: '10px',
                padding: '16px 24px',
                borderTop: '1px solid #EEF1F5',
                background: '#FAFBFC',
                flexShrink: 0,
              }}
            >
              <button type="button" onClick={handleClose} style={secondaryBtnStyle}>
                Close
              </button>
              <button type="button" onClick={() => void handleCopy()} style={secondaryBtnStyle}>
                {copied ? <Check size={15} color={P2P_BRAND.primaryStrong} aria-hidden /> : <Copy size={15} aria-hidden />}
                {copied ? 'Copied' : 'Copy as CSV'}
              </button>
              <button type="button" onClick={handleDownload} style={primaryBtnStyle()}>
                <Download size={15} aria-hidden />
                Download file
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
