import { FLAGSHIP_ID } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { FEATURED_PROJECT_SLUGS, HERO_PROOF, POSITIONING } from "@/lib/metrics";
import { occupancy, positionAfter, squareFile, squareRank } from "@/lib/chess/replay";
import { collectPlies } from "@/lib/opening/tree";

const PAGE_W = 612;
const PAGE_H = 792;
const M = 40;
const INK = "0.102 0.071 0.047";
const SQ = 22;
const BOARD = 8 * SQ;

function ascii(s: string): string {
  return s
    .replace(/[—–]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/→/g, "->")
    .replace(/×/g, "x")
    .replace(/−/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E]/g, "");
}

function pdfEscape(s: string): string {
  return ascii(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text: string, width: number): string[] {
  const words = ascii(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > width) {
      if (cur) lines.push(cur);
      cur = w.length > width ? w.slice(0, width) : w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function n(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

export function buildPrintEditionPdf(): Uint8Array {
  const d = resumeData;
  const ops: string[] = [];
  const colW = 318;

  const rule = (y: number, w: number) => {
    ops.push(`${INK} RG`, `${w} w`, `${M} ${n(y)} m ${PAGE_W - M} ${n(y)} l S`);
  };
  const txt = (font: "F1" | "F2" | "F3", size: number, x: number, y: number, s: string) => {
    ops.push(
      "BT",
      `/${font} ${size} Tf`,
      `${INK} rg`,
      `1 0 0 1 ${n(x)} ${n(y)} Tm`,
      `(${pdfEscape(s)}) Tj`,
      "ET",
    );
  };
  const heading = (y: number, t: string) => {
    txt("F2", 8.5, M, y, t.toUpperCase());
    ops.push(`${INK} RG`, "0.5 w", `${M} ${n(y - 3)} m ${M + colW} ${n(y - 3)} l S`);
    return y - 16;
  };

  rule(PAGE_H - 32, 1.8);
  rule(PAGE_H - 36, 0.5);
  txt("F2", 9, M, PAGE_H - 52, "OPENING PREPARATION  |  Resume  |  Print edition");
  txt("F3", 9, PAGE_W - M - 22, PAGE_H - 52, "C50");
  txt("F2", 20, M, PAGE_H - 76, d.name);
  let headY = PAGE_H - 90;
  for (const line of wrap(POSITIONING.tagline, 92)) {
    txt("F3", 8, M, headY, line);
    headY -= 11;
  }
  for (const line of wrap(d.headline, 92)) {
    txt("F1", 8, M, headY, line);
    headY -= 11;
  }
  txt("F1", 8, M, headY, `${d.email}  |  ${d.github}  |  ${d.linkedin}`);
  headY -= 12;
  for (const line of wrap(`${POSITIONING.availability} ${POSITIONING.graduateNote}`, 92)) {
    txt("F3", 8, M, headY, line);
    headY -= 11;
  }
  txt("F2", 8, M, headY, ascii(HERO_PROOF.map((item) => item.label).join("  |  ")));
  headY -= 10;
  rule(headY, 0.5);
  rule(headY - 4, 1.4);
  const headerBottom = headY - 4;

  const boardX = PAGE_W - M - BOARD;
  const boardY = headerBottom - 18 - BOARD;
  ops.push("0.91 0.86 0.77 rg", `${n(boardX)} ${n(boardY)} ${BOARD} ${BOARD} re`, "f");
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      if ((file + rank) % 2 !== 0) continue;
      const x = boardX + file * SQ;
      const y = boardY + rank * SQ;
      ops.push("0.56 0.52 0.45 rg", `${n(x)} ${n(y)} ${SQ} ${SQ} re`, "f");
    }
  }
  ops.push(`${INK} RG`, "1.2 w", `${n(boardX)} ${n(boardY)} ${BOARD} ${BOARD} re`, "S");

  const flagshipPlies = collectPlies(FLAGSHIP_ID);
  const pieces = positionAfter(flagshipPlies).filter((p) => !p.captured);
  const occ = occupancy(pieces);
  const last = flagshipPlies[flagshipPlies.length - 1];
  ops.push(`% fen-occ ${Object.entries(occ).sort(([a], [b]) => a.localeCompare(b)).map(([sq, p]) => `${sq}=${p}`).join(" ")}`);

  if (last) {
    for (const sq of [last.from, last.to]) {
      const file = squareFile(sq);
      const rank = squareRank(sq);
      ops.push(
        "0.82 0.55 0.48 rg",
        `${n(boardX + file * SQ)} ${n(boardY + rank * SQ)} ${SQ} ${SQ} re`,
        "f",
      );
    }
    ops.push(`${INK} RG`, "1.2 w", `${n(boardX)} ${n(boardY)} ${BOARD} ${BOARD} re`, "S");
  }

  for (const piece of pieces) {
    const file = squareFile(piece.square);
    const rank = squareRank(piece.square);
    const glyph = piece.color === "w" ? piece.type : piece.type.toLowerCase();
    const font = piece.color === "w" ? "F2" : "F3";
    const size = 13;
    const x = boardX + file * SQ + 6.2;
    const y = boardY + rank * SQ + 6.4;
    ops.push(`% occ ${piece.square} ${piece.color}${piece.type}`);
    txt(font, size, x, y, glyph);
  }

  for (let i = 0; i < 8; i++) {
    txt("F1", 7, boardX + i * SQ + 8, boardY - 11, "abcdefgh"[i]);
    txt("F1", 7, boardX - 10, boardY + i * SQ + 7, String(i + 1));
  }
  txt("F3", 8, boardX, boardY - 24, "5. d4 - the Italian break");

  const headingRight = (y: number, t: string) => {
    txt("F2", 8, boardX, y, t.toUpperCase());
    ops.push(
      `${INK} RG`,
      "0.5 w",
      `${n(boardX)} ${n(y - 3)} m ${n(boardX + BOARD)} ${n(y - 3)} l S`,
    );
    return y - 14;
  };

  let y = headerBottom - 22;
  y = heading(y, "Education");
  txt("F2", 9, M, y, d.education.degree);
  y -= 12;
  for (const line of wrap(
    `${d.education.school}, ${d.education.location}. ${d.education.honours}. Graduated ${d.education.graduation}. WAM ${d.education.wam}  |  CGPA ${d.education.cgpa}.`,
    58,
  )) {
    txt("F1", 8, M, y, line);
    y -= 11;
  }

  y -= 8;
  y = heading(y, "Experience");
  for (const job of d.experience) {
    const who = job.company ? `${job.title}, ${job.company}` : job.title;
    txt("F2", 9, M, y, ascii(who));
    y -= 11;
    txt("F3", 8, M, y, ascii(`${job.period}  |  ${job.tech.join(", ")}  |  ${job.impact}`));
    y -= 16;
  }

  y -= 8;
  y = heading(y, "Skills");
  const skillLines = [
    `Languages: ${d.skills.languages.join(", ")}`,
    `Frameworks: ${d.skills.frameworks.join(", ")}`,
    `Tools: ${d.skills.devTools.join(", ")}`,
    `Libraries: ${d.skills.libraries.join(", ")}`,
    `Databases: ${d.skills.databases.join(", ")}`,
  ];
  for (const block of skillLines) {
    for (const line of wrap(block, 58)) {
      txt("F1", 8, M, y, line);
      y -= 11;
    }
  }

  const featuredSet = new Set<string>(FEATURED_PROJECT_SLUGS);
  let ry = boardY - 40;
  ry = headingRight(ry, "Selected work");
  for (const p of d.projects.filter((proj) => featuredSet.has(proj.slug))) {
    const extra =
      p.slug === "veridian"
        ? " 3-sheet filing: economized plant / policy retrieval / distillation."
        : "";
    txt("F2", 8, boardX, ry, ascii(p.name));
    ry -= 10;
    for (const line of wrap(`${p.subtitle}. ${p.impact}.${extra}`, 32)) {
      txt("F1", 7, boardX, ry, line);
      ry -= 9;
    }
    ry -= 3;
  }
  txt("F1", 7, boardX, ry, "Also:");
  ry -= 9;
  for (const p of d.projects.filter((proj) => !featuredSet.has(proj.slug))) {
    txt("F1", 7, boardX, ry, ascii(p.name));
    ry -= 9;
    txt("F1", 7, boardX, ry, ascii(p.impact));
    ry -= 11;
  }

  txt("F3", 7, M, 36, "C50  |  Italian Game  |  a game played since I was a teenager.");
  txt(
    "F3",
    7,
    M,
    24,
    "Photographs real and composed; impressions imagined; the subject is real throughout.",
  );
  rule(48, 0.5);

  const content = ops.join("\n");
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [7 0 R] /Count 1 >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents 6 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> >>`,
  ];

  let out = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n`;
  out += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(out);
}
