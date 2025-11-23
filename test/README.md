# Test Files

This directory contains test files for the Gracula extension.

## Files

### test-whatsapp-group.html
A standalone HTML test page that simulates a WhatsApp group chat interface for testing the extension's context extraction functionality.

**Features:**
- Simulates WhatsApp Web DOM structure
- Contains sample messages with various date labels (Today, Yesterday, DD/MM/YYYY)
- Includes test controls for:
  - Loading extension scripts
  - Testing message extraction
  - Testing speaker detection
  - Testing date grouping
- Displays extraction results and conversation context

**Usage:**
1. Open the file in a web browser: `file:///path/to/gracula-extension/test/test-whatsapp-group.html`
2. Click "Load Extension Scripts" to load all necessary extension modules
3. Click "Test Message Extraction" to run the full extraction test
4. Review the results in the output panel

**Test Data:**
The test file contains 15 messages across 5 date groups:
- 📅 29/9/2025: 2 messages
- 📅 21/9/2025: 1 message (with quoted reply)
- 📅 22/9/2025: 3 messages
- Yesterday: 7 messages
- Today: 2 messages

## Running Tests

### Manual Testing
Open `test-whatsapp-group.html` in a browser and use the test controls.

### Automated Testing

#### System Banner Filter Tests
Tests the logic that filters out WhatsApp E2E encryption banners:
```bash
node test/test-system-banner-filter.js
```
Tests 9 different scenarios including:
- Full E2E banners (chat and group)
- Banners with extra whitespace
- Normal user messages
- Edge cases (null, empty strings, partial banners)

#### Reply to Last Message Integration Tests
Tests the full flow of message extraction, filtering, and last message selection:
```bash
node test/test-reply-last-message-integration.js
```
Tests the user's actual conversation scenario:
- Filters out the E2E encryption banner
- Correctly identifies the last human message from Shohan
- Ensures reply generation uses the correct context

#### Browser-based Tests (Playwright)
```bash
npm run test:last-message
```
Note: Requires Playwright browsers to be installed (`npx playwright install`)

## Adding New Tests

When adding new test files:
1. Place them in this `test/` directory
2. Update this README with a description
3. Ensure test files use relative paths to reference source files (e.g., `../src/...`)

