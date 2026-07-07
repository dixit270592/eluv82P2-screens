import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
} from "./reportUiStyles";
import { resolveConfigureDateRange } from "../../utils/reportConfigureDateRange";

export type ConfigureTab = "basic" | "advanced" | "delivery";

export type ConfigureReportPanelHandle = {
  getRunConfig: () => ReportRunConfig | null;
  validate: () => string | null;
  getScheduleEnabled: () => boolean;
  getActiveTab: () => ConfigureTab;
  setActiveTab: (tab: ConfigureTab) => void;
};

const inputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => onInputFocus(e, true),
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => onInputFocus(e, false),
};

const CONFIG_TABS: { id: ConfigureTab; label: string }[] = [
  { id: "basic", label: "Basic Filters" },
  { id: "advanced", label: "Advanced Filters" },
  { id: "delivery", label: "Delivery Options" },
];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span style={reportLabelStyle}>
      {children}
      {required && <span style={{ color: "#F04438", marginLeft: "2px" }}>*</span>}
    </span>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[] | { id: string; label: string }[];
  required?: boolean;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={reportInputStyle} {...inputFocusHandlers}>
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

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="app-report-config-checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export const ConfigureReportPanel = forwardRef<
  ConfigureReportPanelHandle,
  {
    template: ReportTemplate;
    templates?: ReportTemplate[];
    onTemplateChange?: (template: ReportTemplate) => void;
    defaultScheduleEnabled?: boolean;
    defaultEmailOnGenerate?: boolean;
    onScheduleEnabledChange?: (enabled: boolean) => void;
    initialConfig?: ReportRunConfig | null;
    activeTab?: ConfigureTab;
    onActiveTabChange?: (tab: ConfigureTab) => void;
    compact?: boolean;
  }
>(function ConfigureReportPanel(
  {
    template,
    templates,
    onTemplateChange,
    defaultScheduleEnabled = false,
    defaultEmailOnGenerate = false,
    onScheduleEnabledChange,
    initialConfig = null,
    activeTab: controlledTab,
    onActiveTabChange,
    compact = false,
  },
  ref,
) {
  const [internalTab, setInternalTab] = useState<ConfigureTab>("basic");
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: ConfigureTab) => {
    if (onActiveTabChange) onActiveTabChange(tab);
    else setInternalTab(tab);
  };

  const [reportName, setReportName] = useState(template.name);
  const [datePreset, setDatePreset] = useState<DateRangePreset>("ytd");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [datesCustomized, setDatesCustomized] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [vendor, setVendor] = useState(vendorOptions[0]);
  const [category, setCategory] = useState(categoryOptions[0]);
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [approvalStatus, setApprovalStatus] = useState(approvalStatusOptions[0]);
  const [requestType, setRequestType] = useState(requestTypeOptions[0]);
  const [includeRejectedItems, setIncludeRejectedItems] = useState(false);
  const [processingTimeMin, setProcessingTimeMin] = useState("");
  const [processingTimeMax, setProcessingTimeMax] = useState("");
  const [outputFormat, setOutputFormat] = useState("pdf");
  const [emailOnGenerate, setEmailOnGenerate] = useState(defaultEmailOnGenerate);
  const [scheduleEnabled, setScheduleEnabled] = useState(defaultScheduleEnabled);
  const [frequency, setFrequency] = useState(scheduleFrequencyOptions[1]);
  const [recipients, setRecipients] = useState("");
  const [timezone, setTimezone] = useState(timezoneOptions[0]);
  const [deliveryTime, setDeliveryTime] = useState("08:00");
  const [emailSubject, setEmailSubject] = useState("");

  useEffect(() => {
    if (initialConfig && initialConfig.templateId === template.id) {
      setReportName(initialConfig.reportName);
      setDatePreset((initialConfig.datePreset as DateRangePreset) || "ytd");
      setCustomStartDate(initialConfig.customStartDate ?? "");
      setCustomEndDate(initialConfig.customEndDate ?? "");
      setDatesCustomized(!!initialConfig.customStartDate && !!initialConfig.customEndDate);
      setDepartments(initialConfig.departments ?? []);
      setVendor(initialConfig.vendor || vendorOptions[0]);
      setCategory(initialConfig.category || categoryOptions[0]);
      setAmountMin(initialConfig.amountMin ?? "");
      setAmountMax(initialConfig.amountMax ?? "");
      setApprovalStatus(initialConfig.approvalStatus || approvalStatusOptions[0]);
      setRequestType(initialConfig.requestType || requestTypeOptions[0]);
      setIncludeRejectedItems(initialConfig.includeRejectedItems ?? false);
      setProcessingTimeMin(initialConfig.processingTimeMin ?? "");
      setProcessingTimeMax(initialConfig.processingTimeMax ?? "");
      setOutputFormat(initialConfig.outputFormat || "pdf");
      setEmailOnGenerate(initialConfig.emailOnGenerate ?? defaultEmailOnGenerate);
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
    setDatesCustomized(false);
    setDepartments([]);
    setVendor(vendorOptions[0]);
    setCategory(categoryOptions[0]);
    setAmountMin("");
    setAmountMax("");
    setApprovalStatus(approvalStatusOptions[0]);
    setRequestType(requestTypeOptions[0]);
    setIncludeRejectedItems(false);
    setProcessingTimeMin("");
    setProcessingTimeMax("");
    setOutputFormat("pdf");
    setEmailOnGenerate(defaultEmailOnGenerate);
    setScheduleEnabled(defaultScheduleEnabled);
    setFrequency(scheduleFrequencyOptions[1]);
    setRecipients("");
    setTimezone(timezoneOptions[0]);
    setDeliveryTime("08:00");
    setEmailSubject(`${template.name} - Scheduled Report`);
  }, [template.id, template.name, defaultScheduleEnabled, defaultEmailOnGenerate, initialConfig, onScheduleEnabledChange]);

  useEffect(() => {
    if (datesCustomized) return;
    const range = resolveConfigureDateRange(datePreset);
    setCustomStartDate(range.start);
    setCustomEndDate(range.end);
  }, [datePreset, datesCustomized]);

  const toggleDepartment = (dept: string) => {
    setDepartments((prev) => (prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]));
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
    outputFormatLabel: outputFormatOptions.find((opt) => opt.id === outputFormat)?.label ?? outputFormat.toUpperCase(),
    datePreset,
    customStartDate,
    customEndDate,
    departments,
    vendor,
    category,
    amountMin,
    amountMax,
    approvalStatus,
    requestType,
    includeRejectedItems,
    processingTimeMin,
    processingTimeMax,
    emailOnGenerate,
    scheduleEnabled,
    frequency: scheduleEnabled ? frequency : undefined,
    recipients: scheduleEnabled || emailOnGenerate ? recipients : undefined,
    timezone: scheduleEnabled ? timezone : undefined,
    deliveryTime: scheduleEnabled ? deliveryTime : undefined,
    emailSubject: scheduleEnabled ? emailSubject : undefined,
  });

  const validate = (): string | null => {
    if (!reportName.trim()) return "Report name is required.";
    if (customStartDate && customEndDate && customStartDate > customEndDate) {
      setActiveTab("basic");
      return "Start date cannot be after end date.";
    }
    if (amountMin && amountMax && Number(amountMin) > Number(amountMax)) {
      return "Minimum amount cannot exceed maximum amount.";
    }
    if (processingTimeMin && processingTimeMax && processingTimeMin > processingTimeMax) {
      return "Minimum processing time cannot exceed maximum.";
    }
    if (scheduleEnabled && !recipients.trim()) {
      setActiveTab("delivery");
      return "Enter at least one recipient for scheduled delivery.";
    }
    if (emailOnGenerate && !recipients.trim()) {
      setActiveTab("delivery");
      return "Enter at least one recipient for email delivery.";
    }
    return null;
  };

  useImperativeHandle(
    ref,
    () => ({
      getRunConfig: () => (validate() ? null : buildConfig()),
      validate: () => {
        const err = validate();
        if (err?.includes("date")) setActiveTab("basic");
        else if (err?.includes("scheduled") || err?.includes("email")) setActiveTab("delivery");
        return err;
      },
      getScheduleEnabled: () => scheduleEnabled,
      getActiveTab: () => activeTab,
      setActiveTab,
    }),
    [
      reportName,
      template.id,
      template.name,
      outputFormat,
      datePreset,
      customStartDate,
      customEndDate,
      departments,
      vendor,
      category,
      amountMin,
      amountMax,
      approvalStatus,
      requestType,
      includeRejectedItems,
      processingTimeMin,
      processingTimeMax,
      emailOnGenerate,
      scheduleEnabled,
      frequency,
      recipients,
      timezone,
      deliveryTime,
      emailSubject,
      activeTab,
    ],
  );

  return (
    <div className={`app-report-config-form${compact ? " app-report-config-form--compact" : ""}`}>
      <section className="app-report-config-section app-report-config-section--header">
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <FieldLabel required>Report Name</FieldLabel>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            style={reportInputStyle}
            {...inputFocusHandlers}
          />
        </label>

        {templates && templates.length > 0 && onTemplateChange && (
          <SelectField
            label="Report Template"
            required
            value={template.id}
            onChange={(id) => {
              const next = templates.find((t) => t.id === id);
              if (next) onTemplateChange(next);
            }}
            options={templates.map((t) => ({ id: t.id, label: t.name }))}
          />
        )}
      </section>

      <div className="app-report-config-tabs" role="tablist" aria-label="Report configuration sections">
        {CONFIG_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`report-config-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`report-config-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`app-report-config-tab${activeTab === tab.id ? " app-report-config-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => {
              const idx = CONFIG_TABS.findIndex((t) => t.id === tab.id);
              if (e.key === "ArrowRight") {
                e.preventDefault();
                setActiveTab(CONFIG_TABS[(idx + 1) % CONFIG_TABS.length].id);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                setActiveTab(CONFIG_TABS[(idx - 1 + CONFIG_TABS.length) % CONFIG_TABS.length].id);
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="app-report-config-tab-panel"
        role="tabpanel"
        id={`report-config-panel-${activeTab}`}
        aria-labelledby={`report-config-tab-${activeTab}`}
      >
        {activeTab === "basic" && (
          <section className="app-report-config-section">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <FieldLabel>Date Range</FieldLabel>
              <div className="app-report-config-pills">
                {dateRangePresets.map((preset) => {
                  const isActive = datePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setDatesCustomized(false);
                        setDatePreset(preset.id);
                      }}
                      className={`app-report-config-pill${isActive ? " app-report-config-pill--active" : ""}`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <div className="app-report-config-date-row">
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <FieldLabel>Start date</FieldLabel>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setDatesCustomized(true);
                      setCustomStartDate(e.target.value);
                    }}
                    style={reportInputStyle}
                    {...inputFocusHandlers}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <FieldLabel>End date</FieldLabel>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setDatesCustomized(true);
                      setCustomEndDate(e.target.value);
                    }}
                    style={reportInputStyle}
                    {...inputFocusHandlers}
                  />
                </label>
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
                <span style={{ fontSize: "11px", color: "#98A2B3" }}>No departments selected — all included.</span>
              )}
            </div>

            <SelectField label="Vendors" value={vendor} onChange={setVendor} options={vendorOptions} />
          </section>
        )}

        {activeTab === "advanced" && (
          <section className="app-report-config-section">
            <CheckboxField
              label="Include rejected items"
              checked={includeRejectedItems}
              onChange={setIncludeRejectedItems}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <FieldLabel>Processing Time (Time)</FieldLabel>
              <div className="app-report-config-date-row">
                <input
                  type="time"
                  placeholder="Select min time"
                  value={processingTimeMin}
                  onChange={(e) => setProcessingTimeMin(e.target.value)}
                  style={{ ...reportInputStyle, flex: 1 }}
                  {...inputFocusHandlers}
                />
                <span style={{ fontSize: "12px", color: "#98A2B3", flexShrink: 0 }}>to</span>
                <input
                  type="time"
                  placeholder="Select max time"
                  value={processingTimeMax}
                  onChange={(e) => setProcessingTimeMax(e.target.value)}
                  style={{ ...reportInputStyle, flex: 1 }}
                  {...inputFocusHandlers}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <SelectField label="Category" value={category} onChange={setCategory} options={categoryOptions} />
              <SelectField
                label="Request Type"
                value={requestType}
                onChange={setRequestType}
                options={requestTypeOptions}
              />
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

            <SelectField
              label="Approval Status"
              value={approvalStatus}
              onChange={setApprovalStatus}
              options={approvalStatusOptions}
            />
          </section>
        )}

        {activeTab === "delivery" && (
          <section className="app-report-config-section app-report-config-section--delivery">
            <SelectField
              label="Output Format"
              value={outputFormat}
              onChange={setOutputFormat}
              options={outputFormatOptions}
            />

            <CheckboxField
              label="Email report when generated"
              checked={emailOnGenerate}
              onChange={setEmailOnGenerate}
            />

            <CheckboxField
              label="Schedule this report"
              checked={scheduleEnabled}
              onChange={(v) => {
                setScheduleEnabled(v);
                onScheduleEnabledChange?.(v);
              }}
            />

            <AnimatePresence initial={false}>
              {(scheduleEnabled || emailOnGenerate) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="app-report-config-schedule-fields">
                    {scheduleEnabled && (
                      <>
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
                          <FieldLabel required={scheduleEnabled}>Email Subject</FieldLabel>
                          <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            style={reportInputStyle}
                            {...inputFocusHandlers}
                          />
                        </label>
                      </>
                    )}

                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <FieldLabel required={scheduleEnabled || emailOnGenerate}>Recipients</FieldLabel>
                      <input
                        type="text"
                        placeholder="email@company.com, team@company.com"
                        value={recipients}
                        onChange={(e) => setRecipients(e.target.value)}
                        style={reportInputStyle}
                        {...inputFocusHandlers}
                      />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
      </div>
    </div>
  );
});

export function ConfigureReportFooter({
  onCancel,
  onRun,
  onPreview,
  onViewInLibrary,
  scheduleEnabled = false,
  isRunning = false,
  saveComplete = false,
}: {
  onBack?: () => void;
  onCancel: () => void;
  onRun: () => void;
  onPreview?: () => void;
  onViewInLibrary?: () => void;
  scheduleMode?: boolean;
  scheduleEnabled?: boolean;
  isRunning?: boolean;
  showPreview?: boolean;
  saveComplete?: boolean;
}) {
  if (saveComplete && onViewInLibrary) {
    return (
      <div className="app-report-create-footer">
        <button type="button" onClick={onCancel} style={reportCancelBtnStyle}>
          Done
        </button>
        <div className="app-report-create-footer__actions">
          <button
            type="button"
            onClick={onViewInLibrary}
            className="app-report-create-footer__primary"
            style={reportPrimaryBtnStyle}
            onMouseEnter={(e) => onPrimaryBtnHover(e, true)}
            onMouseLeave={(e) => onPrimaryBtnHover(e, false)}
          >
            View in Library
          </button>
        </div>
      </div>
    );
  }

  const primaryLabel = scheduleEnabled ? "Save & Schedule" : "Generate Report";
  const runningLabel = scheduleEnabled ? "Saving…" : "Generating…";

  return (
    <div className="app-report-create-footer">
      <button type="button" onClick={onCancel} disabled={isRunning} style={reportCancelBtnStyle}>
        Cancel
      </button>
      <div className="app-report-create-footer__actions">
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            disabled={isRunning}
            className="app-report-create-footer__preview"
          >
            Preview Report
          </button>
        )}
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="app-report-create-footer__primary"
          style={{
            ...reportPrimaryBtnStyle,
            opacity: isRunning ? 0.6 : 1,
            cursor: isRunning ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => !isRunning && onPrimaryBtnHover(e, true)}
          onMouseLeave={(e) => !isRunning && onPrimaryBtnHover(e, false)}
        >
          {isRunning ? runningLabel : primaryLabel}
        </button>
      </div>
    </div>
  );
}
