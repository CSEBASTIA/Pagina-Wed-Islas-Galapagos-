import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Las cabeceras de seguridad se definen una sola vez en vercel.json; `npm start`
// (vite preview) usa las mismas para poder probarlas en local.
const vercel = JSON.parse(fs.readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'));
const securityHeaders = Object.fromEntries(
  vercel.headers.find((rule) => rule.source === '/(.*)').headers
    .filter((header) => header.key !== 'Strict-Transport-Security')
    .map((header) => [header.key, header.value.replace(/; upgrade-insecure-requests$/, '')]),
);

export default defineConfig({
  plugins: [react()],
  publicDir: 'assets',
  server: { port: 5173 },
  preview: { port: 3001, headers: securityHeaders },
  build: {
    rollupOptions: {
      // Nombres sin pistas: los archivos compilados no revelan qué contienen.
      output: { chunkFileNames: 'assets/[hash].js', entryFileNames: 'assets/[hash].js', assetFileNames: 'assets/[hash][extname]' },
    },
  },
});
