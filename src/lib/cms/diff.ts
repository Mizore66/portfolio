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
    push(`claims.${id}.value`, a.value, b.value);
    push(`claims.${id}.unit`, a.unit, b.unit);
    push(`claims.${id}.kind`, a.kind, b.kind);
    push(`claims.${id}.owner`, a.owner, b.owner);
    push(`claims.${id}.method`, a.method, b.method);
    push(`claims.${id}.baseline`, a.baseline, b.baseline);
    push(`claims.${id}.sample`, a.sample, b.sample);
    push(`claims.${id}.environment`, a.environment, b.environment);
    push(`claims.${id}.date`, a.date, b.date);
    push(`claims.${id}.caveat`, a.caveat, b.caveat);
    push(`claims.${id}.denominator`, a.denominator, b.denominator);
    push(`claims.${id}.source`, a.source, b.source);
    push(`claims.${id}.sourceUrl`, a.sourceUrl, b.sourceUrl);
    push(`claims.${id}.heroEligible`, a.heroEligible, b.heroEligible);
    push(`claims.${id}.archived`, a.archived, b.archived);
    push(`claims.${id}.surfaces`, a.surfaces.join(","), b.surfaces.join(","));
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
    push(`aspirations.${id}.start`, a.start, b.start);
    push(`aspirations.${id}.end`, a.end, b.end);
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
    push(`projects.${slug}.title`, a.title, b.title);
    push(`projects.${slug}.subtitle`, a.subtitle, b.subtitle);
    push(`projects.${slug}.date`, a.date, b.date);
    push(`projects.${slug}.category`, a.category, b.category);
    push(`projects.${slug}.tech`, a.tech, b.tech);
    push(`projects.${slug}.github`, a.github, b.github);
    push(`projects.${slug}.seoTitle`, a.seoTitle, b.seoTitle);
    push(`projects.${slug}.seoDescription`, a.seoDescription, b.seoDescription);
    push(`projects.${slug}.purpose`, a.purpose, b.purpose);
    push(`projects.${slug}.impact`, a.impact, b.impact);
    push(`projects.${slug}.why`, a.why, b.why);
    push(`projects.${slug}.judgment`, a.judgment, b.judgment);
    push(`projects.${slug}.constraint`, a.constraint, b.constraint);
    push(`projects.${slug}.limitation`, a.limitation, b.limitation);
    push(`projects.${slug}.example`, a.example, b.example);
    push(`projects.${slug}.rejected`, a.rejected, b.rejected);
    push(`projects.${slug}.retrospective`, a.retrospective, b.retrospective);
    push(`projects.${slug}.bullets`, a.bullets, b.bullets);
    push(`projects.${slug}.description`, a.description, b.description);
    push(`projects.${slug}.plate`, a.plate, b.plate);
    push(`projects.${slug}.plateCaption`, a.plateCaption, b.plateCaption);
    push(`projects.${slug}.plateAlt`, a.plateAlt, b.plateAlt);
    push(`projects.${slug}.apparatusName`, a.apparatusName, b.apparatusName);
    push(`projects.${slug}.apparatusRuntime`, a.apparatusRuntime, b.apparatusRuntime);
    push(`projects.${slug}.apparatusPath`, a.apparatusPath, b.apparatusPath);
    push(`projects.${slug}.apparatusBeside`, a.apparatusBeside, b.apparatusBeside);
    push(`projects.${slug}.archived`, a.archived, b.archived);
  }

  return rows;
}

export type WordMark = { type: "same" | "del" | "ins"; text: string };

/** Token-level LCS so Diff can show insertions and deletions, not only whole fields. */
export function wordDiff(from: string, to: string): WordMark[] {
  const a = from.split(/(\s+)/).filter((part) => part.length > 0);
  const b = to.split(/(\s+)/).filter((part) => part.length > 0);
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? (dp[i + 1]![j + 1] ?? 0) + 1 : Math.max(dp[i + 1]![j] ?? 0, dp[i]![j + 1] ?? 0);
    }
  }
  const marks: WordMark[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      marks.push({ type: "same", text: a[i]! });
      i += 1;
      j += 1;
    } else if ((dp[i + 1]![j] ?? 0) >= (dp[i]![j + 1] ?? 0)) {
      marks.push({ type: "del", text: a[i]! });
      i += 1;
    } else {
      marks.push({ type: "ins", text: b[j]! });
      j += 1;
    }
  }
  while (i < n) {
    marks.push({ type: "del", text: a[i]! });
    i += 1;
  }
  while (j < m) {
    marks.push({ type: "ins", text: b[j]! });
    j += 1;
  }
  return marks;
}

export function editorHrefForPath(path: string): string {
  if (path.startsWith("claims.")) return "/admin/claims";
  if (path.startsWith("projects.")) return "/admin/projects";
  if (path.startsWith("aspirations.")) return "/admin/aspirations";
  return "/admin/profile";
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
