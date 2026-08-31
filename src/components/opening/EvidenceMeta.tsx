import { EVIDENCE_TIER, type EvidenceKind } from "@/lib/metrics";

export function EvidenceMeta({
  note,
  kind,
}: {
  note?: string;
  kind?: EvidenceKind;
}) {
  if (!note && !kind) return null;
  return (
    <p className="evidence-meta">
      {kind ? EVIDENCE_TIER[kind] : null}
      {kind && note ? " · " : null}
      {note}
    </p>
  );
}
