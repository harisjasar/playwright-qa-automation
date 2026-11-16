import { expect, type Locator, type Page } from '@playwright/test';
import { parseCents } from '../utils/money';

export class InventoryPage {
  private readonly items: Locator;
  private readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
    await this.expectLoaded();
  }

  /** Fails fast if the stored session has expired and saucedemo bounced us back to the login page. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
    await expect(this.items.first()).toBeVisible();
  }

  async getItemPriceCents(name: string): Promise<number> {
    return parseCents(await this.item(name).getByTestId('inventory-item-price').innerText());
  }

  async addToCart(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  private item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }
}
