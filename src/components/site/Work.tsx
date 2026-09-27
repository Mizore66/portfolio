import Link from "next/link";
import { getClaim, pathCounts, workFor, type WorkPath } from "@/content/site";
import { CATEGORY_LABEL } from "@/content/site/projects";
import { EVIDENCE_LABEL } from "@/content/site/types";
import { sectionNotation } from "@/content/site/sections";
import { MoveLink } from "@/components/board/MoveLink";
import { nodeForProject } from "@/content/site/career";
import { ProjectCard } from "./ProjectCard";
import { SectionTitle } from "./SectionTitle";

const FILTERS: { path: WorkPath | null; label: string }[] = [
  { path: null, label: "All" },
  { path: "ml", label: CATEGORY_LABEL.ml },
  { path: "product", label: CATEGORY_LABEL.product },
  { path: "devtools", label: CATEGORY_LABEL.devtools },
];

export function Work({ path, saveData = false, headingLevel = "h2" }: { path: WorkPath | null; saveData?: boolean; headingLevel?: "h1" | "h2" }) {
  const { featured, archive } = workFor(path);
  const counts = pathCounts();
  const shown = featured.length + archive.length;
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <SectionTitle id="work-title" as={headingLevel} {...sectionNotation("work")}>
        Selected work
      </SectionTitle>
      <ul className="chips" aria-label="Filter work">
        {FILTERS.map((f) => (
          <li key={f.label}>
            <Link
              className={f.path === path ? "chip chip-active" : "chip"}
              aria-current={f.path === path ? "true" : undefined}
              href={f.path ? `/work?path=${f.path}` : "/work"}
            >
              {f.label} ({f.path ? counts[f.path] : counts.all})
            </Link>
          </li>
        ))}
      </ul>
      <p className="sr-only" role="status">
        {shown} projects shown
      </p>
      {featured.length ? (
        <div className="featured">
          {featured.map((p, i) => (
            <ProjectCard key={p.slug} project={p} saveData={saveData} titleLevel={headingLevel === "h1" ? "h2" : "h3"} lead={i === 0 && headingLevel === "h1"} />
          ))}
        </div>
      ) : null}
      {archive.length ? (
        <>
          {headingLevel === "h1" ? (
            <h2 id="archive" className="archive-heading">
              Archive and supporting work
            </h2>
          ) : (
            <h3 id="archive" className="archive-heading">
              Archive and supporting work
            </h3>
          )}
          <ul className="archive">
            {archive.map((p) => {
              const claim = p.result.claimId ? getClaim(p.result.claimId) : null;
              return (
                <li key={p.slug} id={p.slug} data-node={nodeForProject(p.slug)}>
                  <MoveLink href={`/projects/${p.slug}`} nodeId={nodeForProject(p.slug)}>
                    {p.name}
                  </MoveLink>{" "}
                  <span className="archive-subtitle">{p.subtitle}</span>
                  <span className="card-result" id={claim ? `claim-${claim.id}` : undefined}>
                    <span className="claim-value">{p.result.line}</span>
                    {claim ? <span className="claim-type">{EVIDENCE_LABEL[claim.type]}</span> : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </section>
  );
}
