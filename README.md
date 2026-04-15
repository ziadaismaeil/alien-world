# Alien World

**A 3D alien city explorer where seven extraterrestrial characters each transform Weimar into their own surreal reality.**

---

## Author & course

**Author:** Ziad  
**Studio:** Prompt City - Urban Vision Wolfsburg 2026  
**Course:** IUDD Master, SoSe 2026  
**Chair:** Informatics in Architecture and Urbanism (InfAU), Faculty of Architecture and Urbanism, Bauhaus-Universität Weimar  
**Teaching staff:** Reinhard König, Martin Bielik, Sven Schneider, Egor Gaydukov, Egor Gavrilov  
**Exercise:** Urban Absurdities (Nonsense Project)  
**Submission date:** 2026-04-16

---

## Links

- **Live app (GitHub Pages):** https://ziadaismaeil.github.io/alien-world/
- **Source repo:** https://github.com/ziadaismaeil/alien-world
- **Miro frame:** https://miro.com/app/board/uXjVGCtKivA=/?moveToWidget=[your-frame-id]
- **60 s showreel:** embedded on the Miro frame above

---

## The task

Nonsense Project is a two-weeks long task designed to get familiar with application of coding agents in building apps, tools and projects that investigate unique ways of working with urban context. I was randomly assigned one urban paradox and one constraint from the studio's Nonsense Ideas deck and built a working web app that answers this combination. The process is documented here and in a 60-second showreel.

---

## Theme & constraint

**Theme (Urban Absurdity):** People experience the same city as multiple overlapping realities  
**Constraint (Playful Limitation):** Every element of your project must be capable of being reinterpreted in multiple ways

---

## Concept and User Story

### Concept

Alien World is built on the premise that a city is not one place — it is as many places as there are beings moving through it. The app takes the fixed, GPS-accurate streets and buildings of Weimar and runs them through seven radically different perceptual filters, one for each alien character. The same Marktplatz is a volcanic hellscape to Thrak, a crystalline lattice to Zyrax, a meat-scented maze to Morra. Every single element in the scene — the sky, the fog, the road colour, the building palette, the roof shapes, the trees, the particle field, the movement speed — is designed to carry a different meaning depending on who is looking. This is the constraint made literal: nothing in the world has a fixed reading. The graffiti on a wall is authoritarian intimidation to one character and emotional wreckage to another. A cobblestone street is texture to most and an almost impassable barrier to Solen. The city does not change. The reality layered over it does, completely, every time you switch character.

### User Story

Lena is a 34-year-old social worker in Weimar. She was born here, knows every street, and has never once thought of the city as strange. One evening a colleague shows her Alien World on a laptop between shifts. She sits down for five minutes and stays for forty. She plays as Solen first — the wheelchair user — and suddenly the route she walks every day without thinking becomes a sequence of obstacles, slowdowns, and near-blockages. She has never noticed how many cobblestones there are between the Markt and the theatre. She switches to Thrak, the disgraced cop, and the same streets fill with authoritarian graffiti and a paranoid red sky. She laughs when he starts crying at his own tags. Then she picks Niko, the child, and the city feels wide and fast and slightly threatening — a ghost parent orbiting her the whole time. By the end she is not thinking about aliens. She is thinking about her clients: the elderly man who finds the Markt overwhelming on market day, the teenager who experiences the same park as exciting where her colleague sees it as unsafe, the refugee family for whom the same bureaucratic building reads as threat rather than help. The app does not explain any of this. It just makes it impossible to keep assuming that what you see is what everyone sees. Lena sends the link to her whole team.

---

## How to use it

1. Open the live app — you land on a dark loading screen labelled **CALIBRATING REALITIES**.
2. The character selection panel appears. Click any of the seven alien portraits to enter the city as that character.
3. Use **W / S** to move forward / backward, **A / D** to rotate left / right.
4. Press **C** to toggle between orbit camera (drag to look around) and third-person follow camera.
5. Each character transforms the entire world — sky, fog, buildings, roofs, trees, particles, and behaviour. Switch characters to compare.
6. **Thrak** (the cop): walk near any yellow graffiti on the buildings to trigger his 5-second breakdown.
7. **Morra** (the dog): walk near the glowing meat-smell zones — she will bolt from her owner's leash.
8. **Solen** (wheelchair user): notice how speed changes on cobblestone, kerbs, and steps vs. smooth sidewalks.
9. **Niko** (the kid): the hovering parent ghost orbits you at all times — look around in orbit mode to spot it.

---

## Technical implementation

**Frontend:** Vanilla JavaScript (ES modules) + Vite + Three.js  
**Hosting & build:** GitHub Pages — push to `master`, deploy manually or via gh-pages  
**Data sources / APIs:** OpenStreetMap (Overpass API) — building footprints converted to GPS-formula coordinates; no runtime API calls  
**Models at runtime:** None  
**Notable libraries:** Three.js 0.168, Vite 5.4

**Run locally:**
```bash
npm install
npm run dev
# open http://localhost:5173
```

---

## Working with AI

**Coding agents used:** Claude Code, model `claude-sonnet-4-6`

**Key prompts that actually moved the project:**

> "rebuild world with accurate Weimar geography (GPS-derived) — use OSM Overpass API coordinates, formula: cx = (lon − 11.3298) × 7007, cz = (50.9794 − lat) × 11132"

> "add rich interiors to the VEX buildings — bookshelves, desks, chairs — visible when the player enters through the door"

> "add AABB collision detection so the player can no longer walk through buildings"

> "everytime thrak passes next to graffiti, let him cry and whine for 5 seconds while walking — tear drops, head shake, HUD overlay"

> "place graffiti on some of the buildings in the world of Thrak — bright yellow glowing, drawn directly on the building walls"

**Reflection:** Claude Code was fastest when given explicit coordinate formulas and concrete visual descriptions rather than abstract goals. The agent got stuck when multiple systems interacted unexpectedly — for example, the emissive graffiti map conflicting with the building's own material during theme transitions. The biggest unlock was describing behaviours as small self-contained stories ("Thrak cries for 5 seconds, arms fly up, tears drip") rather than as technical specs. Next time I would establish the character-theme architecture earlier so new characters slot in cleanly without touching existing ones.

---

## Credits, assets, licenses

**Fonts:** System fonts only (Arial Black, Impact) — no external font files  
**Data:** OpenStreetMap contributors, ODbL 1.0 — building footprints and street layout  
**Images / sounds:** None  
**Third-party code:** Three.js (MIT), Vite (MIT)  
**This repo:** MIT
