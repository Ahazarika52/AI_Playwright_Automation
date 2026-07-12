

import { test, expect } from '@playwright/test';


test('Search and add iPhone 17 Pro to cart on Amazon', async ({ page }) => {
    // Navigate to Amazon India
    await page.goto('https://dash-qbqxiix4d-astra.vercel.app/targets/e2738437-cb30-4b3a-8d3a-f5da8c49dc0f/setup/scope');

    //await page.pause();
    await page.getByRole('button', { name: 'Quick Login for testing ' }).click();
     awat page.pause();
});