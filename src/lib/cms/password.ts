import { randomBytes, timingSafeEqual } from "node:crypto";

export async function hashPassword(plain: string): Promise<string> {
  const { argon2id } = await import("hash-wasm");
  const salt = randomBytes(16);
  return argon2id({
    password: plain,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 19456,
    hashLength: 32,
    outputType: "encoded",
  });
}

export async function verifyPassword(plain: string): Promise<boolean> {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (stored) {
    const { argon2Verify } = await import("hash-wasm");
    try {
      return await argon2Verify({ password: plain, hash: stored });
    } catch {
      return false;
    }
  }
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(plain);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function passwordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD);
}
