import { CLAIMS } from "./claims";
import { FEATURED_SLUGS, PROJECTS } from "./projects";
import type { Claim, Project, ProjectCategory } from "./types";

export function getClaim(id: string): Claim {
  const claim = CLAIMS.find((c) => c.id === id);
  if (!claim) throw new Error(`Unknown claim: ${id}`);
  return claim;
}

export type WorkPath = ProjectCategory;

export function parsePath(v: unknown): WorkPath | null {
  return v === "ml" || v === "product" || v === "devtools" ? v : null;
}

export function featuredProjects(): Project[] {
  return FEATURED_SLUGS.map((slug) => {
    const p = PROJECTS.find((x) => x.slug === slug);
    if (!p) throw new Error(`Featured project missing: ${slug}`);
    return p;
  });
}

export function workFor(path: WorkPath | null): { featured: Project[]; archive: Project[] } {
  const keep = (p: Project) => !path || p.category === path;
  return {
    featured: featuredProjects().filter(keep),
    archive: PROJECTS.filter((p) => p.group === "archive" && keep(p)),
  };
}

export function pathCounts(): Record<"all" | WorkPath, number> {
  const listed = PROJECTS.filter((p) => p.group !== "lab");
  const by = (c: WorkPath) => listed.filter((p) => p.category === c).length;
  return { all: listed.length, ml: by("ml"), product: by("product"), devtools: by("devtools") };
}
