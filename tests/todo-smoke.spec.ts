/**
 * Smoke-тесты — минимальный набор для проверки работоспособности
 *
 * ✅ Используем test fixtures вместо beforeEach
 * ✅ Используем test.step() для структурированности
 * ✅ Auto-waiting вместо жестких таймаутов
 *
 * Запуск: pnpm test:smoke
 */

import { test, expect } from './fixtures/todo.fixture';

test.describe('Smoke Tests', () => {
  test('приложение загружается', async ({ page, todoPage }) => {
    await test.step('Проверить title страницы', async () => {
      await expect(page).toHaveTitle(/todo/i);
    });

    await test.step('Проверить видимость основных элементов', async () => {
      await expect(todoPage.todoInput).toBeVisible();
      await expect(todoPage.addButton).toBeVisible();
    });
  });

  test('список задач отображается', async ({ todoPage }) => {
    await test.step('Дождаться загрузки задач с API', async () => {
      // JSONPlaceholder возвращает 200 задач по умолчанию
      const count = await todoPage.getTodoCount();
      expect(count).toBeGreaterThan(0);
    });

    await test.step('Проверить видимость первой задачи', async () => {
      const firstTodo = todoPage.getTodoByIndex(0);
      await expect(firstTodo).toBeVisible();
    });
  });

  test('можно добавить задачу', async ({ todoPage }) => {
    const taskText = `Smoke test ${Date.now()}`;
    let initialCount: number;

    await test.step('Получить текущее количество задач', async () => {
      initialCount = await todoPage.getTodoCount();
    });

    await test.step('Добавить новую задачу', async () => {
      await todoPage.addTodo(taskText);
    });

    await test.step('Проверить что задача появилась', async () => {
      const newTodo = todoPage.getTodoByText(taskText);
      await expect(newTodo).toBeVisible();
    });

    await test.step('Проверить что счетчик увеличился', async () => {
      const newCount = await todoPage.getTodoCount();
      expect(newCount).toBe(initialCount + 1);
    });
  });

  test('можно отметить задачу выполненной', async ({ todoPage }) => {
    const firstTodo = todoPage.getTodoByIndex(0);
    let wasCompleted: boolean;

    await test.step('Получить текущий статус задачи', async () => {
      wasCompleted = await todoPage.isCompleted(firstTodo);
    });

    await test.step('Переключить статус задачи', async () => {
      await todoPage.toggleTodo(firstTodo);
    });

    await test.step('Проверить что статус изменился', async () => {
      const isNowCompleted = await todoPage.isCompleted(firstTodo);
      expect(isNowCompleted).not.toBe(wasCompleted);
    });

    await test.step('Переключить обратно для чистоты', async () => {
      await todoPage.toggleTodo(firstTodo);
      const finalStatus = await todoPage.isCompleted(firstTodo);
      expect(finalStatus).toBe(wasCompleted);
    });
  });

  test('можно удалить задачу', async ({ todoPage }) => {
    let initialCount: number;
    let todoToDelete: string;

    await test.step('Получить текущее количество задач', async () => {
      initialCount = await todoPage.getTodoCount();
    });

    await test.step('Выбрать задачу для удаления', async () => {
      const firstTodo = todoPage.getTodoByIndex(0);
      todoToDelete = await todoPage.getTodoText(firstTodo);
    });

    await test.step('Удалить задачу', async () => {
      const firstTodo = todoPage.getTodoByIndex(0);
      await todoPage.deleteTodo(firstTodo);
    });

    await test.step('Проверить что счетчик уменьшился', async () => {
      const newCount = await todoPage.getTodoCount();
      expect(newCount).toBe(initialCount - 1);
    });

    await test.step('Проверить что задачи больше нет в списке', async () => {
      // Задача должна исчезнуть из DOM
      const allItems = await todoPage.todoItems.all();
      const texts = await Promise.all(allItems.map(item => todoPage.getTodoText(item)));
      const firstOccurrence = texts.indexOf(todoToDelete);

      // Либо задачи нет вообще, либо это не первая задача
      expect(firstOccurrence).not.toBe(0);
    });
  });
});
