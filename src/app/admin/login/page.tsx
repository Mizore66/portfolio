import { LoginForm } from "@/app/admin/login/form";
import { passwordConfigured } from "@/lib/cms/password";
import { sessionConfigured } from "@/lib/cms/session";
import { totpConfigured } from "@/lib/cms/totp";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const ready = sessionConfigured() && passwordConfigured();
  return (
    <main className="px-4 py-8 sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faded">Portfolio CMS</p>
      <h1 className="mt-2 font-display text-[28px] leading-tight text-ink">Sign in</h1>
        <p className="mt-3 max-w-[48ch] font-display text-[16px] text-ink">
          Private editor. No public registration.
        </p>
        <details className="mt-4 max-w-[48ch]">
          <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.14em] text-faded">
            Security details
          </summary>
          <p className="mt-3 font-display text-[15px] text-ink">
            Recovery is rotating ADMIN_PASSWORD_HASH, which invalidates every session. MFA is an optional
            authenticator code when ADMIN_TOTP_SECRET is set.
          </p>
        </details>
      {ready ? (
        <LoginForm totp={totpConfigured()} />
      ) : (
        <p className="admin-error mt-6">
          Set CMS_SESSION_SECRET (16+ characters) and ADMIN_PASSWORD_HASH (Argon2id) in the
          environment, then refresh. Do not store a plaintext passphrase.
        </p>
      )}
    </main>
  );
}
