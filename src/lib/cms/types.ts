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
  "plateCaption",
  "plateAlt",
  "apparatusName",
  "apparatusRuntime",
  "apparatusPath",
  "apparatusBeside",
] as const;

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
  plateCaption: string;
  plateAlt: string;
  apparatusName: string;
  apparatusRuntime: string;
  apparatusPath: string;
  apparatusBeside: string;
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
