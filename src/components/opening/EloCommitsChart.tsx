import { BROADSHEET } from "@/content/opening";

export function EloCommitsChart() {
  const points = BROADSHEET.eloCommits;
  const w = 400;
  const h = 180;
  const pad = { l: 40, r: 72, t: 16, b: 40 };
  const elos = points.map((p) => p.elo);
  const minE = Math.min(0, ...elos) - 5;
  const maxE = Math.max(10, ...elos) + 5;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const last = points.length - 1;
  const x = (i: number) => pad.l + (points.length <= 1 ? innerW / 2 : (i / last) * innerW);
  const y = (elo: number) => pad.t + ((maxE - elo) / (maxE - minE)) * innerH;
  const zeroY = y(0);
  const poly = points.map((p, i) => `${x(i).toFixed(1)},${y(p.elo).toFixed(1)}`).join(" ");

  return (
    <figure data-testid="elo-commits" className="overflow-hidden border-2 border-ink p-4" aria-label={BROADSHEET.eloChartKicker}>
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">{BROADSHEET.eloChartKicker}</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-2 w-full text-ink"
        role="img"
        aria-label={BROADSHEET.eloChartKicker}
      >
        <line x1={pad.l} y1={zeroY} x2={w - pad.r} y2={zeroY} stroke="#1a120c" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={h - pad.b} stroke="#1a120c" strokeWidth="1.5" />
        <line x1={pad.l} y1={h - pad.b} x2={w - pad.r} y2={h - pad.b} stroke="#1a120c" strokeWidth="1.5" />
        {points.length > 1 ? (
          <polyline fill="none" stroke="#1e3a72" strokeWidth="2" points={poly} />
        ) : null}
        {points.map((p, i) => {
          const atEnd = i === last && points.length > 1;
          const atStart = i === 0 && points.length > 1;
          return (
            <g key={p.commit}>
              <circle cx={x(i)} cy={y(p.elo)} r="4.5" fill="#1e3a72" stroke="#1a120c" strokeWidth="1" />
              <text
                x={atStart ? x(i) - 4 : atEnd ? x(i) + 4 : x(i)}
                y={h - 12}
                textAnchor={atStart ? "start" : atEnd ? "end" : "middle"}
                fill="#1a120c"
                fontFamily="IBM Plex Mono, ui-monospace, monospace"
                fontSize="9"
              >
                {p.label}
              </text>
            </g>
          );
        })}
        <text
          x={8}
          y={y(maxE) + 4}
          fill="#1a120c"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
        >
          {maxE.toFixed(0)}
        </text>
        <text
          x={8}
          y={zeroY + 3}
          fill="#1a120c"
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="9"
        >
          0
        </text>
      </svg>
      <figcaption className="mt-4 font-display text-[12px] italic text-faded">{BROADSHEET.eloChartCaption}</figcaption>
      <table className="elo-table mt-4 w-full font-mono text-[12px] text-ink" data-testid="elo-commits-table">
        <caption className="sr-only">Elo at each filed match</caption>
        <thead>
          <tr className="text-left text-faded">
            <th className="font-normal">Match</th>
            <th className="font-normal">Elo</th>
            <th className="font-normal">Games</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.commit}>
              <th scope="row" className="font-normal">
                {p.label}
              </th>
              <td>{p.elo}</td>
              <td>{p.games}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
