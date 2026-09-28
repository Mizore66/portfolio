import type { Metadata } from "next";
import { content, span, month } from "@/content/site";
import { tables } from "@/content/roles";
import { RolesIndex } from "@/components/roles/RolesIndex";
import positions from "@/content/positions.json";

const R = content.pageCopy.roles;
export const metadata: Metadata = { title: R.title, description: `${R.sub} ${tables.map((t) => t.name).join(", ")}.` };

const when = (slug: string) => {
  if (slug === "education") return month(content.education.graduated);
  const r = content.roles.find((x) => x.id === slug)!;
  return span(r.start, r.end);
};

export default function Page() {
  const P = positions as Record<string, { fen: string; last: string[] }>;
  return (
    <RolesIndex
      list={tables.map((t) => ({ slug: t.slug, name: t.name, when: when(t.slug), current: t.current, fen: P[t.game.key].fen, last: P[t.game.key].last }))}
      copy={{ title: R.title, sub: R.sub, now: R.now, label: R.listLabel }}
    />
  );
}
