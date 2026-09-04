/**
 * Query vocabulary shared by the server-side stock service and the browser
 * client. Kept in its own module so client components can import the types
 * without pulling in the server-only service that owns the implementation.
 */
export type StockCategory = "popular" | "trending" | "large" | "mid" | "small" | "all";
export type StockSortKey = "name" | "price" | "changePercent" | "marketCap" | "volume";
export type SortDirection = "asc" | "desc";
