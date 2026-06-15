import { useMemo, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpNarrowWide, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "./ui/utils";

import { UI_FONT_STACK as FONT } from "../tokens/typography";

/** Primary dashboard accent (teal) */
export const DASHBOARD_TEAL = "#1FA97A";

const TRACK_BG = "#E8ECF2";
const CARD_BORDER = "#E4E7EC";
const TEXT_PRIMARY = "#101828";
const TEXT_LABEL = "#475467";
const TEXT_MUTED = "#667085";
const ROW_HOVER = "rgba(31, 169, 122, 0.05)";

/** Preview rows before “View all”; scroll when expanded */
const PREVIEW_ROW_LIMIT = 6;

/** Slightly thicker bars for readability at a glance */
const BAR_CLASS = "h-1 w-full min-w-0 overflow-hidden rounded-full";

/** Vertical rhythm between bar rows (gap + row padding); ~25% tighter than 0.736 */
const BAR_ROW_STACK = 0.736 * 0.75;

export type BarRowItem = { name: string; count: number };

type SortMode = "count-desc" | "count-asc" | "name-asc";

function sortRows(items: BarRowItem[], mode: SortMode): BarRowItem[] {
  const copy = [...items];
  if (mode === "count-desc") {
    copy.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  } else if (mode === "count-asc") {
    copy.sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));
  } else {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  return copy;
}

/** Non-zero only — removes empty rows and saves height */
function meaningfulRows(items: BarRowItem[]): BarRowItem[] {
  return items.filter((r) => r.count > 0);
}

export function statusBarColor(statusName: string): string {
  const s = statusName.toLowerCase();
  if (s.includes("approved")) return "#059669";
  if (s.includes("reject")) return "#DC2626";
  if (s.includes("cancel")) return "#64748B";
  if (s.includes("change")) return "#CA8A04";
  if (s.includes("approval") || s === "new") return "#D97706";
  return DASHBOARD_TEAL;
}

function BarTrack({
  value,
  max,
  color,
  delay,
  emphasize,
}: {
  value: number;
  max: number;
  color: string;
  delay: number;
  emphasize?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const scale = pct / 100;
  return (
    <div className={BAR_CLASS} style={{ background: TRACK_BG, position: "relative" }} aria-hidden>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scale }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
        className="h-full origin-left rounded-full"
        style={{
          width: "100%",
          background: color,
          opacity: emphasize ? 1 : 0.85,
        }}
      />
    </div>
  );
}

function MetricBarListBody({
  sorted,
  scaleMax,
  resolveColor,
  emptyMessage,
  stagger = 0.03,
}: {
  sorted: BarRowItem[];
  scaleMax: number;
  resolveColor: (item: BarRowItem) => string;
  emptyMessage: string;
  stagger?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = sorted.length > PREVIEW_ROW_LIMIT;
  const visibleRows = expanded ? sorted : sorted.slice(0, PREVIEW_ROW_LIMIT);

  if (sorted.length === 0) {
    return (
      <p className="py-3 text-xs sm:text-[13px]" style={{ color: TEXT_MUTED }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-[calc(0.75rem*var(--bar-row-stack))]",
          expanded && hasMore && "max-h-[260px] overflow-y-auto pr-1",
        )}
        style={{ ["--bar-row-stack" as string]: BAR_ROW_STACK } as CSSProperties}
      >
        {visibleRows.map((row, i) => (
          <div
            key={`${row.name}-${i}`}
            title={`${row.name}: ${row.count}`}
            className="flex flex-col gap-[calc(0.5rem*var(--bar-row-stack))] rounded-md px-[calc(0.5rem*var(--bar-row-stack))] py-[calc(0.5rem*var(--bar-row-stack))] transition-colors duration-150 hover:bg-[var(--row-hover)]"
            style={
              {
                "--row-hover": ROW_HOVER,
              } as CSSProperties
            }
          >
            <div className="flex items-baseline justify-between gap-3 leading-snug">
              <span
                className={cn(
                  "min-w-0 truncate text-left text-xs font-normal sm:text-[13px]",
                  i === 0 && "font-medium",
                )}
                style={{ color: TEXT_LABEL }}
              >
                {row.name}
              </span>
              <span
                className={cn(
                  "shrink-0 text-right text-xs font-semibold tabular-nums sm:text-[13px]",
                  i === 0 && "font-bold",
                )}
                style={{ color: i === 0 ? DASHBOARD_TEAL : TEXT_PRIMARY }}
              >
                {row.count}
              </span>
            </div>
            <BarTrack
              value={row.count}
              max={scaleMax}
              color={resolveColor(row)}
              delay={0.12 + i * stagger}
              emphasize={i === 0}
            />
          </div>
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          className="mt-2.5 w-full rounded-md py-1.5 text-left text-xs font-medium transition-colors hover:bg-[#F9FAFB] sm:text-[13px]"
          style={{ color: DASHBOARD_TEAL }}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Show less" : `View all (${sorted.length})`}
        </button>
      ) : null}
    </>
  );
}

function CompactCardHeader({
  title,
  timeframe,
  sortMenu,
}: {
  title: string;
  timeframe?: string;
  sortMenu: React.ReactNode;
}) {
  return (
    <div
      className="border-b border-[#F2F4F7] px-4 py-2.5"
      style={{ fontFamily: FONT }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="min-w-0 flex-1 truncate text-base font-semibold leading-snug tracking-[-0.02em] sm:text-[17px]"
            style={{ color: TEXT_PRIMARY }}
            title={title}
          >
            {title}
          </h3>
          {sortMenu ? (
            <div className="shrink-0 pt-0.5">{sortMenu}</div>
          ) : null}
        </div>
        {timeframe ? (
          <p
            className="min-w-0 truncate text-[13px] font-normal leading-snug sm:text-sm"
            style={{ color: TEXT_MUTED }}
            title={timeframe}
          >
            {timeframe}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SortMenu({ setSort }: { setSort: (m: SortMode) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-[#667085] transition-colors hover:bg-[#F2F4F7] hover:text-[#344054]"
          aria-label="Sort options"
        >
          <MoreHorizontal className="size-3.5" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10.5rem]">
        <DropdownMenuItem className="gap-2 text-xs" onClick={() => setSort("count-desc")}>
          <ArrowDownWideNarrow className="size-3.5 opacity-70" />
          Count (high → low)
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-xs" onClick={() => setSort("count-asc")}>
          <ArrowUpNarrowWide className="size-3.5 opacity-70" />
          Count (low → high)
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-xs" onClick={() => setSort("name-asc")}>
          <ArrowDownAZ className="size-3.5 opacity-70" />
          Name (A → Z)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardAnalyticsGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
        className={cn(
          // Avoid 5-up on tablet/laptop: cards were too narrow (sm: was forcing 5 cols from 640px).
          // Max 3 columns on large screens so each chart card has more breathing room.
          // Column/row gaps tuned so cards align cleanly without oversized vertical rhythm.
          "grid grid-cols-1 gap-3.5 gap-y-4 pb-10 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-5 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-6",
          className,
        )}
      style={{ fontFamily: FONT }}
    >
      {children}
    </div>
  );
}

interface DashboardStatBarCardProps {
  title: string;
  timeframe?: string;
  items: BarRowItem[];
  /** Optional cap for bar scale; defaults to max(count) in data */
  scaleMax?: number;
  sortable?: boolean;
  barColor?: string | ((item: BarRowItem) => string);
  className?: string;
}

export function DashboardStatBarCard({
  title,
  timeframe = "Last 30 days",
  items,
  scaleMax: scaleMaxProp,
  sortable = true,
  barColor = DASHBOARD_TEAL,
  className,
}: DashboardStatBarCardProps) {
  const [sort, setSort] = useState<SortMode>("count-desc");

  const sorted = useMemo(() => {
    return sortRows(meaningfulRows(items), sort);
  }, [items, sort]);

  const scaleMax = useMemo(() => {
    if (scaleMaxProp != null && scaleMaxProp > 0) return scaleMaxProp;
    const m = Math.max(...sorted.map((r) => r.count), 1);
    return m;
  }, [sorted, scaleMaxProp]);

  const resolveColor = (item: BarRowItem) =>
    typeof barColor === "function" ? barColor(item) : barColor;

  const sortMenu = sortable ? <SortMenu setSort={setSort} /> : null;

  return (
    <div
      className={cn(
        "group/card flex h-full min-h-0 min-w-0 flex-col rounded-xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[box-shadow,border-color] duration-200 hover:border-[#D0D5DD] hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]",
        className,
      )}
      style={{ borderColor: CARD_BORDER, fontFamily: FONT }}
    >
      <CompactCardHeader
        title={title}
        timeframe={timeframe}
        sortMenu={sortMenu}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-3.5 pt-3">
        <MetricBarListBody
          sorted={sorted}
          scaleMax={scaleMax}
          resolveColor={resolveColor}
          emptyMessage="No activity in this period."
        />
      </div>
    </div>
  );
}

export function DashboardRequesterGridCard({
  title,
  timeframe = "Last 30 days",
  items,
  scaleMax: scaleMaxProp,
  className,
}: {
  title: string;
  timeframe?: string;
  items: BarRowItem[];
  scaleMax?: number;
  className?: string;
}) {
  const sorted = useMemo(() => sortRows(meaningfulRows(items), "count-desc"), [items]);

  const scaleMax = useMemo(() => {
    if (scaleMaxProp != null && scaleMaxProp > 0) return scaleMaxProp;
    return Math.max(...sorted.map((r) => r.count), 1);
  }, [sorted, scaleMaxProp]);

  return (
    <div
      className={cn(
        "group/card flex h-full min-h-0 min-w-0 flex-col rounded-xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[box-shadow,border-color] duration-200 hover:border-[#D0D5DD] hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]",
        className,
      )}
      style={{ borderColor: CARD_BORDER, fontFamily: FONT }}
    >
      <CompactCardHeader
        title={title}
        timeframe={timeframe}
        sortMenu={null}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-3.5 pt-3">
        <MetricBarListBody
          sorted={sorted}
          scaleMax={scaleMax}
          resolveColor={() => DASHBOARD_TEAL}
          emptyMessage="No purchase orders in this period."
          stagger={0.04}
        />
      </div>
    </div>
  );
}
