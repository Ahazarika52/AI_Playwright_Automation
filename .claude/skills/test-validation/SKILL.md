---
name: test-validation
description: How to run a newly scaffolded (or edited) Playwright test, read its failures, fix them, and confirm it actually passes — including using the trace viewer. Use this after creating or changing any spec file, before considering the work done.
---

# Run it before you call it done

A test that compiles but has never been executed isn't verified — it's a
guess with good syntax. Always run a new or changed spec and watch it pass
before reporting the work finished.

## Run

```
npx playwright test <path/to/file>.spec.ts --project=chromium
```

Chromium is enough for the inner dev loop; only add `firefox`/`webkit` runs
if the user asks for cross-browser confirmation.

## Read failures like a diff, not a wall of text

Playwright's failure output tells you which of two things went wrong:

- **A matcher failed** (`expect(locator).toBeVisible()` timed out, or
  `toHaveText` got something unexpected) — the assertion's diff shows
  expected vs. actual; the fix is usually in the Page Object's locator or
  the spec's expectation, not the test runner.
- **An action timed out** (`.click()`, `.fill()` never became actionable) —
  almost always a wrong or too-narrow locator from `selector-strategy`, a
  step that needed a fresh accessibility snapshot from `page-exploration`
  after some prior interaction changed the page, or a genuinely async
  condition needing `await expect(locator).toBeVisible()` before the action.

## When the failure isn't obvious from the log

Rerun with tracing on and open the trace viewer — it shows you the DOM at
the moment of failure, network activity, and a timeline of every action:

```
npx playwright test <path/to/file>.spec.ts --project=chromium --trace on
npx playwright show-trace test-results/<test-folder>/trace.zip
```

## Iterate

Fix → rerun → repeat until green. If a locator keeps failing, that's a
signal to go back to `page-exploration` and re-snapshot the actual page
rather than guessing at a second, then third, locator from memory.
