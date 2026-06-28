import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This tells Vite to intercept any API calls and forward them to your Express server
      '/api': {
        target: 'http://localhost:5000', // 👈 Change 5000 to your backend port if it's different (e.g., 3000 or 8000)
        changeOrigin: true,
        secure: false,
      },
    },
  },
});