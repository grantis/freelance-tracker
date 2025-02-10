import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    ssr: resolve(__dirname, 'server/index.ts'),
    outDir: 'dist/server',
    target: 'node',
    rollupOptions: {
      external: [
        'express',
        'dotenv',
        // Add other Node.js dependencies here
      ]
    }
  },
  publicDir: false
}); 