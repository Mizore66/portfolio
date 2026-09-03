import { AdminFrame } from "@/app/admin/layout";
import { AdminActions, AdminDirtyForm } from "@/components/admin/AdminForm";
import { publishAction, saveDraftAction } from "@/lib/cms/actions";
import { getDraftDocument } from "@/lib/cms/store";
import { claimHeroReady } from "@/lib/cms/validate";

export default async function ClaimsEditor() {
  const doc = await getDraftDocument();
  return (
    <AdminFrame title="Claims">
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        One row feeds the homepage, exhibits, and résumé. Hero eligibility requires method, sample or
        caveat, environment, and date.
      </p>
      <AdminDirtyForm>
        {doc.claims.map((claim, index) => {
          const missing = claim.heroEligible ? claimHeroReady(claim) : [];
          return (
            <details key={claim.id} className="border-2 border-ink p-4" open={index < 3 || claim.heroEligible}>
              <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em]">
                {claim.id}
                {claim.heroEligible ? " · hero" : ""}
              </summary>
              <fieldset className="mt-4 grid gap-3 border-0 p-0">
                <legend className="sr-only">{claim.id}</legend>
                <label>
                  Display
                  <input name={`claim-${claim.id}-display`} defaultValue={claim.display} />
                </label>
                <label>
                  Method
                  <input name={`claim-${claim.id}-method`} defaultValue={claim.method} />
                </label>
                <label>
                  Baseline
                  <input name={`claim-${claim.id}-baseline`} defaultValue={claim.baseline} />
                </label>
                <label>
                  Sample / evidence gap
                  <textarea name={`claim-${claim.id}-sample`} defaultValue={claim.sample} />
                </label>
                <label>
                  Environment
                  <input name={`claim-${claim.id}-environment`} defaultValue={claim.environment} />
                </label>
                <label>
                  Date
                  <input name={`claim-${claim.id}-date`} defaultValue={claim.date} />
                </label>
                <label>
                  Caveat
                  <textarea name={`claim-${claim.id}-caveat`} defaultValue={claim.caveat} />
                </label>
                <label className="flex-row items-center gap-2 normal-case tracking-normal">
                  <input type="checkbox" name={`claim-${claim.id}-hero`} defaultChecked={claim.heroEligible} />
                  Hero eligible
                </label>
                {missing.length ? (
                  <p className="admin-error">Missing for hero: {missing.join(", ")}</p>
                ) : null}
              </fieldset>
            </details>
          );
        })}
        <label>
          Publish note
          <input name="note" defaultValue={doc.note} />
        </label>
        <AdminActions save={saveDraftAction} publish={publishAction} />
      </AdminDirtyForm>
    </AdminFrame>
  );
}
