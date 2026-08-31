import Link from "next/link";
import { resumeData } from "@/lib/data";
import { FEATURED_PROJECT_SLUGS } from "@/lib/metrics";
import { cn } from "@/lib/utils";

export function SelectedWork() {
  const featured = FEATURED_PROJECT_SLUGS.map(
    (slug) => resumeData.projects.find((p) => p.slug === slug)!,
  );
  const rest = resumeData.projects.filter((p) => !FEATURED_PROJECT_SLUGS.includes(p.slug as (typeof FEATURED_PROJECT_SLUGS)[number]));

  return (
    <section id="work" data-testid="selected-work" className="recruiter-band" aria-labelledby="work-heading">
      <p className="band-kicker">Selected work</p>
      <h2 id="work-heading" className="band-title">
        Three systems that had to survive measurement
      </h2>
      <ul className="project-card-grid">
        {featured.map((project, i) => (
          <li key={project.slug} className={cn("project-card", i === 0 && "project-card-flagship")}>
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-faded">
              {project.date}
            </p>
            <h3 className="mt-2 font-display text-[22px] leading-tight text-ink sm:text-[24px]">
              {project.name}
            </h3>
            <p className="mt-2 font-display text-[16px] leading-snug text-ink">{project.purpose}</p>
            <p className="metric-row mt-3">{project.impact}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.tech.slice(0, 5).map((t) => (
                <li key={t} className="border border-ink px-2 py-0.5 font-mono text-[11px] text-book-blue">
                  {t}
                </li>
              ))}
            </ul>
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
      {rest.length > 0 ? (
        <p className="mt-6 font-mono text-[12px] leading-relaxed text-faded">
          Also on the scoresheet:{" "}
          {rest.map((p, i) => (
            <span key={p.slug}>
              {i > 0 ? " · " : null}
              <Link href={`/projects/${p.slug}`} className="text-book-blue underline decoration-2 underline-offset-4">
                {p.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </section>
  );
}
