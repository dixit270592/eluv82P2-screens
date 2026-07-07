import type { MonthlySpendPoint, OverviewKpi } from "./reportOverviewData";
import { reportOverviewByCategory } from "./reportOverviewData";

export type InsightSummary = {
  id: string;
  title: string;
  text: string;
  tone: "neutral" | "positive" | "warning";
};

export type VendorInsightRow = {
  name: string;
  amount: number;
  orders: number;
  share: number;
  change: number;
};

export type BudgetActualRow = {
  dept: string;
  actual: number;
  budget: number;
  variance: number;
  utilizationPct: number;
};

export type InsightsDashboardData = {
  periodLabel: string;
  kpis: OverviewKpi[];
  monthlySpend: MonthlySpendPoint[];
  spendChartSubtitle: string;
  budgetVsActual: BudgetActualRow[];
  vendorInsights: VendorInsightRow[];
  summaryInsights: InsightSummary[];
};

const spending = reportOverviewByCategory.spending;
const budget = reportOverviewByCategory.budget;
const approvals = reportOverviewByCategory.approvals;
const vendor = reportOverviewByCategory.vendor;

export const reportInsightsData: InsightsDashboardData = {
  periodLabel: "Year to date · Jul 2025 – Jun 2026",
  kpis: [
    spending.kpis[0],
    budget.kpis[1],
    spending.kpis[3],
    approvals.kpis[2],
    vendor.kpis[2],
  ],
  monthlySpend: spending.monthlySpend,
  spendChartSubtitle: spending.chartSubtitle,
  budgetVsActual: budget.departmentSpend.slice(0, 5).map((d) => ({
    dept: d.dept,
    actual: d.amount,
    budget: d.budget,
    variance: d.budget - d.amount,
    utilizationPct: d.pct,
  })),
  vendorInsights: vendor.topVendors.slice(0, 5).map((v) => ({
    name: v.name,
    amount: v.amount,
    orders: v.orders,
    share: v.pct,
    change: v.name === "Dell Technologies" ? 9.2 : v.name === "Microsoft Corporation" ? 6.4 : v.name === "Amazon Web Services" ? 18.1 : v.name === "CDW Corporation" ? 22.0 : 3.8,
  })),
  summaryInsights: [
    {
      id: "budget-ops",
      title: "Budget",
      text: "Operations at 92% budget — $24K remaining before fiscal close.",
      tone: "warning",
    },
    {
      id: "approval-speed",
      title: "Approvals",
      text: "Approval flow is improving — Engineering and IT show the largest gains.",
      tone: "positive",
    },
    {
      id: "vendor-concentration",
      title: "Vendor mix",
      text: "Dell and Microsoft remain the largest concentration risk in the vendor mix.",
      tone: "neutral",
    },
  ],
};
