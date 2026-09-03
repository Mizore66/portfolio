"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function AdminDirtyForm({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = ref.current;
    if (!form) return;
    function mark() {
      setDirty(true);
    }
    function onLeave(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    form.addEventListener("input", mark);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      form.removeEventListener("input", mark);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [dirty]);

  return (
    <form ref={ref} className="admin-form" data-dirty={dirty ? "true" : "false"}>
      {dirty ? (
        <p className="admin-status" role="status">
          Unsaved edits on this plate.
        </p>
      ) : null}
      {children}
    </form>
  );
}

export function AdminActions({
  save,
  publish,
}: {
  save: (formData: FormData) => Promise<void>;
  publish: (formData: FormData) => Promise<void>;
}) {
  return (
    <p className="admin-actions">
      <button formAction={save} className="masthead-chip">
        Save draft
      </button>
      <button formAction={publish} className="masthead-chip masthead-chip-primary">
        Publish
      </button>
    </p>
  );
}
