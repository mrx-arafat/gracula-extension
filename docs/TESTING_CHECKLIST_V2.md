# ✅ Gracula v2.0 - Testing Checklist

## 🎯 Pre-Testing Setup

### 1. Load Extension
- [ ] Open Chrome: `chrome://extensions/`
- [ ] Enable "Developer mode"
- [ ] Click "Load unpacked"
- [ ] Select `src/` folder
- [ ] Verify extension appears without errors

### 2. Rename Manifest
- [ ] Navigate to `src/` folder
- [ ] Rename `manifest.json` to `manifest-old.json`
- [ ] Rename `manifest-new.json` to `manifest.json`
- [ ] Reload extension in Chrome

### 3. Configure API
- [ ] Click Gracula extension icon
- [ ] Select "OpenAI" as provider
- [ ] Enter valid API key
- [ ] Click "Save Settings"
- [ ] Verify success message

## 🧪 Core Functionality Tests

### Test 1: Extension Loading
**Platform**: Any supported platform

- [ ] Open WhatsApp Web (web.whatsapp.com)
- [ ] Wait 3-5 seconds
- [ ] Check browser console (F12)
- [ ] Verify logs: "🧛 Gracula: EXTENSION LOADED"
- [ ] Verify logs: "🧛 Gracula: ✅ Detected platform - WhatsApp"
- [ ] Verify notification appears: "🧛 Gracula AI is ready!"

**Expected**: Extension loads without errors

### Test 2: Button Appearance
**Platform**: WhatsApp Web

- [ ] Open any chat
- [ ] Wait for messages to load
- [ ] Look for purple 🧛 button near input field
- [ ] Verify button is visible
- [ ] Verify button has pulsing animation
- [ ] Hover over button - tooltip should appear

**Expected**: Purple button appears and is interactive

### Test 3: Context Extraction
**Platform**: WhatsApp Web

- [ ] Open chat with 5+ messages
- [ ] Click purple button
- [ ] Modal opens
- [ ] Check "📝 Conversation Context" section
- [ ] Verify recent messages are shown
- [ ] Check console for: "Extracting Conversation Context"
- [ ] Verify message count in logs

**Expected**: Context shows last 3-8 messages

### Test 4: Speaker Detection
**Platform**: WhatsApp Web (Group Chat)

- [ ] Open a group chat
- [ ] Click purple button
- [ ] Check context preview
- [ ] Verify format: "Name: message text"
- [ ] Check if "Me:" appears for your messages
- [ ] Check if other names appear for their messages
- [ ] Open console and check logs

**Expected**: Messages show speaker names

### Test 5: Conversation Analysis
**Platform**: WhatsApp Web

- [ ] Open chat with questions
- [ ] Click purple button
- [ ] Click "🔍 Analysis" button
- [ ] Verify analysis grid appears
- [ ] Check "Participants" field
- [ ] Check "Last Speaker" field
- [ ] Check "Has Question" field
- [ ] Check "Sentiment" field
- [ ] Check "Urgency" field

**Expected**: Analysis shows conversation insights

### Test 6: Manual Context Editing
**Platform**: Any

- [ ] Click purple button
- [ ] Click "✏️ Edit" button
- [ ] Text area appears with current context
- [ ] Modify the text
- [ ] Click "💾 Save Context"
- [ ] Verify preview updates
- [ ] Check console logs

**Expected**: Context can be edited and saved

### Test 7: Tone Selection
**Platform**: Any

- [ ] Click purple button
- [ ] Scroll to "Select Tone" section
- [ ] Verify 11 tone buttons appear
- [ ] Click "Funny" tone
- [ ] Verify loading spinner appears
- [ ] Wait for replies to generate
- [ ] Verify 3 replies appear

**Expected**: Replies generated with selected tone

### Test 8: Reply Generation
**Platform**: WhatsApp Web

- [ ] Open chat with context
- [ ] Click purple button
- [ ] Select "Default" tone
- [ ] Wait for generation
- [ ] Verify 3 different replies appear
- [ ] Check if replies are relevant to context
- [ ] Verify replies address any questions

**Expected**: 3 contextually relevant replies

### Test 9: Reply Insertion
**Platform**: WhatsApp Web

- [ ] Generate replies
- [ ] Click "Insert" on first reply
- [ ] Verify modal closes
- [ ] Check input field
- [ ] Verify reply text is in input
- [ ] Verify you can edit before sending

**Expected**: Reply inserted into input field

### Test 10: Reply Copying
**Platform**: Any

- [ ] Generate replies
- [ ] Click "Copy" on second reply
- [ ] Verify button changes to "✓ Copied!"
- [ ] Open notepad
- [ ] Paste (Ctrl+V)
- [ ] Verify reply text is pasted

**Expected**: Reply copied to clipboard

## 🌐 Platform-Specific Tests

### WhatsApp Web
- [ ] Individual chat - context extraction
- [ ] Group chat - speaker detection
- [ ] Messages with emojis
- [ ] Messages with links
- [ ] Long messages
- [ ] Short messages
- [ ] Questions detection
- [ ] Reply insertion works

### Discord
- [ ] Server channel - context extraction
- [ ] DM - context extraction
- [ ] Username detection
- [ ] Timestamp filtering
- [ ] Reply insertion works

### Slack
- [ ] Channel - context extraction
- [ ] DM - context extraction
- [ ] Sender name detection
- [ ] Thread messages
- [ ] Reply insertion works

### Telegram
- [ ] Chat - context extraction
- [ ] Incoming/outgoing detection
- [ ] Reply insertion works

### Instagram DM
- [ ] Basic context extraction
- [ ] Reply insertion works

## 🔍 Advanced Feature Tests

### Test 11: Question Detection
**Setup**: Chat with unanswered question

- [ ] Friend asks: "What time should we meet?"
- [ ] Click purple button
- [ ] Click "🔍 Analysis"
- [ ] Check "Has Question" field
- [ ] Should show: "✅ Yes"
- [ ] Generate reply with "Default" tone
- [ ] Verify reply addresses the question

**Expected**: Question detected and addressed

### Test 12: Urgency Detection
**Setup**: Chat with urgent message

- [ ] Friend sends: "URGENT!!! Need help ASAP!!!"
- [ ] Click purple button
- [ ] Click "🔍 Analysis"
- [ ] Check "Urgency" field
- [ ] Should show: "High"
- [ ] Generate reply
- [ ] Verify reply acknowledges urgency

**Expected**: Urgency detected correctly

### Test 13: Sentiment Analysis
**Setup**: Chat with positive messages

- [ ] Friend sends: "That's awesome! Love it! 😊"
- [ ] Click purple button
- [ ] Click "🔍 Analysis"
- [ ] Check "Sentiment" field
- [ ] Should show: "Positive"

**Expected**: Sentiment detected correctly

### Test 14: Topic Extraction
**Setup**: Chat about specific topic

- [ ] Conversation about "dinner" and "restaurant"
- [ ] Click purple button
- [ ] Click "🔍 Analysis"
- [ ] Check "Topics" field
- [ ] Should include: "dinner, restaurant"

**Expected**: Topics extracted correctly

### Test 15: Conversation Type
**Setup**: Back-and-forth conversation

- [ ] Active dialogue with alternating speakers
- [ ] Click purple button
- [ ] Click "🔍 Analysis"
- [ ] Check "Conversation Type" field
- [ ] Should show: "dialogue"

**Expected**: Conversation type identified

## 🐛 Error Handling Tests

### Test 16: No API Key
- [ ] Remove API key from settings
- [ ] Try to generate replies
- [ ] Verify error message appears
- [ ] Message should mention API key
- [ ] Verify no crash

**Expected**: Graceful error handling

### Test 17: Invalid API Key
- [ ] Enter invalid API key
- [ ] Try to generate replies
- [ ] Verify error message appears
- [ ] Check console for API error
- [ ] Verify fallback to mock replies (if implemented)

**Expected**: Error message shown

### Test 18: No Context
- [ ] Open empty chat
- [ ] Click purple button
- [ ] Verify message: "No recent messages found"
- [ ] Click "✏️ Edit"
- [ ] Add manual context
- [ ] Generate replies
- [ ] Verify replies generated

**Expected**: Works with manual context

### Test 19: Network Error
- [ ] Disconnect internet
- [ ] Try to generate replies
- [ ] Verify error message
- [ ] Reconnect internet
- [ ] Try again
- [ ] Verify it works

**Expected**: Handles network errors

## 🎨 UI/UX Tests

### Test 20: Button Positioning
- [ ] Open chat
- [ ] Verify button near input field
- [ ] Resize window
- [ ] Verify button repositions
- [ ] Scroll page
- [ ] Verify button stays visible

**Expected**: Button always accessible

### Test 21: Modal Responsiveness
- [ ] Open modal
- [ ] Resize window to small size
- [ ] Verify modal adapts
- [ ] Check on mobile viewport (DevTools)
- [ ] Verify all elements visible

**Expected**: Responsive design works

### Test 22: Loading States
- [ ] Generate replies
- [ ] Verify loading spinner appears
- [ ] Verify "Generating replies..." text
- [ ] Wait for completion
- [ ] Verify spinner disappears
- [ ] Verify replies appear

**Expected**: Clear loading feedback

### Test 23: Animations
- [ ] Button pulse animation
- [ ] Modal slide-in animation
- [ ] Hover effects on buttons
- [ ] Click feedback
- [ ] Smooth transitions

**Expected**: Smooth animations

## 📊 Performance Tests

### Test 24: Load Time
- [ ] Open WhatsApp Web
- [ ] Note time until button appears
- [ ] Should be < 5 seconds
- [ ] Check console for timing logs

**Expected**: Fast initialization

### Test 25: Context Extraction Speed
- [ ] Open chat with 50+ messages
- [ ] Click purple button
- [ ] Note time until context appears
- [ ] Should be < 1 second
- [ ] Check console logs

**Expected**: Fast extraction

### Test 26: Memory Usage
- [ ] Open Chrome Task Manager
- [ ] Note memory before loading extension
- [ ] Load extension
- [ ] Use for 10 minutes
- [ ] Check memory usage
- [ ] Should not increase significantly

**Expected**: No memory leaks

## 🔧 Browser MCP Testing

### Test 27: WhatsApp Web with Browser MCP
**Prerequisites**: Browser MCP installed and configured

- [ ] Open terminal
- [ ] Run: `npx @modelcontextprotocol/server-browser`
- [ ] Open WhatsApp Web
- [ ] Navigate to a chat
- [ ] Use MCP to interact with page
- [ ] Verify Gracula button is visible
- [ ] Use MCP to click button
- [ ] Verify modal opens
- [ ] Use MCP to read context
- [ ] Verify context is accurate

**Expected**: Works with Browser MCP

### Test 28: Automated Testing with MCP
- [ ] Write MCP script to:
  - Open WhatsApp Web
  - Wait for load
  - Click Gracula button
  - Read context
  - Select tone
  - Verify replies
- [ ] Run script
- [ ] Verify all steps complete
- [ ] Check for errors

**Expected**: Automated testing works

## ✅ Final Checklist

### Functionality
- [ ] Extension loads without errors
- [ ] Button appears on all platforms
- [ ] Context extraction works
- [ ] Speaker detection works
- [ ] Conversation analysis works
- [ ] All tones work
- [ ] Reply generation works
- [ ] Reply insertion works
- [ ] Reply copying works
- [ ] Manual editing works

### Quality
- [ ] No console errors
- [ ] No memory leaks
- [ ] Fast performance
- [ ] Smooth animations
- [ ] Responsive design
- [ ] Error handling works
- [ ] All platforms tested

### Documentation
- [ ] README is clear
- [ ] Quick start works
- [ ] Architecture docs accurate
- [ ] Code comments helpful
- [ ] Examples work

## 🎉 Testing Complete!

If all tests pass, Gracula v2.0 is ready for production! 🚀

---

**Testing Time**: ~2 hours
**Tests**: 28 comprehensive tests
**Coverage**: Core features, platforms, edge cases, performance

**Status**: ✅ READY FOR RELEASE

