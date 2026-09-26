type Gate = { label: string; detail: string; elo: number; err: number; games: number; record: string };

/** Elo by gate (brief Appendix B), drawn from the match receipts. Zero is the control; bars grow from it. */
export function EloChart({ gates }: { gates: readonly Gate[] }) {
  const W = 640;
  const ROW = 64;
  const LEFT = 170;
  const RIGHT = 70;
  const H = gates.length * ROW + 34;
  const min = Math.min(-200, ...gates.map((g) => g.elo - g.err));
  const max = 50;
  const x = (v: number) => LEFT + ((v - min) / (max - min)) * (W - LEFT - RIGHT);
  const ticks = [-200, -150, -100, -50, 0];
  return (
    <figure className="elo-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="elo-caption" style={{ maxWidth: W }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={8} y2={H - 26} className={t === 0 ? "cg-zero" : "cg-grid"} />
            <text x={x(t)} y={H - 8} textAnchor="middle" className="cg-tick">
              {t === 0 ? "0" : `${t}`}
            </text>
          </g>
        ))}
        {gates.map((g, i) => {
          const cy = 16 + i * ROW + ROW / 2 - 12;
          const a = x(Math.min(0, g.elo));
          const b = x(Math.max(0, g.elo));
          return (
            <g key={g.label}>
              <text x={0} y={cy - 4} className="elo-label">
                {g.label}
              </text>
              <text x={0} y={cy + 13} className="cg-tick">
                {g.games} games · {g.record}
              </text>
              {g.elo === 0 ? (
                <line x1={x(0)} x2={x(0)} y1={cy - 11} y2={cy + 11} className="elo-zero-mark" />
              ) : (
                <rect x={a} y={cy - 11} width={b - a} height={22} className="elo-bar" />
              )}
              {g.err ? (
                <g className="elo-err">
                  <line x1={x(g.elo - g.err)} x2={x(g.elo + g.err)} y1={cy} y2={cy} />
                  <line x1={x(g.elo - g.err)} x2={x(g.elo - g.err)} y1={cy - 6} y2={cy + 6} />
                  <line x1={x(g.elo + g.err)} x2={x(g.elo + g.err)} y1={cy - 6} y2={cy + 6} />
                </g>
              ) : null}
              <text x={x(Math.max(0, g.elo)) + 8} y={cy + 4} className="elo-value">
                {g.elo === 0 ? "0.0" : `${g.elo.toFixed(1)} ±${g.err}`}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption id="elo-caption">
        Elo by gate at 50,000 nodes a move. {gates.map((g) => `${g.label} (${g.detail}): ${g.elo === 0 ? "0.0" : `${g.elo.toFixed(1)} ±${g.err}`} Elo over ${g.games} games, ${g.record}.`).join(" ")}
      </figcaption>
    </figure>
  );
}
