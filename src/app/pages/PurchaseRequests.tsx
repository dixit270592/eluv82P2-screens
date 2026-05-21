import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ChevronDown,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  Eye,
  Filter,
  ArrowUpRight,
  ExternalLink,
  Star,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { TopHeader } from "../components/TopHeader";
import { PurchaseRequestModal, LineItemData, PRHeaderData } from "../components/PurchaseRequestModal";
import { SkipToMainContent } from "../components/SkipToMainContent";
import { UI_FONT_STACK as F } from "../tokens/typography";
import { getStarredIds, toggleStarred } from "../utils/starredTransactions";

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

export function PurchaseRequests() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [starredOnly, setStarredOnly] = useState(false);
  const [starredIds, setStarredIds] = useState<Set<string>>(() => getStarredIds());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentPopupOpen, setPaymentPopupOpen] = useState<string | null>(null);

  useEffect(() => {
    setStarredIds(getStarredIds());
  }, [location.key]);

  const handleToggleStar = (prId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarred(prId);
    setStarredIds(getStarredIds());
  };

  const filtered = allPRs.filter((pr) => {
    const matchSearch =
      pr.id.toLowerCase().includes(search.toLowerCase()) ||
      pr.description.toLowerCase().includes(search.toLowerCase()) ||
      pr.vendor.toLowerCase().includes(search.toLowerCase()) ||
      pr.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || pr.status === filterStatus;
    const matchStarred = !starredOnly || starredIds.has(pr.id);
    return matchSearch && matchStatus && matchStarred;
  });

  const handleModalComplete = (data: {
    header: PRHeaderData;
    lineItem?: LineItemData;
  }) => {
    setModalOpen(false);
    const newId = `PR-${new Date().getFullYear()}-${String(
      allPRs.length + 1
    ).padStart(4, "0")}`;
    navigate(`/pr/${newId}`, {
      state: {
        prHeader: data.header,
        lineItems: data.lineItem ? [data.lineItem] : [],
      },
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
        <TopHeader onNewRequest={() => setModalOpen(true)} />

        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px",
          }}
        >
          {/* Page title + Stats Cards */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: "220px",
                flexShrink: 0,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#101828",
                  fontFamily: F,
                }}
              >
                Purchase Requests
              </h1>
              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "13px",
                  color: "#667085",
                  fontFamily: F,
                }}
              >
                Track all department purchase requests
              </p>
            </div>

            <div
              className="app-stat-grid"
              style={{
                flex: 1,
                gap: "10px",
              }}
            >
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: i * 0.06,
                    }}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E4E7EC",
                      borderRadius: "10px",
                      padding: "12px 10px 12px 12px",
                      boxShadow: "0 1px 4px rgba(16,24,40,0.04)",
                      cursor: "default",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: s.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} color={s.color} strokeWidth={2} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#98A2B3",
                          fontFamily: F,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "6px",
                          marginTop: "2px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#101828",
                            fontFamily: F,
                            lineHeight: 1,
                          }}
                        >
                          {s.value}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#98A2B3",
                            fontFamily: F,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.sub}
                        </span>
                      </div>
                    </div>

                    {s.trend === "up" && (
                      <div style={{ flexShrink: 0 }}>
                        <ArrowUpRight size={13} color="#1FA97A" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Table Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.15 }}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: "10px",
              boxShadow: "0 1px 4px rgba(16,24,40,0.04)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #EEF1F5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#101828",
                    fontFamily: F,
                  }}
                >
                  All Requests
                </span>
                <span
                  style={{
                    padding: "2px 9px",
                    background: "#F2F4F7",
                    borderRadius: "100px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#667085",
                    fontFamily: F,
                  }}
                >
                  {filtered.length}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div style={{ position: "relative" }}>
                  <select
                    aria-label="Filter by request status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      height: "34px",
                      padding: "0 32px 0 12px",
                      border: "1.5px solid #D0D5DD",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontFamily: F,
                      color: "#344054",
                      background: "#FFFFFF",
                      appearance: "none",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <ChevronDown
                    size={13}
                    color="#98A2B3"
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStarredOnly((prev) => !prev)}
                  style={{
                    height: "34px",
                    padding: "0 14px",
                    border: starredOnly ? "1.5px solid #FDE68A" : "1.5px solid #D0D5DD",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontFamily: F,
                    color: starredOnly ? "#B45309" : "#344054",
                    background: starredOnly ? "#FFFBEB" : "#FFFFFF",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Star
                    size={13}
                    strokeWidth={2}
                    fill={starredOnly ? "#F59E0B" : "none"}
                    color={starredOnly ? "#D97706" : "#667085"}
                  />
                  Starred
                </button>

                <button
                  type="button"
                  style={{
                    height: "34px",
                    padding: "0 14px",
                    border: "1.5px solid #D0D5DD",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontFamily: F,
                    color: "#344054",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Filter size={13} strokeWidth={2} />
                  Filters
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                aria-label="Purchase requests"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "880px",
                }}
              >
                <caption className="sr-only">
                  All purchase requests: PR number, description, department, vendor, amount, status, and date
                </caption>
                <thead>
                  <tr
                    style={{
                      background: "#F9FAFB",
                      borderBottom: "1px solid #E4E7EC",
                    }}
                  >
                    {[
                      "PR Number",
                      "Description",
                      "Department",
                      "Vendor",
                      "Amount",
                      "Status",
                      "Date",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#667085",
                          fontFamily: F,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pr, idx) => {
                    const sc = statusConfig[pr.status];
                    const isHov = hoveredRow === pr.id;
                    const isPrStarred = starredIds.has(pr.id);
                    return (
                      <motion.tr
                        className="pr-data-row"
                        key={pr.id}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: idx * 0.04,
                        }}
                        style={{
                          borderBottom: "1px solid #F2F4F7",
                          background: isHov ? "#F9FAFB" : "#FFFFFF",
                          transition: "background 0.12s",
                          cursor: "pointer",
                        }}
                        onMouseEnter={() => setHoveredRow(pr.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        onClick={() => navigate(`/pr/${pr.id}`)}
                      >
                        <td
                          style={{
                            padding: "14px 16px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "7px",
                                background: "#F2F4F7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <FileText
                                size={14}
                                color="#667085"
                                strokeWidth={1.8}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "#101828",
                                fontFamily: F,
                              }}
                            >
                              {pr.id}
                            </span>
                            {isPrStarred && (
                              <Star
                                size={12}
                                strokeWidth={2}
                                fill="#F59E0B"
                                color="#D97706"
                                aria-label="Starred"
                              />
                            )}
                          </div>
                        </td>

                        <td
                          style={{
                            padding: "14px 16px",
                            maxWidth: "200px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#101828",
                              fontFamily: F,
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {pr.description}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#98A2B3",
                              fontFamily: F,
                              marginTop: "2px",
                            }}
                          >
                            {pr.items} line item
                            {pr.items !== 1 ? "s" : ""} · by {pr.requestedBy}
                          </div>
                        </td>

                        <td
                          style={{
                            padding: "14px 16px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#667085",
                              fontFamily: F,
                            }}
                          >
                            {pr.department}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "14px 16px",
                            maxWidth: "160px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#667085",
                              fontFamily: F,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {pr.vendor}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "14px 16px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#101828",
                              fontFamily: F,
                            }}
                          >
                            {fmt(pr.amount)}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "14px 16px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <div
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: sc.dot,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                padding: "3px 9px",
                                borderRadius: "100px",
                                fontSize: "11px",
                                fontWeight: 600,
                                fontFamily: F,
                                background: sc.bg,
                                color: sc.color,
                              }}
                            >
                              {sc.label}
                            </span>
                          </div>
                        </td>

                        <td
                          style={{
                            padding: "14px 16px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#667085",
                              fontFamily: F,
                            }}
                          >
                            {pr.date}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "14px 16px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={(e) => handleToggleStar(pr.id, e)}
                              aria-label={isPrStarred ? "Remove star" : "Star transaction"}
                              aria-pressed={isPrStarred}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "5px",
                                border: isPrStarred ? "1px solid #FDE68A" : "1px solid #E4E7EC",
                                background: isPrStarred ? "#FFFBEB" : "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "background 0.15s, border-color 0.15s",
                              }}
                            >
                              <Star
                                size={13}
                                strokeWidth={2}
                                fill={isPrStarred ? "#F59E0B" : "none"}
                                color={isPrStarred ? "#D97706" : "#98A2B3"}
                              />
                            </button>
                            <button
                              type="button"
                              className="pr-view-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/pr/${pr.id}`);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "5px 11px",
                                borderRadius: "5px",
                                border: "1px solid #E4E7EC",
                                background: "#FFFFFF",
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#344054",
                                fontFamily: F,
                                cursor: "pointer",
                                transition: "opacity 0.15s, border-color 0.15s",
                              }}
                            >
                              <Eye size={12} strokeWidth={2} aria-hidden />
                              View
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "#F2F4F7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <Search size={20} color="#98A2B3" />
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#344054",
                      fontFamily: F,
                    }}
                  >
                    No results found
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#98A2B3",
                      fontFamily: F,
                      marginTop: "4px",
                    }}
                  >
                    Try adjusting your search or filter
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #EEF1F5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#667085",
                  fontFamily: F,
                }}
              >
                Showing {filtered.length} of {allPRs.length} requests
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#667085",
                    fontFamily: F,
                  }}
                >
                  Total value:{" "}
                  <strong style={{ color: "#101828" }}>
                    {fmt(totalValue)}
                  </strong>
                </span>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <PurchaseRequestModal
            onClose={() => setModalOpen(false)}
            onComplete={handleModalComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {paymentPopupOpen &&
          (() => {
            const pr = allPRs.find((p) => p.id === paymentPopupOpen);
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
                  aria-labelledby="pr-budget-report-title"
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
                  <div
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1px solid #E4E7EC",
                    }}
                  >
                    <h2
                      id="pr-budget-report-title"
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#101828",
                        fontFamily: F,
                      }}
                    >
                      Budget Report
                    </h2>
                  </div>

                  <div style={{ padding: "20px 24px 24px" }}>
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
                            (
                              e.target as HTMLInputElement
                            ).style.borderColor = "#1FA97A";
                          }}
                          onBlur={(e) => {
                            (
                              e.target as HTMLInputElement
                            ).style.borderColor = "#D0D5DD";
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        border: "2px solid #4ECDC4",
                        borderRadius: "8px",
                        overflow: "hidden",
                        marginBottom: "24px",
                      }}
                    >
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
                                    idx !== 3 ? "1px solid #F2F4F7" : "none",
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
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#F9FAFB";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#FFFFFF";
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
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#3BB5AD";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#4ECDC4";
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
