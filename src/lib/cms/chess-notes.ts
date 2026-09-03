import { OPENING_NODES } from "@/content/opening";
import type { CmsChessNote } from "@/lib/cms/types";
import { getMainline } from "@/lib/opening/tree";

const CAREER: Record<string, { kind: CmsChessNote["entityKind"]; id: string }> = {
  e4: { kind: "education", id: "monash-beng" },
  nf3: { kind: "experience", id: "petronas" },
  bc4: { kind: "experience", id: "western-digital" },
  oo: { kind: "experience", id: "setel" },
  d4: { kind: "experience", id: "monash-university" },
  re1: { kind: "outlook", id: "" },
};

function projectSlugFromHref(href: string): string {
  const match = href.match(/\/projects\/([a-z0-9-]+)/);
  return match?.[1] ?? "";
}

export function compiledMainlineSans(): string[] {
  return getMainline()
    .filter((node) => node.moveNumber > 0)
    .map((node) => node.san);
}

export function compiledMainlinePgn(): string {
  const parts: string[] = [];
  for (const node of getMainline()) {
    if (!node.color || node.moveNumber === 0) continue;
    if (node.color === "w") parts.push(`${node.moveNumber}. ${node.san}`);
    else parts.push(node.san);
  }
  return parts.join(" ");
}

export function pgnMoveSans(pgn: string): string[] {
  return pgn
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\$\d+/g, " ")
    .replace(/\d+\.+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token && !["*", "1-0", "0-1", "1/2-1/2"].includes(token));
}

export function pgnMatchesRepertoire(pgn: string): boolean {
  const got = pgnMoveSans(pgn);
  const want = compiledMainlineSans();
  if (got.length !== want.length) return false;
  return got.every((san, i) => san === want[i]);
}

export function chessDisplayNotes(doc: {
  chess: CmsChessNote[];
  experience: { id: string; employer: string }[];
  education: { id: string; institution: string }[];
  projects: { slug: string; title: string }[];
}): Record<string, { fact: string; commentary: string; entityLabel: string }> {
  const out: Record<string, { fact: string; commentary: string; entityLabel: string }> = {};
  for (const note of doc.chess) {
    let entityLabel = "";
    if (note.entityKind === "experience") {
      const row = doc.experience.find((item) => item.id === note.entityId);
      entityLabel = row ? `Experience · ${row.employer}` : "";
    } else if (note.entityKind === "education") {
      const row = doc.education.find((item) => item.id === note.entityId);
      entityLabel = row ? `Education · ${row.institution}` : "";
    } else if (note.entityKind === "project") {
      const row = doc.projects.find((item) => item.slug === note.entityId);
      entityLabel = row ? `Project · ${row.title || row.slug}` : "";
    } else if (note.entityKind === "lab") {
      entityLabel = "Lab · learned evaluator";
    } else if (note.entityKind === "outlook") {
      entityLabel = "Outlook";
    }
    out[note.id] = { fact: note.fact, commentary: note.commentary, entityLabel };
  }
  return out;
}

export function ledgerChessNotes(): CmsChessNote[] {
  const featured = new Set(Object.keys(CAREER));
  return OPENING_NODES.map((node) => {
    const career = CAREER[node.id];
    const projectHref = node.artifacts?.find((item) => item.href.startsWith("/projects/"))?.href ?? "";
    const projectId = projectSlugFromHref(projectHref);
    const entityKind = career?.kind || (projectId ? "project" : node.id === "exd4" ? "lab" : "");
    const entityId = career?.id || (entityKind === "lab" ? "learned-evaluator" : projectId);
    return {
      id: node.id,
      fact: node.fact,
      commentary: node.commentary,
      featured: featured.has(node.id),
      entityKind,
      entityId,
    };
  });
}
