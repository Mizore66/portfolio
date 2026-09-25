import { formatClaimDate } from "@/content/site/format";
import { EVIDENCE_LABEL, type Claim } from "@/content/site/types";

export function ClaimLine({ claim }: { claim: Claim }) {
  return (
    <p id={`claim-${claim.id}`} className="claim">
      <span className="claim-head">
        <span className="claim-value">{claim.display}</span>
        <span className="claim-type">{EVIDENCE_LABEL[claim.type]}</span>
      </span>
      <span className="claim-context">
        {claim.context}{" "}
        <span className="claim-meta">
          ({claim.owner}, {formatClaimDate(claim.date)})
        </span>
      </span>
    </p>
  );
}
