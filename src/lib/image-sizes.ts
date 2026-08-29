/**
 * next/image `sizes` per register. With `sizes` set, Next emits a full
 * srcset (including large device widths); the browser picks from `sizes`.
 * Role plates paint at ~184px on the desktop scoresheet — never 3840.
 */
export const IMAGE_SIZES = {
  /** Education/role clips wrapping the column. */
  rolePlate: "(min-width: 980px) 184px, 45vw",
  /** Project plates wrapping the scoresheet (2-col wrap). */
  projectPlate: "(min-width: 980px) 200px, 45vw",
  /** Full-column plates on exhibit pages (max-w-2xl). */
  exhibitPlate: "(min-width: 672px) 640px, 92vw",
  /** News-clipping photo when the clip itself is full-column. */
  columnPlate: "(min-width: 980px) 520px, 92vw",
  /** Patent sheets: full scoresheet / exhibit column. */
  patentSheet: "(min-width: 980px) 640px, 92vw",
  clippingInset: "(min-width: 640px) 120px, 34vw",
  inventor: "148px",
} as const;
