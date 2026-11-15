import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        -> folder dist/ (untuk hosting: GitHub Pages / Netlify)
// `npm run build:single` -> dist-single/index.html (satu file, bisa dibuka langsung)
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    plugins: single ? [viteSingleFile()] : [],
    build: {
      target: 'esnext',
      outDir: single ? 'dist-single' : 'dist',
      chunkSizeWarningLimit: 1500,
    },
  };
});
