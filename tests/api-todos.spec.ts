/**
 * API тесты для JSONPlaceholder /todos endpoint
 * Запускаются без UI — быстрее и стабильнее
 *
 * Best Practices 2025:
 * ✅ Чистые API тесты (без browser context)
 * ✅ test.step() для структуры где уместно
 * ✅ Параметризация тестовых данных
 *
 * Запуск: npx playwright test api-todos.spec.ts
 */

import { test, expect } from '@playwright/test';

const API_BASE = 'https://jsonplaceholder.typicode.com';

test.describe('API: /todos', () => {
  test.describe('GET /todos', () => {
    test('получение списка задач', async ({ request }) => {
      const response = await request.get(`${API_BASE}/todos`);

      expect(response.status()).toBe(200);

      const todos = await response.json();
      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBe(200); // JSONPlaceholder возвращает 200 задач
    });

    test('структура задачи корректна', async ({ request }) => {
      const response = await request.get(`${API_BASE}/todos/1`);

      expect(response.status()).toBe(200);

      const todo = await response.json();
      expect(todo).toMatchObject({
        id: expect.any(Number),
        userId: expect.any(Number),
        title: expect.any(String),
        completed: expect.any(Boolean),
      });
    });

    test('получение задачи по ID', async ({ request }) => {
      const response = await request.get(`${API_BASE}/todos/5`);

      expect(response.status()).toBe(200);

      const todo = await response.json();
      expect(todo.id).toBe(5);
    });

    test('несуществующий ID возвращает 404', async ({ request }) => {
      const response = await request.get(`${API_BASE}/todos/999999`);

      expect(response.status()).toBe(404);
    });

    // Параметризованные тесты для фильтрации
    const filterTests = [
      { param: 'userId=1', field: 'userId', expected: 1 },
      { param: 'userId=2', field: 'userId', expected: 2 },
      { param: 'completed=true', field: 'completed', expected: true },
      { param: 'completed=false', field: 'completed', expected: false },
    ];

    filterTests.forEach(({ param, field, expected }) => {
      test(`фильтрация по ${param}`, async ({ request }) => {
        const response = await request.get(`${API_BASE}/todos?${param}`);

        expect(response.status()).toBe(200);

        const todos = await response.json();
        expect(todos.length).toBeGreaterThan(0);

        // Все задачи соответствуют фильтру
        todos.forEach((todo: any) => {
          expect(todo[field]).toBe(expected);
        });
      });
    });
  });

  test.describe('POST /todos', () => {
    test('создание задачи', async ({ request }) => {
      const newTodo = {
        title: 'New task from API test',
        completed: false,
        userId: 1,
      };

      const response = await request.post(`${API_BASE}/todos`, {
        data: newTodo,
      });

      expect(response.status()).toBe(201);

      const created = await response.json();
      expect(created).toMatchObject(newTodo);
      expect(created.id).toBe(201); // JSONPlaceholder всегда возвращает id: 201
    });

    test('создание задачи с минимальными данными', async ({ request }) => {
      const response = await request.post(`${API_BASE}/todos`, {
        data: { title: 'Minimal task' },
      });

      expect(response.status()).toBe(201);
    });

    // Параметризованные тесты для валидации
    const validationTests = [
      { name: 'длинный title', data: { title: 'A'.repeat(1000) } },
      { name: 'спецсимволы', data: { title: '<script>alert("xss")</script>' } },
      { name: 'эмодзи', data: { title: '🎉 Task with emoji' } },
      { name: 'пустой title', data: { title: '' } },
    ];

    validationTests.forEach(({ name, data }) => {
      test(`создание с ${name}`, async ({ request }) => {
        const response = await request.post(`${API_BASE}/todos`, { data });

        expect(response.status()).toBe(201);
        const created = await response.json();
        expect(created.title).toBe(data.title);
      });
    });
  });

  test.describe('PUT /todos/:id', () => {
    test('обновление задачи', async ({ request }) => {
      const updates = {
        id: 1,
        title: 'Updated task',
        completed: true,
        userId: 1,
      };

      const response = await request.put(`${API_BASE}/todos/1`, {
        data: updates,
      });

      expect(response.status()).toBe(200);

      const updated = await response.json();
      expect(updated).toMatchObject(updates);
    });

    test('частичное обновление (PATCH)', async ({ request }) => {
      const response = await request.patch(`${API_BASE}/todos/1`, {
        data: { completed: true },
      });

      expect(response.status()).toBe(200);

      const updated = await response.json();
      expect(updated.completed).toBe(true);
    });
  });

  test.describe('DELETE /todos/:id', () => {
    test('удаление задачи', async ({ request }) => {
      const response = await request.delete(`${API_BASE}/todos/1`);

      expect(response.status()).toBe(200);
    });

    test('удаление несуществующей задачи', async ({ request }) => {
      const response = await request.delete(`${API_BASE}/todos/999999`);

      // JSONPlaceholder всегда возвращает 200 даже для несуществующих
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Headers and Content-Type', () => {
    test('проверка заголовков ответа', async ({ request }) => {
      const response = await request.get(`${API_BASE}/todos/1`);

      expect(response.headers()['content-type']).toContain('application/json');
    });

    test('отправка JSON Content-Type', async ({ request }) => {
      const response = await request.post(`${API_BASE}/todos`, {
        data: { title: 'Test' },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status()).toBe(201);
    });
  });

  test.describe('Performance', () => {
    test('GET /todos выполняется быстро', async ({ request }) => {
      const start = Date.now();

      const response = await request.get(`${API_BASE}/todos`);

      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(2000); // Должно быть быстрее 2 секунд

      console.log(`API response time: ${duration}ms`);
    });

    test('параллельные запросы работают корректно', async ({ request }) => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        request.get(`${API_BASE}/todos/${i + 1}`)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
    });
  });

  test.describe('Error Handling', () => {
    test('некорректный endpoint возвращает 404', async ({ request }) => {
      const response = await request.get(`${API_BASE}/nonexistent`);

      expect(response.status()).toBe(404);
    });

    test('некорректный JSON в POST', async ({ request }) => {
      const response = await request.post(`${API_BASE}/todos`, {
        data: 'not a json object',
      });

      // JSONPlaceholder принимает что угодно, реальный API должен вернуть 400
      // Здесь просто логируем для документации
      console.log(`Status for invalid JSON: ${response.status()}`);
    });
  });
});
