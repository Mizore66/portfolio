/**
 * The projects as the Work room shows them. Each stands on the square its move landed on in the career
 * game (content.json chess.careerTimeline), and its page rests the seam at that move's eval. The three
 * featured projects stand in the gallery; the other seven on the second board below it (step 4a, comp A).
 */
import { content, claim, prose, month, type Claim, type Project } from "./site";

export interface Entry {
  project: Project;
  slug: string;
  name: string;
  /** "Solo, Jul 2026" */
  meta: string;
  subtitle: string;
  /** the move and its square, or null for a project with no move yet (RexCheck) */
  move: string | null; square: string | null;
  /** the engine's eval after the move (centipawns, White's view); 0 with no move */
  cp: number;
  /** the one number, as its claim, and the line under it */
  claim: Claim; result: string;
  featured: boolean;
}

function entry(p: Project, featured: boolean): Entry {
  const node = content.chess.careerTimeline.find((n) => n.kind === "project" && n.label === p.name);
  if (!node && featured) throw new Error(`No career move for ${p.name}`);
  return {
    project: p, slug: p.slug, name: p.name, subtitle: p.subtitle,
    meta: `${p.origin}, ${month(p.date)}`,
    move: node?.move ?? null, square: node?.move.match(/[a-h][1-8]/g)!.at(-1) ?? null, cp: node?.evalCp ?? 0,
    claim: claim(p.result.claimId), result: prose(p.result.line),
    featured,
  };
}

/** Scoresheet order: by move number, White's move before Black's ("5. d4" before "5…Bb6"). */
// Two lines at the same move (5…Bb6, 5…d6) keep the career game's order.
const order = (e: Entry) => {
  const m = e.move?.match(/^(\d+)(\.|…)/);
  return m ? (Number(m[1]) * 2 + (m[2] === "…" ? 1 : 0)) * 100 + content.chess.careerTimeline.findIndex((n) => n.move === e.move) : Infinity;
};

export const featured: Entry[] = content.projects.featuredOrder.map((slug) => entry(content.projects.list.find((x) => x.slug === slug)!, true));
/** The seven others, in the order their moves were played (the scoresheet); a project with no move comes last. */
export const others: Entry[] = content.projects.list
  .filter((p) => !content.projects.featuredOrder.includes(p.slug))
  .map((p) => entry(p, false))
  .sort((a, b) => order(a) - order(b));
export const entries = [...featured, ...others];

export const entryBy = (slug: string) => entries.find((e) => e.slug === slug);
export const featuredBy = (slug: string) => featured.find((f) => f.slug === slug);

/**
 * The second board shows the position after 5. d4 with every other line's move laid on it at once. A move
 * that lands on a square already taken there belongs to another game (1…Nf6 is Alekhine's Defence, and f6 is
 * MirrorFi's); it stands aside behind rank 8, beside the project with no move yet.
 */
export const aside = (() => {
  const taken = new Set<string>(), out = new Set<string>();
  for (const e of [...others].sort((a, b) => (b.square ? 1 : 0) - (a.square ? 1 : 0) || order(b) - order(a))) {
    if (!e.square || taken.has(e.square)) out.add(e.slug); else taken.add(e.square);
  }
  return out;
})();

/** "+0.64", "−0.18" (a true minus sign). */
export const evalLabel = (cp: number) => `${cp < 0 ? "−" : "+"}${(Math.abs(cp) / 100).toFixed(2)}`;
