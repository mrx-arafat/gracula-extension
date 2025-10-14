# 🧛 START HERE - Gracula Extension

Welcome! Your codebase has been professionally organized. Here's everything you need to know.

---

## 📁 New Structure

```
gracula-extension/
├── src/          ← Extension code (LOAD THIS IN CHROME)
├── docs/         ← All documentation
├── tools/        ← Utility scripts
└── test/         ← Test files (ready for use)
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Load the Extension
```
1. Open Chrome: chrome://extensions/
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the "src/" folder
5. Done! ✅
```

### Step 2: Configure API Key
```
1. Click the Gracula icon in Chrome
2. Enter your OpenAI or Hugging Face API key
3. Save settings
4. Done! ✅
```

### Step 3: Test It
```
1. Go to WhatsApp Web (or any supported platform)
2. Click the 🧛 Gracula button
3. Select a tone
4. Get AI-generated replies!
```

---

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **QUICK_START.md** | Get started in 5 minutes | 5 min |
| **SETUP_GUIDE.md** | Detailed setup instructions | 10 min |
| **README.md** | Full documentation | 15 min |
| **TESTING_GUIDE.md** | How to test the extension | 10 min |
| **ARCHITECTURE.md** | Technical overview | 15 min |
| **TROUBLESHOOTING.md** | Common issues & fixes | 10 min |
| **OPENAI_SETUP.md** | OpenAI integration | 10 min |

**👉 Start with**: `docs/QUICK_START.md`

---

## 📂 What's Where

### `src/` - Extension Code
- **manifest.json** - Extension configuration
- **config.js** - Tones and platform settings
- **content.js** - Main functionality
- **background.js** - API handler
- **popup.html** - Settings UI
- **popup.js** - Settings logic
- **styles.css** - Styling
- **icons/** - Extension icons

### `docs/` - Documentation
- All guides and documentation
- Start with `QUICK_START.md`
- See `FOLDER_STRUCTURE.md` for details

### `tools/` - Utility Scripts
- **create-icons.html** - Generate extension icons
- **generate-icons.js** - Icon generation script

### `test/` - Test Files
- Ready for unit and integration tests
- See `docs/TESTING_GUIDE.md`

---

## ⚡ Important Notes

### ✅ Loading the Extension
- **Load the `src/` folder**, NOT the root folder
- Chrome will read `src/manifest.json` automatically
- All paths in manifest.json are correct

### ✅ File Structure
- No changes needed to manifest.json
- All relative paths work correctly
- Extension works exactly as before

### ✅ Development
- Edit files in `src/` folder
- Add tests to `test/` folder
- Update docs in `docs/` folder

---

## 🔧 Common Tasks

### Generate Icons
```
1. Open: tools/create-icons.html
2. Generate icons
3. Save to: src/icons/
```

### Add a New Feature
```
1. Edit: src/config.js (add tone/platform)
2. Edit: src/content.js (add logic)
3. Test: Load extension and test
4. Document: Update docs/
```

### Write Tests
```
1. Create: test/my-feature.test.js
2. Write: Unit tests
3. Run: See docs/TESTING_GUIDE.md
```

### Update Documentation
```
1. Edit: docs/*.md files
2. Link: From docs/README.md if important
3. Commit: Push to repository
```

---

## 📖 File References

### manifest.json
Located in `src/manifest.json`
- Defines extension metadata
- Lists permissions
- References all extension files
- All paths are relative to `src/`

### config.js
Located in `src/config.js`
- 11 tone definitions
- Platform-specific selectors
- API configuration

### content.js
Located in `src/content.js`
- Main extension logic (~350 lines)
- Platform detection
- UI injection
- Reply generation

### background.js
Located in `src/background.js`
- Service worker
- API calls (OpenAI, Hugging Face)
- Response handling

---

## 🎯 Next Steps

1. **Read**: `docs/QUICK_START.md` (5 minutes)
2. **Setup**: `docs/SETUP_GUIDE.md` (10 minutes)
3. **Load**: Load `src/` in Chrome (2 minutes)
4. **Configure**: Add API key (1 minute)
5. **Test**: Test on WhatsApp Web (5 minutes)
6. **Develop**: Make changes and test

---

## 💡 Pro Tips

- **Keep `src/` clean** - Only extension files
- **Document changes** - Update `docs/` when making changes
- **Add tests** - Put tests in `test/` folder
- **Use tools** - Keep utility scripts in `tools/` folder
- **Commit often** - Use `.gitignore` to keep repo clean

---

## 🆘 Need Help?

- **Setup issues**: See `docs/TROUBLESHOOTING.md`
- **API problems**: See `docs/OPENAI_SETUP.md`
- **Testing**: See `docs/TESTING_GUIDE.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Folder structure**: See `docs/FOLDER_STRUCTURE.md`

---

## ✅ Organization Checklist

- [x] Source code organized in `src/`
- [x] Documentation organized in `docs/`
- [x] Tools organized in `tools/`
- [x] Test folder created
- [x] Root README created
- [x] .gitignore created
- [x] Folder structure documented
- [x] manifest.json paths verified

**Status**: ✅ **COMPLETE** - Ready to develop!

---

## 📞 Quick Links

- **Root README**: `README.md`
- **Organization Summary**: `ORGANIZATION_SUMMARY.md`
- **Folder Structure**: `STRUCTURE_TREE.txt`
- **Documentation**: `docs/` folder
- **Extension Code**: `src/` folder

---

**Version**: 1.0.0  
**Last Updated**: October 14, 2025  
**Status**: ✅ Organized and Ready

👉 **Next**: Read `docs/QUICK_START.md` to get started!

