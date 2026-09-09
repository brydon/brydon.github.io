# Scene assets and reference artwork

The landing scene uses modeled 3D assets throughout. `js/cabin-models.mjs` builds Brydon, the black 2015 Iron 883, helmet and resting dog. `js/cabin-interior.mjs` builds the bookshelf, hearth, rug and furnishings; `js/cabin-scene.mjs` builds the cabin and landscape. Book lettering, equations and the tank badge are textures on model surfaces. The computer screen is real HTML.

Earlier generated pixel artwork guided the models: Brydon's glasses, brown hair and beard, green plaid, jeans and boots; the Iron's peanut tank, V-twin, mag wheels and twin chrome pipes; and the cabin's warm workshop atmosphere. Those images are not loaded as scene subjects.

The approved transparent rider and standing artwork remain outside the repository, in this task's visualization folder under `sprites/`. Their original foreground pixels were preserved by the explicitly approved local background-removal script. Generated source artwork also remains in the user's Codex generated-images folder.

`images/switchback/valley.png` is the earlier generated pixel valley, used only as a decorative header on the separate reading pages. It is not part of the 3D scene. The original portrait and research images remain with their reading content.

Three.js and CSS3DRenderer are pinned build dependencies; their license is copied into `js/vendor/THREE-LICENSE.txt`. No models or textures were extracted from the reference portfolio sites.

The Sri Lankan desk flag uses vector shapes extruded into thin meshes from [Flag of Sri Lanka.svg](https://commons.wikimedia.org/wiki/File:Flag_of_Sri_Lanka.svg), attributed on Commons to Sri Lanka, with vectorization by Zscout370 and Mike Rohsopht, and marked public domain. The Canadian flag is authored mesh geometry. Three.js SVGLoader is copied with the same dependency license.
