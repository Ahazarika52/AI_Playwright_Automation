
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

test('Search book and save book details', async ({ page }) => {
  // 1. Navigate directly to the Book Store page
  await page.goto('https://demoqa.com/books', { timeout: 60000 });
 // await page.waitForSelector('.rt-table', { timeout: 60000 });

  // 2. Search for the required book
  const bookTitle = 'Learning JavaScript Design Patterns';
  await page.locator('#searchBox').fill(bookTitle);
 
  // 4. Locate the book using its actual link
  const bookLink = page.locator(
    `a[href="/books?search=9781449331818"]`
  );

  await expect(bookLink).toBeVisible();

  // 5. Locate the table row containing the book
  const bookRow = page.locator('tbody tr').filter({
    has: bookLink
  }).first({ timeout: 90000 });

  await expect(bookRow).toHaveCount(1);

  // 6. Extract Title, Author and Publisher
  const cells = bookRow.locator('td');

  const title = (await cells.nth(1).innerText()).trim();
  const author = (await cells.nth(2).innerText()).trim();
  const publisher = (await cells.nth(3).innerText()).trim();

  // 7. Validate the result
  expect(title).toBe(bookTitle);
  expect(author).not.toBe('');
  expect(publisher).not.toBe('');

  console.log('Title:', title);
  console.log('Author:', author);
  console.log('Publisher:', publisher);


  // 6. Write the details to a text file
  const outputPath = path.resolve(
    process.cwd(),
    'book-details.txt'
  );

  const content = [
    'Book Details',
    '============',
    `Title: ${title}`,
    `Author: ${author}`,
    `Publisher: ${publisher}`,
    ''
  ].join('\n');

  fs.writeFileSync(outputPath, content, 'utf8');

  console.log(content);
  console.log(`File saved at: ${outputPath}`);
});
