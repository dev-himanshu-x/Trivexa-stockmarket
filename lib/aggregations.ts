import type { Holding, Stock } from "./types";

function mulberry32(seed: number) {
  let s = seed;
  return function rand() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// simple Fisher-Yates shuffle using our seeded random function
// (don't use sort(() => rand() - 0.5) for shuffling, it's not reliable
// and gave different results on the server vs the browser)
function shuffle<T>(arr: T[], rand: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildPortfolio(stocks: Stock[], seed = 99): Holding[] {
  const rand = mulberry32(seed);
  const shuffled = shuffle(stocks, rand);
  const picked = shuffled.slice(0, 28);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return picked
    .map((stock) => {
      const quantity = Math.round(5 + rand() * 495);
      // cost basis is a bit random around the current price, so we get some winners and some losers
      const avgCost = Math.round(stock.price * (0.65 + rand() * 0.6) * 100) / 100;
      const marketValue = Math.round(quantity * stock.price * 100) / 100;
      const costBasis = Math.round(quantity * avgCost * 100) / 100;
      const gainLoss = Math.round((marketValue - costBasis) * 100) / 100;
      const gainLossPercent = Math.round((gainLoss / costBasis) * 10000) / 100;
      const daysAgo = Math.floor(rand() * 700);

      return {
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        quantity,
        avgCost,
        price: stock.price,
        changePercent: stock.changePercent,
        marketValue,
        costBasis,
        gainLoss,
        gainLossPercent,
        purchaseDate: new Date(now - daysAgo * dayMs).toISOString(),
      };
    })
    .sort((a, b) => b.marketValue - a.marketValue);
}

export function portfolioValueTrend(currentValue: number, months = 12, seed = 5) {
  const rand = mulberry32(seed);
  const now = new Date();

  // walk backwards from today's value to fake a 12-month history
  const values: number[] = [currentValue];
  let v = currentValue;
  for (let i = 0; i < months - 1; i++) {
    const monthlyReturn = (rand() - 0.47) * 0.09;
    v = v / (1 + monthlyReturn);
    values.push(Math.max(v, currentValue * 0.35));
  }
  values.reverse();

  return values.map((value, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return { label: MONTH_LABELS[d.getMonth()], value: Math.round(value) };
  });
}

export function sectorAllocation(stocks: Stock[]) {
  const totals = new Map<string, number>();
  for (const s of stocks) totals.set(s.sector, (totals.get(s.sector) ?? 0) + s.marketCap);
  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function topMovers(stocks: Stock[], direction: "gainers" | "losers", n = 6) {
  const sorted = [...stocks].sort((a, b) =>
    direction === "gainers" ? b.changePercent - a.changePercent : a.changePercent - b.changePercent
  );
  return sorted.slice(0, n).map((s) => ({ name: s.symbol, value: s.changePercent }));
}

export function volumeLeaders(stocks: Stock[], n = 8) {
  return [...stocks]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, n)
    .map((s) => ({ name: s.symbol, value: s.volume }));
}

export function marketBreadth(stocks: Stock[]) {
  const gainers = stocks.filter((s) => s.changePercent > 0.05).length;
  const losers = stocks.filter((s) => s.changePercent < -0.05).length;
  const flat = stocks.length - gainers - losers;
  return { gainers, losers, flat };
}
