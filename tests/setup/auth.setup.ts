import { test } from '../../src/fixtures';
import { authFile, env, type SauceUser } from '../../config/env';

// Runs once per `npx playwright test` before the ui project.
// UI tests start already logged in and never touch the login form.
for (const user of Object.keys(env.sauce.users) as SauceUser[]) {
  test(`authenticate ${env.sauce.users[user]}`, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.goto();
    await loginPage.login(env.sauce.users[user], env.sauce.password);
    await inventoryPage.expectLoaded();
    await page.context().storageState({ path: authFile(user) });
  });
}
