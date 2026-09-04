import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hrefs are composed dynamically from the data layer (symbols, slugs, query
  // strings), so route literals are validated at runtime rather than by types.
  typedRoutes: false,
  // The app is the workspace root; keeps Turbopack from walking up the tree.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
