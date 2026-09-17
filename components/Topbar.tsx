"use client";

import type { Stock } from "@/lib/types";
import type { View } from "./DashboardShell";
import NotificationsMenu from "./NotificationsMenu";
import StockSearch from "./StockSearch";
import ThemeToggle from "./ThemeToggle";

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "watchlist", label: "Watchlist" },
  { value: "portfolio", label: "Portfolio" },
  { value: "analytics", label: "Analytics" },
];

export default function Topbar({
  title,
  subtitle,
  active,
  onNavigate,
  stocks,
  onSelectStock,
}: {
  title: string;
  subtitle: string;
  active: View;
  onNavigate: (view: View) => void;
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/80">
      <select
        value={active}
        onChange={(e) => onNavigate(e.target.value as View)}
        className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-sm font-medium text-zinc-700 focus:border-zinc-400 focus:outline-none lg:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
      >
        {VIEW_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
        <p className="hidden text-xs text-zinc-500 sm:block dark:text-zinc-400">{subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <StockSearch stocks={stocks} onSelect={onSelectStock} />
        <ThemeToggle />
        <NotificationsMenu stocks={stocks} onSelectStock={onSelectStock} />
      </div>
    </header>
  );
}
