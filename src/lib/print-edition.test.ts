import { describe, expect, it } from "vitest";
import { buildPrintEditionPdf } from "./print-edition";
import { resumeData } from "@/lib/data";

describe("print edition", () => {
  it("is a PDF that carries the résumé name", () => {
    const bytes = buildPrintEditionPdf();
    const text = new TextDecoder().decode(bytes);
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("%%EOF");
    expect(text).toContain(resumeData.name);
    expect(text).toContain("Print edition");
  });
});
