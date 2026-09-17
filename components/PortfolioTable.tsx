"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import type { Holding } from "@/lib/types";
import { ALL_SECTORS } from "@/lib/mock-data";

type SortKey = "symbol" | "quantity" | "marketValue" | "gainLoss" | "gainLossPercent";
type SortDir = "asc" | "desc";
type PLFilter = "All" | "Profit" | "Loss";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />;
  return dir === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200" />
  );
}

export default function PortfolioTable({ data }: { data: Holding[] }) {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [plFilter, setPlFilter] = useState<PLFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("marketValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const hasActiveFilters = search.trim() !== "" || sectorFilter !== "All" || plFilter !== "All";

  function resetToFirstPage() {
    setPage(1);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function clearFilters() {
    setSearch("");
    setSectorFilter("All");
    setPlFilter("All");
    resetToFirstPage();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((h) => {
      if (sectorFilter !== "All" && h.sector !== sectorFilter) return false;
      if (plFilter === "Profit" && h.gainLoss <= 0) return false;
      if (plFilter === "Loss" && h.gainLoss > 0) return false;
      if (!q) return true;
      return h.symbol.toLowerCase().includes(q) || h.name.toLowerCase().includes(q);
    });
  }, [data, search, sectorFilter, plFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const cmp = sortKey === "symbol" ? a.symbol.localeCompare(b.symbol) : a[sortKey] - b[sortKey];
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const startIdx = total === 0 ? 0 : (safePage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageRows = sorted.slice(startIdx, endIdx);

  const columns: { key: SortKey; label: string; className?: string }[] = [
    { key: "symbol", label: "Holding" },
    { key: "quantity", label: "Qty", className: "text-right" },
    { key: "marketValue", label: "Market Value", className: "text-right" },
    { key: "gainLoss", label: "Gain / Loss", className: "hidden text-right md:table-cell" },
    { key: "gainLossPercent", label: "Return", className: "text-right" },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
            placeholder="Search holdings…"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={plFilter}
            onChange={(e) => {
              setPlFilter(e.target.value as PLFilter);
              resetToFirstPage();
            }}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="All">All positions</option>
            <option value="Profit">In profit</option>
            <option value="Loss">At a loss</option>
          </select>

          <select
            value={sectorFilter}
            onChange={(e) => {
              setSectorFilter(e.target.value);
              resetToFirstPage();
            }}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="All">All sectors</option>
            {ALL_SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              {columns.map((col) => (
                <th key={col.key} scope="col" className={`px-4 py-3 font-medium ${col.className ?? ""}`}>
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className={`flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-200 ${
                      col.className?.includes("text-right") ? "ml-auto" : ""
                    }`}
                  >
                    {col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {pageRows.map((h) => {
              const isProfit = h.gainLoss >= 0;
              return (
                <tr key={h.symbol} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                  <td className="px-4 py-3">
                    <p className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-50">{h.symbol}</p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{h.name}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      Bought {dateFormatter.format(new Date(h.purchaseDate))}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">{h.quantity}</td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-50">
                    {currencyFormatter.format(h.marketValue)}
                  </td>
                  <td
                    className={`hidden px-4 py-3 text-right font-medium md:table-cell ${
                      isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isProfit ? "+" : ""}
                    {currencyFormatter.format(h.gainLoss)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isProfit ? "+" : ""}
                    {h.gainLossPercent.toFixed(2)}%
                  </td>
                </tr>
              );
            })}

            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No holdings match your search and filters.
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-1 font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{total === 0 ? 0 : startIdx + 1}</span>
            {"–"}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{endIdx}</span> of{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{total}</span> holdings
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              resetToFirstPage();
            }}
            className="ml-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={safePage === 1}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-sm text-zinc-600 dark:text-zinc-400">
            Page <span className="font-medium text-zinc-900 dark:text-zinc-100">{safePage}</span> of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={safePage === pageCount}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage(pageCount)}
            disabled={safePage === pageCount}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
