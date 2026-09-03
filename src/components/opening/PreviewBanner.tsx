import { cookies } from "next/headers";
import { PREVIEW_COOKIE, SESSION_COOKIE, verifySession } from "@/lib/cms/session";
import { disablePreviewAction } from "@/lib/cms/actions";

export async function PreviewBanner() {
  const jar = await cookies();
  const preview = jar.get(PREVIEW_COOKIE)?.value === "1";
  const authed = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!preview || !authed) return null;
  return (
    <div className="preview-banner" data-testid="preview-banner" role="status">
      <p className="font-mono text-[12px] uppercase tracking-[0.14em]">Draft preview — not the published plate</p>
      <form action={disablePreviewAction}>
        <button type="submit" className="masthead-chip">
          Exit preview
        </button>
      </form>
    </div>
  );
}
