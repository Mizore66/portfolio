import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prose } from "@/content/site";
import { content } from "@/content/site";
import { entries, entryBy, evalLabel } from "@/content/work";
import { Project } from "@/components/project/Project";
import { Study } from "@/components/project/Study";

// Every project has a page: the featured three and the other seven (step 4a).
export const dynamicParams = false;
export function generateStaticParams() {
  return entries.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const f = entryBy((await params).slug);
  if (!f) return {};
  const seo = (f.project as { seo?: { title: string; description: string } }).seo;
  return { title: f.name, description: seo ? prose(seo.description) : f.project.purpose };
}

/** Long names take two lines on desktop, the second short enough to end before the piece (proj-a). */
const BREAKS: Record<string, number[]> = { "financial-risk-predictor": [2], "distributed-lead-scorer": [1], "slm-distillation-engine": [2], "multi-agent-graphrag": [1] };

export default async function Page({ params }: PageProps<"/work/[slug]">) {
  const f = entryBy((await params).slug);
  if (!f) notFound();
  return (
    <Project head={{ slug: f.slug, name: f.name.split(" "), breaks: BREAKS[f.slug], meta: f.meta, subtitle: f.subtitle, claim: prose(f.claim.display), qualifier: f.claim.qualifier, move: f.move ? `${f.move} ${evalLabel(f.cp)}` : content.pageCopy.work.noMove }}>
      <Study f={f} />
    </Project>
  );
}
