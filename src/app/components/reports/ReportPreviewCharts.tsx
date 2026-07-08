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
import { UI_FONT_FAMILY } from "../../tokens/typography";
import { reportFont } from "./reportUiStyles";
import { ChartContainer, ChartTooltip, type ChartConfig } from "../ui/chart";

/** Matches every other report screen — inline font on all text nodes. */
const textFont = { fontFamily: reportFont } as const;

type TickProps = {
  x?: number;
  y?: number;
  payload?: { value?: string | number };
  textAnchor?: "inherit" | "end" | "middle" | "start";
  fill?: string;
};

function ChartAxisTick({
  x = 0,
  y = 0,
  payload,
  textAnchor = "middle",
  fill = reportChartTheme.muted,
}: TickProps) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill={fill}
      fontSize={11}
      fontFamily={UI_FONT_FAMILY}
    >
      {payload?.value}
    </text>
  );
}

type ReportPreviewChartsProps = {
  columns: PreviewColumn[];
  rows: PreviewRow[];
};

function buildChartConfig(series: PreviewChartSeries): ChartConfig {
  return Object.fromEntries(
    series.points.map((point) => [point.label, { label: point.label, color: point.color }]),
  );
}

function PreviewChartLegend({
  points,
  layout = "grid",
  showPercent = false,
}: {
  points: PreviewChartPoint[];
  layout?: "grid" | "list";
  showPercent?: boolean;
}) {
  const total = points.reduce((sum, point) => sum + point.value, 0);

  return (
    <ul
      className={`app-report-preview-chart-legend${
        layout === "list" ? " app-report-preview-chart-legend--list" : ""
      }`}
      aria-label="Chart legend"
      style={textFont}
    >
      {points.map((point) => {
        const pct = total > 0 ? Math.round((point.value / total) * 100) : 0;
        return (
          <li
            key={point.label}
            className={`app-report-preview-chart-legend__item${
              layout === "list" ? " app-report-preview-chart-legend__item--row" : ""
            }`}
            style={textFont}
          >
            <span
              className="app-report-preview-chart-legend__swatch"
              style={{ backgroundColor: point.color }}
              aria-hidden
            />
            <span className="app-report-preview-chart-legend__label" style={textFont}>
              {point.label}
            </span>
            <span className="app-report-preview-chart-legend__value" style={textFont}>
              {point.displayValue}
            </span>
            {showPercent && (
              <span className="app-report-preview-chart-legend__pct" style={textFont}>
                {pct}%
              </span>
            )}
          </li>
        );
      })}
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
    <div className="app-report-preview-chart-tooltip" style={textFont}>
      <div className="app-report-preview-chart-tooltip__metric" style={textFont}>
        {metricLabel}
      </div>
      <div className="app-report-preview-chart-tooltip__row">
        <span
          className="app-report-preview-chart-tooltip__label"
          style={{ ...textFont, color: point.color }}
        >
          {point.label}
        </span>
        <span className="app-report-preview-chart-tooltip__value" style={textFont}>
          {point.displayValue}
        </span>
      </div>
    </div>
  );
}

function ReportPreviewBarChart({ series }: { series: PreviewChartSeries }) {
  const metricLabel = series.valueColumn.label.replace(/\([^)]*\)/g, "").trim();
  const yAxisLabel = getPreviewChartAxisLabel(series);
  const config = buildChartConfig(series);

  return (
    <section
      className="app-report-preview-chart-block"
      aria-labelledby="preview-bar-chart-title"
      style={textFont}
    >
      <h4
        id="preview-bar-chart-title"
        className="app-report-preview-chart-block__title"
        style={textFont}
      >
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
              tick={(props) => (
                <ChartAxisTick {...props} textAnchor="end" fill={reportChartTheme.muted} />
              )}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tick={(props) => (
                <ChartAxisTick
                  {...props}
                  payload={{ value: formatAxisValue(Number(props.payload?.value), series.unit) }}
                  fill={reportChartTheme.mutedLight}
                />
              )}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                offset: 14,
                fill: reportChartTheme.muted,
                fontSize: 11,
                fontFamily: UI_FONT_FAMILY,
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
                fontFamily={UI_FONT_FAMILY}
                fontSize={11}
                fontWeight={600}
                fill={reportChartTheme.text}
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
  const total = series.points.reduce((sum, point) => sum + point.value, 0);
  const totalLabel = total.toLocaleString(undefined, {
    maximumFractionDigits: series.unit === "hrs" || series.unit === "days" ? 2 : 0,
  });

  return (
    <section
      className="app-report-preview-chart-block"
      aria-labelledby="preview-pie-chart-title"
      style={textFont}
    >
      <h4
        id="preview-pie-chart-title"
        className="app-report-preview-chart-block__title"
        style={textFont}
      >
        Pie chart by {series.labelColumn.label}
      </h4>
      <div className="app-report-preview-pie-layout">
        <div className="app-report-preview-pie-chart-wrap">
          <ChartContainer config={config} className="app-report-preview-pie-chart">
            <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <ChartTooltip content={<PreviewChartTooltip metricLabel={metricLabel} />} />
              <Pie
                data={series.points}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={98}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {series.points.map((point) => (
                  <Cell key={point.label} fill={point.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="app-report-preview-pie-center" aria-hidden style={textFont}>
            <span className="app-report-preview-pie-center__value" style={textFont}>
              {totalLabel}
            </span>
            <span className="app-report-preview-pie-center__label" style={textFont}>
              {metricLabel}
            </span>
          </div>
        </div>
        <PreviewChartLegend points={series.points} layout="list" showPercent />
      </div>
    </section>
  );
}

export function ReportPreviewCharts({ columns, rows }: ReportPreviewChartsProps) {
  const series = buildPreviewChartSeries(columns, rows);

  if (!series) {
    return (
      <div className="app-report-preview-charts__empty" style={textFont}>
        <p style={textFont}>Charts are unavailable for this preview.</p>
        <span style={textFont}>
          Generate a report with at least one category column and one numeric column to see charts.
        </span>
      </div>
    );
  }

  return (
    <div className="app-report-preview-charts" style={textFont}>
      <ReportPreviewBarChart series={series} />
      <ReportPreviewPieChart series={series} />
    </div>
  );
}
