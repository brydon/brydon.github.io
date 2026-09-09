# The bookshelf cube

A small scrambled cube sits on the top book row of the left-wall bookcase. Pick it up to open a real 3×3 puzzle, then put it back with the close button or Escape. Its state stays in memory and appears on the shelf, including when solved; reloading the page starts a fresh puzzle.

Drag to orbit, click or tap a visible face to turn clockwise, and Shift-click to reverse. The buttons and U/R/F/D/L/B keys turn fixed faces, independently of the viewing angle. Shift reverses keyboard turns; Z undoes. Arrow keys orbit. A labelled sticker map exposes every face without relying on colour alone. Practice starts solved without triggering a win; Scramble applies 24 legal moves.

The face convention follows [WCA notation](https://www.worldcubeassociation.org/regulations/#article-12-notation), with clockwise viewed from outside that face. Each of the 26 pieces stores its exact integer position and sticker normals. The renderer groups nine pieces temporarily for each animated turn, then rebuilds from the canonical state, avoiding numerical drift. Closing or hiding the page finishes an accepted turn exactly once and pauses the timer and puzzle rendering.

The game renderer loads on first pickup and is reused on subsequent openings. It uses the existing vendored Three.js module; no new dependency, network asset, or backend is needed. Automated checks cover sticker inventory, move directions, inverse moves, known move identities, legal scrambles, session history, and interrupted animations.
