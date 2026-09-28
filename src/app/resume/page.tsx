import type { Metadata } from "next";
import Link from "next/link";
import { content, claim, prose, span, month, type Claim } from "@/content/site";
import { PrintButton } from "./print-button";
import "./resume.css";

export const metadata: Metadata = {
  title: "Résumé",
  description: `${content.resume.name}: ${content.resume.summary}`,
};

const { resume, identity, education, roles, projects, roleNotes, skills, links } = content;

function Results({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <ul className="results">
      {ids.map((id) => {
        const c: Claim = claim(id);
        return (
          <li key={id}>
            <span className="figure">{prose(c.display)}</span>
            <span className="qual mono">{c.qualifier}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function ResumePage() {
  const current = roles[0];
  return (
    <div className="resume">
      <a className="skip" href="#main">Skip to content</a>
      <header className="bar">
        <Link href="/" className="back">Anas Qumhiyeh</Link>
        <PrintButton />
      </header>

      <main id="main">
        <section className="head">
          <h1 className="display">{resume.name}</h1>
          <p className="role">{current.title}, {current.employer}</p>
          <ul className="contact mono">
            {resume.contact.map((c) => (
              <li key={c.href}><a href={c.href}>{c.label}</a></li>
            ))}
          </ul>
          <p className="status">{resume.status}</p>
        </section>

        <section>
          <h2 className="mono">Summary</h2>
          <p className="summary">{prose(resume.summary)}</p>
        </section>

        <section>
          <h2 className="mono">Experience</h2>
          {roles.map((r) => (
            <article key={r.id} className="entry">
              <p className="when mono">{span(r.start, r.end)}</p>
              <div>
                <h3>{r.employer}</h3>
                <p className="sub">{r.title} · {r.kind}</p>
                <p className="tech mono">{r.tech.join(", ")}</p>
                <ul className="bullets">
                  {r.bullets.map((b) => <li key={b}>{prose(b)}</li>)}
                </ul>
                <Results ids={r.claimIds} />
              </div>
            </article>
          ))}
          <p className="note">{prose(roleNotes.OVERLAP_NOTE)}</p>
        </section>

        <section>
          <h2 className="mono">Projects</h2>
          {projects.list.map((p) => {
            const ids = [...new Set([p.result.claimId, ...(p.caseStudy?.evidence ?? [])])];
            const isPrivate = links.privateRepos.includes(p.slug);
            return (
              <article key={p.slug} className="entry">
                <p className="when mono">{month(p.date)}</p>
                <div>
                  <h3>{p.name}</h3>
                  <p className="sub">{prose(p.subtitle)} · {prose(p.origin)}</p>
                  <p className="tech mono">{p.tech.join(", ")}</p>
                  <p className="purpose">{prose(p.purpose)}</p>
                  <Results ids={ids} />
                  <p className="link mono">
                    {p.repo ? <a href={p.repo}>{p.repo.replace(/^https:\/\//, "")}</a> : isPrivate ? "Private repository" : null}
                  </p>
                </div>
              </article>
            );
          })}
          <p className="note">{prose(roleNotes.RETRIEVAL_SPLIT)} {prose(projects.notes.SLM_LATENCY_NOTE)}</p>
        </section>

        <section>
          <h2 className="mono">Education</h2>
          <article className="entry">
            <p className="when mono">{month(education.graduated)}</p>
            <div>
              <h3>{education.institution}</h3>
              <p className="sub">{education.degree}</p>
              <p className="purpose">{education.minor}. WAM {education.wam}, CGPA {education.cgpa}. {education.location}.</p>
            </div>
          </article>
        </section>

        <section>
          <h2 className="mono">Awards</h2>
          <ul className="plain">{resume.awards.map((a) => <li key={a}>{prose(a)}</li>)}</ul>
        </section>

        <section>
          <h2 className="mono">Skills</h2>
          <dl className="skills">
            {skills.map((s) => (
              <div key={s.label}>
                <dt className="mono">{s.label}</dt>
                <dd>{s.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="foot mono">{prose(identity.availability)}</p>
      </main>
    </div>
  );
}
