export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(path) {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
