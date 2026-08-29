import { BRAND_TITLE, FLAGSHIP_ID, getNode, isOpeningId, selectionTitle } from "@/lib/opening/tree";

export type Selection = {
  move: string;
  tape: boolean;
};

export const SERVER_SELECTION: Selection = { move: FLAGSHIP_ID, tape: false };
const listeners = new Set<() => void>();
let cached: Selection = SERVER_SELECTION;

export function parseSelection(search: string): Selection {
  const q = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(q);
  const move = params.get("move");
  return {
    move: move && isOpeningId(move) ? move : FLAGSHIP_ID,
    tape: params.get("tape") === "1",
  };
}

export function selectionHref(pathname: string, move: string, tape: boolean): string {
  const params = new URLSearchParams();
  if (move !== FLAGSHIP_ID) params.set("move", move);
  if (tape) params.set("tape", "1");
  const q = params.toString();
  return q ? `${pathname}?${q}` : pathname;
}

export function getSelection(): Selection {
  if (typeof window === "undefined") return SERVER_SELECTION;
  const next = parseSelection(window.location.search);
  if (cached.move === next.move && cached.tape === next.tape) return cached;
  cached = next;
  return cached;
}

export function subscribeSelection(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  function onPop() {
    const q = new URLSearchParams(window.location.search).get("move");
    document.title =
      q && isOpeningId(q) ? selectionTitle(getNode(q)) : BRAND_TITLE;
    onStoreChange();
  }
  window.addEventListener("popstate", onPop);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("popstate", onPop);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

function writeSelection(move: string, tape: boolean, mode: "push" | "replace"): void {
  const href = selectionHref(window.location.pathname, move, tape);
  const current = `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams(href.includes("?") ? href.slice(href.indexOf("?") + 1) : "");
  const queryMove = params.get("move");
  document.title =
    queryMove && isOpeningId(queryMove) ? selectionTitle(getNode(move)) : BRAND_TITLE;
  if (current !== href) {
    if (mode === "push") window.history.pushState(window.history.state, "", href);
    else window.history.replaceState(window.history.state, "", href);
  }
  const next = { move, tape };
  if (cached.move !== next.move || cached.tape !== next.tape) cached = next;
  emit();
}

/** Scroll-spy and autoplay: keep one history entry, update the query. */
export function replaceSelection(move: string, tape: boolean): void {
  writeSelection(move, tape, "replace");
}

/** Click, keyboard, stamp: a distinct history entry so Back names the previous move. */
export function pushSelection(move: string, tape: boolean): void {
  writeSelection(move, tape, "push");
}
