import { nonceRequired, putSession, revokeSession, sessionExists } from "@/lib/cms/auth-store";
import {
  MAX_AGE_SEC,
  parseSessionToken,
  signSession,
  verifySessionMac,
} from "@/lib/cms/session-mac";

export {
  PREVIEW_COOKIE,
  PREVIEW_RETURN_COOKIE,
  SESSION_COOKIE,
  sessionConfigured,
  sessionCookieOptions,
  signSession,
  verifySessionMac,
} from "@/lib/cms/session-mac";

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!(await verifySessionMac(token))) return false;
  if (!nonceRequired()) return true;
  const parsed = parseSessionToken(token!);
  if (!parsed) return false;
  return sessionExists(parsed.nonce);
}

export async function newSessionToken(): Promise<string | null> {
  const expiresAt = Date.now() + MAX_AGE_SEC * 1000;
  const nonce = crypto.randomUUID();
  const stored = await putSession(nonce, expiresAt);
  if (!stored) return null;
  return signSession(expiresAt, nonce);
}

export async function revokeSessionToken(token: string | undefined): Promise<void> {
  const parsed = token ? parseSessionToken(token) : null;
  if (!parsed) return;
  await revokeSession(parsed.nonce);
}
