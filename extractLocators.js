const { chromium } = require('playwright');

/**
 * Launches a browser, navigates to a URL, and extracts
 * all meaningful locators from the page using Playwright.
 *
 * @param {string} url - The URL to extract locators from.
 * @returns {Promise<Array<Object>>} Array of locator objects.
 */
async function extractLocators(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle' });

  // ---------------------------------------------------------------------------
  // Evaluate runs inside the browser context — gives us raw DOM data.
  // We then map it into Playwright-style locator strings outside.
  // ---------------------------------------------------------------------------
  const rawElements = await page.evaluate(() => {
    // Only interactive elements — things a user can click, type into, or toggle
    const interactiveRoles = [
      'button', 'link', 'textbox', 'checkbox', 'radio',
      'combobox', 'listbox', 'switch', 'tab', 'menuitem',
      'menu', 'option', 'searchbox', 'spinbutton', 'slider',
      'progressbar', 'scrollbar', 'separator', 'treeitem',
    ];

    const roleSelector = interactiveRoles.map((r) => `[role="${r}"]`).join(', ');

    const targets = document.querySelectorAll(
      'input, button, a[href], select, textarea, ' +
      roleSelector + ', ' +
      '[tabindex]:not([tabindex="-1"]), ' +
      '[contenteditable="true"]'
    );

    const seen = new Set();
    const results = [];

    targets.forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);

      const entry = {
        tag: el.tagName.toLowerCase(),
        type: el.type || null,
        id: el.id || null,
        name: el.getAttribute('name') || null,
        classes: el.classList.length ? Array.from(el.classList) : null,
        placeholder: el.getAttribute('placeholder') || null,
        role: el.getAttribute('role') || null,
        ariaLabel: el.getAttribute('aria-label') || null,
        text: (el.innerText || el.textContent || '').trim().substring(0, 120) || null,
        href: el.getAttribute('href') || null,
        dataAttrs: {},
      };

      // Collect all data-* attributes
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith('data-')) {
          entry.dataAttrs[attr.name] = attr.value;
        }
      });

      results.push(entry);
    });

    return results;
  });

  // ---------------------------------------------------------------------------
  // Map raw DOM data into Playwright locator strategies + validate them.
  // ---------------------------------------------------------------------------
  const locators = [];

  for (const el of rawElements) {
    const entry = {
      tag: el.tag,
      type: el.type,
      text: el.text,
      ariaLabel: el.ariaLabel,
      placeholder: el.placeholder,
      name: el.name,
      id: el.id,
      strategies: {},
    };

    // --- By ID ---
    if (el.id) {
      const loc = page.locator(`#${el.id}`);
      entry.strategies.byId = {
        locator: `#${el.id}`,
        count: await loc.count(),
      };
    }

    // --- By Name ---
    if (el.name) {
      const loc = page.locator(`[name="${el.name}"]`);
      entry.strategies.byName = {
        locator: `[name="${el.name}"]`,
        count: await loc.count(),
      };
    }

    // --- By Placeholder ---
    if (el.placeholder) {
      const loc = page.locator(`[placeholder="${el.placeholder}"]`);
      entry.strategies.byPlaceholder = {
        locator: `page.locator('placeholder=${el.placeholder}')`,
        count: await loc.count(),
      };
    }

    // --- By Role + Name (aria-label or visible text) ---
    if (el.role) {
      const accessible = el.ariaLabel || el.text;
      if (accessible) {
        const loc = page.locator(`[role="${el.role}"]`).filter({ hasText: accessible.substring(0, 60) });
        entry.strategies.byRole = {
          locator: `page.getByRole('${el.role}', { name: '${accessible.substring(0, 60)}' })`,
          count: await loc.count(),
        };
      } else {
        const loc = page.locator(`[role="${el.role}"]`);
        entry.strategies.byRole = {
          locator: `page.getByRole('${el.role}')`,
          count: await loc.count(),
        };
      }
    }

    // --- By Aria-Label ---
    if (el.ariaLabel) {
      const loc = page.locator(`[aria-label="${el.ariaLabel}"]`);
      entry.strategies.byAriaLabel = {
        locator: `page.getByLabelText('${el.ariaLabel}')`,
        count: await loc.count(),
      };
    }

    // --- By Text (buttons and links only — the interactive text elements) ---
    if ((el.tag === 'button' || el.tag === 'a') && el.text) {
      const loc = page.locator(`${el.tag}:has-text("${el.text.substring(0, 60)}")`);
      entry.strategies.byText = {
        locator: `page.getByText('${el.text.substring(0, 60)}')`,
        count: await loc.count(),
      };
    }

    // --- By href (links) ---
    if (el.tag === 'a' && el.href) {
      const loc = page.locator(`a[href="${el.href}"]`);
      entry.strategies.byHref = {
        locator: `a[href="${el.href}"]`,
        count: await loc.count(),
      };
    }


    // --- By CSS Class ---
    if (el.classes) {
      const cssClass = el.classes.map((c) => `.${c}`).join('');
      const loc = page.locator(`${el.tag}${cssClass}`);
      entry.strategies.byClass = {
        locator: `${el.tag}${cssClass}`,
        count: await loc.count(),
      };
    }

    // --- By Data Attributes ---
    for (const [attr, value] of Object.entries(el.dataAttrs)) {
      const loc = page.locator(`[${attr}="${value}"]`);
      entry.strategies[`by_${attr}`] = {
        locator: `[${attr}="${value}"]`,
        count: await loc.count(),
      };
    }

    locators.push(entry);
  }

  await browser.close();
  return locators;
}

// ---------------------------------------------------------------------------
// Helper: filters results to only return UNIQUE locators (count === 1).
// Useful when you only want reliable, non-ambiguous locators.
// ---------------------------------------------------------------------------
function filterUniqueLocators(locators) {
  return locators.map((el) => {
    const unique = {};
    for (const [key, strategy] of Object.entries(el.strategies)) {
      if (strategy.count === 1) {
        unique[key] = strategy;
      }
    }
    return { tag: el.tag, type: el.type, strategies: unique };
  }).filter((el) => Object.keys(el.strategies).length > 0);
}

// ---------------------------------------------------------------------------
// Helper: Formats locators into a clean, readable output
// ---------------------------------------------------------------------------
function formatOutput(locators) {
  const results = [];

  locators.forEach((el) => {
    // Determine a human-readable name for the element
    let elementName = 'Unknown';
    
    // Priority 1: Actual visible text (what user sees in UI)
    if (el.text && el.text.trim()) {
      elementName = el.text.trim();
    } 
    // Priority 2: Aria-label (accessibility name)
    else if (el.ariaLabel) {
      elementName = `[${el.ariaLabel}]`;
    } 
    // Priority 3: Placeholder (for inputs)
    else if (el.placeholder) {
      elementName = `[${el.placeholder}]`;
    } 
    // Priority 4: Name attribute
    else if (el.name) {
      elementName = `[name: ${el.name}]`;
    } 
    // Priority 5: ID
    else if (el.id) {
      elementName = `[id: ${el.id}]`;
    } 
    // Fallback: Show element type
    else {
      elementName = `<${el.tag}${el.type ? ` type="${el.type}"` : ''}>`;
    }

    // Extract each strategy into a separate row
    Object.entries(el.strategies).forEach(([strategyType, strategy]) => {
      results.push({
        'Element Name': elementName.substring(0, 80), // Increased from 50 to show more text
        'Element Type': el.tag,
        'Locator Type': strategyType,
        'Locator': strategy.locator,
        'Count': strategy.count,
      });
    });
  });

  return results;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
(async () => {
  const TARGET_URL = 'https://demo.automationtesting.in/Register.html'; // <-- Change this to your target URL

  console.log(`\n🔍 Extracting interactive elements from: ${TARGET_URL}\n`);

  const allLocators = await extractLocators(TARGET_URL);
  const uniqueLocators = filterUniqueLocators(allLocators);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('           UNIQUE LOCATORS (Recommended)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const uniqueOutput = formatOutput(uniqueLocators);
  console.table(uniqueOutput);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('              ALL LOCATORS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const allOutput = formatOutput(allLocators);
  console.table(allOutput);

  console.log(`\n📊 Summary:`);
  console.log(`   Total interactive elements: ${allLocators.length}`);
  console.log(`   Elements with unique locators: ${uniqueLocators.length}\n`);
})();