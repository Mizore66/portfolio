// What each part of the site is given, built on the server from content.json: the one page's sections, and the
// full Lab page. (These were the page files of /roles, /work, /lab and /contact before the one page.)
import { content, span, month } from "@/content/site";
import { tables } from "@/content/roles";
import { aside, featured, others } from "@/content/work";
import positions from "@/content/positions.json";
import tree from "@/content/lab-tree.json";
import type { TreeNode } from "@/content/lab-tree.gen";
import type { LabCopy } from "@/components/lab/Lab";
import type { ContactCopy } from "@/components/contact/Contact";

export function heroProps() {
  const [first, ...rest] = content.identity.displayName.split(" ");
  const h = content.identity.heroHeadline, cut = h.indexOf(" survive");
  return { first, last: rest.join(" "), headline: [h.slice(0, cut), h.slice(cut + 1)] };
}

export function rolesProps() {
  const R = content.pageCopy.roles, P = positions as Record<string, { fen: string; last: string[] }>;
  const when = (slug: string) => {
    if (slug === "education") return month(content.education.graduated);
    const r = content.roles.find((x) => x.id === slug)!;
    return span(r.start, r.end);
  };
  return {
    list: tables.map((t) => ({ slug: t.slug, name: t.name, when: when(t.slug), current: t.current, fen: P[t.game.key].fen, last: P[t.game.key].last })),
    copy: { title: R.title, sub: R.sub, now: R.now, label: R.listLabel },
  };
}

/** the result line without its parenthesis: the scoresheet has one line for it (the full line is on the project's page) */
const short = (s: string) => s.replace(/\s*\([^)]*\)\s*$/, "");
export function workProps() {
  const W = content.pageCopy.work;
  return {
    pieces: featured.map((f) => ({ slug: f.slug, name: f.name, square: f.square!, move: f.move!, result: f.result, qualifier: f.claim.qualifier })),
    others: {
      list: others.map((o) => ({ slug: o.slug, name: o.name, square: o.square, move: o.move, result: short(o.result), qualifier: o.claim.qualifier, aside: aside.has(o.slug) })),
      copy: { title: W.othersTitle, label: W.othersLabel, noMove: W.noMove, aside: W.aside },
    },
  };
}

export function labProps(): { copy: LabCopy; tree: TreeNode } {
  const A = (content as unknown as { lab: { article: { gates: { elo: number; err: number; record: string }[] } } }).lab.article;
  const L = (content.pageCopy as unknown as { lab: { open: Record<string, string>; chapters: LabCopy["chapters"]; toChapters: string } }).lab;
  const c = A.gates[1];
  return {
    copy: {
      open: {
        num: `${c.elo < 0 ? "−" : "+"}${Math.abs(c.elo).toFixed(1)}`, pm: `±${c.err} Elo`,
        qualifier: L.open.qualifier, qualifierPhone: L.open.qualifierPhone, lede: L.open.lede, body: L.open.body, voice: L.open.voice,
        share: "30.5%", record: c.record.split("–").map((n, i) => `${n} ${["wins", "draws", "losses"][i]}`).join(" · "),
      },
      chapters: L.chapters, toChapters: L.toChapters,
    },
    tree: tree as TreeNode,
  };
}

export function contactProps(): ContactCopy {
  type Copy = { move: string; yourMove: string; resume: string; copied: string; copyFailed: string; buttons: string[]; clockLabels: string[]; clockZone: string; clockZoneLabel: string };
  const C = (content.pageCopy as unknown as { contact: Copy }).contact;
  const I = content.identity as unknown as { email: string; responseTime: string };
  const U = content.links as unknown as { linkedin: string; github: string };
  return {
    move: C.move, yourMove: C.yourMove, email: I.email, reply: I.responseTime,
    // contact-a's four: Email, LinkedIn, GitHub, Résumé
    links: [
      { label: C.buttons[0], href: `mailto:${I.email}` },
      { label: C.buttons[2], href: U.linkedin, external: true },
      { label: C.buttons[3], href: U.github, external: true },
      { label: C.resume, href: "/resume" },
    ],
    you: C.clockLabels[0], anas: C.clockLabels[1], zone: C.clockZone, zoneLabel: C.clockZoneLabel,
    copy: C.buttons[1], copied: C.copied, copyFailed: C.copyFailed,
  };
}
