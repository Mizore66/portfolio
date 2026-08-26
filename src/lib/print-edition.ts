import { resumeData } from "@/lib/data";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

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

type Cmd = { kind: "gap"; h: number } | { kind: "text"; font: "F1" | "F2" | "F3"; size: number; line: string };

function lineWidth(size: number): number {
  return Math.floor(CONTENT_W / (size * 0.5));
}

export function buildPrintEditionPdf(): Uint8Array {
  const d = resumeData;
  const cmds: Cmd[] = [];
  const push = (c: Cmd) => cmds.push(c);
  const heading = (t: string) => {
    push({ kind: "gap", h: 14 });
    push({ kind: "text", font: "F2", size: 11, line: t.toUpperCase() });
    push({ kind: "gap", h: 6 });
  };
  const para = (t: string, font: Cmd["font"] = "F1", size = 10) => {
    for (const line of wrap(t, lineWidth(size))) {
      push({ kind: "text", font, size, line });
    }
  };

  push({ kind: "text", font: "F2", size: 22, line: d.name });
  push({ kind: "gap", h: 4 });
  para("Opening Preparation  |  Print edition", "F3", 11);
  para(d.headline, "F1", 10);
  para(`${d.email}  |  ${d.github}  |  ${d.linkedin}`, "F1", 9);
  para(`Seeking ${d.targetRoles}`, "F3", 10);

  heading("Education");
  para(`${d.education.degree}`, "F2", 10);
  para(`${d.education.school}, ${d.education.location}`);
  para(`Graduating ${d.education.graduation}  |  WAM ${d.education.wam}  |  CGPA ${d.education.cgpa}`);

  heading("Experience");
  for (const job of d.experience) {
    push({ kind: "gap", h: 8 });
    para(`${job.title}${job.company ? `, ${job.company}` : ""}  |  ${job.period}`, "F2", 10);
    para(`${job.type}  |  ${job.tech.join(", ")}  |  ${job.impact}`, "F3", 9);
    for (const b of job.bullets) para(`- ${b}`, "F1", 9);
  }

  heading("Selected work");
  for (const p of d.projects) {
    push({ kind: "gap", h: 8 });
    para(`${p.name}  -  ${p.subtitle}  (${p.date})`, "F2", 10);
    para(`${p.tech.join(", ")}  |  ${p.impact}`, "F3", 9);
    para(p.description, "F1", 9);
  }

  heading("Skills");
  para(`Languages: ${d.skills.languages.join(", ")}`, "F1", 9);
  para(`Frameworks: ${d.skills.frameworks.join(", ")}`, "F1", 9);
  para(`Tools: ${d.skills.devTools.join(", ")}`, "F1", 9);
  para(`Libraries: ${d.skills.libraries.join(", ")}`, "F1", 9);
  para(`Databases: ${d.skills.databases.join(", ")}`, "F1", 9);

  push({ kind: "gap", h: 18 });
  para("C50 · Italian Game · Moves are facts. Annotations are voice.", "F3", 9);

  const pages: string[] = [];
  let y = PAGE_H - MARGIN;
  let stream: string[] = [];
  const flush = () => {
    pages.push(stream.join("\n"));
    stream = [];
    y = PAGE_H - MARGIN;
  };
  const ensure = (h: number) => {
    if (y - h < MARGIN) flush();
  };

  for (const cmd of cmds) {
    if (cmd.kind === "gap") {
      y -= cmd.h;
      continue;
    }
    const h = cmd.size + 3;
    ensure(h);
    stream.push("BT");
    stream.push(`/${cmd.font} ${cmd.size} Tf`);
    stream.push(`${MARGIN} ${y - cmd.size} Td`);
    stream.push(`(${pdfEscape(cmd.line)}) Tj`);
    stream.push("ET");
    y -= h;
  }
  if (stream.length) flush();

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const pageIds: number[] = [];
  const contentIds: number[] = [];
  // We'll assign: 1 catalog, 2 pages, 3-5 fonts, then page/content pairs
  const fontF1 = 3;
  const fontF2 = 4;
  const fontF3 = 5;
  objects.push(""); // placeholder pages
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>");

  for (const content of pages) {
    const contentId = objects.length + 1;
    const pageId = objects.length + 2;
    contentIds.push(contentId);
    pageIds.push(pageId);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontF1} 0 R /F2 ${fontF2} 0 R /F3 ${fontF3} 0 R >> >> >>`,
    );
  }

  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

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
