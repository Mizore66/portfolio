"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EvalBar } from "@/components/opening/EvalBar";
import { NewspaperPiece } from "@/components/opening/NewspaperPiece";
import {
  animationPlan,
  FILES,
  positionAfter,
  snapInnerEdge,
  squareBox,
  squareFile,
  squareRank,
  type AnimatedPiece,
} from "@/lib/chess/replay";
import { GLIDE_MS } from "@/lib/opening/motion";
import type { Ply } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

export function BoardDiagram({
  plies,
  highlight,
  preview,
  caption,
  evalCp,
  evalLabel,
  arrow,
  legal,
  playable,
  playSide,
  onPlay,
  onSquare,
  puzzlePrompt,
  puzzleNote,
  puzzleTarget,
}: {
  plies: Ply[];
  highlight: [string, string] | null;
  preview?: [string, string] | null;
  caption: string;
  evalCp: number | null;
  evalLabel: string;
  arrow?: Ply | null;
  legal?: Ply[];
  playable?: boolean;
  playSide?: "w" | "b";
  onPlay?: (ply: Ply) => void;
  onSquare?: (sq: string) => void;
  puzzlePrompt?: string | null;
  puzzleNote?: string | null;
  puzzleTarget?: string | null;
}) {
  const prevPlies = useRef<Ply[] | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState(0);
  const plySig = plies.map((p) => `${p.from}${p.to}`).join(",");
  const [fromSel, setFromSel] = useState<{ sig: string; sq: string | null }>({
    sig: plySig,
    sq: null,
  });
  const fromSq = fromSel.sig === plySig ? fromSel.sq : null;
  const setFromSq = (sq: string | null) => setFromSel({ sig: plySig, sq });
  const [liftIds, setLiftIds] = useState<Set<string>>(new Set());
  const [pieces, setPieces] = useState<AnimatedPiece[]>(() =>
    positionAfter(plies).map((p) => ({ ...p, delay: 0 })),
  );

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = prevPlies.current;
    const fromSig = from?.map((p) => `${p.from}${p.to}`).join(",") ?? null;

    if (reduced || from === null) {
      prevPlies.current = plies;
      setPieces(positionAfter(plies).map((p) => ({ ...p, delay: 0 })));
      setLiftIds(new Set());
      return;
    }

    if (fromSig === plySig) return;

    const plan = animationPlan(from, plies);
    const moving = new Set(
      plan.filter((p) => p.delay > 0 || squareShifted(from, plies, p.id)).map((p) => p.id),
    );

    // Assign prev *inside* the timeout. Setting it earlier meant a React Strict
    // Mode cleanup cancelled the paint, and the second run saw from===to and snapped.
    const timer = window.setTimeout(() => {
      prevPlies.current = plies;
      setPieces(plan);
      setLiftIds(moving);
    }, 0);
    const clear = window.setTimeout(() => setLiftIds(new Set()), GLIDE_MS + 80);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clear);
    };
  }, [plies, plySig]);

  const dests = fromSq ? (legal ?? []).filter((p) => p.from === fromSq).map((p) => p.to) : [];
  const occ = new Map(pieces.filter((p) => !p.captured).map((p) => [p.square, p]));

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      if (el.clientWidth < 16) return;
      setEdge(snapInnerEdge(el.clientWidth));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function squareFromPoint(clientX: number, clientY: number): string | null {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    if (x < 0 || y < 0 || x > 1 || y > 1) return null;
    const file = Math.min(7, Math.max(0, Math.floor(x * 8)));
    const rank = 7 - Math.min(7, Math.max(0, Math.floor(y * 8)));
    return `${FILES[file]}${rank + 1}`;
  }

  function attempt(from: string, to: string) {
    if (from === to) return;
    onPlay?.({ from, to });
    setFromSq(null);
  }

  function onBoardPointerDown(e: React.PointerEvent) {
    const sq = squareFromPoint(e.clientX, e.clientY);
    if (!sq) return;
    // Clicking the quiz square always stamps — even if a pawn is already selected.
    if (puzzleTarget && sq === puzzleTarget) {
      onSquare?.(sq);
      setFromSq(null);
      return;
    }
    if (!playable) {
      onSquare?.(sq);
      return;
    }
    const piece = occ.get(sq);
    if (fromSq && dests.includes(sq)) {
      attempt(fromSq, sq);
      return;
    }
    if (piece && piece.color === playSide) {
      setFromSq(sq);
      return;
    }
    onSquare?.(sq);
    setFromSq(null);
  }

  function onBoardPointerUp(e: React.PointerEvent) {
    if (!playable || !fromSq) return;
    const sq = squareFromPoint(e.clientX, e.clientY);
    if (!sq || sq === fromSq) return;
    if (puzzleTarget && sq === puzzleTarget) {
      onSquare?.(sq);
      setFromSq(null);
      return;
    }
    attempt(fromSq, sq);
  }

  const squares = [];
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const sq = `${FILES[file]}${rank + 1}`;
      const dark = (file + rank) % 2 === 0;
      const committed = highlight && (highlight[0] === sq || highlight[1] === sq);
      const ghost = !committed && preview && (preview[0] === sq || preview[1] === sq);
      const selected = fromSq === sq;
      const dest = dests.includes(sq);
      squares.push(
        <div
          key={sq}
          data-sq={sq}
          data-hl={committed ? "true" : ghost ? "preview" : undefined}
          className={cn(dark ? "board-sq-dark" : "board-sq-light", dest && "board-sq-dest")}
          style={
            committed
              ? { boxShadow: "inset 0 0 0 100px rgba(139, 36, 28, 0.38)" }
              : ghost
                ? { boxShadow: "inset 0 0 0 100px rgba(30, 58, 114, 0.32)" }
                : selected
                  ? { boxShadow: "inset 0 0 0 100px rgba(30, 58, 114, 0.22)" }
                  : undefined
          }
        />,
      );
    }
  }

  return (
    <figure data-testid="board-diagram">
      {puzzlePrompt ? (
        <p
          data-testid="find-the-break"
          className="mb-3 border-2 border-ink px-3 py-2 font-display text-[14px] italic text-ink"
        >
          {puzzlePrompt}
          {puzzleNote ? (
            <span className="mt-1 block font-mono text-[11px] not-italic text-score-red">
              {puzzleNote}
            </span>
          ) : null}
        </p>
      ) : null}
      <div className="flex items-start gap-0">
        <EvalBar value={evalCp ?? 0} label={evalLabel} />
        <div className="flex min-w-0 flex-1 items-start">
          <div
            className="flex w-3.5 flex-col-reverse justify-around py-0.5 font-mono text-[9px] text-faded"
            style={edge ? { height: edge + 4 } : undefined}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="leading-none">
                {i + 1}
              </span>
            ))}
          </div>
          <div ref={wrapRef} className="min-w-0 flex-1">
            <div
              className="border-2 border-ink"
              style={edge ? { width: edge + 4, height: edge + 4 } : { width: "100%", aspectRatio: "1" }}
            >
              <div
                ref={boardRef}
                role="img"
                aria-label={caption}
                data-testid="board-plane"
                className={cn("newspaper-board relative h-full w-full", playable && "cursor-pointer")}
                tabIndex={playable ? 0 : undefined}
                id="play-board"
                onPointerDown={onBoardPointerDown}
                onPointerUp={onBoardPointerUp}
              >
                <div className="grid h-full w-full grid-cols-8 grid-rows-8">{squares}</div>
                {arrow ? <PvArrow ply={arrow} /> : null}
                {pieces.map((piece) => {
                  const file = squareFile(piece.square);
                  const rank = squareRank(piece.square);
                  const box = squareBox(file, rank);
                  return (
                    <span
                      key={piece.id}
                      data-piece-id={piece.id}
                      className="absolute flex items-center justify-center"
                    style={{
                      ...box,
                      opacity: piece.captured ? 0 : 1,
                      transitionProperty: "left, top, opacity",
                      transitionDuration: `${GLIDE_MS}ms`,
                      transitionTimingFunction: "ease",
                      transitionDelay: `${piece.delay}ms`,
                      pointerEvents: "none",
                      zIndex: piece.captured ? 0 : liftIds.has(piece.id) ? 3 : 2,
                    }}
                    >
                      <span
                        className={liftIds.has(piece.id) ? "piece-lift" : undefined}
                        style={{ animationDelay: `${piece.delay}ms` }}
                      >
                        <NewspaperPiece type={piece.type} color={piece.color} />
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
            <div
              className="flex justify-around font-mono text-[9px] text-faded"
              style={edge ? { width: edge + 4 } : undefined}
            >
              {FILES.split("").map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 px-1 text-center font-display text-[13px] italic text-ink">
        {caption}
      </figcaption>
    </figure>
  );
}

function squareShifted(fromPlies: Ply[], toPlies: Ply[], id: string): boolean {
  const a = positionAfter(fromPlies).find((p) => p.id === id);
  const b = positionAfter(toPlies).find((p) => p.id === id);
  if (!a || !b) return false;
  return a.square !== b.square || a.captured !== b.captured;
}

function PvArrow({ ply }: { ply: Ply }) {
  const x1 = (squareFile(ply.from) + 0.5) * 12.5;
  const y1 = (7 - squareRank(ply.from) + 0.5) * 12.5;
  const x2 = (squareFile(ply.to) + 0.5) * 12.5;
  const y2 = (7 - squareRank(ply.to) + 0.5) * 12.5;
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      data-testid="pv-arrow"
    >
      <defs>
        <marker id="pv-head" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0 0 L5 2.5 L0 5 z" fill="#8b241c" />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#8b241c"
        strokeWidth={1.6}
        strokeLinecap="round"
        markerEnd="url(#pv-head)"
        opacity={0.92}
      />
    </svg>
  );
}
