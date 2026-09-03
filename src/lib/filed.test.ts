import { describe, expect, it } from "vitest";
import { filedYearMonth, formatClaimDate, parseFiledDate } from "./filed";

describe("filed dates", () => {
  it("parses month filings as UTC month-start, not local midnight", () => {
    expect(filedYearMonth("Apr 2026")).toBe("2026-04");
    expect(filedYearMonth("Mar 2026")).toBe("2026-03");
    expect(parseFiledDate("2026-08-29")?.toISOString()).toBe("2026-08-29T00:00:00.000Z");
  });

  it("renders claim dates for the public surface", () => {
    expect(formatClaimDate("2025-12")).toBe("Dec 2025");
    expect(formatClaimDate("2026-08-29")).toBe("29 Aug 2026");
    expect(formatClaimDate("2025")).toBe("2025");
  });
});
