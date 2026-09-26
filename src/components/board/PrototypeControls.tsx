"use client";

import { useEffect, useMemo } from "react";
import { boardStore, useBoard } from "@/lib/board/store";

/** Prototype-only controls: step the mainline, preview candidate arrows, toggle the engine view. */
export function PrototypeControls() {
  const data = useBoard((s) => s.data);
  const nodeId = useBoard((s) => s.nodeId);
  const focus = useBoard((s) => s.focusNode);
  const engineView = useBoard((s) => s.engineView);
  const line = useMemo(() => data?.mainline.filter((id) => data.nodes[id].uci) ?? [], [data]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!data || (e.target as HTMLElement).closest("input, textarea")) return;
      const i = line.indexOf(boardStore().getState().nodeId);
      let next: string | undefined;
      if (e.key === "ArrowLeft") next = line[Math.max(0, i - 1)];
      else if (e.key === "ArrowRight") next = line[Math.min(line.length - 1, i + 1)];
      else if (e.key === "Home") next = line[0];
      else if (e.key === "End") next = line[line.length - 1];
      if (next) {
        e.preventDefault();
        boardStore().getState().setNode(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, line]);

  if (!data) return null;
  return (
    <div className="proto-controls">
      <ol className="moves" aria-label="Mainline: arrow keys step, Home and End jump">
        {line.map((id) => (
          <li key={id}>
            <button type="button" className={`proto-move${id === nodeId ? " is-current" : ""}`} aria-current={id === nodeId ? "true" : undefined} onClick={() => boardStore().getState().setNode(id)}>
              {data.nodes[id].move}
            </button>
          </li>
        ))}
      </ol>
      <div className="hero-actions">
        {(["closed", "elephant", "alekhine", "faultline"] as const).map((id) => (
          <button
            key={id}
            type="button"
            className="btn"
            aria-pressed={focus === id}
            onMouseEnter={() => boardStore().getState().setFocus(id)}
            onMouseLeave={() => boardStore().getState().setFocus(null)}
            onFocus={() => boardStore().getState().setFocus(id)}
            onBlur={() => boardStore().getState().setFocus(null)}
          >
            Arrows for {data.nodes[id].move}
          </button>
        ))}
        <button type="button" className="btn" aria-pressed={engineView} onClick={() => boardStore().getState().setEngineView(!engineView)}>
          Engine view {engineView ? "on" : "off"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            try {
              sessionStorage.removeItem("board:opening-played");
            } catch {}
            window.location.reload();
          }}
        >
          Replay the opening
        </button>
      </div>
    </div>
  );
}
