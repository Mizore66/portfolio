import type { Metadata } from "next";
import { headers } from "next/headers";
import { BoardFollow } from "@/components/board/BoardFollow";
import { FrontGame } from "@/components/game/FrontGame";
import { BoardPane } from "@/components/site/BoardPane";
import { Work } from "@/components/site/Work";
import { parsePath } from "@/content/site";
import { LATEST_MOVE } from "@/content/site/game";
import { BoardDiagram, LINE_TITLE, boardStops, mainlineMoves } from "@/lib/board/page";

export const metadata: Metadata = {
  title: "Selected work · Anas Qumhiyeh",
  alternates: { canonical: "/work" },
  openGraph: { title: "Selected work · Anas Qumhiyeh", url: "/work" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** The portfolio (brief §6): Selected work, the ?path= filter and the archive, with the board following the project in view. */
export default async function WorkPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const saveData = (await headers()).get("save-data")?.toLowerCase() === "on";
  return (
    <FrontGame stops={boardStops()} initial={LATEST_MOVE}>
      <div className="board-layout">
        <main id="main" className="reading">
          <Work path={parsePath(sp.path)} saveData={saveData} headingLevel="h1" />
        </main>
        <BoardPane lineName={LINE_TITLE} boxId="work-board" initialNode={LATEST_MOVE} diagram={<BoardDiagram />} line={mainlineMoves()} />
      </div>
      <BoardFollow />
    </FrontGame>
  );
}
