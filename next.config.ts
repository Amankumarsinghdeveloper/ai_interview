import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
    remotePatterns: [],
  },
  experimental: {
    serverComponentsExternalPackages: ["shiki"],
  },
  // Ensure public files are accessible without restrictions
  async rewrites() {
    return [
      // Rewrite for public images
      {
        source: "/images/:path*",
        destination: "/public/images/:path*",
      },
    ];
  },
  // Allow all public files to be accessible
  webpack(config) {
    // Existing webpack configuration
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
