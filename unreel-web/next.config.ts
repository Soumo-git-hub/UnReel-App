import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },



  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'soumo-huggs-un-reel.hf.space',
      },
    ],
  },
};

export default nextConfig;
