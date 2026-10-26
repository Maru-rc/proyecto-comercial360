import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      // En desarrollo /api va al backend NestJS. Al ser el mismo origen que la
      // app, el navegador guarda y envía la cookie de sesión de Better Auth.
      proxy: {
        '/api': env.VITE_PROXY_TARGET || 'http://localhost:3001',
      },
    },
  }
})
