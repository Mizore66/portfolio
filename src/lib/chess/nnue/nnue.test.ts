import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, afterEach } from "vitest";
import { accEqual, refreshAcc } from "./accumulator";
import { featureIndex } from "./features";
import { decodeNnue, encodeNnue, toyNet } from "./format";
import { evaluateNnue } from "./infer";
import { attachNnue, configureEngine, playUci, startPos } from "../engine";

afterEach(() => {
  configureEngine({ evalMode: "handcrafted", net: null });
});

describe("NNUE weights file", () => {
  it("round-trips a toy net and rejects a bad magic", () => {
    const net = toyNet(128, 9);
    const bytes = encodeNnue(net);
    const back = decodeNnue(bytes);
    expect(back.id).toBe(net.id);
    expect(back.accSize).toBe(128);
    expect(back.ftW[0]).toBe(net.ftW[0]);
    expect(back.l2W[3]).toBe(net.l2W[3]);
    const bad = Uint8Array.from(bytes);
    bad[0] = 65;
    expect(() => decodeNnue(bad)).toThrow(/magic/);
  });

  it("loads the shipped Lichess-CC0 net", () => {
    const path = join(process.cwd(), "public/engine/nnue-lichess-cc0-768x2x256-32-1-2026-08-28.bin");
    expect(existsSync(path)).toBe(true);
    const net = decodeNnue(new Uint8Array(readFileSync(path)));
    expect(net.id).toBe("nnue-lichess-cc0-768x2x256-32-1-2026-08-28");
    expect(net.accSize).toBe(256);
    expect(net.scale).toBe(400);
    expect(net.ftW.length).toBe(768 * 256);
  });
});

describe("NNUE features", () => {
  it("agrees with the Python indexer used at train time", () => {
    const cases: Array<[number, number, 1 | -1]> = [
      [1, 8, 1],
      [9, 48, -1],
      [6, 4, 1],
      [14, 60, -1],
      [5, 27, 1],
      [10, 18, -1],
    ];
    const py = spawnSync(
      "python3",
      [
        "-c",
        "import sys; sys.path.insert(0,'training'); from board import feature_index as f\n" +
          "print(' '.join(str(f(*map(int,c.split(',')))) for c in sys.argv[1:]))",
        ...cases.map((c) => c.join(",")),
      ],
      { encoding: "utf8", cwd: process.cwd() },
    );
    expect(py.status, py.stderr).toBe(0);
    const got = py.stdout.trim().split(/\s+/).map(Number);
    expect(got).toEqual(cases.map(([p, s, v]) => featureIndex(p, s, v)));
  });
});

describe("NNUE accumulator", () => {
  it("matches a full refresh after make/unmake", () => {
    const net = toyNet(256, 4);
    configureEngine({ evalMode: "learned", net });
    const pos = startPos();
    attachNnue(pos);
    expect(playUci(pos, "e2e4")).toBe(true);
    expect(playUci(pos, "e7e5")).toBe(true);
    expect(playUci(pos, "g1f3")).toBe(true);
    expect(playUci(pos, "b8c6")).toBe(true);
    expect(playUci(pos, "f1c4")).toBe(true);
    expect(playUci(pos, "g8f6")).toBe(true);
    expect(accEqual(pos.acc!, refreshAcc(pos.board, net))).toBe(true);
    const after = evaluateNnue(net, pos.acc!, pos.side);
    expect(Number.isFinite(after)).toBe(true);
    expect(pos.acc!.w.some((v, i) => v !== net.ftB[i])).toBe(true);
  });

  it("stays on PeSTO when learned is selected but no net is loaded", () => {
    configureEngine({ evalMode: "learned", net: null });
    const pos = startPos();
    attachNnue(pos);
    expect(pos.acc).toBeUndefined();
  });
});
