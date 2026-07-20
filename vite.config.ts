import { execSync } from 'child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

let sha = 'dev'
try {
  sha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
} catch {
  // not a git repo or git unavailable — use fallback
}

const repoName = 'english-learner-app'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? `/${repoName}/` : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'English Vocabulary Trainer',
        short_name: 'VocabTrainer',
        description: 'Learn English words with a playful interface',
        theme_color: '#674bb5',
        background_color: '#fef7ff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: `/${repoName}/`,
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  define: {
    __COMMIT_SHA__: JSON.stringify(sha),
  },
  server: {
    port: 3000,
    open: true,
  },
}))
