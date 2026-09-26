import { projectBySlug } from "@/content/site";
import { CATEGORY_LABEL, PROJECTS } from "@/content/site/projects";
import { OG_SIZE, renderOg } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Case study by Anas Qumhiyeh";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

/** Drawn from content (brief §2.3, §3.8): name, subtitle, category. No year. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = projectBySlug((await params).slug);
  return renderOg({
    kicker: "Anas Qumhiyeh · Case study",
    title: p?.name ?? "Case study",
    subtitle: p?.subtitle,
    footer: p ? CATEGORY_LABEL[p.category] : undefined,
  });
}
