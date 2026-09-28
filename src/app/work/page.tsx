import type { Metadata } from "next";
import { content } from "@/content/site";
import { aside, entries, featured, others } from "@/content/work";
import { WorkIndex } from "@/components/work/WorkIndex";
import { Others } from "@/components/work/Others";

export const metadata: Metadata = { title: "Work", description: entries.map((f) => `${f.name}: ${f.subtitle}`).join(". ") + "." };

const W = content.pageCopy.work;
/** the result line without its parenthesis: the scoresheet has one line for it (the full line is on the project's page) */
const short = (s: string) => s.replace(/\s*\([^)]*\)\s*$/, "");

export default function Page() {
  return (
    <main id="main" tabIndex={-1} className="work-page">
      <WorkIndex pieces={featured.map((f) => ({ slug: f.slug, name: f.name, square: f.square!, move: f.move!, result: f.result, qualifier: f.claim.qualifier }))} />
      <Others
        list={others.map((o) => ({ slug: o.slug, name: o.name, square: o.square, move: o.move, result: short(o.result), qualifier: o.claim.qualifier, aside: aside.has(o.slug) }))}
        copy={{ title: W.othersTitle, label: W.othersLabel, noMove: W.noMove, aside: W.aside }}
      />
    </main>
  );
}
