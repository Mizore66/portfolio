"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { CMS_TAG } from "@/lib/cms/types";
import { passwordConfigured, verifyPassword } from "@/lib/cms/password";
import { assertSameOrigin } from "@/lib/cms/origin";
import {
  newSessionToken,
  PREVIEW_COOKIE,
  SESSION_COOKIE,
  sessionConfigured,
  sessionCookieOptions,
  verifySession,
} from "@/lib/cms/session";
import { getDraftDocument, publishDocument, restoreRevision, saveDraft } from "@/lib/cms/store";
import type { SiteDocument } from "@/lib/cms/types";
import { validateDocument } from "@/lib/cms/validate";

const attempts = new Map<string, { n: number; reset: number }>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const row = attempts.get(key);
  if (!row || row.reset < now) {
    attempts.set(key, { n: 1, reset: now + 15 * 60 * 1000 });
    return true;
  }
  if (row.n >= 8) return false;
  row.n += 1;
  return true;
}

function previewCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 8,
  };
}

export async function requireAdmin(): Promise<void> {
  const jar = await cookies();
  const ok = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!ok) redirect("/admin/login");
}

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  await assertSameOrigin();
  if (!sessionConfigured() || !passwordConfigured()) {
    return { error: "Admin is not configured. Set CMS_SESSION_SECRET and ADMIN_PASSWORD_HASH." };
  }
  if (!rateLimit("login")) return { error: "Too many attempts. Wait 15 minutes." };
  const password = String(formData.get("password") ?? "");
  const ok = await verifyPassword(password);
  if (!ok) return { error: "That passphrase did not match." };
  const token = await newSessionToken();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions());
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await assertSameOrigin();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  jar.set(PREVIEW_COOKIE, "", { ...previewCookieOptions(), maxAge: 0 });
  redirect("/admin/login");
}

function formDoc(formData: FormData, current: SiteDocument): SiteDocument {
  const claims = current.claims.map((claim) => ({
    ...claim,
    display: String(formData.get(`claim-${claim.id}-display`) ?? claim.display),
    method: String(formData.get(`claim-${claim.id}-method`) ?? claim.method),
    baseline: String(formData.get(`claim-${claim.id}-baseline`) ?? claim.baseline),
    sample: String(formData.get(`claim-${claim.id}-sample`) ?? claim.sample),
    environment: String(formData.get(`claim-${claim.id}-environment`) ?? claim.environment),
    date: String(formData.get(`claim-${claim.id}-date`) ?? claim.date),
    caveat: String(formData.get(`claim-${claim.id}-caveat`) ?? claim.caveat),
    heroEligible: formData.get(`claim-${claim.id}-hero`) === "on",
  }));
  const aspirations = current.aspirations.map((item) => ({
    ...item,
    label: String(formData.get(`asp-${item.id}-label`) ?? item.label),
    active: formData.get(`asp-${item.id}-active`) === "on",
    start: String(formData.get(`asp-${item.id}-start`) ?? item.start),
    end: String(formData.get(`asp-${item.id}-end`) ?? item.end),
  }));
  return {
    ...current,
    note: String(formData.get("note") ?? current.note),
    profile: {
      ...current.profile,
      dek: String(formData.get("dek") ?? current.profile.dek),
      tagline: String(formData.get("tagline") ?? current.profile.tagline),
      desksLine: String(formData.get("desksLine") ?? current.profile.desksLine),
      howIWork: String(formData.get("howIWork") ?? current.profile.howIWork),
      availability: String(formData.get("availability") ?? current.profile.availability),
      recruiterBio: String(formData.get("recruiterBio") ?? current.profile.recruiterBio),
      followerBio: String(formData.get("followerBio") ?? current.profile.followerBio),
      location: String(formData.get("location") ?? current.profile.location),
    },
    claims,
    aspirations,
  };
}

function revalidatePublicSurfaces() {
  updateTag(CMS_TAG);
  revalidatePath("/");
  revalidatePath("/print-edition");
  revalidatePath("/opening-preparation");
  revalidatePath("/sitemap.xml");
  revalidatePath("/projects", "layout");
  revalidatePath("/colophon");
  revalidatePath("/lab/learned-evaluator");
}

export async function saveDraftAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const current = await getDraftDocument();
  const next = formDoc(formData, current);
  await saveDraft(next);
}

export async function publishAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const current = await getDraftDocument();
  const next = formDoc(formData, current);
  const errors = validateDocument(next);
  if (errors.length) {
    redirect(`/admin?error=${encodeURIComponent(errors[0] ?? "invalid")}`);
  }
  await publishDocument(next);
  revalidatePublicSurfaces();
  redirect("/admin?published=1");
}

export async function restoreRevisionAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const id = String(formData.get("revisionId") ?? "");
  if (!id) redirect("/admin/history?error=missing");
  await restoreRevision(id);
  redirect("/admin/history?restored=1");
}

export async function enablePreviewAction(): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const jar = await cookies();
  jar.set(PREVIEW_COOKIE, "1", previewCookieOptions());
  redirect("/");
}

export async function disablePreviewAction(): Promise<void> {
  await assertSameOrigin();
  const jar = await cookies();
  jar.set(PREVIEW_COOKIE, "", { ...previewCookieOptions(), maxAge: 0 });
  redirect("/admin");
}
