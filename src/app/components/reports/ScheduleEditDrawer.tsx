import { useEffect, useState } from "react";
import { scheduleFrequencyOptions, timezoneOptions } from "../../data/reportConfigureOptions";
import type { ScheduledReport } from "../../data/scheduledReports";
import { useReports } from "../../context/ReportsContext";
import { ReportCenterModal } from "./ReportCenterModal";
import {
  onInputFocus,
  onPrimaryBtnHover,
  onSurfaceHover,
  reportCancelBtnStyle,
  reportInputStyle,
  reportLabelStyle,
  reportPrimaryBtnStyle,
} from "./reportUiStyles";

type ScheduleEditDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: ScheduledReport | null;
};

export function ScheduleEditDrawer({ open, onOpenChange, schedule }: ScheduleEditDrawerProps) {
  const { updateScheduled } = useReports();
  const [frequency, setFrequency] = useState("Weekly");
  const [recipients, setRecipients] = useState("");
  const [timezone, setTimezone] = useState(timezoneOptions[0]);
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [emailSubject, setEmailSubject] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !schedule) return;
    setFrequency(schedule.frequency);
    setRecipients(schedule.recipients);
    setTimezone(schedule.timezone ?? timezoneOptions[0]);
    setDeliveryTime(schedule.deliveryTime ?? "08:00");
    setEmailSubject(schedule.emailSubject ?? `${schedule.reportName} - Scheduled Report`);
    setSaving(false);
  }, [open, schedule]);

  const handleSave = async () => {
    if (!schedule || !recipients.trim()) return;
    setSaving(true);
    const ok = await updateScheduled(schedule.id, {
      frequency,
      recipients: recipients.trim(),
      timezone,
      deliveryTime,
      emailSubject: emailSubject.trim() || `${schedule.reportName} - Scheduled Report`,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <ReportCenterModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Schedule"
      subtitle={schedule ? schedule.reportName : "Update delivery settings for this scheduled report."}
      ariaLabel="Edit schedule"
      footer={
        <>
          <button type="button" onClick={() => onOpenChange(false)} style={reportCancelBtnStyle}
            onMouseEnter={(e) => onSurfaceHover(e, true)} onMouseLeave={(e) => onSurfaceHover(e, false)}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving || !recipients.trim()}
            style={{ ...reportPrimaryBtnStyle, opacity: saving ? 0.85 : 1 }}
            onMouseEnter={(e) => !saving && onPrimaryBtnHover(e, true)} onMouseLeave={(e) => !saving && onPrimaryBtnHover(e, false)}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </>
      }
    >
      {schedule && (
        <div className="app-report-modal-fields">
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={reportLabelStyle}>Frequency</span>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={reportInputStyle}
              onFocus={(e) => onInputFocus(e, true)} onBlur={(e) => onInputFocus(e, false)}>
              {scheduleFrequencyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={reportLabelStyle}>Recipients</span>
            <input type="text" value={recipients} onChange={(e) => setRecipients(e.target.value)}
              placeholder="email@company.com, team@company.com" style={reportInputStyle}
              onFocus={(e) => onInputFocus(e, true)} onBlur={(e) => onInputFocus(e, false)} />
          </label>
          <div className="app-report-modal-field-grid">
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={reportLabelStyle}>Timezone</span>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={reportInputStyle}
                onFocus={(e) => onInputFocus(e, true)} onBlur={(e) => onInputFocus(e, false)}>
                {timezoneOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={reportLabelStyle}>Delivery time</span>
              <input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} style={reportInputStyle}
                onFocus={(e) => onInputFocus(e, true)} onBlur={(e) => onInputFocus(e, false)} />
            </label>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={reportLabelStyle}>Email subject</span>
            <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} style={reportInputStyle}
              onFocus={(e) => onInputFocus(e, true)} onBlur={(e) => onInputFocus(e, false)} />
          </label>
          <div style={{ fontSize: "12px", color: "#667085", padding: "10px 12px", background: "#FAFBFC", borderRadius: "8px", border: "1px solid #E4E7EC" }}>
            Next run: <strong>{schedule.nextRun}</strong> · Owner: {schedule.owner}
          </div>
        </div>
      )}
    </ReportCenterModal>
  );
}
