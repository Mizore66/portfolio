import type { ApparatusSpec } from "@/lib/opening/types";

/**
 * Patent-drawing specs. Future corrections are data-only: parts, labels, flow, confidence.
 * Glyph art lives in the shared SVG library and is not edited per figure.
 *
 * Architecture notes (reconstructed from resume copy + this repo, then reviewed):
 * - Employer figures use generic part names only. No internal system names.
 * - Metrics in mapsTo are only those already public in the résumé.
 * - Presumed parts carry the scoresheet dagger: "† composed from the archives".
 */
export const FIGURES = {
  e4: {
    fig: 1,
    function: "AN ENGINEERING EDUCATION",
    filed: "May 2026",
    viewBox: { w: 640, h: 300 },
    layout: "elevation",
    flow: [1, 2, 3, 4, 5, 6],
    review: {
      status: "validated",
      notes:
        "Metaphor-only, as approved. Crucible/molds/cases are not a campus architecture. Degree metrics (WAM, CGPA, graduation) are résumé-public; the foundry mapping is presumed.",
    },
    parts: [
      { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "the curriculum", confidence: "presumed", x: 40, y: 10, w: 72, h: 50, callout: { x: 20, y: 22 } },
      { n: 2, glyph: "crucible", label: "CRUCIBLE", mapsTo: "data structures", confidence: "presumed", x: 34, y: 52, w: 108, h: 92, callout: { x: 18, y: 150 } },
      { n: 3, glyph: "funnel", label: "FUNNEL", mapsTo: "lectures into practice", confidence: "presumed", x: 132, y: 64, w: 50, h: 72, callout: { x: 168, y: 28 } },
      { n: 4, glyph: "mold", label: "MOLD", mapsTo: "systems", confidence: "presumed", x: 172, y: 102, w: 86, h: 72, callout: { x: 248, y: 36 } },
      { n: 5, glyph: "roller", label: "ROLLER", mapsTo: "the press of coursework", confidence: "presumed", x: 248, y: 110, w: 100, h: 58, callout: { x: 348, y: 40 } },
      { n: 6, glyph: "typecase", label: "TYPE CASE", mapsTo: "theory", confidence: "presumed", x: 340, y: 68, w: 124, h: 128, callout: { x: 468, y: 28 } },
      { n: 7, glyph: "gauge", label: "GAUGE", mapsTo: "WAM 82.1 · CGPA 3.82", confidence: "confirmed", x: 478, y: 24, w: 56, h: 56, callout: { x: 612, y: 42 } },
      { n: 8, glyph: "ledger", label: "LEDGER", mapsTo: "the degree, May 2026", confidence: "confirmed", x: 476, y: 168, w: 96, h: 74, callout: { x: 612, y: 220 } },
    ],
  },
  nf3: {
    fig: 2,
    function: "RE-POWERING A MILL",
    filed: "Nov. 2024",
    viewBox: { w: 640, h: 300 },
    layout: "elevation",
    flow: [1, 2, 5, 3, 4, 7],
    review: {
      status: "validated",
      notes:
        "Petronas, generic names only. Licensed mill → open-source mill is the public MATLAB→Python overhaul. Belts are the test cases. Ledger is −20% cost. Idle wheel is the old mill; the desk mill beside the path is the remaining licensed tool. No internal plant names.",
    },
    parts: [
      { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "source models", confidence: "presumed", x: 52, y: 8, w: 70, h: 50, callout: { x: 22, y: 24 } },
      { n: 2, glyph: "millwheel", label: "MILLWHEEL", mapsTo: "licensed mill, idle", confidence: "confirmed", x: 18, y: 52, w: 148, h: 148, callout: { x: 22, y: 72 }, dusty: true, idle: true },
      { n: 3, glyph: "belt", label: "BELT", mapsTo: "test suite proving identical output", confidence: "confirmed", x: 142, y: 98, w: 168, h: 58, callout: { x: 228, y: 36 }, slack: true },
      { n: 4, glyph: "boiler", label: "BOILER", mapsTo: "open-source mill", confidence: "confirmed", x: 292, y: 64, w: 176, h: 148, callout: { x: 402, y: 28 } },
      { n: 5, glyph: "valve", label: "VALVE", mapsTo: "cutover", confidence: "presumed", x: 268, y: 28, w: 54, h: 50, callout: { x: 272, y: 22 } },
      { n: 6, glyph: "funnel", label: "FUNNEL", mapsTo: "desk mill, not this path", confidence: "confirmed", x: 188, y: 188, w: 48, h: 58, callout: { x: 228, y: 268 }, idle: true, dusty: true },
      { n: 7, glyph: "gauge", label: "GAUGE", mapsTo: "+30% efficiency", confidence: "confirmed", x: 478, y: 22, w: 54, h: 54, callout: { x: 612, y: 42 } },
      { n: 8, glyph: "ledger", label: "LEDGER", mapsTo: "−20% department cost", confidence: "confirmed", x: 490, y: 170, w: 96, h: 74, callout: { x: 612, y: 220 } },
    ],
  },
  nc6: {
    fig: 3,
    function: "A PNEUMATIC-TUBE EXCHANGE",
    filed: "Jul. 2025",
    viewBox: { w: 640, h: 300 },
    layout: "isometric",
    flow: [1, 2, 3, 4, 5, 6, 7],
    review: {
      status: "validated",
      notes:
        "Setel payments, generic names only. Authorization and capture are résumé-public. Capsules are transactions. One-capsule-per-tube is presumed idempotency — not named in the copy. Seal is the public 92.5% coverage. No internal payment-product names.",
    },
    parts: [
      { n: 1, glyph: "hopper", label: "INTAKE", mapsTo: "checkout", confidence: "presumed", x: 20, y: 10, w: 76, h: 52, callout: { x: 18, y: 22 } },
      { n: 2, glyph: "valve", label: "VALVE", mapsTo: "authorization", confidence: "confirmed", x: 32, y: 56, w: 54, h: 50, callout: { x: 18, y: 92 } },
      { n: 3, glyph: "tube", label: "TUBE", mapsTo: "the conduit", confidence: "presumed", x: 72, y: 92, w: 300, h: 70, callout: { x: 168, y: 28 } },
      { n: 4, glyph: "capsule", label: "CAPSULE", mapsTo: "a payment", confidence: "confirmed", x: 168, y: 106, w: 70, h: 40, callout: { x: 196, y: 72 } },
      { n: 5, glyph: "governor", label: "GOVERNOR", mapsTo: "one capsule per tube", confidence: "presumed", x: 236, y: 14, w: 86, h: 92, callout: { x: 292, y: 18 } },
      { n: 6, glyph: "vault", label: "VAULT", mapsTo: "capture", confidence: "confirmed", x: 348, y: 58, w: 132, h: 168, callout: { x: 428, y: 28 } },
      { n: 7, glyph: "seal", label: "SEAL PRESS", mapsTo: "92.5% coverage", confidence: "confirmed", x: 488, y: 28, w: 78, h: 104, callout: { x: 612, y: 48 } },
      { n: 8, glyph: "gauge", label: "GAUGE", mapsTo: "−40% production defects", confidence: "confirmed", x: 520, y: 172, w: 54, h: 54, callout: { x: 612, y: 200 } },
    ],
  },
  bc4: {
    fig: 4,
    function: "A LABORATORY CONTROL CONSOLE",
    filed: "Feb. 2025",
    viewBox: { w: 640, h: 300 },
    layout: "elevation",
    flow: [1, 2, 3, 4, 5, 6, 7, 8],
    review: {
      status: "validated",
      notes:
        "Western Digital, generic names only. Gauge panel is lab systems. Three keys are the public RBAC roles. Telegraph is the live line to the model (WebSocket in the copy). Relay is <100 ms. No dashboard UI, no internal lab names.",
    },
    parts: [
      { n: 1, glyph: "gaugepanel", label: "GAUGE PANEL", mapsTo: "lab systems", confidence: "confirmed", x: 20, y: 18, w: 250, h: 100, callout: { x: 22, y: 22 } },
      { n: 2, glyph: "key", label: "KEY", mapsTo: "administrator", confidence: "confirmed", x: 28, y: 122, w: 56, h: 78, callout: { x: 22, y: 168 } },
      { n: 3, glyph: "key", label: "KEY", mapsTo: "operator", confidence: "confirmed", x: 92, y: 122, w: 56, h: 78, callout: { x: 122, y: 268 } },
      { n: 4, glyph: "key", label: "KEY", mapsTo: "superuser", confidence: "confirmed", x: 156, y: 122, w: 56, h: 78, callout: { x: 196, y: 268 } },
      { n: 5, glyph: "telegraph", label: "TELEGRAPH", mapsTo: "live line to the model", confidence: "confirmed", x: 228, y: 132, w: 92, h: 68, callout: { x: 292, y: 268 } },
      { n: 6, glyph: "tube", label: "LINE", mapsTo: "the wire", confidence: "presumed", x: 312, y: 72, w: 168, h: 42, callout: { x: 392, y: 28 } },
      { n: 7, glyph: "relay", label: "RELAY", mapsTo: "<100 ms", confidence: "confirmed", x: 372, y: 18, w: 70, h: 54, callout: { x: 428, y: 18 } },
      { n: 8, glyph: "boiler", label: "DISTANT MILL", mapsTo: "the model", confidence: "presumed", x: 478, y: 72, w: 132, h: 140, callout: { x: 612, y: 96 } },
    ],
  },
  oo: {
    fig: 5,
    function: "CASTLING",
    filed: "2025",
    viewBox: { w: 640, h: 300 },
    layout: "elevation",
    flow: [2, 3, 1, 4, 5, 6, 7],
    review: {
      status: "validated",
      notes:
        "Reliability chapter mapped onto a Watt governor. The three proofs are résumé-public: 92.5% coverage, role-based access, 99.9% uptime. Castling as engineering — king safety before the central break. No vendor names.",
    },
    parts: [
      { n: 1, glyph: "governor", label: "GOVERNOR", mapsTo: "king safety", confidence: "presumed", x: 198, y: 8, w: 168, h: 204, callout: { x: 288, y: 18 } },
      { n: 2, glyph: "boiler", label: "BOILER", mapsTo: "the plant still running", confidence: "presumed", x: 16, y: 68, w: 140, h: 152, callout: { x: 22, y: 72 } },
      { n: 3, glyph: "belt", label: "BELT", mapsTo: "proofs coupled to the shaft", confidence: "presumed", x: 132, y: 108, w: 90, h: 52, callout: { x: 168, y: 36 } },
      { n: 4, glyph: "valve", label: "VALVE", mapsTo: "throttle before the break", confidence: "presumed", x: 150, y: 28, w: 52, h: 50, callout: { x: 148, y: 22 } },
      { n: 5, glyph: "gauge", label: "GAUGE", mapsTo: "92.5% coverage", confidence: "confirmed", x: 378, y: 18, w: 56, h: 56, callout: { x: 428, y: 18 } },
      { n: 6, glyph: "key", label: "KEY", mapsTo: "role-based access", confidence: "confirmed", x: 382, y: 98, w: 56, h: 78, callout: { x: 468, y: 140 } },
      { n: 7, glyph: "gauge", label: "GAUGE", mapsTo: "99.9% uptime", confidence: "confirmed", x: 470, y: 18, w: 56, h: 56, callout: { x: 612, y: 42 } },
      { n: 8, glyph: "ledger", label: "LEDGER", mapsTo: "the reliability proofs", confidence: "confirmed", x: 468, y: 158, w: 100, h: 76, callout: { x: 612, y: 220 } },
    ],
  },
} as const satisfies Record<string, ApparatusSpec>;

/** 5. d4 exhibit page only — scoresheet d4 keeps the Veridian plate. */
export const VERIDIAN_PRESS: ApparatusSpec = {
  fig: 6,
  function: "PRINTING THE MORNING EDITION",
  filed: "Apr. 2026",
  viewBox: { w: 640, h: 300 },
  layout: "elevation",
  flow: [1, 2, 3, 4, 5, 6, 7],
  review: {
    status: "validated",
    notes:
      "Veridian exhibit. Paper stock = infrastructure plans; composing room = graph retrieval; stereotype = distilled model; edition = recommendations. 99.9% uptime is résumé-public. No internal service names.",
  },
  parts: [
    { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "paper stock — infrastructure plans", confidence: "confirmed", x: 16, y: 8, w: 82, h: 56, callout: { x: 18, y: 22 } },
    { n: 2, glyph: "funnel", label: "FUNNEL", mapsTo: "the intercept", confidence: "presumed", x: 32, y: 56, w: 52, h: 58, callout: { x: 22, y: 120 } },
    { n: 3, glyph: "typecase", label: "COMPOSING ROOM", mapsTo: "graph retrieval", confidence: "confirmed", x: 90, y: 52, w: 122, h: 128, callout: { x: 168, y: 28 } },
    { n: 4, glyph: "mold", label: "STEREOTYPE", mapsTo: "distilled model", confidence: "confirmed", x: 206, y: 82, w: 90, h: 82, callout: { x: 276, y: 36 } },
    { n: 5, glyph: "roller", label: "ROLLER", mapsTo: "the press", confidence: "presumed", x: 288, y: 98, w: 112, h: 62, callout: { x: 380, y: 36 } },
    { n: 6, glyph: "belt", label: "BELT", mapsTo: "the run", confidence: "presumed", x: 388, y: 104, w: 78, h: 50, callout: { x: 468, y: 72 } },
    { n: 7, glyph: "ledger", label: "EDITION", mapsTo: "the morning recommendations", confidence: "confirmed", x: 458, y: 82, w: 112, h: 86, callout: { x: 612, y: 110 } },
    { n: 8, glyph: "gauge", label: "GAUGE", mapsTo: "99.9% uptime", confidence: "confirmed", x: 520, y: 14, w: 56, h: 56, callout: { x: 612, y: 36 } },
  ],
};
