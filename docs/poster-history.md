# The posters by the hearth

Five clicks within a rolling three-second window loosen the current frame. Slower
clicks wobble it around its top hook. The next poster is visible during the fall
but cannot be clicked until the old one lands. Each layer starts with no saved
clicks, and holding Enter does not count as repeated taps.

The order is Cohere → Thinking Machines → OpenAI → Minerva AI → University of
Waterloo → McMaster University → Redeemer University → the bare wall. Fallen
frames remain face-up in a small pile. Reloading restores the posters; room visits
do not. There is no visible counter or new hint text. Reduced-motion mode skips
the wobble and fall movement while preserving the sequence and brief input lock.

## Artwork

These are printed textures on 3D frames. They load from the site itself, with no
third-party requests at runtime. Poster layouts were assembled for this personal
portfolio; the organization marks retain their original paths and proportions.
All source material below was retrieved on 2026-09-09.

- **Cohere:** the existing `images/switchback/cohere-poster.svg`, unchanged. Its
  source comment identifies the official Cohere press kit.
- **Thinking Machines:** the exact Inkling grid artwork supplied by Brydon in
  `Screenshot 2026-09-09 at 13.25.53.png`, embedded intact as a PNG. Reference:
  [Inkling](https://thinkingmachines.ai/inkling/). The title is typeset separately.
- **OpenAI:** the standalone Blossom path from the official
  [brand page](https://openai.com/brand/), specifically
  [Blossom_Light.svg](https://images.ctfassets.net/kftzwdyauwt9/3hUGLn3ypllZ0oa01qOYVq/28e8188e6f11b84c3e876569d492734f/Blossom_Light.svg).
  Only the right-hand logo path is used; the presentation guide boxes are omitted.
- **Minerva AI:** the original mark and wordmark from
  [gominerva.com](https://www.gominerva.com/),
  [logo-mark SVG](https://www.gominerva.com/_next/static/media/logo-mark.2j2xu8jguhfqk.svg).
- **Waterloo:** the university site's white shield and wordmark,
  [official SVG](https://uwaterloo.ca/profiles/uw_base_profile/modules/custom/uw_wcms_ohana/dist/images/uwaterloo-logo.svg).
- **McMaster:** the university site's supplied square brand artwork, embedded
  intact, [official PNG](https://www.mcmaster.ca/wp-content/uploads/2025/10/Profile-Image_Socials_MCM_BW-Maroon_Logo_800x800.png).
- **Redeemer:** the university site's original full-color shield and white
  wordmark, [official SVG](https://www.redeemer.ca/wp-content/themes/redeemer/images/redeemer-logo.svg).

## Verification

`tests/posters.test.mjs` covers click expiry, fall locking, every reveal in order,
reduced motion, the moving hit area, the final empty wall, and settled frame
geometry. Run `pnpm build` and `pnpm check` before publishing.
