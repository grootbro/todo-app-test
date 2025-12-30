import { test as base } from '@playwright/test';
import { TodoPage } from '../pages/todo.page';

/**
 * Test Fixtures для Angular Todo App
 *
 * Best Practice 2025: используем fixtures вместо beforeEach
 * для автоматической инициализации Page Objects
 */

type TodoFixtures = {
  todoPage: TodoPage;
};

/**
 * Extended test с автоматической инициализацией TodoPage
 *
 * Использование:
 * import { test, expect } from './fixtures/todo.fixture';
 *
 * test('мой тест', async ({ todoPage }) => {
 *   // todoPage уже готов к использованию!
 *   await todoPage.addTodo('Test');
 * });
 */
export const test = base.extend<TodoFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    // Предоставляем todoPage тесту
    await use(todoPage);
    // Cleanup можно добавить сюда если нужно
  },
});

export { expect } from '@playwright/test';
