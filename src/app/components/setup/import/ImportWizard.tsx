import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ImportWizardConfig } from '../../../data/importWizardConfig';
import type { ImportDataPayload, MappingFieldDefinition, ParsedImportFile, ValidationResult } from '../../../types/globalImport';
import {
  autoMapFields,
  buildFieldMappingPayload,
  getDuplicateMappings,
  getMappingFields,
  getUnmappedRequiredFields,
  importFile,
  parseImportFile,
  validateImportFile,
} from '../../../services/globalImportService';
import { ImportDataStep } from './ImportDataStep';
import { FieldMappingStep } from './FieldMappingStep';
import { PreviewValidationStep } from './PreviewValidationStep';
import { ImportProgressRail } from './ImportProgressRail';
import { ImportSection } from './ImportSection';
import {
  primaryBtnStyle,
  wizardBodyStyle,
  wizardFooterStyle,
  wizardHeaderStyle,
  wizardOverlayStyle,
  wizardPanelStyle,
  wizardTitleStyle,
} from './importWizardStyles';

export type ImportWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ImportWizardConfig;
  context?: Record<string, unknown>;
  onImportSuccess?: (validation: ValidationResult) => void;
};

function buildSourceHeaders(
  parsed: ParsedImportFile,
  destinationFields: MappingFieldDefinition[],
): string[] {
  return parsed.headers.map((header) => {
    const dest = destinationFields.find(
      (field) => field.fieldName.toLowerCase() === header.replace(/\*$/, '').toLowerCase(),
    );
    return dest?.isRequired && !header.endsWith('*') ? `${header}*` : header;
  });
}

function isMappingValid(
  mapping: Record<string, string>,
  destinationFields: MappingFieldDefinition[],
): boolean {
  return (
    getDuplicateMappings(mapping).length === 0 &&
    getUnmappedRequiredFields(mapping, destinationFields).length === 0
  );
}

async function parseUploadedFile(
  nextFile: File,
  config: ImportWizardConfig,
): Promise<ParsedImportFile> {
  const extension = nextFile.name.slice(nextFile.name.lastIndexOf('.')).toLowerCase();
  if (extension === '.xlsx' || extension === '.xls') {
    return {
      headers: config.sampleColumns,
      rows: config.sampleRows,
    };
  }
  return parseImportFile(nextFile);
}

function mappingSubtitle(
  mapping: Record<string, string>,
  sourceFields: string[],
  needsAttention: boolean,
): string {
  if (sourceFields.length === 0) return 'Waiting for file upload';
  const mapped = sourceFields.filter((source) => Boolean(mapping[source])).length;
  if (needsAttention) return `${mapped} of ${sourceFields.length} fields mapped — action required`;
  return `${mapped} field${mapped === 1 ? '' : 's'} mapped automatically`;
}

function validationSubtitle(validation: ValidationResult | null): string {
  if (!validation) return 'Runs automatically after fields are mapped';
  if (validation.invalidRecords > 0) {
    return `${validation.invalidRecords} invalid row${validation.invalidRecords === 1 ? '' : 's'} need attention`;
  }
  if (validation.warningCount > 0) {
    return `${validation.validRecords} ready · ${validation.warningCount} warning${validation.warningCount === 1 ? '' : 's'}`;
  }
  return `${validation.validRecords} record${validation.validRecords === 1 ? '' : 's'} ready to import`;
}

export function ImportWizard({
  open,
  onOpenChange,
  config,
  context,
  onImportSuccess,
}: ImportWizardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsedFile, setParsedFile] = useState<ParsedImportFile | null>(null);
  const [destinationFields, setDestinationFields] = useState<MappingFieldDefinition[]>([]);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [prefetching, setPrefetching] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Processing your file…');
  const [mappingEdited, setMappingEdited] = useState(false);

  const pipelineRef = useRef(0);
  const revalidateTimerRef = useRef<number | null>(null);

  const resetWizard = useCallback(() => {
    pipelineRef.current += 1;
    if (revalidateTimerRef.current) {
      window.clearTimeout(revalidateTimerRef.current);
      revalidateTimerRef.current = null;
    }
    setFile(null);
    setFileError(null);
    setParsedFile(null);
    setDestinationFields([]);
    setSourceFields([]);
    setMapping({});
    setValidation(null);
    setLoading(false);
    setImporting(false);
    setPrefetching(false);
    setProcessingMessage('Processing your file…');
    setMappingEdited(false);
  }, []);

  useEffect(() => {
    if (!open) resetWizard();
  }, [open, resetWizard]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setPrefetching(true);

    void getMappingFields(config.getMappingParams(context))
      .then((fields) => {
        if (!cancelled) setDestinationFields(fields);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Unable to preload mapping fields. Upload will retry automatically.');
        }
      })
      .finally(() => {
        if (!cancelled) setPrefetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, config, context]);

  const duplicateDestinations = useMemo(() => getDuplicateMappings(mapping), [mapping]);
  const unmappedRequired = useMemo(
    () => getUnmappedRequiredFields(mapping, destinationFields),
    [mapping, destinationFields],
  );

  const mappingIsValid = useMemo(
    () => isMappingValid(mapping, destinationFields),
    [mapping, destinationFields],
  );

  const mappingNeedsAttention = Boolean(
    file && sourceFields.length > 0 && !mappingIsValid,
  );

  const importPayload: ImportDataPayload | null = useMemo(() => {
    if (!mappingIsValid) return null;
    return {
      Type: config.type,
      FieldMapping: buildFieldMappingPayload(mapping, destinationFields),
    };
  }, [config.type, destinationFields, mapping, mappingIsValid]);

  const runValidation = useCallback(
    async (
      activeFile: File,
      activeParsed: ParsedImportFile,
      activeFields: MappingFieldDefinition[],
      activeMapping: Record<string, string>,
    ): Promise<ValidationResult | null> => {
      if (!isMappingValid(activeMapping, activeFields)) return null;

      const payload: ImportDataPayload = {
        Type: config.type,
        FieldMapping: buildFieldMappingPayload(activeMapping, activeFields),
      };

      return validateImportFile(
        activeFile,
        payload,
        config.contextPayloadKey,
        config.buildContextPayload(context),
        activeParsed,
        activeFields,
      );
    },
    [config, context],
  );

  const applyValidationResult = useCallback((result: ValidationResult, quiet = false) => {
    setValidation(result);

    if (quiet) return;

    if (result.invalidRecords > 0) {
      toast.warning(
        `${result.invalidRecords} invalid row${result.invalidRecords === 1 ? '' : 's'} — review before importing.`,
      );
    } else if (result.warningCount > 0) {
      toast.success(
        `${result.validRecords} record${result.validRecords === 1 ? '' : 's'} ready with ${result.warningCount} warning${result.warningCount === 1 ? '' : 's'}.`,
      );
    } else {
      toast.success(
        `${result.validRecords} record${result.validRecords === 1 ? '' : 's'} ready to import.`,
      );
    }
  }, []);

  const runAutoPipeline = useCallback(
    async (
      activeFile: File,
      activeParsed: ParsedImportFile,
      fields: MappingFieldDefinition[],
      pipelineId: number,
    ) => {
      setLoading(true);
      setProcessingMessage('Reading file…');

      try {
        const headers = buildSourceHeaders(activeParsed, fields);
        const autoMapping = autoMapFields(headers, fields);

        setSourceFields(headers);
        setMapping(autoMapping);
        setValidation(null);
        setMappingEdited(false);

        if (!isMappingValid(autoMapping, fields)) {
          toast.info('Some fields need manual mapping.');
          return;
        }

        if (pipelineId !== pipelineRef.current) return;

        setProcessingMessage('Validating data…');
        const result = await runValidation(activeFile, activeParsed, fields, autoMapping);
        if (!result || pipelineId !== pipelineRef.current) return;

        applyValidationResult(result);
      } catch {
        if (pipelineId === pipelineRef.current) {
          toast.error('Unable to process the file. Check the format or map fields manually.');
        }
      } finally {
        if (pipelineId === pipelineRef.current) {
          setLoading(false);
          setProcessingMessage('Processing your file…');
        }
      }
    },
    [applyValidationResult, runValidation],
  );

  const handleClose = () => {
    if (loading || importing) return;
    onOpenChange(false);
  };

  const handleFileSelect = async (nextFile: File | null) => {
    pipelineRef.current += 1;
    const pipelineId = pipelineRef.current;

    if (revalidateTimerRef.current) {
      window.clearTimeout(revalidateTimerRef.current);
      revalidateTimerRef.current = null;
    }

    setFile(nextFile);
    setFileError(null);
    setValidation(null);
    setMappingEdited(false);

    if (!nextFile) {
      setParsedFile(null);
      setSourceFields([]);
      setMapping({});
      setLoading(false);
      return;
    }

    try {
      const parsed = await parseUploadedFile(nextFile, config);
      if (pipelineId !== pipelineRef.current) return;

      if (parsed.headers.length === 0) {
        setFileError('The selected file has no readable headers. Use the sample file format.');
        setParsedFile(null);
        setSourceFields([]);
        setMapping({});
        return;
      }

      setParsedFile(parsed);

      let fields = destinationFields;
      if (fields.length === 0) {
        setProcessingMessage('Loading field definitions…');
        setLoading(true);
        fields = await getMappingFields(config.getMappingParams(context));
        if (pipelineId !== pipelineRef.current) return;
        setDestinationFields(fields);
      }

      await runAutoPipeline(nextFile, parsed, fields, pipelineId);
    } catch {
      if (pipelineId === pipelineRef.current) {
        setFileError('Unable to read the selected file. Try a CSV export or the sample template.');
        setParsedFile(null);
        setSourceFields([]);
        setMapping({});
        setLoading(false);
      }
    }
  };

  const handleValidate = useCallback(async () => {
    if (!file || !parsedFile || !importPayload) return;

    setLoading(true);
    try {
      const result = await runValidation(file, parsedFile, destinationFields, mapping);
      if (!result) return;
      applyValidationResult(result);
      setMappingEdited(false);
    } catch {
      toast.error('Validation failed. Check your mappings and file format.');
    } finally {
      setLoading(false);
    }
  }, [applyValidationResult, destinationFields, file, importPayload, mapping, parsedFile, runValidation]);

  const handleMappingChange = (sourceField: string, destinationField: string) => {
    const nextMapping = { ...mapping, [sourceField]: destinationField };
    setMapping(nextMapping);
    setValidation(null);
    setMappingEdited(true);

    if (revalidateTimerRef.current) {
      window.clearTimeout(revalidateTimerRef.current);
    }

    revalidateTimerRef.current = window.setTimeout(() => {
      revalidateTimerRef.current = null;
      if (!file || !parsedFile) return;
      if (!isMappingValid(nextMapping, destinationFields)) return;

      setLoading(true);
      void runValidation(file, parsedFile, destinationFields, nextMapping)
        .then((result) => {
          if (!result) return;
          applyValidationResult(result, true);
          setMappingEdited(false);
        })
        .catch(() => {
          toast.error('Validation failed. Check your mappings and file format.');
        })
        .finally(() => setLoading(false));
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (revalidateTimerRef.current) window.clearTimeout(revalidateTimerRef.current);
    };
  }, []);

  const handleImport = async () => {
    if (!file || !importPayload || !validation) return;
    if (validation.invalidRecords > 0) {
      toast.error('Resolve invalid rows before importing.');
      return;
    }

    setImporting(true);
    try {
      const result = await importFile(
        file,
        importPayload,
        config.contextPayloadKey,
        config.buildContextPayload(context),
      );
      if (result.success) {
        toast.success(result.message ?? `Imported ${result.importedCount} record(s) successfully.`);
        onImportSuccess?.(validation);
        onOpenChange(false);
      } else {
        toast.error(result.message ?? 'Import failed. Please try again.');
      }
    } catch {
      toast.error('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const canImport =
    Boolean(validation && validation.totalRecords > 0 && validation.invalidRecords === 0) &&
    !loading &&
    !importing;

  const needsRevalidate = Boolean(
    file && mappingIsValid && !validation && !loading && sourceFields.length > 0,
  );

  const primaryAction = useMemo(() => {
    if (loading) return { label: 'Processing…', enabled: false, type: 'loading' as const };
    if (canImport) {
      const count = validation!.validRecords;
      return {
        label: count === 1 ? 'Import 1 record' : `Import ${count} records`,
        enabled: true,
        type: 'import' as const,
      };
    }
    if (needsRevalidate || (mappingEdited && mappingIsValid && !validation)) {
      return { label: 'Validate data', enabled: mappingIsValid, type: 'validate' as const };
    }
    return { label: 'Import', enabled: false, type: 'idle' as const };
  }, [canImport, loading, mappingEdited, mappingIsValid, needsRevalidate, validation]);

  const showMappingSection = Boolean(file && sourceFields.length > 0);
  const showReviewSection = Boolean(validation);

  const footerHint = canImport
    ? 'All checks passed. Import when ready.'
    : mappingNeedsAttention
      ? 'Complete field mapping to continue.'
      : loading
        ? 'Please wait while your file is processed.'
        : validation?.invalidRecords
          ? 'Fix invalid rows before importing.'
          : 'Upload a file to begin.';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={wizardOverlayStyle}
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-wizard-title"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2 }}
            style={wizardPanelStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={wizardHeaderStyle}>
              <h2 id="import-wizard-title" style={wizardTitleStyle}>
                {config.title}
              </h2>
              <button
                type="button"
                aria-label="Close import wizard"
                onClick={handleClose}
                disabled={loading || importing}
                style={{
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#F2F4F7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: loading || importing ? 'not-allowed' : 'pointer',
                  opacity: loading || importing ? 0.6 : 1,
                }}
              >
                <X size={16} color="#667085" aria-hidden />
              </button>
            </div>

            <ImportProgressRail
              hasFile={Boolean(file && parsedFile)}
              mappingComplete={mappingIsValid && sourceFields.length > 0}
              mappingNeedsAttention={mappingNeedsAttention}
              validationReady={Boolean(validation)}
              hasValidationErrors={Boolean(validation && validation.invalidRecords > 0)}
            />

            <div style={{ ...wizardBodyStyle, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <ImportSection
                id="import-upload"
                title="Upload file"
                subtitle={
                  file
                    ? `${parsedFile?.headers.length ?? 0} columns · ${parsedFile?.rows.length ?? 0} rows detected`
                    : 'Drop a file to start — mapping and validation run automatically'
                }
                status={file ? 'complete' : 'active'}
              >
                <ImportDataStep
                  config={config}
                  file={file}
                  fileError={fileError}
                  isProcessing={loading}
                  processingMessage={processingMessage}
                  isPrefetching={prefetching}
                  compact={Boolean(file)}
                  onFileSelect={handleFileSelect}
                />
              </ImportSection>

              {showMappingSection && (
                <ImportSection
                  id="import-mapping"
                  title="Field mapping"
                  subtitle={mappingSubtitle(mapping, sourceFields, mappingNeedsAttention)}
                  status={
                    mappingNeedsAttention ? 'attention' : mappingIsValid ? 'complete' : 'active'
                  }
                  showDivider
                >
                  <FieldMappingStep
                    sourceFields={sourceFields}
                    destinationFields={destinationFields}
                    mapping={mapping}
                    duplicateDestinations={duplicateDestinations}
                    unmappedRequired={unmappedRequired}
                    onMappingChange={handleMappingChange}
                    embedded
                  />
                </ImportSection>
              )}

              {showReviewSection && validation && (
                <ImportSection
                  id="import-review"
                  title="Review & validation"
                  subtitle={validationSubtitle(validation)}
                  status={validation.invalidRecords > 0 ? 'attention' : 'complete'}
                  showDivider
                  dense
                >
                  <PreviewValidationStep validation={validation} compact />
                </ImportSection>
              )}
            </div>

            <div style={wizardFooterStyle}>
              <p
                style={{
                  margin: 0,
                  marginRight: 'auto',
                  fontSize: '12px',
                  color: '#667085',
                  lineHeight: 1.4,
                  maxWidth: '420px',
                }}
              >
                {footerHint}
              </p>

              {primaryAction.type !== 'idle' && (
                <button
                  type="button"
                  onClick={() => {
                    if (primaryAction.type === 'import') void handleImport();
                    if (primaryAction.type === 'validate') void handleValidate();
                  }}
                  disabled={!primaryAction.enabled || importing || primaryAction.type === 'loading'}
                  style={primaryBtnStyle(primaryAction.enabled && !importing && primaryAction.type !== 'loading')}
                >
                  {importing || primaryAction.type === 'loading' ? (
                    <>
                      <Loader2
                        size={15}
                        aria-hidden
                        style={{ animation: 'import-wizard-spin 1s linear infinite' }}
                      />
                      {importing ? 'Importing…' : 'Processing…'}
                    </>
                  ) : (
                    primaryAction.label
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
