import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildPreviewChartSeries,
  formatAxisValue,
  getPreviewChartAxisLabel,
  reportChartTheme,
  type PreviewChartPoint,
  type PreviewChartSeries,
} from "../../utils/reportPreviewChartData";
import type { PreviewColumn, PreviewRow } from "../../utils/reportPreviewData";
import { ChartContainer, ChartTooltip, type ChartConfig } from "../ui/chart";

type ReportPreviewChartsProps = {
  columns: PreviewColumn[];
  rows: PreviewRow[];
};

function buildChartConfig(series: PreviewChartSeries): ChartConfig {
  return Object.fromEntries(
    series.points.map((point) => [point.label, { label: point.label, color: point.color }]),
  );
}

function PreviewChartLegend({ points }: { points: PreviewChartPoint[] }) {
  return (
    <ul className="app-report-preview-chart-legend" aria-label="Chart legend">
      {points.map((point) => (
        <li key={point.label} className="app-report-preview-chart-legend__item">
          <span
            className="app-report-preview-chart-legend__swatch"
            style={{ backgroundColor: point.color }}
            aria-hidden
          />
          <span className="app-report-preview-chart-legend__label">{point.label}</span>
          <span className="app-report-preview-chart-legend__value">{point.displayValue}</span>
        </li>
      ))}
    </ul>
  );
}

function PreviewChartTooltip({
  active,
  payload,
  metricLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload?: PreviewChartSeries["points"][number] }>;
  metricLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="app-report-preview-chart-tooltip">
      <div className="app-report-preview-chart-tooltip__metric">{metricLabel}</div>
      <div className="app-report-preview-chart-tooltip__row">
        <span className="app-report-preview-chart-tooltip__label" style={{ color: point.color }}>
          {point.label}
        </span>
        <span className="app-report-preview-chart-tooltip__value">{point.displayValue}</span>
      </div>
    </div>
  );
}

function PieSliceLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  fill,
  label,
  displayValue,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  fill?: string;
  label?: string;
  displayValue?: string;
}) {
  if (!label || !displayValue) return null;

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const anchor = x > cx ? "start" : "end";

  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="central"
      className="app-report-preview-pie-label"
    >
      <tspan x={x} dy="-0.4em" fill={fill} fontWeight={700}>
        {label}:
      </tspan>
      <tspan x={x} dy="1.35em" fill={reportChartTheme.text} fontWeight={600}>
        {displayValue}
      </tspan>
    </text>
  );
}

function PieLabelLine(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  stroke?: string;
}) {
  const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, stroke = reportChartTheme.mutedLight } =
    props;
  const RADIAN = Math.PI / 180;
  const startRadius = outerRadius + 4;
  const endRadius = outerRadius + 22;
  const x1 = cx + startRadius * Math.cos(-midAngle * RADIAN);
  const y1 = cy + startRadius * Math.sin(-midAngle * RADIAN);
  const x2 = cx + endRadius * Math.cos(-midAngle * RADIAN);
  const y2 = cy + endRadius * Math.sin(-midAngle * RADIAN);

  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={1} />;
}

function ReportPreviewBarChart({ series }: { series: PreviewChartSeries }) {
  const metricLabel = series.valueColumn.label.replace(/\([^)]*\)/g, "").trim();
  const yAxisLabel = getPreviewChartAxisLabel(series);
  const config = buildChartConfig(series);

  return (
    <section className="app-report-preview-chart-block" aria-labelledby="preview-bar-chart-title">
      <h4 id="preview-bar-chart-title" className="app-report-preview-chart-block__title">
        Bar chart by {series.labelColumn.label}
      </h4>
      <div className="app-report-preview-chart-block__canvas">
        <ChartContainer config={config} className="app-report-preview-bar-chart">
          <BarChart
            data={series.points}
            margin={{ top: 32, right: 16, left: 4, bottom: 12 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={reportChartTheme.grid} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: reportChartTheme.border }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={76}
              tick={{ fill: reportChartTheme.muted, fontSize: 11 }}
              label={{
                value: series.labelColumn.label,
                position: "insideBottom",
                offset: -2,
                fill: reportChartTheme.muted,
                fontSize: 11,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fill: reportChartTheme.mutedLight, fontSize: 11 }}
              tickFormatter={(value) => formatAxisValue(Number(value), series.unit)}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                offset: 14,
                fill: reportChartTheme.muted,
                fontSize: 11,
              }}
            />
            <ChartTooltip
              content={<PreviewChartTooltip metricLabel={metricLabel} />}
              cursor={{ fill: "rgba(242, 244, 247, 0.55)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={52}>
              {series.points.map((point) => (
                <Cell key={point.label} fill={point.color} />
              ))}
              <LabelList
                dataKey="displayValue"
                position="top"
                className="app-report-preview-bar-chart__label"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      <PreviewChartLegend points={series.points} />
    </section>
  );
}

function ReportPreviewPieChart({ series }: { series: PreviewChartSeries }) {
  const metricLabel = series.valueColumn.label.replace(/\([^)]*\)/g, "").trim();
  const config = buildChartConfig(series);

  return (
    <section className="app-report-preview-chart-block" aria-labelledby="preview-pie-chart-title">
      <h4 id="preview-pie-chart-title" className="app-report-preview-chart-block__title">
        Pie chart by {series.labelColumn.label}
      </h4>
      <div className="app-report-preview-chart-block__canvas app-report-preview-chart-block__canvas--pie">
        <ChartContainer config={config} className="app-report-preview-pie-chart">
          <PieChart margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
            <ChartTooltip content={<PreviewChartTooltip metricLabel={metricLabel} />} />
            <Pie
              data={series.points}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={104}
              paddingAngle={1.5}
              stroke="#ffffff"
              strokeWidth={2}
              labelLine={(props) => (
                <PieLabelLine
                  cx={props.cx}
                  cy={props.cy}
                  midAngle={props.midAngle}
                  outerRadius={props.outerRadius}
                  stroke={props.stroke ?? props.payload?.fill}
                />
              )}
              label={(props) => {
                const point = props.payload as PreviewChartSeries["points"][number] | undefined;
                return (
                  <PieSliceLabel
                    cx={props.cx}
                    cy={props.cy}
                    midAngle={props.midAngle}
                    outerRadius={props.outerRadius}
                    fill={point?.color ?? props.fill}
                    label={point?.label}
                    displayValue={point?.displayValue}
                  />
                );
              }}
            >
              {series.points.map((point) => (
                <Cell key={point.label} fill={point.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <PreviewChartLegend points={series.points} />
    </section>
  );
}

export function ReportPreviewCharts({ columns, rows }: ReportPreviewChartsProps) {
  const series = buildPreviewChartSeries(columns, rows);

  if (!series) {
    return (
      <div className="app-report-preview-charts__empty">
        <p>Charts are unavailable for this preview.</p>
        <span>
          Generate a report with at least one category column and one numeric column to see charts.
        </span>
      </div>
    );
  }

  return (
    <div className="app-report-preview-charts">
      <ReportPreviewBarChart series={series} />
      <ReportPreviewPieChart series={series} />
    </div>
  );
}
