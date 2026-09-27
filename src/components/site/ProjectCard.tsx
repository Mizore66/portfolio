import Image from "next/image";
import { MoveLink } from "@/components/board/MoveLink";
import { nodeForProject } from "@/content/site/career";
import { getClaim } from "@/content/site";
import { formatMonth } from "@/content/site/format";
import { CATEGORY_LABEL } from "@/content/site/projects";
import { EVIDENCE_LABEL, type Project } from "@/content/site/types";

export function ProjectCard({ project, saveData = false, titleLevel = "h3", lead = false }: { project: Project; saveData?: boolean; titleLevel?: "h2" | "h3"; /** First card on the page: its thumbnail is the largest paint on phones. */ lead?: boolean }) {
  const Title = titleLevel;
  const claim = project.result.claimId ? getClaim(project.result.claimId) : null;
  // Thumbnails are decorative (the case study carries the captioned screenshots): Save-Data skips them (§5.5).
  const thumb = saveData ? undefined : project.media?.[project.thumbnail ?? 0];
  const node = nodeForProject(project.slug);
  return (
    <article id={project.slug} className="card" aria-labelledby={`${project.slug}-title`} data-node={node}>
      <p className="card-meta">
        <span>{project.origin}</span>
        <span>{formatMonth(project.date)}</span>
        <span>{CATEGORY_LABEL[project.category]}</span>
      </p>
      <div className="card-body">
        <Title id={`${project.slug}-title`} className="card-title">
          <MoveLink href={`/projects/${project.slug}`} nodeId={node}>
            {project.name}
          </MoveLink>
          <span className="card-subtitle">{project.subtitle}</span>
        </Title>
        {thumb ? (
          // Same destination as the title link, so it is kept out of the tab order and the accessibility tree.
          <MoveLink href={`/projects/${project.slug}`} nodeId={node} className="card-thumb" tabIndex={-1} aria-hidden="true">
            <Image src={thumb.src} width={thumb.width} height={thumb.height} alt="" sizes="(min-width: 768px) 560px, 100vw" {...(lead ? { loading: "eager", fetchPriority: "high" } as const : {})} />
          </MoveLink>
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
