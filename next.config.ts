import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  // Page changes are the seam sweeping away a view-transition snapshot (src/lib/seam/sweep.ts).
  experimental: { viewTransition: true },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  // Kept from v2 so old shared links still land. Revisit when the v3 routes exist.
  async redirects() {
    return [
      { source: "/archive", destination: "/work#archive", permanent: true },
      // v2 printed the résumé at /print-edition; résumé mode replaces it.
      { source: "/print-edition", destination: "/resume", permanent: true },
    ];
  },
};

export default nextConfig;
