export type RecentActivityType =
  | "report_generated"
  | "schedule_updated"
  | "export_completed"
  | "template_cloned"
  | "failed_report";

export type RecentActivityItem = {
  id: string;
  type: RecentActivityType;
  description: string;
  timestamp: string;
  user: string;
};
