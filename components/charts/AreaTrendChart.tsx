"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function AreaTrendChart({
  data,
  color = "#6366f1",
  name = "Value",
  valueFormatter = (v: number) => currencyFormatter.format(v),
}: {
  data: { label: string; value: number }[];
  color?: string;
  name?: string;
  valueFormatter?: (v: number) => string;
}) {
  const gradientId = `areaFill-${name.replace(/\s+/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" vertical={false} />
        <XAxis
          dataKey="label"
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
          tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
          width={48}
          domain={["auto", "auto"]}
        />
        <Tooltip content={<ChartTooltip formatter={(v) => valueFormatter(Number(v))} />} />
        <Area type="monotone" dataKey="value" name={name} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
