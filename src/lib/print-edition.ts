import { FLAGSHIP_ID } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { positionAfter, squareFile, squareRank } from "@/lib/chess/replay";
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
      `${n(x)} ${n(y)} Td`,
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
  txt("F2", 9, M, PAGE_H - 52, "OPENING PREPARATION  |  Print edition");
  txt("F3", 9, PAGE_W - M - 22, PAGE_H - 52, "C50");
  txt("F2", 20, M, PAGE_H - 76, d.name);
  txt("F1", 9, M, PAGE_H - 90, d.headline);
  txt("F1", 8, M, PAGE_H - 102, `${d.email}  |  ${d.github}  |  ${d.linkedin}`);
  txt("F3", 8, M, PAGE_H - 114, `Seeking ${d.targetRoles}`);
  rule(PAGE_H - 122, 0.5);
  rule(PAGE_H - 126, 1.4);

  const boardX = PAGE_W - M - BOARD;
  const boardY = PAGE_H - 126 - 18 - BOARD;
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

  const pieces = positionAfter(collectPlies(FLAGSHIP_ID)).filter((p) => !p.captured);
  for (const piece of pieces) {
    const file = squareFile(piece.square);
    const rank = squareRank(piece.square);
    const glyph = piece.color === "w" ? piece.type : piece.type.toLowerCase();
    const font = piece.color === "w" ? "F2" : "F3";
    const size = 13;
    const x = boardX + file * SQ + 6.2;
    const y = boardY + rank * SQ + 6.4;
    txt(font, size, x, y, glyph);
  }

  for (let i = 0; i < 8; i++) {
    txt("F1", 7, boardX + i * SQ + 8, boardY - 11, "abcdefgh"[i]);
    txt("F1", 7, boardX - 10, boardY + i * SQ + 7, String(i + 1));
  }
  txt("F3", 8, boardX, boardY - 24, "5. d4 - the Italian break");

  let y = PAGE_H - 148;
  y = heading(y, "Education");
  txt("F2", 9, M, y, d.education.degree);
  y -= 12;
  for (const line of wrap(
    `${d.education.school}, ${d.education.location}. Graduating ${d.education.graduation}. WAM ${d.education.wam}  |  CGPA ${d.education.cgpa}.`,
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

  y -= 2;
  y = heading(y, "Selected work");
  for (const p of d.projects) {
    for (const line of wrap(`${p.name} - ${p.subtitle}. ${p.impact}.`, 58)) {
      txt("F1", 8, M, y, line);
      y -= 11;
    }
    y -= 3;
  }

  y -= 6;
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

  txt("F3", 8, M, 36, "C50  |  Italian Game  |  Moves are facts. Annotations are voice.");
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
