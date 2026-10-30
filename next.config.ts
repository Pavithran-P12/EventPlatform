import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // Reuse dynamic pages from the client router cache for 30s so dashboard
    // navigation between already-visited pages is instant. Server Actions
    // call revalidatePath, which invalidates this cache after mutations.
    staleTimes: {
      dynamic: 30,
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
