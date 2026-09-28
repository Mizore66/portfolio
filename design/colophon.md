# Colophon (credits and licences)

Recorded in Phase 4 for the site's colophon page. Each licence was checked in the file or package itself on 2026-09-28.

## Type

| Font | Version | Licence | Source | Checked in |
|---|---|---|---|---|
| Archivo (variable, width 62–125, weight 100–900, roman and italic) | 2.001 | SIL Open Font License 1.1 | Omnibus-Type, github.com/Omnibus-Type/Archivo | the font's name table (copyright and licence URL); full text in `design/assets/licenses/Archivo-OFL.txt` |
| JetBrains Mono (regular) | 2.211 | SIL Open Font License 1.1 | JetBrains, github.com/JetBrains/JetBrainsMono | the font's name table; full text in `design/assets/licenses/JetBrainsMono-OFL.txt` |

- Both are self-hosted as `woff2` subsets (latin and latin-ext). The OFL allows this, provided the licence text travels with the fonts, so the build ships both OFL files next to them.
- Neither font is renamed or modified, so the Reserved Font Name clause does not apply.

## Code

| Library | Licence | Use |
|---|---|---|
| three.js 0.180 | MIT | 3D |
| GSAP 3.15 (with CustomEase) | GSAP Standard "no charge" licence (gsap.com/standard-license) | motion |
| Lenis 1.3 | MIT | smooth wheel scrolling |
| Next.js, React | MIT | the site |

## Chess and data

- **Engine, search and learned evaluator:** written by Anas Qumhiyeh.
- **Handcrafted evaluation:** the PeSTO piece-square tables by Ronald Friederich, credited wherever they are shown.
- **Training labels:** public Stockfish evaluations from the Lichess evaluation database (CC0). No Stockfish network weights are used.
- **The seven master games on the role tables:** historical game scores (public domain), selected from TheChessWorld's "15 Best Chess Games of All Time" and verified move by move in the kept engine.

## 3D, imagery and sound

- **Every 3D model, material, environment map and render:** made for this site (procedural: lathe-turned pieces, rounded boxes, drawn grain textures). There are no third-party models or HDRIs.
- **Project covers:** made from the projects' own screenshots, presented in 3D.
- **Sound cues:** synthesized for this site (`design/assets/sound/make_sounds.py`). There are no samples.
