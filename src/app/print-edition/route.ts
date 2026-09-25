import { createHash } from "node:crypto";
import { buildResumePdf } from "@/lib/resume-pdf";

/** The one-page résumé (brief §4.2): Letter by default, A4 with ?paper=a4. */
export async function GET(request: Request) {
  const paper = new URL(request.url).searchParams.get("paper") === "a4" ? "a4" : "letter";
  const bytes = await buildResumePdf(paper);
  const etag = `"resume-${createHash("sha256").update(bytes).digest("hex").slice(0, 32)}"`;
  const headers = {
    "Content-Type": "application/pdf",
    "Content-Disposition": 'inline; filename="Anas-Tarek-Qumhiyeh-resume.pdf"',
    "Cache-Control": "no-store",
    ETag: etag,
  };
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
  const body = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(body).set(bytes);
  return new Response(body, { headers });
}
