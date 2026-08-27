import type { Apparatus, ApparatusLayer } from "@/lib/opening/types";

export function ArchitectureFigure({
  name,
  kicker = "Fig. · The apparatus",
  runtime,
  path,
  forks,
  beside,
  tech,
}: {
  name: string;
  kicker?: string;
  runtime?: string;
  path?: ApparatusLayer[];
  forks?: ApparatusLayer[];
  beside?: ApparatusLayer[];
  tech?: string[];
}) {
  const layers = path && path.length > 0 ? path : null;

  return (
    <figure
      className="border-2 border-ink"
      data-testid="architecture-figure"
      data-layout={layers ? "path" : "parts"}
    >
      <p className="border-b border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
        {kicker} · {name}
      </p>
      <div className={runtime ? "apparatus-runtime p-3" : "p-3"} data-runtime={runtime || undefined}>
        {runtime ? (
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faded">{runtime}</p>
        ) : null}
        {layers ? (
          <Path layers={layers} forks={forks} />
        ) : (
          <Parts names={tech ?? []} />
        )}
        {beside && beside.length > 0 ? <Beside items={beside} /> : null}
      </div>
    </figure>
  );
}

function LayerRow({ layer, fork }: { layer: ApparatusLayer; fork?: boolean }) {
  return (
    <span
      data-layer={layer.name}
      data-fork={fork ? layer.name : undefined}
      className="flex w-full items-baseline justify-between gap-3 border border-ink px-2 py-1"
    >
      <span className="font-mono text-[11px] text-book-blue">{layer.name}</span>
      {layer.role ? (
        <span className="font-mono text-[10px] uppercase tracking-wider text-faded">{layer.role}</span>
      ) : null}
    </span>
  );
}

function Path({ layers, forks }: { layers: ApparatusLayer[]; forks?: ApparatusLayer[] }) {
  return (
    <ol className="flex flex-col items-stretch gap-1">
      {layers.map((layer, i) => (
        <li key={layer.name} className="flex flex-col items-center">
          {i > 0 ? (
            <span className="py-0.5 font-mono text-[10px] text-faded" aria-hidden data-arrow="">
              ↓
            </span>
          ) : null}
          <LayerRow layer={layer} />
        </li>
      ))}
      {forks && forks.length > 0 ? (
        <li className="mt-1">
          <span className="block py-0.5 text-center font-mono text-[10px] text-faded" aria-hidden data-arrow="">
            ↓
          </span>
          <ol className="grid gap-2 sm:grid-cols-2">
            {forks.map((layer) => (
              <li key={layer.name}>
                <LayerRow layer={layer} fork />
              </li>
            ))}
          </ol>
        </li>
      ) : null}
    </ol>
  );
}

function Parts({ names }: { names: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1">
      {names.map((name) => (
        <li key={name} data-layer={name} className="border border-ink px-2 py-1 font-mono text-[11px] text-book-blue">
          {name}
        </li>
      ))}
    </ul>
  );
}

function Beside({ items }: { items: ApparatusLayer[] }) {
  return (
    <div className="mt-3 border-t border-ink pt-2">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-faded">
        Not this path
      </p>
      <ul>
        {items.map((item) => (
          <li
            key={item.name}
            data-beside={item.name}
            className="flex items-baseline justify-between gap-3 py-0.5 font-mono text-[11px]"
          >
            <span className="text-book-blue">{item.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-faded">{item.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type { Apparatus, ApparatusLayer };
