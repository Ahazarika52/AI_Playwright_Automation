---
name: playwright-pom
description: Guides creating Page Object Model (POM) classes and matching Playwright test specs for this repo's UI automation, following Playwright best practices (role/testid locators over CSS or XPath, no hard waits, focused single-purpose methods, a shared BasePage). Use this whenever the user asks to write a Playwright test, automate a web page or user flow, add or refactor a spec file under tests/, create or update a page object, or mentions locators, getByRole, getByTestId, data-testid, or "Playwright best practices" in the context of this project — even if they don't say "page object model" explicitly.
---

# Playwright Page Object Model generator

This repo (`tests/`) currently has specs that call `page.locator(...)` directly —
no reusable page objects, inconsistent locator strategies (raw CSS ids, XPath),
and some hard waits. When adding or touching a test, use this skill to produce
a proper Page Object Model instead of adding more inline locators.

## Why POM matters here

Every existing spec re-selects the same elements from scratch and breaks the
same way when a site's markup shifts. A POM class is the one place that knows
*how* to find and interact with a page; the spec file only describes the
*scenario*. That split is what makes tests survive UI changes and stay
readable.

## Step 1 — Find or create the page object

Page objects live in `tests/pages/`, one file per page/screen, named
`<Thing>Page` (e.g. `LoginPage`, `SearchResultsPage`, `CartPage`).

Before writing a new one, check `tests/pages/` for a class that already
covers the screen or flow. Extend or add a method to it rather than
duplicating a class for the same page.

**Extension**: match whatever the target spec file uses. If you're adding to
or writing a `.spec.ts` file, write the page object as `.ts`. If the spec is
`.spec.js` (several existing ones are), write plain `.js` with the same
`import`/`export` syntax already used elsewhere in this repo — Playwright's
transform handles ESM `import`/`export` in `.js` files here, so don't switch
to `require`/`module.exports`. If there's no existing spec to match (a
brand-new flow with no prior art), default to TypeScript.

## Step 2 — Extend BasePage

Every page object extends a shared `BasePage` so common behavior (navigation,
waiting for the page to settle) lives in one place instead of being
copy-pasted into each class.

If `tests/pages/BasePage.ts` (or `.js`, matching the extension you're using)
doesn't exist yet, create it first from `assets/BasePage.ts` /
`assets/BasePage.js`. Don't recreate it if it's already there — import it.

## Step 3 — Model the page as locators + methods

Follow the shape in `assets/ExamplePage.ts` / `assets/ExamplePage.js` and
`assets/example.spec.ts` / `assets/example.spec.js` (a login page, mirroring
the demoblaze login flow already in this repo at `tests/locator.spec.js`).

**Locators** are declared once, as `readonly` properties, in the constructor —
never re-queried inline inside methods. Prefer, in order:

1. `getByRole` (button/link/textbox by accessible name) — matches what a user
   actually perceives, survives most markup/class churn.
2. `getByLabel` / `getByPlaceholder` for form fields without a clear role name.
3. `getByText` for static content.
4. `getByTestId` when the app exposes `data-testid` and the above don't apply
   cleanly.
5. CSS selectors or XPath only as a last resort, and only when nothing above
   can express the match — this repo's existing specs lean on raw `#id` and
   XPath (e.g. `tests/Locators_builtin.spec.js`,
   `tests/amazon-search-add-to-cart.spec.ts`); don't carry that pattern
   forward into new POMs.

**Methods** each do one user action or one focused query — `login(user, pass)`,
`addFirstResultToCart()`, `searchFor(term)` — not one giant method that walks
an entire scenario. A method returns `void`, a `Locator` (for the spec to
assert on), or a value read from the page — never the raw `page` object,
which would let the spec bypass the class again.

**No hard waits.** Don't add `page.waitForTimeout(...)` or
`page.waitForSelector(...)` before an action — Playwright's locator actions
(`.click()`, `.fill()`, etc.) already auto-wait for the element to be
actionable. Where you do need to wait for something to *appear* as a
condition (not before acting on it), use
`await expect(locator).toBeVisible()` rather than `waitForSelector`, since
that both waits and asserts.

## Step 4 — Write the spec against the page object

The spec file imports the page class, instantiates it with
`new SomePage(page)`, calls its methods to drive the scenario, and asserts
with `expect(...)` from `@playwright/test`. No `page.locator`, `page.click`,
`page.fill`, etc. should appear directly in the spec — if you find yourself
reaching for one, it belongs on the page object instead.

Assertions belong in the spec, not the page object — the page object exposes
the state (a `Locator`, a string), the spec decides what that state should be.

## Step 5 — Sanity-check before finishing

- Does `tests/pages/` already have a class for this screen? (avoid duplicates)
- Are all locators role/label/text/testid-based, falling back to CSS/XPath
  only where nothing else applies?
- Any hard waits snuck in?
- Does the spec read as a scenario, with zero raw `page.*` locator calls?
- New file extensions match the convention (`.ts` next to `.ts`, `.js` next
  to `.js`, default `.ts` for genuinely new flows)?

## Reference templates

- `assets/BasePage.ts`, `assets/BasePage.js` — shared base class.
- `assets/ExamplePage.ts`, `assets/ExamplePage.js` — a worked `LoginPage`
  example.
- `assets/example.spec.ts`, `assets/example.spec.js` — the matching spec.

Read whichever pair matches the language you're working in for the exact
shape to follow; don't copy them verbatim, adapt the locators and methods to
the actual page being modeled.
