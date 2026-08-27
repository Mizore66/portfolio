export function ArchitectureFigure({
  name,
  tech,
  kicker = "Fig. 2 · The apparatus",
  stack,
}: {
  name: string;
  tech: string[];
  kicker?: string;
  stack?: {
    runtime: string;
    layers: { name: string; role: string }[];
  };
}) {
  return (
    <figure
      className="border-2 border-ink"
      data-testid="architecture-figure"
      data-layout={stack ? "stack" : "flow"}
    >
      <p className="border-b border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
        {kicker} · {name}
      </p>
      {stack ? <StackDiagram stack={stack} /> : <FlowDiagram tech={tech} />}
    </figure>
  );
}

function FlowDiagram({ tech }: { tech: string[] }) {
  return (
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
  );
}

function StackDiagram({
  stack,
}: {
  stack: { runtime: string; layers: { name: string; role: string }[] };
}) {
  return (
    <div className="apparatus-runtime p-3" data-runtime={stack.runtime}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faded">
        {stack.runtime}
      </p>
      <ol className="mt-2 flex flex-col items-stretch gap-1">
        {stack.layers.map((layer, i) => (
          <li key={layer.name} className="flex flex-col items-center">
            {i > 0 ? (
              <span className="py-0.5 font-mono text-[10px] text-faded" aria-hidden>
                ↓
              </span>
            ) : null}
            <span
              data-layer={layer.name}
              className="flex w-full items-baseline justify-between gap-3 border border-ink px-2 py-1"
            >
              <span className="font-mono text-[11px] text-book-blue">{layer.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-faded">
                {layer.role}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
