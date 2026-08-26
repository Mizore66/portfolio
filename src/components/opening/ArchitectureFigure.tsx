export function ArchitectureFigure({
  name,
  tech,
  kicker = "Fig. 2 · The apparatus",
}: {
  name: string;
  tech: string[];
  kicker?: string;
}) {
  return (
    <figure className="border-2 border-ink" data-testid="architecture-figure">
      <p className="border-b border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
        {kicker} · {name}
      </p>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 p-3">
        {tech.map((step, i) => (
          <li key={step} className="flex items-center gap-1">
            {i > 0 ? (
              <span className="font-mono text-[10px] text-faded" aria-hidden>
                →
              </span>
            ) : null}
            <span className="border border-ink px-2 py-1 font-mono text-[11px] text-book-blue">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
