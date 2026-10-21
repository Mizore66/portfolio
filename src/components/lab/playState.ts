// Play's state (game.ts holds the game): what its controls render from, apart from the engine, so the page's first
// load carries only this and the engine comes after the first paint (Play.tsx), or with the opening list.
import type { EvalMode } from "@/lib/chess/engine";
import type { Ply } from "@/lib/opening/types";
import type { DrawBy } from "@/lib/chess/draws";
import DATA from "@/content/lab-data.json";
import { share } from "@/lib/motion/ease";

export type Phase = "idle" | "loading" | "you" | "thinking" | "won" | "lost" | "drawn";
export interface PlayState {
  opp: EvalMode; white: boolean; started: boolean; phase: Phase;
  sans: string[];
  /** the opponent's evaluator on the position: centipawns from White's view, and its best move for the side to move */
  cp: number; best: string;
  /** the learned net's score, which the seam follows (White's view) */
  seamCp: number;
  /** how a drawn game was drawn */
  why: "stalemate" | DrawBy | null;
  /** the opening the game starts from, null for the start position */
  opening: Opening | null;
  /** the opening search: open, what has been typed, what it finds, the one the arrow keys are on */
  picking: boolean; query: string; hits: Opening[]; active: number;
}

/** A named opening (Lichess's list, CC0): its ECO code, its name, its moves, and each evaluator's score of where it
 * ends (50,000 nodes, White's view) with the move it would play there (scripts/openings.ts); `last`, its last move as
 * the moves line writes it ("6. Bg5"), which tells apart lines filed under one name. */
export interface Opening { eco: string; name: string; plies: Ply[]; last: string; scores: Record<EvalMode, { cp: number; best: string }> }

export const HOME: Ply[] = [];
export const known = (opp: EvalMode) => { const d = DATA.start[opp]; return { cp: d.evalCp, best: d.best }; };
export const START_CP = DATA.start.learned.evalCp;

let state: PlayState = { opp: "learned", white: true, started: false, phase: "idle", sans: [], cp: known("learned").cp, best: known("learned").best, seamCp: START_CP, why: null, opening: null, picking: false, query: "", hits: [], active: 0 };
const subs = new Set<() => void>();
export const put = (s: Partial<PlayState>) => { state = { ...state, ...s }; subs.forEach((f) => f()); };
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

/**
 * The opening search. The list (`public/engine/openings.json`: ECO, name, moves, scores) is fetched the first time the search
 * opens. A line matches when every word typed is in its name or is its ECO code; the shortest names come first, so
 * "sicilian" finds the Sicilian Defense before its variations, and under one name the shortest line.
 */
let openings: Promise<Opening[]> | null = null;
// the engine comes with the list (it names each line's last move), not with the page
const load = () => (openings ??= Promise.all([fetch("/engine/openings.json").then((r) => r.json()), import("./game")]).then(([rows, { lastMove }]: [[string, string, string, number, string, number, string][], typeof import("./game")]) =>
  rows.map(([eco, name, line, lc, lb, hc, hb]) => {
    const plies = line.split(" ").map((m) => ({ from: m.slice(0, 2), to: m.slice(2, 4) }));
    return { eco, name, plies, last: lastMove(plies), scores: { learned: { cp: lc, best: lb }, handcrafted: { cp: hc, best: hb } } };
  })));
export const HITS = 6;
/** nothing typed yet: five of the openings played most, each as its main line (the shortest under its name) */
const FIRST = ["Sicilian Defense", "French Defense", "Caro-Kann Defense", "Italian Game", "Queen's Gambit"];
export function findOpenings(list: Opening[], query: string): Opening[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return FIRST.map((n) => list.filter((o) => o.name === n).sort((a, b) => a.plies.length - b.plies.length)[0]).filter(Boolean);
  return list.filter((o) => { const n = o.name.toLowerCase(); return words.every((w) => n.includes(w) || o.eco.toLowerCase() === w); })
    .sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name) || a.plies.length - b.plies.length).slice(0, HITS);
}
export const picker = {
  open() { put({ picking: true, query: "", active: 0 }); void load().then((l) => { if (state.picking) put({ hits: findOpenings(l, state.query) }); }); },
  close() { put({ picking: false, query: "", hits: [], active: 0 }); },
  type(q: string) { put({ query: q, active: 0 }); void load().then((l) => { if (state.query === q) put({ hits: findOpenings(l, q) }); }); },
  step(d: number, n: number) { if (n) put({ active: (state.active + d + n) % n }); },
};
