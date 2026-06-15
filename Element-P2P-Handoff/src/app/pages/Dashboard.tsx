import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Eye,
  Filter,
  ArrowUpRight,
  ExternalLink,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  ListTodo,
  Receipt,
  FileSpreadsheet,
  CircleAlert,
  Layers,
  AlertTriangle,
  Link2,
  AtSign,
  ArrowLeftRight,
  FileQuestion,
  UserCheck,
  PackageX,
  PackageOpen,
  PackagePlus,
  Calendar,
  CalendarDays,
  CalendarRange,
  Hourglass,
  FolderOpen,
  Timer,
  FileStack,
  UserCircle,
  BadgeCheck,
  Wallet,
  ScanLine,
  SlidersHorizontal,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { TopHeader } from "../components/TopHeader";
import { PurchaseRequestModal, LineItemData, PRHeaderData } from "../components/PurchaseRequestModal";
import {
  DashboardConfigurationModal,
} from "../components/DashboardConfigurationModal";
import {
  DashboardAnalyticsGrid,
  DashboardStatBarCard,
  DashboardRequesterGridCard,
  statusBarColor,
  type BarRowItem,
} from "../components/DashboardAnalyticsCards";
import { PunchoutVendorPanel } from "../components/PunchoutVendorPanel";
import { SkipToMainContent } from "../components/SkipToMainContent";
import { UI_FONT_STACK as F } from "../tokens/typography";

interface PR {
  id: string;
  description: string;
  department: string;
  vendor: string;
  amount: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  date: string;
  items: number;
  requestedBy: string;
}

const allPRs: PR[] = [
  {
    id: "PR-2026-0189",
    description: "Engineering Equipment Q1 2026",
    department: "Engineering",
    vendor: "Dell Technologies",
    amount: 11386.66,
    status: "draft",
    date: "Feb 26, 2026",
    items: 3,
    requestedBy: "John Davidson",
  },
  {
    id: "PR-2026-0188",
    description: "Software Licenses Renewal",
    department: "IT",
    vendor: "Microsoft Corporation",
    amount: 24500.0,
    status: "submitted",
    date: "Feb 24, 2026",
    items: 5,
    requestedBy: "Amy Richardson",
  },
  {
    id: "PR-2026-0187",
    description: "Office Furniture — HQ Expansion",
    department: "Human Resources",
    vendor: "Herman Miller",
    amount: 8750.0,
    status: "approved",
    date: "Feb 20, 2026",
    items: 4,
    requestedBy: "Daniel Park",
  },
  {
    id: "PR-2026-0186",
    description: "Cloud Infrastructure Services",
    department: "IT",
    vendor: "Amazon Web Services",
    amount: 15000.0,
    status: "approved",
    date: "Feb 15, 2026",
    items: 2,
    requestedBy: "Sarah Chen",
  },
  {
    id: "PR-2026-0185",
    description: "Marketing Campaign Assets",
    department: "Marketing",
    vendor: "Creative Agency Co.",
    amount: 6200.0,
    status: "rejected",
    date: "Feb 10, 2026",
    items: 6,
    requestedBy: "Marcus Webb",
  },
  {
    id: "PR-2026-0184",
    description: "Lab Equipment & Supplies",
    department: "R&D",
    vendor: "Fisher Scientific",
    amount: 32400.0,
    status: "approved",
    date: "Feb 8, 2026",
    items: 9,
    requestedBy: "Dr. Lisa Tran",
  },
  {
    id: "PR-2026-0183",
    description: "Salesforce CRM Licenses",
    department: "Sales",
    vendor: "Salesforce Inc.",
    amount: 18900.0,
    status: "submitted",
    date: "Feb 5, 2026",
    items: 1,
    requestedBy: "Kevin Moore",
  },
];

const statusConfig = {
  draft: {
    label: "Draft",
    bg: "#F2F4F7",
    color: "#667085",
    dot: "#98A2B3",
  },
  submitted: {
    label: "Pending Approval",
    bg: "#FEF3C7",
    color: "#D97706",
    dot: "#F59E0B",
  },
  approved: {
    label: "Approved",
    bg: "#ECFDF5",
    color: "#059669",
    dot: "#10B981",
  },
  rejected: {
    label: "Rejected",
    bg: "#FEF2F2",
    color: "#F04438",
    dot: "#F04438",
  },
};

const stats = [
  {
    label: "Total Requests",
    value: "24",
    sub: "+4 this month",
    trend: "up",
    icon: FileText,
    color: "#1FA97A",
    bg: "#E6F7F1",
  },
  {
    label: "Pending Approval",
    value: "7",
    sub: "3 require action",
    trend: "up",
    icon: Clock,
    color: "#D97706",
    bg: "#FEF3C7",
  },
  {
    label: "Draft",
    value: "5",
    sub: "2 nearing deadline",
    trend: "neutral",
    icon: FileText,
    color: "#667085",
    bg: "#F2F4F7",
  },
  {
    label: "Approved (YTD)",
    value: "16",
    sub: "$287,450 total",
    trend: "up",
    icon: CheckCircle2,
    color: "#059669",
    bg: "#ECFDF5",
  },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

/**
 * Icon colors aligned with dashboard reference:
 * — sage: POs / blanket POs
 * — rose: invoices & time-sensitive / urgent items
 * — neutral: purchase requests, receipts, general alerts
 * — expense: expense requests (steel blue)
 * — receiptActivity: recent receipt scan (muted purple)
 * outerDashed: single ring uses dashed stroke for in-approval / waiting / pending-style rows (solid otherwise).
 */
type MetricTone = "po" | "invoice" | "neutral" | "expense" | "receiptActivity";

const METRIC_THEME: Record<
  MetricTone,
  { icon: string; ring: string; fill: string }
> = {
  po: {
    icon: "#4F6B58",
    ring: "#6A8574",
    fill: "rgba(79, 107, 88, 0.14)",
  },
  invoice: {
    icon: "#9A5564",
    ring: "#B87A86",
    fill: "rgba(154, 85, 100, 0.12)",
  },
  neutral: {
    icon: "#5A616D",
    ring: "#747B88",
    fill: "rgba(90, 97, 109, 0.1)",
  },
  expense: {
    icon: "#4A6B8A",
    ring: "#6A88A3",
    fill: "rgba(74, 107, 138, 0.12)",
  },
  receiptActivity: {
    icon: "#5F5785",
    ring: "#7D739D",
    fill: "rgba(95, 87, 133, 0.12)",
  },
};

const dashboardMetrics: {
  value: string;
  label: string;
  icon: LucideIcon;
  tone: MetricTone;
  outerDashed: boolean;
}[] = [
  { value: "13", label: "Your Purchase Requests in Approval", icon: ShoppingCart, tone: "neutral", outerDashed: true },
  { value: "0", label: "All Capex Request in Approval", icon: ListTodo, tone: "neutral", outerDashed: true },
  { value: "19", label: "All Capex Receipt", icon: Receipt, tone: "neutral", outerDashed: false },
  { value: "3", label: "All Capex Invoice", icon: FileSpreadsheet, tone: "invoice", outerDashed: false },
  { value: "23", label: "All Capex Request", icon: CircleAlert, tone: "neutral", outerDashed: false },
  { value: "16", label: "Your Blanket POs", icon: Layers, tone: "po", outerDashed: false },
  { value: "13", label: "Your PRs waiting more than 24 hours for approval", icon: Clock, tone: "invoice", outerDashed: false },
  { value: "17", label: "Purchase Requests that need your attention", icon: AlertTriangle, tone: "invoice", outerDashed: false },
  { value: "7", label: "Releases against your Blanket POs", icon: Link2, tone: "po", outerDashed: false },
  { value: "0", label: "Purchase Requests that mention you", icon: AtSign, tone: "neutral", outerDashed: false },
  { value: "25", label: "Your Expenses Requests", icon: DollarSign, tone: "expense", outerDashed: false },
  { value: "1", label: "Your Newly Created POs", icon: Plus, tone: "po", outerDashed: false },
  { value: "2", label: "Newly Approved PRs to be Converted to PO", icon: ArrowLeftRight, tone: "po", outerDashed: false },
  { value: "16", label: "All PRs that need quoting", icon: FileQuestion, tone: "neutral", outerDashed: false },
  { value: "13", label: "Purchase Requests that need your approval", icon: UserCheck, tone: "neutral", outerDashed: true },
  { value: "27", label: "Open POs with No Receipts", icon: PackageX, tone: "po", outerDashed: false },
  { value: "0", label: "Recently Received POs", icon: PackageOpen, tone: "neutral", outerDashed: false },
  { value: "4", label: "Recently Created POs", icon: PackagePlus, tone: "po", outerDashed: false },
  { value: "24", label: "Open POs (Last 30 Days)", icon: Calendar, tone: "po", outerDashed: false },
  { value: "38", label: "Open POs (Last 60 Days)", icon: CalendarDays, tone: "po", outerDashed: false },
  { value: "42", label: "Open POs (Last 90 Days)", icon: CalendarRange, tone: "po", outerDashed: false },
  { value: "0", label: "Fully Received POs Pending Invoicing", icon: Hourglass, tone: "invoice", outerDashed: true },
  { value: "98", label: "All Open POs", icon: FolderOpen, tone: "po", outerDashed: false },
  { value: "1", label: "Invoices Pending Approval (>24 hrs)", icon: Timer, tone: "invoice", outerDashed: true },
  { value: "3", label: "Invoices in Approval", icon: FileStack, tone: "invoice", outerDashed: true },
  { value: "1", label: "Invoices Waiting for Your Approval", icon: UserCircle, tone: "invoice", outerDashed: true },
  { value: "13", label: "Invoices Ready for Payment", icon: BadgeCheck, tone: "invoice", outerDashed: false },
  { value: "6", label: "Expense Requests Needing Approval", icon: Wallet, tone: "expense", outerDashed: true },
  { value: "0", label: "Recent Receipt Activity (All POs)", icon: ScanLine, tone: "receiptActivity", outerDashed: false },
];

const METRIC_ICON_SIZE = 22;
const METRIC_ICON_STROKE = 1.925;

const analyticsTransactionsByDepartment: BarRowItem[] = [
  { name: "IT", count: 6 },
  { name: "HR", count: 5 },
  { name: "Accounting & Finance", count: 19 },
  { name: "Sales", count: 3 },
  { name: "Marketing", count: 8 },
  { name: "Purchase", count: 3 },
  { name: "R&D", count: 2 },
  { name: "Production", count: 0 },
  { name: "seg2", count: 0 },
];

const analyticsTransactionsByType: BarRowItem[] = [
  { name: "Standard PRs", count: 33 },
  { name: "Purchase Orders", count: 20 },
  { name: "Receipts", count: 16 },
  { name: "Invoices", count: 4 },
  { name: "Expenses", count: 0 },
  { name: "CapEx Requests", count: 6 },
  { name: "Blanket Requests", count: 4 },
  { name: "Stock Requests", count: 0 },
  { name: "Change Orders", count: 0 },
  { name: "Blanket Request Releases", count: 7 },
  { name: "CapEx Request Receipt", count: 45 },
  { name: "CapEx Request Invoice", count: 12 },
  { name: "CapEx Request PO", count: 43 },
];

const analyticsTransactionsByStatus: BarRowItem[] = [
  { name: "New", count: 42 },
  { name: "In Approval", count: 6 },
  { name: "Approved", count: 4 },
  { name: "Rejected", count: 0 },
  { name: "Changed", count: 0 },
  { name: "Change Requested", count: 0 },
  { name: "Cancelled", count: 1 },
];

const analyticsPoByDepartment: BarRowItem[] = [
  { name: "IT", count: 1 },
  { name: "HR", count: 4 },
  { name: "Accounting & Finance", count: 12 },
  { name: "Sales", count: 0 },
  { name: "Marketing", count: 4 },
  { name: "Purchase", count: 1 },
  { name: "R&D", count: 2 },
  { name: "Production", count: 0 },
  { name: "seg2", count: 0 },
];

const analyticsPoByRequester: BarRowItem[] = [
  { name: "Natasha Tuber", count: 24 },
  { name: "Prerna Surana", count: 0 },
  { name: "Ellie Sood", count: 0 },
  { name: "Shubham Vyas", count: 0 },
  { name: "Nishtha Thakkar", count: 0 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<string>("all");
  const [hoveredRow, setHoveredRow] = useState<string | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [focusedSearch, setFocusedSearch] = useState(false);
  const [paymentPopupOpen, setPaymentPopupOpen] = useState<string | null>(null);
  const [dashboardConfigOpen, setDashboardConfigOpen] = useState(false);
  const [dashboardConfigTip, setDashboardConfigTip] = useState(false);
  const [savedDashboardConfig, setSavedDashboardConfig] = useState<
    Record<string, boolean> | undefined
  >(undefined);

  const filtered = allPRs.filter((pr) => {
    const matchSearch =
      pr.id.toLowerCase().includes(search.toLowerCase()) ||
      pr.description
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      pr.vendor.toLowerCase().includes(search.toLowerCase()) ||
      pr.department
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" || pr.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleModalComplete = (data: { header: PRHeaderData; lineItem?: LineItemData }) => {
    setModalOpen(false);
    const newId = `PR-${new Date().getFullYear()}-${String(allPRs.length + 1).padStart(4, '0')}`;
    navigate(`/pr/${newId}`, {
      state: { prHeader: data.header, lineItems: data.lineItem ? [data.lineItem] : [] },
    });
  };

  const totalValue = allPRs.reduce((s, p) => s + p.amount, 0);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#F5F7FA",
        fontFamily: F,
        overflow: "hidden",
      }}
    >
      <SkipToMainContent />
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* ── Top Header ── */}
        <TopHeader onNewRequest={() => setModalOpen(true)} />

        {/* ── Main Content ── */}
        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            background: "#F5F7FA",
            display: "flex",
            gap: "20px",
          }}
        >
          {/* Left Sidebar - Punchout Vendor */}
          <div
            style={{
              /* ~220px content + 1px rule + 16px gutter before main column */
              width: 236,
              flexShrink: 0,
              alignSelf: "stretch",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              boxSizing: "border-box",
              borderRight: "1px solid #E4E7EC",
              paddingRight: 16,
            }}
          >
            <PunchoutVendorPanel />
          </div>

          {/* Right Content Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
                minHeight: 32,
                gap: 16,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#101828",
                    fontFamily: F,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Dashboard
                </h1>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 13,
                    color: "#667085",
                    fontFamily: F,
                    lineHeight: 1.35,
                    maxWidth: 520,
                  }}
                >
                  Purchase requests, approvals, and spend in one place.
                </p>
              </div>
              <div style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
                <button
                  type="button"
                  aria-label="Dashboard Configuration"
                  onClick={() => setDashboardConfigOpen(true)}
                  style={{
                    width: 32,
                    height: 32,
                    border: "1px solid #E4E7EC",
                    borderRadius: "6px",
                    background: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onMouseEnter={() => setDashboardConfigTip(true)}
                  onMouseLeave={() => setDashboardConfigTip(false)}
                  onFocus={() => setDashboardConfigTip(true)}
                  onBlur={() => setDashboardConfigTip(false)}
                >
                  <SlidersHorizontal
                    size={15}
                    color="#667085"
                    strokeWidth={1.8}
                  />
                </button>
                {dashboardConfigTip && (
                  <div
                    role="tooltip"
                    style={{
                      position: "absolute",
                      right: "100%",
                      top: "50%",
                      transform: "translateY(-50%)",
                      marginRight: 10,
                      background: "#101828",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 500,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      whiteSpace: "nowrap",
                      fontFamily: F,
                      boxShadow: "0 4px 14px rgba(16,24,40,0.18)",
                      zIndex: 20,
                      pointerEvents: "none",
                    }}
                  >
                    Dashboard Configuration
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: "100%",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 0,
                        height: 0,
                        borderTop: "6px solid transparent",
                        borderBottom: "6px solid transparent",
                        borderLeft: "6px solid #101828",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Primary snapshot — bordered group, separate from workflow tiles below */}
            <section
              style={{
                marginBottom: 28,
                minWidth: 0,
                borderRadius: 15,
                border: "1px solid #E4E7EC",
                background: "#EEF2F7",
                padding: "16px 18px 18px",
              }}
            >
              <div className="app-stat-grid">
                {stats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E4E7EC",
                        borderRadius: "10px",
                        padding: "16px 16px",
                        minHeight: 96,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.06)",
                      }}
                    >
                      <div
                        aria-hidden
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: "50%",
                          border: `1.5px solid ${s.color}33`,
                          background: s.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxSizing: "border-box",
                        }}
                      >
                        <Icon size={METRIC_ICON_SIZE} color={s.color} strokeWidth={METRIC_ICON_STROKE} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#667085",
                            fontFamily: F,
                            lineHeight: 1.3,
                          }}
                        >
                          {s.label}
                        </div>
                        <div
                          style={{
                            fontSize: "26px",
                            fontWeight: 700,
                            color: "#101828",
                            fontFamily: F,
                            lineHeight: 1.1,
                            letterSpacing: "-0.03em",
                            marginTop: 4,
                          }}
                        >
                          {s.value}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            color: "#98A2B3",
                            fontFamily: F,
                            marginTop: 4,
                          }}
                        >
                          {s.sub}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            <div className="app-metric-grid" style={{ marginBottom: "28px" }}>
              {dashboardMetrics.map((metric, i) => {
                const Icon = metric.icon;
                const theme = METRIC_THEME[metric.tone];
                return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.45) }}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E4E7EC",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    minHeight: 76,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      width: 52.8,
                      height: 52.8,
                      borderRadius: "50%",
                      border: `1.5px ${metric.outerDashed ? "dashed" : "solid"} ${theme.ring}`,
                      background: theme.fill,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxSizing: "border-box",
                    }}
                  >
                    <Icon
                      size={METRIC_ICON_SIZE}
                      color={theme.icon}
                      strokeWidth={METRIC_ICON_STROKE}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#667085",
                        fontFamily: F,
                        lineHeight: 1.35,
                      }}
                    >
                      {metric.label}
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#101828",
                        fontFamily: F,
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {metric.value}
                    </div>
                  </div>
                </motion.div>
              );
              })}
            </div>

            {/* Analytics charts — shared card system */}
            <DashboardAnalyticsGrid className="mb-0">
              <DashboardStatBarCard
                title="Transactions by Departments"
                timeframe="Last 30 days"
                items={analyticsTransactionsByDepartment}
              />
              <DashboardStatBarCard
                title="Transactions by Types"
                timeframe="Last 30 days"
                items={analyticsTransactionsByType}
              />
              <DashboardStatBarCard
                title="Transactions by Status"
                timeframe="Last 30 days"
                items={analyticsTransactionsByStatus}
                barColor={(item) => statusBarColor(item.name)}
              />
              <DashboardStatBarCard
                title="Purchase Orders by Department"
                timeframe="All open POs"
                items={analyticsPoByDepartment}
              />
              <DashboardRequesterGridCard
                title="Purchase Orders by Requester"
                timeframe="Last 30 days"
                items={analyticsPoByRequester}
              />
            </DashboardAnalyticsGrid>
          </div>
        </main>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {modalOpen && (
          <PurchaseRequestModal
            onClose={() => setModalOpen(false)}
            onComplete={handleModalComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dashboardConfigOpen && (
          <DashboardConfigurationModal
            onClose={() => setDashboardConfigOpen(false)}
            onSave={(selections) => setSavedDashboardConfig(selections)}
            initialSelections={savedDashboardConfig}
          />
        )}
      </AnimatePresence>

      {/* Payment Request Popup */}
      <AnimatePresence>
        {paymentPopupOpen && (() => {
          const pr = allPRs.find(p => p.id === paymentPopupOpen);
          if (!pr) return null;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setPaymentPopupOpen(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(16, 24, 40, 0.4)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px",
              }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="budget-report-dialog-title"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "12px",
                  boxShadow: "0 20px 50px rgba(16, 24, 40, 0.2)",
                  width: "100%",
                  maxWidth: "900px",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "20px 24px",
                    borderBottom: "1px solid #E4E7EC",
                  }}
                >
                  <h2
                    id="budget-report-dialog-title"
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#101828",
                      fontFamily: F,
                    }}
                  >Budget Report</h2>
                  
                </div>

                {/* Content */}
                <div style={{ padding: "20px 24px 24px" }}>
                  {/* Search Bar */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ position: "relative" }}>
                      <Search
                        size={16}
                        color="#98A2B3"
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search here..."
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 38px",
                          border: "1.5px solid #D0D5DD",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontFamily: F,
                          color: "#101828",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLInputElement).style.borderColor = "#1FA97A";
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLInputElement).style.borderColor = "#D0D5DD";
                        }}
                      />
                    </div>
                  </div>

                  {/* Budget Table */}
                  <div
                    style={{
                      border: "2px solid #4ECDC4",
                      borderRadius: "8px",
                      overflow: "hidden",
                      marginBottom: "24px",
                    }}
                  >
                    {/* Table Header */}
                    <div
                      style={{
                        background: "#4ECDC4",
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#FFFFFF",
                          fontFamily: F,
                        }}
                      >
                        E2M
                      </span>
                      <button
                        type="button"
                        aria-label="Expand or collapse E2M section"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#FFFFFF",
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ChevronDown size={20} strokeWidth={2} />
                      </button>
                    </div>

                    {/* Info Section */}
                    <div
                      style={{
                        background: "#FFFFFF",
                        padding: "12px 16px",
                        borderBottom: "1px solid #E4E7EC",
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#98A2B3",
                            fontFamily: F,
                            marginBottom: "2px",
                          }}
                        >
                          GL Description:
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#101828",
                            fontFamily: F,
                            fontWeight: 500,
                          }}
                        >
                          Test
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#98A2B3",
                            fontFamily: F,
                            marginBottom: "2px",
                          }}
                        >
                          Start Date:
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#101828",
                            fontFamily: F,
                            fontWeight: 500,
                          }}
                        >
                          04/01/2026
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#98A2B3",
                            fontFamily: F,
                            marginBottom: "2px",
                          }}
                        >
                          End Date:
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#101828",
                            fontFamily: F,
                            fontWeight: 500,
                          }}
                        >
                          03/31/2027
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#98A2B3",
                            fontFamily: F,
                            marginBottom: "2px",
                          }}
                        >
                          Period:
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#101828",
                            fontFamily: F,
                            fontWeight: 500,
                          }}
                        >
                          Quarterly
                        </div>
                      </div>
                    </div>

                    {/* Data Table */}
                    <div>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                        }}
                      >
                        <thead>
                          <tr style={{ background: "#F9FAFB" }}>
                            {[
                              "PERIOD",
                              "ACTUAL",
                              "COMMITTED",
                              "PENDING",
                              "TOTAL",
                              "BUDGET",
                              "VARIANCE",
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: "#101828",
                                  fontFamily: F,
                                  borderBottom: "1px solid #E4E7EC",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              period: "Period1",
                              actual: "Rs.0.00",
                              committed: "Rs.696.00",
                              pending: "Rs.300.00",
                              total: "Rs.996.00",
                              budget: "Rs.200.00",
                              variance: "Rs.-796.00",
                              varianceColor: "#DC2626",
                            },
                            {
                              period: "Period2",
                              actual: "Rs.0.00",
                              committed: "Rs.0.00",
                              pending: "Rs.5.20",
                              total: "Rs.5.20",
                              budget: "Rs.200.00",
                              variance: "Rs.194.80",
                              varianceColor: "#059669",
                            },
                            {
                              period: "Period3",
                              actual: "Rs.0.00",
                              committed: "Rs.0.00",
                              pending: "Rs.0.00",
                              total: "Rs.0.00",
                              budget: "Rs.200.00",
                              variance: "Rs.200.00",
                              varianceColor: "#059669",
                            },
                            {
                              period: "Period4",
                              actual: "Rs.0.00",
                              committed: "Rs.0.00",
                              pending: "Rs.0.00",
                              total: "Rs.0.00",
                              budget: "Rs.200.00",
                              variance: "Rs.200.00",
                              varianceColor: "#059669",
                            },
                          ].map((row, idx) => (
                            <tr
                              key={idx}
                              style={{
                                borderBottom:
                                  idx !== 3
                                    ? "1px solid #F2F4F7"
                                    : "none",
                              }}
                            >
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: "12px",
                                  color: "#344054",
                                  fontFamily: F,
                                }}
                              >
                                {row.period}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: "12px",
                                  color: "#344054",
                                  fontFamily: F,
                                }}
                              >
                                {row.actual}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: "12px",
                                  color: "#344054",
                                  fontFamily: F,
                                }}
                              >
                                {row.committed}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: "12px",
                                  color: "#344054",
                                  fontFamily: F,
                                }}
                              >
                                {row.pending}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: "12px",
                                  color: "#344054",
                                  fontFamily: F,
                                }}
                              >
                                {row.total}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: "12px",
                                  color: "#344054",
                                  fontFamily: F,
                                }}
                              >
                                {row.budget}
                              </td>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: row.varianceColor,
                                  fontFamily: F,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                {row.variance}
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  ⟳
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setPaymentPopupOpen(null)}
                      style={{
                        padding: "10px 24px",
                        border: "1.5px solid #D0D5DD",
                        borderRadius: "6px",
                        background: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#344054",
                        fontFamily: F,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentPopupOpen(null);
                      }}
                      style={{
                        padding: "10px 24px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#4ECDC4",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#FFFFFF",
                        fontFamily: F,
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#3BB5AD";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#4ECDC4";
                      }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}