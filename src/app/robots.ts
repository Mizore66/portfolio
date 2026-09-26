import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Brief §2.6: allow everything and point at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
