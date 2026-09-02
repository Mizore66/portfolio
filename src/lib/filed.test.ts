import { describe, expect, it } from "vitest";
import { filedYearMonth, parseFiledDate } from "./filed";

describe("filed dates", () => {
  it("parses month filings as UTC month-start, not local midnight", () => {
    expect(filedYearMonth("Apr 2026")).toBe("2026-04");
    expect(filedYearMonth("Mar 2026")).toBe("2026-03");
    expect(parseFiledDate("2026-08-29")?.toISOString()).toBe("2026-08-29T00:00:00.000Z");
  });
});
