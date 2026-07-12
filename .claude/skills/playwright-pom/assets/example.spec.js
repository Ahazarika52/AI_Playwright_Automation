import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('logs in successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto('https://demoblaze.com/index.html');
  await loginPage.login('anshuman', 'anshuman123');

  await expect(loginPage.welcomeIndicator).toBeVisible();
});
