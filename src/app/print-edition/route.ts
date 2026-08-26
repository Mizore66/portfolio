import { buildPrintEditionPdf } from "@/lib/print-edition";

export function GET() {
  const body = buildPrintEditionPdf();
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Qumhiyeh-Opening-Preparation.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
