/** Pure black and white (brief §7 B). White's share grows with White's advantage. */
export function EvalBar({ evalCp }: { evalCp: number | null }) {
  const white = evalCp === null ? 50 : 100 / (1 + Math.pow(10, -evalCp / 400));
  return (
    <div className="gb-evalbar" aria-hidden="true">
      <div className="gb-evalbar-white" style={{ height: `${white}%` }} />
    </div>
  );
}
