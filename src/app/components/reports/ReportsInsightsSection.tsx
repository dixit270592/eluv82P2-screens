import { useMemo, useState, useEffect } from "react";

import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import { Link } from "react-router";

import { reportInsightsData } from "../../data/reportInsightsData";

import { buildReportCenterPath } from "../../utils/reportCenterRoutes";

import { useReports } from "../../context/ReportsContext";

import { ReportEmptyState } from "./ReportEmptyState";

import { ReportKpiStripSkeleton } from "./ReportSkeletons";

import { ReportSectionErrorBanner } from "./ReportSectionErrorBanner";

import {

  BudgetUtilizationChart,

  DepartmentBreakdownChart,

  MonthlySpendTrendChart,

  StatusDistributionDonutChart,

  TransactionMixDonutChart,

  VendorSpendChart,

} from "./ReportInsightsCharts";

import {

  REPORT_RADIUS,

  reportFont,

  reportMetadataStyle,

  reportSectionSubtitleStyle,

  reportSectionTitleStyle,

} from "./reportUiStyles";



function LiveCountIndicator({ label }: { label: string }) {

  return (

    <Tooltip>

      <TooltipTrigger asChild>

        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", cursor: "default" }}>

          <ArrowUpRight size={11} color="#059669" aria-hidden />

          <span style={{ fontSize: "11px", fontWeight: 500, color: "#059669" }}>{label}</span>

        </span>

      </TooltipTrigger>

      <TooltipContent side="top" sideOffset={6} className="bg-[#101828] text-white text-[11px] max-w-[240px]">

        Trend comparison will be available when historical data APIs are implemented

      </TooltipContent>

    </Tooltip>

  );

}



function KpiStripItem({
  label,
  value,
  changeLabel,
  liveCount = false,
}: {
  label: string;
  value: string;
  changeLabel: string;
  liveCount?: boolean;
}) {

  return (

    <div className="app-report-kpi-strip__item">

      <span className="app-report-kpi-strip__label">{label}</span>

      <div className="app-report-kpi-strip__value">{value}</div>

      <div className="app-report-kpi-strip__meta">

        {liveCount ? (

          <LiveCountIndicator label={changeLabel} />

        ) : (

          <span className="app-report-kpi-strip__change-label">{changeLabel}</span>

        )}

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



function AtAGlanceStrip({ insights }: { insights: typeof reportInsightsData.summaryInsights }) {
  return (
    <div className="app-report-insights-glance" aria-label="At a glance insights">
      <span className="app-report-insights-glance__label">At a glance</span>
      <ul className="app-report-insights-glance__list">
        {insights.map((insight) => (
          <li key={insight.id} className="app-report-insights-glance__item">
            <span
              aria-hidden
              className={`app-report-insights-glance__dot app-report-insights-glance__dot--${insight.tone}`}
            />
            <span className="app-report-insights-glance__text">
              <strong>{insight.title}:</strong> {insight.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}



export function ReportsInsightsSection() {

  const { overviewCounts, overviewCharts, reloadOverview, isLoadingOverview, overviewError } = useReports();

  const [overviewErrorDismissed, setOverviewErrorDismissed] = useState(false);



  useEffect(() => {

    setOverviewErrorDismissed(false);

  }, [overviewError]);



  const placeholderData = reportInsightsData;



  const kpis = useMemo(() => {

    if (!overviewCounts) return [];

    return [

      { label: "Purchase Requests", value: overviewCounts.purchaseRequests.toLocaleString(), changeLabel: "live count" },

      { label: "Purchase Orders", value: overviewCounts.purchaseOrders.toLocaleString(), changeLabel: "live count" },

      { label: "Invoices", value: overviewCounts.invoices.toLocaleString(), changeLabel: "live count" },

      { label: "Expenses", value: overviewCounts.expenses.toLocaleString(), changeLabel: "live count" },

      { label: "CapEx PRs", value: overviewCounts.capExPRs.toLocaleString(), changeLabel: "live count" },

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

                liveCount

              />

            ))

          )}

        </div>

      )}



      {(overviewCounts || (overviewCharts?.statusDistribution.length ?? 0) > 0) && (
        <div className="app-report-charts-row app-report-charts-row--insights">
          {overviewCounts && (
            <ChartSection title="Transaction Mix">
              <TransactionMixDonutChart counts={overviewCounts} />
            </ChartSection>
          )}
          {(overviewCharts?.statusDistribution.length ?? 0) > 0 && (
            <ChartSection title="Status Distribution">
              <StatusDistributionDonutChart rows={overviewCharts!.statusDistribution} />
            </ChartSection>
          )}
        </div>
      )}

      <div className="app-report-charts-row app-report-charts-row--insights">
        <ChartSection
          title="Monthly Spend"
          sampleData
          drillDown={{ to: drillDowns.spend, label: "Spending reports" }}
        >
          <MonthlySpendTrendChart data={monthlyData} chartLabel="Monthly spend trend" />
        </ChartSection>

        {overviewCharts && overviewCharts.departmentBreakdown.length > 0 && (
          <ChartSection title="Department Breakdown">
            <DepartmentBreakdownChart rows={overviewCharts.departmentBreakdown} />
          </ChartSection>
        )}
      </div>



      <div className="app-report-charts-row app-report-charts-row--insights">

        <ChartSection

          title="Budget Utilization"

          sampleData

          drillDown={{ to: drillDowns.budget, label: "Budget reports" }}

        >

          <BudgetUtilizationChart rows={placeholderData.budgetVsActual} />

        </ChartSection>

        <ChartSection

          title="Top Vendors"

          sampleData

          drillDown={{ to: drillDowns.vendor, label: "Vendor reports" }}

        >

          <VendorSpendChart rows={placeholderData.vendorInsights} />

        </ChartSection>

      </div>

    </div>

  );

}

