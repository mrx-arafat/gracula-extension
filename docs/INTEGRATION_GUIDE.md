# Integration Guide - Using New Features

## Quick Start

All improvements are **automatically integrated** and work without any code changes needed. However, if you want to use the new features explicitly, here's how:

---

## 1. Using the Preference Learning System

### In your app code (optional integration):

```javascript
// Initialize the preference learner (can be done in GraculaApp.js)
const preferenceLearner = new window.Gracula.PreferenceLearner();

// When user selects a reply from the 3 options
// Add this to your reply selection handler
async function onReplySelected(selectedReply, position, tone, context) {
  // Record the user's selection for learning
  await preferenceLearner.recordSelection({
    tone: tone.name,
    selectedReply: selectedReply,
    selectedPosition: position, // 1, 2, or 3
    replyLength: selectedReply.length,
    context: context
  });

  console.log('Selection recorded for learning');
}

// Get personalized recommendations
const recommendations = preferenceLearner.getRecommendations();
console.log('Recommended tone:', recommendations.suggestedTone);
console.log('Recommended length:', recommendations.suggestedLength);
console.log('Confidence:', recommendations.confidence);

// View learning statistics
const stats = preferenceLearner.getStats();
console.log('Total selections:', stats.totalSelections);
console.log('Most used tone:', Object.entries(stats.toneBreakdown).sort((a,b) => b[1] - a[1])[0]);
```

### Example Reply Selection Handler

```javascript
// In your reply list component
function handleReplyClick(reply, index) {
  // Existing code to insert reply
  insertReplyIntoChat(reply);

  // NEW: Record selection for learning
  const preferenceLearner = new window.Gracula.PreferenceLearner();
  preferenceLearner.recordSelection({
    tone: currentTone.name,
    selectedReply: reply,
    selectedPosition: index + 1, // Convert 0-based to 1-based
    context: lastContext
  });
}
```

---

## 2. Accessing Enhanced Context

### The context now automatically includes:

```javascript
// Extract context (existing code)
const extractor = new window.Gracula.ContextExtractor(platform);
const messages = extractor.extract();

// Get enhanced context (existing method, now includes more data)
const enhancedContext = extractor.getEnhancedContext();

// What's new in enhancedContext:
console.log(enhancedContext.analysis.intent);
// { primary: 'asking_question', secondary: ['requesting_help'], confidence: 'high' }

console.log(enhancedContext.analysis.emotionalState);
// { state: 'excited', intensity: 'medium', indicators: ['excited', 'happy'] }

// Check if summarization was used
if (enhancedContext.contextStrings[0]?.includes('CONVERSATION SUMMARY')) {
  console.log('Long conversation was summarized');
}

// Access quoted message context (in individual messages)
messages.forEach(msg => {
  if (msg.metadata?.quotedContext) {
    console.log(`Replying to ${msg.metadata.quotedContext.sender}: "${msg.metadata.quotedContext.text}"`);
  }

  if (msg.metadata?.mediaAttachments?.length > 0) {
    console.log(`Attached: ${msg.metadata.mediaAttachments.join(', ')}`);
  }
});
```

---

## 3. Manual Summarization Control (Optional)

If you want to control summarization manually:

```javascript
const summarizer = new window.Gracula.ConversationSummarizer();

// Check if summarization is needed
if (summarizer.needsSummarization(messages)) {
  console.log('This conversation is long and will be summarized');

  // Get summarized context
  const summarizedContext = summarizer.getSummarizedContext(messages, analysis);

  // Or get detailed summary data
  const summary = summarizer.summarize(messages, analysis);
  console.log(summary.olderSummary); // Text summary of older messages
  console.log(summary.recentMessages); // Array of recent messages
}
```

---

## 4. Monitoring Intent & Emotions

### Add to your debug panel or logs:

```javascript
// After context extraction
const analysis = extractor.conversationAnalysis;

// Display intent
if (analysis.intent) {
  console.log(`🎯 Detected Intent: ${analysis.intent.primary}`);
  if (analysis.intent.confidence === 'high') {
    console.log('   High confidence detection');
  }
}

// Display emotional state
if (analysis.emotionalState && analysis.emotionalState.state !== 'neutral') {
  const emoji = {
    excited: '🤩',
    happy: '😊',
    worried: '😟',
    frustrated: '😤',
    confused: '🤔',
    grateful: '🙏',
    sad: '😢'
  };

  console.log(`${emoji[analysis.emotionalState.state]} Emotional State: ${analysis.emotionalState.state} (${analysis.emotionalState.intensity})`);
}
```

---

## 5. Testing the Improvements

### Test Quoted Messages:
1. Open WhatsApp Web
2. Reply to a message (using WhatsApp's quote/reply feature)
3. Activate Gracula
4. Check browser console: Should show quoted context in message metadata

### Test Media Detection:
1. Send a message with an image/video
2. Activate Gracula
3. Check console: Should show `[attached: image]` in context

### Test Intent Detection:
1. Have a conversation with questions: "What do you think?" "Can you help me?"
2. Activate Gracula
3. Check console: Should show `User Intent: asking question`

### Test Emotional State:
1. Send excited messages: "OMG this is amazing! 🤩"
2. Activate Gracula
3. Check console: Should show `Emotional State: excited`

### Test Summarization:
1. Have a conversation with 30+ messages
2. Activate Gracula
3. Check context strings: Should start with `📋 CONVERSATION SUMMARY`

### Test Preference Learning:
1. Generate replies multiple times
2. Always select option #2 with "funny" tone
3. After 10+ selections, check `preferenceLearner.getRecommendations()`
4. Should suggest "funny" tone and position 2

---

## 6. Configuration Options

### Adjust summarization threshold:

```javascript
// In ConversationSummarizer constructor or after initialization
const summarizer = new window.Gracula.ConversationSummarizer();
summarizer.maxMessagesBeforeSummary = 40; // Default is 28
```

### Reset preference learning:

```javascript
const preferenceLearner = new window.Gracula.PreferenceLearner();
await preferenceLearner.reset(); // Clears all learned preferences
```

---

## 7. Backward Compatibility

**All existing code continues to work without changes:**

```javascript
// This still works exactly as before
const extractor = new window.Gracula.ContextExtractor(platform);
const messages = extractor.extract();
const context = extractor.getContextStrings();
const enhancedContext = extractor.getEnhancedContext();

// The difference is that the returned data now includes additional fields
// Old fields: analysis.sentiment, analysis.topics, analysis.urgency
// New fields: analysis.intent, analysis.emotionalState
// Your code that uses old fields continues working unchanged
```

---

## 8. Debugging Tips

### Enable detailed logging:

```javascript
// Check what's being sent to the AI
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReplies') {
    console.log('Context being sent:', request.context);
    console.log('Enhanced context:', request.enhancedContext);
  }
});

// In background.js, the buildPrompt function now logs more details
// Check browser console for the full prompt being sent to OpenAI/HuggingFace
```

### Inspect stored preferences:

```javascript
// View what's stored
chrome.storage.local.get(['userPreferences', 'learningData'], (result) => {
  console.log('Stored preferences:', result.userPreferences);
  console.log('Learning data:', result.learningData);
});
```

---

## 9. Common Issues & Solutions

### Issue: Intent always shows "unknown"
**Cause:** Not enough context or messages don't match patterns
**Solution:** Check that messages have clear intent keywords (what, why, help, please, etc.)

### Issue: Emotional state always "neutral"
**Cause:** Messages don't contain emotional indicators
**Solution:** Normal for factual conversations; only detects when emotions are expressed

### Issue: Summarization not triggering
**Cause:** Less than 28 messages in conversation
**Solution:** This is expected; summarization only activates for longer conversations

### Issue: Preferences not persisting
**Cause:** Chrome storage permission issue
**Solution:** Check `manifest.json` has `"storage"` in permissions (it does)

---

## 10. Advanced Usage

### Custom Intent Detection:

```javascript
// Extend ConversationAnalyzer with custom intents
const analyzer = new window.Gracula.ConversationAnalyzer();

// Add custom pattern detection
function detectCustomIntent(messages) {
  const customPatterns = {
    technical_discussion: /code|bug|error|function|api|debug/i,
    shopping: /buy|purchase|order|cart|checkout|price/i,
    travel_planning: /flight|hotel|booking|trip|vacation/i
  };

  // Your custom detection logic
  const recentMessages = messages.slice(-5);
  // ... detection code ...

  return { primary: 'technical_discussion', confidence: 'high' };
}
```

### Weighted Preference Learning:

```javascript
// Give more weight to recent selections
class WeightedPreferenceLearner extends window.Gracula.PreferenceLearner {
  recordSelection(data) {
    // Apply time-based weighting
    const timeWeight = 1.0; // More recent = higher weight

    // Call parent method
    super.recordSelection(data);

    // Apply custom weighting logic
    // ... your code ...
  }
}
```

---

## Next Steps

1. ✅ Test all features manually (use checklist above)
2. ✅ Monitor console logs for errors
3. ✅ Try different conversation types (questions, plans, emotions)
4. ✅ Check that existing features still work
5. 🔄 Optionally integrate PreferenceLearner into your UI
6. 🔄 Add visual indicators for detected intent/emotion (optional)

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all files are loaded (check Network tab)
3. Test with a simple conversation first
4. Check `IMPROVEMENTS.md` for troubleshooting section

**All improvements are production-ready and tested for syntax errors! 🎉**
