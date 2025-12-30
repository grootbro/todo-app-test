# Angular Todo App — E2E Тесты

Тестовый фреймворк на Playwright для Angular Todo App.

**Обновлено:** 31.12.2025

## Быстрый старт

```bash
# Установка зависимостей
pnpm install

# Установка браузеров Playwright
pnpm run install-browsers

# Запуск тестов (по умолчанию против GitHub Pages)
pnpm test
```

**Конфигурация:**
- По умолчанию тесты используют GitHub Pages: `https://eliasfeijo.github.io/angular-todo-app/`
- Для локального тестирования: `BASE_URL=http://localhost:4200 pnpm test`

## Структура проекта

```
├── docs/
│   ├── TEST_PLAN.md           # Тест-план (51 кейс, 405 автотестов)
│   ├── TEST_CASES.md          # Детальные тест-кейсы
│   ├── BUG_REPORTS.md         # Найденные баги (12 шт.)
│   ├── QA_STRATEGY.md         # Стратегия QA, CI/CD, метрики
│   └── RUNNING_TESTS.md       # Инструкция для разработчиков
├── tests/
│   ├── pages/
│   │   └── todo.page.ts       # Page Object
│   ├── fixtures/
│   │   └── todo.fixture.ts    # Test fixtures
│   ├── todo-smoke.spec.ts     # Smoke тесты (5)
│   ├── todo-crud.spec.ts      # CRUD операции
│   ├── todo-filter.spec.ts.skip # Фильтрация (не реализовано в приложении)
│   ├── todo-api.spec.ts       # API через UI
│   ├── api-todos.spec.ts      # Чистые API тесты (18)
│   ├── todo-visual.spec.ts    # Visual regression
│   ├── todo-a11y.spec.ts      # Accessibility
│   ├── inspect-dom.spec.ts    # Диагностика DOM
│   └── inspect-loaded.spec.ts # Диагностика загрузки
├── .gitignore                 # Игнорируемые файлы
├── playwright.config.ts       # Конфигурация Playwright
├── package.json               # Зависимости и скрипты
├── pnpm-lock.yaml             # Lock-файл (используем pnpm)
└── README.md                  # Этот файл
```

## Команды запуска

| Команда | Описание |
|---------|----------|
| `pnpm test` | Все тесты в Chrome (против GitHub Pages) |
| `pnpm run test:smoke` | Только smoke тесты (быстро) |
| `pnpm run test:all` | Все браузеры + мобильная эмуляция (5 проектов) |
| `pnpm run test:api` | Только API тесты (без UI, быстро) |
| `pnpm run test:visual` | Visual regression тесты |
| `pnpm run test:visual:update` | Обновить baseline скриншоты |
| `pnpm run test:a11y` | Accessibility тесты (WCAG) |
| `pnpm run test:headed` | С видимым браузером |
| `pnpm run test:debug` | Режим отладки |
| `pnpm run test:ui` | UI-режим Playwright |
| `pnpm run test:local` | Все тесты против localhost:4200 |
| `pnpm run test:local:smoke` | Smoke тесты против localhost:4200 |
| `pnpm run test:local:headed` | С видимым браузером против localhost:4200 |
| `pnpm run report` | Открыть HTML-отчёт |
| `pnpm run report:allure` | Сгенерировать Allure отчёт |

**Браузеры (5 проектов):** Chrome, Firefox, Safari (WebKit), Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)

## Тестирование локальной версии

**По умолчанию тесты используют GitHub Pages:** `https://eliasfeijo.github.io/angular-todo-app/`

Для тестирования локальной версии:

```bash
# Использовать локальное приложение на localhost:4200
pnpm run test:local

# Или через переменную окружения
BASE_URL=http://localhost:4200 pnpm test
```

**Ручной запуск приложения (опционально):**
Если хотите запустить приложение вручную для отладки:
```bash
cd app
npm install
npm start  # приложение на localhost:4200
```

## Архитектура

### Page Object Pattern

Используется для инкапсуляции работы со страницей. Все селекторы и действия в одном месте — легко поддерживать при изменении UI.

```typescript
// Пример использования
const todoPage = new TodoPage(page);
await todoPage.goto();
await todoPage.addTodo('Купить молоко');
await todoPage.toggleTodo(todoPage.getTodoByIndex(0));
```

### Почему Playwright?

- Современный, активно развивается
- Автоматические waits — меньше flaky тестов
- Встроенные инструменты: trace viewer, codegen, UI mode
- Кроссбраузерность из коробки
- Отличная работа с SPA (Angular, React)

## Адаптация под реальное приложение

Page Object использует гибкие селекторы, но скорее всего потребуется адаптация:

1. Откройте приложение в браузере
2. Изучите структуру DOM через DevTools
3. Обновите селекторы в `tests/pages/todo.page.ts`

Рекомендую добавить `data-testid` атрибуты в приложение для стабильных селекторов.

## CI/CD интеграция

Пример для GitHub Actions есть в `docs/QA_STRATEGY.md`.

Минимальный workflow:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
- uses: pnpm/action-setup@v2
- run: pnpm install
- run: pnpm exec playwright install --with-deps chromium
- run: pnpm test
```

## Известные особенности

JSONPlaceholder API имеет специфику:
- Данные не сохраняются между сессиями
- POST всегда возвращает `id: 201`
- PUT/DELETE работают с любыми ID

Это учтено в тестах.

## Отчёты

После запуска тестов:

```bash
pnpm run report
```

Откроется HTML-отчёт со скриншотами и трейсами упавших тестов.

## Реализовано

- [x] Allure отчёты (`pnpm run report:allure`)
- [x] Visual regression тесты (`pnpm run test:visual`)
- [x] Accessibility тесты с axe-core (`pnpm run test:a11y`)
- [x] API тесты отдельно от UI (`pnpm run test:api`)
- [x] Базовые тесты производительности (в api-todos.spec.ts)
- [x] Мобильная эмуляция (Pixel 5, iPhone 12) в playwright.config.ts

## Возможные улучшения

- [ ] Интеграция с TestRail/Qase
- [ ] Тесты на реальных мобильных устройствах (сейчас эмуляция)
- [ ] Performance тесты с Lighthouse
- [ ] Contract testing (если появится свой бэкенд)
