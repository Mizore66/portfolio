# Prod Lighthouse baseline

Archived from `https://anasqumhiyeh.dev/` on 29 Aug 2026, Lighthouse 12.6.0, headless Chrome, no TLS MITM.

| | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 99 | 100 | 100 | 100 |
| Mobile | 90 | 100 | 100 | 100 |

Desktop LCP 0.7s (sticky board). Mobile LCP 3.3s on the masthead kicker — render delay, not TTFB. `label-content-name-mismatch` was a 0-score audit that did not drag the category; the axe gate in `e2e/a11y.spec.ts` is the shift-left check.

Reproduce:

```bash
npx lighthouse https://anasqumhiyeh.dev/ --preset=desktop --chrome-flags="--headless --no-sandbox" --output=json --output-path=desktop.json
npx lighthouse https://anasqumhiyeh.dev/ --form-factor=mobile --screenEmulation.mobile --chrome-flags="--headless --no-sandbox" --output=json --output-path=mobile.json
```
