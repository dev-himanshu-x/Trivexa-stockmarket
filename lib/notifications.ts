import type { Stock } from "./types";

export type NotificationKind = "surge" | "drop" | "high" | "low" | "volume";

export type Notification = {
  id: string;
  kind: NotificationKind;
  symbol: string;
  name: string;
  title: string;
  detail: string;
  // minutes ago instead of a real timestamp, otherwise server/client render at
  // slightly different times and React complains about a mismatch
  minutesAgo: number;
};

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

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function relativeTime(minutesAgo: number): string {
  if (minutesAgo < 1) return "just now";
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// builds the notification list straight from the stock data, so it never
// goes out of sync with what's actually shown in the tables/charts
export function buildNotifications(stocks: Stock[], seed = 23): Notification[] {
  const byChange = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const byVolume = [...stocks].sort((a, b) => b.volume - a.volume);
  // how close each stock is to its 52-week high/low (0 = right at it)
  const nearHigh = [...stocks].sort(
    (a, b) => (a.high52w - a.price) / a.high52w - (b.high52w - b.price) / b.high52w
  );
  const nearLow = [...stocks].sort(
    (a, b) => (a.price - a.low52w) / a.low52w - (b.price - b.low52w) / b.low52w
  );

  const drafts: Omit<Notification, "id" | "minutesAgo">[] = [];
  // only one alert per stock so we don't spam duplicates
  const claimed = new Set<string>();
  const claim = (symbol: string) => {
    if (claimed.has(symbol)) return false;
    claimed.add(symbol);
    return true;
  };

  for (const stock of byChange.slice(0, 2)) {
    if (stock.changePercent <= 0 || !claim(stock.symbol)) continue;
    drafts.push({
      kind: "surge",
      symbol: stock.symbol,
      name: stock.name,
      title: `${stock.symbol} is surging`,
      detail: `Up ${stock.changePercent.toFixed(2)}% to ${currency.format(stock.price)} today.`,
    });
  }

  for (const stock of byChange.slice(-2).reverse()) {
    if (stock.changePercent >= 0 || !claim(stock.symbol)) continue;
    drafts.push({
      kind: "drop",
      symbol: stock.symbol,
      name: stock.name,
      title: `${stock.symbol} is sliding`,
      detail: `Down ${Math.abs(stock.changePercent).toFixed(2)}% to ${currency.format(stock.price)} today.`,
    });
  }

  for (const stock of nearHigh.slice(0, 3)) {
    if (!claim(stock.symbol)) continue;
    const gap = ((stock.high52w - stock.price) / stock.high52w) * 100;
    drafts.push({
      kind: "high",
      symbol: stock.symbol,
      name: stock.name,
      title: `${stock.symbol} near 52-week high`,
      detail: `${currency.format(stock.price)}, within ${gap.toFixed(1)}% of ${currency.format(stock.high52w)}.`,
    });
  }

  for (const stock of nearLow.slice(0, 1)) {
    if (!claim(stock.symbol)) continue;
    const gap = ((stock.price - stock.low52w) / stock.low52w) * 100;
    drafts.push({
      kind: "low",
      symbol: stock.symbol,
      name: stock.name,
      title: `${stock.symbol} near 52-week low`,
      detail: `${currency.format(stock.price)}, ${gap.toFixed(1)}% above ${currency.format(stock.low52w)}.`,
    });
  }

  byVolume.slice(0, 2).forEach((stock, rank) => {
    if (!claim(stock.symbol)) return;
    drafts.push({
      kind: "volume",
      symbol: stock.symbol,
      name: stock.name,
      title: `${stock.symbol} volume spike`,
      detail: `${compact.format(stock.volume)} shares traded, ${
        rank === 0 ? "leading the market today" : "among the day's heaviest volume"
      }.`,
    });
  });

  const rand = mulberry32(seed);
  return drafts
    .map((draft, index) => ({
      ...draft,
      id: `${draft.kind}-${draft.symbol}-${index}`,
      minutesAgo: Math.floor(rand() * 240),
    }))
    .sort((a, b) => a.minutesAgo - b.minutesAgo);
}
