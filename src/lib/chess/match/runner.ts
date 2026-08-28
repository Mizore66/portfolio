import {
  configureEngine,
  gameOutcome,
  legalPlies,
  playPly,
  playUci,
  positionKey,
  searchMove,
  startPos,
  type EvalMode,
} from "@/lib/chess/engine";
import type { NnueNet } from "@/lib/chess/nnue/types";
import { suiteByName } from "./openings";
import { addPair, emptyPenta, formatSprtLine, reportElo, sprtBounds, sprtLlr, type EloReport, type Pentanomial } from "./sprt";

export type MatchSide = {
  evalMode: EvalMode;
  net?: NnueNet | null;
};

export type MatchConfig = {
  a: MatchSide;
  b: MatchSide;
  nodes: number;
  suite: string;
  maxPly: number;
  /** Stop when SPRT LLR hits a bound (H0=0, H1=+10). Full suite still runs if inconclusive. */
  sprtStop?: boolean;
};

export type GameRecord = {
  openingIndex: number;
  aIsWhite: boolean;
  result: "1-0" | "0-1" | "1/2-1/2";
  aScore: number;
  plies: number;
  nodes: number;
};

export type MatchReport = {
  suiteId: string;
  nodes: number;
  a: EvalMode;
  b: EvalMode;
  netId: string | null;
  games: GameRecord[];
  elo: EloReport;
  sprtLine: string;
  startedAt: string;
  elapsedMs: number;
  stoppedEarly: boolean;
};

function scoreForA(result: GameRecord["result"], aIsWhite: boolean): number {
  if (result === "1/2-1/2") return 0.5;
  if (result === "1-0") return aIsWhite ? 1 : 0;
  return aIsWhite ? 0 : 1;
}

function applyOpening(uci: string[]) {
  const pos = startPos();
  for (const u of uci) {
    if (!playUci(pos, u)) throw new Error(`illegal opening move ${u}`);
  }
  return pos;
}

function playGame(
  opening: string[],
  white: MatchSide,
  black: MatchSide,
  nodes: number,
  maxPly: number,
): { result: GameRecord["result"]; plies: number; nodes: number } {
  const pos = applyOpening(opening);
  const seen: number[] = [];
  let used = 0;
  for (let ply = 0; ply < maxPly; ply++) {
    const term = gameOutcome(pos);
    if (term) return { result: term, plies: ply, nodes: used };
    const k = positionKey(pos);
    seen.push(k);
    if (seen.filter((x) => x === k).length >= 3) {
      return { result: "1/2-1/2", plies: ply, nodes: used };
    }
    const side = pos.side === 1 ? white : black;
    configureEngine({ evalMode: side.evalMode, net: side.net ?? null });
    const move = searchMove(pos, { nodes, evalMode: side.evalMode, net: side.net ?? null });
    used += move.nodes;
    let ok = Boolean(move.best && playPly(pos, move.best));
    if (!ok) {
      const fb = legalPlies(pos)[0];
      ok = Boolean(fb && playPly(pos, fb));
    }
    if (!ok) {
      return { result: gameOutcome(pos) ?? "1/2-1/2", plies: ply, nodes: used };
    }
  }
  return { result: "1/2-1/2", plies: maxPly, nodes: used };
}

export function runMatch(cfg: MatchConfig): MatchReport {
  const startedAt = new Date().toISOString();
  const t0 = performance.now();
  const { id, openings } = suiteByName(cfg.suite);
  const games: GameRecord[] = [];
  const penta: Pentanomial = emptyPenta();
  const wdl = { w: 0, d: 0, l: 0 };
  const bounds = sprtBounds();
  let stoppedEarly = false;

  for (let i = 0; i < openings.length; i++) {
    const pairScores: [number, number] = [0, 0];
    for (let g = 0; g < 2; g++) {
      const aIsWhite = g === 0;
      const white = aIsWhite ? cfg.a : cfg.b;
      const black = aIsWhite ? cfg.b : cfg.a;
      const played = playGame(openings[i], white, black, cfg.nodes, cfg.maxPly);
      const aScore = scoreForA(played.result, aIsWhite);
      pairScores[g] = aScore;
      if (aScore === 1) wdl.w += 1;
      else if (aScore === 0) wdl.l += 1;
      else wdl.d += 1;
      games.push({
        openingIndex: i,
        aIsWhite,
        result: played.result,
        aScore,
        plies: played.plies,
        nodes: played.nodes,
      });
    }
    addPair(penta, pairScores);
    if (cfg.sprtStop) {
      const llr = sprtLlr(penta);
      if (llr >= bounds.upper || llr <= bounds.lower) {
        stoppedEarly = true;
        break;
      }
    }
  }

  configureEngine({ evalMode: "handcrafted", net: null });
  const elo = reportElo(penta, wdl);
  return {
    suiteId: id,
    nodes: cfg.nodes,
    a: cfg.a.evalMode,
    b: cfg.b.evalMode,
    netId: cfg.a.net?.id ?? cfg.b.net?.id ?? null,
    games,
    elo,
    sprtLine: formatSprtLine(elo),
    startedAt,
    elapsedMs: Math.round(performance.now() - t0),
    stoppedEarly,
  };
}
