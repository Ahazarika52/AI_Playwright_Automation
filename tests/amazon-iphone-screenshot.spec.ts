import { test } from '@playwright/test';

test('Search for iPhone 17 Pro on Amazon and take screenshot', async ({ page }) => {
  // Navigate to Amazon
  await page.goto('https://www.amazon.com');

  // Wait for the search box to be visible
  await page.waitForSelector('input[id="twotabsearchtextbox"]');

  // Search for iPhone 17 Pro
  await page.fill('input[id="twotabsearchtextbox"]', 'iPhone 17 Pro');
  await page.press('input[id="twotabsearchtextbox"]', 'Enter');

  // Wait for search results to load
  await page.waitForSelector('[data-component-type="s-search-result"]');

  // Take a screenshot of the search results
  await page.screenshot({ path: 'amazon-iphone-17-pro-search.png', fullPage: true });
});
