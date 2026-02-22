import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://127.0.0.1:3000"],
  outputFileTracingIncludes: {
    "/api/generate": ["./src/fonts/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com",
      },
    ],
  },
};

export default nextConfig;
