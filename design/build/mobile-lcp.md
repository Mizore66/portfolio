# Mobile Lighthouse: the name from the first frame (owner, 2026-10-04: A, B and D)

Lighthouse's mobile run (2026-10-04, with extensions on): Performance 29, LCP 7.8 s (the name, 12.7 s of render delay),
Speed Index 17 s, TBT 3.9 s. Measured again here as Lighthouse's mobile profile (CPU 4× slower, 1.6 Mbps at 150 ms, a
412 × 823 phone), without extensions, two production builds side by side, two runs each:

| | before | A + B |
|---|---|---|
| main content (LCP) | the name, only once it rose at the end of the opening | the name, at first paint: 0.8 s |
| everything downloaded | 4.8 s | 4.1 s |
| the opening starts | 5.8 s | 5.1 s |
| blocking time | ~360-420 ms | ~350 ms |

- **A.** The italic (132 KB) was fetched on a first load for one Lab line screens below, and the opening waited for
  every font. That line now takes the italic once the page has loaded (on /lab, at once); the opening waits only for
  the fonts it is loading itself.
- **B.** On phones and upright tablets the name is there from the first frame, ink on the paper, and the opening's game
  plays under it; it no longer rises at the end. The headline, the nav and the evaluation arrive as before.
  `mobile-lcp/phone-opening-before.jpg` and `-after.jpg`: 0.6, 1.5, 3, 5, 7, 9, 11 and 14 s, CPU 4× slower.
- **D.** Not done: the "legacy JavaScript" Lighthouse names is Next's own polyfill module (guarded `Array.prototype.at`,
  `Object.hasOwn` and the like), sent to every browser; Next already targets Chrome 111 and Safari 16.4.
