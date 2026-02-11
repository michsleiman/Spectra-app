
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env vars regardless of the `VITE_` prefix.
  // Fix: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" TypeScript error
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Shimming process.env for compatibility with environment-specific code
      // We prioritize VITE_GEMINI_API_KEY but fallback to API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.API_KEY)
    },
    build: {
      rollupOptions: {
        input: {
          main: './index.html',
        },
      },
    },
  };
});
