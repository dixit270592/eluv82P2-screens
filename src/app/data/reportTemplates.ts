export type ReportTemplateCategory = "all" | "ap" | "approval" | "budget" | "custom";

export type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  popular?: boolean;
  category?: string;
  parameters?: string[];
  isCustom?: boolean;
};

export type ReportTemplateGroup = {
  id: ReportTemplateCategory;
  label: string;
  templates: ReportTemplate[];
};

export const reportTemplateCategories: { id: ReportTemplateCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ap", label: "AP Reports" },
  { id: "approval", label: "Approval Reports" },
  { id: "budget", label: "Budget Reports" },
  { id: "custom", label: "Custom Reports" },
];
