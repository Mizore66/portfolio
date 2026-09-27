import { redirect } from "next/navigation";
import { BoardBox } from "@/components/board/BoardBox";
import { BoardUrlSync } from "@/components/board/BoardUrlSync";
import { FrontGame } from "@/components/game/FrontGame";
import { MobileBoardStrip } from "@/components/game/MobileBoardStrip";
import { BoardPane } from "@/components/site/BoardPane";
import { Contact } from "@/components/site/Contact";
import { HashRedirect } from "@/components/site/HashRedirect";
import { Hero } from "@/components/site/Hero";
import { Onward } from "@/components/site/Onward";
import { Proof } from "@/components/site/Proof";
import { parsePath } from "@/content/site";
import { careerPoints } from "@/content/site/career";
import { IDENTITY } from "@/content/site/identity";
import { LATEST_MOVE } from "@/content/site/game";
import { gameNode, isGameId, moveLabel } from "@/content/site/game-tree";
import { BoardDiagram, LINE_TITLE, boardStops, mainlineMoves } from "@/lib/board/page";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * The overview (brief §6): the board as the hero, the headline, the three
 * strongest proof points, the way onward, and the contact ending. Selected
 * work, the profile and the journal have their own pages.
 */
export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const move = typeof sp.move === "string" ? sp.move : undefined;
  if ((move && isGameId(move)) || sp.tape === "1") {
    const q = new URLSearchParams();
    if (move) q.set("move", move);
    if (sp.tape === "1") q.set("tape", "1");
    redirect(`/opening-preparation?${q.toString()}`);
  }
  // The work filter moved with Selected work.
  if (typeof sp.path === "string") {
    const path = parsePath(sp.path);
    redirect(path ? `/work?path=${path}` : "/work");
  }
  const latest = gameNode(LATEST_MOVE);
  return (
    <FrontGame stops={boardStops()} initial={LATEST_MOVE}>
      <HashRedirect />
      <MobileBoardStrip move={moveLabel(latest)} evalCp={careerPoints().find((p) => p.nodeId === LATEST_MOVE)?.evalCp ?? 0} />
      <div className="board-layout board-layout-home">
        <main id="main" className="reading">
          <Hero identity={IDENTITY} />
          {/* Phones: the board sits under the headline; on wide screens it is the pane beside it. */}
          <div className="hero-board-mobile">
            <BoardBox id="home-board-mobile" framing="hero" opening initialNode={LATEST_MOVE}>
              <BoardDiagram />
            </BoardBox>
          </div>
          <Proof />
          <Onward />
          <Contact identity={IDENTITY} />
        </main>
        <BoardPane lineName={LINE_TITLE} boxId="home-board" initialNode={LATEST_MOVE} opening framing="hero" diagram={<BoardDiagram />} line={mainlineMoves()} />
      </div>
      <BoardUrlSync latest={LATEST_MOVE} />
    </FrontGame>
  );
}
