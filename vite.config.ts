import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// v2 운영 포트: 8082 (v1과 동일 호스트에서 동시 운영). dev: 5174, preview: 8082.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
  preview: {
    port: 8082,
    host: true,
  },
});
