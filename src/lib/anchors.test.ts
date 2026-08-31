import { describe, expect, it } from "vitest";
import { companyAnchor } from "./anchors";

describe("companyAnchor", () => {
  it("keeps recruiter deep links boring", () => {
    expect(companyAnchor("Setel")).toBe("setel");
    expect(companyAnchor("Western Digital")).toBe("western-digital");
    expect(companyAnchor("Petronas")).toBe("petronas");
    expect(companyAnchor("Monash University")).toBe("monash-university");
  });
});
