export type EvidenceType =
  | "production"
  | "controlled-evaluation"
  | "controlled-benchmark"
  | "capacity-benchmark"
  | "capability"
  | "award";

export const EVIDENCE_LABEL: Record<EvidenceType, string> = {
  production: "Production",
  "controlled-evaluation": "Controlled evaluation",
  "controlled-benchmark": "Controlled benchmark",
  "capacity-benchmark": "Capacity benchmark",
  capability: "Capability",
  award: "Award",
};

export type Claim = {
  id: string;
  display: string;
  type: EvidenceType;
  owner: string;
  /** YYYY, YYYY-MM or YYYY-MM-DD */
  date: string;
  context: string;
  methodNotes?: string;
};

export type Identity = {
  legalName: string;
  displayName: string;
  currentRole: { title: string; employer: string; since: string };
  heroHeadline: string;
  heroSubline: string;
  summary: string;
  availability: string;
  contactHeading: string;
  location: string;
  status: readonly string[];
  responseTime: string;
  email: string;
  phone: { display: string; tel: string };
  linkedin: string;
  github: string;
  about: readonly string[];
};

export type RoleKind = "Full-time" | "Contract" | "Internship";

export type Role = {
  /** Fragment id on the front page, e.g. "deriv". */
  id: string;
  employer: string;
  title: string;
  kind: RoleKind;
  /** YYYY-MM */
  start: string;
  /** YYYY-MM, or null for the current role */
  end: string | null;
  tech: readonly string[];
  scope?: string;
  bullets: readonly string[];
  claimIds: readonly string[];
  /** Factual note printed under the claims (e.g. the +45% / +35% split). */
  note?: string;
  /** Voice: rendered in Literata Italic. */
  annotation?: string;
  /** Condensed under "Earlier experience". */
  earlier: boolean;
};

export type Education = {
  institution: string;
  location: string;
  degree: string;
  minor: string;
  /** YYYY-MM */
  graduated: string;
  honours: readonly string[];
  wam: string;
  cgpa: string;
};

export type SkillGroup = { label: string; items: readonly string[] };

export type ProjectCategory = "ml" | "product" | "devtools";
export type ProjectGroup = "featured" | "archive" | "lab";

export type Project = {
  slug: string;
  name: string;
  subtitle: string;
  /** YYYY-MM */
  date: string;
  /** "Solo", "Built with Kai", "Hackathon team of 6", "Lab experiment" */
  origin: string;
  category: ProjectCategory;
  group: ProjectGroup;
  repo?: string;
  tech: readonly string[];
  purpose: string;
  result: { claimId?: string; line: string };
  seo: { title: string; description: string };
};
