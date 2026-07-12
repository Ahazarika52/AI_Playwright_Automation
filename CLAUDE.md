# Playwright Automation

This repo automates browser testing with Playwright. New tests should follow
the Page Object Model, using a live browser (via the Playwright MCP server
configured in `.mcp.json`) to explore a page rather than guessing at
selectors from memory.

## Adding a new test

Use the `playwright-test-writer` subagent (`.claude/agents/`), or follow its
workflow directly via the skills it's built from, in order:

1. `page-exploration` — map the live page with the Playwright MCP browser
   tools.
2. `selector-strategy` — turn what you found into resilient locators
   (role/label/text/testid before CSS/XPath).
3. `test-scaffolding` — create the Page Object and spec from the templates
   in `.claude/skills/test-scaffolding/templates/`, following this repo's
   conventions.
4. `test-validation` — run the test, read failures, fix, repeat until green.

## Structure

- `tests/e2e/` — generated Playwright specs, one file per user flow.
- `pages/` — Page Object classes, one per screen, all extending
  `pages/BasePage.ts`.
- `.mcp.json` — configures the Playwright MCP server used for page
  exploration; reconnect MCP servers (or restart) after pulling changes to
  it.

## Known repo quirks

- Both `playwright.config.js` and `playwright.config.ts` exist at the root —
  a pre-existing duplication, not yet reconciled. `playwright.config.js` is
  the one with real settings (`testDir`, browser projects, `headless`);
  `playwright.config.ts` only sets `baseURL` from an env var. Check which one
  Playwright is actually picking up before assuming config changes take
  effect.
- `tests/` (outside `tests/e2e/`) has older specs written before this
  Page Object convention existed, with inline locators and some raw
  CSS/XPath selectors. Don't treat them as a style reference for new work.
