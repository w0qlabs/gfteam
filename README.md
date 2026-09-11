# GFTeam Avaré

Custom Portuguese academy website built with Vite, semantic HTML, CSS and GSAP. The original GFTeam photography, academy content and Brazilian brand palette are preserved.

## Run locally

```sh
npm install
npm run dev
```

On PowerShell systems that block unsigned npm scripts, use `npm.cmd`.

```sh
npm run build
npm run preview
```

The production site is generated in `dist/`. The Vite base is relative, supporting static hosting beneath a subdirectory.

## VS Code Live Preview

The root `index.html` also works at `http://127.0.0.1:3000/index.html?vscode-livepreview=true`. It loads the compiled JavaScript and CSS from `dist/assets/` and the images from `public/images/`, so the extension does not need to resolve npm imports.

Run `npm run build` before opening Live Preview. When editing JavaScript or CSS while using the extension, keep `npm run build:watch` running to refresh those compiled files. With `npm run dev`, Vite automatically uses the source entry and hot reload instead. Publish the contents of `dist/` for deployment.

## Interactions

- Pull the hero belt down at least 40 pixels to advance one rank per gesture: white → blue → purple → brown → black → white. Upward pulls do not change rank, and longer pulls cannot skip ranks. Release before pulling again, or choose a colored button. The selected rank persists while the cloth springs back.
- Keyboard: focus the belt and use arrows; Home selects white, End selects black. Enter cycles. The rank buttons also work with standard Tab/Enter/Space.
- The technique sequence follows desktop/tablet scrolling. “Ver técnica” plays the complete sequence; numbered controls select a stage. Explicit choices take precedence until the visitor scrolls again.
- Each replay draws a stylized finish: chave de braço, triângulo or mata-leão. A shuffled bag covers all three before repeating and prevents consecutive identical finishes. The final caption names the selected finish. Reduced-motion visitors can also start a new variation after the final stage.
- Reduced motion disables the spring and automatic motion; “Próxima etapa” and stage buttons expose the sequence without animation.
- Mobile navigation uses a native modal dialog with contained focus and Escape support.

## Content and assets

`PRODUCT.md` records source facts and contact data. `DESIGN.md` records the visual system. Original images remain in `public/images/`; responsive WebP derivatives are generated with:

```sh
npm run images:optimize
```

`hero`, `cesinha`, `cesinha-julio` and the official logo are original repository assets. No stock professors or generated academy photography are used. Fonts and Phosphor SVG icons are served locally.

## Browser verification

Start the production preview on port 4173, then use the Playwright CLI:

```sh
npx --yes --package @playwright/cli playwright-cli -s=gfteam open http://127.0.0.1:4173/
npx --yes --package @playwright/cli playwright-cli -s=gfteam run-code --filename=output/playwright/inspect.cjs
npx --yes --package @playwright/cli playwright-cli -s=gfteam run-code --filename=output/playwright/accessibility.cjs
npx --yes --package @playwright/cli playwright-cli -s=gfteam run-code --filename=output/playwright/final-check.cjs
```

`output/playwright/preview-compatibility.cjs` verifies the VS Code Live Preview URL, Vite development, Vite production preview and static serving of `dist/index.html`, including image/font/icon loading and actual belt/technique animation.

Scripts return named pass/fail results and produce local screenshots in `output/playwright/`. The matrix covers 1440, 1280, 768, 390 and 320px, keyboard/mouse/touch belt input, technique stages, reduced motion, menu focus, CTA destination and axe WCAG A/AA checks. CTA testing intercepts WhatsApp navigation; no message is sent.

Schedules are the opening hours supplied in the previous repository, with class times requested directly from the academy. No current external timetable, promotion or price is inferred.
