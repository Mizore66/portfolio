"use client";

import Link from "next/link";
import type { Ply } from "@/lib/opening/types";
import { AnalysisBoard } from "./AnalysisBoard";

export type TreeRow = { id: string; label: string; depth: number; kind: "mainline" | "variation" | "not-taken" };

const href = (id: string) => `/opening-preparation?move=${id}#chapter-${id}`;

/** Board pane for the scoresheet: the selected position, previous/next, and the whole tree as links. */
export function ScoresheetBoard({
  nodeId,
  plies,
  move,
  title,
  prev,
  next,
  tree,
  authoredEval,
}: {
  nodeId: string;
  plies: Ply[];
  move: string;
  title: string;
  prev: string | null;
  next: string | null;
  tree: TreeRow[];
  authoredEval?: number;
}) {
  return (
    <aside id="board" className="board-pane scoresheet-pane" aria-labelledby="board-title">
      <h2 id="board-title" className="board-title">
        Board
      </h2>
      <p className="board-caption">
        <span className="claim-value">{move || "Start"}</span> {title}
      </p>
      <AnalysisBoard basePlies={plies} positionKey={nodeId} label={`Position after ${move || "the start"}: ${title}`} />
      {authoredEval !== undefined ? (
        <p className="note">
          Annotator&apos;s eval <span className="claim-value">{authoredEval >= 0 ? "+" : ""}{authoredEval.toFixed(2)}</span>. Annotation, not engine output.
        </p>
      ) : null}
      <nav aria-label="Step through the moves" className="step-nav">
        {prev ? (
          <Link className="btn" href={href(prev)} rel="prev">
            Previous move
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="btn" href={href(next)} rel="next">
            Next move
          </Link>
        ) : null}
      </nav>
      <nav aria-label="Moves" className="tree">
        <ol>
          {tree.map((r) => (
            <li key={r.id} className={`tree-${r.kind}`} style={{ paddingLeft: `${r.depth * 1}rem` }}>
              <Link href={href(r.id)} aria-current={r.id === nodeId ? "true" : undefined}>
                {r.label}
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
