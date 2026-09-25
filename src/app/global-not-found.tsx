import type { Metadata } from "next";
import "./(legacy)/globals.css";

export const metadata: Metadata = {
  title: "Correction — A. T. Qumhiyeh",
  description: "The page you requested was a misprint. The front page still holds the work.",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en-GB">
      <body>
        <main data-testid="correction" style={{ maxWidth: "40rem", margin: "4rem auto", padding: "0 1.25rem" }}>
          <p>Correction</p>
          <h1>The page you requested was a misprint.</h1>
          <p>It never made the plate. The front page still holds the work.</p>
          <p>
            <a href="/">← Back to the front page</a> · <a href="/print-edition">Resume</a> ·{" "}
            <a href="/#contact">Contact</a>
          </p>
        </main>
      </body>
    </html>
  );
}
