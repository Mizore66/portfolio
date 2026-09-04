export const CMS_TAG = "cms";
export const SITE_REVISED = "2026-09-03T00:00:00.000Z";

export type ClaimKind = "production" | "benchmark" | "evaluation" | "pipeline" | "capability";

export type CmsClaim = {
  id: string;
  display: string;
  value: string;
  unit: string;
  kind: ClaimKind;
  owner: string;
  method: string;
  baseline: string;
  sample: string;
  environment: string;
  date: string;
  caveat: string;
  denominator: string;
  source: string;
  sourceUrl: string;
  linkedProject: string;
  mediaPathname: string;
  heroEligible: boolean;
  archived: boolean;
  surfaces: ("home" | "opening" | "resume" | "exhibit" | "lab")[];
};

export type CmsAspiration = {
  id: string;
  label: string;
  active: boolean;
  start: string;
  end: string;
};

export type CmsProfile = {
  displayName: string;
  legalName: string;
  dek: string;
  tagline: string;
  desksLine: string;
  howIWork: string;
  availability: string;
  recruiterBio: string;
  followerBio: string;
  location: string;
};

export type CmsExperience = {
  id: string;
  employer: string;
  role: string;
  type: string;
  period: string;
  tech: string;
  ownership: string;
  bullets: string;
  impact: string;
  archived: boolean;
};

export type CmsEducation = {
  id: string;
  institution: string;
  qualification: string;
  honours: string;
  grades: string;
  dates: string;
  location: string;
  archived: boolean;
};

export const PROJECT_COPY_KEYS = [
  "purpose",
  "impact",
  "why",
  "judgment",
  "constraint",
  "limitation",
  "example",
  "rejected",
  "retrospective",
] as const;

export const PROJECT_STRUCTURE_KEYS = [
  "title",
  "subtitle",
  "date",
  "category",
  "tech",
  "github",
  "seoTitle",
  "seoDescription",
  "bullets",
  "description",
  "plate",
  "plateMedia",
  "plateCaption",
  "plateAlt",
  "apparatusName",
  "apparatusRuntime",
  "apparatusPath",
  "apparatusBeside",
] as const;

export type ChessEntityKind = "experience" | "education" | "project" | "lab" | "outlook" | "";

export type CmsChessNote = {
  id: string;
  fact: string;
  commentary: string;
  featured: boolean;
  entityKind: ChessEntityKind;
  entityId: string;
  mediaPathname: string;
};

export type CmsRedirect = {
  id: string;
  from: string;
  to: string;
  status: 301 | 302 | 307 | 308;
  enabled: boolean;
};

export type CmsArticle = {
  slug: string;
  kicker: string;
  body: string;
  honestyKicker: string;
  honesty: string;
  witnessKicker: string;
  witnesses: string;
  plate: string;
  plateCaption: string;
  plateAlt: string;
  plateMedia: string;
};

export type CmsLabCopy = {
  hed: string;
  dek: string;
  teaser: string;
  meta: string;
  resultJoke: string;
  hypothesisHed: string;
  hypothesis: string;
  experimentHed: string;
  experiment: string;
  failedHed: string;
  failed: string;
  learnedHed: string;
  learned: string;
};

export type CmsProjectCopy = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  category: string;
  tech: string;
  github: string;
  seoTitle: string;
  seoDescription: string;
  purpose: string;
  impact: string;
  why: string;
  judgment: string;
  constraint: string;
  limitation: string;
  example: string;
  rejected: string;
  retrospective: string;
  bullets: string;
  description: string;
  plate: string;
  plateMedia: string;
  plateCaption: string;
  plateAlt: string;
  apparatusName: string;
  apparatusRuntime: string;
  apparatusPath: string;
  apparatusBeside: string;
  claimIds: string[];
  archived: boolean;
};

export type SiteDocument = {
  revisionId: string;
  status: "draft" | "published";
  publishedAt: string;
  savedAt: string;
  restoredFrom: string;
  note: string;
  profile: CmsProfile;
  aspirations: CmsAspiration[];
  claims: CmsClaim[];
  projects: CmsProjectCopy[];
  experience: CmsExperience[];
  education: CmsEducation[];
  chess: CmsChessNote[];
  chessPgn: string;
  lab: CmsLabCopy;
  redirects: CmsRedirect[];
  articles: CmsArticle[];
};

export type CmsMediaAsset = {
  pathname: string;
  url: string;
  uploadedAt: string;
  alt: string;
  caption: string;
  contentType: string;
  size: number;
  usage: string;
  focalPoint: string;
};

export type CmsStoreFile = {
  draft: SiteDocument | null;
  published: SiteDocument | null;
  revisions: SiteDocument[];
  audit: { at: string; action: string; note: string; actor?: string }[];
  media: CmsMediaAsset[];
};
