import type { Stock } from "@/lib/types";
import ChangeBadge from "./ChangeBadge";
import ChartCard from "./charts/ChartCard";

export default function TopMovers({ data }: { data: Stock[] }) {
  const gainers = [...data].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);

  return (
    <ChartCard title="Top Gainers" subtitle="Best performers today">
      <div className="space-y-3">
        {gainers.map((s) => (
          <div key={s.symbol} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 font-mono text-[10px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                {s.symbol.slice(0, 4)}
              </div>
              <div className="min-w-0">
                <p className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-50">{s.symbol}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{s.name}</p>
              </div>
            </div>
            <ChangeBadge changePercent={s.changePercent} />
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
