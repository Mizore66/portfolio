"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { clientIpFrom, consumeRateLimit, rateLimitKey } from "@/lib/cms/auth-store";
import { CMS_TAG } from "@/lib/cms/types";
import { passwordConfigured, verifyPassword } from "@/lib/cms/password";
import { assertSameOrigin } from "@/lib/cms/origin";
import {
  newSessionToken,
  PREVIEW_COOKIE,
  revokeSessionToken,
  SESSION_COOKIE,
  sessionConfigured,
  sessionCookieOptions,
  verifySession,
} from "@/lib/cms/session";
import { applyFormToDocument } from "@/lib/cms/form";
import { parseImportedDocument } from "@/lib/cms/import-document";
import { getDraftDocument, publishDocument, restoreRevision, saveDraft } from "@/lib/cms/store";
import { validateDocument } from "@/lib/cms/validate";

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
  const ip = clientIpFrom(await headers());
  if (!(await consumeRateLimit(rateLimitKey(ip, "login")))) {
    return { error: "Too many attempts from this network. Wait 15 minutes." };
  }
  const password = String(formData.get("password") ?? "");
  const ok = await verifyPassword(password);
  if (!ok) return { error: "That passphrase did not match." };
  const token = await newSessionToken();
  if (!token) return { error: "Could not open a session. Try again." };
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions());
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await assertSameOrigin();
  const jar = await cookies();
  await revokeSessionToken(jar.get(SESSION_COOKIE)?.value);
  jar.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  jar.set(PREVIEW_COOKIE, "", { ...previewCookieOptions(), maxAge: 0 });
  redirect("/admin/login");
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
  const next = applyFormToDocument(formData, current);
  await saveDraft(next);
  redirect("/admin?saved=1");
}

export async function publishAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const current = await getDraftDocument();
  const next = applyFormToDocument(formData, current);
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

export async function restoreAndPublishAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const id = String(formData.get("revisionId") ?? "");
  if (!id) redirect("/admin/history?error=missing");
  const draft = await restoreRevision(id);
  const errors = validateDocument(draft);
  if (errors.length) {
    redirect(`/admin/history?error=${encodeURIComponent(errors[0] ?? "invalid")}`);
  }
  await publishDocument(draft);
  revalidatePublicSurfaces();
  redirect("/admin/history?published=1");
}

export async function importDocumentAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const file = formData.get("payload");
  let raw = String(formData.get("json") ?? "");
  if (file instanceof File && file.size > 0) {
    raw = await file.text();
  }
  const parsed = parseImportedDocument(raw);
  if (!parsed.ok) {
    redirect(`/admin/settings?error=${encodeURIComponent(parsed.error)}`);
  }
  const errors = validateDocument(parsed.doc);
  if (errors.length) {
    redirect(`/admin/settings?error=${encodeURIComponent(errors[0] ?? "invalid")}`);
  }
  await saveDraft({ ...parsed.doc, note: parsed.doc.note || "Imported JSON" });
  redirect("/admin?saved=1");
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
