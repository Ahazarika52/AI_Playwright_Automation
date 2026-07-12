import { test, expect } from '@playwright/test';

test('Search and add iPhone 17 Pro to cart on Amazon', async ({ page }) => {
  // Navigate to Amazon India
  await page.goto('https://www.amazon.in');

  // Search for iPhone 17 Pro
  await page.fill('input[name="field-keywords"]', 'iphone 17 pro');
  await page.press('input[name="field-keywords"]', 'Enter');

  // Wait for search results to load and click on the first product
  await page.waitForSelector('.s-main-slot .s-result-item');
  const firstProduct = await page.locator('.s-main-slot .s-result-item').first();
  await firstProduct.click();

  // Add the product to the cart
  await page.waitForSelector('#add-to-cart-button');
  await page.click('#add-to-cart-button');

  // Verify the product is added to the cart
  await page.waitForSelector('#huc-v2-order-row-confirm-text');
  const confirmationText = await page.textContent('#huc-v2-order-row-confirm-text');
  expect(confirmationText).toContain('Added to Cart');
});
//sample test