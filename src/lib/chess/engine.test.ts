import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { collectPlies } from "@/lib/opening/tree";
import { positionAfter } from "@/lib/chess/replay";
import { decodeNnue } from "@/lib/chess/nnue/format";
import { PHASE2_NET_ID } from "@/lib/chess/phase2";
import { fromPieces, isLegalPly, legalPlies, numberPv, perft, prepareSearch, replyMove, search, startPos, START_PERFT } from "./engine";

describe("engine move generator", () => {
  it("matches start-position perft receipts", () => {
    const pos = startPos();
    for (const row of START_PERFT) {
      expect(perft(pos, row.depth)).toBe(row.nodes);
    }
  });

  it("still has 20 replies after 1. e4", () => {
    const pieces = positionAfter(collectPlies("e4"));
    const pos = fromPieces(pieces, "b", { from: "e2", to: "e4" });
    expect(perft(pos, 1)).toBe(20);
    expect(legalPlies(pos)).toHaveLength(20);
  });
});

describe("engine search", () => {
  it("prints SAN, not coordinate UCI", () => {
    prepareSearch();
    const r = search(startPos(), 2);
    expect(r.pv[0]).toBeTruthy();
    expect(r.pv[0]).not.toMatch(/^[a-h][1-8][a-h][1-8]q?$/);
    expect(r.pv[0]).toMatch(
      /^(O-O-O|O-O|[NBRQK][a-h1-8]?x?[a-h][1-8][+#]?|[a-h]x?[a-h][1-8](?:=Q)?[+#]?)$/,
    );
  });

  it("numbers a black-to-move PV from the ply count", () => {
    expect(numberPv(["exd4", "Nxd4", "Nf6"], "b", 5)).toBe("5…exd4 6. Nxd4 Nf6");
  });

  it("returns a principal variation for 5. d4", () => {
    prepareSearch();
    const plies = collectPlies("d4");
    const last = plies[plies.length - 1];
    const pos = fromPieces(positionAfter(plies), "b", last);
    const r = search(pos, 3);
    expect(r.pv.length).toBeGreaterThan(0);
    expect(r.best).toBeTruthy();
    expect(r.best!.from).toMatch(/^[a-h][1-8]$/);
    expect(r.best!.to).toMatch(/^[a-h][1-8]$/);
    expect(r.nodes).toBeGreaterThan(50);
  });

  it("does not call the Italian after 5.d4 a pawn-down disaster", () => {
    prepareSearch();
    const plies = collectPlies("d4");
    const last = plies[plies.length - 1];
    const pos = fromPieces(positionAfter(plies), "b", last);
    const r = search(pos, 5, { timeMs: 2500 });
    expect(r.score).toBeGreaterThan(-80);
    expect(r.score).toBeLessThan(220);
  });

  it("stops near a node budget", () => {
    prepareSearch();
    const r = search(startPos(), 8, { nodes: 200 });
    expect(r.nodes).toBeLessThanOrEqual(220);
    expect(r.nodes).toBeGreaterThan(16);
  });

  it("keeps PeSTO when learned mode has no weights", () => {
    prepareSearch();
    const a = search(startPos(), 2, { evalMode: "handcrafted", net: null });
    prepareSearch();
    const b = search(startPos(), 2, { evalMode: "learned", net: null });
    expect(a.score).toBe(b.score);
    expect(a.pv.length).toBeGreaterThan(0);
    expect(a.pv[0]).toBe(b.pv[0]);
  });

  it("uses a structured-cloned OPN2 net the way the search worker will", () => {
    const path = join(process.cwd(), "public", "engine", `${PHASE2_NET_ID}.bin`);
    const net = decodeNnue(new Uint8Array(readFileSync(path)));
    const wire = structuredClone(net);
    expect(wire.id).toBe(PHASE2_NET_ID);
    expect(wire.ftW).toBeInstanceOf(Int16Array);
    expect(wire.ftW[0]).toBe(net.ftW[0]);
    prepareSearch();
    const pesto = search(startPos(), 2, { evalMode: "handcrafted", net: null, timeMs: 400 });
    prepareSearch();
    const learned = search(startPos(), 2, { evalMode: "learned", net: wire, timeMs: 400 });
    expect(learned.pv.length).toBeGreaterThan(0);
    expect(learned.nodes).toBeGreaterThan(0);
    expect(learned.best).toBeTruthy();
    expect(Number.isFinite(learned.score)).toBe(true);
    prepareSearch();
    const again = search(startPos(), 2, { evalMode: "learned", net, timeMs: 400 });
    expect(again.score).toBe(learned.score);
    expect(pesto.pv.length).toBeGreaterThan(0);
  });
});

describe("annotator reply", () => {
  it("always answers 1. e4 with a legal black ply, even on a tight clock", () => {
    const pos = fromPieces(positionAfter(collectPlies("e4")), "b", { from: "e2", to: "e4" });
    const legal = legalPlies(pos);
    const move = replyMove(pos);
    expect(move).toBeTruthy();
    expect(legal.some((p) => p.from === move!.from && p.to === move!.to)).toBe(true);
  });

  it("does not return an empty PV timeout at the starting position", () => {
    const move = replyMove(startPos());
    expect(move).toBeTruthy();
    expect(isLegalPly(startPos(), move!)).toBe(true);
  });
});
