import type { Metadata } from "next";
import { BoardBox } from "@/components/board/BoardBox";
import { PrototypeControls } from "@/components/board/PrototypeControls";
import { StaticBoard } from "@/components/site/StaticBoard";
import { LATEST_MOVE } from "@/content/site/game";
import { replayPliesTo } from "@/content/site/game-tree";

/** Phase 2 prototype (brief §11). Not linked, not in the sitemap, not indexed. */
export const metadata: Metadata = {
  title: "Board prototype · Anas Qumhiyeh",
  robots: { index: false, follow: false },
  alternates: { canonical: "/lab/board-prototype" },
};

export default function BoardPrototypePage() {
  const diagram = <StaticBoard plies={replayPliesTo(LATEST_MOVE)} label="" />;
  return (
    <main id="main" className="reading proto">
      <h1 className="proto-title">Board prototype</h1>
      <p className="note">
        Phase 2 of the motion and 3D pass. Hero view with the opening replay, a pane view, and the contact view at a raking angle, all drawn by
        one canvas. Add <code>?fps</code> to draw every frame and read the frame rate.
      </p>
      <p id="board-stats" className="proto-stats" aria-live="off">
        3D not loaded: printed diagrams only.
      </p>
      <PrototypeControls />
      <h2 className="proto-h">Hero</h2>
      <BoardBox id="proto-hero" framing="hero" opening initialNode={LATEST_MOVE}>
        {diagram}
      </BoardBox>
      <div className="proto-row">
        <div>
          <h2 className="proto-h">Pane</h2>
          <BoardBox id="proto-pane" framing="pane" initialNode={LATEST_MOVE}>
            {diagram}
          </BoardBox>
        </div>
        <div>
          <h2 className="proto-h">Contact (raking, fixed at the latest move)</h2>
          <BoardBox id="proto-raking" framing="raking" binding={{ kind: "fixed", nodeId: LATEST_MOVE }} initialNode={LATEST_MOVE}>
            {diagram}
          </BoardBox>
        </div>
      </div>
    </main>
  );
}
