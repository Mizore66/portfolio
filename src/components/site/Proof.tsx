import Link from "next/link";
import { getClaim } from "@/content/site";
import { ROLES } from "@/content/site/roles";
import { ClaimLine } from "./ClaimLine";

/** The three strongest proof points (brief §6): Deriv's production claims, one click from any page. */
const PROOF = ["derivCxCost", "derivCsat", "derivEvents"] as const;

export function Proof() {
  const deriv = ROLES.find((r) => r.id === "deriv")!;
  return (
    <section className="section proof" aria-labelledby="proof-title">
      <h2 id="proof-title">
        {deriv.employer}
        <span className="role-title">{deriv.title}</span>
      </h2>
      {PROOF.map((id) => (
        <ClaimLine key={id} claim={getClaim(id)} />
      ))}
      <p>
        <Link href="/about#deriv" data-cursor="piece">
          Experience
        </Link>
      </p>
    </section>
  );
}
