import type { MetadataRoute } from "next";
import { LAB_ARTICLE } from "@/content/learned-evaluator";
import { getPublishedDocument } from "@/lib/cms/store";
import { resumeData } from "@/lib/data";
import { parseFiledDate } from "@/lib/filed";
import { SITE_URL } from "@/lib/site";

const LAB_FILED = parseFiledDate(LAB_ARTICLE.datePublished) ?? new Date("2026-08-29T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = await getPublishedDocument();
  const revised = parseFiledDate(published.publishedAt) ?? new Date(published.publishedAt);
  return [
    {
      url: SITE_URL,
      lastModified: revised,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/opening-preparation`,
      lastModified: revised,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/colophon`,
      lastModified: revised,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/lab/learned-evaluator`,
      lastModified: LAB_FILED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...resumeData.projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: parseFiledDate(project.date) ?? revised,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
