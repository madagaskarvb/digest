// Убираем /// <reference types="vitest" />, он больше не нужен
import { defineConfig } from 'vitest/config' // <-- Изменено здесь!
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/digest/', 
  test: {
    environment: 'jsdom',
    globals: true,
  },
})