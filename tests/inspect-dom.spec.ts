import { test } from '@playwright/test';

test('инспектирование DOM структуры', async ({ page }) => {
  const baseURL = process.env.BASE_URL || 'https://eliasfeijo.github.io/angular-todo-app/';
  await page.goto(baseURL);
  await page.waitForTimeout(2000);

  // Получаем HTML структуру
  const html = await page.content();
  console.log('=== HTML STRUCTURE ===');
  console.log(html.substring(0, 5000));

  // Ищем поле ввода
  console.log('\n=== INPUT FIELD ===');
  const inputs = await page.locator('input').all();
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    const id = await input.getAttribute('id');
    const className = await input.getAttribute('class');
    console.log(`Input ${i}: type="${type}", placeholder="${placeholder}", id="${id}", class="${className}"`);
  }

  // Ищем кнопки
  console.log('\n=== BUTTONS ===');
  const buttons = await page.locator('button').all();
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const text = await button.textContent();
    const className = await button.getAttribute('class');
    console.log(`Button ${i}: text="${text?.trim()}", class="${className}"`);
  }

  // Ищем элементы списка
  console.log('\n=== LIST ITEMS ===');
  const listItems = await page.locator('li, .todo-item, .todo, [class*="todo"]').all();
  console.log(`Found ${listItems.length} potential todo items`);
  if (listItems.length > 0) {
    const first = listItems[0];
    const outerHTML = await first.evaluate(el => el.outerHTML);
    console.log('First item HTML:', outerHTML);
  }

  // Проверяем app-root
  console.log('\n=== APP-ROOT CONTENT ===');
  const appRoot = await page.locator('app-root').innerHTML();
  console.log(appRoot.substring(0, 2000));
});
