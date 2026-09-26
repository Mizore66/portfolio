import { CAREER_EVALS } from "./career-evals";
import { EDUCATION } from "./education";
import { GAME } from "./game";
import { moveLabel } from "./game-tree";
import { PROJECTS } from "./projects";
import { ROLES } from "./roles";

export type CareerPoint = {
  nodeId: string;
  kind: "role" | "project" | "education";
  label: string;
  move: string;
  /** YYYY-MM */
  start: string;
  /** YYYY-MM, or null while ongoing. Equal to start for a single point in time. */
  end: string | null;
  /** Where the chapter lives on the front page. */
  href: string;
  /** White's view, centipawns, from the vendored engine's handcrafted evaluation. */
  evalCp: number;
};

export { CAREER_EVAL_NODES } from "./career-evals";

function engineEval(nodeId: string): number {
  const cp = CAREER_EVALS[nodeId];
  if (cp === undefined) throw new Error(`No stored career eval for "${nodeId}"; see career-evals.ts`);
  return cp;
}

let cache: CareerPoint[] | null = null;

function computed(): CareerPoint[] {
  if (cache) return cache;
  cache = GAME.flatMap((n): CareerPoint[] => {
    const c = n.career;
    if (!c) return [];
    const base = { nodeId: n.id, move: moveLabel(n), evalCp: engineEval(n.id) };
    if (c.kind === "role") {
      const r = ROLES.find((x) => x.id === c.roleId)!;
      return [{ ...base, kind: "role" as const, label: r.employer, start: r.start, href: `/#${r.id}`, end: r.end }];
    }
    if (c.kind === "project") {
      const p = PROJECTS.find((x) => x.slug === c.slug)!;
      const href = p.group === "lab" ? `/projects/${p.slug}` : `/#${p.slug}`;
      return [{ ...base, kind: "project" as const, label: p.name, start: p.date, end: p.date, href }];
    }
    return [{ ...base, kind: "education" as const, label: "Graduation", start: EDUCATION.graduated, end: EDUCATION.graduated, href: "/#education" }];
  });
  return cache;
}

/** Roles and projects placed in real time, oldest first (brief §7 B). */
export function careerPoints(): CareerPoint[] {
  return [...computed()].sort((a, b) => a.start.localeCompare(b.start));
}
