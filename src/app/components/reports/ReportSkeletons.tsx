type SkeletonBarProps = {
  width: string | number;
  height?: number;
  delay?: number;
};

function SkeletonBar({ width, height = 10, delay = 0 }: SkeletonBarProps) {
  return (
    <div
      aria-hidden
      className="app-report-skeleton-bar"
      style={{
        width,
        height,
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
    />
  );
}

export function ReportLibraryTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading reports" className="app-report-library-table-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="app-report-library-table-skeleton__row">
          <SkeletonBar width={16} height={16} delay={i * 35} />
          <SkeletonBar width={`${55 + (i % 3) * 8}%`} height={12} delay={i * 35 + 10} />
          <SkeletonBar width={`${40 + (i % 2) * 10}%`} delay={i * 35 + 20} />
          <SkeletonBar width={64} height={18} delay={i * 35 + 30} />
        </div>
      ))}
    </div>
  );
}

export function ReportKpiStripSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading overview metrics" className="app-report-kpi-strip app-report-kpi-strip--loading">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="app-report-kpi-strip__item">
          <SkeletonBar width="60%" height={10} delay={i * 50} />
          <SkeletonBar width="45%" height={22} delay={i * 50 + 40} />
          <SkeletonBar width="70%" height={10} delay={i * 50 + 80} />
        </div>
      ))}
    </div>
  );
}

export function ReportScheduleTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading schedules" className="app-report-schedule-table-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="app-report-schedule-table-skeleton__row">
          <SkeletonBar width={`${50 + (i % 3) * 10}%`} height={12} delay={i * 45} />
          <SkeletonBar width="30%" delay={i * 45 + 15} />
          <SkeletonBar width={72} height={18} delay={i * 45 + 30} />
        </div>
      ))}
    </div>
  );
}

export function ReportTemplateGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading templates" className="app-report-template-grid-skeleton">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="app-report-template-grid-skeleton__card">
          <SkeletonBar width="75%" height={14} delay={i * 55} />
          <SkeletonBar width="100%" height={10} delay={i * 55 + 20} />
          <SkeletonBar width="90%" height={10} delay={i * 55 + 35} />
          <SkeletonBar width="40%" height={28} delay={i * 55 + 55} />
        </div>
      ))}
    </div>
  );
}
