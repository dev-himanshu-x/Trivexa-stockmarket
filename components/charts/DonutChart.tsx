"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

export default function DonutChart({
  data,
  colors,
  centerLabel,
  centerValue,
}: {
  data: { name: string; value: number }[];
  colors: Record<string, string>;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={88}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={colors[entry.name] ?? "#a1a1aa"} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip formatter={(v) => `${v} (${((Number(v) / total) * 100).toFixed(0)}%)`} />} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{centerValue}</span>
          {centerLabel && <span className="text-xs text-zinc-500 dark:text-zinc-400">{centerLabel}</span>}
        </div>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[d.name] ?? "#a1a1aa" }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}
