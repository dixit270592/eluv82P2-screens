export type ReportCategoryId =
  | "spending"
  | "purchase_requests"
  | "vendor"
  | "approvals"
  | "budget"
  | "department"
  | "category"
  | "capex";

export type OverviewKpi = {
  label: string;
  value: string;
  rawValue: number;
  change: number;
  changeLabel: string;
};

export type MonthlySpendPoint = {
  month: string;
  value: number;
  prev: number;
  dateIso: string;
};

export type VendorRow = { name: string; amount: number; orders: number; pct: number };
export type DeptRow = { dept: string; amount: number; budget: number; pct: number };

export type TransactionRow = {
  id: string;
  desc: string;
  dept: string;
  vendor: string;
  amount: number;
  status: string;
  date: string;
  dateIso: string;
};

export type CategoryOverviewData = {
  kpis: OverviewKpi[];
  monthlySpend: MonthlySpendPoint[];
  topVendors: VendorRow[];
  departmentSpend: DeptRow[];
  transactions: TransactionRow[];
  chartSubtitle: string;
  tableTitle: string;
  vendorChartTitle: string;
  budgetChartTitle: string;
};

const monthlyBase: MonthlySpendPoint[] = [
  { month: "Jul", value: 142000, prev: 128000, dateIso: "2025-07-15" },
  { month: "Aug", value: 186000, prev: 154000, dateIso: "2025-08-15" },
  { month: "Sep", value: 164000, prev: 171000, dateIso: "2025-09-15" },
  { month: "Oct", value: 198000, prev: 182000, dateIso: "2025-10-15" },
  { month: "Nov", value: 224000, prev: 196000, dateIso: "2025-11-15" },
  { month: "Dec", value: 189000, prev: 203000, dateIso: "2025-12-15" },
  { month: "Jan", value: 211000, prev: 188000, dateIso: "2026-01-15" },
  { month: "Feb", value: 248000, prev: 214000, dateIso: "2026-02-15" },
  { month: "Mar", value: 232000, prev: 221000, dateIso: "2026-03-15" },
  { month: "Apr", value: 276000, prev: 238000, dateIso: "2026-04-15" },
  { month: "May", value: 261000, prev: 249000, dateIso: "2026-05-15" },
  { month: "Jun", value: 294000, prev: 267000, dateIso: "2026-06-15" },
];

const txBase: TransactionRow[] = [
  { id: "PR-2026-0189", desc: "Engineering Equipment Q1 2026", dept: "Engineering", vendor: "Dell Technologies", amount: 11386.66, status: "approved", date: "Jun 26, 2026", dateIso: "2026-06-26" },
  { id: "PR-2026-0188", desc: "Software Licenses Renewal", dept: "IT", vendor: "Microsoft Corporation", amount: 24500.0, status: "approved", date: "Jun 24, 2026", dateIso: "2026-06-24" },
  { id: "PR-2026-0187", desc: "Office Furniture - HQ Expansion", dept: "Human Resources", vendor: "Herman Miller", amount: 8750.0, status: "approved", date: "Jun 20, 2026", dateIso: "2026-06-20" },
  { id: "PR-2026-0186", desc: "Cloud Infrastructure Services", dept: "IT", vendor: "Amazon Web Services", amount: 15000.0, status: "approved", date: "Jun 15, 2026", dateIso: "2026-06-15" },
  { id: "PR-2026-0185", desc: "Lab Safety Equipment", dept: "Engineering", vendor: "Grainger Industrial", amount: 5420.0, status: "approved", date: "Jun 12, 2026", dateIso: "2026-06-12" },
  { id: "PR-2026-0184", desc: "Marketing Materials Q2", dept: "Marketing", vendor: "Staples Business", amount: 3200.0, status: "approved", date: "Jun 10, 2026", dateIso: "2026-06-10" },
  { id: "PR-2026-0183", desc: "Network Infrastructure Upgrade", dept: "IT", vendor: "CDW Corporation", amount: 49300.0, status: "approved", date: "Jun 08, 2026", dateIso: "2026-06-08" },
  { id: "PR-2026-0182", desc: "Training Materials - Leadership", dept: "Human Resources", vendor: "LinkedIn Learning", amount: 6800.0, status: "approved", date: "Jun 05, 2026", dateIso: "2026-06-05" },
  { id: "PR-2026-0175", desc: "Q1 Facilities Maintenance", dept: "Operations", vendor: "Grainger Industrial", amount: 12400.0, status: "approved", date: "Mar 18, 2026", dateIso: "2026-03-18" },
  { id: "PR-2026-0162", desc: "Annual Security Audit Tools", dept: "IT", vendor: "CDW Corporation", amount: 8900.0, status: "submitted", date: "Feb 04, 2026", dateIso: "2026-02-04" },
  { id: "PR-2026-0155", desc: "CapEx Server Refresh", dept: "Engineering", vendor: "Dell Technologies", amount: 67800.0, status: "approved", date: "Jan 22, 2026", dateIso: "2026-01-22" },
];

export const reportCategoryMeta: Record<
  ReportCategoryId,
  { label: string; description: string; accent: string }
> = {
  spending: { label: "Spending Overview", description: "Total spend, trends, and breakdowns", accent: "#1FA97A" },
  purchase_requests: { label: "Purchase Requests", description: "PR volume, status, and cycle time", accent: "#E8956D" },
  vendor: { label: "Vendor Analysis", description: "Top vendors, categories, and contracts", accent: "#1A7A6E" },
  approvals: { label: "Approval Performance", description: "Approval rates and turnaround times", accent: "#7B5EA7" },
  budget: { label: "Budget vs Actual", description: "Budget utilization by department", accent: "#2887C8" },
  department: { label: "Department Breakdown", description: "Spend and activity by department", accent: "#D97706" },
  category: { label: "Category Spend", description: "Spend analysis by GL category", accent: "#059669" },
  capex: { label: "CapEx Requests", description: "Capital expenditure tracking", accent: "#DC2626" },
};

export const reportOverviewByCategory: Record<ReportCategoryId, CategoryOverviewData> = {
  spending: {
    kpis: [
      { label: "Total Spend", value: "$2.01M", rawValue: 2010000, change: 9.4, changeLabel: "vs last year" },
      { label: "Approved PRs", value: "189", rawValue: 189, change: 12.1, changeLabel: "vs last year" },
      { label: "Avg Order Value", value: "$10,635", rawValue: 10635, change: -2.8, changeLabel: "vs last year" },
      { label: "Avg Approval Time", value: "1.8 days", rawValue: 1.8, change: -18.4, changeLabel: "faster than last yr" },
    ],
    monthlySpend: monthlyBase,
    topVendors: [
      { name: "Dell Technologies", amount: 284500, orders: 18, pct: 14.2 },
      { name: "Microsoft Corporation", amount: 246000, orders: 12, pct: 12.3 },
      { name: "Amazon Web Services", amount: 198400, orders: 24, pct: 9.9 },
      { name: "Herman Miller", amount: 87500, orders: 6, pct: 4.4 },
      { name: "Grainger Industrial", amount: 76200, orders: 31, pct: 3.8 },
    ],
    departmentSpend: [
      { dept: "Information Technology", amount: 612000, budget: 700000, pct: 87.4 },
      { dept: "Engineering", amount: 438000, budget: 500000, pct: 87.6 },
      { dept: "Human Resources", amount: 187000, budget: 200000, pct: 93.5 },
      { dept: "Finance & Accounting", amount: 124000, budget: 150000, pct: 82.7 },
      { dept: "Marketing", amount: 98000, budget: 120000, pct: 81.7 },
      { dept: "Operations", amount: 276000, budget: 300000, pct: 92.0 },
    ],
    transactions: txBase,
    chartSubtitle: "Jul 2025 – Jun 2026",
    tableTitle: "Approved Transactions",
    vendorChartTitle: "Top Vendors by Spend",
    budgetChartTitle: "Budget Utilization by Department",
  },
  purchase_requests: {
    kpis: [
      { label: "Total PRs", value: "312", rawValue: 312, change: 8.2, changeLabel: "vs last year" },
      { label: "Approved", value: "189", rawValue: 189, change: 12.1, changeLabel: "approval rate 60.6%" },
      { label: "Pending", value: "47", rawValue: 47, change: -5.0, changeLabel: "vs last month" },
      { label: "Avg Cycle Time", value: "3.2 days", rawValue: 3.2, change: -11.0, changeLabel: "faster than last yr" },
    ],
    monthlySpend: monthlyBase.map((m) => ({ ...m, value: Math.round(m.value / 6500), prev: Math.round(m.prev / 6500) })),
    topVendors: [
      { name: "Standard PR", amount: 198, orders: 198, pct: 63.5 },
      { name: "CapEx Request", amount: 42, orders: 42, pct: 13.5 },
      { name: "Emergency Purchase", amount: 28, orders: 28, pct: 9.0 },
      { name: "Contract Renewal", amount: 24, orders: 24, pct: 7.7 },
      { name: "Blanket Release", amount: 20, orders: 20, pct: 6.4 },
    ],
    departmentSpend: [
      { dept: "Engineering", amount: 89, budget: 100, pct: 89.0 },
      { dept: "Information Technology", amount: 76, budget: 85, pct: 89.4 },
      { dept: "Operations", amount: 54, budget: 60, pct: 90.0 },
      { dept: "Marketing", amount: 31, budget: 40, pct: 77.5 },
      { dept: "Human Resources", amount: 28, budget: 35, pct: 80.0 },
      { dept: "Finance & Accounting", amount: 34, budget: 40, pct: 85.0 },
    ],
    transactions: txBase.map((t) => ({ ...t, desc: `[PR] ${t.desc}` })),
    chartSubtitle: "PR volume by month",
    tableTitle: "Recent Purchase Requests",
    vendorChartTitle: "PRs by Request Type",
    budgetChartTitle: "PR Volume by Department",
  },
  vendor: {
    kpis: [
      { label: "Active Vendors", value: "84", rawValue: 84, change: 4.0, changeLabel: "vs last quarter" },
      { label: "Total Vendor Spend", value: "$1.82M", rawValue: 1820000, change: 7.1, changeLabel: "vs last year" },
      { label: "Top 5 Share", value: "42.3%", rawValue: 42.3, change: 2.1, changeLabel: "concentration up" },
      { label: "New Vendors", value: "12", rawValue: 12, change: 20.0, changeLabel: "this quarter" },
    ],
    monthlySpend: monthlyBase.map((m) => ({ ...m, value: Math.round(m.value * 0.92), prev: Math.round(m.prev * 0.9) })),
    topVendors: [
      { name: "Dell Technologies", amount: 284500, orders: 18, pct: 15.6 },
      { name: "Microsoft Corporation", amount: 246000, orders: 12, pct: 13.5 },
      { name: "Amazon Web Services", amount: 198400, orders: 24, pct: 10.9 },
      { name: "Herman Miller", amount: 87500, orders: 6, pct: 4.8 },
      { name: "Grainger Industrial", amount: 76200, orders: 31, pct: 4.2 },
      { name: "Staples Business", amount: 54800, orders: 47, pct: 3.0 },
      { name: "CDW Corporation", amount: 49300, orders: 9, pct: 2.7 },
    ],
    departmentSpend: [
      { dept: "IT Vendors", amount: 820000, budget: 900000, pct: 91.1 },
      { dept: "Facilities", amount: 210000, budget: 250000, pct: 84.0 },
      { dept: "Professional Services", amount: 380000, budget: 420000, pct: 90.5 },
      { dept: "Office Supplies", amount: 95000, budget: 120000, pct: 79.2 },
      { dept: "Hardware", amount: 315000, budget: 350000, pct: 90.0 },
    ],
    transactions: txBase.filter((t) => ["Dell Technologies", "Microsoft Corporation", "Amazon Web Services"].includes(t.vendor)),
    chartSubtitle: "Vendor spend trend",
    tableTitle: "Top Vendor Transactions",
    vendorChartTitle: "Vendor Spend Ranking",
    budgetChartTitle: "Spend by Vendor Category",
  },
  approvals: {
    kpis: [
      { label: "Approval Rate", value: "94.2%", rawValue: 94.2, change: 1.8, changeLabel: "vs last quarter" },
      { label: "Avg Turnaround", value: "1.8 days", rawValue: 1.8, change: -18.4, changeLabel: "faster" },
      { label: "Pending Approvals", value: "23", rawValue: 23, change: -12.0, changeLabel: "vs last week" },
      { label: "Policy Exceptions", value: "7", rawValue: 7, change: -30.0, changeLabel: "vs last month" },
    ],
    monthlySpend: monthlyBase.map((m) => ({ ...m, value: Math.round(m.value / 12000), prev: Math.round(m.prev / 12000) })),
    topVendors: [
      { name: "Sarah Chen", amount: 142, orders: 142, pct: 28.0 },
      { name: "Michael Torres", amount: 118, orders: 118, pct: 23.2 },
      { name: "Priya Patel", amount: 96, orders: 96, pct: 18.9 },
      { name: "James Wilson", amount: 87, orders: 87, pct: 17.1 },
      { name: "Ops Team Pool", amount: 64, orders: 64, pct: 12.6 },
    ],
    departmentSpend: [
      { dept: "Engineering", amount: 1.2, budget: 2.0, pct: 60.0 },
      { dept: "IT", amount: 1.5, budget: 2.0, pct: 75.0 },
      { dept: "Finance", amount: 0.9, budget: 1.5, pct: 60.0 },
      { dept: "HR", amount: 1.1, budget: 1.5, pct: 73.3 },
      { dept: "Marketing", amount: 2.1, budget: 2.5, pct: 84.0 },
      { dept: "Operations", amount: 1.8, budget: 2.0, pct: 90.0 },
    ],
    transactions: txBase.map((t) => ({
      ...t,
      desc: `Approval: ${t.desc}`,
      status: t.status === "approved" ? "approved" : "submitted",
    })),
    chartSubtitle: "Approvals processed by month",
    tableTitle: "Requests in Approval Workflow",
    vendorChartTitle: "Approvals by Approver",
    budgetChartTitle: "Avg Approval Time by Dept (days)",
  },
  budget: {
    kpis: [
      { label: "Total Budget", value: "$1.97M", rawValue: 1970000, change: 5.0, changeLabel: "annual allocation" },
      { label: "Actual Spend", value: "$1.74M", rawValue: 1740000, change: 9.4, changeLabel: "88.3% utilized" },
      { label: "Departments Over", value: "2", rawValue: 2, change: 0, changeLabel: "of 6 tracked" },
      { label: "Forecast Variance", value: "-3.2%", rawValue: -3.2, change: -3.2, changeLabel: "under budget" },
    ],
    monthlySpend: monthlyBase,
    topVendors: [
      { name: "Information Technology", amount: 612000, orders: 0, pct: 87.4 },
      { name: "Engineering", amount: 438000, orders: 0, pct: 87.6 },
      { name: "Operations", amount: 276000, orders: 0, pct: 92.0 },
      { name: "Human Resources", amount: 187000, orders: 0, pct: 93.5 },
      { name: "Finance & Accounting", amount: 124000, orders: 0, pct: 82.7 },
    ],
    departmentSpend: [
      { dept: "Information Technology", amount: 612000, budget: 700000, pct: 87.4 },
      { dept: "Engineering", amount: 438000, budget: 500000, pct: 87.6 },
      { dept: "Human Resources", amount: 187000, budget: 200000, pct: 93.5 },
      { dept: "Finance & Accounting", amount: 124000, budget: 150000, pct: 82.7 },
      { dept: "Marketing", amount: 98000, budget: 120000, pct: 81.7 },
      { dept: "Operations", amount: 276000, budget: 300000, pct: 92.0 },
    ],
    transactions: txBase,
    chartSubtitle: "Budget burn rate",
    tableTitle: "Budget-Impacting Transactions",
    vendorChartTitle: "Budget Utilization by Department",
    budgetChartTitle: "Actual vs Budget by Department",
  },
  department: {
    kpis: [
      { label: "Departments Active", value: "6", rawValue: 6, change: 0, changeLabel: "this period" },
      { label: "Highest Spend", value: "IT", rawValue: 612000, change: 11.2, changeLabel: "$612K total" },
      { label: "Lowest Utilization", value: "Marketing", rawValue: 81.7, change: -4.0, changeLabel: "81.7% of budget" },
      { label: "Cross-Dept PRs", value: "14", rawValue: 14, change: 8.0, changeLabel: "shared approvals" },
    ],
    monthlySpend: monthlyBase.map((m, i) => ({
      ...m,
      value: Math.round(m.value * (0.7 + (i % 3) * 0.1)),
      prev: Math.round(m.prev * (0.68 + (i % 3) * 0.1)),
    })),
    topVendors: [
      { name: "Information Technology", amount: 612000, orders: 76, pct: 30.4 },
      { name: "Engineering", amount: 438000, orders: 89, pct: 21.8 },
      { name: "Operations", amount: 276000, orders: 54, pct: 13.7 },
      { name: "Human Resources", amount: 187000, orders: 28, pct: 9.3 },
      { name: "Finance & Accounting", amount: 124000, orders: 34, pct: 6.2 },
    ],
    departmentSpend: [
      { dept: "Information Technology", amount: 612000, budget: 700000, pct: 87.4 },
      { dept: "Engineering", amount: 438000, budget: 500000, pct: 87.6 },
      { dept: "Operations", amount: 276000, budget: 300000, pct: 92.0 },
      { dept: "Human Resources", amount: 187000, budget: 200000, pct: 93.5 },
      { dept: "Marketing", amount: 98000, budget: 120000, pct: 81.7 },
      { dept: "Finance & Accounting", amount: 124000, budget: 150000, pct: 82.7 },
    ],
    transactions: txBase,
    chartSubtitle: "Department spend trend",
    tableTitle: "Transactions by Department",
    vendorChartTitle: "Spend Share by Department",
    budgetChartTitle: "Department Budget Utilization",
  },
  category: {
    kpis: [
      { label: "GL Categories", value: "18", rawValue: 18, change: 0, changeLabel: "active" },
      { label: "Software & Licenses", value: "$486K", rawValue: 486000, change: 14.2, changeLabel: "top category" },
      { label: "Hardware Spend", value: "$392K", rawValue: 392000, change: 6.8, changeLabel: "vs last year" },
      { label: "Services", value: "$318K", rawValue: 318000, change: -2.1, changeLabel: "vs last year" },
    ],
    monthlySpend: monthlyBase.map((m) => ({ ...m, value: Math.round(m.value * 0.85), prev: Math.round(m.prev * 0.83) })),
    topVendors: [
      { name: "Software & Licenses", amount: 486000, orders: 0, pct: 24.2 },
      { name: "Hardware & Equipment", amount: 392000, orders: 0, pct: 19.5 },
      { name: "Professional Services", amount: 318000, orders: 0, pct: 15.8 },
      { name: "Facilities & Maintenance", amount: 245000, orders: 0, pct: 12.2 },
      { name: "Office Supplies", amount: 128000, orders: 0, pct: 6.4 },
    ],
    departmentSpend: [
      { dept: "Software & Licenses", amount: 486000, budget: 550000, pct: 88.4 },
      { dept: "Hardware & Equipment", amount: 392000, budget: 450000, pct: 87.1 },
      { dept: "Professional Services", amount: 318000, budget: 380000, pct: 83.7 },
      { dept: "Office Supplies", amount: 128000, budget: 150000, pct: 85.3 },
      { dept: "Travel & Entertainment", amount: 86000, budget: 120000, pct: 71.7 },
      { dept: "Facilities", amount: 245000, budget: 280000, pct: 87.5 },
    ],
    transactions: txBase.map((t) => ({ ...t, dept: "Software & Licenses" })),
    chartSubtitle: "Category spend trend",
    tableTitle: "Transactions by GL Category",
    vendorChartTitle: "Spend by GL Category",
    budgetChartTitle: "Category Budget Utilization",
  },
  capex: {
    kpis: [
      { label: "CapEx PRs", value: "70", rawValue: 70, change: 15.0, changeLabel: "vs last year" },
      { label: "CapEx Spend", value: "$842K", rawValue: 842000, change: 22.4, changeLabel: "YTD approved" },
      { label: "Pending CapEx", value: "8", rawValue: 8, change: -20.0, changeLabel: "vs last month" },
      { label: "Avg CapEx Value", value: "$12,029", rawValue: 12029, change: 6.5, changeLabel: "vs last year" },
    ],
    monthlySpend: monthlyBase.map((m) => ({ ...m, value: Math.round(m.value * 0.28), prev: Math.round(m.prev * 0.26) })),
    topVendors: [
      { name: "Dell Technologies", amount: 198000, orders: 4, pct: 23.5 },
      { name: "CDW Corporation", amount: 156000, orders: 3, pct: 18.5 },
      { name: "Herman Miller", amount: 87500, orders: 2, pct: 10.4 },
      { name: "Amazon Web Services", amount: 72000, orders: 2, pct: 8.6 },
      { name: "Grainger Industrial", amount: 48000, orders: 5, pct: 5.7 },
    ],
    departmentSpend: [
      { dept: "Engineering", amount: 320000, budget: 400000, pct: 80.0 },
      { dept: "Information Technology", amount: 285000, budget: 350000, pct: 81.4 },
      { dept: "Operations", amount: 142000, budget: 180000, pct: 78.9 },
      { dept: "Human Resources", amount: 45000, budget: 60000, pct: 75.0 },
      { dept: "Marketing", amount: 28000, budget: 50000, pct: 56.0 },
      { dept: "Finance", amount: 22000, budget: 40000, pct: 55.0 },
    ],
    transactions: txBase.filter((t) => t.amount > 10000 || t.desc.toLowerCase().includes("capex") || t.desc.toLowerCase().includes("equipment") || t.desc.toLowerCase().includes("server")),
    chartSubtitle: "CapEx spend by month",
    tableTitle: "CapEx Purchase Requests",
    vendorChartTitle: "CapEx by Vendor",
    budgetChartTitle: "CapEx Budget by Department",
  },
};

export function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

export function fmtFull(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function scaleKpiValue(kpi: OverviewKpi, factor: number): OverviewKpi {
  if (kpi.label.includes("Time") || kpi.label.includes("Rate") || kpi.label.includes("%")) {
    return kpi;
  }
  if (kpi.label.includes("Avg") && kpi.value.includes("days")) {
    return kpi;
  }
  const scaled = kpi.rawValue * factor;
  let value = kpi.value;
  if (kpi.value.startsWith("$")) {
    value = fmtCurrency(scaled);
  } else if (typeof kpi.rawValue === "number" && kpi.rawValue > 100) {
    value = Math.round(scaled).toLocaleString();
  } else if (typeof kpi.rawValue === "number") {
    value = String(Math.round(scaled));
  }
  return { ...kpi, value };
}
