# Playwright Automation

End-to-end UI test automation built with [Playwright](https://playwright.dev/), organized around the Page Object Model, with an AI-assisted workflow for exploring live pages and scaffolding new tests.

## Tech stack

- [`@playwright/test`](https://playwright.dev/docs/intro) — test runner and browser automation
- TypeScript / JavaScript (mixed — see [Project structure](#project-structure))
- [Playwright MCP](https://github.com/microsoft/playwright-mcp) — drives a live browser for page exploration when authoring new tests via Claude Code

## Getting started

### Prerequisites

- Node.js and npm
- Playwright's browser binaries (installed via the step below)

### Install

```bash
npm install
npx playwright install
```

### Run the tests

```bash
# run everything
npx playwright test

# a single file, one browser, headed (useful while writing/debugging a test)
npx playwright test tests/e2e/login.spec.ts --project=chromium --headed

# view the HTML report from the last run
npx playwright show-report
```

## Project structure

```
tests/
├── e2e/            # Page-Object-based specs (the current convention — start here)
└── ...             # older specs predating the POM convention (see note below)

pages/
└── BasePage.ts     # shared base class every Page Object extends

.claude/
├── agents/
│   └── playwright-test-writer.md   # subagent that writes a new test end-to-end
└── skills/
    ├── page-exploration/           # map a live page via the Playwright MCP browser tools
    ├── selector-strategy/          # locator priority rules (role/label/text/testid before CSS/XPath)
    ├── test-scaffolding/           # file/naming conventions, POM shape, and templates
    └── test-validation/            # run, read failures, fix, trace viewer

.mcp.json           # configures the Playwright MCP server used for page exploration
CLAUDE.md           # points Claude Code at the conventions above
playwright.config.js
```

## Writing a new test

New tests follow the Page Object Model:

1. **Explore** the live page (accessibility snapshot, not guesswork) to see what's actually there.
2. **Choose locators** in priority order: `getByRole` → `getByLabel`/`getByPlaceholder` → `getByText` → `getByTestId` → CSS/XPath as a last resort.
3. **Scaffold** a Page Object under `pages/` (extending `BasePage`) and a spec under `tests/e2e/`, following the templates in `.claude/skills/test-scaffolding/templates/`.
4. **Validate** by actually running the test and fixing failures — a test isn't done until it's been watched to pass.

If you're using Claude Code in this repo, the `playwright-test-writer` subagent runs this whole workflow for you — just ask it to write a test for a given page or flow. See [`CLAUDE.md`](CLAUDE.md) for the full breakdown.

## Known quirks

- **Two Playwright configs exist**: `playwright.config.js` (the one with real settings — `testDir`, browser projects, `headless`) and `playwright.config.ts` (only sets `baseURL` from an env var). This is a pre-existing duplication that hasn't been reconciled yet — check which one is actually active before assuming a config change takes effect.
- **`tests/` (outside `tests/e2e/`)** holds earlier specs written before the Page Object convention existed, with inline locators and, in places, raw CSS/XPath selectors or unfinished code. They're kept for reference but aren't the style to follow for new tests.

## License

ISC
