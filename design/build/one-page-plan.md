# One page: the build plan (owner direction, 2026-09-29)

Sections on `/`, in order: Hero, Roles (the hall), Work (the featured three, then Other Projects), Lab (the opening and Play, with a way into /lab's six chapters), Contact. Detail pages stay separate. The seam follows the scroll.

## Addresses

- `/` is the page; `/#roles`, `/#work`, `/#lab`, `/#contact` are its sections. The hash follows the section in view (replaceState, no history entries).
- `/roles`, `/work`, `/contact` redirect to their sections. `/lab` stays the full Lab page (opening, six chapters, Play).
- `/roles/<id>`, `/work/<id>` are unchanged. Their "back" links go to `/#roles` and `/#work`.

## Steps

1. **Seam blocks** (`src/lib/seam/blocks.ts`). Each part of the page registers a block with its resting seam (a function, so Play's eval can drive it). On scroll:
   - desktop: one vertical seam for the whole viewport, eased between two blocks' rests while the boundary between them crosses the middle 60% of the screen;
   - phones: each block carries its own horizontal split at its rest (its own `--seam`), so the black bands scroll with their sections; the chrome's paper copy is clipped to the dark bands on screen.
   The controller stands aside while a sweep or the hero's opening owns the seam.
2. **The page** (`src/components/home/Home.tsx`): one `<main>`, the sections as `<section id=…>`, one `<h1>` (the name). Routes and redirects. Metadata stays the site's.
3. **Sections:** RolesIndex, WorkIndex, Others, Contact render as sections; the Lab gets a section mode (opening + Play + a link to /lab). Each section's type rises the first time it scrolls into view, instead of on arrival from a sweep. The Lab's offsets are measured from the document, not from `.lab`.
4. **Nav:** the four items link to their sections. A click glides there (Lenis, the `seam` ease), the underline follows the section in view, the skip link still lands on `#main`.
5. **Detail pages:** entering a project or a role still cuts from the gallery or the hall. Back, and the back links, sweep to `/` and land on the section, at the scroll position left.
6. **Checks:** type colours at rest per block (`restColours`), WebGL count (hero 2, hall 1, gallery 1, second board 1, Play 2: 7 live contexts), no overflow at 1440/390/320, reduced motion, the test suites rewritten for one page, stills of every section and of the moments between them.
