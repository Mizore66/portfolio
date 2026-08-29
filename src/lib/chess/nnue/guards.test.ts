import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  attachNnue,
  configureEngine,
  evaluateNow,
  materialCp,
  playUci,
  startPos,
  type EnginePos,
} from "../engine";
import { accEqual, refreshAcc } from "./accumulator";
import { decodeNnue } from "./format";
import { evaluateNnue, evaluateNnueFloat } from "./infer";
import type { NnueNet } from "./types";
import type { Color, Piece, PieceType } from "@/lib/chess/replay";

const SHIPPED_128 = "nnue-lichess-cc0-768x2x128-32-1-2026-08-28";
const SHIPPED_256_V1 = "nnue-lichess-cc0-768x2x256-32-1-2026-08-28";
const PLAYING_256 = "nnue-lichess-cc0-768x2x256-32-1-2026-08-29";

function engineDir(...parts: string[]) {
  return join(process.cwd(), "public", "engine", ...parts);
}

function loadShipped(id: string): NnueNet {
  return decodeNnue(new Uint8Array(readFileSync(engineDir(`${id}.bin`))));
}

function pc(id: string, type: PieceType, color: Color, square: string): Piece {
  return { id, type, color, square, captured: false };
}

function kingsAnd(extras: Piece[]): EnginePos {
  return {
    ...startPos(),
    board: (() => {
      const board = new Int8Array(64);
      const pieces = [pc("K", "K", "w", "e1"), pc("k", "K", "b", "e8"), ...extras];
      for (const p of pieces) {
        const file = "abcdefgh".indexOf(p.square[0]);
        const rank = Number(p.square[1]) - 1;
        const n = typeNum(p.type, p.color);
        board[rank * 8 + file] = n;
      }
      return board;
    })(),
    side: 1,
    castle: 0,
    ep: -1,
  };
}

function typeNum(type: PieceType, color: Color): number {
  const base = { P: 1, N: 2, B: 3, R: 4, Q: 5, K: 6 }[type];
  return color === "w" ? base : base + 8;
}

afterEach(() => {
  configureEngine({ evalMode: "handcrafted", net: null });
});

describe("§9 holdout correlation receipts", () => {
  it("records r vs Stockfish for v1 nets and the depth-12 256", () => {
    const rows = [SHIPPED_128, SHIPPED_256_V1, PLAYING_256].map((id) => {
      const path = engineDir(`${id}.json`);
      expect(existsSync(path)).toBe(true);
      return JSON.parse(readFileSync(path, "utf8")) as {
        id: string;
        corr_sf: number;
        mae_cp: number;
        positions: number;
        epochs: number;
      };
    });
    const small = rows.find((r) => r.id === SHIPPED_128)!;
    const v1Large = rows.find((r) => r.id === SHIPPED_256_V1)!;
    const playing = rows.find((r) => r.id === PLAYING_256)!;
    expect(small.corr_sf).toBeCloseTo(0.305, 2);
    expect(v1Large.corr_sf).toBeCloseTo(0.504, 2);
    expect(playing.corr_sf).toBeCloseTo(0.64, 2);
    expect(small.mae_cp).toBeGreaterThan(100);
    expect(v1Large.corr_sf).toBeGreaterThan(small.corr_sf);
    expect(playing.corr_sf).toBeGreaterThan(v1Large.corr_sf);
    expect(small.positions).toBe(3_000_000);
    expect(v1Large.positions).toBe(6_000_000);
    expect(playing.positions).toBe(20_000_000);
    expect(playing.epochs).toBe(3);
  });
});

describe("§9 quantization float-vs-int parity", () => {
  it("keeps trunc and float forward passes within a pawn on the playing 256 net", () => {
    const net = loadShipped(PLAYING_256);
    configureEngine({ evalMode: "learned", net });
    const positions: EnginePos[] = [
      startPos(),
      kingsAnd([]),
      kingsAnd([pc("Q", "Q", "w", "d1")]),
      kingsAnd([pc("R", "R", "w", "a1")]),
      kingsAnd([pc("P", "P", "w", "e4")]),
    ];
    const italian = startPos();
    attachNnue(italian);
    for (const u of ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"]) {
      expect(playUci(italian, u)).toBe(true);
    }
    positions.push(italian);

    const gaps: number[] = [];
    for (const pos of positions) {
      attachNnue(pos);
      const acc = pos.acc!;
      const q = evaluateNnue(net, acc, pos.side);
      const f = evaluateNnueFloat(net, acc, pos.side);
      gaps.push(Math.abs(q - f));
    }
    const maxGap = Math.max(...gaps);
    const mae = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    expect(maxGap, `max |int-float| ${maxGap.toFixed(1)}cp`).toBeLessThan(100);
    expect(mae, `MAE ${mae.toFixed(1)}cp`).toBeLessThan(50);
  });
});

describe("§9 incremental vs full accumulator", () => {
  it("matches refreshAcc after a quiet Italian, a capture, and castling on the playing 256", () => {
    const net = loadShipped(PLAYING_256);
    configureEngine({ evalMode: "learned", net });
    const pos = startPos();
    attachNnue(pos);
    const line = [
      "e2e4",
      "e7e5",
      "g1f3",
      "b8c6",
      "f1c4",
      "g8f6",
      "d2d4",
      "e5d4",
      "e1g1",
      "f8c5",
    ];
    for (const u of line) {
      expect(playUci(pos, u), u).toBe(true);
      expect(accEqual(pos.acc!, refreshAcc(pos.board, net)), `after ${u}`).toBe(true);
    }
  });
});

describe("ten-position material sanity (learned hybrid)", () => {
  it("orders basic material with the playing 256 residual-on-material eval", () => {
    const net = loadShipped(PLAYING_256);
    configureEngine({ evalMode: "learned", net });

    const suite: Array<{ name: string; extra?: Piece[] }> = [
      { name: "K vs K", extra: [] },
      { name: "KP vs K", extra: [pc("P", "P", "w", "e4")] },
      { name: "KN vs K", extra: [pc("N", "N", "w", "b1")] },
      { name: "KB vs K", extra: [pc("B", "B", "w", "c1")] },
      { name: "KR vs K", extra: [pc("R", "R", "w", "a1")] },
      { name: "KQ vs K", extra: [pc("Q", "Q", "w", "d1")] },
      { name: "KQ vs KR", extra: [pc("Q", "Q", "w", "d1"), pc("r", "R", "b", "a8")] },
      { name: "KRR vs K", extra: [pc("R", "R", "w", "a1"), pc("R2", "R", "w", "h1")] },
      { name: "KPP vs KP", extra: [pc("P", "P", "w", "e4"), pc("P2", "P", "w", "d4"), pc("p", "P", "b", "e5")] },
      { name: "start" },
    ];

    const scores: Record<string, { hybrid: number; raw: number; material: number }> = {};
    for (const row of suite) {
      const pos = row.extra ? kingsAnd(row.extra) : startPos();
      attachNnue(pos);
      scores[row.name] = {
        hybrid: evaluateNow(pos, "learned"),
        raw: evaluateNnue(net, pos.acc!, pos.side),
        material: materialCp(pos),
      };
    }

    expect(scores["KQ vs K"].material).toBe(900);
    expect(scores["KR vs K"].material).toBe(500);
    expect(scores["KN vs K"].material).toBe(320);
    expect(scores["KP vs K"].material).toBe(100);

    // Hybrid clips the net to ±60cp on top of classical material, so a piece
    // cannot invert the order of a heavier piece.
    expect(scores["KQ vs K"].hybrid).toBeGreaterThan(scores["KR vs K"].hybrid + 200);
    expect(scores["KR vs K"].hybrid).toBeGreaterThan(scores["KN vs K"].hybrid + 80);
    expect(scores["KN vs K"].hybrid).toBeGreaterThan(scores["K vs K"].hybrid + 80);
    expect(scores["KB vs K"].hybrid).toBeGreaterThan(scores["K vs K"].hybrid + 80);
    expect(scores["KRR vs K"].hybrid).toBeGreaterThan(scores["KR vs K"].hybrid + 200);
    expect(scores["KQ vs K"].hybrid).toBeGreaterThan(scores["KQ vs KR"].hybrid + 200);

    // A pawn is 100cp; residual ±60 can theoretically invert vs bare kings.
    // Record the sign — a negative pawn is a scale bug, not label noise.
    expect(scores["KP vs K"].hybrid).toBeGreaterThan(scores["K vs K"].hybrid);
    expect(scores["start"].hybrid).toBeGreaterThan(-80);
    expect(scores["start"].hybrid).toBeLessThan(80);
  });
});
