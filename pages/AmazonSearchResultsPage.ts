import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AmazonSearchResultsPage extends BasePage {
  readonly resultsHeading: Locator;
  // Matches the first organic listing whose title starts with
  // "Apple iPhone 17" (e.g. "...17 Pro Max..."), which excludes sponsored
  // accessory ads — those are titled "Sponsored Ad - ... iPhone 17 Case..."
  // and don't start with "Apple iPhone 17". Regex (rather than an exact
  // string) is deliberate: Amazon's search results rotate color/storage
  // variants and sponsored placements between runs, so pinning to one exact
  // title would make the test brittle.
  readonly firstIphone17Result: Locator;

  constructor(page: Page) {
    super(page);

    this.resultsHeading = page.getByRole('heading', { level: 2, name: /results for/i });
    this.firstIphone17Result = page
      .getByRole('heading', { level: 2, name: /^Apple iPhone 17\b/ })
      .first();
  }

  async openFirstIphone17Result() {
    await this.firstIphone17Result.click();
  }
}
