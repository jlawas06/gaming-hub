import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self' http: https: data: blob: 'unsafe-inline'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
