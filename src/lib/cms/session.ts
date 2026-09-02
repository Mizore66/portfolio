export const SESSION_COOKIE = "__Host-op-cms";
const MAX_AGE_SEC = 60 * 60 * 8;

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

export async function signSession(expiresAt: number): Promise<string> {
  const payload = String(expiresAt);
  const mac = await hmac(payload);
  return `${payload}.${mac}`;
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || !sessionConfigured()) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = await hmac(payload);
  if (!safeEqual(mac, expected)) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now();
}

export async function newSessionToken(): Promise<string> {
  return signSession(Date.now() + MAX_AGE_SEC * 1000);
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
