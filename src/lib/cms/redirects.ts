import type { CmsRedirect } from "@/lib/cms/types";

export const LEDGER_REDIRECT_IDS = new Set(["about", "archive"]);

export const REDIRECT_STATUSES = [301, 302, 307, 308] as const;

export type RedirectStatus = (typeof REDIRECT_STATUSES)[number];

export function ledgerRedirects(): CmsRedirect[] {
  return [
    { id: "about", from: "/about", to: "/#about", status: 308, enabled: true },
    { id: "archive", from: "/archive", to: "/#work", status: 308, enabled: true },
  ];
}

function pathPart(value: string): string {
  return value.trim().split("#")[0]?.split("?")[0] ?? "";
}

export function normalizeRedirectFrom(path: string): string {
  const trimmed = path.trim();
  if (trimmed === "/") return "/";
  return trimmed.replace(/\/+$/, "") || "/";
}

/** Same-origin path only. No protocol-relative, admin, or control bytes. */
export function isSafeRedirectPath(path: string, kind: "from" | "to"): boolean {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return false;
  if (trimmed.startsWith("//")) return false;
  if (trimmed.includes("://")) return false;
  if (trimmed.includes("\\")) return false;
  if (/[\u0000-\u001f]/.test(trimmed)) return false;
  const onlyPath = pathPart(trimmed);
  if (!onlyPath.startsWith("/")) return false;
  if (onlyPath.startsWith("/admin")) return false;
  if (onlyPath.startsWith("/_next")) return false;
  if (onlyPath.startsWith("/api")) return false;
  if (kind === "from" && (trimmed.includes("#") || trimmed.includes("?"))) return false;
  return true;
}

export function isRedirectStatus(value: number): value is RedirectStatus {
  return (REDIRECT_STATUSES as readonly number[]).includes(value);
}

export function matchRedirect(pathname: string, redirects: CmsRedirect[]): CmsRedirect | null {
  const from = normalizeRedirectFrom(pathname);
  return (
    redirects.find(
      (row) => row.enabled && isSafeRedirectPath(row.from, "from") && isSafeRedirectPath(row.to, "to") && normalizeRedirectFrom(row.from) === from,
    ) ?? null
  );
}
