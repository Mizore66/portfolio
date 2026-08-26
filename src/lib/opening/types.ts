export type NodeType = "mainline" | "life" | "variation" | "not-taken";
export type Side = "w" | "b";

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
  /** Inked apparatus sketch for a technical/career chapter. */
  figure?: { name: string; tech: string[] };
  /** Quarter-column engraving for a life branch. */
  spot?: "trail" | "clock";
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
