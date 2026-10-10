# Profile artwork

The original desk, phone, plant and sketchbook drawings use the Personal room palette and Schoolbell lettering from [Flavius design taste](https://github.com/flvvius/flavius-design-taste). Lettering is converted to SVG paths so GitHub does not need to load a font. The artwork stays still and has no scripts or external resources.

`sources/miez-live.png` is the public production screenshot captured on 9 October 2026 for the design-taste repo. The profile preview crops its upper feed and adds a paper surround. Publisher photographs and headlines remain part of the app screenshot.

`sources/pricele-og.jpg` is Pricele's own share artwork, taken from the local Pricele project. It is artwork, not an interface screenshot.

Schoolbell retains its Apache licence and copyright notice in `fonts/`. `DESIGN-TASTE-LICENSE` retains the design-taste repo's MIT notice.

Run `npm ci` and `npm run build` to regenerate the profile assets and a local preview at `.preview/index.html`. Run `npm run test:e2e` to inspect the preview with Chromium. If there is no cached Chromium, run `npx playwright install chromium` first.
