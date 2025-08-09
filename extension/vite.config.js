import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.js'),
        sidebar: resolve(__dirname, 'src/sidebar.js'),
        tools: resolve(__dirname, 'src/tools.js')
      },
      output: {
        entryFileNames: '[name].js'  // ✅ No /assets prefix
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public'  // ✅ Will copy sidebar.html and manifest.json as-is
});

