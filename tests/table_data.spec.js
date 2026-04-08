import { test, expect } from '@playwright/test';
import { loginPolly}  from '@/.utils

test('should log in with env config', async ({ page }) => {
    await login(page);
  
    await expect(page).toHaveURL('https://testpolly.elucidata.io/manage/omixatlas');
  });
  