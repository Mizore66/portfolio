import { buildPrintEditionPdf } from "@/lib/print-edition";

export function GET() {
  const body = buildPrintEditionPdf();
  return new Response(new Blob([body], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Qumhiyeh-Opening-Preparation.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
