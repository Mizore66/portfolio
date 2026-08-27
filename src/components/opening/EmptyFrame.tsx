export function EmptyFrame({
  kicker,
  hed,
}: {
  kicker: string;
  hed: string;
}) {
  return (
    <aside className="retrospect" data-testid="retrospect">
      <p className="retrospect-kicker">{kicker}</p>
      <p className="retrospect-hed">{hed}</p>
    </aside>
  );
}
