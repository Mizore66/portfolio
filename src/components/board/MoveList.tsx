"use client";

import { useRef } from "react";
import { boardStore, useBoard } from "@/lib/board/store";

export type LineMove = { id: string; move: string; chapter: string };

/**
 * The mainline as a scoresheet whose moves are buttons (brief §9): ← and →
 * step, Home and End jump, focus follows the move. Printed exactly as the
 * line reads, "1. e4 e5 2. Nf3 Nc6 …". Keys act only inside the list, so page
 * scrolling keeps its arrow keys everywhere else.
 */
export function MoveList({ line }: { line: LineMove[] }) {
  const current = useBoard((s) => s.nodeId);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const byId = new Map(line.map((m) => [m.id, m]));
  const ids = line.map((m) => m.id);

  const pairs: { n: number; w?: string; b?: string }[] = [];
  for (const id of ids) {
    const node = byId.get(id)!;
    const n = Number.parseInt(node.move, 10);
    const last = pairs[pairs.length - 1];
    const isBlack = node.move.includes("…");
    if (!last || last.n !== n) pairs.push({ n, ...(isBlack ? { b: id } : { w: id }) });
    else if (isBlack) last.b = id;
    else last.w = id;
  }
  const sanOf = (id: string) => byId.get(id)!.move.replace(/^\d+(\.\s|…)/, "");

  const go = (id: string | undefined) => {
    if (!id) return;
    boardStore().getState().setNode(id, "user");
    refs.current.get(id)?.focus();
  };
  const onKey = (e: React.KeyboardEvent) => {
    const i = ids.indexOf(current);
    const next =
      e.key === "ArrowLeft" ? ids[Math.max(0, i - 1)] : e.key === "ArrowRight" ? ids[Math.min(ids.length - 1, i + 1)] : e.key === "Home" ? ids[0] : e.key === "End" ? ids[ids.length - 1] : undefined;
    if (!next) return;
    e.preventDefault();
    go(next);
  };

  const btn = (id: string) => (
    <button
      type="button"
      ref={(el) => {
        if (el) refs.current.set(id, el);
        else refs.current.delete(id);
      }}
      className={`move-btn${id === current ? " is-current" : ""}`}
      aria-current={id === current ? "step" : undefined}
      aria-label={`${byId.get(id)!.move}, ${byId.get(id)!.chapter}`}
      tabIndex={id === current || (!ids.includes(current) && id === ids[ids.length - 1]) ? 0 : -1}
      onClick={() => go(id)}
    >
      {sanOf(id)}
    </button>
  );

  return (
    <ol className="moves" aria-label="The mainline. Arrow keys step through the moves; Home and End jump." onKeyDown={onKey}>
      {pairs.map((p) => (
        <li key={p.n}>
          {p.n}. {p.w ? btn(p.w) : "…"} {p.b ? btn(p.b) : null}
        </li>
      ))}
    </ol>
  );
}
