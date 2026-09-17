"use client";

import {
  LayoutDashboard,
  LineChart,
  Wallet,
  BarChart3,
  Newspaper,
  Bell,
  FileBarChart,
  Settings,
  CandlestickChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { View } from "./DashboardShell";

const NAV_ITEMS: { label: string; icon: LucideIcon; view?: View }[] = [
  { label: "Overview", icon: LayoutDashboard, view: "overview" },
  { label: "Watchlist", icon: LineChart, view: "watchlist" },
  { label: "Portfolio", icon: Wallet, view: "portfolio" },
  { label: "Analytics", icon: BarChart3, view: "analytics" },
  { label: "News", icon: Newspaper },
  { label: "Alerts", icon: Bell },
  { label: "Reports", icon: FileBarChart },
  { label: "Settings", icon: Settings },
];

export default function Sidebar({
  active,
  onNavigate,
}: {
  active: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 items-center gap-2 border-b border-zinc-200 px-6 dark:border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
          <CandlestickChart className="h-4.5 w-4.5" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Trivexa Markets
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ label, icon: Icon, view }) => {
          const isActive = view != null && active === view;
          return (
            <button
              key={label}
              type="button"
              disabled={!view}
              onClick={() => view && onNavigate(view)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : view
                    ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                    : "cursor-not-allowed text-zinc-300 dark:text-zinc-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {!view && (
                <span className="ml-auto rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
            KS
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Kartik Sanghi
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              Trader
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
