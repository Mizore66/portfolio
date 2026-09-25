import type { Metadata } from "next";
import Link from "next/link";
import { Puzzle } from "@/components/game/Puzzle";
import { ScoresheetBoard, type TreeRow } from "@/components/game/ScoresheetBoard";
import { getClaim } from "@/content/site";
import { EVIDENCE_LABEL } from "@/content/site/types";
import { DEFAULT_MOVE, GAME, type GameNode } from "@/content/site/game";
import { children, enginePliesTo, gameNode, isGameId, mainline, moveLabel, resolveMove } from "@/content/site/game-tree";
import { LAB_TEASER } from "@/content/site/lab";
import { LINE_NAME } from "@/content/site/line";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const INTRO = "A playable career timeline told through an Italian Game.";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const raw = (await searchParams).move;
  const move = typeof raw === "string" && isGameId(raw) ? raw : null;
  const n = move ? gameNode(move) : null;
  const title = n && n.id !== "start" ? `${moveLabel(n)}${n.sym} ${n.title} · Opening Preparation` : "Opening Preparation · Anas Qumhiyeh";
  const description = n ? `${INTRO} ${n.title}: ${n.fact}`.slice(0, 157).replace(/\s+\S*$/, "") + "…" : `${INTRO} The résumé is literal; the chess is annotation.`;
  const canonical = move && move !== DEFAULT_MOVE ? `/opening-preparation?move=${move}` : "/opening-preparation";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "article", url: canonical },
  };
}

/** Mainline in order, each move followed by its side lines, indented. */
function treeRows(): TreeRow[] {
  const rows: TreeRow[] = [];
  const walk = (n: GameNode, depth: number) => {
    rows.push({ id: n.id, label: n.id === "start" ? "Start" : `${moveLabel(n)}${n.sym}  ${n.title}`, depth, kind: n.type });
    const kids = children(n.id);
    const main = kids.find((k) => k.type === "mainline" && n.type === "mainline");
    for (const side of kids.filter((k) => k !== main)) walk(side, depth + 1);
    if (main) walk(main, depth);
  };
  walk(gameNode("start"), 0);
  return rows;
}

function next(n: GameNode): string | null {
  const kids = children(n.id);
  return (kids.find((k) => k.type === n.type) ?? kids[0])?.id ?? null;
}

function Chapter({ node, variation = false }: { node: GameNode; variation?: boolean }) {
  const Heading = variation ? "h4" : "h3";
  return (
    <article id={`chapter-${node.id}`} className={variation ? "chapter chapter-variation" : "chapter"} aria-labelledby={`chapter-${node.id}-title`}>
      <p className="role-meta">
        {node.id === "start" ? node.kind : `${moveLabel(node)}${node.sym} · ${node.kind}`}
        {node.type === "not-taken" ? " · not played" : null}
      </p>
      <Heading id={`chapter-${node.id}-title`} className="chapter-title">
        <Link href={`/opening-preparation?move=${node.id}#chapter-${node.id}`}>{node.title}</Link>
      </Heading>
      <p className="chapter-fact">{node.fact}</p>
      {node.claims?.length ? (
        <ul className="chapter-claims">
          {node.claims.map((id) => {
            const c = getClaim(id);
            return (
              <li key={id}>
                <span className="claim-value">{c.display}</span> <span className="claim-type">{EVIDENCE_LABEL[c.type]}</span>{" "}
                <span className="claim-meta">{c.owner}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className="annotation">{node.commentary}</p>
      {node.eval !== undefined ? (
        <p className="note">
          Annotator&apos;s eval {node.eval >= 0 ? "+" : ""}
          {node.eval.toFixed(2)} (annotation, not engine output).
        </p>
      ) : null}
      {node.puzzle ? (
        <Puzzle
          prompt={node.puzzle.prompt}
          target={node.puzzle.target}
          hit={node.puzzle.hit}
          miss={node.puzzle.miss}
          choices={[
            { san: "O-O", uci: "e1g1" },
            { san: "d4", uci: "d2d4" },
            { san: "d3", uci: "d2d3" },
          ]}
        />
      ) : null}
      {node.links?.length ? (
        <ul className="link-list chapter-links">
          {node.links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default async function OpeningPreparationPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const selected = gameNode(resolveMove(sp.move));
  const line = mainline();

  return (
    <main id="main" className="op-layout">
      <header className="hero op-intro">
        <h1 className="hero-statement">Opening Preparation</h1>
        <p className="hero-subline">{INTRO}</p>
        <p className="hero-status">
          The résumé is literal; the chess is annotation. Moves in roman are facts; lines in italic are my commentary. {LINE_NAME}.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#scoresheet">
            Read the scoresheet
          </a>
          <a className="btn" href="/print-edition">
            Résumé
          </a>
        </div>
      </header>
      <ScoresheetBoard
        nodeId={selected.id}
        plies={enginePliesTo(selected.id)}
        move={selected.id === "start" ? "" : `${moveLabel(selected)}${selected.sym}`}
        title={selected.title}
        prev={selected.parent}
        next={next(selected)}
        tree={treeRows()}
        authoredEval={selected.eval}
      />
      <div className="op-sheet">
        <section id="scoresheet" className="section" aria-labelledby="scoresheet-title">
          <h2 id="scoresheet-title">The scoresheet</h2>
          {line.map((n) => (
            <div key={n.id}>
              <Chapter node={n} />
              {GAME.filter((v) => v.parent === n.id && v.type !== "mainline").map((v) => (
                <div key={v.id} className="variations">
                  <Chapter node={v} variation />
                  {/* The old castled line continues as one variation chain. */}
                  {(() => {
                    const chain: GameNode[] = [];
                    for (let c = children(v.id)[0]; c; c = children(c.id)[0]) chain.push(c);
                    return chain.map((c) => <Chapter key={c.id} node={c} variation />);
                  })()}
                </div>
              ))}
            </div>
          ))}
        </section>

        <section id="lab" className="section" aria-labelledby="lab-title">
          <h2 id="lab-title">The engine behind the board</h2>
          <p>{LAB_TEASER.headline}</p>
          <p className="annotation">{LAB_TEASER.annotation}</p>
          <p>
            <Link className="btn" href="/lab/learned-evaluator">
              Read the experiment
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
