# 🔄 Extension Reload Instructions

## ⚠️ IMPORTANT: Reload Extension First!

Before testing, you **MUST** reload the Chrome extension to pick up the new context-aware code changes.

### Step-by-Step Reload Process:

1. **Open Chrome Extensions Page**
   - Type in address bar: `chrome://extensions/`
   - OR click the puzzle icon → "Manage Extensions"

2. **Find Gracula Extension**
   - Look for "Gracula AI Reply" or "Gracula" in the list
   - It should show as "Loaded unpacked"

3. **Click the Reload Button**
   - Find the circular arrow icon (🔄) on the Gracula extension card
   - Click it to reload the extension
   - You should see a brief "Reloading..." message

4. **Verify Reload**
   - The extension should still be enabled (toggle switch is blue/on)
   - No error messages should appear

5. **Refresh WhatsApp Web**
   - Go to your WhatsApp Web tab
   - Press `F5` or `Ctrl+R` to refresh the page
   - Wait for WhatsApp to fully load

### ✅ Verification Checklist

After reloading, verify:
- [ ] Extension shows as "Loaded unpacked" (not "Packed extension")
- [ ] No errors in the extension card
- [ ] WhatsApp Web page refreshed successfully
- [ ] Purple Gracula button appears when you open a chat

### 🐛 Troubleshooting

**If the extension doesn't reload:**
1. Try disabling and re-enabling it
2. Remove the extension and load it again from the `src/` folder
3. Check Chrome DevTools console for errors

**If WhatsApp doesn't show the button:**
1. Make sure you're on `web.whatsapp.com`
2. Open a chat with message history
3. Wait a few seconds for the page to fully load
4. Check browser console (F12) for any errors

### 📊 How to Verify New Code is Running

After reload, open a chat and click the Gracula button. Then:

1. **Open Browser Console** (F12)
2. **Click a tone button** (e.g., "Funny")
3. **Look for these NEW console logs**:
   ```
   🧛 Gracula: Generating context-aware mock replies
   🧛 Gracula: Detected tone: funny
   🧛 Gracula: Last message: [message text]
   🧛 Gracula: Topics: paypal, bhai, taka
   ```

**If you DON'T see these logs**, the extension is still using the old cached code. Try:
1. Close ALL Chrome windows
2. Reopen Chrome
3. Reload the extension again
4. Test again

---

## 🎯 Ready to Test?

Once you've completed the reload steps above, you're ready to run the automated tests!

The test will verify:
- ✅ Context extraction is working
- ✅ Topics are being identified
- ✅ Replies reference the conversation topics
- ✅ Language mix is appropriate
- ✅ Style matches the conversation

