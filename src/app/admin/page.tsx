import { cookies } from "next/headers";
import Link from "next/link";
import { AdminFrame } from "@/components/admin/AdminFrame";
import { DiscardDraftButton } from "@/components/admin/DangerActions";
import { enablePreviewAction } from "@/lib/cms/actions";
import { draftHealth, draftStatus, formatLocalTime, HERO_EVIDENCE_RULE } from "@/lib/cms/health";
import { claimHeroReady } from "@/lib/cms/validate";
import { getCmsState } from "@/lib/cms/store";
import { cmsStoreStatus } from "@/lib/cms/backend";
import { parseSessionToken, SESSION_COOKIE } from "@/lib/cms/session-mac";

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    published?: string;
    saved?: string;
    discarded?: string;
    invalid?: string;
    revision?: string;
    changes?: string;
    issues?: string;
    q?: string;
  }>;
}) {
  const q = await searchParams;
  const state = await getCmsState();
  const published = state.published ?? state.ledger;
  const draft = state.draft ?? published;
  const status = draftStatus(published, state.draft);
  const health = draftHealth(draft);
  const store = cmsStoreStatus();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? parseSessionToken(token) : null;
  const hoursLeft = session ? Math.max(0, Math.round((session.expiresAt - Date.now()) / 36e5)) : null;
  const query = (q.q ?? "").trim().toLowerCase();
  const claimHits = draft.claims.filter((claim) =>
    query ? `${claim.id} ${claim.display} ${claim.owner}`.toLowerCase().includes(query) : false,
  );
  const projectHits = draft.projects.filter((project) =>
    query ? `${project.slug} ${project.title} ${project.subtitle}`.toLowerCase().includes(query) : false,
  );
  const backendLabel =
    store.backend === "blob"
      ? "Vercel Blob — healthy"
      : store.backend === "postgres"
        ? "Postgres — healthy"
        : store.writable
          ? "Local file — not durable"
          : "Local file — read-only";
  return (
    <AdminFrame
      title="Dashboard"
      status={
        q.saved && q.invalid ? (
          <p className="admin-error mt-2" role="alert">
            Draft saved with {q.issues ?? "open"} evidence problems. Preview and Publish stay blocked.
          </p>
        ) : q.saved ? (
          <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
            Draft saved
            {q.changes ? ` · ${q.changes} unpublished changes.` : "."}{" "}
            {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} local.
          </p>
        ) : q.published ? (
          <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
            Published release {q.revision || published.revisionId}. Updated homepage, project pages, résumé, sitemap,
            and structured data.{" "}
            <a href="/" className="underline">
              Homepage
            </a>
            {" · "}
            <a href="/print-edition" className="underline">
              Résumé
            </a>
            {" · "}
            <a href="/sitemap.xml" className="underline">
              Sitemap
            </a>
          </p>
        ) : q.discarded ? (
          <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
            Draft discarded. Editors now match the live site.
          </p>
        ) : q.error ? (
          <p className="admin-error mt-2">{q.error}</p>
        ) : null
      }
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-faded">
        Content store: {backendLabel}
        {state.published ? ` · current published revision ${state.published.revisionId}` : " · ledger fallback"}
      </p>
      {!state.writable ? (
        <p className="admin-error mt-4" role="alert">
          Save Draft cannot persist here. Set POSTGRES_URL or BLOB_READ_WRITE_TOKEN. Health probe: /api/cms-health.
        </p>
      ) : null}
      {state.backfill.length ? (
        <p className="mt-4 border-2 border-ink p-4 font-display text-[16px]" role="status">
          Upgrade applied. Empty required evidence fields were filled from the TypeScript ledger (
          {state.backfill.slice(0, 6).join(", ")}
          {state.backfill.length > 6 ? "…" : ""}). Preview and Publish use the filled packet. Publish this revision to
          persist the backfill in the store.
        </p>
      ) : null}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        <li className="border-2 border-ink p-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Current published revision</p>
          <p className="mt-2 font-display text-[18px] break-all">{state.published?.revisionId ?? "Ledger"}</p>
        </li>
        <li className="border-2 border-ink p-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Draft</p>
          <p className="mt-2 font-display text-[22px]">{status.label}</p>
        </li>
        <li className="border-2 border-ink p-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">
            Claims missing required evidence
          </p>
          <p className="mt-2 font-display text-[22px]">{health.heroMissing.length}</p>
          <p className="mt-2 font-mono text-[12px] text-faded">Counted on the draft, not only live.</p>
        </li>
        <li className="border-2 border-ink p-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">
            Draft claims missing a measurement date
          </p>
          <p className="mt-2 font-display text-[22px]">{health.undated.length}</p>
        </li>
      </ul>
      {health.heroMissing.length ? (
        <ul className="admin-error mt-4 list-disc pl-5">
          {health.heroMissing.map((claim) => (
            <li key={claim.id}>
              {claim.id}: missing {claimHeroReady(claim).join(", ")}.
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-6 max-w-[62ch] font-display text-[16px] leading-snug text-ink">
        Publishing updates the homepage, project pages, résumé, and sitemap from one revision.
      </p>
      <p className="mt-3 max-w-[62ch] font-display text-[15px] leading-snug text-faded">{HERO_EVIDENCE_RULE}</p>
      <p className="mt-4 flex flex-wrap gap-3">
        <Link href="/admin/profile" className="masthead-chip masthead-chip-primary">
          Edit homepage and biography
        </Link>
        <form action={enablePreviewAction}>
          <input type="hidden" name="returnTo" value="/admin" />
          <button type="submit" className="masthead-chip" title="Opens the site in private preview mode.">
            Preview draft
          </button>
        </form>
        <Link href="/admin/diff" className="masthead-chip">
          Diff
        </Link>
        <Link href="/admin/history" className="masthead-chip">
          History
        </Link>
      </p>
      <p className="mt-2 font-mono text-[12px] text-faded">Opens the site in private preview mode.</p>
      {status.key === "dirty" ? <DiscardDraftButton /> : null}
      <form className="admin-form mt-8" method="get">
        <label>
          Search claims and projects
          <input name="q" defaultValue={q.q ?? ""} placeholder="claim id, owner, project title" />
        </label>
        <p>
          <button type="submit" className="masthead-chip">
            Search
          </button>
        </p>
      </form>
      {query ? (
        <ul className="mt-4 grid gap-2">
          {claimHits.map((claim) => (
            <li key={claim.id}>
              <Link href="/admin/claims" className="text-book-blue underline">
                Claim · {claim.id}
              </Link>
            </li>
          ))}
          {projectHits.map((project) => (
            <li key={project.slug}>
              <Link href="/admin/projects" className="text-book-blue underline">
                Project · {project.slug}
              </Link>
            </li>
          ))}
          {!claimHits.length && !projectHits.length ? (
            <li className="font-mono text-[12px] text-faded">No claims or projects match.</li>
          ) : null}
        </ul>
      ) : null}
      <details className="mt-8">
        <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em] text-faded">
          Deployment
        </summary>
        <p className="mt-3 max-w-[62ch] font-display text-[15px] leading-snug text-ink">
          Drafts write to Postgres when POSTGRES_URL is set, otherwise to a private Vercel Blob object, otherwise
          to data/cms.json locally. Marketplace Supabase sets POSTGRES_URL — that is the database, not SUPABASE_URL.
          Health: /api/cms-health.
        </p>
      </details>
      {state.audit[0] ? (
        <p
          className="mt-6 font-mono text-[12px] text-faded"
          title={typeof state.audit[0].at === "string" ? state.audit[0].at : undefined}
        >
          Last action · {state.audit[0].action} · {state.audit[0].actor ?? "owner"} ·{" "}
          {formatLocalTime(state.audit[0].at)}
        </p>
      ) : null}
      {hoursLeft != null ? (
        <p className="mt-2 font-mono text-[12px] text-faded">
          This session expires in about {hoursLeft} hour{hoursLeft === 1 ? "" : "s"}. Concurrent tabs share the same
          owner session.
        </p>
      ) : null}
    </AdminFrame>
  );
}
