# Testing Checklist for Gracula Improvements

## Pre-Testing Setup

- [ ] Load extension in Chrome (`chrome://extensions/`)
- [ ] Enable Developer Mode
- [ ] Click "Load unpacked" and select `src/` folder
- [ ] Open WhatsApp Web (or another supported platform)
- [ ] Open Browser Console (F12) for debugging

---

## Feature Testing

### 1. Quoted Message Detection ✅
- [ ] Open WhatsApp Web
- [ ] Reply to an existing message (use WhatsApp's reply feature)
- [ ] Activate Gracula on that conversation
- [ ] Check console: Should see `[replying to ...]` in context
- [ ] Verify quoted message text is extracted

**Expected Result:**
```
You: Thanks! [replying to Friend: "Can you help?"]
```

---

### 2. Media Attachment Detection ✅
- [ ] Send/receive message with image
- [ ] Send/receive message with video
- [ ] Send/receive message with document
- [ ] Activate Gracula
- [ ] Check console: Should see `[attached: image]`, `[attached: video]`, etc.

**Expected Result:**
```
Friend: Check this out [attached: image]
```

---

### 3. Intent Detection ✅
Test different conversation types:

**Test 3a: Questions**
- [ ] Have conversation with questions: "What do you think?", "Can you help?"
- [ ] Activate Gracula
- [ ] Check console for: `User Intent: asking question`

**Test 3b: Making Plans**
- [ ] Discuss meeting/planning: "Let's meet tomorrow", "What time works?"
- [ ] Activate Gracula
- [ ] Check console for: `User Intent: making plans`

**Test 3c: Requesting Help**
- [ ] Ask for assistance: "Can you help me?", "Please assist"
- [ ] Activate Gracula
- [ ] Check console for: `User Intent: requesting help`

**Expected Result:**
```
User Intent: asking question (high confidence) [also: requesting help]
```

---

### 4. Emotional State Detection ✅
Test different emotions:

**Test 4a: Excited**
- [ ] Send excited messages: "OMG this is amazing! 🤩"
- [ ] Activate Gracula
- [ ] Check console for: `Emotional State: excited`

**Test 4b: Frustrated**
- [ ] Send frustrated messages: "This is ridiculous! 😠"
- [ ] Activate Gracula
- [ ] Check console for: `Emotional State: frustrated`

**Test 4c: Happy**
- [ ] Send happy messages: "Haha that's so funny! 😄"
- [ ] Activate Gracula
- [ ] Check console for: `Emotional State: happy`

**Expected Result:**
```
Emotional State: excited (medium intensity)
```

---

### 5. Conversation Summarization ✅
- [ ] Create conversation with 30+ messages (or use existing long chat)
- [ ] Activate Gracula
- [ ] Check context strings in console
- [ ] Should start with: `📋 CONVERSATION SUMMARY: Earlier: X messages...`
- [ ] Verify recent messages still shown in full

**Expected Result:**
```
📋 CONVERSATION SUMMARY: Earlier: 45 messages over 2 days between You, Friend...
📝 RECENT MESSAGES:
[Last 28 messages]
```

---

### 6. Preference Learning ✅
**Test 6a: Record Selection**
- [ ] Generate replies 5 times with "funny" tone
- [ ] Always select the 2nd option
- [ ] Open browser console
- [ ] Run: `chrome.storage.local.get(['learningData'], console.log)`
- [ ] Check `toneSelections.funny` should be 5
- [ ] Check `positionSelections.2` should be 5

**Test 6b: Get Recommendations**
- [ ] After 10+ selections, run in console:
```javascript
const learner = new window.Gracula.PreferenceLearner();
await learner.loadPreferences();
console.log(learner.getRecommendations());
```
- [ ] Should suggest your most-used tone and position

**Expected Result:**
```javascript
{
  suggestedTone: 'funny',
  suggestedLength: 'medium',
  suggestedPosition: 2,
  confidence: 'medium'
}
```

---

## Integration Testing

### 7. Existing Features Still Work ✅
- [ ] **Tone Selection**: All 13 tones generate different replies
- [ ] **Platform Detection**: Works on WhatsApp (test other platforms if available)
- [ ] **Speaker Detection**: Correctly identifies "You" vs others
- [ ] **Date Grouping**: Messages grouped by Today/Yesterday/Date
- [ ] **Language Detection**: Detects Bangla/English mixing
- [ ] **Emoji Usage**: Detects and matches emoji patterns
- [ ] **Message Length**: Recommends appropriate reply length
- [ ] **Urgency Detection**: Detects urgent keywords

---

## Prompt Quality Testing

### 8. Check AI Prompt Content ✅
- [ ] Activate Gracula
- [ ] Open background.js console (Service Worker)
- [ ] Look for prompt being sent to API
- [ ] Verify it includes:
  - [ ] Conversation Analysis section
  - [ ] User Intent
  - [ ] Emotional State (if detected)
  - [ ] Style Metrics
  - [ ] Conversation History
  - [ ] Quoted context (if present)
  - [ ] Media indicators (if present)

**Expected Prompt Structure:**
```
=== CONVERSATION ANALYSIS ===
Participants: You, Friend
Last Speaker: Friend
Conversation Type: dialogue
Sentiment: positive
User Intent: making plans (high confidence)
Emotional State: excited (medium intensity)

=== STYLE METRICS ===
Recommended reply: ~15 words (~75 chars, 1 sentence)
...

=== CONVERSATION HISTORY ===
📅 Today
Friend: Let's meet tomorrow! 😊
You: Sounds great! [replying to Friend: "Let's meet tomorrow!"]
...
```

---

## Error Testing

### 9. Edge Cases ✅
- [ ] **Empty conversation**: Should handle gracefully
- [ ] **Single message**: Should not crash
- [ ] **Very long messages**: Should truncate appropriately
- [ ] **Only system messages**: Should filter out
- [ ] **Messages without timestamps**: Should handle
- [ ] **Invalid HTML structure**: Should fall back gracefully

---

## Performance Testing

### 10. Speed & Efficiency ✅
- [ ] Measure context extraction time:
```javascript
console.time('Context Extraction');
const extractor = new window.Gracula.ContextExtractor(platform);
const messages = extractor.extract();
console.timeEnd('Context Extraction');
```
- [ ] Should complete in < 500ms for normal conversations
- [ ] Should complete in < 2s for 50+ message conversations

---

## Browser Storage Testing

### 11. Preference Persistence ✅
- [ ] Generate and select 5 replies
- [ ] Reload extension
- [ ] Check if preferences persisted:
```javascript
chrome.storage.local.get(['userPreferences', 'learningData'], console.log)
```
- [ ] Should show saved data

**Test 11b: Reset**
- [ ] Run in console:
```javascript
const learner = new window.Gracula.PreferenceLearner();
await learner.reset();
```
- [ ] Check storage again, should be reset to defaults

---

## Visual Testing (Optional UI Integration)

### 12. If you integrate preference learner into UI:
- [ ] Display learning statistics in popup
- [ ] Show "Recommended" badge on suggested tone
- [ ] Add "Reset Preferences" button
- [ ] Show confidence level indicator

---

## Regression Testing

### 13. Verify No Regressions ✅
- [ ] Test on WhatsApp Web
- [ ] Test on Instagram DM (if implemented)
- [ ] Test with different browsers (Chrome, Edge)
- [ ] Test with different message types (text, emoji, links)
- [ ] Compare with previous version (take screenshots)

---

## Final Validation

### 14. Production Readiness ✅
- [ ] No console errors
- [ ] No network failures
- [ ] Extension icon shows correctly
- [ ] Popup opens without issues
- [ ] Generated replies are contextually appropriate
- [ ] Reply quality improved vs. before

---

## Test Results Template

```
Date: ___________
Tester: ___________
Browser: Chrome / Edge / Other
Platform: WhatsApp / Instagram / Other

Feature Status:
✅ Quoted Message Detection: PASS / FAIL
✅ Media Detection: PASS / FAIL
✅ Intent Detection: PASS / FAIL
✅ Emotional State: PASS / FAIL
✅ Summarization: PASS / FAIL
✅ Preference Learning: PASS / FAIL
✅ Existing Features: PASS / FAIL

Issues Found:
1. ________________________________
2. ________________________________

Overall Status: PASS / FAIL
```

---

## Quick Test Script

Run this in browser console for rapid testing:

```javascript
// Quick validation
async function quickTest() {
  console.log('🧛 Gracula Quick Test\n');

  // Test 1: Classes exist
  console.log('1. Checking classes...');
  const hasExtractor = typeof window.Gracula.ContextExtractor !== 'undefined';
  const hasSummarizer = typeof window.Gracula.ConversationSummarizer !== 'undefined';
  const hasLearner = typeof window.Gracula.PreferenceLearner !== 'undefined';
  console.log(`   ContextExtractor: ${hasExtractor ? '✅' : '❌'}`);
  console.log(`   ConversationSummarizer: ${hasSummarizer ? '✅' : '❌'}`);
  console.log(`   PreferenceLearner: ${hasLearner ? '✅' : '❌'}\n`);

  // Test 2: Extract context
  console.log('2. Testing context extraction...');
  const platform = window.Gracula.detectPlatform();
  const extractor = new window.Gracula.ContextExtractor(platform);
  const messages = extractor.extract();
  console.log(`   Extracted ${messages.length} messages ✅\n`);

  // Test 3: Analyze conversation
  console.log('3. Testing conversation analysis...');
  const analysis = extractor.conversationAnalysis;
  console.log(`   Intent: ${analysis?.intent?.primary || 'none'}`);
  console.log(`   Emotion: ${analysis?.emotionalState?.state || 'neutral'}`);
  console.log(`   Urgency: ${analysis?.urgency?.level || 'low'}\n`);

  // Test 4: Check preferences
  console.log('4. Testing preference learning...');
  const learner = new window.Gracula.PreferenceLearner();
  await learner.loadPreferences();
  const stats = learner.getStats();
  console.log(`   Total selections: ${stats.totalSelections}`);
  console.log(`   Confidence: ${stats.confidence}\n`);

  console.log('✅ Quick test complete!');
}

// Run it
quickTest();
```

---

**Happy Testing! 🎉**

Report any issues and mark completed tests with ✅
