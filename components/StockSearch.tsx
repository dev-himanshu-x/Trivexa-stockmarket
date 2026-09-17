"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Search, X } from "lucide-react";
import type { Stock } from "@/lib/types";
import ChangeBadge from "./ChangeBadge";

const MAX_RESULTS = 8;

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// we don't know if the user is on Mac or Windows until we're in the browser,
// so the server renders nothing for this and the client fills it in after
const noopSubscribe = () => () => {};
const getShortcutLabel = () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K");
const getServerShortcutLabel = () => null;

// lower score = better match, -1 = no match at all.
// matching the ticker symbol counts more than matching the company name,
// and a match at the start counts more than one in the middle
function rank(stock: Stock, query: string): number {
  const symbol = stock.symbol.toLowerCase();
  const name = stock.name.toLowerCase();
  if (symbol === query) return 0;
  if (symbol.startsWith(query)) return 1;
  if (name.startsWith(query)) return 2;
  if (symbol.includes(query)) return 3;
  if (name.includes(query)) return 4;
  return -1;
}

// bolds the part of the text that matched the search
function Highlight({ text, query }: { text: string; query: string }) {
  const idx = query ? text.toLowerCase().indexOf(query) : -1;
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-transparent font-semibold text-indigo-600 dark:text-indigo-400">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function StockSearch({
  stocks,
  onSelect,
}: {
  stocks: Stock[];
  onSelect: (symbol: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const shortcutLabel = useSyncExternalStore(noopSubscribe, getShortcutLabel, getServerShortcutLabel);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return stocks
      .map((stock) => ({ stock, score: rank(stock, q) }))
      .filter((r) => r.score !== -1)
      .sort((a, b) => a.score - b.score || b.stock.marketCap - a.stock.marketCap)
      .slice(0, MAX_RESULTS)
      .map((r) => r.stock);
  }, [stocks, query]);

  // keep the highlighted result in range as the list shrinks while typing
  const active = Math.min(activeIndex, Math.max(0, results.length - 1));
  const isOpen = open && query.trim() !== "";

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function select(stock: Stock) {
    onSelect(stock.symbol);
    // clear this search box since the watchlist has its own now
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function clear() {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (query) clear();
      else inputRef.current?.blur();
      return;
    }
    if (!isOpen || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (Math.min(i, results.length - 1) + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (Math.min(i, results.length - 1) - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(results[active]);
    }
  }

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="stock-search-listbox"
        aria-autocomplete="list"
        aria-activedescendant={isOpen && results.length > 0 ? `stock-search-option-${active}` : undefined}
        aria-label="Search ticker or company"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search ticker or company…"
        className="w-56 rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-16 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
      />

      {query ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        shortcutLabel && (
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
            {shortcutLabel}
          </kbd>
        )
      )}

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No stocks match “{query.trim()}”.
            </p>
          ) : (
            <ul id="stock-search-listbox" role="listbox" aria-label="Search results" className="max-h-80 overflow-y-auto py-1">
              {results.map((stock, index) => (
                <li
                  key={stock.symbol}
                  id={`stock-search-option-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(stock)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                    index === active ? "bg-zinc-100 dark:bg-zinc-900" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 font-mono text-[10px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    {stock.symbol.slice(0, 4)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm text-zinc-900 dark:text-zinc-50">
                      <Highlight text={stock.symbol} query={query.trim().toLowerCase()} />
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      <Highlight text={stock.name} query={query.trim().toLowerCase()} />
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {currencyFormatter.format(stock.price)}
                    </p>
                    <ChangeBadge changePercent={stock.changePercent} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
