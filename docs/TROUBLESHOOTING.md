# 🔧 Gracula Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue 1: Extension Won't Load

**Symptoms:**
- Error: "Could not load manifest"
- Extension doesn't appear in Chrome

**Solutions:**
1. **Check icons exist:**
   ```
   D:\ainput-main-decompiled\gracula-extension\icons\
   - icon16.png ✓
   - icon48.png ✓
   - icon128.png ✓
   ```

2. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click the refresh icon on Gracula card
   - Or remove and re-add the extension

3. **Check for errors:**
   - Click "Errors" button on extension card
   - Fix any reported issues

---

### Issue 2: WhatsApp Web Loading Slowly

**Symptoms:**
- WhatsApp Web takes forever to load
- Page is laggy or unresponsive
- Can't access chats

**Solutions:**
1. **Disable extension temporarily:**
   - Go to `chrome://extensions/`
   - Toggle OFF Gracula
   - Reload WhatsApp Web
   - Once loaded, toggle Gracula back ON
   - Refresh page

2. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cached images and files
   - Reload WhatsApp Web

3. **Check console for errors:**
   - Press `F12` to open DevTools
   - Go to Console tab
   - Look for 🧛 Gracula messages
   - Share any errors you see

---

### Issue 3: Floating Button Not Appearing

**Symptoms:**
- No 🧛 button visible on WhatsApp Web
- Button doesn't show up after clicking input field

**Solutions:**

#### Step 1: Check Extension is Active
1. Open WhatsApp Web: https://web.whatsapp.com
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Look for these messages:
   ```
   🧛 Gracula: ========================================
   🧛 Gracula: EXTENSION LOADED AND RUNNING
   🧛 Gracula: ✅ Detected platform - WhatsApp
   ```

5. If you DON'T see these messages:
   - Extension isn't loading
   - Go to `chrome://extensions/`
   - Make sure Gracula is enabled
   - Click refresh icon
   - Reload WhatsApp Web

#### Step 2: Check Input Field Detection
Look for this message in console:
```
🧛 Gracula: ✅ ATTACHED to input field
```

If you see:
```
🧛 Gracula: ⚠️ Input field not found yet
```

**Solutions:**
1. **Click on a chat** - Open any conversation
2. **Click the message input box** - The text field at bottom
3. **Wait 5 seconds** - Extension retries automatically
4. **Refresh the page** - Press F5

#### Step 3: Check Button is Created
In console, look for:
```
🧛 Gracula: ✅ Floating button added to page!
```

If you see this but no button visible:
1. **Check z-index conflicts:**
   - Some WhatsApp elements might be covering it
   - Button should be in bottom-right corner
   - Try scrolling the page

2. **Inspect the button:**
   - In DevTools, go to Elements tab
   - Press `Ctrl + F` and search for: `gracula-floating-btn`
   - Check if element exists
   - Check its CSS styles

#### Step 4: Force Button to Appear
Run this in Console:
```javascript
const btn = document.getElementById('gracula-floating-btn');
if (btn) {
  btn.style.position = 'fixed';
  btn.style.bottom = '80px';
  btn.style.right = '20px';
  btn.style.zIndex = '2147483647';
  btn.style.opacity = '1';
  btn.style.display = 'flex';
  console.log('Button forced to visible position');
} else {
  console.log('Button element not found');
}
```

---

### Issue 4: API Key Not Persisting

**Symptoms:**
- API key disappears after closing Chrome
- Have to re-enter API key every time
- Settings don't save

**Solutions:**

1. **Check storage permissions:**
   - Go to `chrome://extensions/`
   - Click "Details" on Gracula
   - Scroll to "Permissions"
   - Should see "Storage" permission

2. **Manually verify storage:**
   - Open any page
   - Press `F12` → Console
   - Run:
   ```javascript
   chrome.storage.sync.get(['apiConfig'], (result) => {
     console.log('Stored config:', result);
   });
   ```

3. **Re-save API key properly:**
   - Click Gracula icon in toolbar
   - Select "OpenAI"
   - Paste API key
   - Click "Save Settings"
   - Wait for success message
   - Close popup
   - Reload WhatsApp Web

4. **Check for sync issues:**
   - Make sure you're signed into Chrome
   - Chrome sync should be enabled
   - Try using `chrome.storage.local` instead (requires code change)

---

### Issue 5: "Error Generating Replies"

**Symptoms:**
- Click tone button
- See loading spinner
- Get error message

**Possible Causes & Solutions:**

#### A. API Key Not Set
**Error:** "API key is required"

**Solution:**
1. Click Gracula icon in Chrome toolbar
2. Make sure "OpenAI" is selected
3. Paste your API key:
   ```
   sk-proj-YOUR_OPENAI_API_KEY_HERE
   ```
4. Click "Save Settings"
5. Reload WhatsApp Web
6. Try again

#### B. Invalid API Key
**Error:** "401 Unauthorized" or "Invalid API key"

**Solution:**
1. Go to https://platform.openai.com/api-keys
2. Check if your API key is active
3. Try regenerating the key
4. Update in extension settings

#### C. No Credits / Rate Limit
**Error:** "429 Too Many Requests" or "Insufficient quota"

**Solution:**
1. Go to https://platform.openai.com/usage
2. Check your usage and credits
3. Add payment method if needed
4. Wait a minute if rate limited
5. Try again

#### D. Network Error
**Error:** "Failed to fetch" or "Network error"

**Solution:**
1. Check your internet connection
2. Try disabling VPN/proxy
3. Check if OpenAI is accessible: https://status.openai.com
4. Try again in a few minutes

---

### Issue 6: Button Appears But Nothing Happens When Clicked

**Symptoms:**
- Button is visible
- Click it but modal doesn't open
- No error messages

**Solutions:**

1. **Check console for errors:**
   - Press `F12`
   - Click the button
   - Look for error messages in Console

2. **Check if click is registered:**
   - Should see: `🧛 Gracula: Button clicked!`
   - If not, button click listener isn't working

3. **Try clicking different areas:**
   - Click center of button
   - Try clicking the emoji
   - Try clicking the border

4. **Force open modal:**
   Run in console:
   ```javascript
   // Find the Gracula instance
   const graculaBtn = document.getElementById('gracula-floating-btn');
   if (graculaBtn) {
     graculaBtn.click();
   }
   ```

---

### Issue 7: Replies Are Low Quality or Irrelevant

**Symptoms:**
- Replies don't match conversation
- Replies are generic
- Wrong tone

**Solutions:**

1. **Make sure conversation context is extracted:**
   - Have an actual conversation first (5+ messages)
   - Check console for: `🧛 Gracula: Generating replies...`

2. **Try different tones:**
   - Some tones work better for certain situations
   - Try "Default" or "Formal" first

3. **Switch to GPT-4:**
   - Click Gracula icon
   - Change model to "GPT-4"
   - Save settings
   - Try again (better quality but slower/more expensive)

4. **Check context extraction:**
   Run in console:
   ```javascript
   // Check what messages are being extracted
   const messages = document.querySelectorAll('span.selectable-text');
   console.log('Found messages:', messages.length);
   Array.from(messages).slice(-5).forEach(m => {
     console.log('Message:', m.textContent);
   });
   ```

---

## 🔍 Debug Mode

### Enable Verbose Logging

The extension already logs extensively. To see all logs:

1. Open WhatsApp Web
2. Press `F12` → Console tab
3. Look for messages starting with `🧛 Gracula:`

### Key Log Messages to Look For:

```
✅ Good Signs:
🧛 Gracula: EXTENSION LOADED AND RUNNING
🧛 Gracula: ✅ Detected platform - WhatsApp
🧛 Gracula: ✅ ATTACHED to input field
🧛 Gracula: ✅ Floating button added to page!
🧛 Gracula: Button clicked!
🧛 Gracula: Generating replies...

⚠️ Warning Signs:
🧛 Gracula: ⚠️ Input field not found yet
🧛 Gracula: ⚠️ Platform not supported
🧛 Gracula: No button to position

❌ Error Signs:
🧛 Gracula: Error generating replies
🧛 Gracula: Error positioning button
```

---

## 🧪 Manual Testing Steps

### Test 1: Extension Loads
1. Go to `chrome://extensions/`
2. Find Gracula
3. Should show "Enabled" with no errors
4. ✅ PASS if no errors

### Test 2: WhatsApp Detection
1. Open https://web.whatsapp.com
2. Press F12 → Console
3. Should see: `🧛 Gracula: ✅ Detected platform - WhatsApp`
4. ✅ PASS if detected

### Test 3: Input Field Detection
1. Click on any chat
2. Click message input box
3. Wait 5 seconds
4. Console should show: `🧛 Gracula: ✅ ATTACHED to input field`
5. ✅ PASS if attached

### Test 4: Button Appears
1. Look for 🧛 button
2. Should be visible (bottom-right or near input)
3. Should have purple gradient background
4. Should pulse/animate
5. ✅ PASS if visible

### Test 5: Button Click
1. Click the 🧛 button
2. Modal should open
3. Should see 11 tone options
4. Should see conversation context
5. ✅ PASS if modal opens

### Test 6: Reply Generation
1. Click any tone (e.g., "Funny")
2. Should see loading spinner
3. Wait 2-5 seconds
4. Should see 3 replies
5. ✅ PASS if replies appear

### Test 7: Reply Insertion
1. Click "Insert" on any reply
2. Modal should close
3. Reply should appear in input box
4. Should be able to edit it
5. ✅ PASS if inserted

---

## 📞 Still Having Issues?

### Collect Debug Information:

1. **Extension version:**
   - Go to `chrome://extensions/`
   - Find Gracula
   - Note the version number

2. **Console logs:**
   - Press F12 → Console
   - Copy all 🧛 Gracula messages
   - Include any error messages

3. **Browser info:**
   - Chrome version
   - Operating system
   - Any other extensions installed

4. **Steps to reproduce:**
   - What you did
   - What you expected
   - What actually happened

---

## 🎯 Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Extension won't load | Check icons exist, reload extension |
| WhatsApp slow | Disable extension, reload page, re-enable |
| Button not appearing | Open chat, click input, wait 5 seconds, refresh |
| API key not saving | Re-enter key, wait for success message, reload page |
| Error generating replies | Check API key, check OpenAI credits, try again |
| Button doesn't work | Check console for errors, try force-clicking |
| Low quality replies | Use GPT-4, have longer conversation first |

---

**Made with 🧛 by Gracula Team**

*This must work!*

