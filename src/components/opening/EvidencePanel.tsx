import { EVIDENCE_TIER, type EvidenceCard, type EvidenceKind } from "@/lib/metrics";

function noteWithoutKind(note: string | undefined, kind?: EvidenceKind): string | undefined {
  if (!note || !kind) return note;
  const label = EVIDENCE_TIER[kind];
  return note
    .replace(new RegExp(`^${label}\\s*[·•,]\\s*`, "i"), "")
    .replace(/^evaluation\s*[·•,]\s*/i, "");
}

export function EvidencePanel({
  evidence,
  kind,
  note,
  date,
  source,
}: {
  evidence: EvidenceCard;
  kind?: EvidenceKind;
  note?: string;
  date: string;
  source?: string;
}) {
  const cleaned = noteWithoutKind(note, kind);
  const gap = evidence.sample || evidence.alsoFiled;
  return (
    <dl className="evidence-card" data-testid="evidence-card">
      <div className="evidence-result">
        <dt>Result</dt>
        <dd>{evidence.result}</dd>
      </div>
      {evidence.capability ? (
        <div className="evidence-method">
          <dt>Capability</dt>
          <dd>{evidence.capability}</dd>
        </div>
      ) : null}
      {kind ? (
        <div className="evidence-method">
          <dt>Kind</dt>
          <dd>
            <span className="evidence-badge" data-testid="evidence-badge">
              {EVIDENCE_TIER[kind]}
            </span>
          </dd>
        </div>
      ) : (
        <div className="evidence-method">
          <dt>Kind</dt>
          <dd>Capability as filed — not a numbered experiment</dd>
        </div>
      )}
      {cleaned ? (
        <div className="evidence-method">
          <dt>Note</dt>
          <dd className="evidence-meta-note">{cleaned}</dd>
        </div>
      ) : null}
      {source ? (
        <div className="evidence-method">
          <dt>Source</dt>
          <dd>{source}</dd>
        </div>
      ) : null}
      {gap ? (
        <div className="evidence-limitation">
          <dt>Gap</dt>
          <dd>{gap}</dd>
        </div>
      ) : null}
      {evidence.method ? (
        <div className="evidence-method">
          <dt>Method</dt>
          <dd>{evidence.method}</dd>
        </div>
      ) : null}
      {evidence.baseline ? (
        <div className="evidence-method">
          <dt>Baseline</dt>
          <dd>{evidence.baseline}</dd>
        </div>
      ) : null}
      {evidence.environment ? (
        <div className="evidence-method">
          <dt>Environment</dt>
          <dd>{evidence.environment}</dd>
        </div>
      ) : null}
      <div className="evidence-method">
        <dt>Date</dt>
        <dd>{date}</dd>
      </div>
      {evidence.rows ? (
        <div className="evidence-table-wrap">
          <dt>Comparison</dt>
          <dd>
            <table className="evidence-table">
              <caption className="sr-only">Filed comparison</caption>
              <thead>
                <tr>
                  <th scope="col">Condition</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {evidence.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}
