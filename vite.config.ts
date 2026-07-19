import { execSync } from 'child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

let sha = 'dev'
try {
  sha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
} catch {
  // not a git repo or git unavailable — use fallback
}

export default defineConfig({
  plugins: [react()],
  define: {
    __COMMIT_SHA__: JSON.stringify(sha),
  },
  server: {
    port: 3000,
    open: true,
  },
})
