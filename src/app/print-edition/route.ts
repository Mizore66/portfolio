import { buildPrintEditionPdf } from "@/lib/print-edition";
import { activeAvailability } from "@/lib/cms/ledger";
import { getRenderableDocument } from "@/lib/cms/store";

export async function GET() {
  const document = await getRenderableDocument();
  const bytes = buildPrintEditionPdf({
    dek: document.profile.dek,
    availability: activeAvailability(document),
  });
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  const etag = `"resume-${document.revisionId}"`;
  return new Response(copy, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Anas-Tarek-Qumhiyeh-resume-${document.revisionId}.pdf"`,
      "Cache-Control": "private, no-store, must-revalidate",
      ETag: etag,
    },
  });
}
