import Link from "next/link";
import { getClaim } from "@/content/site";
import { formatMonth } from "@/content/site/format";
import { CATEGORY_LABEL } from "@/content/site/projects";
import { EVIDENCE_LABEL, type Project } from "@/content/site/types";

export function ProjectCard({ project }: { project: Project }) {
  const claim = project.result.claimId ? getClaim(project.result.claimId) : null;
  return (
    <article id={project.slug} className="card" aria-labelledby={`${project.slug}-title`}>
      <p className="card-meta">
        <span>{project.origin}</span>
        <span>{formatMonth(project.date)}</span>
        <span>{CATEGORY_LABEL[project.category]}</span>
      </p>
      <div className="card-body">
        <h3 id={`${project.slug}-title`} className="card-title">
          <Link href={`/projects/${project.slug}`}>{project.name}</Link>
          <span className="card-subtitle">{project.subtitle}</span>
        </h3>
        <p className="card-purpose">{project.purpose}</p>
        <p className="card-result" id={claim ? `claim-${claim.id}` : undefined}>
          <span className="claim-value">{project.result.line}</span>
          {claim ? <span className="claim-type">{EVIDENCE_LABEL[claim.type]}</span> : null}
        </p>
        {project.repo ? (
          <a className="card-source" href={project.repo} target="_blank" rel="noopener noreferrer">
            View source<span className="sr-only"> for {project.name} (opens in new tab)</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
