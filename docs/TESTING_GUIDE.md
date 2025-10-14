# 🧪 Gracula Testing Guide

This guide will help you test Gracula thoroughly to ensure everything works correctly.

## Pre-Testing Checklist

- [ ] All files are in the Gracula folder
- [ ] Icons folder exists with 3 PNG files
- [ ] Extension is loaded in Chrome (chrome://extensions/)
- [ ] Extension is enabled (toggle is ON)
- [ ] No errors in extension details

## Test 1: Basic Installation

### Steps:
1. Go to `chrome://extensions/`
2. Find "Gracula - AI Reply Assistant"
3. Check that it shows version 1.0.0
4. Click "Details"

### Expected Results:
- ✅ Extension appears in list
- ✅ No errors shown
- ✅ Icon displays correctly
- ✅ Description is visible

### If Failed:
- Reload extension
- Check manifest.json syntax
- Verify all files are present

## Test 2: Settings Popup

### Steps:
1. Click Gracula icon in Chrome toolbar
2. Popup should open

### Expected Results:
- ✅ Popup opens (350px width)
- ✅ Shows "🧛 Gracula" header
- ✅ Features list is visible
- ✅ API settings form is present
- ✅ "How to Use" section appears

### If Failed:
- Check popup.html exists
- Check popup.js exists
- Look for errors in console (F12)

## Test 3: WhatsApp Web Integration

### Steps:
1. Open https://web.whatsapp.com
2. Log in with your phone
3. Open any chat conversation
4. Click on the message input field (bottom of screen)

### Expected Results:
- ✅ Floating button appears to the right of input
- ✅ Button shows 🧛 emoji
- ✅ Button has purple gradient background
- ✅ Tooltip shows "Gracula AI" on hover

### If Failed:
- Refresh the page (F5)
- Check browser console for errors (F12)
- Verify content.js is loaded
- Check if WhatsApp updated their UI

## Test 4: Tone Selection

### Steps:
1. On WhatsApp Web, click the Gracula floating button
2. Modal should open

### Expected Results:
- ✅ Modal opens with dark overlay
- ✅ Shows "🧛 Gracula AI Reply" header
- ✅ Conversation context preview appears
- ✅ 11 tone buttons are displayed:
  - 💬 Default
  - 😠 Angry
  - 😎 Chill
  - 🤔 Confused
  - 🤩 Excited
  - 😘 Flirty
  - 📝 Formal
  - 😂 Funny
  - 🤙 GenZ
  - 🎵 Lyrical
  - ✨ Creative Praise
- ✅ Each button has emoji and name
- ✅ Buttons are clickable

### If Failed:
- Check config.js is loaded
- Verify all tones are defined
- Check styles.css is applied

## Test 5: AI Reply Generation (Without API Key)

### Steps:
1. Click any tone button (e.g., "Funny")
2. Wait for generation

### Expected Results:
- ✅ Loading spinner appears
- ✅ "Generating replies..." message shows
- ✅ After 1-3 seconds, 3 replies appear
- ✅ Each reply has "Insert" and "Copy" buttons
- ✅ Replies match the selected tone

### If Failed:
- This is expected if API has rate limits
- Extension should show fallback mock replies
- Check background.js console for errors

## Test 6: AI Reply Generation (With API Key)

### Prerequisites:
- Get free Hugging Face API key from https://huggingface.co/settings/tokens

### Steps:
1. Click Gracula extension icon
2. Paste API key in settings
3. Click "Save Settings"
4. Go back to WhatsApp Web
5. Click Gracula button
6. Select a tone
7. Wait for generation

### Expected Results:
- ✅ Settings save successfully
- ✅ Replies generate faster
- ✅ Replies are higher quality
- ✅ No rate limit errors
- ✅ 3 unique replies appear

### If Failed:
- Verify API key is correct (starts with `hf_`)
- Check API key has "Read" permission
- Look for API errors in console

## Test 7: Insert Reply

### Steps:
1. Generate replies (any tone)
2. Click "Insert" on any reply
3. Check message input field

### Expected Results:
- ✅ Modal closes automatically
- ✅ Reply text appears in input field
- ✅ Text is ready to send
- ✅ Can edit the text before sending

### If Failed:
- Check if input field selector is correct
- Verify content.js insertReply function
- Try different messaging platform

## Test 8: Copy Reply

### Steps:
1. Generate replies (any tone)
2. Click "Copy" on any reply
3. Paste somewhere (Ctrl+V)

### Expected Results:
- ✅ Button text changes to "✓ Copied!"
- ✅ Text is in clipboard
- ✅ Can paste the reply
- ✅ Button text reverts after 2 seconds

### If Failed:
- Check clipboard permissions
- Try in HTTPS context only
- Verify copyReply function

## Test 9: Conversation Context Extraction

### Steps:
1. Have a conversation with multiple messages
2. Click Gracula button
3. Check "Conversation Context" section

### Expected Results:
- ✅ Shows last 3-5 messages
- ✅ Messages are in order
- ✅ Text is readable
- ✅ Context influences generated replies

### If Failed:
- Check message selectors for platform
- Verify extractConversationContext function
- Platform may have updated UI

## Test 10: Multiple Platforms

Test on each platform:

### WhatsApp Web (web.whatsapp.com)
- [ ] Button appears
- [ ] Replies generate
- [ ] Insert works
- [ ] Context extracted

### Instagram (instagram.com/direct)
- [ ] Button appears
- [ ] Replies generate
- [ ] Insert works
- [ ] Context extracted

### Messenger (messenger.com)
- [ ] Button appears
- [ ] Replies generate
- [ ] Insert works
- [ ] Context extracted

### LinkedIn (linkedin.com/messaging)
- [ ] Button appears
- [ ] Replies generate
- [ ] Insert works
- [ ] Context extracted

### Twitter/X (twitter.com/messages)
- [ ] Button appears
- [ ] Replies generate
- [ ] Insert works
- [ ] Context extracted

### Discord (discord.com)
- [ ] Button appears
- [ ] Replies generate
- [ ] Insert works
- [ ] Context extracted

### Slack (app.slack.com)
- [ ] Button appears
- [ ] Replies generate
- [ ] Insert works
- [ ] Context extracted

### Gmail (mail.google.com)
- [ ] Button appears
- [ ] Replies generate
- [ ] Insert works
- [ ] Context extracted

### Telegram (web.telegram.org)
- [ ] Button appears
- [ ] Replies generate
- [ ] Insert works
- [ ] Context extracted

## Test 11: Different Tones

Test each tone generates appropriate replies:

- [ ] **Default** - Natural, friendly
- [ ] **Angry** - Frustrated, irritated
- [ ] **Chill** - Relaxed, casual
- [ ] **Confused** - Questioning, uncertain
- [ ] **Excited** - Enthusiastic, energetic
- [ ] **Flirty** - Playful, charming
- [ ] **Formal** - Professional, polite
- [ ] **Funny** - Humorous, witty
- [ ] **GenZ** - Slang, trendy
- [ ] **Lyrical** - Poetic, artistic
- [ ] **Creative Praise** - Complimentary, positive

## Test 12: Edge Cases

### Empty Conversation
- [ ] Works when no messages exist
- [ ] Shows appropriate message
- [ ] Still generates replies

### Very Long Messages
- [ ] Handles messages over 500 characters
- [ ] Truncates appropriately
- [ ] Doesn't crash

### Special Characters
- [ ] Handles emojis in context
- [ ] Handles special characters
- [ ] Handles multiple languages

### Rapid Clicking
- [ ] Doesn't create multiple modals
- [ ] Handles quick button clicks
- [ ] No memory leaks

## Test 13: Performance

### Load Time
- [ ] Extension loads in < 1 second
- [ ] Button appears in < 2 seconds
- [ ] No lag when typing

### Memory Usage
- [ ] Check in Chrome Task Manager
- [ ] Should use < 50MB RAM
- [ ] No memory leaks over time

### API Response Time
- [ ] With API key: < 5 seconds
- [ ] Without API key: < 3 seconds (mock)
- [ ] Timeout after 30 seconds

## Test 14: Error Handling

### Network Errors
- [ ] Handles offline mode gracefully
- [ ] Shows error message
- [ ] Suggests solutions

### API Errors
- [ ] Handles rate limits
- [ ] Falls back to mock replies
- [ ] Shows helpful error messages

### Platform Changes
- [ ] Doesn't crash if selectors fail
- [ ] Logs errors to console
- [ ] Continues working on other platforms

## Test 15: Browser Compatibility

Test on different Chromium browsers:

- [ ] Google Chrome
- [ ] Microsoft Edge
- [ ] Brave Browser
- [ ] Opera
- [ ] Vivaldi

## Debugging Checklist

If something doesn't work:

1. **Check Console**
   - Open DevTools (F12)
   - Look for 🧛 Gracula messages
   - Check for errors (red text)

2. **Verify Files**
   - All files present
   - No syntax errors
   - Correct file names

3. **Check Permissions**
   - Extension has required permissions
   - Host permissions granted
   - No permission errors

4. **Reload Extension**
   - Go to chrome://extensions/
   - Click reload icon
   - Refresh web page

5. **Clear Cache**
   - Clear browser cache
   - Hard reload (Ctrl+Shift+R)
   - Restart browser

## Reporting Issues

When reporting bugs, include:

1. **Browser & Version**
   - Chrome version
   - Operating system

2. **Platform**
   - Which messaging app
   - URL where it failed

3. **Steps to Reproduce**
   - Exact steps taken
   - What you expected
   - What actually happened

4. **Console Errors**
   - Screenshot of console
   - Any error messages

5. **Extension Details**
   - Version number
   - Settings used
   - API key status (yes/no, don't share key)

## Success Criteria

Gracula is working correctly if:

- ✅ Loads without errors
- ✅ Button appears on all platforms
- ✅ All 11 tones work
- ✅ Generates 3 replies per tone
- ✅ Insert and Copy functions work
- ✅ Context extraction works
- ✅ Settings save properly
- ✅ No console errors
- ✅ Performance is good
- ✅ UI is responsive

---

**Happy Testing! 🧛**

If you find any issues, please report them so we can fix them!

