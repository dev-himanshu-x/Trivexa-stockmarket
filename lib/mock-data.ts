import type { Stock } from "./types";

// seeded random number generator - same seed always gives the same numbers,
// which keeps the fake data consistent every time the page renders
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

// made-up companies and tickers, not real stocks
const SECTOR_COMPANIES: Record<string, [string, string][]> = {
  Technology: [
    ["Nimbus Cloud Systems", "NMBC"],
    ["Vertex Silicon", "VRSI"],
    ["Quantum Loop Networks", "QLPN"],
    ["Pixelforge Studios", "PXFG"],
    ["DataStream Analytics", "DSTA"],
    ["Halcyon Robotics", "HLCY"],
    ["BrightPath AI", "BPAI"],
    ["CoreLattice Semiconductors", "CRLT"],
    ["Fenwick Software", "FNWK"],
    ["Ironclad Cyber Defense", "IRCD"],
  ],
  Healthcare: [
    ["Meridian BioPharma", "MRDB"],
    ["Solace Health Systems", "SLHS"],
    ["Vitalis Genomics", "VTLG"],
    ["Everwell Diagnostics", "EWLD"],
    ["Crescent Oncology", "CRSO"],
    ["Pulseline Medical Devices", "PLMD"],
    ["Aurora Therapeutics", "ARTX"],
    ["Beacon Life Sciences", "BCNL"],
  ],
  Financials: [
    ["Anchor Capital Group", "ANCG"],
    ["Ledgerstone Bank", "LDGS"],
    ["Pinnacle Trust Financial", "PNTF"],
    ["Silverline Insurance", "SLVI"],
    ["Crestview Asset Management", "CRVA"],
    ["Northgate Holdings", "NGTH"],
    ["Meridian Bancorp", "MRBC"],
    ["Cobalt Reinsurance", "CBLR"],
  ],
  Energy: [
    ["Solaris Power Corp", "SLRP"],
    ["Terra Renewable Fuels", "TRNF"],
    ["Cascade Hydro Energy", "CSHE"],
    ["Ridgeline Petroleum", "RDGP"],
    ["BlueFlame Gas & Oil", "BFGO"],
    ["Summit Wind Systems", "SMWD"],
    ["Ember Coal & Minerals", "EMCM"],
  ],
  "Consumer Discretionary": [
    ["Urban Threads Apparel", "URTA"],
    ["Highstreet Retail Group", "HSRG"],
    ["Voyage Hospitality", "VYGH"],
    ["Golden Fork Restaurants", "GFKR"],
    ["Nova Motors", "NVMT"],
    ["Lumen Home Furnishings", "LMHF"],
    ["Trailblazer Outdoor Co", "TRBO"],
  ],
  Industrials: [
    ["Ironclad Fabrication", "IRFB"],
    ["Vantage Aerospace", "VNTA"],
    ["Frontier Freight Lines", "FRFL"],
    ["Titan Construction Group", "TICG"],
    ["Meridian Machine Works", "MRMW"],
    ["Boltwright Manufacturing", "BLWM"],
    ["Steelcore Industries", "STCI"],
  ],
  Utilities: [
    ["Riverbend Water Utilities", "RVWU"],
    ["Brightgrid Electric", "BRGE"],
    ["Cascade Gas & Power", "CGP"],
    ["Northern Lights Utilities", "NLUT"],
    ["Summit Public Power", "SMPP"],
    ["Clearstream Water Co", "CLWC"],
  ],
  "Real Estate": [
    ["Skyline Properties REIT", "SKPR"],
    ["Harborview Realty Trust", "HBVR"],
    ["Meridian Commercial Properties", "MRCP"],
    ["Oakfield Residential REIT", "OKFR"],
    ["Union Square Realty", "UNSR"],
    ["Palisade Industrial REIT", "PLDR"],
  ],
  Materials: [
    ["Granite Peak Mining", "GRPM"],
    ["Cobalt Chemical Corp", "CBCC"],
    ["Sable Steelworks", "SBST"],
    ["Terra Aggregates", "TRAG"],
    ["Northstar Minerals", "NSTM"],
    ["Alloyworks Industries", "ALWI"],
  ],
  "Communication Services": [
    ["Wavelength Telecom", "WVLT"],
    ["Pixelstream Media", "PXSM"],
    ["Nexus Broadcasting", "NXBC"],
    ["Skyline Wireless", "SKWL"],
    ["Beacon Publishing Group", "BCNP"],
    ["Lumina Streaming Co", "LMSC"],
  ],
};

export const ALL_SECTORS = Object.keys(SECTOR_COMPANIES);
export const ALL_EXCHANGES = ["NASDAQ", "NYSE", "LSE", "TSX", "ASX"];

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function generateStocks(seed = 7): Stock[] {
  const rand = mulberry32(seed);
  const stocks: Stock[] = [];

  for (const sector of ALL_SECTORS) {
    for (const [name, symbol] of SECTOR_COMPANIES[sector]) {
      const price = Math.round((5 + rand() * 640) * 100) / 100;
      // averaging two random numbers makes small daily moves more common than big ones
      const changePercent =
        Math.round(((rand() + rand() - 1) * 8) * 100) / 100;
      const changeAbsolute = Math.round(price * (changePercent / 100) * 100) / 100;
      const sharesOutstanding = Math.round(50_000_000 + rand() * 4_950_000_000);
      const marketCap = Math.round(price * sharesOutstanding);
      const volume = Math.round(100_000 + rand() * 49_900_000);
      const high52w = Math.round(price * (1 + rand() * 0.35) * 100) / 100;
      const low52w = Math.round(price * (1 - rand() * 0.35) * 100) / 100;
      const peRatio = Math.round((5 + rand() * 55) * 10) / 10;

      stocks.push({
        symbol,
        name,
        sector,
        exchange: pick(rand, ALL_EXCHANGES),
        price,
        changePercent,
        changeAbsolute,
        volume,
        marketCap,
        high52w: Math.max(high52w, price),
        low52w: Math.min(low52w, price),
        peRatio,
      });
    }
  }

  return stocks.sort((a, b) => b.marketCap - a.marketCap);
}
