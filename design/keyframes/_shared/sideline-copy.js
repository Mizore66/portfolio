// Copy for the comps, straight from content.json: name, move, result line and its qualifier.
import { SIDELINES } from "./sidelines.js";
export async function copy() {
  const c = await (await fetch("/content/content.json")).json(), claims = Object.fromEntries(c.claims.map((x) => [x.id, x]));
  return SIDELINES.map((s) => { const p = c.projects.list.find((x) => x.slug === s.slug);
    return { ...s, result: p.result.line.replace(/\s*\(.*\)$/, ""), qualifier: claims[p.result.claimId]?.qualifier ?? "", subtitle: p.subtitle, date: p.date }; });
}
export const moveTag = (s) => s.move ? (s.opening ? `${s.move}, ${s.opening}` : s.move) : "No move yet";
