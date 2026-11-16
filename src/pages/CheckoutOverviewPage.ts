import { expect, type Locator, type Page } from '@playwright/test';
import { parseCents } from '../utils/money';

export interface LineItem {
  name: string;
  priceCents: number;
}

export interface OrderSummary {
  itemTotalCents: number;
  taxCents: number;
  totalCents: number;
}

export class CheckoutOverviewPage {
  private readonly items: Locator;
  private readonly itemTotal: Locator;
  private readonly tax: Locator;
  private readonly total: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.itemTotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page, 'should reach the checkout overview (step two)').toHaveURL(
      /\/checkout-step-two\.html$/,
    );
  }

  async getLineItems(): Promise<LineItem[]> {
    const lines: LineItem[] = [];
    for (const item of await this.items.all()) {
      lines.push({
        name: await item.getByTestId('inventory-item-name').innerText(),
        priceCents: parseCents(await item.getByTestId('inventory-item-price').innerText()),
      });
    }
    return lines;
  }

  async getSummary(): Promise<OrderSummary> {
    return {
      itemTotalCents: parseCents(await this.itemTotal.innerText()),
      taxCents: parseCents(await this.tax.innerText()),
      totalCents: parseCents(await this.total.innerText()),
    };
  }
}
