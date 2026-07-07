import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { UI_FONT_STACK as F } from "../../tokens/typography";
import {
  reportTemplateCategories,
  type ReportTemplate,
  type ReportTemplateCategory,
} from "../../data/reportTemplates";
import { ConfigureReportFooter, ConfigureReportPanel, type ConfigureReportPanelHandle } from "./ConfigureReportPanel";
import { ReportGeneratingPanel, ReportSuccessPanel } from "./ReportGenerationViews";
import {
  type GeneratedReportResult,
  type ReportRunConfig,
} from "./reportGenerationTypes";
import { onGhostBtnHover, reportGhostIconBtnStyle } from "./reportUiStyles";
import { reportStepTransition, useReportReducedMotion } from "./reportMotion";
import { ReportCenterModal } from "./ReportCenterModal";
import { ReportEmptyState } from "./ReportEmptyState";
import { ReportTemplateGridSkeleton } from "./ReportSkeletons";
import { useReports } from "../../context/ReportsContext";
import { generateReport } from "../../services/reportService";
import { resolveReportApiError, shouldToastReportApiFailure } from "../../utils/reportApiErrors";
import { mapGenerateReportPreview } from "../../utils/reportApiMappers";
import { buildGenerateReportRequest } from "../../utils/reportPayloadBuilders";
import { toast } from "sonner";

type DrawerStep = "template" | "configure" | "generating" | "success";

type ReportTemplateDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleMode?: boolean;
  initialTemplate?: ReportTemplate | null;
  initialRunConfig?: ReportRunConfig | null;
  onReportGenerated?: (reportId: string) => void;
};

const drawerHeaderCopy: Record<DrawerStep, { title: string; subtitle: string }> = {
  template: {
    title: "Select Template",
    subtitle: "Choose a report template to get started.",
  },
  configure: {
    title: "Configure Report",
    subtitle: "",
  },
  generating: {
    title: "Generating Report",
    subtitle: "Please wait while your report is being prepared.",
  },
  success: {
    title: "Report Ready",
    subtitle: "Your report has been generated successfully.",
  },
};

function matchesSearch(template: ReportTemplate, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    template.name.toLowerCase().includes(q) ||
    template.description.toLowerCase().includes(q)
  );
}

export function ReportTemplateDrawer({
  open,
  onOpenChange,
  scheduleMode = false,
  initialTemplate = null,
  initialRunConfig = null,
  onReportGenerated,
}: ReportTemplateDrawerProps) {
  const { addFromGeneration, templateGroups, reloadTemplates, isLoadingTemplates, templatesError } = useReports();
  const [step, setStep] = useState<DrawerStep>("template");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ReportTemplateCategory>("all");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    ap: true,
    approval: true,
    budget: true,
  });
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [runConfig, setRunConfig] = useState<ReportRunConfig | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedReportResult | null>(null);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(scheduleMode);
  const configureRef = useRef<ConfigureReportPanelHandle>(null);

  const handleClose = () => onOpenChange(false);

  const reducedMotion = useReportReducedMotion();

  useEffect(() => {
    if (!open) {
      setStep("template");
      setSearchQuery("");
      setActiveCategory("all");
      setExpandedGroups({ ap: true, approval: true, budget: true });
      setSelectedTemplate(null);
      setRunConfig(null);
      setGeneratedResult(null);
      setGeneratedReportId(null);
      return;
    }

    if (initialTemplate) {
      setSelectedTemplate(initialTemplate);
      setRunConfig(initialRunConfig);
      setGeneratedResult(null);
      setGeneratedReportId(null);
      setStep("configure");
    } else {
      setStep("template");
    }
    setIsScheduling(scheduleMode);
  }, [open, initialTemplate, initialRunConfig, scheduleMode]);

  const filteredGroups = useMemo(() => {
    return templateGroups
      .filter((group) => activeCategory === "all" || group.id === activeCategory)
      .map((group) => ({
        ...group,
        templates: group.templates.filter((template) => matchesSearch(template, searchQuery)),
      }))
      .filter((group) => group.templates.length > 0);
  }, [activeCategory, searchQuery, templateGroups]);

  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setRunConfig(null);
    setGeneratedResult(null);
    setStep("configure");
  };

  const handleRunReport = async () => {
    const validationError = configureRef.current?.validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    const config = configureRef.current?.getRunConfig();
    if (!config) return;

    setRunConfig(config);
    setGeneratedResult(null);
    setStep("generating");

    try {
      const data = await generateReport(buildGenerateReportRequest(config));
      const preview = mapGenerateReportPreview(data);
      const result: GeneratedReportResult = {
        reportName: config.reportName,
        generatedTime: preview.generatedOn ?? new Date().toLocaleString(),
        records: preview.totalCount,
        fileSize: preview.fileSize ?? "—",
        exportFormat: config.outputFormatLabel,
        config,
      };
      const reportId = await addFromGeneration(config, result);
      setGeneratedResult(result);
      setGeneratedReportId(reportId);
      setStep("success");
    } catch (error) {
      setStep("configure");
      const resolved = resolveReportApiError(error);
      if (shouldToastReportApiFailure(error)) {
        toast.error(resolved.message);
      }
    }
  };

  const headerCopy = drawerHeaderCopy[step];
  const configureSubtitle = selectedTemplate?.description ?? "";

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const stepLabel =
    step === "template"
      ? "Step 1 of 3 · Select template"
      : step === "configure"
        ? "Step 2 of 3 · Configure report"
        : step === "success"
          ? "Step 3 of 3 · Complete"
          : undefined;

  const modalAriaLabel =
    step === "template"
      ? "Select report template"
      : step === "configure"
        ? initialRunConfig
          ? "Run report again"
          : scheduleMode
            ? "Schedule report"
            : "Configure report"
        : step === "generating"
          ? "Generating report"
          : "Report generated";

  const modalTitle =
    step === "template" && !scheduleMode && !initialRunConfig
      ? "New Report"
      : step === "configure" && initialRunConfig && !isScheduling
        ? "Run Again"
        : step === "configure" && isScheduling
          ? "Schedule Report"
          : headerCopy.title;

  const modalSubtitle = step === "configure" ? configureSubtitle || headerCopy.subtitle : headerCopy.subtitle;

  const backButton =
    step === "configure" && !initialRunConfig ? (
      <button
        type="button"
        onClick={() => setStep("template")}
        aria-label="Back to templates"
        style={{ ...reportGhostIconBtnStyle, marginTop: "2px", flexShrink: 0 }}
        onMouseEnter={(e) => onGhostBtnHover(e, true)}
        onMouseLeave={(e) => onGhostBtnHover(e, false)}
      >
        <ArrowLeft size={16} color="#667085" />
      </button>
    ) : undefined;

  return (
    <ReportCenterModal
      open={open}
      onOpenChange={onOpenChange}
      title={modalTitle}
      subtitle={modalSubtitle || undefined}
      ariaLabel={modalAriaLabel}
      size="large"
      stepLabel={stepLabel}
      headerStart={backButton}
      preventDismiss={step === "generating"}
      bareFooter={step === "configure"}
      footer={
        step === "configure" ? (
          <ConfigureReportFooter
            onBack={() => setStep("template")}
            onCancel={handleClose}
            onRun={handleRunReport}
            scheduleMode={isScheduling}
          />
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        {step === "template" ? (
          <motion.div
            key="template-step"
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reducedMotion ? 1 : 0 }}
            transition={reportStepTransition(reducedMotion)}
          >
            <div className="app-report-drawer-search">
              <Search size={14} color="#98A2B3" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "13px",
                  color: "#344054",
                  width: "100%",
                  fontFamily: F,
                }}
              />
            </div>

            <div className="app-report-config-pills" style={{ marginBottom: "16px" }}>
              {reportTemplateCategories.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`app-report-config-pill${active ? " app-report-config-pill--active" : ""}`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {isLoadingTemplates && templateGroups.length === 0 ? (
              <ReportTemplateGridSkeleton cards={4} />
            ) : templatesError && templateGroups.length === 0 ? (
              <ReportEmptyState
                variant="error"
                title="Unable to load templates"
                description={templatesError}
                action={{ label: "Try again", onClick: () => void reloadTemplates() }}
              />
            ) : filteredGroups.length === 0 ? (
              <ReportEmptyState
                title="No templates found"
                description={
                  searchQuery.trim()
                    ? "No templates match your search. Try a different keyword or category."
                    : "No report templates are available from the API."
                }
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {filteredGroups.map((group) => {
                  const expanded = expandedGroups[group.id] ?? true;
                  return (
                    <div key={group.id}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        aria-expanded={expanded}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0 0 8px 0",
                          border: "none",
                          borderBottom: "1px solid #F2F4F7",
                          background: "transparent",
                          cursor: "pointer",
                          fontFamily: F,
                          marginBottom: expanded ? "8px" : 0,
                        }}
                      >
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#98A2B3", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {group.label}
                        </span>
                        <ChevronDown
                          size={14}
                          color="#667085"
                          style={{
                            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                          }}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              {group.templates.map((template) => (
                                <TemplateCard
                                  key={template.id}
                                  template={template}
                                  onSelect={() => handleSelectTemplate(template)}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : step === "configure" && selectedTemplate ? (
          <motion.div
            key="configure-step"
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reducedMotion ? 1 : 0 }}
            transition={reportStepTransition(reducedMotion)}
          >
            <ConfigureReportPanel
              ref={configureRef}
              template={selectedTemplate}
              defaultScheduleEnabled={scheduleMode}
              onScheduleEnabledChange={setIsScheduling}
              initialConfig={
                initialRunConfig && initialRunConfig.templateId === selectedTemplate.id
                  ? initialRunConfig
                  : null
              }
            />
          </motion.div>
        ) : step === "generating" && runConfig ? (
          <ReportGeneratingPanel key="generating-step" reportName={runConfig.reportName} />
        ) : step === "success" && generatedResult ? (
          <ReportSuccessPanel
            key="success-step"
            result={generatedResult}
            onClose={() => {
              if (generatedReportId) onReportGenerated?.(generatedReportId);
              else handleClose();
            }}
            onViewInLibrary={() => {
              if (generatedReportId) onReportGenerated?.(generatedReportId);
            }}
            scheduleMode={scheduleMode || !!runConfig?.scheduleEnabled}
          />
        ) : null}
      </AnimatePresence>
    </ReportCenterModal>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: ReportTemplate;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="app-report-drawer-template-item"
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#101828" }}>{template.name}</span>
          {template.popular && (
            <span className="app-report-popular-badge">Popular</span>
          )}
        </div>
        <p style={{ fontSize: "12px", color: "#667085", margin: "2px 0 0 0", lineHeight: 1.45 }}>
          {template.description}
        </p>
      </div>
      <ChevronRight size={15} color="#98A2B3" style={{ flexShrink: 0 }} />
    </button>
  );
}
