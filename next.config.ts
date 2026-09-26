import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    globalNotFound: true,
  },
  // The résumé PDF reads its fonts from disk at request time (brief §4.2).
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/print-edition": ["./src/fonts/schibsted-grotesk/*.ttf"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 14,
    // The sheet is 1180px; a full-viewport candidate was noise on 184px plates.
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 184, 200, 256, 384, 480],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  // Brief §2.2: static, no lookup.
  async redirects() {
    return [
      { source: "/about", destination: "/#about", permanent: true },
      { source: "/archive", destination: "/#work", permanent: true },
    ];
  },
};

export default nextConfig;
