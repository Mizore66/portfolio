import { createHmac, timingSafeEqual } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function totpConfigured(): boolean {
  return Boolean(process.env.ADMIN_TOTP_SECRET?.replace(/\s+/g, ""));
}

function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = "";
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx < 0) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const bin =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return String(bin % 1_000_000).padStart(6, "0");
}

export function totpCode(secret: string, at = Date.now()): string {
  const decoded = base32Decode(secret);
  const counter = Math.floor(at / 1000 / 30);
  return hotp(decoded, counter);
}

/** Accept the current 30-second window plus one step of clock skew. */
export function verifyTotp(code: string, at = Date.now()): boolean {
  const raw = process.env.ADMIN_TOTP_SECRET?.replace(/\s+/g, "") ?? "";
  if (!raw) return true;
  const trimmed = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(trimmed)) return false;
  const secret = base32Decode(raw);
  if (secret.length < 10) return false;
  const offered = Buffer.from(trimmed);
  for (let drift = -1; drift <= 1; drift++) {
    const expected = Buffer.from(totpCode(raw, at + drift * 30_000));
    if (offered.length === expected.length && timingSafeEqual(offered, expected)) return true;
  }
  return false;
}
