<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Install: `npm ci`, Playwright Chromium (`npx playwright install --with-deps chromium`), then Pillow (`pip3 install pillow`) for patent-callout raster tests.
- App: `npm run dev` on http://localhost:3000 (started with the environment).
- Tests: `npx vitest run` and `npx playwright test`.
- Origin defaults to `https://anasqumhiyeh.dev` (`NEXT_PUBLIC_SITE_URL`).
- Do not retrain the NNUE net, run 50k matches, or delete PeSTO as routine work. See `training/GUARDS.md`.

