import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.PAGES ? '/potok-site/' : '/',
  define: { 'import.meta.env.PAGES': JSON.stringify(!!process.env.PAGES) },
})
