import { test } from '@playwright/test';

test('инспектирование после загрузки', async ({ page }) => {
  const baseURL = process.env.BASE_URL || 'https://eliasfeijo.github.io/angular-todo-app/';
  await page.goto(baseURL);

  // Ждем API ответ
  await page.waitForResponse(
    resp => resp.url().includes('jsonplaceholder.typicode.com/todos'),
    { timeout: 10000 }
  );

  await page.waitForTimeout(2000);

  // Проверяем app-todos content
  console.log('\n=== APP-TODOS AFTER LOAD ===');
  const appTodos = await page.locator('app-todos').innerHTML();
  console.log(appTodos.substring(0, 3000));

  // Ищем элементы todo
  console.log('\n=== LOOKING FOR TODO ITEMS ===');

  // Пробуем разные селекторы
  const selectors = [
    'app-todo-item',
    '.todo',
    '.todo-item',
    '[class*="todo"]',
    'app-todos > *',
    'app-todos li',
    'app-todos div'
  ];

  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    console.log(`${selector}: ${count} elements`);
    if (count > 0 && count < 300) {
      const first = page.locator(selector).first();
      const html = await first.evaluate(el => el.outerHTML);
      console.log(`  First element HTML (${selector}):`, html.substring(0, 500));
    }
  }

  // Проверяем чекбоксы
  console.log('\n=== CHECKBOXES ===');
  const checkboxes = await page.locator('input[type="checkbox"]').count();
  console.log(`Found ${checkboxes} checkboxes`);
  if (checkboxes > 0) {
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    const parent = firstCheckbox.locator('..');
    const parentHTML = await parent.evaluate(el => el.outerHTML);
    console.log('Parent of first checkbox:', parentHTML.substring(0, 500));
  }
});
