import { EvidenceMeta } from "@/components/opening/EvidenceMeta";
import type { EvidenceCard, EvidenceKind } from "@/lib/metrics";

export function EvidencePanel({
  evidence,
  kind,
  note,
  date,
}: {
  evidence: EvidenceCard;
  kind?: EvidenceKind;
  note?: string;
  date: string;
}) {
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
            <EvidenceMeta note={note} kind={kind} />
          </dd>
        </div>
      ) : (
        <div className="evidence-method">
          <dt>Kind</dt>
          <dd>Capability as filed — not a numbered experiment</dd>
        </div>
      )}
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
      {evidence.sample ? (
        <div className="evidence-limitation">
          <dt>Evidence gap</dt>
          <dd>{evidence.sample}</dd>
        </div>
      ) : null}
      {evidence.alsoFiled ? (
        <div className="evidence-limitation">
          <dt>Evidence gap</dt>
          <dd>{evidence.alsoFiled}</dd>
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
