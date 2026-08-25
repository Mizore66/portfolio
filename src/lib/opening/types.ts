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
};
