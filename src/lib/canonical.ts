/**
 * Canonical desk facts. Homepage, Opening Preparation, and the résumé
 * read these strings. Chess commentary may interpret them; it may not
 * redefine them.
 */
export const DESKS = {
  petronas: {
    organization: "Petronas",
    role: "Project Engineer Intern",
    period: "Nov 2024 – Feb 2025",
    employmentKind: "Internship",
    facts: [
      "Replaced MATLAB-dependent back-end functionality with Python packages, removing paid runtime dependencies.",
      "Wrote post-release acceptance cases for the migrated features.",
      "Presented usability findings to department leadership.",
    ],
    headline: "PETRONAS TAKES ON SOFTWARE ENGINEERING INTERN",
    collaboration: "Internship. Owned the MATLAB-to-Python migration and presented usability findings to department leadership.",
  },
  setel: {
    organization: "Setel",
    role: "Software Engineer Intern",
    period: "Jul 2025 – Dec 2025",
    employmentKind: "Internship",
    facts: [
      "Authorization and capture of stored payment methods on the payment engine.",
      "Checkout and capture documented so a new developer could follow the path without a walkthrough.",
    ],
    headline: "SETEL RECRUITS NEW HANDS ON THE PAYMENT ENGINE",
    collaboration: "Internship. Owned authorization and capture on the payment engine. Concurrent with the Western Digital contract (Jul–Dec 2025).",
  },
  westernDigital: {
    organization: "Western Digital",
    role: "Full-stack Engineer",
    period: "Feb 2025 – Dec 2025",
    employmentKind: "Contract",
    facts: [
      "Lab dashboard with role-based access for 50+ staff.",
      "CRUD and analytics behind those roles.",
    ],
    oversight:
      "Manual station-checking on the lab dashboard — operators verifying station status by hand rather than reading it on the board.",
    latency:
      "shortest path between stations in under 100 ms of UI-visible latency on that dashboard path",
    headline: "WESTERN DIGITAL ADDS NEW HANDS ON THE LAB FLOOR",
    collaboration: "Contract. Owned the lab dashboard used by 50+ lab staff. Concurrent with the Setel internship from July 2025.",
  },
  monash: {
    organization: "Monash University",
    role: "Contract Full-stack AI Engineer",
    period: "Nov 2025 – Feb 2026",
    employmentKind: "Contract",
    cypher:
      "self-correcting Text-to-Cypher — generated graph queries, checked failures, and retried malformed Cypher automatically",
    contradictions:
      "inconsistencies between rules in the graph surfaced for administrators (examples confidential)",
    collaboration:
      "Contract. Owned the GraphRAG retrieval path and the distilled graph-logic SLM; surrounding function was university administration tools.",
  },
} as const;

export function deskFactLine(
  desk: { organization: string; role: string; period: string; facts: readonly string[] },
): string {
  return `${desk.organization} — ${desk.role}, ${desk.period}. ${desk.facts.join(" ")}`;
}
