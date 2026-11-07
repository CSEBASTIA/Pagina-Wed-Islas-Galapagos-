import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'assets',
  server: { port: 5173 },
  build: {
    rollupOptions: {
      // Nombres sin pistas: los archivos compilados no revelan qué contienen.
      output: { chunkFileNames: 'assets/[hash].js', entryFileNames: 'assets/[hash].js', assetFileNames: 'assets/[hash][extname]' },
    },
  },
});
