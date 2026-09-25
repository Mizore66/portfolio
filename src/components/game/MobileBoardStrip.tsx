/**
 * Mobile only (brief §7 B): a slim strip at the top edge. The bar shows the evaluation of the
 * current position; the violet line under it is reading progress, driven by CSS scroll timelines
 * (no scroll listeners). Tapping it goes to the board.
 */
export function MobileBoardStrip({ move, evalCp }: { move: string; evalCp: number }) {
  const white = 100 / (1 + Math.pow(10, -evalCp / 400));
  return (
    <a href="#the-game" className="mobile-strip">
      <span className="mobile-strip-bar" aria-hidden="true">
        <span style={{ width: `${white}%` }} />
      </span>
      <span className="mobile-strip-label">
        Board · <span className="claim-value">{move}</span>
      </span>
      <span className="mobile-strip-progress" aria-hidden="true" />
    </a>
  );
}
