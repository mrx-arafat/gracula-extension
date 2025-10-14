# 🚀 How to Load Gracula Extension in Chrome

## ⚠️ IMPORTANT: Load the `src/` Folder, NOT the Root Folder!

The manifest.json file is located in the **`src/`** folder, so you must load that specific folder.

---

## ✅ Correct Loading Steps

### Step 1: Open Chrome Extensions Page
1. Open Google Chrome
2. Go to: `chrome://extensions/`
3. Or click: Menu (⋮) → Extensions → Manage Extensions

### Step 2: Enable Developer Mode
1. Look at the top-right corner
2. Toggle **"Developer mode"** to ON
3. You'll see new buttons appear

### Step 3: Load the Extension
1. Click **"Load unpacked"** button
2. Navigate to: `D:\gracula-extension\src\`
3. Select the **`src`** folder (NOT the root `gracula-extension` folder!)
4. Click **"Select Folder"**

### Step 4: Verify Installation
✅ You should see:
- Extension name: "Gracula - AI Reply Assistant"
- Version: 1.0.0
- Status: Enabled
- Icon: 🧛 Gracula icon

---

## 🔴 Common Mistake

### ❌ WRONG: Loading the Root Folder
```
D:\gracula-extension\  ← DON'T LOAD THIS!
```
**Error**: "Manifest file is missing or unreadable"

### ✅ CORRECT: Loading the src/ Folder
```
D:\gracula-extension\src\  ← LOAD THIS!
```
**Success**: Extension loads correctly

---

## 📁 Why Load the `src/` Folder?

The extension is organized like this:

```
gracula-extension/          ← Root folder (DON'T LOAD)
├── src/                    ← Extension folder (LOAD THIS!)
│   ├── manifest.json       ← Chrome looks for this file
│   ├── config.js
│   ├── content.js
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   ├── styles.css
│   └── icons/
├── docs/                   ← Documentation (not part of extension)
├── tools/                  ← Utilities (not part of extension)
└── test/                   ← Tests (not part of extension)
```

Chrome needs to find `manifest.json` in the root of the folder you select. Since `manifest.json` is in the `src/` folder, you must load the `src/` folder.

---

## 🔍 Verification Checklist

Before loading, verify these files exist in `src/`:

- [x] `src/manifest.json` ✅
- [x] `src/config.js` ✅
- [x] `src/content.js` ✅
- [x] `src/background.js` ✅
- [x] `src/popup.html` ✅
- [x] `src/popup.js` ✅
- [x] `src/styles.css` ✅
- [x] `src/icons/icon16.png` ✅
- [x] `src/icons/icon48.png` ✅
- [x] `src/icons/icon128.png` ✅

**All files present!** ✅

---

## 🎯 Quick Reference

| Action | Path |
|--------|------|
| **Load in Chrome** | `D:\gracula-extension\src\` |
| **Manifest location** | `D:\gracula-extension\src\manifest.json` |
| **Documentation** | `D:\gracula-extension\docs\` |
| **Tools** | `D:\gracula-extension\tools\` |

---

## 🔧 After Loading

### Configure API Key
1. Click the Gracula icon in Chrome toolbar
2. Enter your OpenAI or Hugging Face API key
3. Select your preferred model
4. Click "Save Settings"

### Test the Extension
1. Go to WhatsApp Web: `https://web.whatsapp.com/`
2. Open a chat
3. Look for the 🧛 Gracula button near the message input
4. Click it and select a tone
5. Get AI-generated replies!

---

## 🆘 Troubleshooting

### Error: "Manifest file is missing or unreadable"
**Cause**: You loaded the wrong folder  
**Solution**: Load `D:\gracula-extension\src\` instead of `D:\gracula-extension\`

### Error: "Failed to load extension"
**Cause**: Files are missing or corrupted  
**Solution**: Verify all files exist in `src/` folder (see checklist above)

### Extension loads but doesn't work
**Cause**: API key not configured  
**Solution**: Click extension icon and add your API key

### Button doesn't appear on websites
**Cause**: Page needs refresh  
**Solution**: Reload the messaging platform page

---

## 📝 Summary

**To load Gracula extension:**

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `D:\gracula-extension\src\` folder
5. Done! ✅

**Remember**: Always load the **`src/`** folder, not the root folder!

---

For more help, see:
- `docs/QUICK_START.md` - Quick start guide
- `docs/SETUP_GUIDE.md` - Detailed setup
- `docs/TROUBLESHOOTING.md` - Common issues

