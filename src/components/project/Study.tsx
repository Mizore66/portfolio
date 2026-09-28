import Image from "next/image";
import Link from "next/link";
import { claim, content, prose, type Step } from "@/content/site";
import { evalLabel, featured, type Featured } from "@/content/work";

const S = content.pageCopy.projectPageSections;

/** Covers (Phase 4, approved at Gate 4): each product's own screen made physical beside its sculpture. */
const COVER: Record<string, string> = {
  faultline: "FaultLine's proof page printed as a sheet on the gallery floor, with the cracked porcelain bishop standing at its edge.",
  "gemini-teleportal": "A phone standing on the gallery floor, showing a live Teleportal session, with the aluminium knight beside it.",
  circuitmindai: "The inspected circuit board as a plate on the gallery floor, with the basalt bishop and its copper trace standing on it.",
};

function Steps({ steps, arrow }: { steps: Step[]; arrow?: boolean }) {
  return (
    <ol className={`st-steps${arrow ? " path" : ""}`}>
      {steps.map((s) => (
        <li key={s.label}><b>{prose(s.label)}</b>{s.note ? <span className="mono">{prose(s.note)}</span> : null}</li>
      ))}
    </ol>
  );
}

/**
 * The case study: one column on the gallery black, beside the seam's hairline (design/motion.md §8).
 * Roman is fact; the move's annotation, in italic, is voice.
 */
export function Study({ f }: { f: Featured }) {
  const p = f.project, cs = p.caseStudy ?? {}, arch = p.architecture;
  const i = featured.indexOf(f), next = featured[(i + 1) % featured.length];
  const repo = p.repo ?? content.links.repos?.[p.slug];
  const words: [string, string | undefined][] = [
    [S.problem, cs.problem], [S.decision, cs.decision], [S.constraint, cs.constraint], [S.example, cs.example], [S.rejected, cs.rejected],
  ];
  return (
    <article className="study">
      <p className="st-mark mono" aria-hidden="true">{f.move} {evalLabel(f.cp)}</p>

      <header className="st-open">
        <p className="st-move display" aria-label={`The move: ${f.move}`}>{f.move}</p>
        <p className="st-eval mono">{evalLabel(f.cp)}, the engine&rsquo;s eval after {f.move}. The seam rests there.</p>
        {f.note ? <p className="st-note"><i>{f.note.text}</i></p> : null}
      </header>

      <figure className="st-cover">
        <Image src={`/work/${p.slug}/cover.webp`} width={2400} height={1500} sizes="(max-width: 600px) 100vw, 76vw" alt={COVER[p.slug]} />
      </figure>

      <section className="st-sec">
        <h2 className="st-h mono">{S.measurement}</h2>
        <ul className="st-claims">
          {(cs.evidence ?? [p.result.claimId]).map((id) => {
            const c = claim(id);
            return (
              <li key={id}>
                <b>{prose(c.display)}</b>
                <span className="mono">{c.qualifier}</span>
                <span className="st-ctx">{prose(c.context)}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="st-sec">
        <h2 className="st-h mono">The case</h2>
        <dl className="st-dl">
          {words.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}><dt className="mono">{k}</dt><dd>{prose(v!)}</dd></div>
          ))}
        </dl>
      </section>

      {arch ? (
        <section className="st-sec">
          <h2 className="st-h mono">{S.apparatus}{arch.host ? `, on ${arch.host}` : ""}</h2>
          <Steps steps={arch.path} arrow />
          {arch.branches?.length ? (<><p className="st-sub mono">Beside the path</p><Steps steps={arch.branches.map((b) => ({ ...b, note: [b.note, b.from != null ? `from ${arch.path[b.from].label}` : ""].filter(Boolean).join(", ") }))} /></>) : null}
          {arch.beside?.length ? (<><p className="st-sub mono">Around it</p><Steps steps={arch.beside} /></>) : null}
        </section>
      ) : null}

      {cs.built?.length ? (
        <section className="st-sec">
          <h2 className="st-h mono">{S.line}</h2>
          <ol className="st-built">{cs.built.map((b) => <li key={b}>{prose(b)}</li>)}</ol>
        </section>
      ) : null}

      {cs.limitations || cs.changeNow ? (
        <section className="st-sec">
          <dl className="st-dl">
            {cs.limitations ? <div><dt className="mono">{S.limitations}</dt><dd>{prose(cs.limitations)}</dd></div> : null}
            {cs.changeNow ? <div><dt className="mono">{S.retrospective}</dt><dd>{prose(cs.changeNow)}</dd></div> : null}
          </dl>
        </section>
      ) : null}

      <section className="st-sec st-end">
        {cs.team ? <p className="st-team">{prose(cs.team)}</p> : null}
        <p className="st-tech mono">{p.tech.join(" · ")}</p>
        <ul className="st-links">
          {repo ? <li><a href={repo} rel="noopener">{S.sourceLink}</a></li> : <li>{S.privateRepo}</li>}
          <li><Link href="/work">{S.back}</Link></li>
        </ul>
        <Link className="st-next" href={`/work/${next.slug}`}>
          <span className="mono">Next, {next.move}</span>
          <span className="display">{next.name}</span>
        </Link>
      </section>
    </article>
  );
}
