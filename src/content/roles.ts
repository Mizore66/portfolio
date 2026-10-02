/**
 * The Roles hall (Gate 1, "Simul, in a pale day hall"): seven tables in career order, the six roles and the
 * Monash degree, each playing its own master game (content/chess-games.json). No move is tied to a role or a
 * claim: the games are there to enjoy while reading (decisions.md, Master games).
 */
import { content, claim, prose, span, month, type Claim } from "./site";
import GAMES from "./games.json";
import raw from "../../content/chess-games.json";

/** One ply of a game, derived from content/chess-games.json (design/motion/_games.json, verified in the kept engine). */
export interface GamePly { san: string; from: string; to: string; cap: string | null; rook: [string, string] | null; before: string; after: string }
export interface Game { key: string; title: string; plies: GamePly[]; /** the ply that makes the table's famous position (Gate 2, key frames) */ famous: number; ending: string }

/** The famous position each table stops on, from the approved key frames (design/keyframes/_shared/positions.json). */
const FAMOUS: Record<string, string> = {
  "Paulsen-Morphy": "17…Qxf3", "Rotlewi-Rubinstein": "22…Rxc3", "Nimzowitsch-Tarrasch": "19…Bxh2+", "Nimzowitsch-Alapin": "14. Bf6",
  "Botvinnik-Vidmar": "20. Nxf7", "Byrne-Fischer": "17…Be6", "Tal-Larsen": "16. Nd5",
};

/** "16. Nd5" for ply 30 (0-based); "17…Be6" for a Black ply. */
export const moveLabel = (ply: number, san: string) => `${Math.floor(ply / 2) + 1}${ply % 2 ? "…" : ". "}${san}`;

const SOURCE = GAMES as Record<string, { title: string; plies: GamePly[] }>;
function game(key: string): Game {
  const g = SOURCE[key];
  const famous = g.plies.findIndex((p, i) => moveLabel(i, p.san) === FAMOUS[key]);
  if (famous < 0) throw new Error(`No famous position for ${key}`);
  const src = (raw as unknown as { games: { white: string; black: string; ending: string }[] }).games.find((x) => `${x.white.split(" ").at(-1)}-${x.black.split(" ").at(-1)}` === key)!;
  return { key, title: g.title, plies: g.plies, famous, ending: src.ending };
}

export interface Fact { text: string; big: string | null; qualifier: string | null }
export interface Table {
  slug: string;
  /** the index's short name ("Monash, degree"), and the page's title and line under it */
  name: string; title: string; sub: string;
  current: boolean;
  game: Game;
  facts: Fact[];
}

const R = content.pageCopy.roles;
const words = (s: string) => new Set((s.toLowerCase().match(/[a-z0-9]+/g) ?? []).map((w) => w.replace(/s$/, ""))); // "merchants" meets "merchant"
const overlap = (a: string, b: string) => { const A = words(a), B = words(b); let n = 0; for (const w of A) if (w.length > 3 && B.has(w)) n++; return n; };

/**
 * A role's facts, one per claim: each claim beside the bullet it came from, or its own context where no bullet
 * is left. Claims and bullets are paired by the words they share (the claim's number and its context), the
 * strongest pairs first. Bullets with no claim follow as plain facts.
 */
function facts(bullets: string[], claims: Claim[]): Fact[] {
  const pairs = claims.flatMap((c, ci) => bullets.map((b, bi) => ({ ci, bi, s: overlap(b, `${c.display} ${c.context}`) }))).filter((x) => x.s >= 1).sort((x, y) => y.s - x.s);
  const of = new Map<number, number>(), used = new Set<number>();
  for (const { ci, bi } of pairs) if (!of.has(ci) && !used.has(bi)) { of.set(ci, bi); used.add(bi); }
  const out: Fact[] = claims.map((c, ci) => ({ text: prose(of.has(ci) ? bullets[of.get(ci)!] : c.context), big: prose(c.display), qualifier: c.qualifier }));
  bullets.forEach((b, i) => { if (!used.has(i)) out.push({ text: prose(b), big: null, qualifier: null }); });
  return out;
}

// career order, oldest first: the degree, then each role by its start (decisions.md, Tables)
const GAME_OF: Record<string, string> = {
  education: "Paulsen-Morphy", petronas: "Rotlewi-Rubinstein", "western-digital": "Nimzowitsch-Tarrasch", setel: "Nimzowitsch-Alapin",
  "monash-university": "Botvinnik-Vidmar", "skribble-lab": "Byrne-Fischer", deriv: "Tal-Larsen",
};

const E = content.education;
const degree: Table = {
  slug: "education", name: `Monash, ${R.degree}`, title: E.institution,
  sub: `${prose(E.degree)}, ${R.graduated} ${month(E.graduated)}`,
  current: false, game: game(GAME_OF.education),
  facts: [
    { text: `${prose(E.degree)}. ${prose(E.minor)}.`, big: E.honours[0], qualifier: null },
    { text: `WAM ${E.wam}, CGPA ${E.cgpa}.`, big: E.honours[1], qualifier: null },
    { text: `${E.institution}, ${E.location}.`, big: E.honours[2], qualifier: null },
  ],
};

const roleTables: Table[] = [...content.roles].sort((a, b) => a.start.localeCompare(b.start)).map((r) => ({
  slug: r.id,
  name: r.employer === E.institution ? `Monash, ${R.contract}` : r.employer,
  title: r.employer,
  sub: `${r.title}, ${span(r.start, r.end)}`,
  current: !r.end,
  game: game(GAME_OF[r.id]),
  facts: facts(r.bullets, r.claimIds.map(claim)),
}));

export const tables: Table[] = [degree, ...roleTables];
export const tableBy = (slug: string) => tables.find((t) => t.slug === slug);
