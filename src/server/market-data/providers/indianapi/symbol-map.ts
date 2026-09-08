/**
 * Tradehere symbol  ->  IndianAPI company search term
 *
 * IndianAPI's `/stock` endpoint takes a free-text company name rather than a
 * ticker ("the name, shortened name, or any search term livemint allows"), so
 * this table maps Tradehere's internal symbols to a name IndianAPI resolves,
 * plus the NSE ticker it reports back — used to map a search result to a
 * Tradehere symbol in the other direction.
 *
 * `verified` means a real request to the live API returned data for that
 * name. Unverified entries are still attempted — if IndianAPI does not
 * recognise one, the provider reports NO_DATA and the orchestrator fails over
 * to the next source. Nothing is fabricated either way.
 */
export interface SymbolMapping {
  /** Tradehere's internal symbol. */
  tradehere: string;
  /** Search term passed to IndianAPI's /stock endpoint. */
  indianApiName: string;
  /** IndianAPI's own NSE ticker, when known — used to map search results back. */
  nseTicker?: string;
  /** Confirmed against the live API rather than assumed. */
  verified: boolean;
}

const MAPPINGS: SymbolMapping[] = [
  // Verified against the live API during integration.
  { tradehere: "RELIND", indianApiName: "Reliance", nseTicker: "RELIANCE", verified: true },
  { tradehere: "TCSIT", indianApiName: "TCS", nseTicker: "TCS", verified: true },

  // Attempted at runtime; unsupported ones fail over cleanly.
  { tradehere: "INFOSY", indianApiName: "Infosys", nseTicker: "INFY", verified: false },
  { tradehere: "HDFCBK", indianApiName: "HDFC Bank", nseTicker: "HDFCBANK", verified: false },
  { tradehere: "ICICBK", indianApiName: "ICICI Bank", nseTicker: "ICICIBANK", verified: false },
  { tradehere: "BHRTEL", indianApiName: "Bharti Airtel", nseTicker: "BHARTIARTL", verified: false },
  { tradehere: "LARTOU", indianApiName: "Larsen & Toubro", nseTicker: "LT", verified: false },
  { tradehere: "HINLEV", indianApiName: "Hindustan Unilever", nseTicker: "HINDUNILVR", verified: false },
  { tradehere: "STBKIN", indianApiName: "State Bank of India", nseTicker: "SBIN", verified: false },
  { tradehere: "ITCFMC", indianApiName: "ITC", nseTicker: "ITC", verified: false },
  { tradehere: "AXSBNK", indianApiName: "Axis Bank", nseTicker: "AXISBANK", verified: false },
  { tradehere: "MARUTO", indianApiName: "Maruti Suzuki", nseTicker: "MARUTI", verified: false },
  { tradehere: "SUNPHR", indianApiName: "Sun Pharma", nseTicker: "SUNPHARMA", verified: false },
  { tradehere: "TATMOT", indianApiName: "Tata Motors", nseTicker: "TATAMOTORS", verified: false },
  { tradehere: "ASNPNT", indianApiName: "Asian Paints", nseTicker: "ASIANPAINT", verified: false },
  { tradehere: "WIPTEC", indianApiName: "Wipro", nseTicker: "WIPRO", verified: false },
  { tradehere: "BAJFIN", indianApiName: "Bajaj Finance", nseTicker: "BAJFINANCE", verified: false },
  { tradehere: "TTASTL", indianApiName: "Tata Steel", nseTicker: "TATASTEEL", verified: false },
  { tradehere: "TITJEW", indianApiName: "Titan Company", nseTicker: "TITAN", verified: false },
  { tradehere: "NESIND", indianApiName: "Nestle India", nseTicker: "NESTLEIND", verified: false },
  { tradehere: "PWRGRD", indianApiName: "Power Grid Corporation", nseTicker: "POWERGRID", verified: false },
  { tradehere: "DIVLAB", indianApiName: "Divi's Laboratories", nseTicker: "DIVISLAB", verified: false },
  { tradehere: "PLYTEC", indianApiName: "Polycab India", nseTicker: "POLYCAB", verified: false },
  { tradehere: "IRCTRL", indianApiName: "IRCTC", nseTicker: "IRCTC", verified: false },
  { tradehere: "HAVELC", indianApiName: "Havells India", nseTicker: "HAVELLS", verified: false },
  { tradehere: "DMRTRT", indianApiName: "Avenue Supermarts", nseTicker: "DMART", verified: false },
  { tradehere: "CHOLFN", indianApiName: "Cholamandalam Investment", nseTicker: "CHOLAFIN", verified: false },
  { tradehere: "ZOMFOOD", indianApiName: "Zomato", nseTicker: "ZOMATO", verified: false },
];

const TO_PROVIDER = new Map(MAPPINGS.map((entry) => [entry.tradehere, entry]));
const TO_TRADEHERE = new Map(
  MAPPINGS.filter((entry) => entry.nseTicker).map((entry) => [entry.nseTicker!.toUpperCase(), entry]),
);

/**
 * Resolves a Tradehere symbol to the company-name search term IndianAPI
 * expects. An unmapped symbol is passed through untouched, so a ticker
 * discovered via search still resolves without needing a table entry.
 */
export function toProviderName(symbol: string): string {
  const key = symbol.trim().toUpperCase();
  return TO_PROVIDER.get(key)?.indianApiName ?? key;
}

/** Maps IndianAPI's NSE ticker back to Tradehere's symbol where one exists. */
export function toTradehereSymbol(nseTicker: string): string {
  const key = nseTicker.trim().toUpperCase();
  return TO_TRADEHERE.get(key)?.tradehere ?? key;
}

export function isMapped(symbol: string): boolean {
  return TO_PROVIDER.has(symbol.trim().toUpperCase());
}

export function allMappings(): SymbolMapping[] {
  return [...MAPPINGS];
}
