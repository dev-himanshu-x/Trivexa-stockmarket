import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  delta: number;
  deltaLabel?: string;
  icon: LucideIcon;
  accent: string;
};

export default function StatCard({ label, value, delta, deltaLabel = "vs last month", icon: Icon, accent }: StatCardProps) {
  const isPositive = delta >= 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium">
        <span
          className={`flex items-center gap-0.5 ${
            isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(delta).toFixed(1)}%
        </span>
        <span className="text-zinc-400 dark:text-zinc-500">{deltaLabel}</span>
      </div>
    </div>
  );
}
