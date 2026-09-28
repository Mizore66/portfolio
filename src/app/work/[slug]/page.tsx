import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prose } from "@/content/site";
import { evalLabel, featured, featuredBy } from "@/content/work";
import { Project } from "@/components/project/Project";
import { Study } from "@/components/project/Study";

// Only the three featured projects have pages; the rest live in résumé mode.
export const dynamicParams = false;
export function generateStaticParams() {
  return featured.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const f = featuredBy((await params).slug);
  if (!f) return {};
  const seo = (f.project as { seo?: { title: string; description: string } }).seo;
  return { title: f.name, description: seo ? prose(seo.description) : f.project.purpose };
}

export default async function Page({ params }: PageProps<"/work/[slug]">) {
  const f = featuredBy((await params).slug);
  if (!f) notFound();
  return (
    <Project head={{ slug: f.slug, name: f.name.split(" "), meta: f.meta, subtitle: f.subtitle, claim: prose(f.claim.display), qualifier: f.claim.qualifier, move: `${f.move} ${evalLabel(f.cp)}` }}>
      <Study f={f} />
    </Project>
  );
}
