/** Parse a filing like `Apr 2026` or `2026-08-29` as UTC, not local midnight. */
const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

export function parseFiledDate(filed: string): Date | undefined {
  const iso = filed.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00.000Z`);
  const m = filed.match(/^([A-Za-z]+)\s+(\d{4})/);
  if (!m) return undefined;
  const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
  if (month === undefined) return undefined;
  return new Date(Date.UTC(Number(m[2]), month, 1));
}

export function filedYearMonth(filed: string): string | undefined {
  const d = parseFiledDate(filed);
  return d ? d.toISOString().slice(0, 7) : undefined;
}

export function formatClaimDate(raw: string): string {
  const day = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (day) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[Number(day[2]) - 1];
    return month ? `${Number(day[3])} ${month} ${day[1]}` : raw;
  }
  const ym = raw.match(/^(\d{4})-(\d{2})$/);
  if (ym) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[Number(ym[2]) - 1];
    return month ? `${month} ${ym[1]}` : raw;
  }
  return raw;
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return iso;
  const delta = Math.round((now - then) / 1000);
  if (Math.abs(delta) < 60) return "just now";
  const minutes = Math.round(delta / 60);
  if (Math.abs(minutes) < 60) return `${Math.abs(minutes)} min ${minutes > 0 ? "ago" : "from now"}`;
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return `${Math.abs(hours)} hr ${hours > 0 ? "ago" : "from now"}`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 14) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ${days > 0 ? "ago" : "from now"}`;
  return new Date(then).toISOString().slice(0, 10);
}
