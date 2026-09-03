import Link from "next/link";
import { AdminFrame } from "@/app/admin/layout";
import { enablePreviewAction } from "@/lib/cms/actions";
import { getCmsState } from "@/lib/cms/store";
import { claimHeroReady } from "@/lib/cms/validate";

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; published?: string; saved?: string }>;
}) {
  const q = await searchParams;
  const state = await getCmsState();
  const published = state.published ?? state.ledger;
  const needsEvidence = published.claims.filter((claim) => claim.heroEligible && claimHeroReady(claim).length);
  const stale = published.claims.filter((claim) => !claim.date);
  return (
    <AdminFrame
      title="Dashboard"
      status={
        q.saved ? (
          <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
            Draft saved.
          </p>
        ) : q.published ? (
          <p className="mt-2 font-display text-[16px] text-book-blue" role="status">
            Published.
          </p>
        ) : q.error ? (
          <p className="admin-error mt-2">{q.error}</p>
        ) : null
      }
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-faded">
        Store · {state.backend}
        {state.published ? ` · published ${state.published.publishedAt.slice(0, 10)}` : " · ledger fallback"}
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        <li className="border-2 border-ink p-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Published</p>
          <p className="mt-2 font-display text-[22px]">{state.published ? "1 revision" : "Ledger"}</p>
        </li>
        <li className="border-2 border-ink p-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Draft</p>
          <p className="mt-2 font-display text-[22px]">{state.draft ? "In hand" : "None"}</p>
        </li>
        <li className="border-2 border-ink p-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Needs evidence</p>
          <p className="mt-2 font-display text-[22px]">{needsEvidence.length}</p>
        </li>
        <li className="border-2 border-ink p-4">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">Undated claims</p>
          <p className="mt-2 font-display text-[22px]">{stale.length}</p>
        </li>
      </ul>
      <p className="mt-6 max-w-[62ch] font-display text-[16px] leading-snug text-ink">
        Homepage, claims, résumé copy, and sitemap lastmod read the published revision. Without a
        database they persist to <code>data/cms.json</code>. On Vercel, Marketplace Supabase already
        sets <code>POSTGRES_URL</code> — that is the database, not <code>SUPABASE_URL</code>. Set
        BLOB_READ_WRITE_TOKEN for media.
      </p>
      <p className="mt-4 flex flex-wrap gap-3">
        <Link href="/admin/profile" className="masthead-chip masthead-chip-primary">
          Edit profile
        </Link>
        <form action={enablePreviewAction}>
          <button type="submit" className="masthead-chip">
            Preview draft on the real site
          </button>
        </form>
        <Link href="/admin/diff" className="masthead-chip">
          Diff
        </Link>
        <Link href="/admin/history" className="masthead-chip">
          History
        </Link>
      </p>
      {state.audit[0] ? (
        <p className="mt-6 font-mono text-[12px] text-faded">
          Last action · {state.audit[0].action} · {state.audit[0].at}
        </p>
      ) : null}
    </AdminFrame>
  );
}
