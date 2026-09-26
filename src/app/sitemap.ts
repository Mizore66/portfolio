import type { MetadataRoute } from "next";
import { LAB_ARTICLE } from "@/content/site/lab";
import { PROJECTS } from "@/content/site/projects";
import { CONTENT_UPDATED } from "@/content/site/updated";
import { SITE_URL } from "@/lib/site";

const day = (d: string) => new Date(d.length === 7 ? `${d}-01T00:00:00Z` : `${d}T00:00:00Z`);

/** Brief §2.6: priorities fixed, lastmod from content dates. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: day(CONTENT_UPDATED), changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/opening-preparation`, lastModified: day(CONTENT_UPDATED), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/lab/learned-evaluator`, lastModified: day(LAB_ARTICLE.dateModified), changeFrequency: "yearly", priority: 0.7 },
    ...PROJECTS.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: day(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/colophon`, lastModified: day(CONTENT_UPDATED), changeFrequency: "yearly", priority: 0.3 },
  ];
}
