import { Page, Locator } from '@playwright/test';

export class BasePage {
  // Amazon's "N item(s) in cart" link lives in the site header and is
  // present, in the same form, on every page (home, search, product, cart).
  // Declaring it here avoids redeclaring it on each Page Object.
  readonly cartCountLink: Locator;

  constructor(protected readonly page: Page) {
    this.cartCountLink = page.getByRole('link', { name: /\d+ items? in cart/i });
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
