import type { SiteDocument } from "@/lib/cms/types";

export type FieldDiff = { path: string; from: string; to: string };

function asText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  return JSON.stringify(value);
}

export function documentDiff(published: SiteDocument, draft: SiteDocument): FieldDiff[] {
  const rows: FieldDiff[] = [];
  const push = (path: string, from: unknown, to: unknown) => {
    const a = asText(from);
    const b = asText(to);
    if (a !== b) rows.push({ path, from: a, to: b });
  };

  push("note", published.note, draft.note);
  push("profile.dek", published.profile.dek, draft.profile.dek);
  push("profile.tagline", published.profile.tagline, draft.profile.tagline);
  push("profile.desksLine", published.profile.desksLine, draft.profile.desksLine);
  push("profile.howIWork", published.profile.howIWork, draft.profile.howIWork);
  push("profile.availability", published.profile.availability, draft.profile.availability);
  push("profile.recruiterBio", published.profile.recruiterBio, draft.profile.recruiterBio);
  push("profile.followerBio", published.profile.followerBio, draft.profile.followerBio);
  push("profile.location", published.profile.location, draft.profile.location);

  const claimIds = new Set([...published.claims.map((c) => c.id), ...draft.claims.map((c) => c.id)]);
  for (const id of claimIds) {
    const a = published.claims.find((c) => c.id === id);
    const b = draft.claims.find((c) => c.id === id);
    if (!a) {
      push(`claims.${id}`, "", b);
      continue;
    }
    if (!b) {
      push(`claims.${id}`, a, "");
      continue;
    }
    push(`claims.${id}.display`, a.display, b.display);
    push(`claims.${id}.method`, a.method, b.method);
    push(`claims.${id}.baseline`, a.baseline, b.baseline);
    push(`claims.${id}.sample`, a.sample, b.sample);
    push(`claims.${id}.environment`, a.environment, b.environment);
    push(`claims.${id}.date`, a.date, b.date);
    push(`claims.${id}.caveat`, a.caveat, b.caveat);
    push(`claims.${id}.heroEligible`, a.heroEligible, b.heroEligible);
    push(`claims.${id}.archived`, a.archived, b.archived);
  }

  const aspIds = new Set([...published.aspirations.map((c) => c.id), ...draft.aspirations.map((c) => c.id)]);
  for (const id of aspIds) {
    const a = published.aspirations.find((c) => c.id === id);
    const b = draft.aspirations.find((c) => c.id === id);
    if (!a) {
      push(`aspirations.${id}`, "", b);
      continue;
    }
    if (!b) {
      push(`aspirations.${id}`, a, "");
      continue;
    }
    push(`aspirations.${id}.label`, a.label, b.label);
    push(`aspirations.${id}.active`, a.active, b.active);
  }

  const slugs = new Set([...published.projects.map((p) => p.slug), ...draft.projects.map((p) => p.slug)]);
  for (const slug of slugs) {
    const a = published.projects.find((p) => p.slug === slug);
    const b = draft.projects.find((p) => p.slug === slug);
    if (!a) {
      push(`projects.${slug}`, "", b);
      continue;
    }
    if (!b) {
      push(`projects.${slug}`, a, "");
      continue;
    }
    push(`projects.${slug}.purpose`, a.purpose, b.purpose);
    push(`projects.${slug}.impact`, a.impact, b.impact);
    push(`projects.${slug}.why`, a.why, b.why);
    push(`projects.${slug}.judgment`, a.judgment, b.judgment);
    push(`projects.${slug}.constraint`, a.constraint, b.constraint);
    push(`projects.${slug}.limitation`, a.limitation, b.limitation);
    push(`projects.${slug}.example`, a.example, b.example);
    push(`projects.${slug}.archived`, a.archived, b.archived);
  }

  return rows;
}

export type DiffGroup = { id: string; heading: string; rows: FieldDiff[] };

export function groupedDocumentDiff(published: SiteDocument, draft: SiteDocument): DiffGroup[] {
  const rows = documentDiff(published, draft);
  const groups = new Map<string, DiffGroup>();
  const take = (id: string, heading: string) => {
    const existing = groups.get(id);
    if (existing) return existing;
    const next = { id, heading, rows: [] as FieldDiff[] };
    groups.set(id, next);
    return next;
  };
  for (const row of rows) {
    if (row.path.startsWith("claims.")) {
      const id = row.path.split(".")[1] ?? "claim";
      take(`claims.${id}`, `Claim · ${id}`).rows.push(row);
    } else if (row.path.startsWith("projects.")) {
      const slug = row.path.split(".")[1] ?? "project";
      take(`projects.${slug}`, `Project · ${slug}`).rows.push(row);
    } else if (row.path.startsWith("aspirations.")) {
      const id = row.path.split(".")[1] ?? "aspiration";
      take(`aspirations.${id}`, `Aspiration · ${id}`).rows.push(row);
    } else {
      take("profile", "Profile").rows.push(row);
    }
  }
  return [...groups.values()];
}
