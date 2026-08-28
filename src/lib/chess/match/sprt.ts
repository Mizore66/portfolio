/**
 * Pentanomial SPRT and Elo reporting.
 * H0 = 0 Elo, H1 = +10 Elo, α = β = 0.05. Pair = two color-swapped games.
 */

export const SPRT_ELO0 = 0;
export const SPRT_ELO1 = 10;
export const SPRT_ALPHA = 0.05;
export const SPRT_BETA = 0.05;

/** Pair bins: 0-2, ½-1½, 1-1, 1½-½, 2-0 from engine1's point of view. */
export type Pentanomial = [number, number, number, number, number];

export type EloReport = {
  games: number;
  pairs: number;
  pentanomial: Pentanomial;
  wdl: { w: number; d: number; l: number };
  score: number;
  elo: number;
  eloCi95: [number, number];
  llr: number;
  bounds: { lower: number; upper: number };
  decision: "h0" | "h1" | "inconclusive";
};

const PAIR_POINTS = [0, 0.5, 1, 1.5, 2] as const;

export function emptyPenta(): Pentanomial {
  return [0, 0, 0, 0, 0];
}

export function addPair(penta: Pentanomial, engine1Scores: [number, number]) {
  const sum = engine1Scores[0] + engine1Scores[1];
  const idx = Math.round(sum * 2);
  if (idx < 0 || idx > 4) throw new Error(`bad pair score ${sum}`);
  penta[idx] += 1;
}

export function eloFromScore(score: number): number {
  if (score <= 0) return -Infinity;
  if (score >= 1) return Infinity;
  return -400 * Math.log10(1 / score - 1);
}

function logistic(elo: number): number {
  return 1 / (1 + 10 ** (-elo / 400));
}

/** Pentanomial probabilities under a given Elo, using a draw-ish trinomial split. */
function pentaProbs(elo: number, drawRatio = 0.5): Pentanomial {
  const s = logistic(elo);
  const d = Math.min(2 * Math.min(s, 1 - s), drawRatio);
  const w = s - d / 2;
  const l = 1 - s - d / 2;
  const ww = w * w;
  const wl = 2 * w * l;
  const wd = 2 * w * d;
  const dd = d * d;
  const dl = 2 * d * l;
  const ll = l * l;
  return [
    ll,
    dl,
    dd + wl,
    wd,
    ww,
  ];
}

export function sprtLlr(penta: Pentanomial, elo0 = SPRT_ELO0, elo1 = SPRT_ELO1): number {
  const p0 = pentaProbs(elo0);
  const p1 = pentaProbs(elo1);
  let llr = 0;
  for (let i = 0; i < 5; i++) {
    if (!penta[i]) continue;
    llr += penta[i] * Math.log(Math.max(p1[i], 1e-15) / Math.max(p0[i], 1e-15));
  }
  return llr;
}

export function sprtBounds(alpha = SPRT_ALPHA, beta = SPRT_BETA) {
  return {
    lower: Math.log(beta / (1 - alpha)),
    upper: Math.log((1 - beta) / alpha),
  };
}

export function reportElo(
  penta: Pentanomial,
  wdl: { w: number; d: number; l: number },
): EloReport {
  const pairs = penta[0] + penta[1] + penta[2] + penta[3] + penta[4];
  const games = wdl.w + wdl.d + wdl.l;
  const points = wdl.w + wdl.d * 0.5;
  const score = games ? points / games : 0.5;
  let mean = 0;
  if (pairs) {
    for (let i = 0; i < 5; i++) mean += PAIR_POINTS[i] * penta[i];
    mean /= pairs;
  }
  let varPair = 0;
  if (pairs > 1) {
    for (let i = 0; i < 5; i++) {
      const d = PAIR_POINTS[i] - mean;
      varPair += penta[i] * d * d;
    }
    varPair /= pairs - 1;
  }
  const se = pairs > 0 ? Math.sqrt(varPair / 4 / pairs) : 0;
  const z = 1.96;
  const lo = Math.max(0, Math.min(1, score - z * se));
  const hi = Math.max(0, Math.min(1, score + z * se));
  const elo = finiteElo(eloFromScore(score));
  const bounds = sprtBounds();
  const llr = sprtLlr(penta);
  let decision: EloReport["decision"] = "inconclusive";
  if (llr >= bounds.upper) decision = "h1";
  else if (llr <= bounds.lower) decision = "h0";
  return {
    games,
    pairs,
    pentanomial: [...penta] as Pentanomial,
    wdl: { ...wdl },
    score,
    elo,
    eloCi95: [finiteElo(eloFromScore(lo)), finiteElo(eloFromScore(hi))],
    llr,
    bounds,
    decision,
  };
}

function finiteElo(e: number): number {
  if (!Number.isFinite(e)) return e > 0 ? 999 : -999;
  return e;
}

export function formatSprtLine(r: EloReport): string {
  const ci = `${r.elo >= 0 ? "+" : ""}${r.elo.toFixed(1)} ±${((r.eloCi95[1] - r.eloCi95[0]) / 2).toFixed(1)}`;
  return `sprt: ${ci} Elo, ${r.games} games, LLR ${r.llr.toFixed(2)} (${r.decision})`;
}
