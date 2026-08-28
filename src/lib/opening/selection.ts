import { FLAGSHIP_ID, isOpeningId } from "@/lib/opening/tree";

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
  window.addEventListener("popstate", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

/** Write the move into the address bar without a Next navigation — scroll stays put. */
export function replaceSelection(move: string, tape: boolean): void {
  const href = selectionHref(window.location.pathname, move, tape);
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== href) {
    window.history.replaceState(window.history.state, "", href);
  }
  const next = { move, tape };
  if (cached.move !== next.move || cached.tape !== next.tape) cached = next;
  emit();
}
