import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    plugins: [react()],
    // Removed 'define' block that was injecting process.env.API_KEY into the browser bundle.
    // This ensures that even if an API_KEY exists in the environment, it stays on the server.
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});