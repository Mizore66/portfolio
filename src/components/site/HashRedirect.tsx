import { headers } from "next/headers";
import { getClaim } from "@/content/site";
import { LAB_TEASER } from "@/content/site/lab";
import { PROJECTS } from "@/content/site/projects";
import { ROLES } from "@/content/site/roles";

const HOME_CLAIMS = new Set(["derivCxCost", "derivCsat", "derivEvents"]);

/** Where each fragment of the old single-page home lives now (docs/upgrade/phase-1-visual-system.md §4). */
function fragmentMap(): Record<string, string> {
  const m: Record<string, string> = {
    work: "/work",
    archive: "/work#archive",
    experience: "/about#experience",
    skills: "/about#skills",
    education: "/about#education",
    about: "/about#about",
    career: "/about#career",
    lab: "/lab",
  };
  for (const r of ROLES) {
    m[r.id] = `/about#${r.id}`;
    for (const c of r.claimIds) if (!HOME_CLAIMS.has(c)) m[`claim-${c}`] = `/about#claim-${c}`;
  }
  for (const p of PROJECTS) {
    if (p.group === "lab") continue;
    m[p.slug] = `/work#${p.slug}`;
    if (p.result.claimId) m[`claim-${p.result.claimId}`] = `/work#claim-${p.result.claimId}`;
  }
  const lab = getClaim(LAB_TEASER.claimId);
  m[`claim-${lab.id}`] = `/lab#claim-${lab.id}`;
  return m;
}

/**
 * Hash fragments never reach the server, so old links such as `/#deriv` are
 * forwarded here, before the page paints (brief §6). Fragments that still
 * exist on the home page (`#contact`, `#proof`, `#the-game`) are left alone.
 */
export async function HashRedirect() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  // Also on hashchange: typing /#experience while already on / is a same-document navigation.
  const js = `(function(){var m=${JSON.stringify(fragmentMap())};function go(){if(location.pathname!=="/")return;var h=decodeURIComponent(location.hash.slice(1));if(h&&Object.prototype.hasOwnProperty.call(m,h))location.replace(m[h]);}go();window.addEventListener("hashchange",go);})();`;
  return <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: js }} />;
}
