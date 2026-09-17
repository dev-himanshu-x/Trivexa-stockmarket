type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

export function ChartTooltip({
  active,
  label,
  payload,
  formatter,
}: {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
  formatter?: (value: number | string, name: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      {label && <p className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">{label}</p>}
      <div className="space-y-0.5">
        {payload.map((item, idx) => {
          const name = item.name ?? String(item.dataKey ?? "");
          const value = item.value ?? 0;
          return (
            <div key={idx} className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{name}:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatter ? formatter(value, name) : value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
