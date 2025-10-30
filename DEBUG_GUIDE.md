# Gracula Extension - Debug Guide

## 🎯 Complete Testing & Debugging Guide

This guide will help you systematically test and debug the Gracula extension using Playwright or manual testing.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup Verification](#initial-setup-verification)
3. [Feature-by-Feature Testing](#feature-by-feature-testing)
4. [Console Log Reference](#console-log-reference)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Playwright Test Scenarios](#playwright-test-scenarios)

---

## Prerequisites

### Required Setup:
1. Chrome browser with extension loaded
2. Valid API key (OpenAI, Google AI, or OpenRouter)
3. WhatsApp Web open in browser
4. Active conversation with messages
5. Browser console open (F12)

### Extension Check:
```
1. Go to chrome://extensions
2. Find "Gracula" extension
3. Verify it's enabled
4. Note the extension ID
```

---

## Initial Setup Verification

### Step 1: Extension Popup Works
```javascript
// Test: Click extension icon
Expected:
- Popup opens showing settings
- "Gracula" title visible
- API provider dropdown visible
- "Save Settings" button visible
```

### Step 2: Settings Save Properly
```javascript
// Test: Add API key and save
Steps:
1. Click extension icon
2. Select provider (OpenAI/Google/OpenRouter)
3. Enter API key
4. Click "Save Settings"

Expected Console Logs:
💾 Saving settings: {provider, hasApiKey, model}
✅ Settings saved successfully

Expected UI:
✓ Settings saved and applied in real-time! No reload needed.

Verify:
- Close popup
- Reopen popup
- API key should still be there ✅
```

### Step 3: Real-time Config Update Works
```javascript
// Test: Config updates without reload
Steps:
1. Open WhatsApp Web
2. Open console (F12)
3. In another tab, change API key in settings
4. Switch back to WhatsApp tab

Expected Console Logs:
⚙️ Config Updated: Settings changed, applying in real-time...
   New config: {provider, apiKey, ...}

Expected UI:
✅ Settings updated successfully! No reload needed.
```

---

## Feature-by-Feature Testing

### Feature 1: Gracula Button Appears

```javascript
// Test: Floating button visibility
Location: WhatsApp Web message input area
Expected: 🧛 purple floating button visible

Console Logs to Check:
✅ [GRACULA APP] Platform detected: WhatsApp
✅ [GRACULA APP] ContextExtractor created
✅ [GRACULA APP] Initialization complete

If Not Visible:
- Check console for errors
- Verify WhatsApp Web is fully loaded
- Try clicking in message input field
```

### Feature 2: Modal Opens with Correct Layout

```javascript
// Test: Click Gracula button
Steps:
1. Click 🧛 button

Expected Layout (Top to Bottom):
┌─────────────────────────────────────┐
│ 📝 Conversation Context:            │
│ [Edit] [Analysis]                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Friend: Message 1                   │
│ Friend: Message 2                   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [📝 Reply Last] [💬 Reply Friend*]  │ ← TABS
│ [✨ New Topic]                       │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 🤖 AI Mode [●──○] Toggle            │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Select Tone:                        │
│ [😊] [😂] [😎] [💼] [❤️] [😢]       │
└─────────────────────────────────────┘

Verify:
✅ Context viewer visible at top
✅ 3 tabs visible
✅ "Reply Friend" tab is active (highlighted)
✅ AI toggle visible and ON by default
✅ 11 tone buttons visible
❌ NO radio buttons (removed)
```

### Feature 3: Tab Switching Changes Context

```javascript
// Test: Switch between tabs
Steps:
1. Click "Reply Friend" tab (default)
2. Observe context viewer
3. Click "Reply Last" tab
4. Observe context viewer changes
5. Click "New Topic" tab
6. Observe context viewer changes

Expected Console Logs:
🎯 Mode changed to: reply_friend
🎯 Mode changed to: reply_last
🎯 Mode changed to: new_conversation

Expected Context Changes:
Reply Friend Tab:
  💬 Replying to friend's messages (your messages hidden)
  Friend: Mardia taka pathaise
  Friend: Check kor
  [User messages NOT shown]

Reply Last Tab:
  📝 Replying to last message (any sender)
  Friend: Mardia taka pathaise
  Friend: Check kor
  You: Received
  [ALL messages shown]

New Topic Tab:
  ✨ Starting new conversation (context for reference only)
  Friend: Check kor
  You: Received
  [Last 3 messages only]

If Not Working:
- Check console for "🎯 Mode changed to: [mode]"
- Verify context preview updates
- Check if tabs are clickable
```

### Feature 4: Tone Button Click & Reply Generation

```javascript
// Test: Generate replies
Steps:
1. Select tab (Reply Friend recommended)
2. Ensure AI toggle is ON
3. Click "Friendly" tone button

Expected Console Logs (COMPLETE FLOW):

// STEP 1: Button Click
🎨 Found 11 tone buttons
🎨 Tone button 1 clicked!
   Tone ID: friendly
✅ Tone selected: Friendly (AI: true)
   Calling onToneSelect callback...

// STEP 2: Handler Called
🎯 handleToneSelection called with tone: Friendly mode: reply_friend

// STEP 3: Loading Shown
⏳ showEnhancedLoading: Extracting latest messages...
✅ Loading container made visible

// STEP 4: Context Extraction
🔄 Re-extracting context to ensure latest messages...
📸 Captured FRIEND's last message before generation: Mardia taka pathaise
   From: Nigash Khaled CSE 20
   Total messages in context: 15

// STEP 5: API Call
🤖 Calling API (user enabled AI)...
⏳ showEnhancedLoading: Generating smart replies...
🎯 Generating replies with mode: reply_friend

// STEP 6: Success
✅ Replies generated successfully
💾 Cached new responses for future use

// STEP 7: Display
📝 displayReplies called with 3 replies
✅ Replies container made visible
✅ 3 reply cards added to DOM
   Sample replies: ["Checking now, give me a sec", "Let me verify the payment"]

Expected UI:
- Loading spinner appears
- After 2-5 seconds, 3 reply cards appear
- Each card has "Insert" and "Copy" buttons

If Fails at Any Step:
- Copy the LAST console log you see
- Check which step it stopped at
- See "Common Issues" section below
```

### Feature 5: All 3 Modes Generate Replies

```javascript
// Test Mode 1: Reply Last
Steps:
1. Click "Reply Last" tab
2. Click any tone button
3. Verify generates replies to absolute last message

Expected:
- Works even if last message is from user
- Context shows: "📝 Replying to last message (any sender)"

// Test Mode 2: Reply Friend (Default)
Steps:
1. Click "Reply Friend" tab
2. Click any tone button
3. Verify generates replies to friend's messages only

Expected:
- Ignores user's own messages
- Context shows: "💬 Replying to friend's messages"

// Test Mode 3: New Topic
Steps:
1. Click "New Topic" tab
2. Click any tone button
3. Verify generates conversation starters

Expected:
- Generates fresh greetings/starters
- Context shows: "✨ Starting new conversation"
- No error about "No message found"

Console Log for New Topic:
✨ New conversation mode - no specific message to reply to
```

### Feature 6: AI Toggle Works

```javascript
// Test: Toggle between AI and Offline mode
Steps:
1. Toggle OFF the AI switch
2. Click any tone button

Expected Console Logs:
📊 Offline Mode: ENABLED - Will use local pattern-based responses
🔍 Checking cache for similar context...

If No Cache:
📊 No cached suggestions available. Enable "Use AI" toggle to generate new replies using the API.

Steps:
3. Toggle ON the AI switch
4. Click any tone button

Expected Console Logs:
🤖 AI Mode: ENABLED - Will call API for intelligent responses
🤖 Calling API (user enabled AI)...
```

### Feature 7: Reply Insert Works

```javascript
// Test: Insert reply into WhatsApp
Steps:
1. Generate replies
2. Click "Insert" button on any reply

Expected:
- Reply text appears in WhatsApp input field
- Text is editable
- Send button becomes active

Console Logs:
[Check for insertion logs]
```

---

## Console Log Reference

### ✅ SUCCESS Indicators
```javascript
✅ Settings saved successfully
✅ Replies container made visible
✅ Replies generated successfully
✅ 3 reply cards added to DOM
✅ Loading container made visible
✅ Tone selected: [Tone Name]
```

### ⚠️ WARNING Indicators
```javascript
⚠️ Cancelling previous generation...
⚠️ No cached responses found
⚠️ Generation cancelled (newer generation started)
```

### ❌ ERROR Indicators
```javascript
❌ No tone buttons found!
❌ Tone not found for ID: [id]
❌ No context available for generation
❌ No message found to respond to
❌ Chrome runtime error: [error]
❌ Generation error: [error]
❌ Reply list element not found!
❌ No replies to display!
```

---

## Common Issues & Solutions

### Issue 1: Tone Buttons Don't Generate Replies

**Symptoms:**
- Click tone button, nothing happens
- No console logs after clicking

**Debug Steps:**
```javascript
1. Check Console:
   - Look for: "🎨 Tone button X clicked!"
   - If NOT present → Button click not registered

2. Check if buttons exist:
   - Look for: "🎨 Found X tone buttons"
   - If 0 buttons → DOM not rendered properly

3. Reload extension:
   - chrome://extensions → Reload button
   - Refresh WhatsApp page
```

**Solutions:**
- If no buttons found: Reload extension + refresh page
- If buttons found but no click: Check for JS errors above
- If click registered but stops: Check API key is valid

---

### Issue 2: API Key Error

**Symptoms:**
```javascript
❌ Generation error: Please add your API key
🔑 Please add your API key in the extension settings.
```

**Solutions:**
```javascript
1. Click extension icon
2. Verify API key format:
   - OpenAI: Starts with "sk-" or "sk-proj-"
   - Google: Starts with "AIza"
   - OpenRouter: Starts with "sk-or-v1-"
3. Click "Save Settings"
4. Wait for: "✅ Settings saved successfully"
5. Try generating again
```

---

### Issue 3: Context Not Found

**Symptoms:**
```javascript
❌ No context available for generation
```

**Solutions:**
```javascript
1. Verify you're in an active conversation
2. Check conversation has messages
3. Try clicking in message input field first
4. Reload page and try again
```

---

### Issue 4: Mode Validation Error

**Symptoms:**
```javascript
❌ No message found to respond to
(When using Reply Last or Reply Friend modes)
```

**Solutions:**
```javascript
1. Check console: What mode are you in?
   - Look for: "🎯 handleToneSelection called with tone: X mode: Y"
2. If reply_friend: Ensure friend sent a message
3. If reply_last: Ensure conversation has messages
4. Try switching to "New Topic" tab (should always work)
```

---

### Issue 5: Loading Never Stops

**Symptoms:**
- Loading spinner keeps spinning
- No replies appear
- No error shown

**Debug Steps:**
```javascript
1. Check console for the LAST log message
2. Common stops:
   - Stops at "Generating smart replies..." → API timeout
   - Stops at "Calling API..." → API key invalid
   - Stops at "Chrome runtime error" → Extension issue

3. Check network tab:
   - Look for API call to OpenAI/Google/OpenRouter
   - Check response status (200 = success, 401 = auth error)
```

**Solutions:**
- API timeout: Try again or check internet
- Auth error: Verify API key is correct
- Chrome error: Reload extension

---

### Issue 6: Replies Generated But Not Visible

**Symptoms:**
```javascript
Console shows:
✅ Replies generated successfully
📝 displayReplies called with 3 replies
BUT UI shows nothing
```

**Debug Steps:**
```javascript
1. Check for:
   ✅ Replies container made visible
   ✅ 3 reply cards added to DOM

2. If both present but still not visible:
   - Check CSS is loaded
   - Inspect element to see if replies exist in DOM
   - Check if z-index issue hiding replies

3. Try:
   - Scroll down in modal
   - Close and reopen modal
   - Reload extension
```

---

## Playwright Test Scenarios

### Scenario 1: Basic Flow Test

```javascript
// Test: Complete happy path
async function testBasicFlow(page) {
  // 1. Setup
  await page.goto('https://web.whatsapp.com');
  await page.waitForSelector('[data-testid="conversation"]');

  // 2. Click Gracula button
  const graculaBtn = await page.waitForSelector('#gracula-floating-btn');
  await graculaBtn.click();

  // 3. Verify modal opens
  const modal = await page.waitForSelector('.gracula-modal');
  expect(modal).toBeTruthy();

  // 4. Verify layout
  const contextViewer = await page.$('.gracula-context-section');
  const tabs = await page.$$('.gracula-mode-tab');
  const aiToggle = await page.$('#gracula-use-ai-toggle');
  const toneButtons = await page.$$('.gracula-tone-btn');

  expect(contextViewer).toBeTruthy();
  expect(tabs.length).toBe(3);
  expect(aiToggle).toBeTruthy();
  expect(toneButtons.length).toBeGreaterThan(0);

  // 5. Verify default tab
  const activeTab = await page.$('.gracula-mode-tab.active');
  const mode = await activeTab.getAttribute('data-mode');
  expect(mode).toBe('reply_friend');

  // 6. Verify AI toggle is ON
  const isChecked = await aiToggle.isChecked();
  expect(isChecked).toBe(true);

  console.log('✅ Basic layout test passed');
}
```

### Scenario 2: Tab Switching Test

```javascript
async function testTabSwitching(page) {
  // Get context preview element
  const contextPreview = await page.$('.gracula-context-preview');

  // Test Reply Friend tab
  await page.click('[data-mode="reply_friend"]');
  let text = await contextPreview.textContent();
  expect(text).toContain('Replying to friend\'s messages');

  // Test Reply Last tab
  await page.click('[data-mode="reply_last"]');
  text = await contextPreview.textContent();
  expect(text).toContain('Replying to last message');

  // Test New Topic tab
  await page.click('[data-mode="new_conversation"]');
  text = await contextPreview.textContent();
  expect(text).toContain('Starting new conversation');

  console.log('✅ Tab switching test passed');
}
```

### Scenario 3: Tone Generation Test

```javascript
async function testToneGeneration(page) {
  // Click first tone button
  const toneBtn = await page.$('.gracula-tone-btn');
  await toneBtn.click();

  // Wait for loading
  await page.waitForSelector('.gracula-loading', { state: 'visible' });

  // Wait for replies (max 10 seconds)
  await page.waitForSelector('.gracula-reply-card', {
    timeout: 10000
  });

  // Verify replies appeared
  const replyCards = await page.$$('.gracula-reply-card');
  expect(replyCards.length).toBeGreaterThan(0);

  // Verify Insert button exists
  const insertBtn = await page.$('.gracula-insert-btn');
  expect(insertBtn).toBeTruthy();

  console.log('✅ Tone generation test passed');
}
```

### Scenario 4: All Modes Generate Test

```javascript
async function testAllModesGenerate(page) {
  const modes = ['reply_last', 'reply_friend', 'new_conversation'];

  for (const mode of modes) {
    // Switch to mode
    await page.click(`[data-mode="${mode}"]`);

    // Click tone button
    const toneBtn = await page.$('.gracula-tone-btn');
    await toneBtn.click();

    // Wait for replies or error
    try {
      await page.waitForSelector('.gracula-reply-card', {
        timeout: 10000
      });
      console.log(`✅ Mode ${mode}: Generated successfully`);
    } catch (error) {
      console.error(`❌ Mode ${mode}: Failed to generate`);
      throw error;
    }

    // Clear replies for next test
    await page.reload();
    await page.click('#gracula-floating-btn');
  }

  console.log('✅ All modes generation test passed');
}
```

### Scenario 5: Settings Persistence Test

```javascript
async function testSettingsPersistence(page) {
  // Open extension popup
  const extensionId = 'YOUR_EXTENSION_ID';
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  // Enter API key
  await page.fill('#apiKey', 'sk-test-key-12345');
  await page.click('button[type="submit"]');

  // Wait for save confirmation
  await page.waitForSelector('.status.success');

  // Close and reopen popup
  await page.close();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  // Verify key persisted
  const apiKey = await page.inputValue('#apiKey');
  expect(apiKey).toBe('sk-test-key-12345');

  console.log('✅ Settings persistence test passed');
}
```

### Scenario 6: Console Log Validation

```javascript
async function testConsoleLogs(page) {
  const logs = [];

  // Capture console logs
  page.on('console', msg => {
    logs.push(msg.text());
  });

  // Trigger generation
  await page.click('#gracula-floating-btn');
  await page.click('.gracula-tone-btn');

  // Wait for completion
  await page.waitForTimeout(5000);

  // Verify expected logs
  const expectedLogs = [
    '🎨 Tone button',
    '✅ Tone selected',
    '🎯 handleToneSelection called',
    '🔄 Re-extracting context',
    '🤖 Calling API',
    '✅ Replies generated successfully',
    '📝 displayReplies called'
  ];

  for (const expected of expectedLogs) {
    const found = logs.some(log => log.includes(expected));
    if (!found) {
      console.error(`❌ Missing log: ${expected}`);
      throw new Error(`Log validation failed: ${expected}`);
    }
  }

  console.log('✅ Console log validation passed');
}
```

---

## Quick Debug Checklist

Use this checklist for rapid debugging:

```
Pre-Flight:
□ Extension loaded and enabled
□ WhatsApp Web open with messages
□ Console open (F12)
□ API key configured

Modal Opening:
□ Gracula button visible
□ Click opens modal
□ Context viewer visible at top
□ 3 tabs visible
□ AI toggle visible and ON
□ Tone buttons visible (11 total)
□ NO radio buttons

Tab Switching:
□ Click "Reply Friend" - context updates
□ Click "Reply Last" - context updates
□ Click "New Topic" - context updates
□ Console shows: "🎯 Mode changed to: [mode]"

Tone Generation:
□ Click tone button
□ Console shows: "🎨 Tone button X clicked!"
□ Console shows: "🎯 handleToneSelection called"
□ Loading spinner appears
□ Console shows: "🤖 Calling API"
□ Console shows: "✅ Replies generated successfully"
□ Console shows: "📝 displayReplies called with 3 replies"
□ 3 reply cards appear in UI
□ Insert/Copy buttons visible

If Any Step Fails:
1. Note which step failed
2. Copy last console log
3. Check "Common Issues" section
4. Try suggested solution
```

---

## Debug Output Template

When reporting issues, provide this info:

```
**Environment:**
- Browser: Chrome [version]
- Extension Version: [version]
- OS: [Windows/Mac/Linux]
- WhatsApp Web: [loaded/not loaded]

**Issue:**
[Describe what's not working]

**Steps Taken:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected:**
[What should happen]

**Actual:**
[What actually happened]

**Console Logs:**
```
[Paste last 20 lines of console]
```

**Screenshots:**
[Attach if relevant]

**Last Working Step:**
[Which step in the flow succeeded last]
```

---

## Success Criteria

All features working correctly when:

✅ **Settings:**
- API key saves and persists
- Changes apply without reload
- Notification shows on save

✅ **Modal:**
- Opens on button click
- Shows context viewer
- Shows 3 tabs
- Shows AI toggle (ON by default)
- Shows 11 tone buttons
- NO radio buttons visible

✅ **Tab Switching:**
- Context updates for each tab
- Console logs mode changes
- UI updates instantly

✅ **Reply Generation:**
- All 3 modes generate replies
- Loading indicator appears
- Replies appear after 2-5 seconds
- 3 reply cards visible
- Insert/Copy buttons work

✅ **Console Logs:**
- Complete flow logs present
- No errors in console
- All steps logged correctly

---

## Additional Resources

### Extension Files to Check:
```
src/app/GraculaApp.js - Main app logic
src/background.js - API calls & prompt generation
src/widgets/tone-selector/ui/ToneSelector.js - Tone buttons
src/widgets/reply-list/ui/ReplyList.js - Reply display
src/widgets/context-viewer/ui/ContextViewer.js - Context view
```

### Useful Chrome URLs:
```
chrome://extensions - Manage extensions
chrome://inspect/#extensions - Debug extensions
chrome://version - Chrome version info
```

### API Documentation:
```
OpenAI: https://platform.openai.com/docs
Google AI: https://ai.google.dev/docs
OpenRouter: https://openrouter.ai/docs
```

---

**Last Updated:** October 31, 2025
**Version:** 2.0 (3 Response Modes Update)
**Commit:** 3b068aa

---

## Need Help?

If you encounter issues not covered here:

1. **Check Console** - 90% of issues show error messages
2. **Try Common Solutions** - Reload extension, refresh page
3. **Review Logs** - Copy full console output
4. **Test with Playwright** - Automated tests catch edge cases
5. **Report Issue** - Use the debug output template above

Good luck with testing! 🚀
