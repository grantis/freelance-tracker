import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // Client build configuration
    outDir: 'dist/client',
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  },
  server: {
    port: 5000
  }
});
