import { defineConfig } from 'vite'

const port = Number(process.env.PORT) || 5173

export default defineConfig({
  preview: {
    host: '0.0.0.0',
    port,
    allowedHosts: ['.cloudtype.app'],
  },
})
