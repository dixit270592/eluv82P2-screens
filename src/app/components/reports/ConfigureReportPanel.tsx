import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Switch } from "../ui/switch";
import type { ReportTemplate } from "../../data/reportTemplates";
import {
  approvalStatusOptions,
  categoryOptions,
  dateRangePresets,
  departmentOptions,
  outputFormatOptions,
  requestTypeOptions,
  scheduleFrequencyOptions,
  timezoneOptions,
  vendorOptions,
  type DateRangePreset,
} from "../../data/reportConfigureOptions";
import type { ReportRunConfig } from "./reportGenerationTypes";
import {
  onInputFocus,
  onPrimaryBtnHover,
  reportCancelBtnStyle,
  reportInputStyle,
  reportLabelStyle,
  reportPrimaryBtnStyle,
  reportMuted,
} from "./reportUiStyles";

export type ConfigureReportPanelHandle = {
  getRunConfig: () => ReportRunConfig | null;
  validate: () => string | null;
  getScheduleEnabled: () => boolean;
};

const inputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => onInputFocus(e, true),
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => onInputFocus(e, false),
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span style={reportLabelStyle}>{children}</span>;
}

function SectionHeader({ label }: { label: string }) {
  return <h3 className="app-report-config-section__title">{label}</h3>;
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[] | { id: string; label: string }[];
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={reportInputStyle}
        {...inputFocusHandlers}
      >
        {options.map((opt) => {
          const id = typeof opt === "string" ? opt : opt.id;
          const text = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={id} value={id}>
              {text}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export const ConfigureReportPanel = forwardRef<
  ConfigureReportPanelHandle,
  {
    template: ReportTemplate;
    defaultScheduleEnabled?: boolean;
    onScheduleEnabledChange?: (enabled: boolean) => void;
    initialConfig?: ReportRunConfig | null;
  }
>(function ConfigureReportPanel({ template, defaultScheduleEnabled = false, onScheduleEnabledChange, initialConfig = null }, ref) {
  const [reportName, setReportName] = useState(template.name);
  const [datePreset, setDatePreset] = useState<DateRangePreset>("ytd");
  const [departments, setDepartments] = useState<string[]>([]);
  const [vendor, setVendor] = useState(vendorOptions[0]);
  const [category, setCategory] = useState(categoryOptions[0]);
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [approvalStatus, setApprovalStatus] = useState(approvalStatusOptions[0]);
  const [requestType, setRequestType] = useState(requestTypeOptions[0]);
  const [outputFormat, setOutputFormat] = useState("pdf");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [frequency, setFrequency] = useState(scheduleFrequencyOptions[1]);
  const [recipients, setRecipients] = useState("");
  const [timezone, setTimezone] = useState(timezoneOptions[0]);
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [emailSubject, setEmailSubject] = useState("");

  useEffect(() => {
    if (initialConfig && initialConfig.templateId === template.id) {
      setReportName(initialConfig.reportName);
      setDatePreset((initialConfig.datePreset as DateRangePreset) || "ytd");
      setDepartments(initialConfig.departments ?? []);
      setVendor(initialConfig.vendor || vendorOptions[0]);
      setCategory(initialConfig.category || categoryOptions[0]);
      setAmountMin(initialConfig.amountMin ?? "");
      setAmountMax(initialConfig.amountMax ?? "");
      setApprovalStatus(initialConfig.approvalStatus || approvalStatusOptions[0]);
      setRequestType(initialConfig.requestType || requestTypeOptions[0]);
      setOutputFormat(initialConfig.outputFormat || "pdf");
      setScheduleEnabled(initialConfig.scheduleEnabled ?? defaultScheduleEnabled);
      setFrequency(initialConfig.frequency ?? scheduleFrequencyOptions[1]);
      setRecipients(initialConfig.recipients ?? "");
      setTimezone(initialConfig.timezone ?? timezoneOptions[0]);
      setDeliveryTime(initialConfig.deliveryTime ?? "08:00");
      setEmailSubject(initialConfig.emailSubject ?? `${template.name} - Scheduled Report`);
      onScheduleEnabledChange?.(initialConfig.scheduleEnabled ?? defaultScheduleEnabled);
      return;
    }

    setReportName(template.name);
    setDatePreset("ytd");
    setDepartments([]);
    setVendor(vendorOptions[0]);
    setCategory(categoryOptions[0]);
    setAmountMin("");
    setAmountMax("");
    setApprovalStatus(approvalStatusOptions[0]);
    setRequestType(requestTypeOptions[0]);
    setOutputFormat("pdf");
    setScheduleEnabled(defaultScheduleEnabled);
    setFrequency(scheduleFrequencyOptions[1]);
    setRecipients("");
    setTimezone(timezoneOptions[0]);
    setDeliveryTime("08:00");
    setEmailSubject(`${template.name} - Scheduled Report`);
  }, [template.id, template.name, defaultScheduleEnabled, initialConfig, onScheduleEnabledChange]);

  const toggleDepartment = (dept: string) => {
    setDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept],
    );
  };

  const buildConfig = (): ReportRunConfig => ({
    reportName: reportName.trim() || template.name,
    templateId: template.id,
    templateCategory: template.id.startsWith("ap-")
      ? "AP Reports"
      : template.id.startsWith("approval-")
        ? "Approval Reports"
        : template.id.startsWith("budget-")
          ? "Budget Reports"
          : "Custom Reports",
    outputFormat,
    outputFormatLabel:
      outputFormatOptions.find((opt) => opt.id === outputFormat)?.label ?? outputFormat.toUpperCase(),
    datePreset,
    departments,
    vendor,
    category,
    amountMin,
    amountMax,
    approvalStatus,
    requestType,
    scheduleEnabled,
    frequency: scheduleEnabled ? frequency : undefined,
    recipients: scheduleEnabled ? recipients : undefined,
    timezone: scheduleEnabled ? timezone : undefined,
    deliveryTime: scheduleEnabled ? deliveryTime : undefined,
    emailSubject: scheduleEnabled ? emailSubject : undefined,
  });

  const validate = (): string | null => {
    if (amountMin && amountMax && Number(amountMin) > Number(amountMax)) {
      return "Minimum amount cannot exceed maximum amount.";
    }
    if (scheduleEnabled && !recipients.trim()) {
      return "Enter at least one recipient for scheduled delivery.";
    }
    return null;
  };

  useImperativeHandle(
    ref,
    () => ({
      getRunConfig: () => (validate() ? null : buildConfig()),
      validate,
      getScheduleEnabled: () => scheduleEnabled,
    }),
    [
      reportName,
      template.id,
      template.name,
      outputFormat,
      datePreset,
      departments,
      vendor,
      category,
      amountMin,
      amountMax,
      approvalStatus,
      requestType,
      scheduleEnabled,
      frequency,
      recipients,
      timezone,
      deliveryTime,
      emailSubject,
    ],
  );

  return (
    <div className="app-report-config-form">
      <section className="app-report-config-section">
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <FieldLabel>Report Name</FieldLabel>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            style={reportInputStyle}
            {...inputFocusHandlers}
          />
        </label>
      </section>

      <section className="app-report-config-section">
        <SectionHeader label="Filters" />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <FieldLabel>Date Range</FieldLabel>
          <div className="app-report-config-pills">
            {dateRangePresets.map((preset) => {
              const active = datePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDatePreset(preset.id)}
                  className={`app-report-config-pill${active ? " app-report-config-pill--active" : ""}`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <FieldLabel>Departments</FieldLabel>
          <div className="app-report-config-pills">
            {departmentOptions.map((dept) => {
              const selected = departments.includes(dept);
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => toggleDepartment(dept)}
                  className={`app-report-config-pill${selected ? " app-report-config-pill--active" : ""}`}
                >
                  {dept}
                </button>
              );
            })}
          </div>
          {departments.length === 0 && (
            <span style={{ fontSize: "11px", color: "#98A2B3" }}>No departments selected - all included.</span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <SelectField label="Vendor" value={vendor} onChange={setVendor} options={vendorOptions} />
          <SelectField label="Category" value={category} onChange={setCategory} options={categoryOptions} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <FieldLabel>Amount Range</FieldLabel>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="number"
              placeholder="Min"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              style={{ ...reportInputStyle, flex: 1 }}
              min={0}
              {...inputFocusHandlers}
            />
            <span style={{ fontSize: "12px", color: "#98A2B3", flexShrink: 0 }}>to</span>
            <input
              type="number"
              placeholder="Max"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              style={{ ...reportInputStyle, flex: 1 }}
              min={0}
              {...inputFocusHandlers}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <SelectField
            label="Approval Status"
            value={approvalStatus}
            onChange={setApprovalStatus}
            options={approvalStatusOptions}
          />
          <SelectField
            label="Request Type"
            value={requestType}
            onChange={setRequestType}
            options={requestTypeOptions}
          />
        </div>
      </section>

      <section className="app-report-config-section">
        <SectionHeader label="Output" />
        <SelectField
          label="Format"
          value={outputFormat}
          onChange={setOutputFormat}
          options={outputFormatOptions}
        />
      </section>

      <section className="app-report-config-section app-report-config-section--delivery">
        <SectionHeader label="Delivery" />

        <div className="app-report-config-schedule-toggle">
          <div>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "#101828" }}>Recurring schedule</div>
            <div style={{ fontSize: "12px", color: reportMuted, marginTop: "2px" }}>
              Deliver automatically on a schedule.
            </div>
          </div>
          <Switch
            checked={scheduleEnabled}
            onCheckedChange={(v) => {
              setScheduleEnabled(v);
              onScheduleEnabledChange?.(v);
            }}
          />
        </div>

        <AnimatePresence initial={false}>
          {scheduleEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="app-report-config-schedule-fields">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <SelectField
                    label="Frequency"
                    value={frequency}
                    onChange={setFrequency}
                    options={scheduleFrequencyOptions}
                  />
                  <SelectField label="Timezone" value={timezone} onChange={setTimezone} options={timezoneOptions} />
                </div>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <FieldLabel>Delivery Time</FieldLabel>
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    style={reportInputStyle}
                    {...inputFocusHandlers}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <FieldLabel>Recipients</FieldLabel>
                  <input
                    type="text"
                    placeholder="email@company.com, team@company.com"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    style={reportInputStyle}
                    {...inputFocusHandlers}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <FieldLabel>Email Subject</FieldLabel>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    style={reportInputStyle}
                    {...inputFocusHandlers}
                  />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
},
);

export function ConfigureReportFooter({
  onBack,
  onCancel,
  onRun,
  scheduleMode = false,
  isRunning = false,
}: {
  onBack: () => void;
  onCancel: () => void;
  onRun: () => void;
  scheduleMode?: boolean;
  isRunning?: boolean;
}) {
  return (
    <div className="app-report-drawer-footer app-report-modal-footer-split">
      <button type="button" onClick={onBack} disabled={isRunning} style={reportCancelBtnStyle}>
        Back
      </button>
      <div className="app-report-drawer-footer__actions">
        <button type="button" onClick={onCancel} disabled={isRunning} style={reportCancelBtnStyle}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="app-report-drawer-footer__primary"
          style={{
            ...reportPrimaryBtnStyle,
            opacity: isRunning ? 0.6 : 1,
            cursor: isRunning ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => !isRunning && onPrimaryBtnHover(e, true)}
          onMouseLeave={(e) => !isRunning && onPrimaryBtnHover(e, false)}
        >
          {scheduleMode ? "Schedule Report" : "Run Report"}
        </button>
      </div>
    </div>
  );
}
