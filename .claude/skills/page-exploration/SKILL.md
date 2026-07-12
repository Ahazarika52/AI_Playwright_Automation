---
name: page-exploration
description: How to map a live web page or user flow using the Playwright MCP browser tools before writing any Page Object or spec. Use this first whenever automating a page or flow that isn't already covered by an existing Page Object — before writing a single locator, actually open the page and see what's there instead of guessing from memory or a screenshot.
---

# Mapping a page before writing a test

A locator written from memory or from staring at a screenshot is a guess.
The Playwright MCP server gives you a real browser, so use it to find out
what a page's accessible structure actually is before handing anything to
`selector-strategy`.

## Steps

1. **Navigate** to the target URL with the browser tool.
2. **Snapshot the accessibility tree**, not a screenshot, as your primary
   source of truth. The accessibility snapshot gives you each element's role,
   accessible name, and a ref you can act on directly — that's exactly the
   vocabulary `selector-strategy` turns into `getByRole`/`getByLabel`/etc.
   calls. A screenshot only tells you what something looks like, not how to
   address it reliably.
3. **Dismiss anything blocking the real page first** — cookie banners,
   interstitials, login walls — before snapshotting, or you'll map the
   overlay instead of the page underneath.
4. **Re-snapshot after every state-changing interaction.** Refs and the tree
   itself change once you click, submit, or search — a ref from before an
   action is not guaranteed to still resolve to the same thing afterward.
   Map each step of a multi-step flow (e.g. search → results → product page
   → cart confirmation) as its own snapshot, not one snapshot for the whole
   flow.
5. **Fall back only when the tree doesn't help.** If an element has no
   useful role or accessible name (a custom widget, a div-soup component),
   inspect the DOM directly (e.g. evaluate in-page JS) for a `data-testid` or
   other stable attribute before resorting to a screenshot for purely visual
   confirmation.

## What to carry forward

For each element the test will interact with or assert on, record: its role,
its accessible name (or the testid/attribute you fell back to), and which
step of the flow it belongs to. Hand that list to `selector-strategy` — this
skill's job ends at "here's what's on the page," not "here's the code."

This exploration is throwaway. None of the browser session itself becomes
part of the test — only the locator knowledge it produced does.
