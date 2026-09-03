export const SESSION_COOKIE = "__Host-op-cms";
export const PREVIEW_COOKIE = "__Host-op-preview";
export const MAX_AGE_SEC = 60 * 60 * 8;

function secret(): string {
  return process.env.CMS_SESSION_SECRET ?? "";
}

export function sessionConfigured(): boolean {
  return secret().length >= 16;
}

function toBase64Url(bytes: ArrayBuffer): string {
  let bin = "";
  for (const byte of new Uint8Array(bytes)) bin += String.fromCharCode(byte);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(buf);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Rotating ADMIN_PASSWORD_HASH invalidates every outstanding session. */
export async function passwordStamp(): Promise<string> {
  const raw = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!raw) return "none";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return toBase64Url(buf).slice(0, 16);
}

export function parseSessionToken(
  token: string,
): { expiresAt: number; nonce: string; mac: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [expiresRaw, nonce, mac] = parts;
  if (!expiresRaw || !nonce || !mac) return null;
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt)) return null;
  return { expiresAt, nonce, mac };
}

export async function signSession(expiresAt: number, nonce: string): Promise<string> {
  const stamp = await passwordStamp();
  const payload = `${expiresAt}.${nonce}.${stamp}`;
  const mac = await hmac(payload);
  return `${expiresAt}.${nonce}.${mac}`;
}

/** Edge-safe: HMAC, expiry, and password stamp. Does not look up the nonce. */
export async function verifySessionMac(token: string | undefined): Promise<boolean> {
  if (!token || !sessionConfigured()) return false;
  const parsed = parseSessionToken(token);
  if (!parsed) return false;
  if (parsed.expiresAt <= Date.now()) return false;
  const stamp = await passwordStamp();
  const expected = await hmac(`${parsed.expiresAt}.${parsed.nonce}.${stamp}`);
  return safeEqual(parsed.mac, expected);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}
