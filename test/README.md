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
Currently, tests are manual. Future improvements could include:
- Automated browser testing with Playwright or Puppeteer
- Unit tests for individual modules
- Integration tests for the full extension

## Adding New Tests

When adding new test files:
1. Place them in this `test/` directory
2. Update this README with a description
3. Ensure test files use relative paths to reference source files (e.g., `../src/...`)

