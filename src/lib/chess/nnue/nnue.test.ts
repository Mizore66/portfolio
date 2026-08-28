import { describe, expect, it, afterEach } from "vitest";
import { accEqual, refreshAcc } from "./accumulator";
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
