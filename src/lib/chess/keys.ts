/** Arrow keys step the scoresheet only when the board itself has focus. */

const BOARD =
  "#play-board, [data-testid='board-plane'], [data-testid='board-diagram']";

export function isChessKeyTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest("input, textarea, select, [contenteditable='true']")) return false;
  return Boolean(target.closest(BOARD));
}
