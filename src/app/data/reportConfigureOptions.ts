export const dateRangePresets = [
  { id: "last_7_days", label: "Last 7 Days" },
  { id: "last_30_days", label: "Last 30 Days" },
  { id: "this_month", label: "This Month" },
  { id: "this_quarter", label: "This Quarter" },
  { id: "ytd", label: "YTD" },
] as const;

export type DateRangePreset = (typeof dateRangePresets)[number]["id"];

export const departmentOptions = [
  "Information Technology",
  "Engineering",
  "Human Resources",
  "Finance & Accounting",
  "Marketing",
  "Operations",
];

export const vendorOptions = [
  "All Vendors",
  "Dell Technologies",
  "Microsoft Corporation",
  "Amazon Web Services",
  "Herman Miller",
  "Grainger Industrial",
  "Staples Business",
  "CDW Corporation",
];

export const categoryOptions = [
  "All Categories",
  "Software & Licenses",
  "Hardware & Equipment",
  "Office Supplies",
  "Professional Services",
  "Facilities & Maintenance",
  "Travel & Entertainment",
];

export const approvalStatusOptions = [
  "All Statuses",
  "Approved",
  "Pending",
  "Rejected",
  "Draft",
];

export const requestTypeOptions = [
  "All Types",
  "Standard PR",
  "CapEx Request",
  "Emergency Purchase",
  "Contract Renewal",
];

export const outputFormatOptions = [
  { id: "pdf", label: "PDF" },
  { id: "csv", label: "CSV" },
  { id: "xlsx", label: "Excel" },
];

export const scheduleFrequencyOptions = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
];

export const timezoneOptions = [
  "America/New_York (ET)",
  "America/Chicago (CT)",
  "America/Denver (MT)",
  "America/Los_Angeles (PT)",
  "UTC",
];
