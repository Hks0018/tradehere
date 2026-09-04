import type { DataStatus, ProviderId } from "./types";

export interface CacheEntry<T> {
  value: T;
  /** The status the data carried when it was stored. */
  status: DataStatus;
  source: ProviderId;
  /** ISO time the data refers to. */
  timestamp: string;
  storedAt: number;
  /** After this, the entry is stale but may still serve as LAST_KNOWN. */
  expiresAt: number;
  /** After this, the entry is discarded entirely. */
  purgeAt: number;
}

/**
 * Cache contract. The orchestrator only knows this interface, so swapping the
 * in-memory store for Redis in Phase 2B means writing one new class — nothing
 * above it changes.
 */
export interface CacheStore {
  /** Fresh entries only (inside TTL). */
  get<T>(key: string): Promise<CacheEntry<T> | undefined>;
  /** Any surviving entry, fresh or stale. Backs the LAST_KNOWN fallback. */
  getStale<T>(key: string): Promise<CacheEntry<T> | undefined>;
  set<T>(key: string, entry: CacheEntry<T>): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  size(): Promise<number>;
}

/**
 * Development/single-instance store.
 *
 * Two horizons per entry: `expiresAt` ends freshness, `purgeAt` ends existence.
 * The window between them is what makes a genuine last-known-value fallback
 * possible instead of an empty screen.
 */
export class InMemoryCacheStore implements CacheStore {
  private readonly entries = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly now: () => number = Date.now) {}

  async get<T>(key: string): Promise<CacheEntry<T> | undefined> {
    const entry = this.read<T>(key);
    if (!entry) return undefined;
    return this.now() < entry.expiresAt ? entry : undefined;
  }

  async getStale<T>(key: string): Promise<CacheEntry<T> | undefined> {
    return this.read<T>(key);
  }

  async set<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    this.entries.set(key, entry as CacheEntry<unknown>);
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }

  async clear(): Promise<void> {
    this.entries.clear();
  }

  async size(): Promise<number> {
    return this.entries.size;
  }

  private read<T>(key: string): CacheEntry<T> | undefined {
    const entry = this.entries.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (this.now() >= entry.purgeAt) {
      this.entries.delete(key);
      return undefined;
    }
    return entry;
  }
}

/** Stable cache keys. Argument order must never vary for the same logical call. */
export function cacheKey(parts: (string | number | undefined)[]): string {
  return parts.filter((part) => part !== undefined && part !== "").join(":");
}
