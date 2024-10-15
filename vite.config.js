import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/check-link': 'http://localhost:3000'
    }
  }
})