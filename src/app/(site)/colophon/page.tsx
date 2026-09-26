import type { Metadata } from "next";
import { perft, START_PERFT, startPos } from "@/lib/chess/engine";

export const metadata: Metadata = {
  title: "How this site was made · Anas Qumhiyeh",
  description: "Typefaces, colours, how the content is published, what the tests check, and the chess engine's perft self-check.",
  alternates: { canonical: "/colophon" },
};

const TYPE = [
  { name: "Schibsted Grotesk", role: "Facts and interface", sample: "Roman is fact.", className: "" },
  { name: "Literata Italic", role: "Commentary only", sample: "Italic is voice.", className: "annotation" },
  { name: "Commit Mono", role: "Notation and figures", sample: "10. Nbxd2 Bg4 −143.3 ±35.4", className: "claim-value" },
  { name: "Noto Sans Symbols 2", role: "Chess pieces", sample: "♚ ♛ ♜ ♝ ♞ ♟", className: "colophon-pieces" },
];

const COLOURS = [
  { name: "Slate ink", hex: "#14181D", use: "Text" },
  { name: "Board light", hex: "#E4E8EC", use: "Light squares" },
  { name: "Board dark", hex: "#7D8A99", use: "Dark squares" },
  { name: "Annotation violet", hex: "#6D3FD6", use: "Commentary, arrows, focus" },
  { name: "White", hex: "#FFFFFF", use: "Paper" },
];

const TESTS = [
  "Every number on the site is registered in one claims ledger, with an evidence type, an owner and a date.",
  "The hero carries no metric, +45% and +35% are never merged, and −50% appears only under Monash.",
  "Every chess move is legal under the engine's own move generator, the mainline equals the canonical line, and every old ?move= link still resolves.",
  "The résumé PDF fits one page in both paper sizes, is tagged, and renders −, →, ± and é as text.",
  "No engine file or worker loads until the engine is started; a keyboard move gets an engine reply.",
  "Every public page has zero automated accessibility violations and no sideways scrolling at 320 px.",
];

export default function ColophonPage() {
  const pos = startPos();
  const rows = START_PERFT.map((r) => ({ ...r, counted: perft(pos, r.depth) }));
  return (
    <main id="main" className="case" data-testid="colophon">
      <header className="case-header">
        <h1 className="case-title">How this site was made</h1>
        <p className="case-purpose">
          An analysis board: the career as facts, the commentary kept apart, and a chess engine you can actually play.
        </p>
      </header>

      <section className="case-section" aria-labelledby="type-title">
        <h2 id="type-title">Type</h2>
        <dl className="colophon-list">
          {TYPE.map((t) => (
            <div key={t.name}>
              <dt>
                {t.name} <span className="note">{t.role}</span>
              </dt>
              <dd className={t.className}>{t.sample}</dd>
            </div>
          ))}
        </dl>
        <p className="note">All four are under the SIL Open Font License and served from this domain; nothing is fetched from a font CDN.</p>
      </section>

      <section className="case-section" aria-labelledby="colour-title">
        <h2 id="colour-title">Colour</h2>
        <ul className="swatches">
          {COLOURS.map((c) => (
            <li key={c.hex}>
              <span className="swatch" style={{ background: c.hex }} aria-hidden="true" />
              <span>
                {c.name} <span className="claim-value">{c.hex}</span>
                <span className="note"> {c.use}</span>
              </span>
            </li>
          ))}
        </ul>
        <p>Eval bars stay pure black and white. No wood, no paper texture, and no generated images: every picture is a real screenshot or drawn from data.</p>
      </section>

      <section className="case-section" aria-labelledby="names-title">
        <h2 id="names-title">Names</h2>
        <p data-testid="name-note">Anas Qumhiyeh on the site; Anas Tarek Qumhiyeh on the résumé and wherever a legal name is expected.</p>
      </section>

      <section className="case-section" aria-labelledby="publish-title">
        <h2 id="publish-title">How it is published</h2>
        <p>
          All content lives in typed files in the repository. The same files feed every page, the résumé PDF, the structured data, the
          sitemap and the preview images. A change goes live with a git push; every pull request gets its own preview deployment for
          review first. There is no content management system.
        </p>
      </section>

      <section className="case-section" aria-labelledby="tests-title">
        <h2 id="tests-title">What the tests check</h2>
        <ul className="role-bullets">
          {TESTS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="case-section" aria-labelledby="engine-title">
        <h2 id="engine-title">The engine</h2>
        <p>
          Move generation, alpha-beta search, the handcrafted PeSTO evaluation and a learned NNUE evaluation are written from scratch in
          TypeScript. The net was trained on CC0 Lichess evaluations, exported with quantisation-aware training and runs through a small
          WebAssembly module. It starts only when you ask, runs in a Web Worker and pauses when the tab is hidden.
        </p>
        <p>Perft self-check from the starting position, counted by the engine when this page was rendered:</p>
        <table className="perft">
          <thead>
            <tr>
              <th scope="col">Depth</th>
              <th scope="col">Expected</th>
              <th scope="col">Counted</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.depth}>
                <td>{r.depth}</td>
                <td>{r.nodes.toLocaleString("en-GB")}</td>
                <td>{r.counted.toLocaleString("en-GB")}</td>
                <td>{r.counted === r.nodes ? "Match" : "Mismatch"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="case-section" aria-labelledby="credits-title">
        <h2 id="credits-title">Credits</h2>
        <ul className="role-bullets">
          <li>Handcrafted evaluation: the PeSTO piece-square tables by Ronald Friederich.</li>
          <li>Lichess eval database, CC0-1.0. No Stockfish network weights are copied.</li>
          <li>Chess pieces are glyphs from Noto Sans Symbols 2 (SIL Open Font License).</li>
          <li>Built with Next.js, React and Tailwind CSS; hosted on Vercel with cookieless Vercel Web Analytics.</li>
        </ul>
      </section>
    </main>
  );
}
