import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['colonizable-johna-overdeferential.ngrok-free.dev'],
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  turbopack: {
    resolveAlias: {
      ".prisma/client/default": "./node_modules/.prisma/client/default.js",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "telegram.org",
      },
      {
        protocol: "https",
        hostname: "**.telegram-cdn.org",
      },
      {
        protocol: "https",
        hostname: "t.me",
      },
    ],
  },
};

export default nextConfig;
