/**
 * Tradehere symbol  ->  Alpha Vantage symbol
 *
 * The one place provider-specific tickers are allowed to exist. Nothing in the
 * interface, the services or the API routes ever sees an Alpha Vantage symbol.
 *
 * `verified` means a real request to the live API returned data for that
 * symbol. Unverified entries are still attempted — if Alpha Vantage does not
 * cover one, the provider reports NO_DATA and the orchestrator fails over to
 * the sample provider, which is labelled MOCK. Nothing is fabricated either way.
 */
export interface SymbolMapping {
  /** Tradehere's internal symbol. */
  tradehere: string;
  /** The ticker Alpha Vantage recognises. */
  provider: string;
  /** Confirmed against the live API rather than assumed. */
  verified: boolean;
}

const MAPPINGS: SymbolMapping[] = [
  // Verified against the live API during integration.
  { tradehere: "RELIND", provider: "RELIANCE.BSE", verified: true },
  { tradehere: "TCSIT", provider: "TCS.BSE", verified: true },
  { tradehere: "INFOSY", provider: "INFY.BSE", verified: true },

  // Mapped from the BSE listings Alpha Vantage's own symbol search returns.
  // Attempted at runtime; unsupported ones fail over cleanly.
  { tradehere: "HDFCBK", provider: "HDFCBANK.BSE", verified: false },
  { tradehere: "ICICBK", provider: "ICICIBANK.BSE", verified: false },
  { tradehere: "BHRTEL", provider: "BHARTIARTL.BSE", verified: false },
  { tradehere: "LARTOU", provider: "LT.BSE", verified: false },
  { tradehere: "HINLEV", provider: "HINDUNILVR.BSE", verified: false },
  { tradehere: "STBKIN", provider: "SBIN.BSE", verified: false },
  { tradehere: "ITCFMC", provider: "ITC.BSE", verified: false },
  { tradehere: "AXSBNK", provider: "AXISBANK.BSE", verified: false },
  { tradehere: "MARUTO", provider: "MARUTI.BSE", verified: false },
  { tradehere: "SUNPHR", provider: "SUNPHARMA.BSE", verified: false },
  { tradehere: "TATMOT", provider: "TATAMOTORS.BSE", verified: false },
  { tradehere: "ASNPNT", provider: "ASIANPAINT.BSE", verified: false },
  { tradehere: "WIPTEC", provider: "WIPRO.BSE", verified: false },
  { tradehere: "BAJFIN", provider: "BAJFINANCE.BSE", verified: false },
  { tradehere: "TTASTL", provider: "TATASTEEL.BSE", verified: false },
  { tradehere: "TITJEW", provider: "TITAN.BSE", verified: false },
  { tradehere: "NESIND", provider: "NESTLEIND.BSE", verified: false },
  { tradehere: "PWRGRD", provider: "POWERGRID.BSE", verified: false },
  { tradehere: "DIVLAB", provider: "DIVISLAB.BSE", verified: false },
  { tradehere: "PLYTEC", provider: "POLYCAB.BSE", verified: false },
  { tradehere: "IRCTRL", provider: "IRCTC.BSE", verified: false },
  { tradehere: "HAVELC", provider: "HAVELLS.BSE", verified: false },
  { tradehere: "DMRTRT", provider: "DMART.BSE", verified: false },
  { tradehere: "CHOLFN", provider: "CHOLAFIN.BSE", verified: false },
  { tradehere: "ZOMFOOD", provider: "ZOMATO.BSE", verified: false },
];

const TO_PROVIDER = new Map(MAPPINGS.map((entry) => [entry.tradehere, entry]));
const TO_TRADEHERE = new Map(MAPPINGS.map((entry) => [entry.provider.toUpperCase(), entry]));

/**
 * Resolves a Tradehere symbol to its provider ticker.
 *
 * An unmapped symbol is passed through untouched, so a ticker discovered via
 * symbol search (`IBM`, `RELIANCE.BSE`) works without needing a table entry.
 */
export function toProviderSymbol(symbol: string): string {
  const key = symbol.trim().toUpperCase();
  return TO_PROVIDER.get(key)?.provider ?? key;
}

/** Maps a provider ticker back to Tradehere's symbol where one exists. */
export function toTradehereSymbol(providerSymbol: string): string {
  const key = providerSymbol.trim().toUpperCase();
  return TO_TRADEHERE.get(key)?.tradehere ?? key;
}

export function isMapped(symbol: string): boolean {
  return TO_PROVIDER.has(symbol.trim().toUpperCase());
}

export function mappingFor(symbol: string): SymbolMapping | undefined {
  return TO_PROVIDER.get(symbol.trim().toUpperCase());
}

export function allMappings(): SymbolMapping[] {
  return [...MAPPINGS];
}

/**
 * Whether fundamentals are worth attempting.
 *
 * Verified by real request: Alpha Vantage's OVERVIEW endpoint returns an empty
 * object for `.BSE` listings, so asking would spend a call from a small daily
 * quota to learn nothing. Company data for those falls back to the sample
 * provider and is labelled MOCK.
 */
export function supportsFundamentals(providerSymbol: string): boolean {
  return !providerSymbol.toUpperCase().endsWith(".BSE");
}
