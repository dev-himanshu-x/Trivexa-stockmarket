"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BellOff,
  TrendingDown,
  TrendingUp,
  Volume2,
} from "lucide-react";
import type { Stock } from "@/lib/types";
import { buildNotifications, relativeTime, type NotificationKind } from "@/lib/notifications";

const KIND_STYLES: Record<NotificationKind, { icon: typeof TrendingUp; accent: string }> = {
  surge: { icon: TrendingUp, accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
  drop: { icon: TrendingDown, accent: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
  high: { icon: ArrowUpRight, accent: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" },
  low: { icon: ArrowDownRight, accent: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  volume: { icon: Volume2, accent: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" },
};

export default function NotificationsMenu({
  stocks,
  onSelectStock,
}: {
  stocks: Stock[];
  onSelectStock: (symbol: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const notifications = useMemo(() => buildNotifications(stocks), [stocks]);
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }

  function handleSelect(id: string, symbol: string) {
    setReadIds((prev) => new Set(prev).add(id));
    setOpen(false);
    onSelectStock(symbol);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white dark:ring-zinc-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg sm:w-96 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Notifications</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-zinc-500 dark:text-zinc-400">
              <BellOff className="h-6 w-6" />
              <p className="text-sm">No alerts right now.</p>
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-900">
              {notifications.map((notification) => {
                const { icon: Icon, accent } = KIND_STYLES[notification.kind];
                const isUnread = !readIds.has(notification.id);

                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(notification.id, notification.symbol)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/60 ${
                        isUnread ? "bg-indigo-50/40 dark:bg-indigo-500/5" : ""
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {notification.title}
                          </span>
                          {isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />}
                        </span>
                        <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                          {notification.detail}
                        </span>
                        <span className="mt-1 block text-[11px] text-zinc-400 dark:text-zinc-500">
                          {notification.name} · {relativeTime(notification.minutesAgo)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
