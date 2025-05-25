import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    cors: true,
    hmr: {
      overlay: true,
    }
  },
  build: {
    sourcemap: true,
  },
})
