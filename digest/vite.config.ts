/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Не забудьте, что base нужен для деплоя на GitHub Pages
  base: '/digest/', 
  test: {
    environment: 'jsdom', // <-- Включаем браузерное окружение
    globals: true,        // <-- Позволяет использовать describe/it без импортов (опционально)
  },
})