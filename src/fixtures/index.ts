import { test as base, expect as baseExpect, type APIRequestContext } from '@playwright/test';
import { z } from 'zod';
import { authFile, env, type SauceUser } from '../../config/env';
import { PostsClient } from '../api/PostsClient';
import { UsersClient } from '../api/UsersClient';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';

type Options = {
  /** Which saucedemo user the browser context is logged in as. Unset = logged out. */
  sauceUser: SauceUser | undefined;
};

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  apiRequest: APIRequestContext;
  usersClient: UsersClient;
  postsClient: PostsClient;
};

export const test = base.extend<Options & Fixtures>({
  sauceUser: [undefined, { option: true }],

  // Each test gets a fresh browser context created from the saved login state,
  // so tests share no cart or session and can run in parallel.
  storageState: async ({ sauceUser, storageState }, use) => {
    await use(sauceUser ? authFile(sauceUser) : storageState);
  },

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),

  // A dedicated context so API tests never inherit browser state or the UI base URL.
  apiRequest: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: env.api.baseUrl });
    await use(context);
    await context.dispose();
  },
  usersClient: async ({ apiRequest }, use) => use(new UsersClient(apiRequest)),
  postsClient: async ({ apiRequest }, use) => use(new PostsClient(apiRequest)),
});

export const expect = baseExpect.extend({
  /** Validates the whole value against a schema and reports every violation at once. */
  toMatchSchema(received: unknown, schema: z.ZodType) {
    const result = schema.safeParse(received);
    return {
      name: 'toMatchSchema',
      pass: result.success,
      message: () =>
        result.success
          ? 'Expected value not to match the schema, but it did.'
          : `Schema validation failed:\n${z.prettifyError(result.error)}`,
    };
  },
});
