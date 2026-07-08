import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { Copy, ExternalLink, Play, Trash2 } from "lucide-react";
import { useReports } from "../../context/ReportsContext";
import {
  reportTemplateCategories,
  type ReportTemplate,
  type ReportTemplateCategory,
} from "../../data/reportTemplates";
import { ReportEmptyState } from "./ReportEmptyState";
import { ReportTemplateGridSkeleton } from "./ReportSkeletons";
import { ReportSectionErrorBanner } from "./ReportSectionErrorBanner";
import {
  reportFont,
  onDestructiveHover,
} from "./reportUiStyles";
import { parseTemplateCategoryFromSearch } from "../../utils/reportCenterRoutes";

const MAX_VISIBLE_TAGS = 3;

type ClonedTemplate = ReportTemplate & { cloneOf: string };

export function ReportTemplatesSection({
  onRunTemplate,
  onViewReportOutput,
}: {
  onRunTemplate: (template: ReportTemplate) => void;
  onViewReportOutput?: (reportId: string) => void;
}) {
  const { addActivity, findLatestReportByTemplateId, templateGroups, reloadTemplates, isLoadingTemplates, templatesError } = useReports();
  const location = useLocation();
  const routeCategory = useMemo(
    () => parseTemplateCategoryFromSearch(location.search),
    [location.search],
  );
  const [activeCategory, setActiveCategory] = useState<ReportTemplateCategory>(routeCategory);
  const [clones, setClones] = useState<ClonedTemplate[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [templatesErrorDismissed, setTemplatesErrorDismissed] = useState(false);

  useEffect(() => {
    setTemplatesErrorDismissed(false);
  }, [templatesError]);

  useEffect(() => {
    setActiveCategory(routeCategory);
  }, [routeCategory]);

  const filteredGroups = useMemo(() => {
    return templateGroups
      .filter((g) => activeCategory === "all" || g.id === activeCategory)
      .map((g) => {
        const groupClones = clones.filter((c) => c.cloneOf.startsWith(g.id));
        return {
          ...g,
          templates: [...g.templates, ...groupClones] as (ReportTemplate | ClonedTemplate)[],
        };
      });
  }, [activeCategory, clones, templateGroups]);

  const handleClone = (template: ReportTemplate) => {
    const cloneId = `${template.id}-copy-${Date.now()}`;
    setClones((prev) => [
      ...prev,
      {
        ...template,
        id: cloneId,
        name: `${template.name} (Copy)`,
        popular: false,
        cloneOf: template.id,
      },
    ]);
    addActivity("template_cloned", `Cloned template: ${template.name}`);
  };

  const handleDeleteClone = (cloneId: string) => {
    setDeletingId(cloneId);
    setTimeout(() => {
      setClones((prev) => prev.filter((c) => c.id !== cloneId));
      setDeletingId(null);
    }, 200);
  };

  const showInitialLoad = isLoadingTemplates && templateGroups.length === 0;
  const showLoadError = Boolean(templatesError) && !isLoadingTemplates && templateGroups.length === 0;
  const hasTemplates = filteredGroups.some((group) => group.templates.length > 0);

  return (
    <div className="app-report-templates-layout" style={{ fontFamily: reportFont }}>
      {templatesError && templateGroups.length > 0 && !templatesErrorDismissed && (
        <ReportSectionErrorBanner
          message={templatesError}
          onRetry={() => void reloadTemplates()}
          onDismiss={() => setTemplatesErrorDismissed(true)}
        />
      )}
      <div className="app-report-template-category-tabs" role="tablist" aria-label="Template categories">
        {reportTemplateCategories.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCategory(cat.id)}
              className={`app-report-template-category-tab${active ? " app-report-template-category-tab--active" : ""}`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {showInitialLoad ? (
        <ReportTemplateGridSkeleton cards={6} />
      ) : showLoadError ? (
        <ReportEmptyState
          variant="error"
          title="Unable to load templates"
          description={templatesError ?? "Something went wrong while loading report templates."}
          action={{ label: "Try again", onClick: () => void reloadTemplates() }}
        />
      ) : !hasTemplates ? (
        <ReportEmptyState
          title="No templates available"
          description="Report templates from the API will appear here once loaded."
        />
      ) : (
      filteredGroups.map((group) => (
        <div key={group.id} className="app-report-template-group">
          <h3 className="app-report-template-group__title">{group.label}</h3>
          <div className="app-report-template-grid">
              {group.templates.map((template) => {
                const isClone = "cloneOf" in template;
                const isDeleting = deletingId === template.id;
                const sourceId = isClone ? (template as ClonedTemplate).cloneOf : template.id;
                const tags = (template.parameters ?? []).map((tag) => tag.toUpperCase());
                const latestRun = !isClone ? findLatestReportByTemplateId(sourceId) : undefined;

                const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
                const extraTags = tags.length - MAX_VISIBLE_TAGS;

                if (isDeleting) return null;

                return (
                  <div key={template.id} className="app-report-template-card">
                    <div className="app-report-template-card__header">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="app-report-template-card__title-row">
                          <span className="app-report-template-card__title">{template.name}</span>
                          {template.popular && <span className="app-report-popular-badge">Popular</span>}
                          {isClone && (
                            <span className="app-report-label-badge app-report-label-badge--brand">Custom</span>
                          )}
                        </div>
                        <p className="app-report-template-card__desc">{template.description}</p>
                        {visibleTags.length > 0 && (
                          <div className="app-report-template-card__tags">
                            {visibleTags.map((tag) => (
                              <span key={tag} className="app-report-template-param-tag">{tag}</span>
                            ))}
                            {extraTags > 0 && (
                              <span className="app-report-template-param-tag app-report-template-param-tag--more">
                                +{extraTags} more
                              </span>
                            )}
                          </div>
                        )}
                        <div className="app-report-template-card__meta">
                          <span className="app-report-template-last-run">
                            Last run: {latestRun?.lastRun ?? "—"}
                          </span>
                          {latestRun && onViewReportOutput && (
                            <button
                              type="button"
                              onClick={() => onViewReportOutput(latestRun.id)}
                              className="app-report-template-view-output"
                            >
                              <ExternalLink size={11} aria-hidden />
                              View output
                            </button>
                          )}
                        </div>
                      </div>
                      {isClone && (
                        <button
                          type="button"
                          onClick={() => handleDeleteClone(template.id)}
                          aria-label="Delete this copy"
                          className="app-report-icon-action app-report-icon-action--danger"
                          onMouseEnter={(e) => onDestructiveHover(e, true)}
                          onMouseLeave={(e) => onDestructiveHover(e, false)}
                        >
                          <Trash2 size={13} aria-hidden />
                        </button>
                      )}
                    </div>

                    <div className="app-report-template-card__actions">
                      <button
                        type="button"
                        onClick={() => onRunTemplate(template)}
                        className="app-report-template-btn app-report-template-btn--primary"
                      >
                        <Play size={12} aria-hidden />
                        Run Report
                      </button>
                      {!isClone && (
                        <button
                          type="button"
                          onClick={() => handleClone(template)}
                          className="app-report-template-btn app-report-template-btn--secondary"
                        >
                          <Copy size={12} aria-hidden />
                          Clone
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))
      )}
    </div>
  );
}
