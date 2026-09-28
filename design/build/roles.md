# Gate 5, step 4b: the Roles hall and the role pages

The hall (key frame roles-b) and the seven role pages (key frame role-a, replay prototype `design/motion/role.html`) are built. Stills are from the dev build at 2×. The questions are in the review doc.

## The hall, against its key frame

![The hall at 1440](roles/hall.webp)
![roles-b, approved](roles/key-roles-b.webp)

Reading a name lights its table's lamp and eases the camera toward it by up to 1.5 units. The dates show on hover; "now" stays on Deriv. On phones the row recedes up the screen and the names are a list below it.

![Reading Western Digital](roles/hall-read.webp)
<img src="roles/hall-m.webp" width="260" alt="The hall on a phone">

## Sitting down: Deriv

The camera circles the table as it comes down to the role page's low corner, so it never passes through a table. Then the page cuts in, framed the same. The frames run from 0 to 3.6 s.

![Frames of sitting down at Deriv](roles/sit-deriv.webp)

## The replay: Deriv

Scrolling replays Tal vs Larsen. Each move is played whole at hand speed as its scroll point is crossed, with lifts, captures and castling. The facts arrive one at a time in the margin. The game reaches 16. Nd5 at 80% of the pinned scroll, and the rest of the game plays over the last screen.

![At the start](roles/deriv-start.webp)
![Replaying](roles/deriv-replay.webp)
![At 16. Nd5](roles/deriv-famous.webp)
![role-a, approved](roles/key-role-a.webp)

<img src="roles/deriv-famous-m.webp" width="260" alt="Deriv on a phone"> <img src="roles/monash-m.webp" width="260" alt="Monash on a phone">

With reduced motion, the famous position is shown still, every fact is listed, and the scrubber steps the board without animation:

![Reduced motion](roles/deriv-reduced.webp)

The page ends on the next table:

![The end of the page](roles/deriv-end.webp)

## The other six tables, at the first move

![Monash, degree](roles/education.webp)
![Petronas](roles/petronas.webp)
![Western Digital](roles/western-digital.webp)
![Setel](roles/setel.webp)
![Monash, contract](roles/monash-university.webp)
![Skribble Lab](roles/skribble-lab.webp)

## Checks

- No sideways scrolling and no text clash at 1440, 390 and 320 px.
- Tests: 53 of 53 end-to-end tests pass, including new Roles tests for the order, the links, the seams, the facts, the replay, reduced motion and accessibility. 69 of 69 unit tests pass.
- The production build passes.
- The hall's seven sets are merged into a few draw calls and use coarser pieces, which look the same at that size. Its sun shadow is drawn once, because nothing in the hall moves.
