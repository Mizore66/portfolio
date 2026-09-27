"use client";

import { useEffect, useRef } from "react";
import { StaticBoard } from "@/components/site/StaticBoard";
import { replayPlies } from "@/lib/game/plies";
import { enginePlies } from "@/lib/board/position";
import { boardStore, useBoard, type Binding, type Framing } from "@/lib/board/store";

/**
 * A DOM box the 3D board draws into (a drei View tracks it). The server
 * renders the position as a printed diagram inside it: that diagram is the
 * poster, the no-WebGL fallback and what screen readers skip (the box is
 * `aria-hidden`; the position text lives with the analysis board). When the
 * 3D view draws its first frame, the diagram fades and the board comes up.
 */
export function BoardBox({
  id,
  framing,
  binding = { kind: "current" },
  opening = false,
  initialNode,
  className = "",
  children,
}: {
  id: string;
  framing: Framing;
  binding?: Binding;
  opening?: boolean;
  /** The move the server-rendered diagram shows. */
  initialNode: string;
  className?: string;
  /** The server-rendered diagram. */
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useBoard((s) => !!s.ready[id]);
  const data = useBoard((s) => s.data);
  const current = useBoard((s) => s.nodeId);
  const node = binding.kind === "current" ? current : binding.nodeId;

  // Registered only while the box has a size: a box hidden at this breakpoint neither draws nor claims the opening.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let on = false;
    const sync = () => {
      const shown = el.offsetWidth > 0 && el.offsetHeight > 0;
      if (shown && !on) boardStore().getState().register({ id, el, framing, binding, opening });
      if (!shown && on) boardStore().getState().unregister(id);
      on = shown;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (on) boardStore().getState().unregister(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, framing, opening, binding.kind, binding.kind === "fixed" ? binding.nodeId : ""]);

  const stale = data && node !== initialNode;
  return (
    <div ref={ref} className={`board-box board-box-${framing} ${className}`} data-board-box={id} data-ready={ready ? "" : undefined} data-cursor="board" aria-hidden="true">
      <div className="board-poster">{stale ? <StaticBoard plies={replayPlies(enginePlies(data, node))} label="" /> : children}</div>
    </div>
  );
}
