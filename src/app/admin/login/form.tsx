"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/cms/actions";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  return (
    <form action={action} className="admin-form mt-6">
      <label>
        Passphrase
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      {state?.error ? <p className="admin-error">{state.error}</p> : null}
      <button type="submit" className="masthead-chip masthead-chip-primary">
        Sign in
      </button>
    </form>
  );
}
