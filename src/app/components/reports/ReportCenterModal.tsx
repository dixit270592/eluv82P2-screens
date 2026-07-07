import { useId, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import {
  onGhostBtnHover,
  reportFont,
  reportGhostIconBtnStyle,
  reportPageSubtitleStyle,
  reportSectionTitleStyle,
} from "./reportUiStyles";
import {
  reportModalBackdropTransition,
  reportModalPanelTransition,
  useReportReducedMotion,
} from "./reportMotion";
import { useReportDrawerA11y } from "./useReportDrawerA11y";

export type ReportCenterModalSize = "default" | "large";

export type ReportCenterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ariaLabel: string;
  size?: ReportCenterModalSize;
  stepLabel?: string;
  headerStart?: React.ReactNode;
  preventDismiss?: boolean;
  bareFooter?: boolean;
};

export function ReportCenterModal({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  ariaLabel,
  size = "default",
  stepLabel,
  headerStart,
  preventDismiss = false,
  bareFooter = false,
}: ReportCenterModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const handleClose = () => onOpenChange(false);
  const reducedMotion = useReportReducedMotion();

  useReportDrawerA11y(open, handleClose, panelRef);

  const handleBackdropClick = () => {
    if (!preventDismiss) handleClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="app-report-modal" role="presentation">
          <motion.div
            className="app-report-modal__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reportModalBackdropTransition(reducedMotion)}
            onClick={handleBackdropClick}
            aria-hidden
          />
          <div className="app-report-modal__viewport">
            <motion.div
              ref={panelRef}
              className={`app-report-modal__panel app-report-modal__panel--${size}`}
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
              transition={reportModalPanelTransition(reducedMotion)}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              aria-labelledby={titleId}
              aria-describedby={subtitle ? descId : undefined}
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: reportFont }}
            >
              <header className="app-report-modal__header">
                {stepLabel && <p className="app-report-modal__step">{stepLabel}</p>}
                <div className="app-report-modal__header-row">
                  {headerStart}
                  <div className="app-report-modal__header-text">
                    <h2 id={titleId} className="app-report-modal__title" style={reportSectionTitleStyle}>
                      {title}
                    </h2>
                    {subtitle && (
                      <p id={descId} className="app-report-modal__subtitle" style={reportPageSubtitleStyle}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!preventDismiss) handleClose();
                    }}
                    disabled={preventDismiss}
                    aria-label="Close dialog"
                    className="app-report-modal__close"
                    style={{
                      ...reportGhostIconBtnStyle,
                      opacity: preventDismiss ? 0.4 : 1,
                      cursor: preventDismiss ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => !preventDismiss && onGhostBtnHover(e, true)}
                    onMouseLeave={(e) => !preventDismiss && onGhostBtnHover(e, false)}
                  >
                    <X size={18} color="#667085" />
                  </button>
                </div>
              </header>

              <div className={`app-report-modal__body${footer ? "" : " app-report-modal__body--no-footer"}`}>
                {children}
              </div>

              {footer && (bareFooter ? footer : <footer className="app-report-modal__footer">{footer}</footer>)}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
