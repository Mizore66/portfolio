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

  const pub = {
    ...published,
    claims: Array.isArray(published?.claims) ? published.claims : [],
    projects: Array.isArray(published?.projects) ? published.projects : [],
    aspirations: Array.isArray(published?.aspirations) ? published.aspirations : [],
    experience: Array.isArray(published?.experience) ? published.experience : [],
    education: Array.isArray(published?.education) ? published.education : [],
    chess: Array.isArray(published?.chess) ? published.chess : [],
    chessPgn: published?.chessPgn ?? "",
    lab: published?.lab ?? ({} as SiteDocument["lab"]),
    profile: published?.profile ?? ({} as SiteDocument["profile"]),
  };
  const next = {
    ...draft,
    claims: Array.isArray(draft?.claims) ? draft.claims : [],
    projects: Array.isArray(draft?.projects) ? draft.projects : [],
    aspirations: Array.isArray(draft?.aspirations) ? draft.aspirations : [],
    experience: Array.isArray(draft?.experience) ? draft.experience : [],
    education: Array.isArray(draft?.education) ? draft.education : [],
    chess: Array.isArray(draft?.chess) ? draft.chess : [],
    chessPgn: draft?.chessPgn ?? "",
    lab: draft?.lab ?? ({} as SiteDocument["lab"]),
    profile: draft?.profile ?? ({} as SiteDocument["profile"]),
  };

    push("note", pub.note, next.note);
  push("profile.dek", pub.profile.dek, next.profile.dek);
  push("profile.tagline", pub.profile.tagline, next.profile.tagline);
  push("profile.desksLine", pub.profile.desksLine, next.profile.desksLine);
  push("profile.howIWork", pub.profile.howIWork, next.profile.howIWork);
  push("profile.availability", pub.profile.availability, next.profile.availability);
  push("profile.recruiterBio", pub.profile.recruiterBio, next.profile.recruiterBio);
  push("profile.followerBio", pub.profile.followerBio, next.profile.followerBio);
  push("profile.location", pub.profile.location, next.profile.location);

  const claimIds = new Set([...pub.claims.map((c) => c.id), ...next.claims.map((c) => c.id)]);
  for (const id of claimIds) {
    const a = pub.claims.find((c) => c.id === id);
    const b = next.claims.find((c) => c.id === id);
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
    push(`claims.${id}.linkedProject`, a.linkedProject, b.linkedProject);
    push(`claims.${id}.heroEligible`, a.heroEligible, b.heroEligible);
    push(`claims.${id}.archived`, a.archived, b.archived);
    push(`claims.${id}.surfaces`, (a.surfaces ?? []).join(","), (b.surfaces ?? []).join(","));
  }

  const aspIds = new Set([...pub.aspirations.map((c) => c.id), ...next.aspirations.map((c) => c.id)]);
  for (const id of aspIds) {
    const a = pub.aspirations.find((c) => c.id === id);
    const b = next.aspirations.find((c) => c.id === id);
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

  const slugs = new Set([...pub.projects.map((p) => p.slug), ...next.projects.map((p) => p.slug)]);
  for (const slug of slugs) {
    const a = pub.projects.find((p) => p.slug === slug);
    const b = next.projects.find((p) => p.slug === slug);
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
    push(`projects.${slug}.claimIds`, (a.claimIds ?? []).join(","), (b.claimIds ?? []).join(","));
    push(`projects.${slug}.archived`, a.archived, b.archived);
  }

  const expIds = new Set([...pub.experience.map((row) => row.id), ...next.experience.map((row) => row.id)]);
  for (const id of expIds) {
    const a = pub.experience.find((row) => row.id === id);
    const b = next.experience.find((row) => row.id === id);
    if (!a) {
      push(`experience.${id}`, "", b);
      continue;
    }
    if (!b) {
      push(`experience.${id}`, a, "");
      continue;
    }
    push(`experience.${id}.employer`, a.employer, b.employer);
    push(`experience.${id}.role`, a.role, b.role);
    push(`experience.${id}.type`, a.type, b.type);
    push(`experience.${id}.period`, a.period, b.period);
    push(`experience.${id}.tech`, a.tech, b.tech);
    push(`experience.${id}.ownership`, a.ownership, b.ownership);
    push(`experience.${id}.bullets`, a.bullets, b.bullets);
    push(`experience.${id}.impact`, a.impact, b.impact);
    push(`experience.${id}.archived`, a.archived, b.archived);
  }

  const eduIds = new Set([...pub.education.map((row) => row.id), ...next.education.map((row) => row.id)]);
  for (const id of eduIds) {
    const a = pub.education.find((row) => row.id === id);
    const b = next.education.find((row) => row.id === id);
    if (!a) {
      push(`education.${id}`, "", b);
      continue;
    }
    if (!b) {
      push(`education.${id}`, a, "");
      continue;
    }
    push(`education.${id}.institution`, a.institution, b.institution);
    push(`education.${id}.qualification`, a.qualification, b.qualification);
    push(`education.${id}.honours`, a.honours, b.honours);
    push(`education.${id}.grades`, a.grades, b.grades);
    push(`education.${id}.dates`, a.dates, b.dates);
    push(`education.${id}.location`, a.location, b.location);
    push(`education.${id}.archived`, a.archived, b.archived);
  }

  push("chessPgn", pub.chessPgn, next.chessPgn);
  const chessIds = new Set([...pub.chess.map((row) => row.id), ...next.chess.map((row) => row.id)]);
  for (const id of chessIds) {
    const a = pub.chess.find((row) => row.id === id);
    const b = next.chess.find((row) => row.id === id);
    if (!a) {
      push(`chess.${id}`, "", b);
      continue;
    }
    if (!b) {
      push(`chess.${id}`, a, "");
      continue;
    }
    push(`chess.${id}.fact`, a.fact, b.fact);
    push(`chess.${id}.commentary`, a.commentary, b.commentary);
    push(`chess.${id}.featured`, a.featured, b.featured);
    push(`chess.${id}.entityKind`, a.entityKind, b.entityKind);
    push(`chess.${id}.entityId`, a.entityId, b.entityId);
  }

  push("lab.hed", pub.lab.hed, next.lab.hed);
  push("lab.dek", pub.lab.dek, next.lab.dek);
  push("lab.teaser", pub.lab.teaser, next.lab.teaser);
  push("lab.meta", pub.lab.meta, next.lab.meta);
  push("lab.resultJoke", pub.lab.resultJoke, next.lab.resultJoke);
  push("lab.hypothesisHed", pub.lab.hypothesisHed, next.lab.hypothesisHed);
  push("lab.hypothesis", pub.lab.hypothesis, next.lab.hypothesis);
  push("lab.experimentHed", pub.lab.experimentHed, next.lab.experimentHed);
  push("lab.experiment", pub.lab.experiment, next.lab.experiment);
  push("lab.failedHed", pub.lab.failedHed, next.lab.failedHed);
  push("lab.failed", pub.lab.failed, next.lab.failed);
  push("lab.learnedHed", pub.lab.learnedHed, next.lab.learnedHed);
  push("lab.learned", pub.lab.learned, next.lab.learned);

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
  if (path.startsWith("experience.")) return "/admin/experience";
  if (path.startsWith("education.")) return "/admin/education";
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
    } else if (row.path.startsWith("experience.")) {
      const id = row.path.split(".")[1] ?? "experience";
      take(`experience.${id}`, `Experience · ${id}`).rows.push(row);
    } else if (row.path.startsWith("education.")) {
      const id = row.path.split(".")[1] ?? "education";
      take(`education.${id}`, `Education · ${id}`).rows.push(row);
    } else if (row.path.startsWith("chess") || row.path === "chessPgn") {
      const id = row.path.split(".")[1] ?? "line";
      take(`chess.${id}`, `Chess · ${id}`).rows.push(row);
    } else if (row.path.startsWith("lab.")) {
      take("lab", "Laboratory").rows.push(row);
    } else {
      take("profile", "Profile").rows.push(row);
    }
  }
  return [...groups.values()];
}
