import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le base doit correspondre au nom du repo GitHub pour que Pages serve
// correctement les assets (ex: /vls2-site/). À adapter si le repo change de nom.
export default defineConfig({
  plugins: [react()],
  base: '/vls2-site/',
})
