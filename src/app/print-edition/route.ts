import { buildPrintEditionPdf } from "@/lib/print-edition";

export function GET() {
  const bytes = buildPrintEditionPdf();
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return new Response(copy, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Qumhiyeh-Opening-Preparation.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
