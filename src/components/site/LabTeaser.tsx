import Link from "next/link";
import { getClaim } from "@/content/site";
import { LAB_TEASER } from "@/content/site/lab";
import { EVIDENCE_LABEL } from "@/content/site/types";

export function LabTeaser() {
  const claim = getClaim(LAB_TEASER.claimId);
  return (
    <section id="lab" className="section" aria-labelledby="lab-title">
      <h2 id="lab-title">The engine experiment</h2>
      <p>{LAB_TEASER.headline}</p>
      <p id={`claim-${claim.id}`} className="claim">
        <span className="claim-head">
          <span className="claim-value">{LAB_TEASER.meta}</span>
          <span className="claim-type">{EVIDENCE_LABEL[claim.type]}</span>
        </span>
      </p>
      <p className="annotation">{LAB_TEASER.annotation}</p>
      <ul className="chips">
        {LAB_TEASER.links.map((l) => (
          <li key={l.href}>
            <Link className="chip" href={l.href}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
