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
import { CareerGraph } from "@/components/game/CareerGraph";
import { FrontGame, type BoardStop } from "@/components/game/FrontGame";
import { MobileBoardStrip } from "@/components/game/MobileBoardStrip";
import { careerPoints } from "@/content/site/career";
import { LATEST_MOVE } from "@/content/site/game";
import { enginePliesTo, gameNode, isGameId, moveLabel } from "@/content/site/game-tree";
import { LINE_NAME, LINE_SAN } from "@/content/site/line";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const move = typeof sp.move === "string" ? sp.move : undefined;
  if ((move && isGameId(move)) || sp.tape === "1") {
    const q = new URLSearchParams();
    if (move) q.set("move", move);
    if (sp.tape === "1") q.set("tape", "1");
    redirect(`/opening-preparation?${q.toString()}`);
  }
  const points = careerPoints();
  const stops: Record<string, BoardStop> = {};
  for (const p of points) {
    stops[p.nodeId] = { nodeId: p.nodeId, plies: enginePliesTo(p.nodeId), move: p.move, title: gameNode(p.nodeId).title, chapter: p.label };
  }
  const now = new Date();
  const nowYm = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const latest = gameNode(LATEST_MOVE);
  return (
    <FrontGame stops={stops} initial={LATEST_MOVE}>
      <MobileBoardStrip move={moveLabel(latest)} evalCp={points.find((p) => p.nodeId === LATEST_MOVE)?.evalCp ?? 0} />
      <div className="board-layout">
      <main id="main" className="reading">
        <Hero identity={IDENTITY} />
        <CareerGraph points={points} from="2024-11" now={nowYm} />
        <Work path={parsePath(sp.path)} />
        <Experience roles={ROLES} />
        <Skills />
        <Education />
        <LabTeaser />
        <About identity={IDENTITY} />
        <Contact identity={IDENTITY} />
      </main>
      <BoardPane lineName={LINE_NAME} moves={LINE_SAN.split(/ (?=\d+\. )/)} />
      </div>
    </FrontGame>
  );
}
