import { describe, expect, it } from "vitest";
import { isLegalPly, playPly, startPos } from "@/lib/chess/engine";
import { occupancyFen, positionAfter } from "@/lib/chess/replay";
import { LINE_ECO, LINE_NAME, LINE_PLIES, LINE_SAN } from "./line";

describe("D19 line", () => {
  it("is legal move by move", () => {
    const pos = startPos();
    LINE_PLIES.forEach((ply, i) => {
      expect(isLegalPly(pos, ply), `ply ${i + 1} ${ply.from}${ply.to}`).toBe(true);
      expect(playPly(pos, ply)).toBe(true);
    });
  });
  it("ends on the position after 10…Bg4", () => {
    expect(occupancyFen(positionAfter(LINE_PLIES))).toBe("r2qk2r/ppp2ppp/2n5/1B1pP3/3Pn1b1/5N2/PP1N1PPP/R2QK2R");
  });
  it("uses the notation and name the owner confirmed", () => {
    expect(LINE_SAN).toBe(
      "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. e5 d5 7. Bb5 Ne4 8. cxd4 Bb4+ 9. Bd2 Bxd2+ 10. Nbxd2 Bg4",
    );
    expect(LINE_NAME).toBe("Italian Game: Classical Variation, Greco Gambit, Anderssen Variation");
    expect(LINE_ECO).toBe("C54");
  });
});
