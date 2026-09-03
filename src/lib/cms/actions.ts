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
import { applyFormToDocument, expectedRevisionIdFrom } from "@/lib/cms/form";
import { parseImportedDocument } from "@/lib/cms/import-document";
import { CmsStoreError } from "@/lib/cms/errors";
import { defaultRevisionNote, draftHealth } from "@/lib/cms/health";
import { documentDiff } from "@/lib/cms/diff";
import {
  deleteMediaAsset,
  discardDraft,
  getDraftDocument,
  getPublishedDocument,
  publishDocument,
  replaceMediaBlob,
  restoreRevision,
  saveDraft,
  updateMediaAsset,
  uploadMediaBlob,
} from "@/lib/cms/store";
import { totpConfigured, verifyTotp } from "@/lib/cms/totp";
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
  if (totpConfigured() && !verifyTotp(String(formData.get("totp") ?? ""))) {
    return { error: "That authenticator code did not match." };
  }
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

function failTo(path: string, error: unknown): never {
  const message =
    error instanceof CmsStoreError
      ? error.message
      : "Could not write the CMS store. Set POSTGRES_URL or BLOB_READ_WRITE_TOKEN.";
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function returnPath(formData: FormData, fallback = "/admin"): string {
  const raw = String(formData.get("returnTo") ?? fallback);
  return raw.startsWith("/admin") ? raw.split("?")[0] ?? fallback : fallback;
}

function withQuery(path: string, params: Record<string, string | undefined>): string {
  const url = new URL(path, "https://anasqumhiyeh.dev");
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return `${url.pathname}?${url.searchParams.toString()}`;
}

export async function saveDraftAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const dest = returnPath(formData);
  const current = await getDraftDocument();
  const published = await getPublishedDocument();
  let next = applyFormToDocument(formData, current);
  const typedNote = String(formData.get("note") ?? "").trim();
  const staleNotes = new Set(["", "TypeScript ledger. Publish from /admin to replace this snapshot."]);
  if (!typedNote || staleNotes.has(typedNote) || typedNote.startsWith("Restored ")) {
    const generated = defaultRevisionNote(documentDiff(published, next).map((row) => row.path));
    next = { ...next, note: generated || typedNote };
  }
  const errors = validateDocument(next);
  try {
    await saveDraft(next, { expectedRevisionId: expectedRevisionIdFrom(formData) || undefined });
  } catch (error) {
    failTo(dest, error);
  }
  if (errors.length) {
    redirect(
      withQuery(dest, {
        saved: "1",
        invalid: "1",
        error: errors[0],
        issues: String(errors.length),
      }),
    );
  }
  const changes = documentDiff(published, next).length;
  redirect(withQuery(dest, { saved: "1", changes: String(changes) }));
}

export async function publishAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const dest = returnPath(formData);
  if (formData.get("confirmPublish") !== "1") {
    redirect(`${dest}?error=${encodeURIComponent("Confirm publish to update the public site.")}`);
  }
  const current = await getDraftDocument();
  const next = applyFormToDocument(formData, current);
  const errors = validateDocument(next);
  if (errors.length) {
    redirect(`${dest}?error=${encodeURIComponent(errors[0] ?? "invalid")}&invalid=1`);
  }
  let publishedId = "";
  try {
    const published = await publishDocument(next);
    publishedId = published.revisionId;
  } catch (error) {
    failTo(dest, error);
  }
  revalidatePublicSurfaces();
  redirect(withQuery("/admin", { published: "1", revision: publishedId }));
}

export async function discardDraftAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  if (formData.get("confirmDiscard") !== "1") {
    redirect("/admin?error=Confirm%20discard%20to%20reset%20the%20draft.");
  }
  try {
    await discardDraft();
  } catch (error) {
    failTo("/admin", error);
  }
  redirect("/admin?discarded=1");
}

export async function restoreRevisionAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  if (formData.get("confirmRestore") !== "1") {
    redirect("/admin/history?error=Confirm%20restore%20to%20replace%20the%20current%20draft.");
  }
  const id = String(formData.get("revisionId") ?? "");
  if (!id) redirect("/admin/history?error=missing");
  try {
    await restoreRevision(id);
  } catch (error) {
    failTo("/admin/history", error);
  }
  redirect("/admin/history?restored=1");
}

export async function restoreAndPublishAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  if (formData.get("confirmPublish") !== "1") {
    redirect("/admin/history?error=Confirm%20restore%20and%20publish.");
  }
  const id = String(formData.get("revisionId") ?? "");
  if (!id) redirect("/admin/history?error=missing");
  const draft = await restoreRevision(id).catch((error) => failTo("/admin/history", error));
  const errors = validateDocument(draft);
  if (errors.length) {
    redirect(`/admin/history?error=${encodeURIComponent(errors[0] ?? "invalid")}`);
  }
  await publishDocument(draft).catch((error) => failTo("/admin/history", error));
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
  try {
    await saveDraft({ ...parsed.doc, note: parsed.doc.note || "Imported JSON" });
  } catch (error) {
    failTo("/admin/settings", error);
  }
  redirect("/admin?saved=1");
}

export async function uploadMediaAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const file = formData.get("media");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/settings?error=Choose%20a%20file%20to%20upload.");
  }
  try {
    await uploadMediaBlob(file, {
      alt: String(formData.get("alt") ?? ""),
      caption: String(formData.get("caption") ?? ""),
      usage: String(formData.get("usage") ?? ""),
      focalPoint: String(formData.get("focalPoint") ?? "50% 50%"),
    });
  } catch (error) {
    failTo("/admin/settings", error);
  }
  redirect("/admin/settings?uploaded=1");
}

export async function replaceMediaAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const pathname = String(formData.get("pathname") ?? "");
  const file = formData.get("media");
  if (!pathname || !(file instanceof File) || file.size === 0) {
    redirect("/admin/settings?error=Choose%20a%20replacement%20file.");
  }
  try {
    await replaceMediaBlob(pathname, file);
  } catch (error) {
    failTo("/admin/settings", error);
  }
  redirect("/admin/settings?replaced=1");
}

export async function updateMediaAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const pathname = String(formData.get("pathname") ?? "");
  if (!pathname) redirect("/admin/settings?error=missing");
  try {
    await updateMediaAsset(pathname, {
      alt: String(formData.get("alt") ?? ""),
      caption: String(formData.get("caption") ?? ""),
      usage: String(formData.get("usage") ?? ""),
      focalPoint: String(formData.get("focalPoint") ?? "50% 50%"),
    });
  } catch (error) {
    failTo("/admin/settings", error);
  }
  redirect("/admin/settings?updated=1");
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const pathname = String(formData.get("pathname") ?? "");
  if (!pathname) redirect("/admin/settings?error=missing");
  try {
    await deleteMediaAsset(pathname);
  } catch (error) {
    failTo("/admin/settings", error);
  }
  redirect("/admin/settings?deleted=1");
}

export async function enablePreviewAction(): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const draft = await getDraftDocument();
  const health = draftHealth(draft);
  if (health.blocking) {
    redirect(
      `/admin?error=${encodeURIComponent(health.errors[0] ?? "Fix claim evidence before preview.")}&invalid=1`,
    );
  }
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
