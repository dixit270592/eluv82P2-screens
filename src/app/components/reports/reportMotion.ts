import { useEffect, useState } from "react";

/** Report Center motion timing — keep between 150–250ms */
export const REPORT_MOTION = {
  fast: 0.15,
  base: 0.2,
  slow: 0.25,
} as const;

export const REPORT_MOTION_EASE = [0.25, 0.1, 0.25, 1] as const;

export function useReportReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export function reportFadeTransition(reduced: boolean, duration = REPORT_MOTION.base) {
  return {
    duration: reduced ? 0.01 : duration,
    ease: REPORT_MOTION_EASE,
  };
}

export function reportDrawerBackdropTransition(reduced: boolean) {
  return reportFadeTransition(reduced, REPORT_MOTION.base);
}

export function reportDrawerPanelTransition(reduced: boolean) {
  return reduced
    ? { duration: 0.01 }
    : { duration: REPORT_MOTION.slow, ease: REPORT_MOTION_EASE };
}

export function reportModalBackdropTransition(reduced: boolean) {
  return reportFadeTransition(reduced, REPORT_MOTION.base);
}

export function reportModalPanelTransition(reduced: boolean) {
  return reduced
    ? { duration: 0.01 }
    : { duration: REPORT_MOTION.slow, ease: REPORT_MOTION_EASE };
}

export function reportStepTransition(reduced: boolean) {
  return reportFadeTransition(reduced, REPORT_MOTION.base);
}
