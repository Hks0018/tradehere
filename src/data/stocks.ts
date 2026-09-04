import type { MarketCapBucket, StockDetail } from "@/types";
import { generateSeries, seedFromString, seededRandom } from "@/utils/series";

/**
 * DEMO DATA — illustrative figures for a sample market. Not live quotes.
 *
 * A compact seed table is expanded into full `StockDetail` records so the data
 * file stays readable while every UI surface gets a complete, typed object.
 */
interface StockSeed {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  price: number;
  changePercent: number;
  /** Market capitalisation in ₹ crore. */
  marketCapCr: number;
  pe: number;
  divYield: number;
  founded: number;
  hq: string;
  employees: number;
  /** Trailing revenue in ₹ crore for the most recent year in the table. */
  revenueCr: number;
  netMargin: number;
  roe: number;
  debtToEquity: number;
  tags: StockDetail["tags"];
  description: string;
}

const SEED: StockSeed[] = [
  {
    symbol: "RELIND", name: "Reliance Industries", sector: "Energy", industry: "Oil to Chemicals & Retail",
    price: 2938.4, changePercent: 1.24, marketCapCr: 1987400, pe: 27.4, divYield: 0.38,
    founded: 1966, hq: "Mumbai, Maharashtra", employees: 389000, revenueCr: 976500, netMargin: 7.9,
    roe: 9.1, debtToEquity: 0.42, tags: ["popular", "active"],
    description: "A diversified conglomerate spanning refining and petrochemicals, retail, and digital services. Its consumer-facing businesses now contribute a growing share of consolidated operating profit, while the energy segment continues to anchor cash generation.",
  },
  {
    symbol: "TCSIT", name: "Tata Consultancy Services", sector: "Information Technology", industry: "IT Services & Consulting",
    price: 4126.8, changePercent: -0.62, marketCapCr: 1493200, pe: 30.1, divYield: 1.42,
    founded: 1968, hq: "Mumbai, Maharashtra", employees: 607000, revenueCr: 245300, netMargin: 19.2,
    roe: 46.8, debtToEquity: 0.04, tags: ["popular"],
    description: "India's largest IT services exporter, serving banking, retail, life-sciences and manufacturing clients across more than fifty countries. Revenue is weighted toward long-duration managed-services contracts, which lends stability across technology spending cycles.",
  },
  {
    symbol: "HDFCBK", name: "HDFC Bank", sector: "Financial Services", industry: "Private Sector Bank",
    price: 1682.35, changePercent: 0.84, marketCapCr: 1278900, pe: 19.6, divYield: 1.16,
    founded: 1994, hq: "Mumbai, Maharashtra", employees: 213000, revenueCr: 283400, netMargin: 22.6,
    roe: 16.4, debtToEquity: 1.12, tags: ["popular", "active"],
    description: "The country's largest private-sector lender by assets, with a retail-led loan book and a nationwide branch and digital footprint. Asset quality has historically tracked below system averages, and deposit franchise depth remains its central competitive advantage.",
  },
  {
    symbol: "INFOSY", name: "Infosys", sector: "Information Technology", industry: "IT Services & Consulting",
    price: 1854.6, changePercent: 1.92, marketCapCr: 769800, pe: 26.3, divYield: 2.11,
    founded: 1981, hq: "Bengaluru, Karnataka", employees: 317000, revenueCr: 153670, netMargin: 17.4,
    roe: 31.2, debtToEquity: 0.09, tags: ["popular", "trending"],
    description: "A global technology services and consulting firm with a large digital transformation practice. Growth is increasingly driven by cloud migration, data platforms, and AI-enablement mandates from enterprise clients in North America and Europe.",
  },
  {
    symbol: "ICICBK", name: "ICICI Bank", sector: "Financial Services", industry: "Private Sector Bank",
    price: 1247.9, changePercent: 1.38, marketCapCr: 876400, pe: 18.2, divYield: 0.82,
    founded: 1994, hq: "Mumbai, Maharashtra", employees: 141000, revenueCr: 218900, netMargin: 24.1,
    roe: 18.7, debtToEquity: 1.04, tags: ["popular", "trending", "active"],
    description: "A full-service private bank with meaningful subsidiaries in life insurance, general insurance, asset management and securities. Its granular retail deposit base and improving operating leverage have supported consistent return ratios.",
  },
  {
    symbol: "BHRTEL", name: "Bharti Telecom Networks", sector: "Telecommunications", industry: "Telecom Services",
    price: 1489.25, changePercent: 2.14, marketCapCr: 842700, pe: 62.8, divYield: 0.54,
    founded: 1995, hq: "New Delhi, Delhi", employees: 26400, revenueCr: 152100, netMargin: 8.4,
    roe: 12.6, debtToEquity: 2.31, tags: ["trending", "active"],
    description: "A telecommunications operator with mobile, broadband and enterprise connectivity businesses. Average revenue per user has trended upward following tariff repair, while data consumption growth continues to drive network capital expenditure.",
  },
  {
    symbol: "LARTOU", name: "Larsen & Turbo Engineering", sector: "Capital Goods", industry: "Construction & Engineering",
    price: 3612.5, changePercent: -1.08, marketCapCr: 496800, pe: 36.4, divYield: 0.71,
    founded: 1938, hq: "Mumbai, Maharashtra", employees: 57000, revenueCr: 221400, netMargin: 6.8,
    roe: 14.9, debtToEquity: 1.18, tags: ["popular"],
    description: "An engineering and construction major executing infrastructure, energy and heavy-industry projects, complemented by technology-services subsidiaries. Order-book visibility and execution margins are the primary drivers of earnings.",
  },
  {
    symbol: "HINLEV", name: "Hindustan Consumer Products", sector: "FMCG", industry: "Household & Personal Products",
    price: 2478.9, changePercent: -0.34, marketCapCr: 582300, pe: 54.2, divYield: 1.68,
    founded: 1933, hq: "Mumbai, Maharashtra", employees: 21000, revenueCr: 62400, netMargin: 17.1,
    roe: 20.4, debtToEquity: 0.03, tags: ["popular"],
    description: "A fast-moving consumer goods company with leading positions in home care, beauty and wellbeing, and packaged foods. Volume growth is closely tied to rural demand recovery and the trajectory of commodity input costs.",
  },
  {
    symbol: "STBKIN", name: "State Bank of Bharat", sector: "Financial Services", industry: "Public Sector Bank",
    price: 812.45, changePercent: 1.67, marketCapCr: 725100, pe: 11.4, divYield: 1.74,
    founded: 1955, hq: "Mumbai, Maharashtra", employees: 232000, revenueCr: 462800, netMargin: 13.9,
    roe: 17.2, debtToEquity: 1.36, tags: ["active", "trending"],
    description: "The largest public-sector lender by balance sheet, with an extensive branch network and a dominant share of government banking relationships. Credit costs have normalised, lifting profitability from prior-cycle lows.",
  },
  {
    symbol: "ITCFMC", name: "ITC Diversified Holdings", sector: "FMCG", industry: "Tobacco & Diversified FMCG",
    price: 468.2, changePercent: 0.42, marketCapCr: 585400, pe: 26.8, divYield: 3.24,
    founded: 1910, hq: "Kolkata, West Bengal", employees: 24800, revenueCr: 71200, netMargin: 26.4,
    roe: 28.1, debtToEquity: 0.01, tags: ["popular"],
    description: "A diversified group with cigarettes, branded packaged foods, paperboards, agri-business and hotels. Strong free cash generation supports one of the higher dividend payout ratios among large-cap Indian companies.",
  },
  {
    symbol: "AXSBNK", name: "Axis Financial Bank", sector: "Financial Services", industry: "Private Sector Bank",
    price: 1094.7, changePercent: -0.91, marketCapCr: 338200, pe: 13.8, divYield: 0.11,
    founded: 1993, hq: "Mumbai, Maharashtra", employees: 105000, revenueCr: 138600, netMargin: 20.8,
    roe: 16.9, debtToEquity: 1.09, tags: ["active"],
    description: "A private lender rebuilding its retail franchise through digital origination and a broader branch footprint. Fee income from cards and third-party distribution is a growing contributor to operating revenue.",
  },
  {
    symbol: "MARUTO", name: "Maruti Motors", sector: "Automobile", industry: "Passenger Vehicles",
    price: 12184.0, changePercent: 2.46, marketCapCr: 383900, pe: 27.9, divYield: 0.98,
    founded: 1981, hq: "New Delhi, Delhi", employees: 18400, revenueCr: 141800, netMargin: 9.6,
    roe: 16.8, debtToEquity: 0.02, tags: ["trending", "popular"],
    description: "The largest passenger-vehicle manufacturer by domestic volume, with a portfolio spanning entry hatchbacks to premium sport-utility vehicles. Product mix shift toward utility vehicles has been the principal margin lever.",
  },
  {
    symbol: "SUNPHR", name: "Sun Pharmaceutical Labs", sector: "Healthcare", industry: "Pharmaceuticals",
    price: 1789.35, changePercent: 0.76, marketCapCr: 429300, pe: 34.6, divYield: 0.74,
    founded: 1983, hq: "Mumbai, Maharashtra", employees: 41000, revenueCr: 52400, netMargin: 18.9,
    roe: 16.2, debtToEquity: 0.06, tags: ["popular"],
    description: "A pharmaceutical company with a global generics base and a growing specialty portfolio in dermatology, ophthalmology and oncology. Specialty products carry higher gross margins and lengthen the earnings runway.",
  },
  {
    symbol: "TATMOT", name: "Tata Mobility", sector: "Automobile", industry: "Commercial & Passenger Vehicles",
    price: 986.55, changePercent: 3.18, marketCapCr: 362700, pe: 21.3, divYield: 0.31,
    founded: 1945, hq: "Mumbai, Maharashtra", employees: 82000, revenueCr: 438600, netMargin: 5.2,
    roe: 14.4, debtToEquity: 1.02, tags: ["trending", "active"],
    description: "An automotive manufacturer with commercial vehicles, domestic passenger vehicles and a luxury international subsidiary. Electric-vehicle share and deleveraging progress are the two most-watched operating metrics.",
  },
  {
    symbol: "ASNPNT", name: "Asian Coatings", sector: "Consumer Durables", industry: "Paints & Coatings",
    price: 2864.4, changePercent: -1.42, marketCapCr: 274600, pe: 52.1, divYield: 1.12,
    founded: 1942, hq: "Mumbai, Maharashtra", employees: 8600, revenueCr: 35400, netMargin: 15.4,
    roe: 29.6, debtToEquity: 0.08, tags: ["popular"],
    description: "A decorative paints leader with an expanding home-improvement adjacency and an industrial coatings joint venture. Distribution reach and premiumisation of the product mix underpin its pricing power.",
  },
  {
    symbol: "WIPTEC", name: "Wipro Technologies", sector: "Information Technology", industry: "IT Services & Consulting",
    price: 542.8, changePercent: 0.28, marketCapCr: 283400, pe: 22.4, divYield: 1.88,
    founded: 1945, hq: "Bengaluru, Karnataka", employees: 234000, revenueCr: 89800, netMargin: 12.6,
    roe: 14.8, debtToEquity: 0.21, tags: ["active"],
    description: "A technology services provider organised around industry sector units, with consulting and cloud capability added through acquisitions. Deal wins in Europe have partially offset softer discretionary spending elsewhere.",
  },
  {
    symbol: "BAJFIN", name: "Bajaj Finance Corp", sector: "Financial Services", industry: "Non-Banking Finance",
    price: 7128.9, changePercent: 1.94, marketCapCr: 441200, pe: 29.7, divYield: 0.52,
    founded: 1987, hq: "Pune, Maharashtra", employees: 62000, revenueCr: 68400, netMargin: 24.8,
    roe: 21.4, debtToEquity: 3.62, tags: ["trending", "popular"],
    description: "A diversified non-banking lender in consumer durables finance, personal loans, small-business credit and mortgages. Customer franchise growth and cross-sell density drive its assets under management trajectory.",
  },
  {
    symbol: "TTASTL", name: "Tata Steel Works", sector: "Metals & Mining", industry: "Iron & Steel",
    price: 158.4, changePercent: -2.06, marketCapCr: 197800, pe: 18.6, divYield: 2.24,
    founded: 1907, hq: "Mumbai, Maharashtra", employees: 78000, revenueCr: 229400, netMargin: 4.1,
    roe: 8.9, debtToEquity: 1.24, tags: ["active"],
    description: "An integrated steel producer with captive raw-material access in India and a restructuring European operation. Earnings are cyclical and track spreads between steel realisations and coking-coal costs.",
  },
  {
    symbol: "TITJEW", name: "Titan Lifestyle", sector: "Consumer Durables", industry: "Jewellery & Watches",
    price: 3428.6, changePercent: 1.12, marketCapCr: 304300, pe: 89.4, divYield: 0.33,
    founded: 1984, hq: "Bengaluru, Karnataka", employees: 9200, revenueCr: 51600, netMargin: 7.8,
    roe: 32.4, debtToEquity: 0.34, tags: ["trending"],
    description: "A lifestyle retailer spanning jewellery, watches, eyewear and fragrances. Formalisation of the jewellery market and store-network expansion have supported sustained double-digit revenue growth.",
  },
  {
    symbol: "NESIND", name: "Nestle Foods India", sector: "FMCG", industry: "Packaged Foods",
    price: 2412.7, changePercent: 0.19, marketCapCr: 232600, pe: 68.2, divYield: 1.02,
    founded: 1959, hq: "Gurugram, Haryana", employees: 8600, revenueCr: 19800, netMargin: 16.4,
    roe: 78.4, debtToEquity: 0.12, tags: ["popular"],
    description: "A packaged-foods company with leading brands in instant noodles, beverages, confectionery and infant nutrition. High asset turns and a concentrated brand portfolio produce unusually strong return on equity.",
  },
  {
    symbol: "PWRGRD", name: "Power Grid Networks", sector: "Utilities", industry: "Power Transmission",
    price: 328.95, changePercent: 0.94, marketCapCr: 305800, pe: 17.8, divYield: 3.41,
    founded: 1989, hq: "Gurugram, Haryana", employees: 8900, revenueCr: 46200, netMargin: 32.6,
    roe: 18.9, debtToEquity: 1.48, tags: ["popular"],
    description: "A regulated electricity transmission utility earning largely assured returns on commissioned assets. Cash flows are stable and the payout ratio is high, which makes it a defensive holding within the power sector.",
  },
  {
    symbol: "DIVLAB", name: "Divis Life Sciences", sector: "Healthcare", industry: "Pharmaceutical Ingredients",
    price: 4682.3, changePercent: -0.58, marketCapCr: 124300, pe: 62.4, divYield: 0.68,
    founded: 1990, hq: "Hyderabad, Telangana", employees: 17200, revenueCr: 8940, netMargin: 21.8,
    roe: 14.2, debtToEquity: 0.01, tags: [],
    description: "A manufacturer of active pharmaceutical ingredients and custom-synthesis intermediates for global innovator companies. Capacity additions and contract wins determine the medium-term revenue path.",
  },
  {
    symbol: "ZOMFOOD", name: "Zenith Food Delivery", sector: "Consumer Services", industry: "Online Food Delivery",
    price: 284.65, changePercent: 4.62, marketCapCr: 248900, pe: 148.6, divYield: 0,
    founded: 2008, hq: "Gurugram, Haryana", employees: 4300, revenueCr: 12800, netMargin: 4.2,
    roe: 5.8, debtToEquity: 0.02, tags: ["trending", "active"],
    description: "An online food-delivery and quick-commerce platform operating a hyperlocal logistics network. Contribution margin per order and quick-commerce store expansion are the key operating indicators.",
  },
  {
    symbol: "PLYTEC", name: "Polycab Wires & Cables", sector: "Capital Goods", industry: "Electrical Equipment",
    price: 6284.5, changePercent: 2.86, marketCapCr: 94200, pe: 42.6, divYield: 0.46,
    founded: 1996, hq: "Mumbai, Maharashtra", employees: 5100, revenueCr: 18400, netMargin: 9.4,
    roe: 22.6, debtToEquity: 0.07, tags: ["trending"],
    description: "A wires and cables manufacturer expanding into fast-moving electrical goods. Demand is linked to real-estate completions, infrastructure spending and rural electrification programmes.",
  },
  {
    symbol: "IRCTRL", name: "Indian Rail Catering Corp", sector: "Consumer Services", industry: "Travel & Ticketing",
    price: 812.3, changePercent: -1.84, marketCapCr: 64900, pe: 58.4, divYield: 0.62,
    founded: 1999, hq: "New Delhi, Delhi", employees: 2400, revenueCr: 4380, netMargin: 26.4,
    roe: 41.2, debtToEquity: 0.01, tags: ["active"],
    description: "A rail-adjacent services company operating online ticketing, catering, packaged drinking water and tourism verticals. The ticketing convenience fee is the highest-margin component of the revenue mix.",
  },
  {
    symbol: "HAVELC", name: "Havells Electricals", sector: "Consumer Durables", industry: "Electrical Consumer Goods",
    price: 1684.2, changePercent: 0.64, marketCapCr: 105600, pe: 68.9, divYield: 0.58,
    founded: 1958, hq: "Noida, Uttar Pradesh", employees: 6800, revenueCr: 18900, netMargin: 6.8,
    roe: 18.4, debtToEquity: 0.04, tags: [],
    description: "A consumer electricals company with switchgear, cables, lighting and a large appliances subsidiary. Summer-season demand and commodity pass-through influence quarterly margin variability.",
  },
  {
    symbol: "DMRTRT", name: "Dmart Value Retail", sector: "Consumer Services", industry: "Retail Supermarkets",
    price: 4128.9, changePercent: -0.72, marketCapCr: 268400, pe: 96.4, divYield: 0,
    founded: 2002, hq: "Mumbai, Maharashtra", employees: 14600, revenueCr: 54200, netMargin: 5.1,
    roe: 14.8, debtToEquity: 0.06, tags: ["popular"],
    description: "An everyday-low-price supermarket chain operating owned stores in a cluster-based expansion model. Revenue per square foot and new-store additions are the primary growth levers.",
  },
  {
    symbol: "CHOLFN", name: "Chola Capital Finance", sector: "Financial Services", industry: "Non-Banking Finance",
    price: 1428.7, changePercent: 1.42, marketCapCr: 118400, pe: 28.4, divYield: 0.14,
    founded: 1978, hq: "Chennai, Tamil Nadu", employees: 48000, revenueCr: 21400, netMargin: 18.9,
    roe: 19.8, debtToEquity: 6.14, tags: [],
    description: "A vehicle-finance-led non-banking lender diversifying into loan-against-property and small-business credit. Collection efficiency in the used-vehicle book is the key asset-quality indicator.",
  },
];

function capBucket(marketCapCr: number): MarketCapBucket {
  if (marketCapCr >= 100000) return "Large Cap";
  if (marketCapCr >= 30000) return "Mid Cap";
  return "Small Cap";
}

function buildFinancials(revenueCr: number, netMargin: number, symbol: string) {
  const rand = seededRandom(seedFromString(`fin:${symbol}`));
  const years = ["FY22", "FY23", "FY24", "FY25", "FY26"];
  // Walk backwards from the latest year using plausible historical growth.
  const revenues: number[] = [revenueCr];
  for (let i = 0; i < years.length - 1; i += 1) {
    const growth = 0.06 + rand() * 0.14;
    revenues.unshift(Number((revenues[0] / (1 + growth)).toFixed(0)));
  }
  return years.map((year, index) => {
    const marginDrift = netMargin * (0.82 + (index / (years.length - 1)) * 0.18 + rand() * 0.02);
    const revenue = revenues[index];
    return {
      year,
      revenue,
      profit: Number(((revenue * marginDrift) / 100).toFixed(0)),
      ebitdaMargin: Number((marginDrift * 1.72).toFixed(1)),
    };
  });
}

function buildShareholding(symbol: string) {
  const rand = seededRandom(seedFromString(`hold:${symbol}`));
  const promoter = Number((32 + rand() * 40).toFixed(1));
  const fii = Number((10 + rand() * 22).toFixed(1));
  const dii = Number((8 + rand() * 16).toFixed(1));
  const retail = Number((100 - promoter - fii - dii).toFixed(1));
  return [
    { label: "Promoters", value: promoter },
    { label: "Foreign Institutions", value: fii },
    { label: "Domestic Institutions", value: dii },
    { label: "Retail & Others", value: Math.max(retail, 1) },
  ];
}

function expand(seed: StockSeed): StockDetail {
  const rand = seededRandom(seedFromString(`meta:${seed.symbol}`));
  const change = Number(((seed.price * seed.changePercent) / 100).toFixed(2));
  const eps = Number((seed.price / seed.pe).toFixed(2));
  const financials = buildFinancials(seed.revenueCr, seed.netMargin, seed.symbol);
  const latest = financials[financials.length - 1];
  const previous = financials[financials.length - 2];

  return {
    symbol: seed.symbol,
    name: seed.name,
    exchange: "NSE",
    sector: seed.sector,
    industry: seed.industry,
    price: seed.price,
    change,
    changePercent: seed.changePercent,
    marketCap: seed.marketCapCr * 1e7,
    capBucket: capBucket(seed.marketCapCr),
    volume: Math.round(180000 + rand() * 9200000),
    pe: seed.pe,
    eps,
    high52: Number((seed.price * (1.12 + rand() * 0.28)).toFixed(2)),
    low52: Number((seed.price * (0.58 + rand() * 0.18)).toFixed(2)),
    dividendYield: seed.divYield,
    bookValue: Number((eps * (4 + rand() * 8)).toFixed(2)),
    tags: seed.tags,
    series: generateSeries(`stock:${seed.symbol}`, seed.price, {
      points: 40,
      volatility: 0.014,
      drift: seed.changePercent > 0 ? 0.0011 : -0.0004,
    }),
    description: seed.description,
    founded: seed.founded,
    headquarters: seed.hq,
    employees: seed.employees,
    website: `www.${seed.symbol.toLowerCase()}-demo.example`,
    financials,
    shareholding: buildShareholding(seed.symbol),
    revenueGrowth: Number((((latest.revenue - previous.revenue) / previous.revenue) * 100).toFixed(1)),
    profitGrowth: Number((((latest.profit - previous.profit) / previous.profit) * 100).toFixed(1)),
    roe: seed.roe,
    debtToEquity: seed.debtToEquity,
  };
}

export const STOCKS: StockDetail[] = SEED.map(expand);

export const STOCK_SECTORS = Array.from(new Set(STOCKS.map((s) => s.sector))).sort();
