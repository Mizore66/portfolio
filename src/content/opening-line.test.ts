import { describe, expect, it } from "vitest";
import { startPos, playUci, parseAlg } from "@/lib/chess/engine";
import { content } from "./site";
import line from "./opening-line.json";

// The hero replays the career line. Its move data must match the engine exactly.
describe("opening line", () => {
  it("matches content.json's line, move by move, with the right captures", () => {
    const uci = (content as unknown as { chess: { line: { uci: string[] } } }).chess.line.uci;
    expect(line.plies.map((p) => p.from + p.to)).toEqual(uci);
    const pos = startPos();
    for (const p of line.plies) {
      const cap = pos.board[parseAlg(p.to)] ? p.to : null;
      const ep = (pos.board[parseAlg(p.from)] & 7) === 1 && p.from[0] !== p.to[0] && !cap ? p.to[0] + p.from[1] : null;
      expect(p.cap).toBe(cap ?? ep);
      expect(playUci(pos, p.from + p.to)).toBe(true);
    }
  });
});
