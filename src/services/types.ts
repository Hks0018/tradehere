/**
 * Service-layer contracts.
 *
 * Every page and feature component talks to these functions — never to the
 * `src/data` modules directly. In Phase 2, the bodies of the service modules
 * are replaced with real network calls; the signatures below stay identical,
 * so no UI code has to change.
 */

export interface Paginated<T> {
  items: T[];
  total: number;
}

export type DataSource = "mock" | "live";

/** Advertised by every service so the UI can label demo data honestly. */
export const DATA_SOURCE: DataSource = "mock";
