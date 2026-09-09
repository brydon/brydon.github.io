# Switchback

A fully 3D mountain cabin for Brydon Eastman. Come through the door, look around, and use the real website on the desk computer. A black 2015 Iron 883, green flannel, Canadian flag, sleeping dog, books, climbing gear, equations and a quiet fire make it home.

## Run locally

Use Node 22.16 or newer, Python 3, and the pinned pnpm version in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:8765`. After changing templates or shared reading content, run `node scripts/build.mjs` and refresh. JavaScript, CSS and `desktop.html` changes only need a refresh.

## Interactions

- **Come on in** dismisses the welcome. From then on, click the door to enter or leave. The banner stays dismissed.
- Hold **WASD** or **arrow keys** to look around. On-screen arrow buttons also work.
- Click the physical monitor / **E** to approach it. Its website is real, selectable HTML, with page navigation and a terminal.
- The computer’s **Room** button / **Escape** leaves the monitor. Pan around and click the door to leave the cabin; Escape also works.
- Click objects directly. Outside, Brydon walks to the motorcycle or fire before a discovery opens. Pet the dog for a little response.
- Lighting defaults to the visitor’s local time (daylight 07:00–18:59), with a remembered manual override. Sound is opt-in.
- Reduced motion skips camera travel and disables environmental animation.
- Look closely at the coffee mug, motorcycle and outdoor fire. The old Base64 note and a harder SHA-256 discovery are tucked away.

Every scene subject is geometry, including Brydon, the motorcycle and the dog. The helmet rests on the porch. There are no image cutouts, character sprites, physics or free driving. The approved pixel art was used as reference and remains saved separately for personal use.

## Source

- `js/cabin-scene.mjs` — landscape, cabin shell, desk monitor, lighting and camera.
- `js/cabin-models.mjs` — Brydon, Iron 883, helmet and dog geometry.
- `js/cabin-interior.mjs` — bookshelf, open fireplace, woven rug and furniture.
- `js/cabin-controller.mjs` — navigation, keyboard controls, sound and discoveries.
- `desktop.html`, `js/desktop.mjs`, `styles/desktop.css` — website on the CSS3D monitor iframe.
- `js/puzzles.mjs` — finite terminal commands, Base64 note and SHA-256 verification.
- `templates/home.html` — landing page shell.
- `content/*.html` — full content for the direct reading pages.
- `scripts/build.mjs` — generates static HTML and copies pinned Three.js modules and license.

`pnpm build` creates `dist/`. `pnpm check` runs animation and puzzle tests, HTML validation and local-link checks. Ordinary reading pages work without WebGL or JavaScript. Course resources, PDFs and static demos remain available.

This is a local proof of concept on the isolated `codex/switchback` branch. It has not been published.

The hidden discoveries now include a persistent midnight world, a separate image-only Base64 puzzle and unlisted terminal jokes. The fictional meltdown opens a replacement-shopping search in a new tab and keeps the charred cabin burning until **Rebuild cabin** is selected.
