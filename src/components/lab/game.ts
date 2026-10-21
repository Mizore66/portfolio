/**
 * Play (motion.md §12): the game behind the board. One controller per page owns the position, the worker and the
 * hand on the board; the two copies of the controls (ink and paper) read the same store.get(). The game starts from the
 * start position (the owner's choice at the Lab gate, over the key frame's Italian), with both evaluators' scores
 * of it already known (lab-data.json, start).
 */
import { legalPlies, playPly, sanOf, startPos, rowsOf, gameOutcome, type EnginePos, type EvalMode } from "@/lib/chess/engine";
import type { Ply } from "@/lib/opening/types";
import { HOME, START_CP, known, put, store, type Opening, type Phase, type PlayState } from "./playState";
import { drawBy } from "@/lib/chess/draws";
import type { PlayStage } from "./ch7";
import { playStage } from "./playStage";
import { cue } from "@/lib/sound/sound";
import type { PlayIn, PlayOut } from "./play.worker";

const HAND = 280, DROP = 200, BACK = 250, RESET = 600;

/** Mount the game on the page (the ink copy of the controls calls this); returns the teardown. */
export function mountPlay(pin: HTMLElement, reduced: boolean): { start(): void; setOpp(o: EvalMode): void; setWhite(w: boolean): void; again(): void; setOpening(o: Opening | null): void; dispose(): void } {
  let pos: EnginePos = startPos(), plies: Ply[] = [], stage: PlayStage | null = null, worker: Worker | null = null;
  let id = 0, game = 0, alive = true, from: string | null = null, dragging = false, down: { x: number; y: number } | null = null, busy = false, sliding = false;
  const replies = new Map<number, (m: PlayOut) => void>();
  const ms = (t: number) => (reduced ? 0 : t);

  const home = () => { pos = startPos(); plies = []; for (const p of store.get().opening?.plies ?? HOME) { playPly(pos, p); plies.push(p); } };
  const sansOf = () => { const q = startPos(); return plies.map((p) => { const s = sanOf(q, p); playPly(q, p); return s; }); };
  const yourTurn = () => (pos.side === 1) === store.get().white;
  const draw = (last = true) => stage?.set(rowsOf(pos), last && plies.length ? [plies.at(-1)!.from, plies.at(-1)!.to] : null);
  home();

  // a move as a hand plays it; castling carries the rook too (the redraw after it settles en passant and promotion)
  const hand = (p: Ply, t: number) => {
    const k = rowsOf(pos).split("/")[8 - +p.from[1]]["abcdefgh".indexOf(p.from[0])].toUpperCase() === "K", d = p.to.charCodeAt(0) - p.from.charCodeAt(0);
    const rook = k && Math.abs(d) === 2 ? stage?.move((d > 0 ? "h" : "a") + p.from[1], (d > 0 ? "f" : "d") + p.from[1], ms(t)) : undefined;
    return Promise.all([stage?.move(p.from, p.to, ms(t)), rook]).then(() => cue("place"));
  };
  const ask = (m: PlayIn extends infer T ? T extends PlayIn ? Omit<T, "id"> : never : never) => new Promise<PlayOut>((res) => {
    const n = ++id; replies.set(n, res);
    // the engine does not think while the tab is hidden
    const go = () => { if (document.hidden) { document.addEventListener("visibilitychange", go, { once: true }); return; } worker?.postMessage({ ...m, id: n } as PlayIn); };
    go();
  });
  // mate and stalemate first: a mate on the move that would also draw still wins
  const over = (): { phase: Phase; why: PlayState["why"] } | null => {
    const o = gameOutcome(pos);
    if (o === "1/2-1/2") return { phase: "drawn", why: "stalemate" };
    if (o) return { phase: (o === "1-0") === store.get().white ? "won" : "lost", why: null };
    const d = drawBy(plies);
    return d ? { phase: "drawn", why: d } : null;
  };

  // after your move: the engine thinks and plays, and the board is yours again as soon as its move lands. Its own
  // search has already scored the position and named your best reply (the second move of its line), so nothing waits
  // on a second search; one runs behind only where the seam needs the learned net's view or the line was too short.
  const next = async () => {
    const end = over();
    if (end) { put({ ...end, sans: sansOf() }); return; }
    if (yourTurn()) { put({ phase: "you", sans: sansOf() }); return; }
    const mode = store.get().opp, g = game, live = () => alive && g === game; // a reset makes whatever comes back stale
    put({ phase: "thinking", sans: sansOf() });
    const r = await ask({ type: "think", plies, mode });
    if (!live() || r.type !== "thought" || !r.best) return;
    if (mode === "learned") { put({ seamCp: r.cp }); stage?.eval(r.cp); }
    busy = true; await hand(r.best, HAND); busy = false;
    if (!live()) return;
    playPly(pos, r.best); plies.push(r.best); draw();
    const done = over();
    if (done) { put({ ...done, sans: sansOf() }); return; }
    const reply = r.pv[1] ?? "";
    put({ phase: "you", sans: sansOf(), cp: r.cp, best: reply });
    if (mode !== "learned") void behind("learned", (x) => { put({ seamCp: x.cp }); stage?.eval(x.cp); });
    if (!reply) void behind(mode, (x) => put({ cp: x.cp, best: x.san ?? "" }));
  };
  // a search for the position on the board that the visitor need not wait for; dropped if a move or a reset beats it
  const behind = async (mode: EvalMode, apply: (r: Extract<PlayOut, { type: "thought" }>) => void) => {
    const g = game, n = plies.length, r = await ask({ type: "think", plies, mode });
    if (alive && g === game && plies.length === n && store.get().phase === "you" && r.type === "thought") apply(r);
  };

  // once the engine runs, it moves first if it is to play (as Black at the start, or after an opening)
  const scoreOrPlay = () => { if (!yourTurn()) void next(); };

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
    if (!stage || busy || store.get().phase !== "you" || e.button > 0) return;
    const p = at(e), sq = stage.pick(p.x, p.y); if (!sq) { if (from) lift(null); return; }
    if (from && targets(from).includes(sq)) { void play(sq, HAND); return; }
    if (!mine(sq)) { if (from) lift(null); return; }
    lift(sq); down = p; dragging = false; pin.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!down || !from || !stage) { pin.style.cursor = stage && store.get().phase === "you" ? (() => { const p = at(e), sq = stage.pick(p.x, p.y); return sq && (mine(sq) || (from && targets(from).includes(sq))) ? "pointer" : ""; })() : ""; return; }
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
  const unStage = playStage.on((s) => { stage = s; if (s) { s.orient(store.get().white); draw(); s.eval(store.get().seamCp); } });

  // switching opponent or side slides the pieces home and starts over (600 ms, seam, 10 ms stagger)
  const reset = async () => {
    const g = ++game; from = null; busy = sliding = true; stage?.lift(null, [], []); home();
    // the moves, the scores and the seam change at once, the pieces follow. The position's scores are known ahead:
    // the start's (lab-data.json), or the opening's (scripts/openings.ts)
    const o = store.get().opening, k = o ? o.scores[store.get().opp] : known(store.get().opp), seamCp = o ? o.scores.learned.cp : START_CP;
    put({ sans: sansOf(), cp: k.cp, best: k.best, seamCp, why: null, phase: store.get().started ? "you" : "idle" }); // the board answers once the pieces are home (busy)
    stage?.eval(seamCp);
    stage?.orient(store.get().white);
    await stage?.slide(rowsOf(pos), null, ms(RESET));
    if (g !== game) return;
    busy = sliding = false;
    if (store.get().started) scoreOrPlay();
  };

  return {
    start() {
      if (store.get().started || store.get().phase === "loading") return;
      put({ phase: "loading" });
      worker = new Worker(new URL("./play.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (e: MessageEvent<PlayOut>) => { const f = replies.get(e.data.id); replies.delete(e.data.id); f?.(e.data); };
      void ask({ type: "load" }).then(() => {
        if (!alive) return;
        put({ started: true, phase: "you", sans: sansOf() });
        if (!sliding) scoreOrPlay(); // a slide home still under way does this when it lands
      });
    },
    setOpp(o) { if (o === store.get().opp) return; put({ opp: o }); void reset(); },
    setWhite(w) { if (w === store.get().white) return; put({ white: w }); void reset(); },
    again() { void reset(); },
    setOpening(o) { if (o === store.get().opening) return; put({ opening: o, picking: false, query: "" }); void reset(); },
    dispose() {
      alive = false; unStage(); worker?.terminate(); worker = null;
      pin.removeEventListener("pointerdown", onDown); pin.removeEventListener("pointermove", onMove);
      pin.removeEventListener("pointerup", onUp); pin.removeEventListener("pointercancel", onUp);
    },
  };
}

/** a line's last move as the moves line writes it ("6. Bg5", "6… e6"): what tells apart lines filed under one name */
export function lastMove(plies: Ply[]): string {
  const q = startPos(); let san = "";
  plies.forEach((p) => { san = sanOf(q, p); playPly(q, p); });
  const n = plies.length;
  return n ? `${Math.ceil(n / 2)}${n % 2 ? "." : "…"} ${san}` : "";
}
