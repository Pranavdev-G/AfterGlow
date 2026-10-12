import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const apiPort = process.env.API_PORT || '5000';
const strictPort = Boolean(process.env.PORT || process.env.MANUS_PREVIEW === 'true');
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: '0.0.0.0', strictPort, proxy: { '/api': { target: `http://127.0.0.1:${apiPort}`, changeOrigin: true } } },
  preview: { host: '0.0.0.0', strictPort: true },
});
