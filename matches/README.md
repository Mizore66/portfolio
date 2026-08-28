# Match reports

JSON artifacts from `npx tsx src/lib/chess/match/cli.ts`.

These are the site's data source for the evaluations column and the Elo-over-commits chart.
Do not merge an eval or search change without a `sprt:` line in the commit message.

Gate A (handcrafted vs handcrafted, ~0 Elo) is asserted in `src/lib/chess/match/match.test.ts`.
Full 50-opening / 50k-node runs belong here once they exist.
