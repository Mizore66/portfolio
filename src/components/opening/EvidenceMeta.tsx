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
  source,
  gap,
  compact = false,
}: {
  note?: string;
  kind?: EvidenceKind;
  source?: string;
  gap?: string;
  compact?: boolean;
}) {
  const cleaned = noteWithoutKind(note, kind);
  if (!cleaned && !kind && !source && !gap) return null;
  if (compact) {
    if (!cleaned) return null;
    return <p className="evidence-meta-compact">{cleaned}</p>;
  }
  return (
    <dl className="evidence-meta">
      {kind ? (
        <div>
          <dt>Kind</dt>
          <dd>
            <span className="evidence-badge" data-testid="evidence-badge">
              {EVIDENCE_TIER[kind]}
            </span>
          </dd>
        </div>
      ) : null}
      {cleaned ? (
        <div>
          <dt>Note</dt>
          <dd className={kind ? "evidence-meta-note" : undefined}>{cleaned}</dd>
        </div>
      ) : null}
      {source ? (
        <div>
          <dt>Source</dt>
          <dd>{source}</dd>
        </div>
      ) : null}
      {gap ? (
        <div>
          <dt>Gap</dt>
          <dd>{gap}</dd>
        </div>
      ) : null}
    </dl>
  );
}
