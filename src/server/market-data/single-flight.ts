/**
 * Request de-duplication.
 *
 * When several parts of a page ask for the same thing at the same moment — a
 * server render and a client fetch, or two components sharing a symbol — only
 * the first request reaches the provider. The rest await the same promise.
 *
 * This matters most on a metered free tier, where a single page view could
 * otherwise spend several calls on one identical quote.
 */
export class SingleFlight {
  private readonly inFlight = new Map<string, Promise<unknown>>();

  /** Number of requests currently sharing a provider call. Used in diagnostics. */
  get size(): number {
    return this.inFlight.size;
  }

  async run<T>(key: string, task: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<T>;

    // Start the work, register it, and always deregister — including on
    // failure, so one error cannot wedge the key permanently.
    const promise = task().finally(() => {
      this.inFlight.delete(key);
    });

    this.inFlight.set(key, promise);
    return promise;
  }
}
