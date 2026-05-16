import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Pedidos do browser a `/api/*` (ex.: `<video src="/api/media/videos/...">`) seguem para o Kestrel.
      "/api": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
