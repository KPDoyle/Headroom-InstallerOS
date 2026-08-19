import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL === "1" ? {
    turbopack: {
      resolveAlias: {
        "cloudflare:workers": "./app/vercel-cloudflare-stub.ts",
      },
    },
  } : {}),
};

export default nextConfig;
