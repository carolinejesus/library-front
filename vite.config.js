import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: 'dist',   
    minify: 'esbuild', 
    sourcemap: true,  
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
