/** Arrow keys step the scoresheet only when a chess control has focus. */

const CHESS_UI =
  "[data-chess-keys], [data-testid='board-column'], [data-testid='board-plane'], [data-testid='board-diagram'], [data-testid='notation-view'], [data-testid='tree-view'], [data-testid='glass-engine'], [data-testid='board-step-prev'], [data-testid='board-step-next'], [data-testid='read-the-game'], [data-testid='play-the-position']";

export function isChessKeyTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return false;
  if (target.closest("a, button.masthead-chip")) return false;
  return Boolean(target.closest(CHESS_UI));
}
