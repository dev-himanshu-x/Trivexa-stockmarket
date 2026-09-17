"use client";

import { useMemo, useState } from "react";
import { Landmark, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import type { Stock } from "@/lib/types";
import {
  buildPortfolio,
  marketBreadth,
  portfolioValueTrend,
  sectorAllocation,
  topMovers,
  volumeLeaders,
} from "@/lib/aggregations";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import StatCard from "./StatCard";
import StocksTable from "./StocksTable";
import PortfolioTable from "./PortfolioTable";
import TopMovers from "./TopMovers";
import ChartCard from "./charts/ChartCard";
import AreaTrendChart from "./charts/AreaTrendChart";
import DonutChart from "./charts/DonutChart";
import BarBreakdownChart from "./charts/BarBreakdownChart";

export type View = "overview" | "watchlist" | "portfolio" | "analytics";

const SECTOR_PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#f43f5e", "#8b5cf6", "#14b8a6", "#eab308", "#ec4899", "#84cc16"];

const VIEW_META: Record<View, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Market snapshot and portfolio performance" },
  watchlist: { title: "Watchlist", subtitle: "Search, filter, and track every stock" },
  portfolio: { title: "Portfolio", subtitle: "Your holdings, cost basis, and returns" },
  analytics: { title: "Analytics", subtitle: "Sector allocation, movers, and volume leaders" },
};

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const compact = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export default function DashboardShell({ stocks }: { stocks: Stock[] }) {
  const [view, setView] = useState<View>("overview");
  // kept up here (not inside StocksTable) so picking a stock from the topbar
  // search can jump to the watchlist and filter it right away
  const [watchlistQuery, setWatchlistQuery] = useState("");

  const holdings = useMemo(() => buildPortfolio(stocks), [stocks]);
  const sectorData = useMemo(() => sectorAllocation(stocks), [stocks]);
  const gainersData = useMemo(() => topMovers(stocks, "gainers", 6), [stocks]);
  const losersData = useMemo(() => topMovers(stocks, "losers", 6), [stocks]);
  const volumeData = useMemo(() => volumeLeaders(stocks, 8), [stocks]);
  const breadth = useMemo(() => marketBreadth(stocks), [stocks]);

  const sectorColors = useMemo(() => {
    const map: Record<string, string> = {};
    sectorData.forEach((s, idx) => {
      map[s.name] = SECTOR_PALETTE[idx % SECTOR_PALETTE.length];
    });
    return map;
  }, [sectorData]);

  const totalMarketCap = stocks.reduce((sum, s) => sum + s.marketCap, 0);
  const avgChangePercent = stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length;

  const portfolioValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const portfolioCostBasis = holdings.reduce((sum, h) => sum + h.costBasis, 0);
  const portfolioGainLoss = portfolioValue - portfolioCostBasis;
  const portfolioReturnPercent = (portfolioGainLoss / portfolioCostBasis) * 100;

  const valueTrend = useMemo(() => portfolioValueTrend(portfolioValue), [portfolioValue]);

  const meta = VIEW_META[view];

  function handleSelectStock(symbol: string) {
    setWatchlistQuery(symbol);
    setView("watchlist");
  }

  return (
    <div className="flex h-full">
      <Sidebar active={view} onNavigate={setView} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          active={view}
          onNavigate={setView}
          stocks={stocks}
          onSelectStock={handleSelectStock}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
            {view === "overview" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Total Market Cap"
                    value={`$${compact(totalMarketCap)}`}
                    delta={avgChangePercent}
                    deltaLabel="avg. change today"
                    icon={Landmark}
                    accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                  />
                  <StatCard
                    label="Portfolio Value"
                    value={currency(portfolioValue)}
                    delta={portfolioReturnPercent}
                    deltaLabel="overall return"
                    icon={Wallet}
                    accent="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
                  />
                  <StatCard
                    label="Gainers Today"
                    value={breadth.gainers.toLocaleString()}
                    delta={((breadth.gainers - breadth.losers) / stocks.length) * 100}
                    deltaLabel="market breadth"
                    icon={TrendingUp}
                    accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  />
                  <StatCard
                    label="Losers Today"
                    value={breadth.losers.toLocaleString()}
                    delta={((breadth.losers - breadth.gainers) / stocks.length) * 100}
                    deltaLabel="market breadth"
                    icon={TrendingDown}
                    accent="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <ChartCard title="Portfolio Value Trend" subtitle="Last 12 months" className="lg:col-span-2">
                    <AreaTrendChart data={valueTrend} name="Portfolio Value" />
                  </ChartCard>
                  <ChartCard title="Sector Allocation" subtitle="By market cap">
                    <DonutChart
                      data={sectorData.slice(0, 6)}
                      colors={sectorColors}
                      centerValue={`$${compact(totalMarketCap)}`}
                      centerLabel="tracked"
                    />
                  </ChartCard>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <ChartCard title="Volume Leaders" subtitle="Shares traded today" className="lg:col-span-2">
                    <BarBreakdownChart
                      data={volumeData}
                      valueLabel="Volume"
                      valueFormatter={(v) => compact(v)}
                      tickFormatter={(v) => compact(v)}
                    />
                  </ChartCard>
                  <TopMovers data={stocks} />
                </div>
              </>
            )}

            {view === "watchlist" && (
              <StocksTable data={stocks} search={watchlistQuery} onSearchChange={setWatchlistQuery} />
            )}

            {view === "portfolio" && <PortfolioTable data={holdings} />}

            {view === "analytics" && (
              <>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <ChartCard title="Top Gainers" subtitle="Largest % moves up today">
                    <BarBreakdownChart
                      data={gainersData}
                      valueLabel="Change %"
                      valueFormatter={(v) => `+${v.toFixed(2)}%`}
                      tickFormatter={(v) => `${v}%`}
                      barColor="#10b981"
                    />
                  </ChartCard>
                  <ChartCard title="Top Losers" subtitle="Largest % moves down today">
                    <BarBreakdownChart
                      data={losersData}
                      valueLabel="Change %"
                      valueFormatter={(v) => `${v.toFixed(2)}%`}
                      tickFormatter={(v) => `${v}%`}
                      barColor="#ef4444"
                    />
                  </ChartCard>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <ChartCard title="Sector Mix" subtitle="Share of tracked market cap">
                    <DonutChart data={sectorData} colors={sectorColors} />
                  </ChartCard>
                  <ChartCard title="Volume Leaders" subtitle="Shares traded today">
                    <BarBreakdownChart
                      data={volumeData}
                      valueLabel="Volume"
                      valueFormatter={(v) => compact(v)}
                      tickFormatter={(v) => compact(v)}
                    />
                  </ChartCard>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
