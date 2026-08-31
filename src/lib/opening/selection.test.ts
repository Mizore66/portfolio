import { describe, expect, it } from "vitest";
import { FLAGSHIP_ID } from "@/content/opening";
import { parseSelection, selectionHref } from "./selection";

describe("selection URL", () => {
  it("treats a missing move as the flagship", () => {
    expect(parseSelection("")).toEqual({ move: FLAGSHIP_ID, tape: false });
    expect(parseSelection("?tape=1")).toEqual({ move: FLAGSHIP_ID, tape: true });
  });

  it("accepts only known node ids", () => {
    expect(parseSelection("?move=oo").move).toBe("oo");
    expect(parseSelection("?move=not-a-node").move).toBe(FLAGSHIP_ID);
  });

  it("omits the flagship from the query so / stays clean", () => {
    expect(selectionHref("/", FLAGSHIP_ID, false)).toBe("/");
    expect(selectionHref("/", "oo", false)).toBe("/?move=oo");
    expect(selectionHref("/", "oo", true)).toBe("/?move=oo&tape=1");
    expect(selectionHref("/", FLAGSHIP_ID, true)).toBe("/?tape=1");
    expect(selectionHref("/opening-preparation", FLAGSHIP_ID, false)).toBe("/opening-preparation");
    expect(selectionHref("/opening-preparation", "oo", false)).toBe("/opening-preparation?move=oo");
  });
});
