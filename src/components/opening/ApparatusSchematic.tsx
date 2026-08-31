import type { Apparatus } from "@/lib/opening/types";

/** Compact request path from the exhibit apparatus — proof, not decoration. */
export function ApparatusSchematic({ apparatus }: { apparatus: Apparatus }) {
  const forks = apparatus.forks ?? [];
  const beside = apparatus.beside ?? [];

  return (
    <div data-testid="apparatus-schematic" className="apparatus-schematic" aria-label="Request path">
      {apparatus.runtime ? (
        <p className="apparatus-schematic-runtime">{apparatus.runtime}</p>
      ) : null}
      <ol className="apparatus-schematic-path">
        {apparatus.path.map((layer, i) => (
          <li key={`${layer.name}-${layer.role}`}>
            {i > 0 ? <span className="apparatus-schematic-arrow" aria-hidden="true">↓</span> : null}
            <span className="apparatus-schematic-role">{layer.role}</span>
            <span className="apparatus-schematic-name">{layer.name}</span>
          </li>
        ))}
      </ol>
      {forks.length > 0 ? (
        <ul className="apparatus-schematic-forks">
          {forks.map((layer) => (
            <li key={`${layer.name}-${layer.role}`}>
              <span className="apparatus-schematic-role">{layer.role}</span>
              <span className="apparatus-schematic-name">{layer.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {beside.length > 0 ? (
        <ul className="apparatus-schematic-beside">
          {beside.map((layer) => (
            <li key={`${layer.name}-${layer.role}`}>
              <span className="apparatus-schematic-role">{layer.role}</span>
              <span className="apparatus-schematic-name">{layer.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
