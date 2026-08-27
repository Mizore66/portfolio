export type NodeType = "mainline" | "variation" | "not-taken";
export type Side = "w" | "b";

export type ApparatusLayer = {
  name: string;
  role: string;
};

/** A machine, not a shopping list joined with arrows. Exhibit pages that are not patent figures still use this. */
export type Apparatus = {
  name: string;
  /** Drawn around the path — containers, orchestrators. Not a hop. */
  runtime?: string;
  /** Top-down request or rewrite path. Arrows only live here. */
  path: ApparatusLayer[];
  /** Fan-out from the last path node. No order among them. */
  forks?: ApparatusLayer[];
  /** Present, but not on this path. */
  beside?: ApparatusLayer[];
};

export const GLYPH_IDS = [
  "tube",
  "valve",
  "hopper",
  "gauge",
  "gaugepanel",
  "roller",
  "belt",
  "boiler",
  "funnel",
  "telegraph",
  "capsule",
  "governor",
  "millwheel",
  "mold",
  "crucible",
  "typecase",
  "vault",
  "seal",
  "key",
  "relay",
  "ledger",
] as const;

export type GlyphId = (typeof GLYPH_IDS)[number];

export type Confidence = "confirmed" | "presumed";

export type ApparatusPart = {
  n: number;
  glyph: GlyphId;
  /** Small-caps name in the legend (MILLWHEEL, VALVE, …). */
  label: string;
  /** Real component, generic for employer figures. */
  mapsTo: string;
  confidence: Confidence;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Leader-line numeral position in the same viewBox. */
  callout: { x: number; y: number };
  /** Attachment on the part the leader leaves from. Defaults to the top-center of the box. */
  anchor?: { x: number; y: number };
  /** Drawn numeral; defaults to String(n). Sub-parts use 1a/1b. */
  mark?: string;
  dusty?: boolean;
  idle?: boolean;
  slack?: boolean;
  /** Fig.2. section cut — 45° hatch only. */
  section?: boolean;
};

export type PatentNumeral = {
  mark: string;
  x: number;
  y: number;
  fromX: number;
  fromY: number;
};

export type ApparatusSpec = {
  fig: number;
  /** Number line, e.g. "4. O-O". */
  move: string;
  /** "APPARATUS FOR …" — the function, not the employer. */
  function: string;
  filed: string;
  viewBox: { w: number; h: number };
  layout: "elevation" | "isometric";
  /** Directional flow of the machine, by legend numeral. */
  flow: number[];
  parts: ApparatusPart[];
  /** Extra reference numerals (1a/1b) plus main marks. 10–16 per sheet. */
  numerals?: PatentNumeral[];
  /** Fig.2. — one detail or cross-section. */
  detail?: { title: string; parts: ApparatusPart[] };
  review: {
    status: "validated";
    /** Why the mapping is allowed: resume-public, metaphor-only, etc. */
    notes: string;
  };
};

export type Artifact = {
  label: string;
  href: string;
};

export type Ply = {
  from: string;
  to: string;
};

export type OpeningNode = {
  id: string;
  type: NodeType;
  parent: string | null;
  fig: string;
  san: string;
  moveNumber: number;
  color: Side | null;
  /** Informant symbol: !! ! !? ?! ? or empty. */
  sym: string;
  /** Opening-style name shown in the tree / scoresheet. */
  label: string;
  kind: string;
  title: string;
  /** The move — career/life fact. */
  fact: string;
  /** The annotation — voice. */
  commentary: string;
  /** Narrative eval in pawn-ish units. Not an engine. */
  eval: number;
  evalText: string;
  artifacts: Artifact[];
  /** Coordinate moves for this node only. Castling is two plies. */
  plies: Ply[];
  hl: [string, string] | null;
  cap: string;
  /** Newspaper plate — flagship and major projects only. */
  plate?: { src: string; caption: string };
  /** Small static diagram in the scoresheet (career figures, castle, flagship, finale). */
  inlineDiagram?: boolean;
  /** Patent-drawing apparatus. A node gets a figure or a plate, never both. */
  figure?: ApparatusSpec;
  /** Declined line: a dashed photo frame, no picture. Caption is the joke. */
  emptyFrame?: string;
  /** Optional one-move diagram quiz. Never a lock. */
  puzzle?: {
    prompt: string;
    target: string;
    hit: string;
    miss: string;
  };
};
