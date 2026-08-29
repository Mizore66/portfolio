import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, afterEach } from "vitest";
import { configureEngine, playUci, startPos } from "../engine";
import { OPENING_SUITE_V1 } from "./openings";
import { runMatch } from "./runner";
import { addPair, emptyPenta, eloFromScore, reportElo } from "./sprt";

afterEach(() => {
  configureEngine({ evalMode: "handcrafted", net: null });
});

describe("opening suite", () => {
  it("versions fifty short openings", () => {
    expect(OPENING_SUITE_V1).toHaveLength(50);
    expect(new Set(OPENING_SUITE_V1.map((o) => o.join(" "))).size).toBe(50);
    for (const line of OPENING_SUITE_V1) {
      const pos = startPos();
      for (const u of line) expect(playUci(pos, u), u).toBe(true);
    }
  });
});

describe("SPRT reporting", () => {
  it("reads a pile of 1-1 pairs as 0 Elo", () => {
    const penta = emptyPenta();
    for (let i = 0; i < 20; i++) addPair(penta, [1, 0]);
    for (let i = 0; i < 20; i++) addPair(penta, [0, 1]);
    const r = reportElo(penta, { w: 20, d: 0, l: 20 });
    expect(r.score).toBe(0.5);
    expect(r.elo).toBeCloseTo(0, 8);
    expect(r.eloCi95[0]).toBeLessThanOrEqual(0);
    expect(r.eloCi95[1]).toBeGreaterThanOrEqual(0);
    expect(eloFromScore(0.5)).toBeCloseTo(0, 8);
  });
});

describe("Gate A — handcrafted vs handcrafted", () => {
  it("reports ~0 Elo on a mini suite at a tiny node cap", () => {
    const report = runMatch({
      a: { evalMode: "handcrafted" },
      b: { evalMode: "handcrafted" },
      nodes: 48,
      suite: "mini",
      maxPly: 48,
    });
    expect(report.games).toHaveLength(16);
    expect(report.elo.pairs).toBe(8);
    expect(report.elo.elo).toBeCloseTo(0, 8);
    expect(report.elo.eloCi95[0]).toBeLessThanOrEqual(0);
    expect(report.elo.eloCi95[1]).toBeGreaterThanOrEqual(0);
    expect(report.sprtLine).toMatch(/sprt:/);
    expect(report.netId).toBeNull();
    expect(report.stoppedEarly).toBe(false);
    for (const pair of [0, 1, 2, 3, 4, 5, 6, 7]) {
      const g1 = report.games[pair * 2];
      const g2 = report.games[pair * 2 + 1];
      expect(g1.aScore + g2.aScore).toBe(1);
    }
  }, 30_000);

  it("has a 1000-node openings-v1 receipt at 0 Elo", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), "matches/gate-a-v1-1000.json"), "utf8"),
    ) as {
      nodes: number;
      a: string;
      b: string;
      elo: { elo: number; wdl: { w: number; d: number; l: number }; score: number };
      stoppedEarly: boolean;
      games: unknown[];
    };
    expect(raw.nodes).toBe(1000);
    expect(raw.a).toBe("handcrafted");
    expect(raw.b).toBe("handcrafted");
    expect(raw.games).toHaveLength(100);
    expect(raw.stoppedEarly).toBe(false);
    expect(raw.elo.score).toBe(0.5);
    expect(raw.elo.elo).toBe(0);
    expect(raw.elo.wdl.w).toBe(raw.elo.wdl.l);
  });

  it("has a 50000-node openings-v1 receipt at 0 Elo", () => {
    const raw = JSON.parse(
      readFileSync(join(process.cwd(), "matches/gate-a-v1-50000.json"), "utf8"),
    ) as {
      nodes: number;
      a: string;
      b: string;
      elo: {
        elo: number;
        pairs: number;
        pentanomial: number[];
        wdl: { w: number; d: number; l: number };
        score: number;
      };
      stoppedEarly: boolean;
      games: unknown[];
    };
    expect(raw.nodes).toBe(50_000);
    expect(raw.a).toBe("handcrafted");
    expect(raw.b).toBe("handcrafted");
    expect(raw.games).toHaveLength(100);
    expect(raw.stoppedEarly).toBe(false);
    expect(raw.elo.score).toBe(0.5);
    expect(raw.elo.elo).toBe(0);
    expect(raw.elo.pairs).toBe(50);
    expect(raw.elo.pentanomial).toEqual([0, 0, 50, 0, 0]);
    expect(raw.elo.wdl.w).toBe(raw.elo.wdl.l);
  });
});

describe("eval filter pipeline", () => {
  it("drops early, EP, and duplicate rows from the sample", () => {
    const result = spawnSync(
      "python3",
      [join(process.cwd(), "training/filter.py"), "-i", join(process.cwd(), "training/fixtures/sample.jsonl")],
      { encoding: "utf8" },
    );
    expect(result.status, result.stderr).toBe(0);
    const rows = result.stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
    expect(rows).toHaveLength(1);
    expect(rows[0].ply).toBeGreaterThanOrEqual(10);
    expect(rows[0].wdl).toBeGreaterThan(0.5);
  });

  it("round-trips STM features back to a board", () => {
    const result = spawnSync(
      "python3",
      [
        "-c",
        [
          "import sys; sys.path.insert(0,'training')",
          "from board import parse_fen, features, board_from_features",
          "fen='rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'",
          "board, stm, _, _ = parse_fen(fen)",
          "got = board_from_features(features(board, stm), stm)",
          "assert got == board, (got, board)",
          "print('ok')",
        ].join("; "),
      ],
      { encoding: "utf8", cwd: process.cwd() },
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe("ok");
  });
});
