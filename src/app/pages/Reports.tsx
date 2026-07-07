import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "../components/Sidebar";
import { TopHeader } from "../components/TopHeader";
import { SkipToMainContent } from "../components/SkipToMainContent";
import { ReportTemplateDrawer } from "../components/reports/ReportTemplateDrawer";
import { ReportCenterNav, type LibraryCollection, type ReportCenterSection } from "../components/reports/ReportCenterNav";
import { ReportLibrarySection } from "../components/reports/ReportLibrarySection";
import { ReportsInsightsSection } from "../components/reports/ReportsInsightsSection";
import { ScheduleEditDrawer } from "../components/reports/ScheduleEditDrawer";
import { useReports } from "../context/ReportsContext";
import type { ReportTemplate } from "../data/reportTemplates";
import type { ReportHistoryItem } from "../data/reportHistory";
import type { ReportRunConfig } from "../components/reports/reportGenerationTypes";
import { findTemplateById, getReportRunConfig } from "../utils/reportRunConfigUtils";
import { computeCollectionCounts } from "../utils/reportLibraryFilters";
import { buildReportCenterPath, parseReportCenterPath } from "../utils/reportCenterRoutes";
import { UI_FONT_STACK as F } from "../tokens/typography";
import { reportPageBg, reportFont, reportPageTitleStyle } from "../components/reports/reportUiStyles";
import { ScheduledReportsSection } from "../components/reports/ScheduledReportsSection";
import { ReportTemplatesSection } from "../components/reports/ReportTemplatesSection";

const sectionTitles: Record<ReportCenterSection, { title: string; subtitle: string }> = {
  library: {
    title: "Report Center",
    subtitle: "Create, manage, and consume your reports",
  },
  schedules: {
    title: "Schedules",
    subtitle: "Automated report delivery and recurring runs",
  },
  templates: {
    title: "Templates",
    subtitle: "Browse and run report templates",
  },
  insights: {
    title: "Insights",
    subtitle: "High-level procurement analytics",
  },
};

function ReportsPageInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { history, scheduledReports, starredIds, scheduledReportNames, getScheduleForReport, templateGroups } = useReports();

  const routeState = useMemo(
    () => parseReportCenterPath(location.pathname, location.search),
    [location.pathname, location.search],
  );

  const activeSection = routeState.section;
  const libraryCollection = routeState.collection;
  const selectedReportId = routeState.reportId;

  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);
  const [templateScheduleMode, setTemplateScheduleMode] = useState(false);
  const [initialTemplate, setInitialTemplate] = useState<ReportTemplate | null>(null);
  const [initialRunConfig, setInitialRunConfig] = useState<ReportRunConfig | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const editingSchedule = useMemo(
    () => scheduledReports.find((s) => s.id === editingScheduleId) ?? null,
    [scheduledReports, editingScheduleId],
  );

  const templateCount = templateGroups.reduce((sum, g) => sum + g.templates.length, 0);

  const collectionCounts = useMemo(
    () => computeCollectionCounts(history, starredIds, scheduledReportNames),
    [history, starredIds, scheduledReportNames],
  );

  const navCounts = {
    library: collectionCounts.library,
    schedules: scheduledReports.length,
    templates: templateCount,
    saved: collectionCounts.saved,
    starred: collectionCounts.starred,
    failed: collectionCounts.failed,
    running: collectionCounts.running,
    scheduled: collectionCounts.scheduled,
    recent: collectionCounts.recent,
  };

  const resetDrawerState = useCallback(() => {
    setInitialTemplate(null);
    setInitialRunConfig(null);
    setTemplateScheduleMode(false);
  }, []);

  const navigateToSection = useCallback(
    (section: ReportCenterSection) => {
      navigate(
        buildReportCenterPath(section, {
          reportId: section === "library" ? selectedReportId : undefined,
          collection: section === "library" ? libraryCollection : undefined,
        }),
      );
    },
    [navigate, selectedReportId, libraryCollection],
  );

  const navigateToCollection = useCallback(
    (collection: LibraryCollection) => {
      navigate(buildReportCenterPath("library", { reportId: selectedReportId, collection }));
    },
    [navigate, selectedReportId],
  );

  const navigateToReport = useCallback(
    (reportId: string | null) => {
      navigate(buildReportCenterPath("library", { reportId, collection: libraryCollection }));
    },
    [navigate, libraryCollection],
  );

  const openGenerateReport = useCallback(() => {
    resetDrawerState();
    setTemplateDrawerOpen(true);
  }, [resetDrawerState]);

  const openScheduleReport = useCallback(
    (prefill?: ReportRunConfig | null) => {
      if (prefill?.templateId) {
        const template = findTemplateById(prefill.templateId, templateGroups);
        if (template) {
          setInitialTemplate(template);
          setInitialRunConfig({ ...prefill, scheduleEnabled: true });
          setTemplateScheduleMode(true);
          setTemplateDrawerOpen(true);
          return;
        }
      }
      resetDrawerState();
      setTemplateScheduleMode(true);
      setTemplateDrawerOpen(true);
    },
    [resetDrawerState, templateGroups],
  );

  const openTemplate = useCallback((template: ReportTemplate) => {
    setInitialTemplate(template);
    setInitialRunConfig(null);
    setTemplateScheduleMode(false);
    setTemplateDrawerOpen(true);
  }, []);

  const handleRunAgain = useCallback((report: ReportHistoryItem) => {
    const config = getReportRunConfig(report);
    if (config) {
      const template = findTemplateById(config.templateId, templateGroups);
      if (!template) {
        toast.error("Original template no longer available");
        return;
      }
      setInitialTemplate(template);
      setInitialRunConfig({ ...config, scheduleEnabled: false });
      setTemplateScheduleMode(false);
      setTemplateDrawerOpen(true);
      return;
    }
    // No saved runConfig — try to match a template by report type name so the
    // user can re-configure from a clean form (covers demo reports and older history).
    const allTemplates = templateGroups.flatMap((g) => g.templates);
    const matched = allTemplates.find(
      (t) => t.name.toLowerCase() === report.type.toLowerCase(),
    ) ?? allTemplates[0] ?? null;
    setInitialTemplate(matched);
    setInitialRunConfig(null);
    setTemplateScheduleMode(false);
    setTemplateDrawerOpen(true);
  }, [templateGroups]);

  const handleReportGenerated = useCallback(
    (reportId: string) => {
      navigate(buildReportCenterPath("library", { reportId, collection: "all" }));
      setTemplateDrawerOpen(false);
      resetDrawerState();
    },
    [navigate, resetDrawerState],
  );

  const handleEditSchedule = useCallback((scheduleId: string) => {
    setEditingScheduleId(scheduleId);
  }, []);

  const handleEditScheduleFromReport = useCallback(
    (report: ReportHistoryItem) => {
      const schedule = getScheduleForReport(report.id, report.reportName);
      if (schedule) setEditingScheduleId(schedule.id);
      else openScheduleReport(getReportRunConfig(report));
    },
    [getScheduleForReport, openScheduleReport],
  );

  const handleTemplateDrawerChange = (open: boolean) => {
    setTemplateDrawerOpen(open);
    if (!open) resetDrawerState();
  };

  const headerCopy = sectionTitles[activeSection];

  return (
    <div style={{ display: "flex", height: "100vh", background: reportPageBg, fontFamily: F, overflow: "hidden" }}>
      <SkipToMainContent />
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopHeader />
        <main id="main-content" tabIndex={-1} className="app-report-page" style={{ flex: 1, overflowY: "auto", background: reportPageBg }}>
          <div className="app-report-page__header">
            <div>
              <h1 style={reportPageTitleStyle}>
                {headerCopy.title}
              </h1>
            </div>
            <div className="app-report-page__actions">
              {activeSection === "schedules" ? (
                <button type="button" onClick={() => openScheduleReport()} className="app-report-header-btn app-report-header-btn--primary">
                  <Plus size={13} aria-hidden /> Schedule Report
                </button>
              ) : (
                <button type="button" onClick={openGenerateReport} className="app-report-header-btn app-report-header-btn--primary">
                  <Plus size={13} aria-hidden /> New Report
                </button>
              )}
            </div>
          </div>

          <div className="app-report-center-layout">
            <ReportCenterNav
              activeSection={activeSection}
              onSectionChange={navigateToSection}
              counts={{
                library: navCounts.library,
                schedules: navCounts.schedules,
                templates: navCounts.templates,
              }}
            />

            <div className="app-report-center-content" style={{ fontFamily: reportFont }}>
              {activeSection === "library" && (
                <ReportLibrarySection
                  collection={libraryCollection}
                  selectedReportId={selectedReportId}
                  onSelectReport={navigateToReport}
                  onGenerateReport={openGenerateReport}
                  onScheduleReport={() => {
                    const report = history.find((r) => r.id === selectedReportId);
                    if (report) handleEditScheduleFromReport(report);
                    else openScheduleReport();
                  }}
                  onRunAgain={handleRunAgain}
                  onEditSchedule={handleEditSchedule}
                  onNavigateToSchedules={() => navigate(buildReportCenterPath("schedules"))}
                  onNavigateToCollection={navigateToCollection}
                />
              )}

              {activeSection === "schedules" && (
                <ScheduledReportsSection
                  onScheduleNew={() => openScheduleReport()}
                  onEditSchedule={handleEditSchedule}
                />
              )}

              {activeSection === "templates" && (
                <ReportTemplatesSection
                  onRunTemplate={openTemplate}
                  onViewReportOutput={(reportId) =>
                    navigate(buildReportCenterPath("library", { reportId, collection: "all" }))
                  }
                />
              )}

              {activeSection === "insights" && <ReportsInsightsSection />}
            </div>
          </div>
        </main>
      </div>

      <ReportTemplateDrawer
        open={templateDrawerOpen}
        onOpenChange={handleTemplateDrawerChange}
        scheduleMode={templateScheduleMode}
        initialTemplate={initialTemplate}
        initialRunConfig={initialRunConfig}
        onReportGenerated={handleReportGenerated}
      />

      <ScheduleEditDrawer
        open={editingScheduleId !== null}
        onOpenChange={(open) => {
          if (!open) setEditingScheduleId(null);
        }}
        schedule={editingSchedule}
      />
    </div>
  );
}

export function Reports() {
  return <ReportsPageInner />;
}
