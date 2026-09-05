"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/lib/cms/actions";

export function LoginForm({ totp, disabled = false }: { totp: boolean; disabled?: boolean }) {
  const [state, action] = useActionState(loginAction, null);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="admin-form mt-6">
      <div>
        <label htmlFor="admin-password">Passphrase</label>
        <span className="admin-password mt-1.5">
          <input
            id="admin-password"
            type={show ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            autoFocus={!disabled}
            disabled={disabled}
            aria-invalid={state?.error ? true : undefined}
          />
          <button
            type="button"
            className="masthead-chip"
            aria-pressed={show}
            aria-controls="admin-password"
            disabled={disabled}
            onClick={() => setShow((value) => !value)}
          >
            {show ? "Hide" : "Show"}
          </button>
        </span>
      </div>
      {totp ? (
        <label>
          Authenticator code
          <input
            name="totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            disabled={disabled}
          />
        </label>
      ) : null}
      {state?.error ? (
        <p className="admin-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="masthead-chip masthead-chip-primary" disabled={disabled}>
        Sign in
      </button>
    </form>
  );
}
