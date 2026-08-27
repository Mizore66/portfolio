import type { ApparatusSpec } from "@/lib/opening/types";

/**
 * Patent-drawing specs. Future corrections are data-only: parts, labels, flow, numerals, confidence.
 * Glyph art lives in the shared SVG library and is not edited per figure.
 *
 * Sheet: 720×540. Header occupies y=0–74. Fig.1. elevation sits on a bedplate
 * around y=290. Fig.2. occupies the lower third. Signatures sit on the foot.
 */
const SHEET = { w: 720, h: 540 };

export const FIGURES = {
  e4: {
    fig: 1,
    move: "1. e4",
    function: "AN ENGINEERING EDUCATION",
    filed: "May 2026",
    viewBox: SHEET,
    layout: "elevation",
    flow: [1, 2, 3, 4, 5, 6],
    review: {
      status: "validated",
      notes:
        "Metaphor-only, as approved. Crucible/molds/cases are not a campus architecture. Degree metrics are résumé-public; the foundry mapping is presumed.",
    },
    parts: [
      { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "the curriculum", confidence: "presumed", x: 62, y: 84, w: 92, h: 58, callout: { x: 48, y: 92 } },
      { n: 2, glyph: "crucible", label: "CRUCIBLE", mapsTo: "data structures", confidence: "presumed", x: 50, y: 128, w: 132, h: 112, callout: { x: 36, y: 200 } },
      { n: 3, glyph: "funnel", label: "FUNNEL", mapsTo: "lectures into practice", confidence: "presumed", x: 168, y: 150, w: 52, h: 78, callout: { x: 196, y: 132 } },
      { n: 4, glyph: "mold", label: "MOLD", mapsTo: "systems", confidence: "presumed", x: 208, y: 164, w: 108, h: 92, callout: { x: 262, y: 148 } },
      { n: 5, glyph: "roller", label: "ROLLER", mapsTo: "the press of coursework", confidence: "presumed", x: 300, y: 182, w: 132, h: 64, callout: { x: 366, y: 164 } },
      { n: 6, glyph: "typecase", label: "TYPE CASE", mapsTo: "theory", confidence: "presumed", x: 418, y: 128, w: 140, h: 132, callout: { x: 558, y: 140 } },
      { n: 7, glyph: "gauge", label: "GAUGE", mapsTo: "WAM 82.1 · CGPA 3.82", confidence: "confirmed", x: 568, y: 86, w: 56, h: 56, callout: { x: 648, y: 100 } },
      { n: 8, glyph: "ledger", label: "LEDGER", mapsTo: "the degree, May 2026", confidence: "confirmed", x: 560, y: 196, w: 108, h: 80, callout: { x: 688, y: 248 } },
    ],
    numerals: [
      { mark: "1", x: 48, y: 92, fromX: 78, fromY: 88 },
      { mark: "2", x: 36, y: 200, fromX: 62, fromY: 196 },
      { mark: "3", x: 196, y: 132, fromX: 196, fromY: 154 },
      { mark: "4", x: 262, y: 148, fromX: 262, fromY: 168 },
      { mark: "4a", x: 262, y: 276, fromX: 262, fromY: 252 },
      { mark: "5", x: 366, y: 164, fromX: 366, fromY: 186 },
      { mark: "6", x: 558, y: 140, fromX: 552, fromY: 148 },
      { mark: "6a", x: 558, y: 276, fromX: 488, fromY: 252 },
      { mark: "7", x: 648, y: 100, fromX: 620, fromY: 100 },
      { mark: "8", x: 688, y: 248, fromX: 664, fromY: 240 },
    ],
    detail: {
      title: "vertical section of the mold",
      parts: [
        { n: 4, glyph: "mold", label: "MOLD", mapsTo: "systems", confidence: "presumed", x: 72, y: 362, w: 210, h: 88, callout: { x: 60, y: 380 }, section: true },
      ],
    },
  },
  nf3: {
    fig: 2,
    move: "2. Nf3",
    function: "RE-POWERING A MILL",
    filed: "Nov. 2024",
    viewBox: SHEET,
    layout: "elevation",
    flow: [1, 2, 5, 3, 4, 7],
    review: {
      status: "validated",
      notes:
        "Petronas, generic names only. Licensed mill → open-source mill is the public MATLAB→Python overhaul. Belts are the test cases. Ledger is −20% cost. No internal plant names.",
    },
    parts: [
      { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "source models", confidence: "presumed", x: 78, y: 82, w: 74, h: 52, callout: { x: 52, y: 90 } },
      { n: 2, glyph: "millwheel", label: "MILLWHEEL", mapsTo: "licensed mill, idle", confidence: "confirmed", x: 36, y: 118, w: 176, h: 176, callout: { x: 28, y: 140 }, dusty: true, idle: true },
      { n: 3, glyph: "belt", label: "BELT", mapsTo: "test suite proving identical output", confidence: "confirmed", x: 188, y: 176, w: 172, h: 64, callout: { x: 274, y: 156 }, slack: true },
      { n: 4, glyph: "boiler", label: "BOILER", mapsTo: "open-source mill", confidence: "confirmed", x: 336, y: 136, w: 192, h: 156, callout: { x: 432, y: 122 } },
      { n: 5, glyph: "valve", label: "VALVE", mapsTo: "cutover", confidence: "presumed", x: 298, y: 102, w: 54, h: 52, callout: { x: 288, y: 96 } },
      { n: 6, glyph: "funnel", label: "FUNNEL", mapsTo: "desk mill, not this path", confidence: "confirmed", x: 228, y: 236, w: 48, h: 54, callout: { x: 252, y: 308 }, idle: true, dusty: true },
      { n: 7, glyph: "gauge", label: "GAUGE", mapsTo: "+30% efficiency", confidence: "confirmed", x: 544, y: 90, w: 56, h: 56, callout: { x: 620, y: 100 } },
      { n: 8, glyph: "ledger", label: "LEDGER", mapsTo: "−20% department cost", confidence: "confirmed", x: 548, y: 210, w: 100, h: 76, callout: { x: 672, y: 248 } },
    ],
    numerals: [
      { mark: "1", x: 52, y: 90, fromX: 96, fromY: 86 },
      { mark: "2", x: 28, y: 140, fromX: 48, fromY: 160 },
      { mark: "2a", x: 28, y: 292, fromX: 70, fromY: 280 },
      { mark: "3", x: 274, y: 156, fromX: 274, fromY: 180 },
      { mark: "4", x: 432, y: 122, fromX: 420, fromY: 144 },
      { mark: "4a", x: 432, y: 312, fromX: 432, fromY: 288 },
      { mark: "5", x: 288, y: 96, fromX: 320, fromY: 110 },
      { mark: "6", x: 252, y: 308, fromX: 252, fromY: 286 },
      { mark: "7", x: 620, y: 100, fromX: 596, fromY: 104 },
      { mark: "8", x: 672, y: 248, fromX: 644, fromY: 242 },
    ],
    detail: {
      title: "section of the driving pulley",
      parts: [
        { n: 3, glyph: "belt", label: "BELT", mapsTo: "test suite", confidence: "confirmed", x: 64, y: 362, w: 260, h: 80, callout: { x: 54, y: 380 } },
      ],
    },
  },
  nc6: {
    fig: 3,
    move: "2…Nc6",
    function: "A PNEUMATIC-TUBE EXCHANGE",
    filed: "Jul. 2025",
    viewBox: SHEET,
    layout: "elevation",
    flow: [1, 2, 3, 4, 5, 6, 7],
    review: {
      status: "validated",
      notes:
        "Setel payments, generic names only. Authorization and capture are résumé-public. Capsules are transactions. One-capsule-per-tube is presumed idempotency. Seal is 92.5% coverage.",
    },
    parts: [
      { n: 1, glyph: "hopper", label: "INTAKE", mapsTo: "checkout", confidence: "presumed", x: 46, y: 90, w: 84, h: 60, callout: { x: 36, y: 102 } },
      { n: 2, glyph: "valve", label: "VALVE", mapsTo: "authorization", confidence: "confirmed", x: 62, y: 148, w: 58, h: 54, callout: { x: 36, y: 172 } },
      { n: 3, glyph: "tube", label: "TUBE", mapsTo: "the conduit", confidence: "presumed", x: 32, y: 184, w: 648, h: 82, callout: { x: 176, y: 168 } },
      { n: 4, glyph: "capsule", label: "CAPSULE", mapsTo: "a payment", confidence: "confirmed", x: 198, y: 204, w: 74, h: 34, callout: { x: 236, y: 176 } },
      { n: 5, glyph: "governor", label: "GOVERNOR", mapsTo: "one capsule per tube", confidence: "presumed", x: 292, y: 84, w: 112, h: 120, callout: { x: 348, y: 76 } },
      { n: 6, glyph: "vault", label: "VAULT", mapsTo: "capture", confidence: "confirmed", x: 428, y: 146, w: 152, h: 154, callout: { x: 504, y: 132 } },
      { n: 7, glyph: "seal", label: "SEAL PRESS", mapsTo: "92.5% coverage", confidence: "confirmed", x: 586, y: 92, w: 84, h: 102, callout: { x: 688, y: 108 } },
      { n: 8, glyph: "gauge", label: "GAUGE", mapsTo: "−40% production defects", confidence: "confirmed", x: 640, y: 248, w: 50, h: 50, callout: { x: 704, y: 268 } },
    ],
    numerals: [
      { mark: "1", x: 36, y: 102, fromX: 64, fromY: 96 },
      { mark: "2", x: 36, y: 172, fromX: 68, fromY: 172 },
      { mark: "3", x: 176, y: 168, fromX: 176, fromY: 190 },
      { mark: "3a", x: 176, y: 284, fromX: 176, fromY: 260 },
      { mark: "4", x: 236, y: 176, fromX: 236, fromY: 206 },
      { mark: "5", x: 348, y: 76, fromX: 348, fromY: 90 },
      { mark: "6", x: 504, y: 132, fromX: 504, fromY: 150 },
      { mark: "6a", x: 504, y: 316, fromX: 504, fromY: 296 },
      { mark: "7", x: 688, y: 108, fromX: 662, fromY: 112 },
      { mark: "8", x: 704, y: 268, fromX: 686, fromY: 268 },
    ],
    detail: {
      title: "station cut open, capsule in transit",
      parts: [
        { n: 3, glyph: "tube", label: "TUBE", mapsTo: "the conduit", confidence: "presumed", x: 56, y: 362, w: 420, h: 80, callout: { x: 48, y: 380 }, section: true },
        { n: 4, glyph: "capsule", label: "CAPSULE", mapsTo: "a payment", confidence: "confirmed", x: 210, y: 382, w: 90, h: 36, callout: { x: 254, y: 364 } },
      ],
    },
  },
  bc4: {
    fig: 4,
    move: "3. Bc4",
    function: "A LABORATORY CONTROL CONSOLE",
    filed: "Feb. 2025",
    viewBox: SHEET,
    layout: "elevation",
    flow: [1, 2, 3, 4, 5, 6, 7, 8],
    review: {
      status: "validated",
      notes:
        "Western Digital, generic names only. Gauge panel is lab systems. Three keys are the public RBAC roles. Telegraph is the live line to the model. Relay is <100 ms.",
    },
    parts: [
      { n: 1, glyph: "gaugepanel", label: "GAUGE PANEL", mapsTo: "lab systems", confidence: "confirmed", x: 44, y: 92, w: 276, h: 112, callout: { x: 36, y: 100 } },
      { n: 2, glyph: "key", label: "KEY", mapsTo: "administrator", confidence: "confirmed", x: 54, y: 206, w: 52, h: 80, callout: { x: 36, y: 248 } },
      { n: 3, glyph: "key", label: "KEY", mapsTo: "operator", confidence: "confirmed", x: 116, y: 206, w: 52, h: 80, callout: { x: 142, y: 304 } },
      { n: 4, glyph: "key", label: "KEY", mapsTo: "superuser", confidence: "confirmed", x: 178, y: 206, w: 52, h: 80, callout: { x: 204, y: 304 } },
      { n: 5, glyph: "telegraph", label: "TELEGRAPH", mapsTo: "live line to the model", confidence: "confirmed", x: 238, y: 210, w: 94, h: 72, callout: { x: 286, y: 304 } },
      { n: 6, glyph: "tube", label: "LINE", mapsTo: "the wire", confidence: "presumed", x: 320, y: 162, w: 196, h: 46, callout: { x: 418, y: 144 } },
      { n: 7, glyph: "relay", label: "RELAY", mapsTo: "<100 ms", confidence: "confirmed", x: 388, y: 92, w: 76, h: 58, callout: { x: 426, y: 82 } },
      { n: 8, glyph: "boiler", label: "DISTANT MILL", mapsTo: "the model", confidence: "presumed", x: 516, y: 140, w: 148, h: 152, callout: { x: 688, y: 156 } },
    ],
    numerals: [
      { mark: "1", x: 36, y: 100, fromX: 52, fromY: 104 },
      { mark: "1a", x: 36, y: 164, fromX: 68, fromY: 156 },
      { mark: "2", x: 36, y: 248, fromX: 68, fromY: 248 },
      { mark: "3", x: 142, y: 304, fromX: 142, fromY: 282 },
      { mark: "4", x: 204, y: 304, fromX: 204, fromY: 282 },
      { mark: "5", x: 286, y: 304, fromX: 286, fromY: 278 },
      { mark: "6", x: 418, y: 144, fromX: 418, fromY: 166 },
      { mark: "7", x: 426, y: 82, fromX: 426, fromY: 96 },
      { mark: "8", x: 688, y: 156, fromX: 660, fromY: 164 },
      { mark: "8a", x: 688, y: 280, fromX: 650, fromY: 276 },
    ],
    detail: {
      title: "the relay, enlarged",
      parts: [
        { n: 7, glyph: "relay", label: "RELAY", mapsTo: "<100 ms", confidence: "confirmed", x: 64, y: 362, w: 220, h: 88, callout: { x: 54, y: 380 } },
      ],
    },
  },
  oo: {
    fig: 5,
    move: "4. O-O",
    function: "CASTLING",
    filed: "2025",
    viewBox: SHEET,
    layout: "elevation",
    flow: [2, 3, 1, 4, 5, 6, 7],
    review: {
      status: "validated",
      notes:
        "Reliability chapter mapped onto a Watt governor. The three proofs are résumé-public: 92.5% coverage, role-based access, 99.9% uptime.",
    },
    parts: [
      { n: 1, glyph: "governor", label: "GOVERNOR", mapsTo: "king safety", confidence: "presumed", x: 288, y: 80, w: 184, h: 214, callout: { x: 380, y: 72 } },
      { n: 2, glyph: "boiler", label: "BOILER", mapsTo: "the plant still running", confidence: "presumed", x: 44, y: 142, w: 180, h: 152, callout: { x: 32, y: 196 } },
      { n: 3, glyph: "belt", label: "BELT", mapsTo: "proofs coupled to the shaft", confidence: "presumed", x: 198, y: 176, w: 118, h: 64, callout: { x: 256, y: 156 } },
      { n: 4, glyph: "valve", label: "VALVE", mapsTo: "throttle before the break", confidence: "presumed", x: 164, y: 106, w: 54, h: 52, callout: { x: 152, y: 96 } },
      { n: 5, glyph: "gauge", label: "GAUGE", mapsTo: "92.5% coverage", confidence: "confirmed", x: 500, y: 90, w: 56, h: 56, callout: { x: 576, y: 100 } },
      { n: 6, glyph: "key", label: "KEY", mapsTo: "role-based access", confidence: "confirmed", x: 512, y: 168, w: 52, h: 82, callout: { x: 584, y: 204 } },
      { n: 7, glyph: "gauge", label: "GAUGE", mapsTo: "99.9% uptime", confidence: "confirmed", x: 588, y: 90, w: 56, h: 56, callout: { x: 664, y: 100 } },
      { n: 8, glyph: "ledger", label: "LEDGER", mapsTo: "the reliability proofs", confidence: "confirmed", x: 576, y: 204, w: 100, h: 76, callout: { x: 696, y: 248 } },
    ],
    numerals: [
      { mark: "1", x: 380, y: 72, fromX: 380, fromY: 88 },
      { mark: "1a", x: 272, y: 196, fromX: 304, fromY: 196 },
      { mark: "1b", x: 490, y: 196, fromX: 456, fromY: 196 },
      { mark: "1c", x: 380, y: 312, fromX: 380, fromY: 290 },
      { mark: "2", x: 32, y: 196, fromX: 52, fromY: 196 },
      { mark: "2a", x: 36, y: 132, fromX: 88, fromY: 152 },
      { mark: "3", x: 256, y: 156, fromX: 256, fromY: 180 },
      { mark: "4", x: 152, y: 96, fromX: 186, fromY: 114 },
      { mark: "5", x: 576, y: 100, fromX: 552, fromY: 104 },
      { mark: "6", x: 584, y: 204, fromX: 560, fromY: 204 },
      { mark: "7", x: 664, y: 100, fromX: 640, fromY: 104 },
      { mark: "8", x: 696, y: 248, fromX: 672, fromY: 244 },
    ],
    detail: {
      title: "vertical section of the flyball head",
      parts: [
        { n: 1, glyph: "governor", label: "GOVERNOR", mapsTo: "king safety", confidence: "presumed", x: 72, y: 360, w: 140, h: 92, callout: { x: 60, y: 380 }, section: true },
      ],
    },
  },
} as const satisfies Record<string, ApparatusSpec>;

export const VERIDIAN_PRESS: ApparatusSpec = {
  fig: 6,
  move: "5. d4",
  function: "PRINTING THE MORNING EDITION",
  filed: "Apr. 2026",
  viewBox: SHEET,
  layout: "elevation",
  flow: [1, 2, 3, 4, 5, 6, 7],
  review: {
    status: "validated",
    notes:
      "Veridian exhibit. Paper stock = infrastructure plans; composing room = graph retrieval; stereotype = distilled model; edition = recommendations. 99.9% uptime is résumé-public.",
  },
  parts: [
    { n: 1, glyph: "hopper", label: "HOPPER", mapsTo: "paper stock — infrastructure plans", confidence: "confirmed", x: 44, y: 88, w: 86, h: 58, callout: { x: 36, y: 100 } },
    { n: 2, glyph: "funnel", label: "FUNNEL", mapsTo: "the intercept", confidence: "presumed", x: 64, y: 140, w: 52, h: 60, callout: { x: 36, y: 168 } },
    { n: 3, glyph: "typecase", label: "COMPOSING ROOM", mapsTo: "graph retrieval", confidence: "confirmed", x: 118, y: 132, w: 132, h: 132, callout: { x: 184, y: 116 } },
    { n: 4, glyph: "mold", label: "STEREOTYPE", mapsTo: "distilled model", confidence: "confirmed", x: 246, y: 160, w: 96, h: 86, callout: { x: 294, y: 144 } },
    { n: 5, glyph: "roller", label: "ROLLER", mapsTo: "the press", confidence: "presumed", x: 334, y: 178, w: 124, h: 64, callout: { x: 396, y: 160 } },
    { n: 6, glyph: "belt", label: "BELT", mapsTo: "the run", confidence: "presumed", x: 444, y: 182, w: 92, h: 54, callout: { x: 490, y: 164 } },
    { n: 7, glyph: "ledger", label: "EDITION", mapsTo: "the morning recommendations", confidence: "confirmed", x: 528, y: 160, w: 114, h: 90, callout: { x: 672, y: 172 } },
    { n: 8, glyph: "gauge", label: "GAUGE", mapsTo: "99.9% uptime", confidence: "confirmed", x: 576, y: 88, w: 56, h: 56, callout: { x: 660, y: 100 } },
  ],
  numerals: [
    { mark: "1", x: 36, y: 100, fromX: 66, fromY: 92 },
    { mark: "2", x: 36, y: 168, fromX: 72, fromY: 164 },
    { mark: "3", x: 184, y: 116, fromX: 184, fromY: 138 },
    { mark: "4", x: 294, y: 144, fromX: 294, fromY: 166 },
    { mark: "5", x: 396, y: 160, fromX: 396, fromY: 182 },
    { mark: "6", x: 490, y: 164, fromX: 490, fromY: 186 },
    { mark: "7", x: 672, y: 172, fromX: 636, fromY: 182 },
    { mark: "8", x: 660, y: 100, fromX: 628, fromY: 102 },
    { mark: "5a", x: 396, y: 260, fromX: 396, fromY: 238 },
    { mark: "7a", x: 672, y: 264, fromX: 600, fromY: 244 },
  ],
  detail: {
    title: "the stereotype plate",
    parts: [
      { n: 4, glyph: "mold", label: "STEREOTYPE", mapsTo: "distilled model", confidence: "confirmed", x: 72, y: 362, w: 200, h: 88, callout: { x: 60, y: 380 }, section: true },
    ],
  },
};
