"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV = [["Roles", "/roles"], ["Work", "/work"], ["Lab", "/lab"], ["Contact", "/contact"]] as const;

/**
 * What stays on screen through every page change: the nav and the résumé link (never animated, covered
 * or moved), drawn in ink and again in paper clipped to the dark side of the live seam.
 * It is never part of a view-transition snapshot, so it answers clicks during a sweep.
 */
export function Chrome() {
  const path = usePathname();
  if (path === "/resume") return null;
  const cur = NAV.findIndex(([, h]) => path === h || path.startsWith(`${h}/`));
  return (
    <div className="chrome">
      <a className="skip" href="#main">Skip to content</a>
      {/* one unclipped frame, named for view transitions; the paper copy is clipped inside it */}
      <div className="chrome-frame">
      {(["ink", "inv"] as const).map((layer) => {
        // the ink copy is the real one: a banner landmark holding the nav and the résumé link
        const Layer = layer === "ink" ? "header" : "div";
        return (
        <Layer key={layer} className="chrome-layer" data-layer={layer} aria-hidden={layer === "inv" || undefined} inert={layer === "inv" || undefined}>
          <nav aria-label={layer === "ink" ? "Primary" : undefined}>
            <ul className="nav">
              {NAV.map(([label, href], i) => (
                <li key={href}><Link href={href} aria-current={i === cur ? "page" : undefined} data-vt-line="">{label}</Link></li>
              ))}
            </ul>
          </nav>
          <Link className="resume-link" href="/resume" tabIndex={layer === "inv" ? -1 : undefined} data-vt-line="">Résumé</Link>
        </Layer>
        );
      })}
      </div>
    </div>
  );
}
