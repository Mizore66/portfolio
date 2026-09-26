import type { ArchNode, Architecture } from "@/content/site/types";

type Box = ArchNode & { x: number; y: number; w: number; h: number };

const GAP_X = 44;
const GAP_Y = 52;
const PAD = 20;
const HOST_TOP = 30;

/** Estimated from the label lengths; the SVG scales, so this only needs to be generous. */
function measure(node: ArchNode): { w: number; h: number } {
  const w = Math.max(120, node.label.length * 7.6 + 32, (node.note?.length ?? 0) * 6.6 + 32);
  return { w: Math.round(w), h: node.note ? 58 : 44 };
}

function layout(a: Architecture) {
  const top = a.host ? PAD + HOST_TOP : PAD;
  const inset = a.host ? PAD + 16 : PAD;

  let x = inset;
  const path: Box[] = a.path.map((n) => {
    const m = measure(n);
    const box = { ...n, ...m, x, y: top };
    x += m.w + GAP_X;
    return box;
  });
  const pathH = Math.max(...path.map((b) => b.h));
  for (const b of path) b.y = top + (pathH - b.h) / 2;

  // Branches hang below their source node, centred under it, then pushed right to avoid overlap.
  const branchY = top + pathH + GAP_Y;
  const groups = new Map<number, ArchNode[]>();
  for (const b of a.branches ?? []) {
    const from = b.from ?? a.path.length - 1;
    groups.set(from, [...(groups.get(from) ?? []), b]);
  }
  const branches: (Box & { from: number })[] = [];
  let cursor = inset;
  for (const [from, nodes] of [...groups.entries()].sort((p, q) => p[0] - q[0])) {
    const sizes = nodes.map(measure);
    const total = sizes.reduce((s, m) => s + m.w, 0) + (nodes.length - 1) * 16;
    const src = path[from];
    let bx = Math.max(cursor, src.x + src.w / 2 - total / 2);
    nodes.forEach((n, i) => {
      branches.push({ ...n, ...sizes[i], x: bx, y: branchY, from });
      bx += sizes[i].w + 16;
    });
    cursor = bx + 8;
  }
  const branchH = branches.length ? Math.max(...branches.map((b) => b.h)) : 0;

  const hostBottom = (branches.length ? branchY + branchH : top + pathH) + (a.host ? 18 : 0);
  const contentRight = Math.max(...[...path, ...branches].map((b) => b.x + b.w));
  const hostRight = contentRight + (a.host ? 16 : 0);

  let besideY = hostBottom + 44;
  let bx = PAD;
  const beside: Box[] = (a.beside ?? []).map((n) => {
    const m = measure(n);
    const box = { ...n, ...m, x: bx, y: besideY };
    bx += m.w + 16;
    return box;
  });
  if (!beside.length) besideY = hostBottom;

  const width = Math.ceil(Math.max(hostRight, ...beside.map((b) => b.x + b.w)) + PAD);
  const height = Math.ceil((beside.length ? besideY + Math.max(...beside.map((b) => b.h)) : hostBottom) + PAD);
  return { path, branches, beside, width, height, hostBottom, hostRight };
}

function NodeBox({ box, dashed }: { box: Box; dashed?: boolean }) {
  const cx = box.x + box.w / 2;
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} className={dashed ? "arch-node arch-node-beside" : "arch-node"} />
      <text x={cx} y={box.y + (box.note ? 24 : 27)} textAnchor="middle" className="arch-label">
        {box.label}
      </text>
      {box.note ? (
        <text x={cx} y={box.y + 44} textAnchor="middle" className="arch-note">
          {box.note}
        </text>
      ) : null}
    </g>
  );
}

function describe(n: ArchNode) {
  return n.note ? `${n.label} (${n.note})` : n.label;
}

/** Server-rendered from content data. The SVG is decorative; the list carries the meaning. */
export function ArchitectureDiagram({ architecture: a, name }: { architecture: Architecture; name: string }) {
  const { path, branches, beside, width, height, hostBottom, hostRight } = layout(a);
  const branchesFrom = (i: number) => (a.branches ?? []).filter((b) => (b.from ?? a.path.length - 1) === i);

  return (
    <figure className="arch">
      <svg className="arch-svg" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width }} aria-hidden="true">
        <defs>
          <marker id="arch-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" className="arch-arrowhead" />
          </marker>
        </defs>
        {a.host ? (
          <g>
            <rect x={PAD} y={PAD} width={hostRight - PAD} height={hostBottom - PAD} className="arch-host" />
            <text x={PAD + 12} y={PAD + 19} className="arch-host-label">
              {a.host}
            </text>
          </g>
        ) : null}
        {path.slice(1).map((b, i) => {
          const prev = path[i];
          const y = prev.y + prev.h / 2;
          return <line key={b.label} x1={prev.x + prev.w} y1={y} x2={b.x - 2} y2={y} className="arch-edge" markerEnd="url(#arch-arrow)" />;
        })}
        {branches.map((b) => {
          const src = path[b.from];
          const sx = src.x + src.w / 2;
          const tx = b.x + b.w / 2;
          const mid = src.y + src.h + (b.y - src.y - src.h) / 2;
          return (
            <path
              key={b.label}
              d={`M ${sx} ${src.y + src.h} V ${mid} H ${tx} V ${b.y - 2}`}
              className="arch-edge"
              fill="none"
              markerEnd="url(#arch-arrow)"
            />
          );
        })}
        {path.map((b) => (
          <NodeBox key={b.label} box={b} />
        ))}
        {branches.map((b) => (
          <NodeBox key={b.label} box={b} />
        ))}
        {beside.length ? (
          <text x={PAD} y={beside[0].y - 12} className="arch-host-label">
            Beside the path
          </text>
        ) : null}
        {beside.map((b) => (
          <NodeBox key={b.label} box={b} dashed />
        ))}
      </svg>
      <div className="arch-list">
        {a.host ? <p>Runs on {a.host}.</p> : null}
        <ol aria-label={`${name} request path`}>
          {a.path.map((n, i) => (
            <li key={n.label}>
              {describe(n)}
              {branchesFrom(i).length ? (
                <ul>
                  {branchesFrom(i).map((b) => (
                    <li key={b.label}>calls {describe(b)}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
        {a.beside?.length ? <p>Beside the path: {a.beside.map(describe).join(", ")}.</p> : null}
      </div>
    </figure>
  );
}
