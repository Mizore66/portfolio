import { describe, expect, it } from "vitest";
import raw from "../../content/chess-games.json";
import { tables, moveLabel } from "./roles";

describe("the Roles hall", () => {
  it("has seven tables in career order, the degree first and Deriv, the current role, last", () => {
    expect(tables.map((t) => t.slug)).toEqual(["education", "petronas", "western-digital", "setel", "monash-university", "skribble-lab", "deriv"]);
    expect(tables.filter((t) => t.current).map((t) => t.slug)).toEqual(["deriv"]);
  });
  it("plays each game as content/chess-games.json records it, one position into the next", () => {
    for (const t of tables) {
      const src = raw.games.find((g) => t.game.title.startsWith(`${g.white.split(" ").at(-1)} vs ${g.black.split(" ").at(-1)}`))!;
      expect(t.game.plies.map((p) => p.san)).toEqual(src.san);
      t.game.plies.slice(1).forEach((p, i) => expect(p.before).toBe(t.game.plies[i].after));
    }
  });
  it("stops each table on its famous position", () => {
    const t = tables.find((x) => x.slug === "deriv")!;
    expect(t.game.famous).toBe(30);
    expect(moveLabel(t.game.famous, t.game.plies[30].san)).toBe("16. Nd5");
  });
  it("gives every claim of a role one fact, with its number and qualifier", () => {
    const deriv = tables.find((x) => x.slug === "deriv")!;
    expect(deriv.facts.filter((f) => f.big).length).toBe(6);
    expect(deriv.facts.find((f) => f.big?.includes("time-to-fix"))!.text).toMatch(/^Built evaluation and debugging harnesses/);
    for (const t of tables) for (const f of t.facts) expect(f.text.length).toBeGreaterThan(0);
  });
});
