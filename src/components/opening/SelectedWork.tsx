import Link from "next/link";
import { EvidenceMeta } from "@/components/opening/EvidenceMeta";
import { resumeData } from "@/lib/data";
import { FEATURED_PROJECT_SLUGS, LAB_PROJECT_SLUGS, POSITIONING, projectOrigin, projectPath } from "@/lib/metrics";
import type { EvidenceKind } from "@/lib/metrics";
import { cn } from "@/lib/utils";

const LAB = new Set<string>(LAB_PROJECT_SLUGS);

export function SelectedWork() {
  const featured = FEATURED_PROJECT_SLUGS.map(
    (slug) => resumeData.projects.find((p) => p.slug === slug)!,
  );
  const archive = resumeData.projects.filter(
    (p) => !FEATURED_PROJECT_SLUGS.includes(p.slug as (typeof FEATURED_PROJECT_SLUGS)[number]) && !LAB.has(p.slug),
  );

  return (
    <section id="work" data-testid="selected-work" className="recruiter-band" aria-labelledby="work-heading">
      <p className="band-kicker">Front page</p>
      <h2 id="work-heading" className="band-title">
        Selected work
      </h2>
      <p className="mt-2 max-w-[68ch] font-display text-[16px] italic text-faded">
        {POSITIONING.independentDek}
      </p>
      <ul className="project-card-grid">
        {featured.map((project, i) => (
          <li
            key={project.slug}
            id={project.slug}
            className={cn("project-card", i === 0 && "project-card-flagship")}
          >
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
              {projectOrigin({
                slug: project.slug,
                contextLabel: "contextLabel" in project ? project.contextLabel : undefined,
              })}{" "}
              · {project.date} · {projectPath(project.slug)}
            </p>
            <h3 className="mt-2 font-display text-[22px] leading-tight text-ink sm:text-[24px]">
              {project.name}
            </h3>
            <p className="mt-1 font-display text-[14px] leading-snug text-faded">{project.subtitle}</p>
            <p className="mt-2 font-display text-[16px] leading-snug text-ink">{project.purpose}</p>
            <p className="metric-row mt-3">{project.impact}</p>
            {"evidenceNote" in project && project.evidenceNote ? (
              <EvidenceMeta
                note={project.evidenceNote}
                kind={"evidenceKind" in project ? (project.evidenceKind as EvidenceKind) : undefined}
              />
            ) : null}
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[12px] uppercase tracking-wider">
              <Link href={`/projects/${project.slug}`} className="artifact-link text-book-blue underline decoration-2 underline-offset-4">
                Case study
              </Link>
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="artifact-link external-mark text-book-blue underline decoration-2 underline-offset-4"
                >
                  View {project.name} source
                </a>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
      {archive.length > 0 ? (
        <p className="mt-8 font-mono text-[12px] leading-relaxed text-faded" data-testid="project-archive">
          Archive:{" "}
          {archive.map((p, i) => (
            <span key={p.slug}>
              {i > 0 ? " · " : null}
              <Link href={`/projects/${p.slug}`} className="text-book-blue underline decoration-2 underline-offset-4">
                {p.name} — {p.subtitle}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </section>
  );
}
