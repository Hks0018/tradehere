/**
 * Test stand-in for the `server-only` package.
 *
 * The real module exists to break a *client* bundle that imports server code.
 * Vitest runs in Node, where that boundary does not apply, so it resolves to
 * this empty module instead of throwing.
 */
export {};
