import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_FIGURES } from "@/content/project-figures";

const publicDir = join(process.cwd(), "public");
const script = join(process.cwd(), "scripts/check-callout-ink.py");

describe("project-patent callouts", () => {
  it("gives every legend entry exactly one primary numeral", () => {
    for (const [id, spec] of Object.entries(PROJECT_FIGURES)) {
      for (const part of spec.parts) {
        const primaries = spec.numerals.filter((n) => n.mark === String(part.n));
        expect(primaries, `${id} legend ${part.n} (${part.label})`).toHaveLength(1);
      }
    }
  });

  it("parks every numeral's anchor on non-background raster", () => {
    expect(existsSync(script)).toBe(true);
    const payload = Object.values(PROJECT_FIGURES).flatMap((spec) =>
      spec.numerals.map((n) => ({
        fig: spec.fig,
        src: join(publicDir, spec.engraving.src.replace(/^\//, "")),
        mark: n.mark,
        fromX: n.fromX,
        fromY: n.fromY,
      })),
    );
    const result = spawnSync("python3", [script], {
      input: JSON.stringify(payload),
      encoding: "utf8",
    });
    expect(result.status, result.stderr || result.stdout).toBe(0);
  });

  it("drops the still's orphaned 2a", () => {
    const marks = PROJECT_FIGURES["slm-distillation-engine"].numerals.map((n) => n.mark);
    expect(marks).not.toContain("2a");
    expect(marks.filter((m) => m === "2")).toHaveLength(1);
  });

  it("keeps the inventor in the Setel pump plate at print-inset size", () => {
    const result = spawnSync(
      "python3",
      [
        "-c",
        [
          "from PIL import Image",
          "im = Image.open('public/plates/clip-setel.jpg').convert('RGB')",
          "im.thumbnail((200, 200))",
          "w, h = im.size",
          "dark = n = 0",
          "for y in range(h):",
          "  for x in range(int(w * 0.35), w):",
          "    r, g, b = im.getpixel((x, y))[:3]",
          "    L = 0.299*r + 0.587*g + 0.114*b",
          "    n += 1",
          "    dark += L < 90",
          "ratio = dark / n",
          "print(ratio)",
          "assert ratio > 0.08, ratio",
        ].join("\n"),
      ],
      { encoding: "utf8", cwd: process.cwd() },
    );
    expect(result.status, result.stderr || result.stdout).toBe(0);
  });
});
