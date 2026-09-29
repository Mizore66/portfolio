# Gate 5, step 4c: the Lab

The Lab (key frames lab-a and lab2-1 to lab2-7, motion `design/motion.md` §5, §11 and §12) is built: the opening, six pinned chapters and Play. Stills are from the dev build at 2×. The questions are in the review doc.

## The opening, against its key frame

The tree is the engine's own search from the Gate match's position, grown depth by depth from its root on the seam (60 ms a depth). Then the principal variation lights amber, and then −143.3, ±35.4 Elo and the record rise.

![The opening at 1440](lab/open.webp)
![lab-a, approved](lab/key-open.webp)
![The tree growing, 0 to 1.7 s](lab/grow.webp)

## The six chapters at the end of their scroll, against their key frames

Each chapter is pinned while its object builds with the scroll, and the seam eases to the chapter's share as it takes over (1.1 s).

![01 Two evaluators](lab/ch1.webp)
![lab2-1](lab/key-lab2-1.webp)
![02 The data](lab/ch2.webp)
![lab2-2](lab/key-lab2-2.webp)
![03 Trained twice](lab/ch3.webp)
![lab2-3](lab/key-lab2-3.webp)
![04 The referee](lab/ch4.webp)
![lab2-4](lab/key-lab2-4.webp)
![05 The match](lab/ch5.webp)
![lab2-5b](lab/key-lab2-5b.webp)
![06 What failed](lab/ch6.webp)
![lab2-6](lab/key-lab2-6.webp)

Halfway through each chapter's scroll:

![Mid-scroll, 1440](lab/mid.webp)

## Play

The board is the key frame's. Press a piece and it lifts, with its moves as dots (captures as rings). Drag it, or click it and then its square. The engine thinks in a worker at 50,000 nodes and plays at hand speed. After every move the seam steps to the learned net's score.

![07 Play, before Start](lab/ch7.webp)
![lab2-7](lab/key-lab2-7.webp)
![Dragging the knight to g5](lab/play-drag.webp)
![After 4. Ng5 Qxg5, the seam falls to 19.8%](lab/play-reply.webp)
![Choosing d2: its moves as dots](lab/play-lift.webp)
![Playing Black: the board turns and the engine opens with 4. c3](lab/play-black.webp)

## On a phone (390 × 844)

The site, then the key frames:

![The opening and chapters 1 to 3](lab/phone-a.webp)
![Key frames](lab/key-phone-a.webp)
![Chapters 4 to 7](lab/phone-b.webp)
![Key frames](lab/key-phone-b.webp)

Halfway through each chapter:

![Mid-scroll on a phone](lab/mid-phone.webp)

Play on a phone, tap and tap (d2, then d3; the engine answers Nf6):

![Play on a phone](lab/play-phone.webp)

## Checks

- No sideways scrolling at 1440, 390 and 320 px.
- Reduced motion: every chapter is its key frame without scrubbing, moves are instant and the seam jumps.
- Unit tests 70/70, end-to-end 58/58, lint (src) and the production build pass. Play works in the production build.
