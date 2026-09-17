export type Stock = {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  price: number;
  changePercent: number;
  changeAbsolute: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  peRatio: number;
};

export type Movement = "Gainer" | "Loser" | "Flat";

export type Holding = {
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  avgCost: number;
  price: number;
  changePercent: number;
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  purchaseDate: string;
};
