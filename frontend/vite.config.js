import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Match your original CRA port
    open: true, // Auto-open browser
    cors: true
  },
  build: {
    outDir: 'build', // Match CRA build directory
    sourcemap: true
  }
})
