"use client";

import { useEffect } from "react";
import { boardStore } from "@/lib/board/store";

/**
 * The home board's move in the URL (`?at=`, AUDIT.md decision 1; `?move=` stays
 * a redirect to the scoresheet so shared links keep landing there). The latest
 * move is the default and is not written.
 */
export function BoardUrlSync({ latest }: { latest: string }) {
  useEffect(() => {
    const store = boardStore();
    const at = new URLSearchParams(window.location.search).get("at");
    const apply = () => {
      if (at && store.getState().data?.nodes[at]) store.getState().setNode(at, "url");
    };
    if (store.getState().data) apply();
    const unsub = store.subscribe((s, prev) => {
      if (!prev.data && s.data) apply();
      if (s.nodeId === prev.nodeId || s.source !== "user") return;
      const url = new URL(window.location.href);
      if (s.nodeId === latest) url.searchParams.delete("at");
      else url.searchParams.set("at", s.nodeId);
      window.history.replaceState(window.history.state, "", url);
    });
    return unsub;
  }, [latest]);
  return null;
}
