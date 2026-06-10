import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Zurullo-World-Cup-2026/', // Cambiar por el nombre exacto del repositorio en GitHub
})
