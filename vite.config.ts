import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    minify: 'terser',
    target: 'ES6',
    emptyOutDir: true,
    rollupOptions: {
      treeshake: true,
    },
  },
})
