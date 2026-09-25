"use client";

import { useEffect, useRef, useState } from "react";
import { formatMonth, formatPeriod } from "@/content/site/format";
import type { CareerPoint } from "@/content/site/career";
import { useFrontGame } from "./FrontGame";

/**
 * The eval graph as the career timeline (brief §7 B): real time on x, the engine's
 * evaluation of each move's position on y. Roles are spans, projects are dots.
 */

const H = 250;
/** Short names for direct labels on role spans. */
const SHORT: Record<string, string> = { "Monash University": "Monash", "Western Digital": "WD", "Skribble Lab": "Skribble Lab" };
const LANE = 9;
const PAD = { top: 18, right: 16, bottom: 30, left: 44 };

function monthIndex(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
}

export function CareerGraph({ points, from, now }: { points: CareerPoint[]; from: string; now: string }) {
  const { select, stop } = useFrontGame();
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<CareerPoint | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const x0 = monthIndex(from);
  const x1 = monthIndex(now) + 1;
  const pawns = points.map((p) => p.evalCp / 100);
  const step = Math.max(...pawns) - Math.min(...pawns) > 1.5 ? 1 : 0.5;
  const top = Math.max(step, Math.ceil(Math.max(...pawns) / step) * step);
  const bottom = Math.min(-step, Math.floor(Math.min(...pawns) / step) * step);
  const innerW = width - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const xAt = (ym: string, end = false) => PAD.left + ((monthIndex(ym) + (end ? 1 : 0) - x0) / (x1 - x0)) * innerW;
  const yAt = (pawn: number) => PAD.top + ((top - pawn) / (top - bottom)) * innerH;

  const yTicks: number[] = [];
  for (let v = Math.ceil(bottom / step) * step; v <= top + 1e-9; v += step) yTicks.push(Math.round(v * 10) / 10);
  const years: string[] = [];
  for (let m = x0; m < x1; m++) if (m % 6 === 0) years.push(`${Math.floor(m / 12)}-${String((m % 12) + 1).padStart(2, "0")}`);

  // Overlapping roles at similar heights become parallel spans, one lane apart.
  const roleY = new Map<string, number>();
  const placed: { a: number; b: number; y: number }[] = [];
  for (const p of points.filter((q) => q.kind === "role")) {
    const a = monthIndex(p.start);
    const b = p.end ? monthIndex(p.end) : x1;
    let y = yAt(p.evalCp / 100);
    while (placed.some((o) => a <= o.b && o.a <= b && Math.abs(o.y - y) < LANE)) y += LANE;
    placed.push({ a, b, y });
    roleY.set(p.nodeId, y);
  }
  const markY = (p: CareerPoint) => roleY.get(p.nodeId) ?? yAt(p.evalCp / 100);

  const current = points.find((p) => p.end === null);

  return (
    <section id="career" className="section career" aria-labelledby="career-title">
      <h2 id="career-title">The game so far</h2>
      <p className="note career-dek">
        Each role and project sits at the move it plays in the annotated game. Height is the engine&apos;s own evaluation of that
        position. Select a point to set the board; the highlighted mark is the position on the board now.
      </p>
      <div className="career-legend" aria-hidden="true">
        <span>
          <svg width="22" height="10">
            <line x1="2" y1="5" x2="20" y2="5" className="cg-span" />
          </svg>
          Role
        </span>
        <span>
          <svg width="12" height="12">
            <circle cx="6" cy="6" r="4.5" className="cg-dot" />
          </svg>
          Project
        </span>
        <span>
          <svg width="12" height="12">
            <rect x="2" y="2" width="8" height="8" className="cg-edu" />
          </svg>
          Graduation
        </span>
      </div>
      <div ref={wrap} className="career-plot">
        <svg width={width} height={H} role="img" aria-label="Career timeline plotted as an evaluation graph. The same data is in the table below.">
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={width - PAD.right} y1={yAt(v)} y2={yAt(v)} className={v === 0 ? "cg-zero" : "cg-grid"} />
              <text x={PAD.left - 8} y={yAt(v) + 4} textAnchor="end" className="cg-tick">
                {v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1)}
              </text>
            </g>
          ))}
          {years.map((ym) => (
            <text key={ym} x={xAt(ym)} y={H - 8} className="cg-tick">
              {formatMonth(ym)}
            </text>
          ))}
          {points.map((p) => {
            const y = markY(p);
            const active = stop.nodeId === p.nodeId;
            const label = `${p.label}, ${p.move}. ${p.end === p.start ? formatMonth(p.start) : formatPeriod(p.start, p.end)}. Engine eval ${(p.evalCp / 100).toFixed(2)}.`;
            const mark =
              p.kind === "role" ? (
                <line x1={xAt(p.start)} x2={p.end ? xAt(p.end, true) : xAt(now, true)} y1={y} y2={y} className="cg-span" />
              ) : p.kind === "education" ? (
                <rect x={xAt(p.start) + 2} y={y - 5} width={10} height={10} className="cg-edu" />
              ) : (
                <circle cx={xAt(p.start) + 7} cy={y} r={5} className="cg-dot" />
              );
            return (
              <a
                key={p.nodeId}
                href={p.href}
                aria-label={label}
                className={active ? "cg-mark cg-active" : "cg-mark"}
                onClick={() => select(p.nodeId)}
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p)}
                onBlur={() => setHover(null)}
              >
                {/* A generous transparent hit area around every mark. */}
                {p.kind === "role" ? (
                  <rect x={xAt(p.start)} y={y - 11} width={Math.max(22, (p.end ? xAt(p.end, true) : xAt(now, true)) - xAt(p.start))} height={22} className="cg-hit" />
                ) : (
                  <circle cx={xAt(p.start) + 7} cy={y} r={12} className="cg-hit" />
                )}
                {mark}
                {p.kind === "role" ? (
                  <text x={xAt(p.start)} y={y - 7} className="cg-role-label">
                    {SHORT[p.label] ?? p.label}
                  </text>
                ) : null}
              </a>
            );
          })}
          {current ? (
            <text x={xAt(now, true)} y={markY(current) + 18} textAnchor="end" className="cg-label">
              now
            </text>
          ) : null}
        </svg>
        {hover ? (
          <div
            className="cg-tip"
            style={{
              left: Math.min(width - 190, Math.max(0, xAt(hover.start) - 10)),
              top: Math.max(0, markY(hover) - 62),
            }}
            aria-hidden="true"
          >
            <strong>{hover.label}</strong>
            <span>
              {hover.move} · {hover.end === hover.start ? formatMonth(hover.start) : formatPeriod(hover.start, hover.end)}
            </span>
          </div>
        ) : null}
      </div>
      <details className="career-table">
        <summary>Show as a table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Chapter</th>
              <th scope="col">Move</th>
              <th scope="col">When</th>
              <th scope="col">Engine eval</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.nodeId}>
                <td>
                  <a href={p.href}>{p.label}</a>
                </td>
                <td>{p.move}</td>
                <td>{p.end === p.start ? formatMonth(p.start) : formatPeriod(p.start, p.end)}</td>
                <td>{`${p.evalCp >= 0 ? "+" : ""}${(p.evalCp / 100).toFixed(2)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
