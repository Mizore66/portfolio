import { LoginForm } from "@/app/admin/login/form";
import { passwordConfigured } from "@/lib/cms/password";
import { sessionConfigured } from "@/lib/cms/session";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const ready = sessionConfigured() && passwordConfigured();
  return (
    <div className="px-4 py-8 sm:px-6">
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-faded">Private editor</p>
      <h1 className="masthead-title mt-2">Sign in</h1>
      <p className="mt-3 max-w-[48ch] font-display text-[16px] text-ink">
        One owner. No public registration. The public portfolio does not mention this desk.
      </p>
      {ready ? (
        <LoginForm />
      ) : (
        <p className="admin-error mt-6">
          Set CMS_SESSION_SECRET (16+ characters) and ADMIN_PASSWORD or ADMIN_PASSWORD_HASH
          (Argon2id) in the environment, then refresh.
        </p>
      )}
    </div>
  );
}
