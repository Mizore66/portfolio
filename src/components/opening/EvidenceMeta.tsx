import { EVIDENCE_TIER, type EvidenceKind } from "@/lib/metrics";

function noteWithoutKind(note: string | undefined, kind?: EvidenceKind): string | undefined {
  if (!note || !kind) return note;
  const label = EVIDENCE_TIER[kind];
  return note
    .replace(new RegExp(`^${label}\\s*[·•,]\\s*`, "i"), "")
    .replace(/^evaluation\s*[·•,]\s*/i, "");
}

export function EvidenceMeta({
  note,
  kind,
}: {
  note?: string;
  kind?: EvidenceKind;
}) {
  const cleaned = noteWithoutKind(note, kind);
  if (!cleaned && !kind) return null;
  return (
    <p className="evidence-meta">
      {kind ? EVIDENCE_TIER[kind] : null}
      {kind && cleaned ? " · " : null}
      {cleaned}
    </p>
  );
}
