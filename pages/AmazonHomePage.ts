import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AmazonHomePage extends BasePage {
  // Amazon occasionally interstitials the homepage with a modal asking to
  // confirm shipping country before showing the real page. It only appears
  // when the detected location doesn't match the store locale, so every
  // method that handles it is a conditional "if present" method.
  readonly internationalShippingDialog: Locator;
  readonly dismissInternationalShippingButton: Locator;

  // Header "Deliver to <location>" control and the "Choose your location"
  // modal it opens. Setting a US zip code here (once, on the homepage)
  // keeps the delivery location consistent for every later page, which
  // matters because listings with no US delivery address show a disabled
  // "Add to Cart" button on the product page.
  readonly deliverToButton: Locator;
  readonly zipCodeInput: Locator;
  readonly applyZipButton: Locator;
  readonly confirmLocationButton: Locator;

  readonly searchBox: Locator;

  constructor(page: Page) {
    super(page);

    this.internationalShippingDialog = page.getByRole('alertdialog', {
      name: 'International Shopping Transition Alert',
    });
    // Both buttons in this dialog are labelled "Submit" by their accessible
    // name (the visible "Dismiss" / "Change Address" text is a sibling, not
    // part of the button's name) — scope to the dialog and take the first
    // one, which is "Dismiss" in DOM order.
    this.dismissInternationalShippingButton = this.internationalShippingDialog
      .getByRole('button', { name: 'Submit' })
      .first();

    this.deliverToButton = page.getByRole('button', { name: /^Deliver to/ });
    this.zipCodeInput = page.getByRole('textbox', { name: 'or enter a US zip code' });
    this.applyZipButton = page.getByRole('button', { name: 'Apply' });
    this.confirmLocationButton = page.getByRole('button', { name: 'Continue' });

    this.searchBox = page.getByRole('searchbox', { name: 'Search Amazon' });
  }

  async dismissInternationalShippingBannerIfPresent() {
    try {
      await this.internationalShippingDialog.waitFor({ state: 'visible', timeout: 5000 });
      await this.dismissInternationalShippingButton.click();
    } catch {
      // Banner didn't appear for this session/locale — nothing to dismiss.
    }
  }

  async setDeliveryZipCode(zip: string) {
    await this.deliverToButton.click();
    await this.zipCodeInput.fill(zip);
    await this.applyZipButton.click();
    await this.confirmDeliveryLocationIfPrompted();
  }

  private async confirmDeliveryLocationIfPrompted() {
    try {
      await this.confirmLocationButton.waitFor({ state: 'visible', timeout: 5000 });
      await this.confirmLocationButton.click();
    } catch {
      // No confirmation prompt shown (country didn't change) — nothing to do.
    }
  }

  async searchFor(query: string) {
    await this.searchBox.fill(query);
    await this.searchBox.press('Enter');
  }
}
