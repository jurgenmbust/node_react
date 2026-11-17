import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// This configuration forwards API requests to the Node server.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: { '/api': `http://127.0.0.1:${env.PORT || 3001}` },
    },
  };
});
