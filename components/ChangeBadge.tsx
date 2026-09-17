import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function classifyMovement(changePercent: number): "Gainer" | "Loser" | "Flat" {
  if (changePercent > 0.05) return "Gainer";
  if (changePercent < -0.05) return "Loser";
  return "Flat";
}

const STYLES = {
  Gainer: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  Loser: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  Flat: "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-500/20",
};

const ICONS = {
  Gainer: ArrowUpRight,
  Loser: ArrowDownRight,
  Flat: Minus,
};

export default function ChangeBadge({ changePercent }: { changePercent: number }) {
  const movement = classifyMovement(changePercent);
  const Icon = ICONS[movement];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[movement]}`}
    >
      <Icon className="h-3 w-3" />
      {changePercent > 0 ? "+" : ""}
      {changePercent.toFixed(2)}%
    </span>
  );
}
