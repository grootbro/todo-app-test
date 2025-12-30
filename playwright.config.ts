import { defineConfig, devices } from '@playwright/test';

/**
 * Конфигурация Playwright для Angular Todo App
 * 
 * Запуск:
 *   npm test              - все тесты (Chrome)
 *   npm run test:smoke    - только smoke
 *   npm run test:all      - все браузеры
 */
export default defineConfig({
  testDir: './tests',
  
  /* Таймауты */
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  /* Параллельный запуск */
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  
  /* Запрет test.only в CI */
  forbidOnly: !!process.env.CI,

  /* Retry при падении */
  retries: process.env.CI ? 2 : 0,

  /* Репортеры */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { 
      outputFolder: 'allure-results',
      suiteTitle: true,
    }],
  ],

  /* Папка для скриншотов visual regression */
  snapshotDir: './tests/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}{ext}',

  /* Общие настройки */
  use: {
    // Используем GitHub Pages по умолчанию
    // Можно переопределить через переменную окружения BASE_URL
    baseURL: process.env.BASE_URL || 'https://eliasfeijo.github.io/angular-todo-app/',
    
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  /* Проекты */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Локальный сервер отключен - используем GitHub Pages */
  // Для локального тестирования раскомментируйте и используйте BASE_URL=http://localhost:4200
  // webServer: {
  //   command: 'npx http-server app/docs -p 4200 -c-1 --cors',
  //   url: 'http://localhost:4200',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 30_000,
  // },
});
