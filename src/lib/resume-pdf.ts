import { join } from "node:path";
import PDFDocument from "pdfkit";
import { resumeData } from "@/content/site/resume";
import { CONTENT_UPDATED } from "@/content/site/updated";

/**
 * One-page tagged résumé (brief §4.2). Embedded, subset Schibsted Grotesk so "−", "→", "±" and "é"
 * render; a structure tree with headings; Lang en-GB; selectable text; clickable links.
 */

const PAPER = { letter: [612, 792], a4: [595, 842] } as const;
export type Paper = keyof typeof PAPER;

/** Fixed so identical content gives identical bytes (and a stable ETag). */
const CONTENT_DATE = new Date(`${CONTENT_UPDATED}T00:00:00Z`);

const FONT_DIR = join(process.cwd(), "src/fonts/schibsted-grotesk");
const REGULAR = join(FONT_DIR, "SchibstedGrotesk-Regular.ttf");
const SEMIBOLD = join(FONT_DIR, "SchibstedGrotesk-SemiBold.ttf");

const INK = "#14181D";
const MUTED = "#4A5561";
const RULE = "#D7DDE3";

export function buildResumePdf(paper: Paper = "letter"): Promise<Uint8Array> {
  const r = resumeData();
  const [W] = PAPER[paper];
  const M = 38;
  const doc = new PDFDocument({
    size: [...PAPER[paper]],
    margins: { top: 30, bottom: 26, left: M, right: M },
    font: REGULAR,
    pdfVersion: "1.7",
    tagged: true,
    lang: "en-GB",
    displayTitle: true,
    info: {
      Title: "Anas Tarek Qumhiyeh — Résumé",
      Author: r.name,
      Subject: "Résumé",
      Keywords: "software engineer, backend, full-stack, AI systems, Go, TypeScript, Python",
      CreationDate: CONTENT_DATE,
      ModDate: CONTENT_DATE,
    },
    autoFirstPage: true,
  });
  doc.registerFont("regular", REGULAR);
  doc.registerFont("semibold", SEMIBOLD);
  // PDFKit derives the file ID from the date; pin it so builds are reproducible.
  (doc as unknown as { _id?: unknown })._id = undefined;

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Uint8Array>((resolve) => doc.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks)))));

  const width = W - 2 * M;
  const root = doc.struct("Document");
  doc.addStructure(root);

  const para = (text: string, opts: { font?: string; size?: number; color?: string; gap?: number; indent?: number } = {}) => {
    doc
      .font(opts.font ?? "regular")
      .fontSize(opts.size ?? 8.7)
      .fillColor(opts.color ?? INK)
      .text(text, M + (opts.indent ?? 0), doc.y, {
        width: width - (opts.indent ?? 0),
        lineGap: 0.6,
        structParent: root,
        structType: "P",
      });
    if (opts.gap) doc.moveDown(opts.gap);
  };

  const heading = (text: string) => {
    doc.moveDown(0.35);
    const y = doc.y;
    doc.font("semibold").fontSize(9.8).fillColor(INK).text(text.toUpperCase(), M, y, {
      width,
      characterSpacing: 0.6,
      structParent: root,
      structType: "H2",
    });
    doc
      .moveTo(M, doc.y + 1)
      .lineTo(W - M, doc.y + 1)
      .lineWidth(0.6)
      .strokeColor(RULE)
      .stroke();
    doc.moveDown(0.25);
  };

  const bullets = (items: readonly string[]) => {
    for (const b of items) {
      const y = doc.y;
      doc.font("regular").fontSize(8.7).fillColor(MUTED).text("•", M + 2, y, { lineBreak: false });
      doc.fillColor(INK).text(b, M + 11, y, { width: width - 11, lineGap: 0.6, structParent: root, structType: "P" });
      doc.moveDown(0.06);
    }
  };

  // Header
  doc.font("semibold").fontSize(19).fillColor(INK).text(r.name, M, doc.y, { width, structParent: root, structType: "H1" });
  doc.moveDown(0.15);
  para(r.summary, { size: 9.2, gap: 0.2 });

  // Contact: one line of links, tagged as paragraphs with link annotations.
  const contactY = doc.y;
  doc.font("regular").fontSize(8.6).fillColor(INK);
  let x = M;
  r.contact.forEach((c, i) => {
    const sep = i ? "  ·  " : "";
    if (sep) {
      doc.fillColor(MUTED).text(sep, x, contactY, { width: doc.widthOfString(sep) + 1, lineBreak: false });
      x += doc.widthOfString(sep);
    }
    const w = doc.widthOfString(c.label);
    doc.fillColor(INK).text(c.label, x, contactY, { width: w + 1, lineBreak: false, link: c.href, structParent: root, structType: "P" });
    x += w;
  });
  doc.x = M;
  doc.y = contactY + 12;
  para(r.status, { size: 8.6, color: MUTED });
  para("Case studies, the annotated career and a playable engine: anasqumhiyeh.dev (this résumé is built from the same content).", {
    size: 8.2,
    color: MUTED,
  });

  heading("Experience");
  for (const e of r.experience) {
    const y = doc.y;
    doc.font("semibold").fontSize(9.6).fillColor(INK).text(e.heading, M, y, { width: width - 170, structParent: root, structType: "H3" });
    doc.font("regular").fontSize(8.6).fillColor(MUTED).text(e.meta, W - M - 170, y + 1, { width: 170, align: "right", structParent: root, structType: "P" });
    doc.x = M;
    doc.y = Math.max(doc.y, y + 12);
    para(e.tech, { size: 8.2, color: MUTED });
    doc.moveDown(0.1);
    bullets(e.bullets);
    doc.moveDown(0.2);
  }

  heading("Projects");
  for (const p of r.projects) {
    doc.font("semibold").fontSize(9.6).fillColor(INK).text(p.heading, M, doc.y, { width, link: p.href, structParent: root, structType: "H3" });
    para(p.meta, { size: 8.2, color: MUTED });
    doc.moveDown(0.1);
    bullets(p.bullets);
    doc.moveDown(0.2);
  }

  heading("Education and awards");
  doc.font("semibold").fontSize(9.6).fillColor(INK).text(r.education.heading, M, doc.y, { width, structParent: root, structType: "H3" });
  para(`${r.education.meta}. ${r.education.lines.join(" ")}`, { size: 8.8 });
  para(r.awards.join(" · "), { size: 8.8 });

  heading("Skills");
  // One plain paragraph in one font: wraps cleanly and reads well in ATS parsers.
  para(r.skills.map((g) => `${g.label}: ${g.items}.`).join("  "), { size: 8.5 });

  doc.end();
  return done;
}
