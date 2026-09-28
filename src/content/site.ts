/**
 * Typed access to content/content.json, the single source of site copy and data.
 * Formatting rules that apply everywhere live here too (see design/decisions.md, Gate 1).
 */
import raw from "../../content/content.json";

export interface Claim {
  id: string;
  display: string;
  type: string;
  owner: string;
  date: string;
  context: string;
  qualifier: string;
}

export interface Role {
  id: string;
  employer: string;
  title: string;
  kind: string;
  start: string;
  end: string | null;
  tech: string[];
  bullets: string[];
  claimIds: string[];
  earlier: boolean;
}

export interface Project {
  slug: string;
  name: string;
  subtitle: string;
  date: string;
  origin: string;
  category: string;
  group: string;
  repo?: string;
  tech: string[];
  purpose: string;
  result: { claimId: string; line: string };
  /** product screenshots, shown as captioned evidence near the end of the case study */
  media?: { src: string; width: number; height: number; alt: string; caption: string }[];
  caseStudy?: {
    evidence?: string[]; team?: string; draft?: boolean; notes?: string[];
    problem?: string; decision?: string; constraint?: string; example?: string; rejected?: string;
    built?: string[]; limitations?: string; changeNow?: string;
  };
  architecture?: { host?: string; path: Step[]; branches?: (Step & { from?: number })[]; beside?: Step[] };
}

export interface Step { label: string; note?: string }

export interface CareerNode { nodeId: string; move: string; evalCp: number; kind: string; label: string; start: string; end: string | null; href: string }

interface Content {
  identity: { legalName: string; displayName: string; heroHeadline: string; summary: string; availability: string };
  education: { institution: string; location: string; degree: string; minor: string; graduated: string; honours: string[]; wam: string; cgpa: string };
  roles: Role[];
  roleNotes: Record<string, string>;
  skills: { label: string; items: string[] }[];
  claims: Claim[];
  projects: { featuredOrder: string[]; categoryLabels: Record<string, string>; notes: Record<string, string>; list: Project[] };
  resume: { name: string; summary: string; status: string; pdfFilename: string; contact: { label: string; href: string }[]; awards: string[] };
  chess: { careerTimeline: CareerNode[] };
  pageCopy: { projectPageSections: Record<string, string>; work: { othersTitle: string; othersLabel: string; noMove: string; aside: string }; roles: Record<"title" | "sub" | "degree" | "contract" | "now" | "listLabel" | "graduated" | "next" | "back" | "start", string> };
  links: { email: string; linkedin: string; github: string; site: string; privateRepos: string[]; repos?: Record<string, string> };
  metadata: { siteTitle: string; siteDescription: string };
}

export const content = raw as unknown as Content;

const CLAIMS = new Map(content.claims.map((c) => [c.id, c]));
export const claim = (id: string): Claim => {
  const c = CLAIMS.get(id);
  if (!c) throw new Error(`Unknown claim ${id}`);
  return c;
};

/**
 * House copy rules: ranges use a hyphen ("1-5 min", "Feb-Dec 2025"); em dashes are replaced by a
 * comma or colon. True minus signs (−143.3) are a different character and are left alone.
 */
export function prose(s: string): string {
  return s
    .replace(/\s+—\s+/g, ", ")
    .replace(/—/g, ": ")
    .replace(/\s*–\s*/g, "-");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-06" → "Jun 2026". */
export function month(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

/** "Jun 2026 - now", "Feb - Dec 2025" (year once when both ends share it). */
export function span(start: string, end: string | null): string {
  if (!end) return `${month(start)} - now`;
  const [sy] = start.split("-"), [ey] = end.split("-");
  if (start === end) return month(start);
  return sy === ey ? `${month(start).slice(0, 3)} - ${month(end)}` : `${month(start)} - ${month(end)}`;
}
