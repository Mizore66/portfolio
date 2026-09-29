"use client";

// Play's controls (lab2-7, lab2-7-m): opponent, side, the moves, the status and Start. Drawn in both layers like all
// the Lab's type; the ink copy mounts the game, and both read the same state.
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { EvalMode } from "@/lib/chess/engine";
import type { ChapterCopy } from "./Lab";
import { share } from "./kit";
import { mountPlay, movesText, pawns, seamPct, store, type PlayState } from "./game";

let game: ReturnType<typeof mountPlay> | null = null;

/** a copy template with its scores and moves set in mono, as the key frames set them */
function fill(t: string, v: Record<string, string>, mono: string[]) {
  return t.split(/(\{\w+\})/).map((part, i) => {
    const k = part.match(/^\{(\w+)\}$/)?.[1];
    if (!k) return part;
    return mono.includes(k) ? <span key={i} className="mono">{v[k]}</span> : v[k];
  });
}

function status(c: ChapterCopy, s: PlayState, phone: boolean) {
  const net = (s.opp === "learned" ? c.learned : c.handcrafted) as string, side = (s.white ? c.white : c.black) as string;
  const v = { net: net.toLowerCase(), side, eval: pawns(s.cp, s.white), best: s.best };
  const t = (k: string) => fill(c[k] as string, v, ["eval", "best"]);
  switch (s.phase) {
    case "loading": return t("loading");
    case "thinking": return t("thinking");
    case "won": case "lost": case "drawn": return t(s.phase);
    case "idle": if (!s.white) return t("statusWait");
  }
  if (s.phase === "you" && !s.best) return t("yourMove"); // its line was too short to name your reply yet
  return t(phone ? "statusPhone" : "status");
}

export function Play({ inv, copy: c }: { inv: boolean; copy: ChapterCopy }) {
  const s = useSyncExternalStore(store.sub, store.get, store.server);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (inv) return;
    const pin = ref.current!.closest<HTMLElement>(".ch-pin")!;
    game = mountPlay(pin, window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => { game?.dispose(); game = null; };
  }, [inv]);

  const opt = (label: string, items: [string, boolean, () => void][]) => (
    <div className="opt">{label}<div>{items.map(([t, on, go]) => <button key={t} type="button" className={on ? "on" : ""} aria-pressed={on} onClick={go}>{t}</button>)}</div></div>
  );
  const setOpp = (o: EvalMode) => () => game?.setOpp(o), setWhite = (w: boolean) => () => game?.setWhite(w);
  const over = s.phase === "won" || s.phase === "lost" || s.phase === "drawn";
  const ev = `${pawns(s.seamCp, true)} · ${seamPct(s.seamCp)}`;
  return (
    <div ref={ref} className="play">
      <div className="ctl">
        <div className="opts">
          {opt(c.opponent as string, [[c.learned as string, s.opp === "learned", setOpp("learned")], [c.handcrafted as string, s.opp === "handcrafted", setOpp("handcrafted")]])}
          {opt(c.youPlay as string, [[c.white as string, s.white, setWhite(true)], [c.black as string, !s.white, setWhite(false)]])}
        </div>
        <div className="bot">
          <div className="moves ev-ph">{c.seamLabel as string} · {ev}</div>
          <div className="moves">{movesText(s.sans)}</div>
          <p className="status" aria-live={inv ? undefined : "polite"}><span className="wide">{status(c, s, false)}</span><span className="narrow">{status(c, s, true)}</span></p>
          {!s.started || over ? (
            <button type="button" className="start" disabled={s.phase === "loading"} onClick={() => (over ? game?.again() : game?.start())}>{(over ? c.again : c.start) as string}</button>
          ) : null}
          {!s.started ? <p className="note start-note">{c.startNote as string}</p> : null}
        </div>
      </div>
      {/* the label rides the seam; it steps above the note when the seam runs left of it, and flips at the right edge */}
      <div className={`ev mono${share(s.seamCp) < 0.27 ? " low" : ""}${share(s.seamCp) > 0.86 ? " end" : ""}`}>{ev}</div>
    </div>
  );
}
