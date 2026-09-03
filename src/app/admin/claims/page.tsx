import { AdminFrame } from "@/app/admin/layout";
import { AdminActions, AdminDirtyForm, ClaimDateFields, EditorSearch, ReorderList } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { claimConsumers } from "@/lib/cms/consumers";
import { editorBar } from "@/lib/cms/editor-state";
import { HERO_EVIDENCE_RULE } from "@/lib/cms/health";
import { getDraftDocument, getPublishedDocument } from "@/lib/cms/store";
import { claimCompleteness } from "@/lib/cms/health";
import { REQUIRED_CLAIM_IDS, claimHeroReady } from "@/lib/cms/validate";

export default async function ClaimsEditor({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; invalid?: string }>;
}) {
  const q = await searchParams;
  const [doc, published] = await Promise.all([getDraftDocument(), getPublishedDocument()]);
  const bar = editorBar(published, doc);
  return (
    <AdminFrame
      title="Claims"
      status={
        q.invalid ? (
          <p className="admin-error mt-2" role="alert">
            {q.error ?? "Hero evidence is incomplete. The draft was saved; Preview and Publish stay blocked."}
          </p>
        ) : q.saved ? (
          <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
            Draft saved.
          </p>
        ) : q.error ? (
          <p className="admin-error mt-2">{q.error}</p>
        ) : null
      }
    >
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        Each claim can appear on the homepage, its project page, and the résumé. Incomplete drafts may be saved.
        Preview and Publish stay blocked while a homepage proof card is missing required evidence.
      </p>
      <p className="mt-3 max-w-[62ch] font-display text-[15px] text-faded">{HERO_EVIDENCE_RULE}</p>
      <AdminDirtyForm expectedRevisionId={bar.expectedRevisionId} returnTo="/admin/claims">
        <input type="hidden" name="claims-present" value="1" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-faded">Order</p>
        <ReorderList name="claim-order" ids={doc.claims.map((claim) => claim.id)} />
        <EditorSearch>
          {doc.claims.map((claim, index) => {
            const missing = claim.heroEligible ? claimHeroReady(claim) : [];
            const badge = claimCompleteness(claim);
            const consumers = claimConsumers(claim);
            return (
              <details
                key={claim.id}
                className="border-2 border-ink p-4"
                open={index < 3 || claim.heroEligible || missing.length > 0}
              >
                <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em]">
                  {claim.id}
                  {claim.heroEligible ? " · homepage proof" : ""}
                  {claim.archived ? " · archived" : ""}
                  <span className={badge.tone === "ok" ? "text-faded" : "admin-error"}> · {badge.label}</span>
                </summary>
                <fieldset className="mt-4 grid gap-3 border-0 p-0">
                  <legend className="sr-only">{claim.id}</legend>
                  <label>
                    Public claim text
                    <input name={`claim-${claim.id}-display`} defaultValue={claim.display} />
                  </label>
                  <label>
                    Value
                    <input name={`claim-${claim.id}-value`} defaultValue={claim.value} />
                  </label>
                  <label>
                    Unit
                    <input name={`claim-${claim.id}-unit`} defaultValue={claim.unit} />
                  </label>
                  <label>
                    Kind
                    <select name={`claim-${claim.id}-kind`} defaultValue={claim.kind}>
                      <option value="production">production</option>
                      <option value="benchmark">benchmark</option>
                      <option value="evaluation">evaluation</option>
                      <option value="pipeline">pipeline</option>
                      <option value="capability">capability</option>
                    </select>
                  </label>
                  <label>
                    Owner
                    <input name={`claim-${claim.id}-owner`} defaultValue={claim.owner} />
                  </label>
                  <label>
                    How it was measured
                    <input name={`claim-${claim.id}-method`} defaultValue={claim.method} />
                  </label>
                  <label>
                    Comparison baseline
                    <input name={`claim-${claim.id}-baseline`} defaultValue={claim.baseline} />
                  </label>
                  <label>
                    Sample/evaluation set
                    <textarea name={`claim-${claim.id}-sample`} defaultValue={claim.sample} />
                  </label>
                  <label>
                    Public caveat
                    <textarea name={`claim-${claim.id}-caveat`} defaultValue={claim.caveat} />
                  </label>
                  <label>
                    Environment
                    <input name={`claim-${claim.id}-environment`} defaultValue={claim.environment} />
                  </label>
                  <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
                    Public caveat appears on homepage notes, exhibits, and the résumé when those surfaces list this
                    claim.
                  </p>
                  <label>
                    Denominator / sample size
                    <textarea name={`claim-${claim.id}-denominator`} defaultValue={claim.denominator} />
                  </label>
                  <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
                    Record the count or rate basis here. If it is not publishable, write “Unfiled” rather than
                    guessing. Sample/evaluation set is the qualitative packet; this field is the numeric basis when
                    both apply.
                  </p>
                  <label>
                    Evidence source or provenance
                    <input name={`claim-${claim.id}-source`} defaultValue={claim.source} />
                  </label>
                  <label>
                    Source URL
                    <input name={`claim-${claim.id}-sourceUrl`} defaultValue={claim.sourceUrl} />
                  </label>
                  <div>
                    <p className="font-mono text-[12px] uppercase tracking-[0.12em]">Measurement date</p>
                    <ClaimDateFields id={claim.id} value={claim.date} />
                  </div>
                  <p className="font-mono text-[12px] uppercase tracking-[0.12em]">Consuming surfaces</p>
                  <p className="flex flex-wrap gap-3">
                    {(["home", "opening", "resume", "exhibit", "lab"] as const).map((surface) => (
                      <label key={surface} className="flex-row items-center gap-2 normal-case tracking-normal">
                        <input
                          type="checkbox"
                          name={`claim-${claim.id}-surface-${surface}`}
                          defaultChecked={claim.surfaces.includes(surface)}
                        />
                        {surface}
                      </label>
                    ))}
                  </p>
                  <label className="flex-row items-center gap-2 normal-case tracking-normal">
                    <input type="checkbox" name={`claim-${claim.id}-hero`} defaultChecked={claim.heroEligible} />
                    Eligible for homepage proof card
                  </label>
                  <label className="flex-row items-center gap-2 normal-case tracking-normal">
                    <input type="checkbox" name={`claim-${claim.id}-archived`} defaultChecked={claim.archived} />
                    Archive claim
                  </label>
                  <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
                    Archiving hides this claim from homepage, résumé, and exhibits. Required claims cannot be
                    archived.
                  </p>
                  {consumers.length ? (
                    <p className="font-display text-[15px]">
                      Used on:{" "}
                      {consumers.map((row, i) => (
                        <span key={row.href}>
                          {i > 0 ? " · " : null}
                          <a href={row.href} className="text-book-blue underline">
                            {row.label}
                          </a>
                        </span>
                      ))}
                    </p>
                  ) : null}
                  <p className="flex flex-wrap gap-2">
                    <button type="submit" className="masthead-chip" name="claim-duplicate" value={claim.id} formAction={saveDraftAction}>
                      Duplicate
                    </button>
                    {!(REQUIRED_CLAIM_IDS as readonly string[]).includes(claim.id) ? (
                      <button type="submit" className="masthead-chip" name="claim-delete" value={claim.id} formAction={saveDraftAction}>
                        Delete
                      </button>
                    ) : null}
                  </p>
                  {missing.length ? (
                    <p className="admin-error">Missing for homepage proof: {missing.join(", ")}</p>
                  ) : null}
                </fieldset>
              </details>
            );
          })}
        </EditorSearch>
        <label>
          New claim id
          <input name="claim-new-id" placeholder="camelCase id" />
        </label>
        <p>
          <button type="submit" name="claim-create" value="1" className="masthead-chip" formAction={saveDraftAction}>
            Create claim
          </button>
        </p>
        <label>
          Revision note
          <input name="note" defaultValue={doc.note} />
        </label>
        <AdminActions
          save={saveDraftAction}
          publish={publishAction}
          canPublish={bar.canPublish}
          changeCount={bar.changeCount}
          changeSummary={bar.changeSummary}
          surfaces={bar.surfaces}
          blockedReason={bar.blockedReason}
        />
      </AdminDirtyForm>
    </AdminFrame>
  );
}
