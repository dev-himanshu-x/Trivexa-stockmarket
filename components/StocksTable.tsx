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
import type { Stock } from "@/lib/types";
import { ALL_EXCHANGES, ALL_SECTORS } from "@/lib/mock-data";
import ChangeBadge from "./ChangeBadge";

type SortKey = "symbol" | "name" | "sector" | "price" | "changePercent" | "volume" | "marketCap";
type SortDir = "asc" | "desc";
type MovementFilter = "All" | "Gainers" | "Losers";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const compactFormatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />;
  return dir === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-200" />
  );
}

export default function StocksTable({
  data,
  search,
  onSearchChange,
}: {
  data: Stock[];
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const [sectorFilter, setSectorFilter] = useState("All");
  const [exchangeFilter, setExchangeFilter] = useState("All");
  const [movementFilter, setMovementFilter] = useState<MovementFilter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // go back to page 1 whenever the search changes (including from the topbar)
  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setPage(1);
  }

  const hasActiveFilters =
    search.trim() !== "" || sectorFilter !== "All" || exchangeFilter !== "All" || movementFilter !== "All";

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
    onSearchChange("");
    setSectorFilter("All");
    setExchangeFilter("All");
    setMovementFilter("All");
    resetToFirstPage();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((s) => {
      if (sectorFilter !== "All" && s.sector !== sectorFilter) return false;
      if (exchangeFilter !== "All" && s.exchange !== exchangeFilter) return false;
      if (movementFilter === "Gainers" && s.changePercent <= 0.05) return false;
      if (movementFilter === "Losers" && s.changePercent >= -0.05) return false;
      if (!q) return true;
      return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    });
  }, [data, search, sectorFilter, exchangeFilter, movementFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "price":
        case "changePercent":
        case "volume":
        case "marketCap":
          cmp = a[sortKey] - b[sortKey];
          break;
        default:
          cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      }
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
    { key: "symbol", label: "Symbol" },
    { key: "sector", label: "Sector", className: "hidden xl:table-cell" },
    { key: "price", label: "Price", className: "text-right" },
    { key: "changePercent", label: "Change", className: "text-right" },
    { key: "volume", label: "Volume", className: "hidden text-right md:table-cell" },
    { key: "marketCap", label: "Market Cap", className: "text-right" },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ticker or company…"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={movementFilter}
            onChange={(e) => {
              setMovementFilter(e.target.value as MovementFilter);
              resetToFirstPage();
            }}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="All">All movement</option>
            <option value="Gainers">Gainers</option>
            <option value="Losers">Losers</option>
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

          <select
            value={exchangeFilter}
            onChange={(e) => {
              setExchangeFilter(e.target.value);
              resetToFirstPage();
            }}
            className="hidden rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none sm:block dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="All">All exchanges</option>
            {ALL_EXCHANGES.map((e) => (
              <option key={e} value={e}>
                {e}
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

      {/* Table */}
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
            {pageRows.map((s) => (
              <tr key={s.symbol} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 font-mono text-[10px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                      {s.symbol.slice(0, 4)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-50">{s.symbol}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{s.name}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-zinc-600 xl:table-cell dark:text-zinc-400">
                  <div>{s.sector}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500">{s.exchange}</div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-50">
                  {currencyFormatter.format(s.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <ChangeBadge changePercent={s.changePercent} />
                </td>
                <td className="hidden px-4 py-3 text-right text-zinc-600 md:table-cell dark:text-zinc-400">
                  {compactFormatter.format(s.volume)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-zinc-900 dark:text-zinc-50">
                  ${compactFormatter.format(s.marketCap)}
                </td>
              </tr>
            ))}

            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No stocks match your search and filters.
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

      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{total === 0 ? 0 : startIdx + 1}</span>
            {"–"}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{endIdx}</span> of{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{total}</span> stocks
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
