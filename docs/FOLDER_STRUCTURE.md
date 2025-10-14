# 📁 Folder Structure Guide

## Overview

The Gracula extension is organized into four main directories for clarity and maintainability:

```
gracula-extension/
├── src/          # Extension source code
├── docs/         # Documentation
├── tools/        # Utility scripts
└── test/         # Test files
```

---

## 📂 Directory Details

### `src/` - Extension Source Code

**Purpose**: Contains all files needed to run the Chrome extension.

**Contents**:
- `manifest.json` - Chrome extension configuration file
- `config.js` - Configuration, tones, and platform selectors
- `content.js` - Main content script (runs on messaging platforms)
- `background.js` - Service worker (handles API calls)
- `popup.html` - Settings popup UI
- `popup.js` - Settings popup logic
- `styles.css` - All UI styling
- `icons/` - Extension icons (16px, 48px, 128px)

**When loading the extension**:
- Point Chrome to the `src/` folder
- Chrome will read `manifest.json` and load all files from there

**Key Files**:
- **manifest.json** - Defines extension metadata, permissions, and file references
- **config.js** - 11 tone definitions and platform-specific selectors
- **content.js** - ~350 lines, main logic for UI injection and reply generation
- **background.js** - API handler for OpenAI and Hugging Face

---

### `docs/` - Documentation

**Purpose**: All project documentation and guides.

**Contents**:
- `README.md` - Full documentation and feature overview
- `QUICK_START.md` - Get started in 5 minutes
- `SETUP_GUIDE.md` - Detailed setup instructions
- `TESTING_GUIDE.md` - How to test the extension
- `ARCHITECTURE.md` - Technical architecture overview
- `TROUBLESHOOTING.md` - Common issues and solutions
- `OPENAI_SETUP.md` - OpenAI API integration guide
- `CODE_VERIFICATION.md` - Code verification checklist
- `CONTEXT_FEATURE.md` - Context extraction documentation
- `PERFORMANCE_FIX.md` - Performance optimization notes
- `PROJECT_SUMMARY.md` - Project summary
- `QUICK_FIX.md` - Quick fixes for common issues
- `START_HERE_OPENAI.md` - OpenAI setup guide
- `INSTALLATION_CHECKLIST.txt` - Installation checklist

**Start Here**: `QUICK_START.md` or `SETUP_GUIDE.md`

---

### `tools/` - Utility Scripts

**Purpose**: Helper scripts and tools for development and setup.

**Contents**:
- `create-icons.html` - Interactive icon generator
- `create-simple-icons.html` - Simple icon generator
- `generate-icons.js` - Icon generation script
- `DOWNLOAD_ICONS_HERE.html` - Icon download guide

**Usage**:
- Open `create-icons.html` in a browser to generate extension icons
- Icons must be saved to `src/icons/` folder

---

### `test/` - Test Files

**Purpose**: Reserved for unit tests and integration tests.

**Current Status**: Empty (ready for tests)

**Future Use**:
- Unit tests for individual functions
- Integration tests for extension functionality
- Test utilities and helpers

**Structure** (when populated):
```
test/
├── unit/
│   ├── config.test.js
│   ├── content.test.js
│   └── background.test.js
├── integration/
│   └── extension.test.js
└── fixtures/
    └── mock-data.js
```

---

## 🔄 File References

### manifest.json References

The `manifest.json` file in `src/` references:
- `config.js` - Content script
- `content.js` - Content script
- `styles.css` - Content script styles
- `background.js` - Service worker
- `popup.html` - Popup UI
- `icons/*` - Extension icons

All paths are relative to the `src/` folder, so they work correctly when loading the extension.

---

## 📝 Adding New Files

### Adding a New Feature

1. **Source Code**: Add to `src/` folder
2. **Tests**: Add to `test/` folder
3. **Documentation**: Add to `docs/` folder
4. **Update manifest.json**: If adding new scripts or resources

### Adding Documentation

1. Create `.md` file in `docs/` folder
2. Link from `docs/README.md` if it's important
3. Follow existing documentation style

### Adding Tests

1. Create test file in `test/` folder
2. Follow naming convention: `*.test.js`
3. Update test runner configuration

---

## 🚀 Loading the Extension

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the **`src/`** folder (not the root folder!)
5. Extension is now loaded

---

## 📦 Distribution

When distributing the extension:
- Only the `src/` folder is needed
- `docs/`, `tools/`, and `test/` are for development
- Create a `.zip` file of the `src/` folder for distribution

---

## 🔍 Quick Reference

| Folder | Purpose | Load in Chrome? |
|--------|---------|-----------------|
| `src/` | Extension code | ✅ Yes |
| `docs/` | Documentation | ❌ No |
| `tools/` | Utility scripts | ❌ No |
| `test/` | Tests | ❌ No |

---

## 💡 Best Practices

1. **Keep `src/` clean** - Only extension files
2. **Document changes** - Update `docs/` when making changes
3. **Add tests** - Put tests in `test/` folder
4. **Use tools** - Keep utility scripts in `tools/` folder
5. **Update manifest** - If adding new files to `src/`

---

For more information, see the documentation in the `docs/` folder.

