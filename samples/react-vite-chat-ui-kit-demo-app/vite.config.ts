import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      quickblox: 'quickblox/quickblox.min.js',
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 5173,
  },
});
