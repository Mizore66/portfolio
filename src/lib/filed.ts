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
