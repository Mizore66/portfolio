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
  /** Run opening i where i % shardCount === shardIndex. */
  shardIndex?: number;
  shardCount?: number;
  /** First logical opening index (wraps the suite). */
  startOpeningIndex?: number;
  /** How many new opening pairs to play. Defaults to the suite length. */
  openingCount?: number;
  /** Hard cap on total games in continueMatch. */
  maxGames?: number;
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

export function scoreForA(result: GameRecord["result"], aIsWhite: boolean): number {
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

export function playGame(
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

export function playOpeningPair(
  opening: string[],
  openingIndex: number,
  a: MatchSide,
  b: MatchSide,
  nodes: number,
  maxPly: number,
): GameRecord[] {
  const games: GameRecord[] = [];
  for (let g = 0; g < 2; g++) {
    const aIsWhite = g === 0;
    const white = aIsWhite ? a : b;
    const black = aIsWhite ? b : a;
    const played = playGame(opening, white, black, nodes, maxPly);
    const aScore = scoreForA(played.result, aIsWhite);
    games.push({
      openingIndex,
      aIsWhite,
      result: played.result,
      aScore,
      plies: played.plies,
      nodes: played.nodes,
    });
  }
  return games;
}

function finishReport(
  cfg: MatchConfig,
  id: string,
  games: GameRecord[],
  penta: Pentanomial,
  wdl: { w: number; d: number; l: number },
  startedAt: string,
  t0: number,
  stoppedEarly: boolean,
): MatchReport {
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

function tallyGames(games: GameRecord[]): { penta: Pentanomial; wdl: { w: number; d: number; l: number } } {
  const penta: Pentanomial = emptyPenta();
  const wdl = { w: 0, d: 0, l: 0 };
  const byOpen = new Map<number, GameRecord[]>();
  for (const g of games) {
    const row = byOpen.get(g.openingIndex) ?? [];
    row.push(g);
    byOpen.set(g.openingIndex, row);
  }
  for (const pair of [...byOpen.entries()].sort((a, b) => a[0] - b[0])) {
    const [w, b] = pair[1];
    if (!w || !b) continue;
    addPair(penta, [w.aScore, b.aScore]);
    for (const g of pair[1]) {
      if (g.aScore === 1) wdl.w += 1;
      else if (g.aScore === 0) wdl.l += 1;
      else wdl.d += 1;
    }
  }
  return { penta, wdl };
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
  const start = cfg.startOpeningIndex ?? 0;
  const count = cfg.openingCount ?? openings.length;

  for (let n = 0; n < count; n++) {
    const logical = start + n;
    const suiteIndex = ((logical % openings.length) + openings.length) % openings.length;
    if (cfg.shardCount && cfg.shardCount > 1) {
      const idx = cfg.shardIndex ?? 0;
      if (logical % cfg.shardCount !== idx) continue;
    }
    const pair = playOpeningPair(openings[suiteIndex], logical, cfg.a, cfg.b, cfg.nodes, cfg.maxPly);
    games.push(...pair);
    addPair(penta, [pair[0].aScore, pair[1].aScore]);
    for (const g of pair) {
      if (g.aScore === 1) wdl.w += 1;
      else if (g.aScore === 0) wdl.l += 1;
      else wdl.d += 1;
    }
    if (cfg.sprtStop) {
      const llr = sprtLlr(penta);
      if (llr >= bounds.upper || llr <= bounds.lower) {
        stoppedEarly = true;
        break;
      }
    }
  }

  return finishReport(cfg, id, games, penta, wdl, startedAt, t0, stoppedEarly);
}

/** Continue an existing report, wrapping the suite, until SPRT or maxGames. */
export function continueMatch(cfg: MatchConfig, prior: MatchReport): MatchReport {
  const { id, openings } = suiteByName(cfg.suite);
  const games = [...prior.games];
  const { penta, wdl } = tallyGames(games);
  const bounds = sprtBounds();
  const startedAt = prior.startedAt;
  const t0 = performance.now();
  let stoppedEarly = prior.stoppedEarly;
  const start = games.reduce((max, g) => Math.max(max, g.openingIndex), -1) + 1;
  const maxGames = cfg.maxGames ?? 2000;
  const pairBudget = cfg.openingCount ?? Number.POSITIVE_INFINITY;
  let newPairs = 0;

  while (games.length + 2 <= maxGames && newPairs < pairBudget) {
    const logical = start + newPairs;
    const suiteIndex = ((logical % openings.length) + openings.length) % openings.length;
    if (cfg.shardCount && cfg.shardCount > 1) {
      const idx = cfg.shardIndex ?? 0;
      if (logical % cfg.shardCount !== idx) {
        newPairs += 1;
        continue;
      }
    }
    const pair = playOpeningPair(openings[suiteIndex], logical, cfg.a, cfg.b, cfg.nodes, cfg.maxPly);
    games.push(...pair);
    addPair(penta, [pair[0].aScore, pair[1].aScore]);
    for (const g of pair) {
      if (g.aScore === 1) wdl.w += 1;
      else if (g.aScore === 0) wdl.l += 1;
      else wdl.d += 1;
    }
    newPairs += 1;
    if (cfg.sprtStop) {
      const llr = sprtLlr(penta);
      if (llr >= bounds.upper || llr <= bounds.lower) {
        stoppedEarly = true;
        break;
      }
    }
  }

  const extra = finishReport(cfg, id, games, penta, wdl, startedAt, t0, stoppedEarly);
  return { ...extra, elapsedMs: prior.elapsedMs + extra.elapsedMs };
}

export function mergeReports(parts: MatchReport[]): MatchReport {
  const games = parts.flatMap((p) => p.games).sort(
    (a, b) => a.openingIndex - b.openingIndex || Number(b.aIsWhite) - Number(a.aIsWhite),
  );
  const { penta, wdl } = tallyGames(games);
  const head = parts[0];
  const elo = reportElo(penta, wdl);
  return {
    suiteId: head.suiteId,
    nodes: head.nodes,
    a: head.a,
    b: head.b,
    netId: head.netId,
    games,
    elo,
    sprtLine: formatSprtLine(elo),
    startedAt: parts.map((p) => p.startedAt).sort()[0],
    elapsedMs: Math.max(...parts.map((p) => p.elapsedMs)),
    stoppedEarly: parts.some((p) => p.stoppedEarly),
  };
}
