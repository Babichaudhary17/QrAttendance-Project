import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Brave browser path on Windows
const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: BRAVE_PATH,
  },
})