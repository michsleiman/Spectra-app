import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Shimming process.env for compatibility with environment-specific code
    'process.env': {
      API_KEY: 'import.meta.env.VITE_GEMINI_API_KEY'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});