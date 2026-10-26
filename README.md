# Playwright Automation Tests

## 1. Overview

This project contains two automated test scripts developed using Playwright and JavaScript/TypeScript.

### Test 1: DemoQA Book Store

**Objective:** Search for a book, validate the search result, extract book details, and save them to a text file.

Website: https://demoqa.com/books

Test steps:
1. Navigate directly to the Book Store page.
2. Search for `Learning JavaScript Design Patterns`.
3. Validate that the book appears in the search results.
4. Extract the book's Title, Author, and Publisher.
5. Validate that the title matches the expected book and that the author and publisher are not empty.
6. Write the extracted details to `book-details.txt`.

**Expected output:** A text file containing the book's title, author, and publisher.

### Test 2: ReqRes API

**Objective:** Automate API requests to validate user creation, retrieval, and updating.

API base URL: https://reqres.in/

Test steps:
1. Create a user using a POST request.
2. Validate the HTTP status code (`201 Created`).
3. Extract and store the returned user ID.
4. Send a GET request and validate the response status and user details.
5. Update the user's name using a PUT request.
6. Validate the update response status (`200 OK`) and updated name.

**Note:** ReqRes demo endpoints may simulate CRUD operations without persisting created records. Retrieving the newly created user may therefore require a persistent backend or a different GET test strategy.

## 2. Prerequisites

- Node.js and npm installed.
- Visual Studio Code or another code editor.
- Playwright Test installed in the project.
- Internet access to reach the DemoQA and ReqRes websites.

## 3. Project Structure

```text
playwright-project/
├── tests/
│   ├── demoqa.spec.ts
│   └── reqres_api.spec.ts
├── book-details.txt
├── playwright.config.ts
├── package.json
└── README.md
```

Adjust the filenames and extensions to match the actual files in your project.

## 4. Installation

Install Playwright Test:

```bash
npm install -D @playwright/test
```

If the project uses a browser-based UI test, install Chromium:

```bash
npx playwright install chromium
```

## 5. Running the Tests

Run all tests:

```bash
npx playwright test
```

Run the DemoQA UI test:

```bash
npx playwright test tests/demoqa.spec.ts --headed
```

Run the ReqRes API test:

```bash
npx playwright test tests/reqres_api.spec.ts
```

Run all tests in headed mode:

```bash
npx playwright test --headed
```

API tests do not require a browser window unless the test explicitly launches one.

## 6. HTML Report Generation

Run the tests and generate an HTML report:

```bash
npx playwright test --reporter=html
```

Open the report:

```bash
npx playwright show-report
```

To generate both terminal output and an HTML report:

```bash
npx playwright test --reporter=list,html
```

The report is generated in the `playwright-report/` directory by default.

## 7. Validations

### DemoQA UI Test

- The requested book appears in the search results.
- The extracted title matches the expected title.
- The author field is not empty.
- The publisher field is not empty.
- The book details are written to a text file.

### ReqRes API Test

- User creation returns the expected HTTP status code.
- The API returns a user ID.
- GET requests return the expected status and response structure.
- Retrieved user details match the expected values for the selected GET endpoint.
- User update returns the expected status code.
- The updated name matches the value sent in the request.

## 8. Output Files

| File or directory | Purpose |
|---|---|
| `book-details.txt` | Stores the extracted book details |
| `playwright-report/` | Contains the HTML test report |
| `test-results/` | Contains test artifacts, if configured |

## 9. Troubleshooting

- **Test timeout:** Verify that the page or API response is available and the locator or endpoint is correct.
- **Book not found:** Confirm the search text and inspect the actual table structure.
- **API validation failure:** Inspect the response status and JSON body before changing assertions.
- **Report not opening:** Run `npx playwright show-report`.
- **ReqRes GET failure:** Check whether the requested ID exists in the API's supported dataset; demo CRUD endpoints may not persist created users.

## 10. Notes

- Keep test assertions aligned with the actual application or API response.
- Avoid hardcoding real passwords or API secrets in source control.
- Use meaningful test names and keep UI and API tests separate.
- Review the HTML report after execution to identify failed assertions and troubleshoot issues.
