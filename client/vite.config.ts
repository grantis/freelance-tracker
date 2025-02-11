import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist/client',
    emptyOutDir: true
  },
  server: {
    port: 5000
  },
  resolve: {
    alias: {
        "@": resolve(__dirname, "src"),
      },
  }
});