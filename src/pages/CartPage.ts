import type { Locator, Page } from '@playwright/test';

export class CartPage {
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.checkoutButton = page.getByTestId('checkout');
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
