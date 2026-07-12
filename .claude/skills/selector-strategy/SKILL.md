---
name: selector-strategy
description: Selector priority rules for turning what page-exploration found into actual Playwright locators. Use this whenever writing a Page Object's locators or reviewing/refactoring existing ones — including when a test uses raw CSS ids, classes, or XPath and should be tightened up.
---

# Choosing a locator

The goal is a locator that breaks only when the thing it's finding actually
changes for the user, not whenever markup gets reshuffled underneath it.

## Priority order

1. **`getByRole`** — button/link/textbox/etc. by accessible name. This is
   what a real user (or a screen reader) perceives, so it survives class
   renames, div restructuring, and most redesigns.
2. **`getByLabel`** / **`getByPlaceholder`** — for form fields that don't
   have a clean role-plus-name pairing.
3. **`getByText`** — for static, human-readable content with no interactive
   role.
4. **`getByTestId`** — when the app exposes `data-testid` (or similar) and
   none of the above cleanly apply. Stable, but only as good as the team's
   discipline about keeping testids in place.
5. **CSS selectors or XPath** — last resort only, when nothing above can
   express the match (e.g. a genuinely unlabeled, non-semantic element).
   If you reach for this, leave a one-line comment on *why* the better
   options didn't work — that's the detail a future reader (or you, in six
   months) can't infer from the selector itself.

## Translating an accessibility snapshot into a locator

`page-exploration` hands you entries like a button with an accessible name.
That maps directly:

- `button "Log in"` → `page.getByRole('button', { name: 'Log in' })`
- `textbox "Username"` (from a label) → `page.getByLabel('Username')`
- a testid attribute found via DOM inspection → `page.getByTestId('cart-confirm')`

## Where locators live

Declare each locator exactly once, as a `readonly` property on the Page
Object, built in its constructor — never re-queried ad hoc inside methods or
written directly into a spec file. See `test-scaffolding` for the class
shape this feeds into.

## A note on existing code in this repo

Some existing specs use raw ids/classes or XPath directly
(`page.click('#add-to-cart-button')`, `//button[normalize-space()='Log in']`).
Don't treat that as the house style — it's exactly the pattern this priority
order exists to move away from. When touching one of those files, prefer
replacing the raw selector with the best option above rather than adding a
new raw selector next to it.
