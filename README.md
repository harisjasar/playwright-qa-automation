# QA Automation test task: Limestone Digital

This repository has three parts:

- **Part 1** is a Playwright + TypeScript framework with a UI suite for [saucedemo](https://www.saucedemo.com/) and an API suite for [jsonplaceholder](https://jsonplaceholder.typicode.com/).
- **Part 2** is a Postman collection in [`/postman`](postman).
- **Part 3** is two SQL queries in [`/sql/queries.sql`](sql/queries.sql).

## Install and run

You need Node.js 20 or newer.

```bash
npm install
npx playwright install chromium
cp .env.example .env          # then replace every {{PLACEHOLDER}}, see below
```

### Configuration and credentials

Nothing secret is in the repository and nothing falls back to a default. `.env.example` is a template with a `{{PLACEHOLDER}}` for every value. `config/env.ts` stops the run with the variable's name if a value is missing or still a placeholder.

| Variable | What it is | How to get it |
|---|---|---|
| `SAUCE_BASE_URL` | saucedemo environment under test | The URL of the target environment. For the public instance, use the address given in the task. |
| `SAUCE_STANDARD_USER`, `SAUCE_PROBLEM_USER` | Test accounts for the two scenarios | Open `SAUCE_BASE_URL` in a browser. The login page lists the accepted usernames under "Accepted usernames are". Use the standard and problem accounts. For a private environment, take them from the team's secret store. |
| `SAUCE_PASSWORD` | Shared password for those accounts | Shown on the same login page under "Password for all users". For a private environment, take it from the team's secret store. |
| `API_BASE_URL` | jsonplaceholder environment under test | The URL of the target API. It needs no credentials. |

**CI:** configure these in GitHub under *Settings → Secrets and variables → Actions*:
- **Variables:** `SAUCE_BASE_URL`, `API_BASE_URL`
- **Secrets:** `SAUCE_STANDARD_USER`, `SAUCE_PROBLEM_USER`, `SAUCE_PASSWORD`

The workflow reads only those values.

| What | Command |
|---|---|
| Full suite (setup, UI, API) | `npx playwright test` |
| UI only / API only | `npm run test:ui` / `npm run test:api` |
| A single file | `npx playwright test tests/api/users.spec.ts` |
| A single test by name | `npx playwright test -g "standard_user"` |
| By tag | `npx playwright test --grep @contract` |
| Type check | `npm run typecheck` |
| Postman collection (newman) | `npm run postman` |

**Report:** run `npx playwright show-report` (or `npm run report`) after a run. It opens `playwright-report/index.html`. Failed tests keep a trace and a screenshot. In CI ([`.github/workflows/tests.yml`](.github/workflows/tests.yml)) the report is uploaded as the `playwright-report` artifact.

Expected result: every test passes. The `problem_user` checkout counts as passing because it is marked as an **expected failure** (see below).

## Layout

```
config/env.ts          base URLs and credentials from .env / environment; fails fast if one is missing
playwright.config.ts   projects: setup -> ui (browser, logged in), api (no browser)
src/pages/             page objects; the only place selectors live (data-test attributes)
src/api/               ApiClient base + UsersClient, PostsClient; zod schemas give types and contracts
src/fixtures/          test.extend: page objects, API clients, sauceUser option, toMatchSchema matcher
src/data/              test data factories and the saucedemo tax rate
src/utils/money.ts     price parsing and arithmetic in integer cents
tests/setup/           logs each user in once, saves storageState to .auth/<user>.json
tests/ui/, tests/api/  specs: no selectors, no URLs, no request.get()
```

## Design decisions

- **Architecture:** specs → fixtures → page objects / typed API clients → config, so a UI or API change touches one class. `zod` schemas are both the TypeScript types and the runtime contracts.
- **Isolation:** the `setup` project logs each user in once and saves `storageState`. Every test gets a fresh context from it, so tests share no state and run fully in parallel.
- **Checkout math:** prices are read from the inventory page. The test calculates item total, 8% tax and total itself, in integer cents.
- **`problem_user`:** the same test, marked `test.fail()` with a `known defect` annotation. The report shows the defect and the build stays green. A fix shows up as an unexpected pass. `skip` would hide the defect, and a plain red failure teaches people to ignore red builds.
- **Non-persisting POST:** the test asserts what the fake guarantees: `201`, a schema-valid echo of the payload, then the documented `404` on read-back. Against a real backend that step becomes `200` plus a deep-equal check. If the fake starts persisting, the test fails and says so.
- **Skipped:** data-driven login, pre-filled cart, lint rules, multi-browser and visual checks. Each is cheap to add but outside the one-hour scope.
- **At 500 tests and 5 engineers:** split fixtures per domain with `mergeTests`, and run `@smoke` and `@regression` per pipeline stage with CI sharding. Add an ESLint rule banning selectors and raw requests in `tests/`, and CODEOWNERS on `src/pages` and `src/api`. Generate schemas from OpenAPI, use per-worker test accounts, and link known defects to tickets.

## Assumptions

- **Tax rate:** saucedemo's tax is **8%** of the item total, rounded to the cent. This is observed behaviour, not documented, and it lives in `src/data/saucedemo.ts`.
- **problem_user defect:** the defect under test is that text typed into Last Name ends up in First Name, so checkout stops at step one with "Last Name is required". Other `problem_user` glitches (wrong images, sorting) are out of scope.
- **Limit of `test.fail()`:** it accepts *any* failure. A later, different breakage in this flow would also count as "expected". The annotation text and the failure message ("should reach the checkout overview") make that easy to spot in the report. A stricter version would assert the specific error message instead.
- **Credentials:** they are treated as production secrets, even though saucedemo's are public demo values. No values or fallbacks are in the code, config, CI or `.env.example`. They come only from a local `.env` or from CI secrets and variables.
- **Contract test users:** the user contract test checks users 1, 5 and 10. The schema is strict, so a new or removed field is treated as a contract change.
- **Postman user choice:** the collection picks the **first** user, so runs are deterministic. `missingPostId` is `99999`.
- **SQL:** "United Package" is matched by name. Order value is `Quantity × Products.Price`, because Northwind on W3Schools has no unit price in `OrderDetails`. More detail is in the comments in `queries.sql`.

## Part 2: Postman

Import `postman/jsonplaceholder.postman_collection.json` and `postman/jsonplaceholder.postman_environment.json` (which holds `baseUrl`), then run the collection in order. Each request's pre-request script only declares what it expects. The status check, the JSON-schema validation of every array item (required, non-empty properties) and the "every post belongs to the selected user" check all live in the collection-level test script. `npm run postman` runs the same collection headless.

The environment holds only the public base URL, which is configuration, not a credential, so the exported file runs as soon as it is imported. A private target would get its own environment file, with any secrets stored as empty `secret`-type variables.

## Part 3: SQL

The queries are in [`sql/queries.sql`](sql/queries.sql). Paste them one at a time into the [W3Schools Try-It editor](https://www.w3schools.com/sql/trysql.asp?filename=trysql_select_all).

## Status

All three parts are done. The optional CI workflow is included. The remaining optional items are listed under *Skipped* in Design decisions.

**Note:** the task PDF contains hidden text addressed to AI assistants that conflicts with the visible spec. This solution follows the visible spec.
