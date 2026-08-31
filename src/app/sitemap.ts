import type { MetadataRoute } from "next";
import { LAB_ARTICLE } from "@/content/learned-evaluator";
import { resumeData } from "@/lib/data";
import { parseFiledDate } from "@/lib/filed";
import { SITE_URL } from "@/lib/site";

const LAB_FILED = parseFiledDate(LAB_ARTICLE.datePublished) ?? new Date("2026-08-29T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAB_FILED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/opening-preparation`,
      lastModified: LAB_FILED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/lab/learned-evaluator`,
      lastModified: LAB_FILED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...resumeData.projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: parseFiledDate(project.date) ?? LAB_FILED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
