import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { fmtCurrency } from "../../data/reportOverviewData";
import type { BudgetActualRow, VendorInsightRow } from "../../data/reportInsightsData";
import type { OverviewKpiCounts } from "../../utils/reportApiMappers";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";

export const insightsChartColors = {
  brand: "#1FA97A",
  brandMuted: "#B8E8D9",
  blue: "#1570EF",
  teal: "#1A7A6E",
  purple: "#7B5EA7",
  orange: "#DC6803",
  amber: "#D97706",
  red: "#D92D20",
  slate: "#667085",
  muted: "#EAECF0",
  grid: "#F2F4F7",
} as const;

const statusPalette = [
  insightsChartColors.brand,
  insightsChartColors.blue,
  insightsChartColors.purple,
  insightsChartColors.orange,
  insightsChartColors.teal,
  insightsChartColors.amber,
  insightsChartColors.slate,
];

const monthlySpendConfig = {
  value: { label: "Current year", color: insightsChartColors.brand },
  prev: { label: "Prior year", color: insightsChartColors.muted },
} satisfies ChartConfig;

const departmentConfig = {
  prs: { label: "Purchase Requests", color: insightsChartColors.brand },
  pos: { label: "Purchase Orders", color: insightsChartColors.blue },
  invoices: { label: "Invoices", color: insightsChartColors.purple },
} satisfies ChartConfig;

const budgetConfig = {
  utilization: { label: "Utilization", color: insightsChartColors.brand },
} satisfies ChartConfig;

const vendorConfig = {
  amount: { label: "Spend", color: insightsChartColors.teal },
} satisfies ChartConfig;

function formatCompactCurrency(value: number) {
  return fmtCurrency(value);
}

function budgetBarColor(pct: number) {
  if (pct > 95) return insightsChartColors.red;
  if (pct > 90) return insightsChartColors.orange;
  return insightsChartColors.brand;
}

function truncateLabel(label: string, max = 18) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

type MonthlySpendChartProps = {
  data: { month: string; value: number; prev: number }[];
  chartLabel: string;
};

export function MonthlySpendTrendChart({ data, chartLabel }: MonthlySpendChartProps) {
  return (
    <div
      role="img"
      aria-label={`${chartLabel}. ${data.map((d) => `${d.month}: ${fmtCurrency(d.value)} current, ${fmtCurrency(d.prev)} prior year`).join("; ")}`}
    >
      <ChartContainer config={monthlySpendConfig} className="aspect-auto h-[260px] w-full">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={insightsChartColors.grid} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#98A2B3", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: "#98A2B3", fontSize: 11 }}
            tickFormatter={formatCompactCurrency}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <span className="font-medium tabular-nums">{fmtCurrency(Number(value))}</span>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            type="monotone"
            dataKey="prev"
            fill="var(--color-prev)"
            fillOpacity={0.35}
            stroke="var(--color-prev)"
            strokeWidth={2}
            dot={false}
          />
          <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}

type DepartmentRow = { department: string; prs: number; pos: number; invoices: number };

export function DepartmentBreakdownChart({ rows }: { rows: DepartmentRow[] }) {
  const chartData = rows.map((row) => ({
    ...row,
    department: truncateLabel(row.department, 14),
    fullName: row.department,
  }));

  return (
    <ChartContainer config={departmentConfig} className="aspect-auto h-[260px] w-full">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={insightsChartColors.grid} />
        <XAxis
          dataKey="department"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#98A2B3", fontSize: 10 }}
          interval={0}
          angle={chartData.length > 4 ? -24 : 0}
          textAnchor={chartData.length > 4 ? "end" : "middle"}
          height={chartData.length > 4 ? 52 : 32}
        />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#98A2B3", fontSize: 11 }} width={36} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullName ?? payload?.[0]?.payload?.department ?? ""
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="prs" stackId="dept" fill="var(--color-prs)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="pos" stackId="dept" fill="var(--color-pos)" />
        <Bar dataKey="invoices" stackId="dept" fill="var(--color-invoices)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

function DonutCenter({ value, label }: { value: string; label: string }) {
  return (
    <div className="app-report-insights-donut-center">
      <span className="app-report-insights-donut-center__value">{value}</span>
      <span className="app-report-insights-donut-center__label">{label}</span>
    </div>
  );
}

function DonutLegend({
  items,
}: {
  items: Array<{ label: string; value: number; color: string; pct: number }>;
}) {
  return (
    <ul className="app-report-insights-donut-legend">
      {items.map((item) => (
        <li key={item.label} className="app-report-insights-donut-legend__item">
          <span className="app-report-insights-donut-legend__swatch" style={{ background: item.color }} aria-hidden />
          <span className="app-report-insights-donut-legend__label">{item.label}</span>
          <span className="app-report-insights-donut-legend__value">
            {item.value.toLocaleString()}
            <span className="app-report-insights-donut-legend__pct">({item.pct}%)</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StatusDistributionDonutChart({ rows }: { rows: Array<{ label: string; value: number }> }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const chartData = rows.map((row, index) => ({
    ...row,
    fill: statusPalette[index % statusPalette.length],
    pct: total > 0 ? Math.round((row.value / total) * 100) : 0,
  }));

  const config = Object.fromEntries(
    chartData.map((row) => [row.label, { label: row.label, color: row.fill }]),
  ) satisfies ChartConfig;

  return (
    <div className="app-report-insights-donut-layout">
      <div className="app-report-insights-donut-chart">
        <ChartContainer config={config} className="aspect-square h-[200px] w-[200px] mx-auto">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <>
                      <span>{name}</span>
                      <span className="font-medium tabular-nums">{Number(value).toLocaleString()}</span>
                    </>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <DonutCenter value={total.toLocaleString()} label="Total" />
      </div>
      <DonutLegend items={chartData} />
    </div>
  );
}

export function TransactionMixDonutChart({ counts }: { counts: OverviewKpiCounts }) {
  const raw = [
    { label: "Purchase Requests", value: counts.purchaseRequests, color: insightsChartColors.brand },
    { label: "Purchase Orders", value: counts.purchaseOrders, color: insightsChartColors.blue },
    { label: "Invoices", value: counts.invoices, color: insightsChartColors.purple },
    { label: "Expenses", value: counts.expenses, color: insightsChartColors.orange },
    { label: "CapEx PRs", value: counts.capExPRs, color: insightsChartColors.teal },
  ].filter((item) => item.value > 0);

  const total = raw.reduce((sum, item) => sum + item.value, 0);
  const chartData = raw.map((item) => ({
    ...item,
    pct: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));

  if (chartData.length === 0) return null;

  const config = Object.fromEntries(
    chartData.map((row) => [row.label, { label: row.label, color: row.color }]),
  ) satisfies ChartConfig;

  return (
    <div className="app-report-insights-donut-layout">
      <div className="app-report-insights-donut-chart">
        <ChartContainer config={config} className="aspect-square h-[200px] w-[200px] mx-auto">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <>
                      <span>{name}</span>
                      <span className="font-medium tabular-nums">{Number(value).toLocaleString()}</span>
                    </>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <DonutCenter value={total.toLocaleString()} label="Transactions" />
      </div>
      <DonutLegend items={chartData} />
    </div>
  );
}

export function BudgetUtilizationChart({ rows }: { rows: BudgetActualRow[] }) {
  const chartData = rows.map((row) => ({
    dept: truncateLabel(row.dept, 16),
    fullName: row.dept,
    utilization: row.utilizationPct,
    actual: row.actual,
    variance: row.variance,
    fill: budgetBarColor(row.utilizationPct),
  }));

  return (
    <ChartContainer config={budgetConfig} className="aspect-auto h-[240px] w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={insightsChartColors.grid} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#98A2B3", fontSize: 11 }}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="dept"
          tickLine={false}
          axisLine={false}
          width={108}
          tick={{ fill: "#344054", fontSize: 11 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
              formatter={(value, _name, item) => (
                <div className="grid gap-0.5 text-right">
                  <span className="font-medium tabular-nums">{value}% utilized</span>
                  <span className="text-muted-foreground tabular-nums">{fmtCurrency(item.payload.actual)} spent</span>
                  <span className="text-muted-foreground tabular-nums">{fmtCurrency(item.payload.variance)} remaining</span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="utilization" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {chartData.map((entry) => (
            <Cell key={entry.dept} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function VendorSpendChart({ rows }: { rows: VendorInsightRow[] }) {
  const chartData = rows.map((row) => ({
    name: truncateLabel(row.name, 18),
    fullName: row.name,
    amount: row.amount,
    share: row.share,
    orders: row.orders,
    change: row.change,
  }));

  return (
    <div>
      <ChartContainer config={vendorConfig} className="aspect-auto h-[220px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={insightsChartColors.grid} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#98A2B3", fontSize: 11 }}
            tickFormatter={formatCompactCurrency}
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={112}
            tick={{ fill: "#344054", fontSize: 11 }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                formatter={(value, _name, item) => (
                  <div className="grid gap-0.5 text-right">
                    <span className="font-medium tabular-nums">{fmtCurrency(Number(value))}</span>
                    <span className="text-muted-foreground tabular-nums">{item.payload.share}% of spend</span>
                    <span className="text-muted-foreground tabular-nums">{item.payload.orders} orders</span>
                  </div>
                )}
              />
            }
          />
          <Bar dataKey="amount" fill="var(--color-amount)" radius={[0, 4, 4, 0]} maxBarSize={18} />
        </BarChart>
      </ChartContainer>
      <ul className="app-report-insights-vendor-meta">
        {rows.map((row) => (
          <li key={row.name}>
            <span>{row.name}</span>
            <span>
              {row.share}% · {row.orders} orders · {row.change > 0 ? "+" : ""}
              {row.change}% YoY
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
