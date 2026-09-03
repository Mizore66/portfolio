"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { discardDraftAction, enablePreviewAction } from "@/lib/cms/actions";

export function AdminDirtyForm({
  children,
  expectedRevisionId,
  returnTo,
}: {
  children: ReactNode;
  expectedRevisionId?: string;
  returnTo?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const form = ref.current;
    if (!form) return;
    function mark() {
      setDirty(true);
    }
    function onLeave(e: BeforeUnloadEvent) {
      if (!dirty && !saving) return;
      e.preventDefault();
      e.returnValue = "";
    }
    function onSubmit() {
      setSaving(true);
    }
    function onNav(e: MouseEvent) {
      if (!saving && !dirty) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!link || link.getAttribute("href")?.startsWith("#")) return;
      if (saving) {
        e.preventDefault();
        window.alert("A save is still in progress.");
        return;
      }
      if (dirty && !window.confirm("You have unsaved changes.")) {
        e.preventDefault();
      }
    }
    form.addEventListener("input", mark);
    form.addEventListener("submit", onSubmit);
    window.addEventListener("beforeunload", onLeave);
    document.addEventListener("click", onNav, true);
    return () => {
      form.removeEventListener("input", mark);
      form.removeEventListener("submit", onSubmit);
      window.removeEventListener("beforeunload", onLeave);
      document.removeEventListener("click", onNav, true);
    };
  }, [dirty, saving]);

  return (
    <form ref={ref} className="admin-form" data-dirty={dirty ? "true" : "false"} data-saving={saving ? "true" : "false"}>
      {expectedRevisionId ? (
        <input type="hidden" name="expectedRevisionId" value={expectedRevisionId} />
      ) : null}
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      <p className="admin-status" role="status" aria-live="polite">
        {saving ? "Saving…" : dirty ? "Unsaved changes." : "\u00a0"}
      </p>
      {children}
    </form>
  );
}

export function AdminActions({
  save,
  publish,
  canPublish,
  changeCount,
  changeSummary,
  surfaces,
  blockedReason,
}: {
  save: (formData: FormData) => Promise<void>;
  publish: (formData: FormData) => Promise<void>;
  canPublish: boolean;
  changeCount: number;
  changeSummary: string[];
  surfaces: string[];
  blockedReason?: string;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="admin-actions">
      <p className="admin-actions-status" role="status">
        {blockedReason
          ? blockedReason
          : canPublish
            ? `${changeCount} unpublished change${changeCount === 1 ? "" : "s"}`
            : "Draft matches live"}
      </p>
      <button formAction={save} className="masthead-chip">
        Save draft
      </button>
      <button formAction={enablePreviewAction} className="masthead-chip" disabled={Boolean(blockedReason)} type="submit">
        Preview draft
      </button>
      <Link href="/admin/diff" className="masthead-chip">
        Diff
      </Link>
      {confirm ? (
        <div className="admin-confirm" role="dialog" aria-labelledby="publish-confirm-title">
          <p id="publish-confirm-title" className="font-display text-[18px]">
            Publish these changes?
          </p>
          <p className="mt-2 font-display text-[16px]">
            {changeSummary.length ? changeSummary.slice(0, 8).join("; ") : "No listed fields."}
          </p>
          <p className="mt-2 font-mono text-[12px] text-faded">
            Public surfaces: {surfaces.join(", ") || "none"}
          </p>
          <p className="mt-3 flex flex-wrap gap-2">
            <button
              formAction={async (formData) => {
                formData.set("confirmPublish", "1");
                await publish(formData);
              }}
              className="masthead-chip masthead-chip-primary"
            >
              Confirm publish
            </button>
            <button type="button" className="masthead-chip" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </p>
        </div>
      ) : (
        <button
          type="button"
          className="masthead-chip masthead-chip-primary"
          disabled={!canPublish}
          onClick={() => setConfirm(true)}
        >
          Publish
        </button>
      )}
      {changeCount > 0 ? (
        <button
          type="submit"
          className="masthead-chip"
          formAction={async (formData) => {
            if (!window.confirm("Discard the draft and match the live site?")) return;
            formData.set("confirmDiscard", "1");
            await discardDraftAction(formData);
          }}
        >
          Discard draft
        </button>
      ) : null}
    </div>
  );
}

export function WordCount({
  name,
  defaultValue,
  min,
  max,
  rows,
}: {
  name: string;
  defaultValue: string;
  min: number;
  max: number;
  rows?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const ok = words >= min && words <= max;
  return (
    <>
      <textarea name={name} defaultValue={defaultValue} rows={rows} onChange={(e) => setValue(e.target.value)} />
      <span className={ok ? "normal-case tracking-normal text-faded" : "admin-error normal-case tracking-normal"}>
        {words} words (aim {min}–{max})
      </span>
    </>
  );
}

export function ClaimDateFields({ id, value }: { id: string; value: string }) {
  const [year, month, day] = (() => {
    const match = value.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
    return [match?.[1] ?? "", match?.[2] ?? "", match?.[3] ?? ""];
  })();
  const composed = year ? (month ? (day ? `${year}-${month}-${day}` : `${year}-${month}`) : year) : "";
  return (
    <div className="admin-date-parts">
      <input type="hidden" name={`claim-${id}-date`} defaultValue={composed} />
      <label>
        Year
        <input name={`claim-${id}-year`} defaultValue={year} inputMode="numeric" maxLength={4} />
      </label>
      <label>
        Month
        <input name={`claim-${id}-month`} defaultValue={month} inputMode="numeric" maxLength={2} placeholder="optional" />
      </label>
      <label>
        Day
        <input name={`claim-${id}-day`} defaultValue={day} inputMode="numeric" maxLength={2} placeholder="optional" />
      </label>
      <p className="font-mono text-[12px] normal-case tracking-normal text-faded">
        Measurement date accepts YYYY, YYYY-MM, or YYYY-MM-DD. Leave month or day blank for coarser filings.
      </p>
    </div>
  );
}

export function ReorderList({
  name,
  ids,
}: {
  name: string;
  ids: string[];
}) {
  const [order, setOrder] = useState(ids);
  function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row!);
    setOrder(next);
  }
  return (
    <div className="admin-reorder">
      <input type="hidden" name={name} value={order.join(",")} />
      <ol>
        {order.map((id, index) => (
          <li key={id}>
            <span>{id}</span>
            <button type="button" className="masthead-chip" onClick={() => move(index, -1)} disabled={index === 0}>
              Up
            </button>
            <button
              type="button"
              className="masthead-chip"
              onClick={() => move(index, 1)}
              disabled={index === order.length - 1}
            >
              Down
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function EditorSearch({
  children,
  itemSelector = "details",
}: {
  children: ReactNode;
  itemSelector?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const items = [...node.querySelectorAll<HTMLElement>(itemSelector)];
    const needle = query.trim().toLowerCase();
    for (const item of items) {
      const hay = item.innerText.toLowerCase();
      item.hidden = Boolean(needle) && !hay.includes(needle);
    }
  }, [query, itemSelector]);

  function setOpen(open: boolean) {
    const node = root.current;
    if (!node) return;
    for (const item of node.querySelectorAll("details")) {
      item.open = open;
    }
  }

  return (
    <div ref={root}>
      <p className="admin-list-tools">
        <label className="normal-case tracking-normal">
          Search
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button type="button" className="masthead-chip" onClick={() => setOpen(true)}>
          Expand all
        </button>
        <button type="button" className="masthead-chip" onClick={() => setOpen(false)}>
          Collapse all
        </button>
      </p>
      {children}
    </div>
  );
}
