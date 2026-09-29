/**
 * Play (motion.md §12): the game behind the board. One controller per page owns the position, the worker and the
 * hand on the board; the two copies of the controls (ink and paper) read the same state. The game starts from the
 * start position (the owner's choice at the Lab gate, over the key frame's Italian), with both evaluators' scores
 * of it already known (lab-data.json, start).
 */
import { legalPlies, playPly, sanOf, startPos, rowsOf, gameOutcome, type EnginePos, type EvalMode } from "@/lib/chess/engine";
import type { Ply } from "@/lib/opening/types";
import DATA from "@/content/lab-data.json";
import { playStage, type PlayStage } from "./ch7";
import { share } from "./kit";
import type { PlayIn, PlayOut } from "./play.worker";

export type Phase = "idle" | "loading" | "you" | "thinking" | "won" | "lost" | "drawn";
export interface PlayState {
  opp: EvalMode; white: boolean; started: boolean; phase: Phase;
  sans: string[];
  /** the opponent's evaluator on the position: centipawns from White's view, and its best move for the side to move */
  cp: number; best: string;
  /** the learned net's score, which the seam follows (White's view) */
  seamCp: number;
}

const HOME: Ply[] = [];
const known = (opp: EvalMode) => { const d = DATA.start[opp]; return { cp: d.evalCp, best: d.best }; };
export const START_CP = DATA.start.learned.evalCp;
const HAND = 280, DROP = 200, BACK = 250, RESET = 600;

const HOME_SANS = (() => { const q = startPos(); return HOME.map((p) => { const t = sanOf(q, p); playPly(q, p); return t; }); })();
let state: PlayState = { opp: "learned", white: true, started: false, phase: "idle", sans: HOME_SANS, cp: known("learned").cp, best: known("learned").best, seamCp: START_CP };
const subs = new Set<() => void>();
const put = (s: Partial<PlayState>) => { state = { ...state, ...s }; subs.forEach((f) => f()); };
export const store = {
  get: () => state,
  sub(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
  server: () => SERVER,
};
const SERVER = state;

/** the moves list as the key frames write it: "1. e4 e5 2. Nf3 Nc6", the last eight moves when it runs long */
export function movesText(sans: string[]): string {
  const out: string[] = [];
  for (let i = 0; i < sans.length; i += 2) out.push(`${i / 2 + 1}. ${sans[i]}${sans[i + 1] ? ` ${sans[i + 1]}` : ""}`);
  return out.length > 8 ? `… ${out.slice(-8).join(" ")}` : out.join(" ");
}
/** a score in pawns, from one side's view: "+0.43" */
export const pawns = (cp: number, white: boolean) => { const v = (white ? cp : -cp) / 100; return `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`; };
export const seamPct = (cp: number) => `${(share(cp) * 100).toFixed(1)}%`;

/** Mount the game on the page (the ink copy of the controls calls this); returns the teardown. */
export function mountPlay(pin: HTMLElement, reduced: boolean): { start(): void; setOpp(o: EvalMode): void; setWhite(w: boolean): void; again(): void; dispose(): void } {
  let pos: EnginePos = startPos(), plies: Ply[] = [], stage: PlayStage | null = null, worker: Worker | null = null;
  let id = 0, game = 0, alive = true, from: string | null = null, dragging = false, down: { x: number; y: number } | null = null, busy = false;
  const replies = new Map<number, (m: PlayOut) => void>();
  const ms = (t: number) => (reduced ? 0 : t);

  const home = () => { pos = startPos(); plies = []; for (const p of HOME) { playPly(pos, p); plies.push(p); } };
  const sansOf = () => { const q = startPos(); return plies.map((p) => { const s = sanOf(q, p); playPly(q, p); return s; }); };
  const yourTurn = () => (pos.side === 1) === state.white;
  const draw = (last = true) => stage?.set(rowsOf(pos), last && plies.length ? [plies.at(-1)!.from, plies.at(-1)!.to] : null);
  home();

  // a move as a hand plays it; castling carries the rook too (the redraw after it settles en passant and promotion)
  const hand = (p: Ply, t: number) => {
    const k = rowsOf(pos).split("/")[8 - +p.from[1]]["abcdefgh".indexOf(p.from[0])].toUpperCase() === "K", d = p.to.charCodeAt(0) - p.from.charCodeAt(0);
    const rook = k && Math.abs(d) === 2 ? stage?.move((d > 0 ? "h" : "a") + p.from[1], (d > 0 ? "f" : "d") + p.from[1], ms(t)) : undefined;
    return Promise.all([stage?.move(p.from, p.to, ms(t)), rook]);
  };
  const ask = (m: PlayIn extends infer T ? T extends PlayIn ? Omit<T, "id"> : never : never) => new Promise<PlayOut>((res) => {
    const n = ++id; replies.set(n, res);
    // the engine does not think while the tab is hidden
    const go = () => { if (document.hidden) { document.addEventListener("visibilitychange", go, { once: true }); return; } worker?.postMessage({ ...m, id: n } as PlayIn); };
    go();
  });
  const over = (): Phase | null => {
    const o = gameOutcome(pos); if (!o) return null;
    if (o === "1/2-1/2") return "drawn";
    return (o === "1-0") === state.white ? "won" : "lost";
  };

  // after a move lands: the game may be over; otherwise the side to move is analysed and, if it is the engine, plays
  const next = async () => {
    const end = over();
    if (end) { put({ phase: end, sans: sansOf() }); return; }
    // a reset while the engine thinks or moves makes whatever comes back stale
    const mode = state.opp, g = game, live = () => alive && g === game;
    put({ phase: "thinking", sans: sansOf() });
    const r = await ask({ type: "think", plies, mode });
    if (!live() || r.type !== "thought") return;
    if (!yourTurn()) {
      if (!r.best) return;
      if (mode === "learned") { put({ seamCp: r.cp }); stage?.eval(r.cp); }
      busy = true; await hand(r.best, HAND); busy = false;
      if (!live()) return;
      playPly(pos, r.best); plies.push(r.best); draw();
      return next();
    }
    // your move: the opponent's evaluator names its score and its move for you; the seam takes the learned net's
    let seamCp = r.cp;
    if (mode !== "learned") { const l = await ask({ type: "think", plies, mode: "learned" }); if (!live()) return; if (l.type === "thought") seamCp = l.cp; }
    put({ phase: "you", cp: r.cp, best: r.san ?? "", seamCp }); stage?.eval(seamCp);
  };

  // the hand: press lifts, the dots show; drop on a dot plays, anywhere else goes home; click-click works too
  const at = (e: PointerEvent) => { const b = pin.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  const targets = (sq: string) => legalPlies(pos).filter((p) => p.from === sq).map((p) => p.to);
  const lift = (sq: string | null) => {
    from = sq;
    if (!sq) { stage?.lift(null, [], []); return; }
    // a capture shows as a ring: a piece on the square, or a pawn stepping sideways (en passant)
    const t = targets(sq), rows = rowsOf(pos).split("/"), on = (s: string) => rows[8 - +s[1]]["abcdefgh".indexOf(s[0])];
    stage?.lift(sq, t, t.filter((s) => on(s) !== "." || (on(sq).toUpperCase() === "P" && s[0] !== sq[0])));
  };
  const mine = (sq: string) => legalPlies(pos).some((p) => p.from === sq);
  const play = async (to: string, travel: number) => {
    const ply = { from: from!, to }; busy = true;
    await hand(ply, travel);
    playPly(pos, ply); plies.push(ply); from = null; draw(); busy = false;
    void next();
  };
  const onDown = (e: PointerEvent) => {
    if (!stage || busy || state.phase !== "you" || e.button > 0) return;
    const p = at(e), sq = stage.pick(p.x, p.y); if (!sq) { if (from) lift(null); return; }
    if (from && targets(from).includes(sq)) { void play(sq, HAND); return; }
    if (!mine(sq)) { if (from) lift(null); return; }
    lift(sq); down = p; dragging = false; pin.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!down || !from || !stage) { pin.style.cursor = stage && state.phase === "you" ? (() => { const p = at(e), sq = stage.pick(p.x, p.y); return sq && (mine(sq) || (from && targets(from).includes(sq))) ? "pointer" : ""; })() : ""; return; }
    const p = at(e); if (!dragging && Math.hypot(p.x - down.x, p.y - down.y) < 6) return;
    dragging = true; pin.style.cursor = "grabbing"; stage.drag(p.x, p.y);
  };
  const onUp = (e: PointerEvent) => {
    if (!down || !stage) return;
    const wasDrag = dragging; down = null; dragging = false; pin.style.cursor = "";
    if (!wasDrag) return; // a click: the piece stays lifted for the second click
    const p = at(e), sq = stage.pick(p.x, p.y);
    if (sq && from && targets(from).includes(sq)) void play(sq, DROP);
    else { busy = true; void stage.settle(ms(BACK)).then(() => { from = null; busy = false; }); }
  };
  pin.addEventListener("pointerdown", onDown); pin.addEventListener("pointermove", onMove);
  pin.addEventListener("pointerup", onUp); pin.addEventListener("pointercancel", onUp);
  const unStage = playStage.on((s) => { stage = s; if (s) { s.orient(state.white); draw(); s.eval(state.seamCp); } });

  // switching opponent or side slides the pieces home and starts over (600 ms, seam, 10 ms stagger)
  const reset = async () => {
    const g = ++game; from = null; busy = true; stage?.lift(null, [], []); home();
    stage?.orient(state.white);
    await stage?.slide(rowsOf(pos), null, ms(RESET));
    if (g !== game) return;
    busy = false;
    const k = known(state.opp);
    put({ sans: sansOf(), cp: k.cp, best: k.best, seamCp: START_CP, phase: state.started ? "you" : "idle" });
    stage?.eval(START_CP);
    if (state.started && !yourTurn()) void next();
  };

  return {
    start() {
      if (state.started || state.phase === "loading") return;
      put({ phase: "loading" });
      worker = new Worker(new URL("./play.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (e: MessageEvent<PlayOut>) => { const f = replies.get(e.data.id); replies.delete(e.data.id); f?.(e.data); };
      void ask({ type: "load" }).then(() => {
        if (!alive) return;
        put({ started: true, phase: "you", sans: sansOf() });
        if (!yourTurn()) void next();
      });
    },
    setOpp(o) { if (o === state.opp) return; put({ opp: o }); void reset(); },
    setWhite(w) { if (w === state.white) return; put({ white: w }); void reset(); },
    again() { void reset(); },
    dispose() {
      alive = false; unStage(); worker?.terminate(); worker = null;
      pin.removeEventListener("pointerdown", onDown); pin.removeEventListener("pointermove", onMove);
      pin.removeEventListener("pointerup", onUp); pin.removeEventListener("pointercancel", onUp);
    },
  };
}
