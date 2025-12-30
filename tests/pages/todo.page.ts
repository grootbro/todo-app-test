import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object для Angular Todo App
 * 
 * Инкапсулирует все взаимодействия со страницей.
 * Селекторы вынесены в приватные поля для удобства поддержки.
 */
export class TodoPage {
  readonly page: Page;
  
  // Локаторы
  readonly todoInput: Locator;
  readonly addButton: Locator;
  readonly todoList: Locator;
  readonly todoItems: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Селекторы для реального Angular Todo App
    // Структура: app-todo-item > div.todo > [checkbox, p, button.btn-remove]
    this.todoInput = page.locator('input[placeholder="Add Todo..."]');
    this.addButton = page.locator('input[type="submit"]');
    this.todoList = page.locator('app-todos');
    this.todoItems = page.locator('app-todo-item');
    this.filterAll = page.getByRole('link', { name: /all/i })
      .or(page.locator('a, button').filter({ hasText: /^all$/i }));
    this.filterActive = page.getByRole('link', { name: /active/i })
      .or(page.locator('a, button').filter({ hasText: /active/i }));
    this.filterCompleted = page.getByRole('link', { name: /completed/i })
      .or(page.locator('a, button').filter({ hasText: /completed/i }));
    this.loadingIndicator = page.locator('.loading, .spinner, [aria-busy="true"]');
  }

  /**
   * Открыть приложение
   */
  async goto() {
    // Используем полный URL, так как baseURL с '/' не работает правильно
    const baseURL = process.env.BASE_URL || 'https://eliasfeijo.github.io/angular-todo-app/';
    await this.page.goto(baseURL);
    await this.waitForLoad();
  }

  /**
   * Дождаться загрузки списка
   * используем auto-waiting вместо жестких таймаутов
   */
  async waitForLoad() {
    // Ждём API ответ от JSONPlaceholder
    await this.page.waitForResponse(
      resp => resp.url().includes('jsonplaceholder.typicode.com/todos'),
      { timeout: 10_000 }
    ).catch(() => {});

    // Ждем появления первого todo элемента (auto-waiting)
    await this.todoItems.first().waitFor({ state: 'attached', timeout: 5_000 }).catch(() => {});
  }

  /**
   * Попытаться добавить задачу (без проверки результата)
   * Используется для негативных тестов
   */
  async tryAddTodo(text: string) {
    await this.todoInput.fill(text);
    await this.addButton.click();

    // Небольшое ожидание для обработки
    await this.page.waitForTimeout(500);
  }

  /**
   * Добавить новую задачу
   * используем auto-waiting вместо фиксированных задержек
   */
  async addTodo(text: string) {
    await this.todoInput.fill(text);

    // Подсчитываем количество задач до добавления
    const countBefore = await this.todoItems.count();

    await this.addButton.click();

    // Ждём ответа API
    await this.page.waitForResponse(
      resp => resp.url().includes('jsonplaceholder') && resp.request().method() === 'POST',
      { timeout: 5_000 }
    ).catch(() => {});

    // Ждем появления новой задачи (auto-waiting)
    await expect(this.todoItems).toHaveCount(countBefore + 1, { timeout: 3_000 });
  }

  /**
   * Получить задачу по тексту
   */
  getTodoByText(text: string): Locator {
    return this.todoItems.filter({ hasText: text });
  }

  /**
   * Получить задачу по индексу (0-based)
   */
  getTodoByIndex(index: number): Locator {
    return this.todoItems.nth(index);
  }

  /**
   * Переключить статус задачи (completed/active)
   * проверяем изменение состояния вместо ожидания
   */
  async toggleTodo(todoLocator: Locator) {
    const todoDiv = todoLocator.locator('div.todo').first();
    const wasBefore = (await todoDiv.getAttribute('class'))?.includes('is-complete');

    const checkbox = todoLocator.locator('input[type="checkbox"]').first();
    await checkbox.click();

    // Ждём API
    await this.page.waitForResponse(
      resp => resp.url().includes('jsonplaceholder') && ['PUT', 'PATCH'].includes(resp.request().method()),
      { timeout: 5_000 }
    ).catch(() => {});

    // Ждем изменения класса (auto-waiting)
    if (wasBefore) {
      await expect(todoDiv).not.toHaveClass(/is-complete/, { timeout: 2_000 });
    } else {
      await expect(todoDiv).toHaveClass(/is-complete/, { timeout: 2_000 });
    }
  }

  /**
   * Удалить задачу
   * ждем уменьшения количества
   */
  async deleteTodo(todoLocator: Locator) {
    const countBefore = await this.todoItems.count();

    const deleteBtn = todoLocator.locator('button.btn-remove').first();
    await deleteBtn.click();

    // Ждём API
    await this.page.waitForResponse(
      resp => resp.url().includes('jsonplaceholder') && resp.request().method() === 'DELETE',
      { timeout: 5_000 }
    ).catch(() => {});

    // Ждем уменьшения количества (auto-waiting)
    await expect(this.todoItems).toHaveCount(countBefore - 1, { timeout: 3_000 });
  }

  /**
   * Редактировать задачу (двойной клик на p)
   * ждем изменения текста
   */
  async editTodo(todoLocator: Locator, newText: string) {
    const textElement = todoLocator.locator('p').first();
    await textElement.dblclick();

    // Ждем появления input для редактирования (auto-waiting)
    const editInput = todoLocator.locator('input[type="text"]').first();
    await editInput.waitFor({ state: 'visible', timeout: 2_000 });
    await editInput.fill(newText);
    await editInput.press('Enter');

    // Ждем сохранения - проверяем что текст изменился (auto-waiting)
    await expect(textElement).toHaveText(newText, { timeout: 2_000 });
  }

  /**
   * Применить фильтр
   * убран фиксированный таймаут
   */
  async filterBy(filter: 'all' | 'active' | 'completed') {
    const filterLocator = {
      'all': this.filterAll,
      'active': this.filterActive,
      'completed': this.filterCompleted,
    }[filter];

    await filterLocator.click();
    // Auto-waiting: Playwright сам дождется обновления DOM
  }

  /**
   * Получить количество видимых задач
   */
  async getTodoCount(): Promise<number> {
    return await this.todoItems.count();
  }

  /**
   * Проверить, что задача помечена как completed
   */
  async isCompleted(todoLocator: Locator): Promise<boolean> {
    // Проверяем по классу .is-complete на div.todo
    const todoDiv = todoLocator.locator('div.todo').first();
    const classes = await todoDiv.getAttribute('class') ?? '';
    return classes.includes('is-complete');
  }

  /**
   * Получить текст задачи
   */
  async getTodoText(todoLocator: Locator): Promise<string> {
    const textElement = todoLocator.locator('p').first();
    return (await textElement.textContent() ?? '').trim();
  }
}
