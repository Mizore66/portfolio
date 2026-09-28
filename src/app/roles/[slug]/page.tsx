import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content } from "@/content/site";
import { moveLabel, tableBy, tables } from "@/content/roles";
import { RolePage } from "@/components/roles/RolePage";

// Seven tables: the six roles and the Monash degree (decisions.md, Tables).
export const dynamicParams = false;
export function generateStaticParams() {
  return tables.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/roles/[slug]">): Promise<Metadata> {
  const t = tableBy((await params).slug);
  return t ? { title: t.name, description: t.sub } : {};
}

export default async function Page({ params }: PageProps<"/roles/[slug]">) {
  const t = tableBy((await params).slug);
  if (!t) notFound();
  const i = tables.indexOf(t), next = tables[(i + 1) % tables.length], R = content.pageCopy.roles;
  return (
    <RolePage v={{
      slug: t.slug, title: t.title, sub: t.sub, facts: t.facts,
      game: { title: t.game.title, plies: t.game.plies, famous: t.game.famous, labels: t.game.plies.map((p, k) => moveLabel(k, p.san)) },
      next: { slug: next.slug, title: next.title, label: next.sub },
      copy: { start: R.start, next: R.next, back: R.back },
    }} />
  );
}
