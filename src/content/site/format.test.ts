import { describe, expect, it } from "vitest";
import { formatClaimDate, formatMonth, formatPeriod } from "./format";

describe("format", () => {
  it("formats year-month", () => {
    expect(formatMonth("2026-06")).toBe("Jun 2026");
    expect(formatMonth("2026")).toBe("2026");
  });
  it("formats claim dates at any precision", () => {
    expect(formatClaimDate("2026")).toBe("2026");
    expect(formatClaimDate("2026-02")).toBe("Feb 2026");
    expect(formatClaimDate("2026-09-03")).toBe("3 Sep 2026");
  });
  it("formats periods with an open end as present", () => {
    expect(formatPeriod("2026-06", null)).toBe("Jun 2026 – present");
    expect(formatPeriod("2025-11", "2026-02")).toBe("Nov 2025 – Feb 2026");
  });
});
