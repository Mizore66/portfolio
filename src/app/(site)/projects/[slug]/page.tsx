import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArchitectureDiagram } from "@/components/site/ArchitectureDiagram";
import { CaseSection } from "@/components/site/CaseSection";
import { ClaimLine } from "@/components/site/ClaimLine";
import { ProjectMedia } from "@/components/site/ProjectMedia";
import { SiteJsonLd } from "@/components/site/SiteJsonLd";
import { WorkLink } from "@/components/site/WorkLink";
import { adjacentProjects, projectBySlug, projectClaims } from "@/content/site";
import { formatMonth } from "@/content/site/format";
import { CATEGORY_LABEL, PROJECTS } from "@/content/site/projects";
import { projectSchema } from "@/content/site/schema";
import { SITE_URL } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  if (!p) return {};
  const title = `${p.seo.title} · Anas Qumhiyeh`;
  const url = `${SITE_URL}/projects/${p.slug}`;
  return {
    title,
    description: p.seo.description,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title, description: p.seo.description, url, type: "article" },
    twitter: { card: "summary_large_image", title, description: p.seo.description },
  };
}

/** Plain link for the static shell; WorkLink swaps in the ?path= version on the client. */
function WorkLinkWithFallback({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Suspense
      fallback={
        <Link className={className} href="/#work">
          {children}
        </Link>
      }
    >
      <WorkLink className={className}>{children}</WorkLink>
    </Suspense>
  );
}

export default async function ProjectPage({ params }: { params: Params }) {
  const p = projectBySlug((await params).slug);
  if (!p) notFound();
  const cs = p.caseStudy;
  const { prev, next } = adjacentProjects(p.slug);

  return (
    <main id="main" className="case" data-draft={cs.draft ? "true" : undefined}>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <WorkLinkWithFallback>Work</WorkLinkWithFallback>
          </li>
          <li aria-current="page">{p.name}</li>
        </ol>
      </nav>

      <header className="case-header">
        <p className="card-meta">
          <span>{p.origin}</span>
          <span>{formatMonth(p.date)}</span>
          <span>{CATEGORY_LABEL[p.category]}</span>
        </p>
        <h1 className="case-title">
          {p.name}
          <span className="case-subtitle">{p.subtitle}</span>
        </h1>
        <p className="case-purpose">{p.purpose}</p>
        {cs.team ? <p className="case-team">{cs.team}</p> : null}
        <p className="role-tech">{p.tech.join(", ")}</p>
      </header>

      {p.media?.length ? <ProjectMedia media={p.media} /> : null}

      <CaseSection id="measurement" title="Result and evidence">
        <div className="role-claims">
          {projectClaims(p).map((c) => (
            <ClaimLine key={c.id} claim={c} />
          ))}
        </div>
        {cs.notes?.map((n) => (
          <p key={n} className="note">
            {n}
          </p>
        ))}
      </CaseSection>
      {cs.problem ? (
        <CaseSection id="problem" title="Problem">
          <p>{cs.problem}</p>
        </CaseSection>
      ) : null}
      {cs.decision ? (
        <CaseSection id="decision" title="Decision">
          <p>{cs.decision}</p>
        </CaseSection>
      ) : null}
      {cs.constraint ? (
        <CaseSection id="constraint" title="Constraint">
          <p>{cs.constraint}</p>
        </CaseSection>
      ) : null}
      {cs.example ? (
        <CaseSection id="example" title="Example">
          <p>{cs.example}</p>
        </CaseSection>
      ) : null}
      {cs.rejected ? (
        <CaseSection id="rejected" title="Considered and rejected">
          <p>{cs.rejected}</p>
        </CaseSection>
      ) : null}
      {p.architecture ? (
        <CaseSection id="apparatus" title="Architecture">
          <ArchitectureDiagram architecture={p.architecture} name={p.name} />
        </CaseSection>
      ) : null}
      {cs.built?.length ? (
        <CaseSection id="line" title="What was built">
          <ul className="role-bullets">
            {cs.built.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </CaseSection>
      ) : null}
      {cs.limitations ? (
        <CaseSection id="limitations" title="Limitations">
          <p>{cs.limitations}</p>
        </CaseSection>
      ) : null}
      {cs.changeNow ? (
        <CaseSection id="retrospective" title="What I would change now">
          <p>{cs.changeNow}</p>
        </CaseSection>
      ) : null}
      <CaseSection id="links" title="Links">
        <ul className="link-list">
          {p.repo ? (
            <li>
              <a href={p.repo} target="_blank" rel="noopener noreferrer">
                Source on GitHub<span className="sr-only"> (opens in new tab)</span>
              </a>
            </li>
          ) : (
            <li>The source is in a private repository.</li>
          )}
          <li>
            <WorkLinkWithFallback>Back to all work</WorkLinkWithFallback>
          </li>
        </ul>
      </CaseSection>

      <nav aria-label="More projects" className="case-pager">
        {prev ? (
          <Link href={`/projects/${prev.slug}`} rel="prev">
            <span className="case-pager-label">Previous</span>
            {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/projects/${next.slug}`} rel="next" className="case-pager-next">
            <span className="case-pager-label">Next</span>
            {next.name}
          </Link>
        ) : null}
      </nav>
      <SiteJsonLd data={projectSchema(p)} />
    </main>
  );
}
