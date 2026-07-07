import { RefreshCw, X } from "lucide-react";
import { reportFont } from "./reportUiStyles";

type ReportSectionErrorBannerProps = {
  message: string;
  onRetry: () => void;
  onDismiss?: () => void;
};

/** Inline banner when stale data is shown alongside a recoverable API error. */
export function ReportSectionErrorBanner({
  message,
  onRetry,
  onDismiss,
}: ReportSectionErrorBannerProps) {
  return (
    <div role="alert" className="app-report-section-error" style={{ fontFamily: reportFont }}>
      <span className="app-report-section-error__message">{message}</span>
      <div className="app-report-section-error__actions">
        <button type="button" className="app-report-section-error__retry" onClick={onRetry}>
          <RefreshCw size={12} aria-hidden />
          Retry
        </button>
        {onDismiss && (
          <button
            type="button"
            className="app-report-section-error__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <X size={12} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
