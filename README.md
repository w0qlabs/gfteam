# GFTeam Avaré

Site institucional estático da GFTeam Avaré, reconstruído com Vite, Vanilla JavaScript e Anime.js. O build usa caminhos relativos (`base: './'`) e pode ser publicado em `/GFTeam-Avar-/` no GitHub Pages.

## Desenvolvimento local

Requer Node.js 20.19+ ou 22.12+.

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

Os arquivos estáticos são gerados em `dist/`. O workflow em `.github/workflows/deploy.yml` publica essa pasta automaticamente quando há push para `main`.

## Estrutura

- `index.html`: conteúdo e estrutura semântica da página.
- `src/styles.css`: tokens, direção visual e responsividade.
- `src/scripts/animations.js`: entrada, reveals, progressão e parallax.
- `src/scripts/navigation.js`: navbar e menu mobile.
- `src/scripts/cursor.js`: cursor e microinterações desktop.
- `public/images/`: imagens originais extraídas do site anterior.
