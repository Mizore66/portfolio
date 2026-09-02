/** Arrow keys step the scoresheet only when a chess control has focus. */

const CHESS_UI =
  "[data-testid='hero-engine'], [data-testid='board-column'], [data-testid='board-plane'], [data-testid='board-diagram'], [data-testid='notation-view'], [data-testid='tree-view'], [data-testid='issue-index'], [data-testid='paper-toc'], [data-testid='wayfind-index'], [data-testid='glass-engine']";

export function isChessKeyTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return false;
  return Boolean(target.closest(CHESS_UI));
}
