import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { FEATURED_PROJECT_SLUGS, HERO_PROOF, POSITIONING } from "@/lib/metrics";
import { SITE_HOST, SITE_URL } from "@/lib/site";

const PAGE_W = 612;
const PAGE_H = 792;
const M = 40;
const INK = "0.102 0.071 0.047";

function ascii(s: string): string {
  return s
    .replace(/[—–]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/→/g, "->")
    .replace(/×/g, "x")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E\u2212]/g, "");
}

function pdfEscape(s: string): string {
  return ascii(s)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\u2212/g, "\\226");
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

function uriAnnot(x: number, y: number, width: number, uri: string): string {
  return `<< /Type /Annot /Subtype /Link /Rect [${n(x)} ${n(y - 2)} ${n(x + width)} ${n(y + 8)}] /Border [0 0 0] /A << /S /URI /URI (${pdfEscape(uri)}) >> >>`;
}

type Mark = { role: "H1" | "H2" | "P" | "Link"; mcid: number };

/**
 * One-page tagged résumé. Single column, no chessboard: ATS and screen
 * readers should not meet the Italian Game before Education.
 */
export function buildPrintEditionPdf(): Uint8Array {
  const d = resumeData;
  const ops: string[] = [];
  const annots: string[] = [];
  const marks: Mark[] = [];
  const CHAR_W = 4;
  let mcid = 0;

  const begin = (role: Mark["role"]) => {
    const id = mcid++;
    ops.push(`/${role} << /MCID ${id} >> BDC`);
    marks.push({ role, mcid: id });
  };
  const end = () => {
    ops.push("EMC");
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
  const marked = (role: Mark["role"], write: () => void) => {
    begin(role);
    write();
    end();
  };
  const rule = (y: number, w: number) => {
    ops.push(`${INK} RG`, `${w} w`, `${M} ${n(y)} m ${PAGE_W - M} ${n(y)} l S`);
  };

  rule(PAGE_H - 32, 1.8);
  rule(PAGE_H - 36, 0.5);
  marked("P", () => txt("F2", 9, M, PAGE_H - 52, "OPENING PREPARATION  |  Resume  |  Bandar Sunway, Malaysia"));
  marked("H1", () => txt("F2", 20, M, PAGE_H - 76, d.name));
  let y = PAGE_H - 90;
  for (const line of wrap(d.headline, 92)) {
    marked("P", () => txt("F1", 9, M, y, line));
    y -= 11;
  }
  const emailLine = `${d.email}  |  ${SITE_HOST}`;
  marked("Link", () => txt("F1", 8, M, y, emailLine));
  annots.push(uriAnnot(M, y, d.email.length * CHAR_W, `mailto:${d.email}`));
  annots.push(
    uriAnnot(M + (d.email.length + 5) * CHAR_W, y, SITE_HOST.length * CHAR_W, SITE_URL),
  );
  y -= 11;
  const social = `${d.github}  |  ${d.linkedin}`;
  marked("Link", () => txt("F1", 8, M, y, social));
  annots.push(uriAnnot(M, y, d.github.length * CHAR_W, `https://${d.github}`));
  annots.push(
    uriAnnot(
      M + (d.github.length + 5) * CHAR_W,
      y,
      d.linkedin.length * CHAR_W,
      `https://${d.linkedin.replace(/\/$/, "")}`,
    ),
  );
  y -= 12;
  for (const line of wrap(POSITIONING.availability, 92)) {
    marked("P", () => txt("F3", 8, M, y, line));
    y -= 11;
  }
  marked("P", () => txt("F2", 8, M, y, ascii(HERO_PROOF.map((item) => item.label).join("  |  "))));
  y -= 10;
  rule(y, 0.5);
  rule(y - 4, 1.4);
  y -= 22;

  const heading = (t: string) => {
    marked("H2", () => txt("F2", 8.5, M, y, t.toUpperCase()));
    ops.push(`${INK} RG`, "0.5 w", `${M} ${n(y - 3)} m ${PAGE_W - M} ${n(y - 3)} l S`);
    y -= 16;
  };

  heading("Education");
  marked("P", () => txt("F2", 9, M, y, d.education.degree));
  y -= 11;
  marked("P", () =>
    txt("F1", 8, M, y, ascii(`${d.education.school}, ${d.education.location}. ${d.education.honours}.`)),
  );
  y -= 10;
  marked("P", () =>
    txt("F1", 8, M, y, ascii(`Graduated ${d.education.graduation}. WAM ${d.education.wam}  |  CGPA ${d.education.cgpa}.`)),
  );
  y -= 14;

  heading("Experience");
  for (const job of d.experience) {
    const who = job.company ? `${job.title}, ${job.company}` : job.title;
    marked("P", () => txt("F2", 9, M, y, ascii(who)));
    y -= 10;
    marked("P", () => txt("F3", 8, M, y, ascii(`${job.period}  |  ${job.tech.join(", ")}`)));
    y -= 10;
    for (const bullet of job.bullets) {
      const lines = wrap(ascii(bullet), 94);
      for (let i = 0; i < lines.length; i++) {
        if (i === 0) {
          ops.push(`${INK} rg`, `${n(M + 1)} ${n(y + 1.2)} 2.4 2.4 re f`);
        }
        marked("P", () => txt("F1", 8, M + 8, y, lines[i]));
        y -= 10;
      }
    }
    y -= 6;
  }

  heading("Selected work");
  const featuredSet = new Set<string>(FEATURED_PROJECT_SLUGS);
  for (const p of d.projects.filter((proj) => featuredSet.has(proj.slug))) {
    const extra =
      p.slug === "veridian"
        ? " Intercepts Terraform before the spike; recommends a lower-carbon compute configuration."
        : "";
    marked("P", () => txt("F2", 9, M, y, ascii(`${p.name}  |  ${p.impact}`)));
    y -= 10;
    for (const line of wrap(`${p.subtitle}.${extra}`, 96)) {
      marked("P", () => txt("F1", 8, M, y, line));
      y -= 9;
    }
    y -= 2;
  }
  const also = d.projects
    .filter((proj) => !featuredSet.has(proj.slug))
    .map((p) => `${p.name} (${p.impact})`)
    .join("  |  ");
  for (const line of wrap(`Also: ${also}`, 96)) {
    marked("P", () => txt("F1", 8, M, y, ascii(line)));
    y -= 10;
  }

  y -= 4;
  heading("Stack");
  marked("P", () =>
    txt(
      "F1",
      8,
      M,
      y,
      ascii(
        `Languages: ${d.skillsCore.languages.join(", ")}  |  Infrastructure: ${d.skillsCore.infrastructure.join(", ")}`,
      ),
    ),
  );
  y -= 10;
  marked("P", () => txt("F1", 8, M, y, ascii(`ML: ${d.skillsCore.ml.join(", ")}`)));
  y -= 12;

  rule(y, 0.5);
  y -= 14;
  const paperUrl = `${SITE_URL}${BROADSHEET.paperHref}`;
  const paperLine = `${SITE_HOST}${BROADSHEET.paperHref}`;
  marked("Link", () => txt("F3", 8, M, y, ascii(paperLine)));
  annots.push(uriAnnot(M, y, Math.min(paperLine.length * 3.2, PAGE_W - 2 * M), paperUrl));

  const content = ops.join("\n");
  const annotObjs = annots;
  const annotStart = 8;
  const annotRefs = annotObjs.map((_, i) => `${annotStart + i} 0 R`).join(" ");
  const structStart = annotStart + annotObjs.length;
  const structElems = marks.map(
    (mark, i) =>
      `<< /Type /StructElem /S /${mark.role} /P ${structStart + marks.length} 0 R /Pg 7 0 R /K ${mark.mcid} >>`,
  );
  const documentObjNum = structStart + marks.length;
  const rootObjNum = documentObjNum + 1;
  const parentTreeObjNum = rootObjNum + 1;
  const infoObjNum = parentTreeObjNum + 1;
  const structKids = marks.map((_, i) => `${structStart + i} 0 R`).join(" ");
  const parentKids = marks.map((_, i) => `${structStart + i} 0 R`).join(" ");
  const pageDict = annotObjs.length
    ? `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents 6 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Annots [${annotRefs}] /StructParents 0 >>`
    : `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents 6 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /StructParents 0 >>`;

  const catalog = `<< /Type /Catalog /Pages 2 0 R /Lang (en-GB) /MarkInfo << /Marked true >> /StructTreeRoot ${rootObjNum} 0 R /ViewerPreferences << /DisplayDocTitle true >> >>`;
  const documentElem = `<< /Type /StructElem /S /Document /Lang (en-GB) /K [${structKids}] /P ${rootObjNum} 0 R >>`;
  const structRoot = `<< /Type /StructTreeRoot /K [${documentObjNum} 0 R] /ParentTree ${parentTreeObjNum} 0 R /ParentTreeNextKey 1 >>`;
  const parentTree = `<< /Nums [ 0 [${parentKids}] ] >>`;
  const info = `<< /Title (${pdfEscape("Anas Tarek Qumhiyeh - Resume")}) /Author (${pdfEscape(d.name)}) /Subject (${pdfEscape(d.headline)}) /Lang (en-GB) >>`;

  const objects: string[] = [
    catalog,
    "<< /Type /Pages /Kids [7 0 R] /Count 1 >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    pageDict,
    ...annotObjs,
    ...structElems,
    documentElem,
    structRoot,
    parentTree,
    info,
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
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoObjNum} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(out);
}
