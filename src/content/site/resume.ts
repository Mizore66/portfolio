import { EDUCATION } from "./education";
import { formatMonth, formatPeriod } from "./format";
import { IDENTITY } from "./identity";
import { PROJECTS } from "./projects";
import { ROLES } from "./roles";
import { SKILLS } from "./skills";

/**
 * The one-page résumé (brief §3.7, §4.2), composed from the same content as the site.
 * Experience bullets are the primary résumé's wording from brief §3.3, numbers included;
 * every number is registered in the claims ledger.
 */

const RESUME_BULLETS: Record<string, readonly string[]> = {
  deriv: [
    "Cut customer-support (CX) costs by about 80%, and raised average customer satisfaction from 5/10 to 8/10, by shipping a full-stack customer-support system that proactively resolves user issues.",
    "Built a Go microservice that unifies data from 4–6 internal services into a single response for the customer-support system. It was designed for about 8,000–10,000 requests a day and is now running in staging.",
    "Built and operate Kafka- and API-based ingestion pipelines that handle about 20,000 complex events a day, so they can be reliably analysed downstream.",
    "Built evaluation and debugging harnesses that reproduce failures and capture environment signals, cutting time-to-fix for production failures by about 50%.",
    "Updated the team's Terraform configurations, cutting costs on maintained AWS resources by about 10–30% while scaling existing infrastructure and provisioning new services.",
  ],
  "skribble-lab": [
    "Owned the Xendit payment-gateway integration end to end, from requirements review through production support, enabling 5+ merchants to accept bank transfer, card and e-wallet payments.",
    "Designed and shipped a merchant onboarding module for product and payment setup, and onboarded the primary client, Chung Ling Private High School (CLPHS), which serves 3,000+ students and parents.",
    "Proactively hunted integration breakage and production defects, cutting weekly production errors by about 80%: from 16 of high or medium severity to 3 of low severity.",
  ],
  "monash-university": [
    "Built and independently owned a FastAPI and Neo4j graph service for university regulations, with a self-correcting Text-to-Cypher loop. It improved relational-policy retrieval accuracy by 45% over vector-only search.",
    "Automated university-wide prerequisite and credit-transfer rule resolution through hybrid retrieval: embeddings plus multi-hop graph queries.",
    "Profiled and simplified the reasoning pipeline, distilling it into a graph-logic SLM that halved inference latency (−50%) and surfaced contradictory policy data for administrators.",
  ],
};

const RESUME_ROLE_IDS = ["deriv", "skribble-lab", "monash-university"] as const;
const RESUME_PROJECTS = ["faultline", "gemini-teleportal"] as const;

export type ResumeLink = { label: string; href: string };

export type ResumeData = {
  name: string;
  summary: string;
  contact: ResumeLink[];
  status: string;
  skills: { label: string; items: string }[];
  experience: { heading: string; meta: string; tech: string; bullets: readonly string[] }[];
  projects: { heading: string; meta: string; href: string; bullets: readonly string[] }[];
  education: { heading: string; meta: string; lines: string[] };
  awards: string[];
};

export function resumeData(): ResumeData {
  const host = "anasqumhiyeh.dev";
  return {
    name: IDENTITY.legalName,
    summary: IDENTITY.summary,
    contact: [
      { label: IDENTITY.email, href: `mailto:${IDENTITY.email}` },
      { label: IDENTITY.phone.display, href: `tel:${IDENTITY.phone.tel}` },
      { label: host, href: `https://${host}` },
      { label: "linkedin.com/in/anasqumhiyeh", href: IDENTITY.linkedin },
      { label: "github.com/Mizore66", href: IDENTITY.github },
    ],
    status: `${IDENTITY.location}. ${IDENTITY.status.join(". ")}.`,
    skills: SKILLS.map((g) => ({ label: g.label, items: g.items.join(", ") })),
    experience: RESUME_ROLE_IDS.map((id) => {
      const r = ROLES.find((x) => x.id === id)!;
      return {
        heading: `${r.title}, ${r.employer}`,
        meta: `${formatPeriod(r.start, r.end)} · ${r.kind}`,
        tech: r.tech.join(", "),
        bullets: RESUME_BULLETS[id],
      };
    }),
    projects: RESUME_PROJECTS.map((slug) => {
      const p = PROJECTS.find((x) => x.slug === slug)!;
      return {
        heading: `${p.name}: ${p.subtitle}`,
        meta: `${formatMonth(p.date)} · ${p.origin} · ${p.tech.join(", ")}`,
        href: `https://${host}/projects/${p.slug}`,
        bullets: (p.caseStudy.built ?? []).slice(0, 2),
      };
    }),
    education: {
      heading: `${EDUCATION.degree}, ${EDUCATION.institution}`,
      meta: `Graduated ${formatMonth(EDUCATION.graduated)} · ${EDUCATION.location}`,
      lines: [`${EDUCATION.minor}. WAM ${EDUCATION.wam}, CGPA ${EDUCATION.cgpa}.`],
    },
    awards: [...EDUCATION.honours, "Grand Prize, Solana Megahack 2025 (MirrorFi, team of 6, out of 150+ teams)"],
  };
}
