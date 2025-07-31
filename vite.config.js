import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/curse-vue/', // 👈 clave para GitHub Pages
  plugins: [vue()]
})
