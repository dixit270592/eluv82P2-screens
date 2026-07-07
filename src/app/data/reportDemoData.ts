import type { ReportHistoryItem } from "./reportHistory";
import type { ReportTemplateGroup } from "./reportTemplates";
import type { ScheduledReport } from "./scheduledReports";
import type { RecentActivityItem } from "./reportRecentActivity";
import type { OverviewChartSeries, OverviewKpiCounts } from "../utils/reportApiMappers";
import type { PreviewColumn, PreviewRow } from "../utils/reportPreviewData";
import { isApiAuthenticated } from "../services/accessToken";

export type DemoPreviewData = { columns: PreviewColumn[]; rows: PreviewRow[]; totalCount: number };

/** Sample data for local UI testing when no procurement API token is configured. */
export const DEMO_REPORT_HISTORY: ReportHistoryItem[] = [
  {
    id: "demo-rpt-001",
    reportName: "Monthly Spend Summary",
    type: "Spending Overview",
    owner: "Alex Morgan",
    created: "Jun 28, 2026",
    lastRun: "Jul 1, 2026",
    status: "completed",
    saved: true,
    starred: true,
    records: 248,
    fileSize: "1.2 MB",
  },
  {
    id: "demo-rpt-002",
    reportName: "Vendor Analysis Q2",
    type: "Vendor Analysis",
    owner: "Sarah Chen",
    created: "Jun 24, 2026",
    lastRun: "Jun 30, 2026",
    status: "completed",
    saved: true,
    starred: false,
    records: 84,
    fileSize: "860 KB",
  },
  {
    id: "demo-rpt-003",
    reportName: "Budget vs Actual — IT",
    type: "Budget vs Actual",
    owner: "Alex Morgan",
    created: "Jun 20, 2026",
    lastRun: "Jun 29, 2026",
    status: "running",
    saved: false,
    starred: true,
    records: 0,
  },
  {
    id: "demo-rpt-004",
    reportName: "Approval Performance",
    type: "Approval Performance",
    owner: "Michael Torres",
    created: "Jun 18, 2026",
    lastRun: "Jun 18, 2026",
    status: "failed",
    saved: false,
    starred: false,
  },
  {
    id: "demo-rpt-005",
    reportName: "CapEx Requests YTD",
    type: "CapEx Requests",
    owner: "Priya Patel",
    created: "Jun 12, 2026",
    lastRun: "Jun 27, 2026",
    status: "scheduled",
    saved: true,
    starred: false,
    records: 70,
    fileSize: "420 KB",
  },
  {
    id: "demo-rpt-006",
    reportName: "Department Breakdown",
    type: "Department Breakdown",
    owner: "Alex Morgan",
    created: "Jun 5, 2026",
    lastRun: "Jun 26, 2026",
    status: "completed",
    saved: false,
    starred: false,
    records: 156,
    fileSize: "980 KB",
  },
];

export const DEMO_SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: "demo-sch-001",
    reportName: "Weekly PO Summary",
    status: "active",
    nextRun: "Jul 10, 2026 · 8:00 AM",
    recipients: "procurement@elementp2p.com, finance@elementp2p.com",
    frequency: "Weekly · Monday",
    owner: "Alex Morgan",
    templateId: "spending-overview",
    linkedReportId: "demo-rpt-001",
    timezone: "America/New_York",
    deliveryTime: "08:00",
    emailSubject: "Weekly PO Summary — Element P2P",
    sequenceNumber: 101,
  },
  {
    id: "demo-sch-002",
    reportName: "Vendor Analysis Q2",
    status: "active",
    nextRun: "Jul 15, 2026 · 6:00 AM",
    recipients: "sarah.chen@elementp2p.com",
    frequency: "Monthly · 15th",
    owner: "Sarah Chen",
    templateId: "vendor-analysis",
    linkedReportId: "demo-rpt-002",
    timezone: "America/Chicago",
    deliveryTime: "06:00",
    emailSubject: "Vendor Analysis Report",
    sequenceNumber: 102,
  },
  {
    id: "demo-sch-003",
    reportName: "Budget vs Actual — IT",
    status: "paused",
    nextRun: "Paused",
    recipients: "it-leads@elementp2p.com",
    frequency: "Monthly · 1st",
    owner: "Alex Morgan",
    templateId: "budget-vs-actual",
    linkedReportId: "demo-rpt-003",
    timezone: "America/New_York",
    deliveryTime: "07:30",
    emailSubject: "IT Budget Utilization",
    sequenceNumber: 103,
  },
  {
    id: "demo-sch-004",
    reportName: "CapEx Requests YTD",
    status: "active",
    nextRun: "Aug 1, 2026 · 9:00 AM",
    recipients: "capex-review@elementp2p.com",
    frequency: "Monthly · 1st",
    owner: "Priya Patel",
    templateId: "capex-requests",
    linkedReportId: "demo-rpt-005",
    timezone: "America/Los_Angeles",
    deliveryTime: "09:00",
    emailSubject: "CapEx YTD Summary",
    sequenceNumber: 104,
  },
];

export const DEMO_TEMPLATE_GROUPS: ReportTemplateGroup[] = [
  {
    id: "ap",
    label: "AP Reports",
    templates: [
      { id: "spending-overview", name: "Spending Overview", description: "Total spend, trends, and breakdowns", popular: true, category: "AP Reports" },
      { id: "vendor-analysis", name: "Vendor Analysis", description: "Top vendors, categories, and contracts", category: "AP Reports" },
      { id: "invoice-aging", name: "Invoice Aging", description: "Outstanding invoices by aging bucket", category: "AP Reports" },
    ],
  },
  {
    id: "approval",
    label: "Approval Reports",
    templates: [
      { id: "approval-performance", name: "Approval Performance", description: "Approval rates and turnaround times", popular: true, category: "Approval Reports" },
      { id: "pending-approvals", name: "Pending Approvals", description: "Requests awaiting approver action", category: "Approval Reports" },
    ],
  },
  {
    id: "budget",
    label: "Budget Reports",
    templates: [
      { id: "budget-vs-actual", name: "Budget vs Actual", description: "Budget utilization by department", popular: true, category: "Budget Reports" },
      { id: "department-breakdown", name: "Department Breakdown", description: "Spend and activity by department", category: "Budget Reports" },
    ],
  },
  {
    id: "custom",
    label: "Custom Reports",
    templates: [
      { id: "capex-requests", name: "CapEx Requests", description: "Capital expenditure tracking", category: "Custom Reports", isCustom: true },
    ],
  },
];

export const DEMO_OVERVIEW_COUNTS: OverviewKpiCounts = {
  purchaseRequests: 312,
  purchaseOrders: 189,
  invoices: 156,
  expenses: 94,
  capExPRs: 70,
};

export const DEMO_OVERVIEW_CHARTS: OverviewChartSeries = {
  departmentBreakdown: [
    { department: "Information Technology", prs: 76, pos: 54, invoices: 42 },
    { department: "Engineering", prs: 89, pos: 61, invoices: 38 },
    { department: "Operations", prs: 54, pos: 40, invoices: 28 },
    { department: "Human Resources", prs: 28, pos: 18, invoices: 14 },
    { department: "Marketing", prs: 31, pos: 22, invoices: 18 },
  ],
  statusDistribution: [
    { label: "Approved", value: 189 },
    { label: "Pending", value: 47 },
    { label: "Rejected", value: 12 },
    { label: "Draft", value: 64 },
  ],
};

export const DEMO_RECENT_ACTIVITY: RecentActivityItem[] = [
  { id: "demo-act-001", type: "report_generated", description: "Generated Monthly Spend Summary", timestamp: "2 hours ago", user: "Alex Morgan" },
  { id: "demo-act-002", type: "schedule_updated", description: "Updated Weekly PO Summary schedule", timestamp: "Yesterday", user: "Alex Morgan" },
  { id: "demo-act-003", type: "export_completed", description: "Exported Vendor Analysis Q2 to CSV", timestamp: "Jun 30, 2026", user: "Sarah Chen" },
  { id: "demo-act-004", type: "failed_report", description: "Approval Performance failed — retry available", timestamp: "Jun 18, 2026", user: "Michael Torres" },
];

/** Sample preview rows shown in the detail panel when the real API is not configured. */
export const DEMO_PREVIEW_DATA: Record<string, DemoPreviewData> = {
  "demo-rpt-001": {
    columns: [
      { key: "vendor", label: "Vendor" },
      { key: "department", label: "Department" },
      { key: "amount", label: "Amount (USD)" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status" },
    ],
    rows: [
      { vendor: "Acme Corp", department: "Engineering", amount: "$12,450.00", date: "Jun 1, 2026", status: "Approved" },
      { vendor: "TechSupply Inc", department: "IT", amount: "$8,200.00", date: "Jun 5, 2026", status: "Approved" },
      { vendor: "OfficeWorks", department: "HR", amount: "$3,150.00", date: "Jun 10, 2026", status: "Approved" },
      { vendor: "CloudPro", department: "Operations", amount: "$22,000.00", date: "Jun 15, 2026", status: "Pending" },
      { vendor: "DataBridge LLC", department: "Engineering", amount: "$6,800.00", date: "Jun 18, 2026", status: "Approved" },
    ],
    totalCount: 248,
  },
  "demo-rpt-002": {
    columns: [
      { key: "vendor", label: "Vendor" },
      { key: "category", label: "Category" },
      { key: "totalSpend", label: "Total Spend" },
      { key: "orders", label: "PO Count" },
      { key: "avgLead", label: "Avg Lead Time" },
    ],
    rows: [
      { vendor: "Acme Corp", category: "Hardware", totalSpend: "$48,200.00", orders: "12", avgLead: "4.2 days" },
      { vendor: "TechSupply Inc", category: "Software", totalSpend: "$31,500.00", orders: "8", avgLead: "1.5 days" },
      { vendor: "DataBridge LLC", category: "Services", totalSpend: "$27,300.00", orders: "6", avgLead: "7.0 days" },
      { vendor: "CloudPro", category: "Subscriptions", totalSpend: "$66,000.00", orders: "3", avgLead: "0.5 days" },
    ],
    totalCount: 84,
  },
  "demo-rpt-005": {
    columns: [
      { key: "project", label: "Project" },
      { key: "department", label: "Department" },
      { key: "requested", label: "Requested" },
      { key: "approved", label: "Approved" },
      { key: "status", label: "Status" },
    ],
    rows: [
      { project: "Server Upgrade", department: "IT", requested: "$85,000.00", approved: "$82,000.00", status: "Approved" },
      { project: "Fleet Expansion", department: "Operations", requested: "$120,000.00", approved: "$110,000.00", status: "Approved" },
      { project: "Lab Equipment", department: "Engineering", requested: "$45,000.00", approved: "$45,000.00", status: "Pending" },
    ],
    totalCount: 70,
  },
  "demo-rpt-006": {
    columns: [
      { key: "department", label: "Department" },
      { key: "prs", label: "PRs" },
      { key: "pos", label: "POs" },
      { key: "spend", label: "Total Spend" },
      { key: "variance", label: "vs. Budget" },
    ],
    rows: [
      { department: "Engineering", prs: "89", pos: "61", spend: "$142,500.00", variance: "+2.1%" },
      { department: "IT", prs: "76", pos: "54", spend: "$198,000.00", variance: "-1.4%" },
      { department: "Operations", prs: "54", pos: "40", spend: "$87,300.00", variance: "+5.2%" },
      { department: "HR", prs: "28", pos: "18", spend: "$31,200.00", variance: "-0.8%" },
      { department: "Marketing", prs: "31", pos: "22", spend: "$44,600.00", variance: "+3.9%" },
    ],
    totalCount: 156,
  },
};

export function isDemoReportDataEnabled(): boolean {
  return !isApiAuthenticated();
}
