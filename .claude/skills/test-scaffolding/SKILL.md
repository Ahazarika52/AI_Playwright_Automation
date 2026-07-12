---
name: test-scaffolding
description: File/naming conventions and Page Object structure for this repo. Use this whenever creating a new Playwright spec or Page Object file, or reorganizing an existing test into the Page Object Model — it defines where files go, how they're named, and the class shape to follow (locators declared once, single-purpose methods, shared BasePage).
---

# Structure and templates

## Where files go

- **Specs**: `tests/e2e/<flow-name>.spec.ts` — one file per user flow or
  scenario group (e.g. `login.spec.ts`, `search-and-add-to-cart.spec.ts`),
  not one file per page.
- **Page Objects**: `pages/<Name>Page.ts` — one class per screen/page,
  PascalCase, suffixed `Page` (`LoginPage`, `SearchResultsPage`,
  `CartPage`).
- Every Page Object extends `pages/BasePage.ts`, which holds behavior common
  to all pages (navigation, waiting for the page to settle) so it isn't
  copy-pasted into every class.

Before creating a new Page Object, check `pages/` for one that already
covers the screen — add a method to it rather than duplicating the class.

## Start from the templates

Copy these rather than writing a class/spec from a blank file — they encode
the conventions below so you don't have to hold them all in your head:

- `templates/page-object.ts.template` → a new file in `pages/`
- `templates/test.spec.ts.template` → a new file in `tests/e2e/`

Rename the placeholder class/file names, then fill in the real locators
(from `selector-strategy`) and methods (from what `page-exploration` found)
in place of the examples.

## Class shape

- **Locators** are `readonly` properties, built once in the constructor —
  never re-queried inline inside a method.
- **Methods** each do one user action or one focused query
  (`login(user, pass)`, `addFirstResultToCart()`) — not a method that walks
  an entire scenario. A method returns `void`, a `Locator` for the spec to
  assert on, or a plain value read from the page — never the raw `page`
  object, which would let the spec reach around the class again.
- **No hard waits.** Playwright's locator actions already auto-wait for an
  element to be actionable; don't add `waitForTimeout` or `waitForSelector`
  before acting on something. Where you need to wait for something to
  *appear* as a condition rather than before acting on it, use
  `await expect(locator).toBeVisible()` — it waits and asserts in one step.

## Spec shape

The spec imports the Page Object(s) it needs, instantiates them with
`new SomePage(page)`, drives the scenario purely through their methods, and
asserts with `expect(...)`. If you find yourself writing `page.locator`,
`page.click`, or `page.fill` directly in a spec file, that call belongs on
the Page Object instead — move it there rather than leaving it inline.

Assertions belong in the spec, not the Page Object: the Page Object exposes
state (a `Locator`, a value), the spec decides what that state should be.

## Before handing off

Once the files exist, go to `test-validation` — a scaffolded test that
hasn't been run yet isn't finished, just typed.
