import Link from "next/link";
import { getClaim, pathCounts, workFor, type WorkPath } from "@/content/site";
import { CATEGORY_LABEL } from "@/content/site/projects";
import { EVIDENCE_LABEL } from "@/content/site/types";
import { ProjectCard } from "./ProjectCard";

const FILTERS: { path: WorkPath | null; label: string }[] = [
  { path: null, label: "All" },
  { path: "ml", label: CATEGORY_LABEL.ml },
  { path: "product", label: CATEGORY_LABEL.product },
  { path: "devtools", label: CATEGORY_LABEL.devtools },
];

export function Work({ path }: { path: WorkPath | null }) {
  const { featured, archive } = workFor(path);
  const counts = pathCounts();
  const shown = featured.length + archive.length;
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <p className="kicker">Selected work</p>
      <h2 id="work-title">Work</h2>
      <ul className="chips" aria-label="Filter work">
        {FILTERS.map((f) => (
          <li key={f.label}>
            <Link
              className={f.path === path ? "chip chip-active" : "chip"}
              aria-current={f.path === path ? "true" : undefined}
              href={f.path ? `/?path=${f.path}#work` : "/#work"}
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
        <div className="cards">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      ) : null}
      {archive.length ? (
        <>
          <h3 className="archive-heading">Archive and supporting work</h3>
          <ul className="archive">
            {archive.map((p) => {
              const claim = p.result.claimId ? getClaim(p.result.claimId) : null;
              return (
                <li key={p.slug} id={p.slug}>
                  <Link href={`/projects/${p.slug}`}>
                    {p.name} — {p.subtitle}
                  </Link>{" "}
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
