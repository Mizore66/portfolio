import { LATEST_MOVE } from "./game";
import { gameNode, moveLabel } from "./game-tree";

/**
 * The move a major section title is annotated with (brief §4). Each is the
 * latest move of that kind in the game: projects are Black's moves, roles are
 * White's, graduation is 8. cxd4, and contact is the move still to be played.
 */
const SECTION_NODE = {
  work: LATEST_MOVE,
  experience: "deriv",
  education: "graduation",
  contact: "outlook",
} as const;

export type AnnotatedSection = keyof typeof SECTION_NODE;

export function sectionNotation(section: AnnotatedSection): { move: string; sym: string } {
  const n = gameNode(SECTION_NODE[section]);
  return { move: moveLabel(n), sym: n.sym };
}
