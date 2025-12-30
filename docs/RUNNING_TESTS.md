# Инструкция по запуску тестов

Краткое руководство для команды разработки.

**Обновлено:** 31.12.2025

## Быстрый старт (2 минуты)

```bash
# 1. Перейти в папку с тестами
cd todo-app-test

# 2. Установить зависимости
pnpm install

# 3. Установить браузеры (один раз)
pnpm run install-browsers

# 4. Запустить тесты (по умолчанию против GitHub Pages)
pnpm test
```

## Команды на каждый день

| Что нужно | Команда |
|-----------|---------|
| Быстрая проверка | `pnpm run test:smoke` |
| Все тесты в Chrome | `pnpm test` |
| Посмотреть тесты в браузере | `pnpm run test:headed` |
| Отладка упавшего теста | `pnpm run test:debug` |
| Открыть отчёт | `pnpm run report` |

## Перед коммитом

Запустите smoke-тесты:

```bash
pnpm run test:smoke
```

Если всё зелёное — можно пушить.

## Перед релизом

Полный прогон на всех браузерах:

```bash
pnpm run test:all
```

Время: ~5-10 минут.

## Тестирование локальной версии

**По умолчанию тесты используют GitHub Pages:** `https://eliasfeijo.github.io/angular-todo-app/`

Для тестирования локальной версии на `localhost:4200`:

**Рекомендуемый способ (через pnpm скрипты):**
```bash
pnpm run test:local              # все тесты
pnpm run test:local:smoke        # только smoke тесты
pnpm run test:local:headed       # с видимым браузером
```

**Альтернативный способ (через переменную окружения):**
```bash
BASE_URL=http://localhost:4200 pnpm test
BASE_URL=http://localhost:4200 pnpm run test:smoke
```

**Важно:** Перед запуском тестов убедитесь, что Angular приложение запущено:
```bash
# В папке с исходным кодом Angular приложения
npm start  # или ng serve
```

## Типы тестов

| Тест | Команда | Что проверяет |
|------|---------|---------------|
| Smoke | `pnpm run test:smoke` | Базовая работа (5 тестов) |
| API | `pnpm run test:api` | Работа с JSONPlaceholder |
| Visual | `pnpm run test:visual` | Скриншоты не изменились |
| A11y | `pnpm run test:a11y` | Доступность (WCAG) |

## Если тест упал

1. Открой отчёт: `pnpm run report`
2. Найди упавший тест
3. Посмотри скриншот и trace
4. Если баг в тесте — поправь
5. Если баг в приложении — создай issue

## Обновление visual скриншотов

После изменения UI:

```bash
pnpm run test:visual:update
```

Проверь diff в git и закоммить новые скриншоты.

## Allure отчёты (красивые)

Установи Allure CLI ([инструкция](https://docs.qameta.io/allure/#_get_started)):

```bash
# macOS
brew install allure

# Или через npm
npm install -g allure-commandline
```

Генерация отчёта:

```bash
pnpm run report:allure
```

## Структура тестов

```
tests/
├── pages/
│   └── todo.page.ts      ← Page Object (все селекторы тут)
├── todo-smoke.spec.ts    ← Smoke тесты
├── todo-crud.spec.ts     ← CRUD операции
├── todo-filter.spec.ts.skip ← Фильтрация (не реализовано)
├── todo-api.spec.ts      ← API через UI
├── api-todos.spec.ts     ← Чистые API тесты
├── todo-visual.spec.ts   ← Visual regression
└── todo-a11y.spec.ts     ← Accessibility
```

## Добавление нового теста

1. Открой подходящий файл (или создай новый)
2. Используй `TodoPage` для взаимодействия со страницей
3. Запусти локально: `pnpm run test:debug`

Пример:

```typescript
import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/todo.page';

test('мой новый тест', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.goto();
  
  // твой тест
  await todoPage.addTodo('Новая задача');
  await expect(todoPage.getTodoByText('Новая задача')).toBeVisible();
});
```

## Проблемы?

- **Тесты flaky (иногда падают)** — добавь `await page.waitForTimeout(100)` или используй `waitForResponse`
- **Селектор не находит элемент** — обнови селекторы в `todo.page.ts`
- **Браузер не запускается** — запусти `pnpm run install-browsers`

## CI/CD

В GitHub Actions тесты запускаются автоматически. Статус видно в PR.

Если нужно пропустить тесты:

```
git commit -m "fix: мелкий фикс [skip ci]"
```

---

Вопросы? Пиши в #qa-channel или создавай issue.
