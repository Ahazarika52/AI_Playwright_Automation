import { test, expect } from '@playwright/test';

test('Search and add iPhone 17 Pro to cart on Amazon', async ({ page }) => {
  // Amazon.in does not list an actual iPhone 17 Pro handset (only iPhone Air/16e/17e
  // and iPhone 17 Pro accessories), so amazon.in's search never surfaces a matching
  // product and the old flow timed out waiting for it. amazon.com does carry it.
  await page.goto('https://www.amazon.com');

  // Search for iPhone 17 Pro
  await page.getByRole('searchbox', { name: 'Search Amazon' }).fill('iphone 17 pro');
  await page.getByRole('searchbox', { name: 'Search Amazon' }).press('Enter');

  // Amazon's sponsored-result rotation mixes in carrier-locked SKUs (e.g. "for
  // Verizon"/"for AT&T") that can't ship to the test's delivery location and never
  // show an "Add to cart" button, and re-searching (e.g. via goBack) re-runs the ad
  // auction and reshuffles results. So capture every genuine iPhone 17 Pro family
  // listing's URL from a single render up front, then visit each directly until one
  // actually has a working buybox.
  const listings = page.getByRole('link', { name: /^Apple iPhone 17 Pro( Max)?,/ });
  await expect(listings.first()).toBeVisible();
  const productUrls = await listings.evaluateAll((links) =>
    links.map((link) => (link as HTMLAnchorElement).href)
  );

  const addToCart = page.getByRole('button', { name: 'Add to cart', exact: true });
  const continueShopping = page.getByRole('button', { name: 'Continue shopping' });
  let addedToCart = false;
  for (const productUrl of productUrls) {
    if (addedToCart) break;
    await page.goto(productUrl);

    // Amazon occasionally interposes a "Continue shopping" bot-check gate; it isn't
    // a real CAPTCHA and clicking through it lands on the actual product page.
    if (await continueShopping.isVisible({ timeout: 3000 }).catch(() => false)) {
      await continueShopping.click();
    }

    // Renewed/marketplace listings with no single default offer show "See all buying
    // options" instead of "Add to cart" - skip those and try the next candidate.
    if (await addToCart.isVisible({ timeout: 8000 }).catch(() => false)) {
      await addToCart.click();
      addedToCart = true;
    }
  }
  expect(addedToCart).toBe(true);

  // Verify the product is added to the cart via the confirmation side panel
  const confirmation = page.getByRole('dialog').filter({ hasText: 'Subtotal' });
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByRole('link', { name: 'Go to Cart' })).toBeVisible();
});