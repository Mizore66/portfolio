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
      { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "the curriculum", confidence: "presumed", x: 28, y: 18, w: 72, h: 52, callout: { x: 18, y: 22 } },
      { n: 2, glyph: "crucible", label: "CRUCIBLE", mapsTo: "data structures", confidence: "presumed", x: 36, y: 92, w: 96, h: 86, callout: { x: 18, y: 150 } },
      { n: 3, glyph: "funnel", label: "FUNNEL", mapsTo: "lectures into practice", confidence: "presumed", x: 138, y: 88, w: 52, h: 72, callout: { x: 168, y: 28 } },
      { n: 4, glyph: "mold", label: "MOLD", mapsTo: "systems", confidence: "presumed", x: 198, y: 118, w: 84, h: 72, callout: { x: 248, y: 36 } },
      { n: 5, glyph: "roller", label: "ROLLER", mapsTo: "the press of coursework", confidence: "presumed", x: 292, y: 128, w: 96, h: 58, callout: { x: 348, y: 40 } },
      { n: 6, glyph: "typecase", label: "TYPE CASE", mapsTo: "theory", confidence: "presumed", x: 402, y: 78, w: 118, h: 122, callout: { x: 468, y: 28 } },
      { n: 7, glyph: "gauge", label: "GAUGE", mapsTo: "WAM 82.1 · CGPA 3.82", confidence: "confirmed", x: 536, y: 36, w: 56, h: 56, callout: { x: 612, y: 42 } },
      { n: 8, glyph: "ledger", label: "LEDGER", mapsTo: "the degree, May 2026", confidence: "confirmed", x: 524, y: 178, w: 92, h: 72, callout: { x: 612, y: 220 } },
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
      { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "source models", confidence: "presumed", x: 48, y: 12, w: 70, h: 50, callout: { x: 22, y: 24 } },
      { n: 2, glyph: "millwheel", label: "MILLWHEEL", mapsTo: "licensed mill, idle", confidence: "confirmed", x: 22, y: 78, w: 128, h: 128, callout: { x: 22, y: 72 }, dusty: true, idle: true },
      { n: 3, glyph: "belt", label: "BELT", mapsTo: "test suite proving identical output", confidence: "confirmed", x: 148, y: 108, w: 168, h: 56, callout: { x: 228, y: 36 }, slack: true },
      { n: 4, glyph: "boiler", label: "BOILER", mapsTo: "open-source mill", confidence: "confirmed", x: 318, y: 72, w: 168, h: 138, callout: { x: 402, y: 28 } },
      { n: 5, glyph: "valve", label: "VALVE", mapsTo: "cutover", confidence: "presumed", x: 292, y: 42, w: 52, h: 48, callout: { x: 272, y: 28 } },
      { n: 6, glyph: "funnel", label: "FUNNEL", mapsTo: "desk mill, not this path", confidence: "confirmed", x: 196, y: 198, w: 48, h: 58, callout: { x: 228, y: 268 }, idle: true, dusty: true },
      { n: 7, glyph: "gauge", label: "GAUGE", mapsTo: "+30% efficiency", confidence: "confirmed", x: 492, y: 36, w: 54, h: 54, callout: { x: 612, y: 42 } },
      { n: 8, glyph: "ledger", label: "LEDGER", mapsTo: "−20% department cost", confidence: "confirmed", x: 508, y: 178, w: 96, h: 74, callout: { x: 612, y: 220 } },
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
      { n: 1, glyph: "hopper", label: "INTAKE", mapsTo: "checkout", confidence: "presumed", x: 22, y: 16, w: 72, h: 50, callout: { x: 18, y: 22 } },
      { n: 2, glyph: "valve", label: "VALVE", mapsTo: "authorization", confidence: "confirmed", x: 34, y: 78, w: 52, h: 48, callout: { x: 18, y: 92 } },
      { n: 3, glyph: "tube", label: "TUBE", mapsTo: "the conduit", confidence: "presumed", x: 88, y: 96, w: 268, h: 64, callout: { x: 168, y: 28 } },
      { n: 4, glyph: "capsule", label: "CAPSULE", mapsTo: "a payment", confidence: "confirmed", x: 168, y: 108, w: 56, h: 32, callout: { x: 196, y: 72 } },
      { n: 5, glyph: "governor", label: "GOVERNOR", mapsTo: "one capsule per tube", confidence: "presumed", x: 248, y: 18, w: 78, h: 88, callout: { x: 292, y: 18 } },
      { n: 6, glyph: "vault", label: "VAULT", mapsTo: "capture", confidence: "confirmed", x: 372, y: 68, w: 118, h: 148, callout: { x: 428, y: 28 } },
      { n: 7, glyph: "seal", label: "SEAL PRESS", mapsTo: "92.5% coverage", confidence: "confirmed", x: 504, y: 40, w: 72, h: 96, callout: { x: 612, y: 48 } },
      { n: 8, glyph: "gauge", label: "GAUGE", mapsTo: "−40% production defects", confidence: "confirmed", x: 528, y: 176, w: 54, h: 54, callout: { x: 612, y: 200 } },
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
      { n: 1, glyph: "gaugepanel", label: "GAUGE PANEL", mapsTo: "lab systems", confidence: "confirmed", x: 28, y: 28, w: 210, h: 88, callout: { x: 22, y: 22 } },
      { n: 2, glyph: "key", label: "KEY", mapsTo: "administrator", confidence: "confirmed", x: 36, y: 148, w: 52, h: 72, callout: { x: 22, y: 168 } },
      { n: 3, glyph: "key", label: "KEY", mapsTo: "operator", confidence: "confirmed", x: 98, y: 148, w: 52, h: 72, callout: { x: 122, y: 268 } },
      { n: 4, glyph: "key", label: "KEY", mapsTo: "superuser", confidence: "confirmed", x: 160, y: 148, w: 52, h: 72, callout: { x: 196, y: 268 } },
      { n: 5, glyph: "telegraph", label: "TELEGRAPH", mapsTo: "live line to the model", confidence: "confirmed", x: 246, y: 152, w: 86, h: 64, callout: { x: 292, y: 268 } },
      { n: 6, glyph: "tube", label: "LINE", mapsTo: "the wire", confidence: "presumed", x: 332, y: 88, w: 148, h: 40, callout: { x: 392, y: 28 } },
      { n: 7, glyph: "relay", label: "RELAY", mapsTo: "<100 ms", confidence: "confirmed", x: 392, y: 28, w: 64, h: 52, callout: { x: 428, y: 18 } },
      { n: 8, glyph: "boiler", label: "DISTANT MILL", mapsTo: "the model", confidence: "presumed", x: 492, y: 88, w: 118, h: 128, callout: { x: 612, y: 96 } },
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
      { n: 1, glyph: "governor", label: "GOVERNOR", mapsTo: "king safety", confidence: "presumed", x: 214, y: 16, w: 148, h: 188, callout: { x: 288, y: 18 } },
      { n: 2, glyph: "boiler", label: "BOILER", mapsTo: "the plant still running", confidence: "presumed", x: 28, y: 78, w: 124, h: 138, callout: { x: 22, y: 72 } },
      { n: 3, glyph: "belt", label: "BELT", mapsTo: "proofs coupled to the shaft", confidence: "presumed", x: 148, y: 118, w: 78, h: 50, callout: { x: 168, y: 36 } },
      { n: 4, glyph: "valve", label: "VALVE", mapsTo: "throttle before the break", confidence: "presumed", x: 168, y: 42, w: 50, h: 48, callout: { x: 148, y: 22 } },
      { n: 5, glyph: "gauge", label: "GAUGE", mapsTo: "92.5% coverage", confidence: "confirmed", x: 392, y: 28, w: 54, h: 54, callout: { x: 428, y: 18 } },
      { n: 6, glyph: "key", label: "KEY", mapsTo: "role-based access", confidence: "confirmed", x: 396, y: 112, w: 52, h: 72, callout: { x: 468, y: 140 } },
      { n: 7, glyph: "gauge", label: "GAUGE", mapsTo: "99.9% uptime", confidence: "confirmed", x: 478, y: 28, w: 54, h: 54, callout: { x: 612, y: 42 } },
      { n: 8, glyph: "ledger", label: "LEDGER", mapsTo: "the reliability proofs", confidence: "confirmed", x: 478, y: 168, w: 96, h: 74, callout: { x: 612, y: 220 } },
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
    { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "paper stock — infrastructure plans", confidence: "confirmed", x: 20, y: 16, w: 78, h: 54, callout: { x: 18, y: 22 } },
    { n: 2, glyph: "funnel", label: "FUNNEL", mapsTo: "the intercept", confidence: "presumed", x: 42, y: 84, w: 50, h: 56, callout: { x: 22, y: 120 } },
    { n: 3, glyph: "typecase", label: "COMPOSING ROOM", mapsTo: "graph retrieval", confidence: "confirmed", x: 108, y: 68, w: 112, h: 118, callout: { x: 168, y: 28 } },
    { n: 4, glyph: "mold", label: "STEREOTYPE", mapsTo: "distilled model", confidence: "confirmed", x: 236, y: 96, w: 84, h: 78, callout: { x: 276, y: 36 } },
    { n: 5, glyph: "roller", label: "ROLLER", mapsTo: "the press", confidence: "presumed", x: 332, y: 108, w: 100, h: 58, callout: { x: 380, y: 36 } },
    { n: 6, glyph: "belt", label: "BELT", mapsTo: "the run", confidence: "presumed", x: 432, y: 118, w: 70, h: 46, callout: { x: 468, y: 72 } },
    { n: 7, glyph: "ledger", label: "EDITION", mapsTo: "the morning recommendations", confidence: "confirmed", x: 508, y: 96, w: 104, h: 80, callout: { x: 612, y: 110 } },
    { n: 8, glyph: "gauge", label: "GAUGE", mapsTo: "99.9% uptime", confidence: "confirmed", x: 536, y: 22, w: 54, h: 54, callout: { x: 612, y: 36 } },
  ],
};
