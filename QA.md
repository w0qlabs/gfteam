# GFTeam redesign verification

Verified locally in Chromium through the official Playwright CLI against the production preview on 11 September 2026.

## Results

- `npm run build`: pass. Production JS 123.09 kB / 48.42 kB gzip; CSS 31.29 kB / 7.29 kB gzip.
- 1440×1000 desktop, 1280×900 laptop, 768×1024 tablet, 390×844 mobile and 320px small mobile: no horizontal document or element overflow; all images decoded successfully.
- 35 browser checks passed: all five ranks by keyboard, all four drag thresholds, elastic return, direct rank selection, four explicit technique stages, full replay, FAQ, contact links, menu opening/closing/navigation, Escape focus restoration, reduced-motion interaction and no JavaScript page errors.
- Additional checks passed: native Chromium touch input reaches blue/purple/brown/black; scroll progresses the conceptual sequence through 01/02/03/04; WhatsApp CTA opens the preserved number in a new tab. The destination was intercepted, and no message was sent.
- All five belt captions maintain separation from the hint at 390 and 320px. Settled screenshots confirm the black rank and no cloth/text collision.
- axe WCAG 2 A/AA and 2.1 AA: zero detected violations at 1440, 768, 390 and 320px on the corrected final palette.

## Refinement evidence

The independent Impeccable review requested mobile hint separation, a more visible source green, removal of heading eyebrows, and verification of the first technique stage. The implementation now reserves a stable mobile caption position, uses #009246 for the contact surface, places professor metadata below the name and gives explicit stage selections priority over automatic scroll updates. SVG neck connections were also added. The reviewer inspected the refreshed evidence and returned **ship**, scoring all five original findings resolved.

The source-green contact surface initially exposed insufficient yellow-headline contrast (2.67:1). The highlighted word now uses the original light background color; yellow remains on the dark-text CTA. The final axe run passes.

Impeccable's static detector returned one external-stylesheet false positive for flat type hierarchy. Actual computed h1 sizes range from 39px to 96px versus 15px base body type. The rendered result has distinct display, heading, body and utility roles.

Taste review: custom light editorial composition with a physical belt bay; no stock professor photos, generic feature-card grid, artificial statistics, generated testimonial, custom cursor, marquee or unrelated dominant palette. Functional rank/technique numbers represent real ordered sequences. User-required belt colors and authentic imagery override generic skill defaults. Motion motivates progression, feedback and one restrained entrance.

## Artifacts and limits

## Social icons, footer and randomized finishes

Added Instagram, Facebook and YouTube icons beside their labels and reduced the footer wordmark. Browser checks at 1440, 390 and 320px confirmed loaded icon masks and no horizontal overflow. Six complete animation replays exercised armbar, triangle and rear choke with no consecutive repeated finish; SVG coordinates changed during playback. Reduced-motion controls selected another finish and reset to the first stage. Playback also completed on the user's exact Live Preview URL with no page errors. Screenshots and the repeatable check are in `output/playwright/finish-variants.cjs` and adjacent PNG artifacts.

## VS Code Live Preview compatibility fix

The user's actual URL was `http://127.0.0.1:3000/index.html?vscode-livepreview=true`. Reproduced missing `/images/` files, unresolved Phosphor asset URLs and a browser error resolving the bare Fontsource module import. This static server does not perform Vite transforms.

Root HTML now references real `public/images/` files and compiled `dist/assets/site.js` / `site.css`. A Vite HTML transform restores the source entry and public-directory URLs for development and production builds. Verified loaded photographs, fonts, styles and icons with no failed requests or page errors on Live Preview, Vite development, production preview, and static `dist/index.html`. Live Preview also passed keyboard/drag rank changes, actual cloth displacement and spring return, and mobile menu operation. A focused playback check measured changing SVG coordinates and completion of the final technique stage on the exact user URL.

The compatibility check waits for the final animation state instead of assuming exactly 5.4 seconds of wall-clock time, accommodating browser frame throttling. Rebuild with `npm run build`, or use `npm run build:watch`, when changing source styles/scripts in Live Preview.

Screenshots and repeatable browser scripts are in `output/playwright/`. `README.md` documents how to repeat the checks. Screenshots are local review artifacts and excluded from git.

Validation used Chromium and emulated viewports/touch, not physical phones or separate Safari/Firefox runs. Automated accessibility checks are supplemented by focus/keyboard checks but are not a full assistive-technology audit. No field Core Web Vitals or universal 60fps claim is made. No external schedule or pricing was invented or independently reconfirmed. Deployment is not part of this implementation.
