import type { ProjectCategory } from "./types";

/** Kept apart from index.ts so client components can use it without pulling in all content. */
export type WorkPath = ProjectCategory;

export function parsePath(v: unknown): WorkPath | null {
  return v === "ml" || v === "product" || v === "devtools" ? v : null;
}
