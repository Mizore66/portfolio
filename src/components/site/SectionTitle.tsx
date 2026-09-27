/**
 * A major section title set as an annotation (brief §4): the move number,
 * then the move, then the glyph where the content has one, then the title.
 * The notation comes from the game data, never new copy, and is hidden from
 * screen readers so the heading's name stays the title alone. The motion
 * system reveals each part behind a mask (`data-fx="annotate"`).
 */
export function SectionTitle({ id, move, sym, as: Tag = "h2", children }: { id: string; move?: string; sym?: string; as?: "h1" | "h2"; children: React.ReactNode }) {
  // "10…Bg4" → "10…" + "Bg4"; "10. Nbxd2" → "10." + "Nbxd2"; "11. …" → "11." + "…".
  const m = move?.match(/^(\d+(?:\.|…))\s?(.+)$/);
  return (
    <Tag id={id} data-fx="annotate">
      {m ? (
        <span className="ann" aria-hidden="true">
          <span className="fx-mask">
            <span data-fx-part className="ann-no">
              {m[1]}
            </span>
          </span>
          {m[1].endsWith(".") ? " " : null}
          <span className="fx-mask">
            <span data-fx-part className="ann-move">
              {m[2]}
            </span>
          </span>
          {sym ? (
            <span className="fx-mask">
              <span data-fx-part className="ann-glyph">
                {sym}
              </span>
            </span>
          ) : null}
        </span>
      ) : null}
      <span data-fx-title>{children}</span>
    </Tag>
  );
}
