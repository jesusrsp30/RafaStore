import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force env reload
  experimental: {
    // Enabled by default in Next.js 16
  },
};

export default nextConfig;
