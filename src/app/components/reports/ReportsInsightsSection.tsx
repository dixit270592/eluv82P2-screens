import { useMemo, useState, useEffect } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { fmtCurrency } from "../../data/reportOverviewData";
import { reportInsightsData } from "../../data/reportInsightsData";
import { buildReportCenterPath } from "../../utils/reportCenterRoutes";
import { useReports } from "../../context/ReportsContext";
import { ReportEmptyState } from "./ReportEmptyState";
import { ReportKpiStripSkeleton } from "./ReportSkeletons";
import { ReportSectionErrorBanner } from "./ReportSectionErrorBanner";
import {
  REPORT_RADIUS,
  reportFont,
  reportMetadataStyle,
  reportSectionSubtitleStyle,
  reportSectionTitleStyle,
} from "./reportUiStyles";

function TrendIndicator({ change, invert = false }: { change: number; invert?: boolean }) {
  const positive = invert ? change <= 0 : change >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
      {positive ? (
        <ArrowUpRight size={11} color="#059669" aria-hidden />
      ) : (
        <ArrowDownRight size={11} color="#D92D20" aria-hidden />
      )}
      <span style={{ fontSize: "11px", fontWeight: 500, color: positive ? "#059669" : "#D92D20" }}>
        {change > 0 ? "+" : ""}
        {change}%
      </span>
    </span>
  );
}

function KpiStripItem({
  label,
  value,
  change,
  changeLabel,
  invertTrend = false,
}: {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  invertTrend?: boolean;
}) {
  return (
    <div className="app-report-kpi-strip__item">
      <span className="app-report-kpi-strip__label">{label}</span>
      <div className="app-report-kpi-strip__value">{value}</div>
      <div className="app-report-kpi-strip__meta">
        <TrendIndicator change={change} invert={invertTrend} />
        <span className="app-report-kpi-strip__change-label">{changeLabel}</span>
      </div>
    </div>
  );
}

function DrillDownLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="app-report-insights-drilldown">
      {label}
      <ArrowRight size={12} aria-hidden />
    </Link>
  );
}

function ChartSection({
  title,
  drillDown,
  sampleData = false,
  children,
}: {
  title: string;
  drillDown?: { to: string; label: string };
  sampleData?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="app-report-insights-section">
      <div className="app-report-insights-section__header">
        <div className="app-report-insights-section__title-row">
          <h3 className="app-report-insights-section__title">{title}</h3>
          {sampleData && <span className="app-report-insights-sample-badge">Sample data</span>}
        </div>
        {drillDown && <DrillDownLink to={drillDown.to} label={drillDown.label} />}
      </div>
      {children}
    </div>
  );
}

function SpendTrendChart({
  data,
  chartLabel,
}: {
  data: { month: string; value: number; prev: number }[];
  chartLabel: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div
        role="img"
        aria-label={`${chartLabel}. ${data.map((d) => `${d.month} $${d.value.toLocaleString()}`).join(", ")}`}
        className="app-report-insights-spend-chart"
      >
        {data.map((d) => {
          const h = Math.round((d.value / max) * 100);
          const prevH = Math.round((d.prev / max) * 100);
          return (
            <div key={d.month} className="app-report-insights-spend-chart__col">
              <div className="app-report-insights-spend-chart__bars">
                <div
                  className="app-report-insights-spend-chart__bar app-report-insights-spend-chart__bar--prev"
                  style={{ height: prevH }}
                  title={`${d.month} prior year: ${fmtCurrency(d.prev)}`}
                />
                <div
                  className="app-report-insights-spend-chart__bar app-report-insights-spend-chart__bar--current"
                  style={{ height: h }}
                  title={`${d.month}: ${fmtCurrency(d.value)}`}
                />
              </div>
              <span className="app-report-insights-spend-chart__label">{d.month}</span>
            </div>
          );
        })}
      </div>
      <div className="app-report-insights-legend">
        <span className="app-report-insights-legend__item">
          <span className="app-report-insights-legend__swatch app-report-insights-legend__swatch--current" aria-hidden />
          Current
        </span>
        <span className="app-report-insights-legend__item">
          <span className="app-report-insights-legend__swatch app-report-insights-legend__swatch--prev" aria-hidden />
          Prior year
        </span>
      </div>
    </div>
  );
}

function HorizontalBarRow({
  label,
  value,
  pct,
  maxPct,
  color = "#1FA97A",
  trailing,
}: {
  label: string;
  value: string;
  pct: number;
  maxPct: number;
  color?: string;
  trailing?: React.ReactNode;
}) {
  const width = maxPct > 0 ? Math.round((pct / maxPct) * 100) : 0;
  return (
    <div className="app-report-bar-row">
      <div className="app-report-insights-bar-row__header">
        <span className="app-report-insights-bar-row__label">{label}</span>
        <span className="app-report-insights-bar-row__values">
          {trailing}
          <span className="app-report-insights-bar-row__value">{value}</span>
        </span>
      </div>
      <div className="app-report-insights-bar-row__track">
        <div className="app-report-insights-bar-row__fill" style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  );
}

function DepartmentBreakdownChart({
  rows,
}: {
  rows: Array<{ department: string; prs: number; pos: number; invoices: number }>;
}) {
  const max = Math.max(...rows.flatMap((row) => [row.prs, row.pos, row.invoices]), 1);
  return (
    <div className="app-report-insights-bar-list">
      {rows.map((row) => {
        const total = row.prs + row.pos + row.invoices;
        return (
          <HorizontalBarRow
            key={row.department}
            label={row.department}
            value={total.toLocaleString()}
            pct={total}
            maxPct={max * 3}
            trailing={
              <>
                <span className="app-report-insights-bar-row__meta">{row.prs} PRs</span>
                <span className="app-report-insights-bar-row__meta">{row.pos} POs</span>
                <span className="app-report-insights-bar-row__meta">{row.invoices} inv.</span>
              </>
            }
          />
        );
      })}
    </div>
  );
}

function StatusDistributionChart({ rows }: { rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="app-report-insights-bar-list">
      {rows.map((row) => (
        <HorizontalBarRow
          key={row.label}
          label={row.label}
          value={row.value.toLocaleString()}
          pct={row.value}
          maxPct={max}
          color="#1570EF"
        />
      ))}
    </div>
  );
}

function BudgetUtilizationChart({ rows }: { rows: typeof reportInsightsData.budgetVsActual }) {
  return (
    <div className="app-report-insights-bar-list">
      {rows.map((row) => {
        const utilColor = row.utilizationPct > 95 ? "#D92D20" : row.utilizationPct > 90 ? "#DC6803" : "#1FA97A";
        return (
          <HorizontalBarRow
            key={row.dept}
            label={row.dept}
            value={`${row.utilizationPct}%`}
            pct={row.utilizationPct}
            maxPct={100}
            color={utilColor}
            trailing={
              <>
                <span className="app-report-insights-bar-row__meta">{fmtCurrency(row.actual)}</span>
                <span className="app-report-insights-bar-row__meta">{fmtCurrency(row.variance)} left</span>
              </>
            }
          />
        );
      })}
    </div>
  );
}

function VendorSpendChart({ rows }: { rows: typeof reportInsightsData.vendorInsights }) {
  const maxAmount = Math.max(...rows.map((r) => r.amount), 1);
  return (
    <div className="app-report-insights-bar-list">
      {rows.map((row) => (
        <HorizontalBarRow
          key={row.name}
          label={row.name}
          value={fmtCurrency(row.amount)}
          pct={row.amount}
          maxPct={maxAmount}
          trailing={
            <>
              <span className="app-report-insights-bar-row__meta">{row.share}%</span>
              <span className="app-report-insights-bar-row__meta">{row.orders} orders</span>
              <TrendIndicator change={row.change} />
            </>
          }
        />
      ))}
    </div>
  );
}

function AtAGlanceStrip({ insights }: { insights: typeof reportInsightsData.summaryInsights }) {
  const markerClass = {
    neutral: "app-report-insights-takeaways__marker--neutral",
    positive: "app-report-insights-takeaways__marker--positive",
    warning: "app-report-insights-takeaways__marker--warning",
  } as const;

  return (
    <div className="app-report-insights-glance">
      <span className="app-report-insights-glance__label">At a glance</span>
      <div className="app-report-insights-glance__items">
        {insights.map((insight) => (
          <div key={insight.id} className="app-report-insights-glance__item">
            <span aria-hidden className={`app-report-insights-takeaways__marker ${markerClass[insight.tone]}`} />
            <span>{insight.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsInsightsSection() {
  const { overviewCounts, overviewCharts, reloadOverview, isLoadingOverview, overviewError } = useReports();
  const [overviewErrorDismissed, setOverviewErrorDismissed] = useState(false);

  useEffect(() => {
    setOverviewErrorDismissed(false);
  }, [overviewError]);
  // Phase 5 placeholders — Monthly Spend, Budget Utilization, Top Vendors await dedicated APIs.
  const placeholderData = reportInsightsData;

  const kpis = useMemo(() => {
    if (!overviewCounts) return [];
    return [
      { label: "Purchase Requests", value: overviewCounts.purchaseRequests.toLocaleString(), change: 0, changeLabel: "live count" },
      { label: "Purchase Orders", value: overviewCounts.purchaseOrders.toLocaleString(), change: 0, changeLabel: "live count" },
      { label: "Invoices", value: overviewCounts.invoices.toLocaleString(), change: 0, changeLabel: "live count" },
      { label: "Expenses", value: overviewCounts.expenses.toLocaleString(), change: 0, changeLabel: "live count" },
      { label: "CapEx PRs", value: overviewCounts.capExPRs.toLocaleString(), change: 0, changeLabel: "live count" },
    ];
  }, [overviewCounts]);

  const monthlyData = placeholderData.monthlySpend.slice(-12);
  const drillDowns = {
    spend: buildReportCenterPath("templates", { templateCategory: "ap" }),
    budget: buildReportCenterPath("templates", { templateCategory: "budget" }),
    vendor: buildReportCenterPath("templates", { templateCategory: "ap" }),
  };

  return (
    <div className="app-report-stack--insights" style={{ fontFamily: reportFont }}>
      {overviewError && (overviewCounts || overviewCharts) && !overviewErrorDismissed && (
        <ReportSectionErrorBanner
          message={overviewError}
          onRetry={() => void reloadOverview()}
          onDismiss={() => setOverviewErrorDismissed(true)}
        />
      )}
      <div className="app-report-insights-header-block">
        <div className="app-report-section-intro">
          <div>
            <div style={reportSectionTitleStyle}>Procurement Analytics</div>
            <div style={{ ...reportSectionSubtitleStyle, marginTop: "2px" }}>
              Spend, budget, and vendor performance
              {isLoadingOverview ? " · Loading live overview…" : overviewCounts ? " · Live KPIs from GetOverviewData" : " · Overview unavailable"}
            </div>
          </div>
          <span style={reportMetadataStyle}>{placeholderData.periodLabel}</span>
        </div>

        <AtAGlanceStrip insights={placeholderData.summaryInsights} />
        <p className="app-report-insights-sample-note">At-a-glance insights use sample data until Phase 5 analytics APIs ship.</p>
      </div>

      {isLoadingOverview && !overviewCounts ? (
        <ReportKpiStripSkeleton items={5} />
      ) : overviewError && !overviewCounts ? (
        <ReportEmptyState
          variant="error"
          title="Unable to load overview"
          description={overviewError}
          action={{ label: "Try again", onClick: () => void reloadOverview() }}
        />
      ) : (
      <div className="app-report-kpi-strip" style={{ borderRadius: REPORT_RADIUS }}>
        {kpis.length === 0 ? (
          <div className="app-report-kpi-strip__item">
            <span className="app-report-kpi-strip__label">Overview data unavailable</span>
          </div>
        ) : (
          kpis.map((kpi) => (
            <KpiStripItem
              key={kpi.label}
              {...kpi}
              invertTrend={
                kpi.label.includes("Time") ||
                kpi.label.includes("Pending") ||
                kpi.label.includes("Variance") ||
                kpi.label.includes("Over")
              }
            />
          ))
        )}
      </div>
      )}

      {overviewCharts && (overviewCharts.departmentBreakdown.length > 0 || overviewCharts.statusDistribution.length > 0) && (
        <div className="app-report-charts-row app-report-charts-row--insights">
          {overviewCharts.departmentBreakdown.length > 0 && (
            <ChartSection title="Transaction Overview — Department Breakdown">
              <DepartmentBreakdownChart rows={overviewCharts.departmentBreakdown} />
            </ChartSection>
          )}
          {overviewCharts.statusDistribution.length > 0 && (
            <ChartSection title="Transaction Overview — Status Distribution">
              <StatusDistributionChart rows={overviewCharts.statusDistribution} />
            </ChartSection>
          )}
        </div>
      )}

      <ChartSection title="Monthly Spend" sampleData drillDown={{ to: drillDowns.spend, label: "Spending reports" }}>
        <SpendTrendChart data={monthlyData} chartLabel="Monthly spend trend" />
      </ChartSection>

      <div className="app-report-charts-row app-report-charts-row--insights">
        <ChartSection title="Budget Utilization" sampleData drillDown={{ to: drillDowns.budget, label: "Budget reports" }}>
          <BudgetUtilizationChart rows={placeholderData.budgetVsActual} />
        </ChartSection>
        <ChartSection title="Top Vendors" sampleData drillDown={{ to: drillDowns.vendor, label: "Vendor reports" }}>
          <VendorSpendChart rows={placeholderData.vendorInsights} />
        </ChartSection>
      </div>
    </div>
  );
}
