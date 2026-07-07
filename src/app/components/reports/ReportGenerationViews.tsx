import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  HardDrive,
  Loader2,
  Bookmark,
  List,
  X,
} from "lucide-react";
import type { GeneratedReportResult } from "./reportGenerationTypes";
import { P2P_BRAND } from "../../tokens/brand";
import { useReports } from "../../context/ReportsContext";
import {
  onIconBtnHover,
  onPrimaryBtnHover,
  REPORT_CONTROL_HEIGHT,
  reportFont,
  reportPageTitleStyle,
  reportPageSubtitleStyle,
  reportPrimaryBtnStyle,
  reportSecondaryBtnStyle,
  reportSectionTitleStyle,
} from "./reportUiStyles";
import { reportFadeTransition, useReportReducedMotion } from "./reportMotion";

const primaryActionBtnStyle: React.CSSProperties = {
  ...reportPrimaryBtnStyle,
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px 12px",
  minHeight: `${REPORT_CONTROL_HEIGHT}px`,
};

const secondaryActionBtnStyle: React.CSSProperties = {
  ...reportSecondaryBtnStyle,
  width: "auto",
  display: "inline-flex",
  padding: "8px 12px",
};

export function ReportGeneratingPanel({ reportName }: { reportName: string }) {
  const reducedMotion = useReportReducedMotion();

  return (
    <motion.div
      key="generating-step"
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: reducedMotion ? 1 : 0 }}
      transition={reportFadeTransition(reducedMotion)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Generating report"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        minHeight: "320px",
        fontFamily: reportFont,
      }}
    >
      <motion.div
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={reducedMotion ? undefined : { duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: P2P_BRAND.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <Loader2 size={24} color={P2P_BRAND.primary} aria-hidden />
      </motion.div>
      <div style={{ ...reportSectionTitleStyle, marginBottom: "6px" }}>
        Generating Report
      </div>
      <p style={{ ...reportPageSubtitleStyle, margin: "0 0 16px 0", maxWidth: "280px" }}>
        Processing <span style={{ fontWeight: 600, color: "#344054" }}>{reportName}</span>…
      </p>
      <div
        style={{
          width: "100%",
          maxWidth: "240px",
          height: "6px",
          background: "#F2F4F7",
          borderRadius: "10px",
          overflow: "hidden",
        }}
        aria-hidden
      >
        <motion.div
          initial={{ width: reducedMotion ? "100%" : "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: reducedMotion ? 0.01 : 1.8, ease: "easeInOut" }}
          style={{ height: "100%", background: P2P_BRAND.primary, borderRadius: "10px" }}
        />
      </div>
    </motion.div>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "7px",
          background: "#F9FAFB",
          border: "1px solid #E4E7EC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#667085",
        }}
        aria-hidden
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "11px", color: "#98A2B3", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#101828", marginTop: "1px" }}>{value}</div>
      </div>
    </div>
  );
}

export function ReportSuccessPanel({
  result,
  onClose,
  onViewInLibrary,
  scheduleMode = false,
  onScheduleAgain,
}: {
  result: GeneratedReportResult;
  onClose: () => void;
  onViewInLibrary?: () => void;
  scheduleMode?: boolean;
  onScheduleAgain?: () => void;
}) {
  const { downloadGenerated, saveReportFromSuccess } = useReports();
  const reducedMotion = useReportReducedMotion();

  return (
    <motion.div
      key="success-step"
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: reducedMotion ? 1 : 0 }}
      transition={reportFadeTransition(reducedMotion)}
      role="status"
      aria-live="polite"
      aria-label="Report generated successfully"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        paddingBottom: "4px",
        fontFamily: reportFont,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: "8px" }}>
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reportFadeTransition(reducedMotion)}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#ECFDF5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "14px",
          }}
        >
          <CheckCircle2 size={28} color="#059669" strokeWidth={2.2} aria-hidden />
        </motion.div>
        <h3 style={{ ...reportPageTitleStyle, fontSize: "14px", fontWeight: 600 }}>
          {scheduleMode ? "Report Scheduled" : "Report Generated"}
        </h3>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #E4E7EC",
          background: "#FAFBFC",
        }}
      >
        <DetailRow label="Report Name" value={result.reportName} icon={<FileText size={13} />} />
        <DetailRow label="Generated Time" value={result.generatedTime} icon={<Clock size={13} />} />
        <DetailRow label="Records" value={result.records.toLocaleString()} icon={<List size={13} />} />
        <DetailRow label="File Size" value={result.fileSize} icon={<HardDrive size={13} />} />
        <DetailRow label="Export Format" value={result.exportFormat} icon={<FileText size={13} />} />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          style={primaryActionBtnStyle}
          aria-label="View report in library"
          onClick={() => (onViewInLibrary ? onViewInLibrary() : onClose())}
          onMouseEnter={(e) => onPrimaryBtnHover(e, true)}
          onMouseLeave={(e) => onPrimaryBtnHover(e, false)}
        >
          <Eye size={14} aria-hidden />
          View in Library
        </button>
        <button
          type="button"
          style={primaryActionBtnStyle}
          aria-label="Download report"
          onClick={() => downloadGenerated(result)}
          onMouseEnter={(e) => onPrimaryBtnHover(e, true)}
          onMouseLeave={(e) => onPrimaryBtnHover(e, false)}
        >
          <Download size={14} aria-hidden />
          Download
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}
      >
        {[
          { label: "Save Report", icon: <Bookmark size={13} color="#667085" aria-hidden />, onClick: () => saveReportFromSuccess(result) },
          { label: "Close", icon: <X size={13} color="#667085" aria-hidden />, onClick: onClose },
        ].map((action) => (
          <button
            key={action.label}
            type="button"
            style={secondaryActionBtnStyle}
            aria-label={action.label}
            onClick={action.onClick}
            onMouseEnter={(e) => onIconBtnHover(e, true)}
            onMouseLeave={(e) => onIconBtnHover(e, false)}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
