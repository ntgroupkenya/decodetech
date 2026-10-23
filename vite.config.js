import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // PHP API: `npm run api` (XAMPP's PHP + MySQL). Override with VITE_DEV_API_TARGET if using Apache.
  const target = env.VITE_DEV_API_TARGET || 'http://localhost:8080'
  return {
    plugins: [react()],
    cacheDir: env.VITE_CACHE_DIR || undefined,
    server: {
      proxy: {
        '/api': target,
        '/uploads': target,
      },
    },
  }
})
