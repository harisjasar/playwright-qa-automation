import { expect, test } from '../../src/fixtures';
import { env, type SauceUser } from '../../config/env';
import { buildCustomer } from '../../src/data/factories';
import { SAUCE_TAX_RATE_PERCENT } from '../../src/data/saucedemo';
import { sumCents, taxCents } from '../../src/utils/money';

const ITEMS = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

interface Scenario {
  user: SauceUser;
  /** Set for a user with a known, tracked defect: the test runs and is expected to fail. */
  knownDefect?: string;
}

const scenarios: Scenario[] = [
  { user: 'standard' },
  {
    user: 'problem',
    knownDefect:
      'Problem account: text typed into Last Name lands in First Name instead, so checkout ' +
      'stops at "Error: Last Name is required" and the overview is never reached.',
  },
];

for (const { user, knownDefect } of scenarios) {
  test.describe(`checkout as ${env.sauce.users[user]}`, () => {
    test.use({ sauceUser: user });

    test(
      'overview totals match the prices of the items in the cart',
      {
        tag: knownDefect ? ['@checkout', '@known-defect'] : ['@checkout'],
        annotation: knownDefect ? [{ type: 'known defect', description: knownDefect }] : [],
      },
      async ({ inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage }) => {
        // Runs to completion so the report shows "expected failure"; if the bug is fixed,
        // Playwright reports an unexpected pass and the marker has to be removed.
        test.fail(!!knownDefect, knownDefect);

        const pricesCents: number[] = [];

        await test.step('add two items to the cart', async () => {
          await inventoryPage.goto();
          for (const name of ITEMS) {
            pricesCents.push(await inventoryPage.getItemPriceCents(name));
            await inventoryPage.addToCart(name);
          }
        });

        await test.step('go through the cart to the checkout overview', async () => {
          await inventoryPage.openCart();
          await cartPage.checkout();
          await checkoutInfoPage.submit(buildCustomer());
          await checkoutOverviewPage.expectLoaded();
        });

        await test.step('overview lists the same items at the same prices', async () => {
          expect(await checkoutOverviewPage.getLineItems()).toEqual(
            ITEMS.map((name, i) => ({ name, priceCents: pricesCents[i] })),
          );
        });

        await test.step('item total, tax and total agree with the item prices', async () => {
          const itemTotalCents = sumCents(pricesCents);
          const expectedTaxCents = taxCents(itemTotalCents, SAUCE_TAX_RATE_PERCENT);
          expect(await checkoutOverviewPage.getSummary()).toEqual({
            itemTotalCents,
            taxCents: expectedTaxCents,
            totalCents: itemTotalCents + expectedTaxCents,
          });
        });
      },
    );
  });
}
