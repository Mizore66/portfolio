/** The one page's section in view ("top", "roles", "work", "lab", "contact"), for the nav's underline. */
let current = "top";
const subs = new Set<() => void>();
export const section = {
  get: () => current,
  server: () => "top",
  sub(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
  set(s: string) { if (s !== current) { current = s; subs.forEach((f) => f()); } },
};
