import Link from "next/link";
import { DeskHover } from "@/components/opening/DeskHover";
import { EvidenceMeta } from "@/components/opening/EvidenceMeta";
import { resumeData } from "@/lib/data";
import {
  EVIDENCE_TIER,
  FEATURED_PROJECT_SLUGS,
  LAB_PROJECT_SLUGS,
  POSITIONING,
  exhibitHref,
  exhibitTitle,
  projectOrigin,
  projectPath,
  type EvidenceKind,
  type WorkPath,
} from "@/lib/metrics";
import { cn } from "@/lib/utils";

const LAB = new Set<string>(LAB_PROJECT_SLUGS);

function visibleProjects(path: WorkPath | "all") {
  return resumeData.projects.filter(
    (p) => !LAB.has(p.slug) && (path === "all" || projectPath(p.slug) === path),
  );
}

export function SelectedWork({ path = "all" }: { path?: WorkPath | "all" }) {
  const featured = FEATURED_PROJECT_SLUGS.map(
    (slug) => resumeData.projects.find((p) => p.slug === slug)!,
  ).filter((project) => path === "all" || projectPath(project.slug) === path);
  const archive = resumeData.projects.filter(
    (p) =>
      !FEATURED_PROJECT_SLUGS.includes(p.slug as (typeof FEATURED_PROJECT_SLUGS)[number]) &&
      !LAB.has(p.slug) &&
      (path === "all" || projectPath(p.slug) === path),
  );
  const mlCount = visibleProjects("ML / data systems").length;
  const productCount = visibleProjects("Product / backend").length;

  return (
    <section id="work" data-testid="selected-work" className="recruiter-band" aria-labelledby="work-heading">
      <p className="band-kicker">Front page</p>
      <h2 id="work-heading" className="band-title">
        Selected work
      </h2>
      <p className="mt-2 max-w-[68ch] font-display text-[16px] italic text-faded">
        {POSITIONING.independentDek}
      </p>
      <p className="path-filter mt-4" data-testid="path-filter">
        <a href="/#work" className={cn("path-chip", path === "all" && "path-chip-current")} aria-current={path === "all" ? "page" : undefined}>
          All
        </a>
        <a
          href="/?path=ml#work"
          className={cn("path-chip", path === "ML / data systems" && "path-chip-current")}
          aria-current={path === "ML / data systems" ? "page" : undefined}
        >
          ML / data systems ({mlCount})
        </a>
        <a
          href="/?path=product#work"
          className={cn("path-chip", path === "Product / backend" && "path-chip-current")}
          aria-current={path === "Product / backend" ? "page" : undefined}
        >
          Product / backend ({productCount})
        </a>
      </p>
      <ul className="project-card-grid">
        {featured.map((project, i) => (
          <li
            key={project.slug}
            id={project.slug}
            className={cn(
              "project-card",
              i === 0 && path === "all" && "project-card-flagship",
              "evidenceKind" in project && project.evidenceKind === "capability" && "project-card-capability",
            )}
          >
            <DeskHover slug={project.slug}>
            <Link
              href={exhibitHref(project.slug, path)}
              className="project-card-hit"
              aria-hidden="true"
              tabIndex={-1}
            />
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
              {projectOrigin({
                slug: project.slug,
                contextLabel: "contextLabel" in project ? project.contextLabel : undefined,
              })}{" "}
              · {project.date} · {projectPath(project.slug)}
            </p>
            {"evidenceKind" in project && project.evidenceKind ? (
              <p
                className={cn(
                  "evidence-kind-label mt-2",
                  project.evidenceKind === "capability" && "evidence-kind-capability",
                )}
              >
                {EVIDENCE_TIER[project.evidenceKind as EvidenceKind]}
              </p>
            ) : null}
            <h3 className="mt-2 font-display text-[22px] leading-tight text-ink sm:text-[24px]">
              {exhibitTitle(project)}
            </h3>
            <p className="mt-2 font-display text-[16px] leading-snug text-ink">{project.purpose}</p>
            <p className="metric-row mt-3">{project.impact}</p>
            {"evidenceNote" in project && project.evidenceNote ? (
              <EvidenceMeta
                note={project.evidenceNote}
                kind={"evidenceKind" in project ? (project.evidenceKind as EvidenceKind) : undefined}
              />
            ) : null}
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[12px] uppercase tracking-wider">
              <Link
                href={exhibitHref(project.slug, path)}
                className="artifact-link relative z-[1] text-book-blue underline decoration-2 underline-offset-4"
              >
                Read the {project.name} case study
              </Link>
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="artifact-link relative z-[1] external-mark text-book-blue underline decoration-2 underline-offset-4"
                >
                  View {project.name} source
                </a>
              ) : null}
            </p>
            </DeskHover>
          </li>
        ))}
      </ul>
      {archive.length > 0 ? (
        <section className="mt-8" aria-labelledby="archive-heading">
          <h3 id="archive-heading" className="archive-heading">
            Archive
          </h3>
          <ul className="project-archive mt-4" data-testid="project-archive">
            {archive.map((p) => (
              <li key={p.slug}>
                <Link href={exhibitHref(p.slug, path)} className="archive-row">
                  {exhibitTitle(p)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
