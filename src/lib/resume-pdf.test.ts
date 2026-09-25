import { describe, expect, it } from "vitest";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { CLAIMS } from "@/content/site/claims";
import { resumeData } from "@/content/site/resume";
import { buildResumePdf } from "./resume-pdf";

async function read(paper: "letter" | "a4") {
  const bytes = await buildResumePdf(paper);
  const doc = await getDocument({ data: new Uint8Array(bytes), useSystemFonts: false }).promise;
  const page = await doc.getPage(1);
  const text = (await page.getTextContent()).items.map((i) => ("str" in i ? i.str : "")).join(" ");
  const meta = await doc.getMetadata();
  const tree = await page.getStructTree();
  const links = (await page.getAnnotations()).filter((a) => a.subtype === "Link").map((a) => a.url as string);
  const [, , w, h] = page.view;
  return { doc, text, meta, tree, links, size: [Math.round(w), Math.round(h)], bytes };
}

function roles(node: { role?: string; children?: unknown[] } | null, out: string[] = []): string[] {
  if (!node) return out;
  if (node.role) out.push(node.role);
  for (const c of (node.children ?? []) as { role?: string; children?: unknown[] }[]) roles(c, out);
  return out;
}

describe("résumé PDF", () => {
  for (const [paper, size] of [["letter", [612, 792]], ["a4", [595, 842]]] as const) {
    it(`fits on one ${paper} page`, async () => {
      const r = await read(paper);
      expect(r.doc.numPages).toBe(1);
      expect(r.size).toEqual(size);
    });
  }

  it("renders −, →, ± and é as real text", async () => {
    const { text } = await read("letter");
    for (const ch of ["−", "→", "é"]) expect(text, ch).toContain(ch);
    expect(text).toContain("Anas Tarek Qumhiyeh");
    expect(text).toContain("+60 11-12983-246");
    expect(text).toContain("WAM 81.8, CGPA 3.78");
  });

  it("is tagged, in en-GB, and titled", async () => {
    const r = await read("a4");
    const info = r.meta.info as { Title?: string; Language?: string };
    expect(info.Title).toBe("Anas Tarek Qumhiyeh — Résumé");
    expect(info.Language).toBe("en-GB");
    const tags = roles(r.tree as never);
    expect(tags).toContain("H1");
    expect(tags.filter((t) => t === "H2").length).toBeGreaterThanOrEqual(4);
    expect(tags).toContain("P");
  });

  it("keeps links clickable", async () => {
    const { links } = await read("letter");
    expect(links).toContain("mailto:anasqumhiyeh@gmail.com");
    expect(links).toContain("tel:+601112983246");
    expect(links).toContain("https://github.com/Mizore66");
  });

  it("is byte-stable for the same content (a stable ETag)", async () => {
    const a = await buildResumePdf("letter");
    const b = await buildResumePdf("letter");
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  });
});

describe("résumé content", () => {
  const r = resumeData();
  const text = JSON.stringify(r);

  it("mirrors the primary résumé: Deriv, Skribble Lab, Monash; FaultLine and Teleportal", () => {
    expect(r.experience.map((e) => e.heading)).toEqual([
      "AI Engineer, Deriv",
      "Software Engineer, Skribble Lab",
      "Full-Stack AI Engineer, Monash University",
    ]);
    expect(r.projects.map((p) => p.heading.split(":")[0])).toEqual(["FaultLine", "Gemini Teleportal"]);
    expect(r.status).toMatch(/Singapore or Australia/);
  });

  it("only prints numbers that the claims ledger registers", () => {
    const ledger = JSON.stringify(CLAIMS);
    for (const e of r.experience)
      for (const b of e.bullets)
        for (const n of b.match(/\d[\d,]*(\.\d+)?/g) ?? []) expect(ledger, `${n} in "${b}"`).toContain(n.replace(/,/g, ","));
  });

  it("keeps −50% under Monash only and never merges +45% with +35%", () => {
    const monash = JSON.stringify(r.experience.find((e) => e.heading.includes("Monash")));
    expect(monash).toContain("−50%");
    expect(text.split("−50%").length - 1).toBe(1);
    expect(text).not.toMatch(/35%/);
  });
});
