export const CMS_TAG = "cms";
export const SITE_REVISED = "2026-09-01T00:00:00.000Z";

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

export const PROJECT_COPY_KEYS = [
  "purpose",
  "impact",
  "why",
  "judgment",
  "constraint",
  "limitation",
  "example",
] as const;

export type CmsProjectCopy = {
  slug: string;
  purpose: string;
  impact: string;
  why: string;
  judgment: string;
  constraint: string;
  limitation: string;
  example: string;
  archived: boolean;
};

export type SiteDocument = {
  revisionId: string;
  status: "draft" | "published";
  publishedAt: string;
  note: string;
  profile: CmsProfile;
  aspirations: CmsAspiration[];
  claims: CmsClaim[];
  projects: CmsProjectCopy[];
};

export type CmsStoreFile = {
  draft: SiteDocument | null;
  published: SiteDocument | null;
  revisions: SiteDocument[];
  audit: { at: string; action: string; note: string }[];
};
