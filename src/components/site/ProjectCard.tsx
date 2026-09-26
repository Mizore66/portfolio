import Image from "next/image";
import Link from "next/link";
import { getClaim } from "@/content/site";
import { formatMonth } from "@/content/site/format";
import { CATEGORY_LABEL } from "@/content/site/projects";
import { EVIDENCE_LABEL, type Project } from "@/content/site/types";

export function ProjectCard({ project, saveData = false }: { project: Project; saveData?: boolean }) {
  const claim = project.result.claimId ? getClaim(project.result.claimId) : null;
  // Thumbnails are decorative (the case study carries the captioned screenshots): Save-Data skips them (§5.5).
  const thumb = saveData ? undefined : project.media?.[project.thumbnail ?? 0];
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
        {thumb ? (
          // Same destination as the title link, so it is kept out of the tab order and the accessibility tree.
          <Link href={`/projects/${project.slug}`} className="card-thumb" tabIndex={-1} aria-hidden="true">
            <Image src={thumb.src} width={thumb.width} height={thumb.height} alt="" sizes="(min-width: 768px) 560px, 100vw" />
          </Link>
        ) : null}
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
