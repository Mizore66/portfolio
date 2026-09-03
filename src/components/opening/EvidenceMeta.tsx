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
    <dl className="evidence-meta">
      {kind ? (
        <div>
          <dt className="sr-only">Kind</dt>
          <dd>
            <span className="evidence-badge" data-testid="evidence-badge">
              {EVIDENCE_TIER[kind]}
            </span>
          </dd>
        </div>
      ) : null}
      {cleaned ? (
        <div>
          <dt className="sr-only">Note</dt>
          <dd className={kind ? "evidence-meta-note" : undefined}>{kind ? ` · ${cleaned}` : cleaned}</dd>
        </div>
      ) : null}
    </dl>
  );
}
