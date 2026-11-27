// PM2 — Sofubo backend (AdonisJS 6).
// Build: pnpm install && pnpm build   → build/bin/server.js
// Variables provided by Koya at launch (nothing here, see .env.example):
//   PORT, HOST, APP_KEY, NODE_ENV=production, LOG_LEVEL=info, SESSION_DRIVER=cookie,
//   DISPLAY_TOKEN, ADMIN_PASSWORD, [PHOTOS_DIR], [COOKIE_SECURE]
// Data outside git, to back up, never touched by CI/CD: storage/photos/
module.exports = {
  apps: [
    {
      name: 'sofubo-backend',
      cwd: '.',
      script: 'build/bin/server.js',
      instances: 1,
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
    },
  ],
}
