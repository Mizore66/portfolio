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
      {kind ? (
        <span className="evidence-badge" data-testid="evidence-badge">
          {EVIDENCE_TIER[kind]}
        </span>
      ) : null}
      {kind && cleaned ? <span className="evidence-meta-note"> · {cleaned}</span> : null}
      {!kind && cleaned ? cleaned : null}
    </p>
  );
}
