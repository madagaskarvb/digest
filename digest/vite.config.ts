import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Замените 'digest' на точное имя вашего репозитория на GitHub!
  base: '/digest/', 
})