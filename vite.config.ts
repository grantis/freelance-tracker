import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true
  },
  server: {
    port: 5000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@db': resolve(__dirname, './server/db')
    }
  }
});
