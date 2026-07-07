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
};
