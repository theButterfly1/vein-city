import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the build works from any sub-path:
// itch.io, CrazyGames, GitHub Pages, Capacitor (Android), Electron/Tauri (PC)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 8192,
    chunkSizeWarningLimit: 1200
  }
});
