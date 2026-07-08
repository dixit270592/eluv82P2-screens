import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { ArrowLeft, X } from "lucide-react";

import { toast } from "sonner";

import type { ReportTemplate } from "../../data/reportTemplates";

import {

  ConfigureReportFooter,

  ConfigureReportPanel,

  type ConfigureReportPanelHandle,

  type ConfigureTab,

} from "./ConfigureReportPanel";

import { ReportPreviewPanel, type PreviewState } from "./ReportPreviewPanel";

import {

  buildGeneratedReportResult,

  type GeneratedReportResult,

  type ReportRunConfig,

} from "./reportGenerationTypes";

import { onGhostBtnHover, reportGhostIconBtnStyle } from "./reportUiStyles";

import { reportModalBackdropTransition, reportModalPanelTransition, useReportReducedMotion } from "./reportMotion";

import { useReportDrawerA11y } from "./useReportDrawerA11y";

import { useReports } from "../../context/ReportsContext";

import { generateReport } from "../../services/reportService";

import { resolveReportApiError, shouldToastReportApiFailure } from "../../utils/reportApiErrors";

import { mapGenerateReportPreview } from "../../utils/reportApiMappers";

import { buildGenerateReportRequest } from "../../utils/reportPayloadBuilders";

import { isDemoReportDataEnabled } from "../../data/reportDemoData";

import { ReportEmptyState } from "./ReportEmptyState";

import { ReportTemplateGridSkeleton } from "./ReportSkeletons";



export type CreateReportFlowProps = {

  open: boolean;

  onOpenChange: (open: boolean) => void;

  initialTemplate?: ReportTemplate | null;

  initialRunConfig?: ReportRunConfig | null;

  defaultScheduleEnabled?: boolean;

  onReportGenerated?: (reportId: string) => void;

};



export function CreateReportFlow({

  open,

  onOpenChange,

  initialTemplate = null,

  initialRunConfig = null,

  defaultScheduleEnabled = false,

  onReportGenerated,

}: CreateReportFlowProps) {

  const { addFromGeneration, templateGroups, isLoadingTemplates, templatesError, reloadTemplates } = useReports();

  const panelRef = useRef<HTMLDivElement>(null);

  const configureRef = useRef<ConfigureReportPanelHandle>(null);

  const reducedMotion = useReportReducedMotion();



  const allTemplates = useMemo(

    () => templateGroups.flatMap((group) => group.templates),

    [templateGroups],

  );



  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  const [activeTab, setActiveTab] = useState<ConfigureTab>("basic");

  const [preview, setPreview] = useState<PreviewState>({ status: "idle" });

  const [isRunning, setIsRunning] = useState(false);

  const [scheduleEnabled, setScheduleEnabled] = useState(defaultScheduleEnabled);

  const [savedReportId, setSavedReportId] = useState<string | null>(null);

  const [saveComplete, setSaveComplete] = useState(false);



  const canDismiss = !isRunning;



  const handleClose = useCallback(() => {

    if (!canDismiss) return;

    onOpenChange(false);

  }, [canDismiss, onOpenChange]);



  useReportDrawerA11y(open, handleClose, panelRef, canDismiss);



  useEffect(() => {

    if (!open) {

      setSelectedTemplate(null);

      setActiveTab("basic");

      setPreview({ status: "idle" });

      setIsRunning(false);

      setSavedReportId(null);

      setSaveComplete(false);

      return;

    }



    const template =

      initialTemplate ??

      (initialRunConfig?.templateId

        ? allTemplates.find((t) => t.id === initialRunConfig.templateId) ?? null

        : null) ??

      allTemplates[0] ??

      null;



    setSelectedTemplate(template);

    setPreview({ status: "idle" });

    setSavedReportId(null);

    setSaveComplete(false);

    setScheduleEnabled(initialRunConfig?.scheduleEnabled ?? defaultScheduleEnabled);

    setActiveTab(defaultScheduleEnabled || initialRunConfig?.scheduleEnabled ? "delivery" : "basic");

  }, [open, initialTemplate, initialRunConfig, defaultScheduleEnabled, allTemplates]);



  const runGeneration = useCallback(

    async (config: ReportRunConfig, options: { save: boolean; previewOnly: boolean }) => {

      setIsRunning(true);

      setSaveComplete(false);

      setSavedReportId(null);

      setPreview({

        status: "loading",

        reportName: config.reportName,

        scheduleMode: config.scheduleEnabled && options.save && !options.previewOnly,

      });



      try {

        let result: GeneratedReportResult;

        const isScheduleSave = config.scheduleEnabled && options.save && !options.previewOnly;



        if (isScheduleSave) {

          result = buildGeneratedReportResult(config);

          setPreview({

            status: "scheduled",

            reportName: config.reportName,

            frequency: config.frequency ?? "Weekly",

            recipients: config.recipients ?? "",

            deliveryTime: config.deliveryTime ?? "",

            timezone: config.timezone ?? "",

          });

        } else if (isDemoReportDataEnabled()) {

          result = buildGeneratedReportResult(config);

          const isApprovalTemplate =
            /approval|approver|pending/i.test(config.templateId) ||
            /approval|approver|pending/i.test(config.reportName);

          const demoColumns = isApprovalTemplate
            ? [
                { key: "approver", label: "Approver" },
                { key: "approvalTime", label: "ApprovalTime" },
                { key: "prs", label: "PR Count" },
              ]
            : [
                { key: "vendor", label: "Vendor" },
                { key: "department", label: "Department" },
                { key: "amount", label: "Amount (USD)" },
                { key: "status", label: "Status" },
              ];

          const demoRows = isApprovalTemplate
            ? [
                { approver: "Shreeve K", approvalTime: "578.93 hrs", prs: "12" },
                { approver: "Snigdha Pandey", approvalTime: "2,784.22 hrs", prs: "18" },
                { approver: "Rajvi Vachhani", approvalTime: "3,119.35 hrs", prs: "21" },
                { approver: "Axar Patel", approvalTime: "189.20 hrs", prs: "6" },
                { approver: "John Oneal", approvalTime: "412.55 hrs", prs: "9" },
                { approver: "Ben Stokes", approvalTime: "96.40 hrs", prs: "4" },
                { approver: "Alexa george", approvalTime: "49.15 hrs", prs: "3" },
              ]
            : Array.from({ length: Math.min(10, result.records) }, (_, i) => ({
                vendor: config.vendor === "All Vendors" ? "Sample Vendor" : config.vendor,
                department: config.departments?.[0] ?? "Engineering",
                amount: `$${(1200 + i * 340).toLocaleString()}`,
                status: config.approvalStatus === "All Statuses" ? "Approved" : config.approvalStatus,
              }));

          setPreview({

            status: "success",

            reportName: config.reportName,

            columns: demoColumns,

            rows: demoRows,

            totalCount: isApprovalTemplate ? demoRows.length : result.records,

            generatedOn: result.generatedTime,

          });

        } else {

          const data = await generateReport(buildGenerateReportRequest(config));

          const mapped = mapGenerateReportPreview(data);

          result = {

            reportName: config.reportName,

            generatedTime: mapped.generatedOn ?? new Date().toLocaleString(),

            records: mapped.totalCount,

            fileSize: mapped.fileSize ?? "—",

            exportFormat: config.outputFormatLabel,

            config,

          };

          setPreview({

            status: "success",

            reportName: config.reportName,

            columns: mapped.columns,

            rows: mapped.rows,

            totalCount: mapped.totalCount,

            generatedOn: mapped.generatedOn,

          });

        }



        if (options.save) {

          const reportId = await addFromGeneration(config, result);

          setSavedReportId(reportId);

          setSaveComplete(true);

        }



        return result;

      } catch (error) {

        const resolved = resolveReportApiError(error);

        setPreview({ status: "error", message: resolved.message });

        if (shouldToastReportApiFailure(error)) {

          toast.error(resolved.message);

        }

        throw error;

      } finally {

        setIsRunning(false);

      }

    },

    [addFromGeneration],

  );



  const handlePreview = async () => {

    if (isRunning) return;

    const validationError = configureRef.current?.validate();

    if (validationError) {

      toast.error(validationError);

      return;

    }

    const config = configureRef.current?.getRunConfig();

    if (!config) return;



    try {

      await runGeneration(config, { save: false, previewOnly: true });

    } catch {

      // Error shown in preview panel

    }

  };



  const handleGenerate = async () => {

    if (isRunning) return;

    const validationError = configureRef.current?.validate();

    if (validationError) {

      toast.error(validationError);

      return;

    }

    const config = configureRef.current?.getRunConfig();

    if (!config) return;



    try {

      await runGeneration(config, { save: true, previewOnly: false });

    } catch {

      // Error shown in preview panel

    }

  };



  const handleViewInLibrary = () => {

    if (savedReportId) onReportGenerated?.(savedReportId);

    else handleClose();

  };



  const title = initialRunConfig ? "Run Again" : scheduleEnabled ? "Schedule Report" : "Create Report";



  const showConfigure = selectedTemplate && !isLoadingTemplates;

  const showLoading = isLoadingTemplates && allTemplates.length === 0;

  const showEmpty = !isLoadingTemplates && allTemplates.length === 0;



  return (

    <AnimatePresence>

      {open && (

        <div className="app-report-create-flow" role="presentation">

          <motion.div

            className="app-report-create-flow__backdrop"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            transition={reportModalBackdropTransition(reducedMotion)}

            onClick={handleClose}

            aria-hidden

          />

          <motion.div

            ref={panelRef}

            className="app-report-create-flow__panel"

            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}

            animate={{ opacity: 1, y: 0 }}

            exit={{ opacity: 0, y: reducedMotion ? 0 : 12 }}

            transition={reportModalPanelTransition(reducedMotion)}

            role="dialog"

            aria-modal="true"

            aria-label={title}

          >

            <header className="app-report-create-flow__header">

              <div className="app-report-create-flow__header-start">

                <button

                  type="button"

                  onClick={handleClose}

                  disabled={!canDismiss}

                  aria-label="Back to reports"

                  className="app-report-create-flow__back"

                  style={reportGhostIconBtnStyle}

                  onMouseEnter={(e) => canDismiss && onGhostBtnHover(e, true)}

                  onMouseLeave={(e) => canDismiss && onGhostBtnHover(e, false)}

                >

                  <ArrowLeft size={16} color="#667085" />

                </button>

                <h2 className="app-report-create-flow__title">{title}</h2>

              </div>

              <button

                type="button"

                onClick={handleClose}

                disabled={!canDismiss}

                aria-label="Close"

                className="app-report-create-flow__close"

                style={{

                  ...reportGhostIconBtnStyle,

                  opacity: canDismiss ? 1 : 0.4,

                  cursor: canDismiss ? "pointer" : "not-allowed",

                }}

                onMouseEnter={(e) => canDismiss && onGhostBtnHover(e, true)}

                onMouseLeave={(e) => canDismiss && onGhostBtnHover(e, false)}

              >

                <X size={18} color="#667085" />

              </button>

            </header>



            {showLoading ? (

              <div className="app-report-create-flow__loading">

                <ReportTemplateGridSkeleton cards={3} />

              </div>

            ) : showEmpty ? (

              <div className="app-report-create-flow__empty">

                <ReportEmptyState

                  variant={templatesError ? "error" : "default"}

                  title={templatesError ? "Unable to load templates" : "No templates available"}

                  description={

                    templatesError ?? "Report templates could not be loaded. Check your API connection or try again."

                  }

                  action={

                    templatesError

                      ? { label: "Try again", onClick: () => void reloadTemplates() }

                      : undefined

                  }

                />

              </div>

            ) : showConfigure ? (

              <div className="app-report-create-flow__body">

                <div className="app-report-create-flow__config">

                  <ConfigureReportPanel

                    ref={configureRef}

                    template={selectedTemplate}

                    templates={allTemplates}

                    onTemplateChange={(next) => {

                      setSelectedTemplate(next);

                      setSaveComplete(false);

                      setSavedReportId(null);

                      setPreview({ status: "idle" });

                    }}

                    defaultScheduleEnabled={defaultScheduleEnabled}

                    initialConfig={

                      initialRunConfig && initialRunConfig.templateId === selectedTemplate.id

                        ? initialRunConfig

                        : null

                    }

                    activeTab={activeTab}

                    onActiveTabChange={setActiveTab}

                    onScheduleEnabledChange={setScheduleEnabled}

                    compact

                  />

                  <ConfigureReportFooter

                    onCancel={handleClose}

                    onPreview={handlePreview}

                    onRun={handleGenerate}

                    onViewInLibrary={saveComplete ? handleViewInLibrary : undefined}

                    scheduleEnabled={scheduleEnabled}

                    isRunning={isRunning}

                    saveComplete={saveComplete}

                  />

                </div>

                <div className="app-report-create-flow__preview">

                  <ReportPreviewPanel preview={preview} />

                </div>

              </div>

            ) : null}

          </motion.div>

        </div>

      )}

    </AnimatePresence>

  );

}



/** @deprecated Use CreateReportFlow — kept for existing imports */

export const ReportTemplateDrawer = CreateReportFlow;

export type ReportTemplateDrawerProps = CreateReportFlowProps;

