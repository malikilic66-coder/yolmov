import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // SPA routing için tüm 404'leri index.html'e yönlendir
    historyApiFallback: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})