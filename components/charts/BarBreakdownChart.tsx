"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#f43f5e", "#8b5cf6", "#14b8a6"];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const defaultFormatter = (v: number) => currencyFormatter.format(v);

export default function BarBreakdownChart({
  data,
  layout = "vertical",
  valueLabel = "Revenue",
  valueFormatter = defaultFormatter,
  tickFormatter = (v: number) => `$${Math.round(v / 1000)}k`,
  barColor,
}: {
  data: { name: string; value: number }[];
  layout?: "vertical" | "horizontal";
  valueLabel?: string;
  valueFormatter?: (v: number) => string;
  tickFormatter?: (v: number) => string;
  barColor?: string;
}) {
  const isHorizontalBars = layout === "vertical"; // recharts calls bar-orientation "vertical" when bars run horizontally
  const chartHeight = isHorizontalBars ? Math.max(220, data.length * 34) : 260;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout={isHorizontalBars ? "vertical" : "horizontal"}
        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        barCategoryGap={isHorizontalBars ? 10 : undefined}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-zinc-100 dark:text-zinc-800"
          horizontal={!isHorizontalBars}
          vertical={isHorizontalBars}
        />
        {isHorizontalBars ? (
          <>
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-zinc-400 dark:text-zinc-500"
              tickFormatter={tickFormatter}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={110}
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-zinc-500 dark:text-zinc-400"
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-zinc-400 dark:text-zinc-500"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "currentColor" }}
              className="text-zinc-400 dark:text-zinc-500"
              tickFormatter={tickFormatter}
              width={44}
            />
          </>
        )}
        <Tooltip
          cursor={{ fill: "currentColor", className: "text-zinc-100 dark:text-zinc-900", opacity: 0.5 }}
          content={<ChartTooltip formatter={(v) => valueFormatter(Number(v))} />}
        />
        <Bar dataKey="value" name={valueLabel} radius={isHorizontalBars ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={28}>
          {data.map((entry, idx) => (
            <Cell key={entry.name} fill={barColor ?? PALETTE[idx % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
