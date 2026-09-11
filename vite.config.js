import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [{
    name: 'static-preview-entry',
    // The checked-in HTML also runs in VS Code Live Preview after a build.
    // Vite itself uses the source entry, HMR and its public-directory mapping.
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace(/<link\b[^>]*data-static-preview[^>]*>/g, '')
          .replace('./dist/assets/site.js', '/src/main.js')
          .replaceAll('./public/images/', '/images/');
      },
    },
  }],
  build: {
    target: 'es2020',
    rolldownOptions: {
      output: {
        entryFileNames: 'assets/site.js',
        assetFileNames: asset => asset.names?.some(name => name.endsWith('.css'))
          ? 'assets/site.css'
          : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
