import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: Object.fromEntries(
      ['/api', '/auth', '/users', '/applications', '/dashboard', '/uploads'].map((path) => [
        path,
        process.env.API_PROXY_TARGET || 'http://127.0.0.1:8010',
      ]),
    ),
  },
})
