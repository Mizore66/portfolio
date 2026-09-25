import { redirect } from "next/navigation";
import { About } from "@/components/site/About";
import { BoardPane } from "@/components/site/BoardPane";
import { Contact } from "@/components/site/Contact";
import { Education } from "@/components/site/Education";
import { Experience } from "@/components/site/Experience";
import { Hero } from "@/components/site/Hero";
import { LabTeaser } from "@/components/site/LabTeaser";
import { Skills } from "@/components/site/Skills";
import { Work } from "@/components/site/Work";
import { parsePath } from "@/content/site";
import { IDENTITY } from "@/content/site/identity";
import { ROLES } from "@/content/site/roles";
import { isOpeningId } from "@/lib/opening/tree";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const move = typeof sp.move === "string" ? sp.move : undefined;
  if ((move && isOpeningId(move)) || sp.tape === "1") {
    const q = new URLSearchParams();
    if (move) q.set("move", move);
    if (sp.tape === "1") q.set("tape", "1");
    redirect(`/opening-preparation?${q.toString()}`);
  }
  return (
    <div className="board-layout">
      <main id="main" className="reading">
        <Hero identity={IDENTITY} />
        <Work path={parsePath(sp.path)} />
        <Experience roles={ROLES} />
        <Skills />
        <Education />
        <LabTeaser />
        <About identity={IDENTITY} />
        <Contact identity={IDENTITY} />
      </main>
      <BoardPane />
    </div>
  );
}
