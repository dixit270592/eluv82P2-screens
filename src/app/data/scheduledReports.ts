export type ScheduledReportStatus = "active" | "paused";

export type ScheduledReport = {
  id: string;
  reportName: string;
  status: ScheduledReportStatus;
  nextRun: string;
  recipients: string;
  frequency: string;
  owner: string;
  templateId?: string;
  linkedReportId?: string;
  timezone?: string;
  deliveryTime?: string;
  emailSubject?: string;
  sequenceNumber?: number;
  /** Day of week from the original API schedule (e.g. "monday"). Preserved on edit. */
  dayOfWeek?: string;
  /** Day of month from the original API schedule (1–31). Preserved on edit. */
  dayOfMonth?: number;
};
