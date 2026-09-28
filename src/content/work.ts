/**
 * The three featured projects as the Work room shows them: each stands on the square its move landed on
 * in the career line (content.json chess.careerTimeline), and its page rests the seam at that move's eval.
 */
import { content, claim, prose, month, type Claim, type Project } from "./site";

export interface Featured {
  project: Project;
  slug: string;
  name: string;
  /** "Solo, Jul 2026" */
  meta: string;
  subtitle: string;
  /** the move, its square and the engine's eval after it (centipawns, White's view) */
  move: string; square: string; cp: number;
  /** the one number, as its claim, and the line under it */
  claim: Claim; result: string;
  /** the move's annotation, in italic: voice, not fact (content/voice.md) */
  note: { text: string; draft: boolean } | null;
}

// content/voice.md, "Work, told through moves". Drafts are agent-written and still flagged for the owner.
const NOTES: Record<string, Featured["note"]> = {
  faultline: { text: "The bishop pins the knight and waits. FaultLine does the same with a regression: it holds one question still until the history answers it.", draft: true },
  "gemini-teleportal": { text: "Teleportal was built with Kai, and the square only held because both of us covered it.", draft: true },
  circuitmindai: { text: "CircuitMind sees faults in the copper and talks back over a live voice channel.", draft: false },
};

export const featured: Featured[] = content.projects.featuredOrder.map((slug) => {
  const p = content.projects.list.find((x) => x.slug === slug)!;
  const node = content.chess.careerTimeline.find((n) => n.kind === "project" && n.label === p.name);
  if (!node) throw new Error(`No career move for ${p.name}`);
  const square = node.move.match(/[a-h][1-8]/g)!.at(-1)!;
  return {
    project: p, slug, name: p.name, subtitle: p.subtitle,
    meta: `${p.origin}, ${month(p.date)}`,
    move: node.move, square, cp: node.evalCp,
    claim: claim(p.result.claimId), result: prose(p.result.line),
    note: NOTES[slug] ?? null,
  };
});

export const featuredBy = (slug: string) => featured.find((f) => f.slug === slug);

/** "+0.64", "−0.18" (a true minus sign). */
export const evalLabel = (cp: number) => `${cp < 0 ? "−" : "+"}${(Math.abs(cp) / 100).toFixed(2)}`;
