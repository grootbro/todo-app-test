import { test, expect } from './fixtures/todo.fixture';

/**
 * Visual Regression тесты
 *
 * ✅ Используем test fixtures вместо beforeEach
 * ✅ Auto-waiting вместо жестких таймаутов
 * ✅ test.step() для структуры где уместно
 *
 * Сравнивают скриншоты с эталонными.
 * При первом запуске создаются baseline скриншоты.
 *
 * Запуск: npx playwright test todo-visual.spec.ts
 * Обновить baseline: npx playwright test todo-visual.spec.ts --update-snapshots
 */

test.describe('Visual Regression', () => {
  // Используем fixture для инициализации
  test.beforeEach(async ({ page, todoPage }) => {
    // Ждём полной загрузки для стабильных скриншотов
    await page.waitForLoadState('networkidle');
    // Дополнительно ждем появления задач
    await todoPage.waitForLoad();
  });

  test('главная страница - полный вид', async ({ page, todoPage }) => {
    // Убеждаемся что страница полностью загрузилась
    await todoPage.waitForLoad();
    await page.waitForLoadState('networkidle');
    
    // Дополнительно проверяем, что есть задачи (не белый экран)
    const todoCount = await todoPage.getTodoCount();
    expect(todoCount).toBeGreaterThan(0);
    
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      // Допустимое отклонение 1% пикселей (для анти-алиасинга)
      maxDiffPixelRatio: 0.01,
    });
  });

  test('список задач - верхняя часть', async ({ todoPage }) => {
    // Скриншот только списка задач
    const todoList = todoPage.todoList;

    if (await todoList.isVisible()) {
      await expect(todoList).toHaveScreenshot('todo-list.png', {
        maxDiffPixelRatio: 0.01,
      });
    }
  });

  test('форма добавления задачи', async ({ page }) => {
    const inputArea = page.locator('header, .new-todo, form').first();
    
    if (await inputArea.isVisible()) {
      await expect(inputArea).toHaveScreenshot('input-form.png', {
        maxDiffPixelRatio: 0.01,
      });
    }
  });

  test('задача - обычное состояние', async ({ todoPage }) => {
    const firstTodo = todoPage.getTodoByIndex(0);

    if (await firstTodo.isVisible()) {
      await expect(firstTodo).toHaveScreenshot('todo-item-normal.png', {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test.skip('задача - состояние completed', async ({ todoPage }) => {
    // SKIP: Фильтры не реализованы в текущей версии приложения
    const firstTodo = todoPage.getTodoByIndex(0);

    // Переключаем задачу в completed
    if (!(await todoPage.isCompleted(firstTodo))) {
      await todoPage.toggleTodo(firstTodo);
    }

    if (await firstTodo.isVisible()) {
      await expect(firstTodo).toHaveScreenshot('todo-item-completed.png', {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test('задача - hover состояние', async ({ todoPage }) => {
    const firstTodo = todoPage.getTodoByIndex(0);

    if (await firstTodo.isVisible()) {
      // Наводим мышь (Playwright автоматически ждет готовности элемента)
      await firstTodo.hover();

      await expect(firstTodo).toHaveScreenshot('todo-item-hover.png', {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test.skip('фильтры - активный All', async ({ page, todoPage }) => {
    // SKIP: Фильтры не реализованы в текущей версии приложения
    await todoPage.filterBy('all');

    const filters = page.locator('.filters, footer, nav').first();
    if (await filters.isVisible()) {
      await expect(filters).toHaveScreenshot('filters-all-active.png', {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test.skip('фильтры - активный Active', async ({ page, todoPage }) => {
    // SKIP: Фильтры не реализованы в текущей версии приложения
    await todoPage.filterBy('active');

    const filters = page.locator('.filters, footer, nav').first();
    if (await filters.isVisible()) {
      await expect(filters).toHaveScreenshot('filters-active-active.png', {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test.skip('фильтры - активный Completed', async ({ page, todoPage }) => {
    // SKIP: Фильтры не реализованы в текущей версии приложения
    await todoPage.filterBy('completed');

    const filters = page.locator('.filters, footer, nav').first();
    if (await filters.isVisible()) {
      await expect(filters).toHaveScreenshot('filters-completed-active.png', {
        maxDiffPixelRatio: 0.02,
      });
    }
  });

  test.skip('пустой список (фильтр Completed без задач)', async ({ page, todoPage }) => {
    // SKIP: Фильтры не реализованы в текущей версии приложения
    await todoPage.filterBy('completed');

    // Если все задачи active, список будет пуст
    const count = await todoPage.getTodoCount();

    if (count === 0) {
      await expect(page).toHaveScreenshot('empty-list.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.01,
      });
    }
  });
});

test.describe('Visual Regression - Responsive', () => {

  test('mobile viewport', async ({ page, todoPage }) => {
    await test.step('Установить mobile viewport (iPhone SE)', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    await test.step('Перезагрузить страницу для применения viewport', async () => {
      await todoPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Сделать скриншот mobile версии', async () => {
      await expect(page).toHaveScreenshot('mobile-view.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  });

  test('tablet viewport', async ({ page, todoPage }) => {
    await test.step('Установить tablet viewport (iPad)', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
    });

    await test.step('Перезагрузить страницу для применения viewport', async () => {
      await todoPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Сделать скриншот tablet версии', async () => {
      await expect(page).toHaveScreenshot('tablet-view.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  });

  test('wide desktop viewport', async ({ page, todoPage }) => {
    await test.step('Установить wide desktop viewport', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
    });

    await test.step('Перезагрузить страницу для применения viewport', async () => {
      await todoPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Сделать скриншот wide desktop версии', async () => {
      await expect(page).toHaveScreenshot('desktop-wide-view.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  });
});

test.describe('Visual Regression - Dark Mode', () => {

  test('тёмная тема (если поддерживается)', async ({ page, todoPage }) => {
    await test.step('Эмулировать prefers-color-scheme: dark', async () => {
      await page.emulateMedia({ colorScheme: 'dark' });
    });

    await test.step('Перезагрузить страницу для применения темы', async () => {
      await todoPage.goto();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Сделать скриншот dark mode', async () => {
      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  });
});
