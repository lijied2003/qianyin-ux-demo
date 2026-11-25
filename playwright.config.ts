import { defineConfig } from '@playwright/test'
export default defineConfig({ testDir: './tests', use: { channel: 'chrome', baseURL: 'http://127.0.0.1:5173', viewport: { width: 1535, height: 850 } }, webServer: { command: 'npm run dev -- --port 5173 --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI }, reporter: 'list' })
