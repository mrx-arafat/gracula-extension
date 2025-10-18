# Context-Aware Reply Generation Test Plan

## Test Objective
Verify that the Gracula extension generates contextually relevant replies based on:
1. Conversation topics
2. Language mix (English + Romanized Bangla)
3. Conversation style (lowercase, emoji usage)
4. Last message from a friend
5. Different tones

## Test Scenarios

### Scenario 1: PayPal Conversation (Current)
**Context**: Discussion about PayPal account
**Topics**: paypal, bhai, taka
**Language**: English + Romanized Bangla
**Last Message**: "Paypal nai" from Nigash Khaled CSE 20

**Expected Replies**:
- **Funny**: Should reference PayPal and use Bangla
  - ✅ "Haha paypal? That's hilarious! 😂"
  - ✅ "LOL bhai, paypal nai mane shob shesh! 🤣"
  - ✅ "paypal er jonno etoh tension? Chill koro! 😄"

- **Chill**: Should be relaxed about PayPal
  - ✅ "Yeah no worries about paypal, we'll figure it out"
  - ✅ "Chill bhai, paypal hoye jabe"
  - ✅ "Relax, it's all good"

- **Confused**: Should ask about PayPal
  - ✅ "Wait, paypal ki? I'm confused 🤔"
  - ✅ "Hmm, paypal er byapare ektu explain koro"
  - ✅ "Sorry bhai, paypal ta bujhlam na"

- **Angry**: Should express frustration about PayPal
  - ✅ "Seriously? paypal nai? This is frustrating! 😠"
  - ✅ "Bhai this paypal situation is ridiculous"
  - ✅ "I can't believe this is happening with paypal"

- **Short**: Should be brief and mention PayPal
  - ✅ "Ok paypal"
  - ✅ "Got it"
  - ✅ "Sure"

### Scenario 2: Different Topic Test
**Action**: Test with a different conversation to verify topic adaptation
**Expected**: Replies should reference the new topic, not PayPal

### Scenario 3: Style Adaptation Test
**Action**: Test with conversations that have different styles
- Uppercase vs lowercase
- Heavy emoji vs no emoji
- Formal vs casual

**Expected**: Replies should match the conversation style

## Test Execution Steps

1. **Reload Extension**
   - Navigate to `chrome://extensions/`
   - Find Gracula extension
   - Click reload button

2. **Open WhatsApp Web**
   - Navigate to `https://web.whatsapp.com`
   - Wait for page to load
   - Open Vratas chat

3. **Test Each Tone**
   - Click Gracula button
   - For each tone (Default, Funny, Chill, Confused, Excited, Angry, Sarcastic, Motivational, Formal, Short):
     - Click tone button
     - Verify replies are contextually relevant
     - Check if topics are referenced
     - Check if language mix is appropriate
     - Check if style matches conversation

4. **Verify Console Logs**
   - Check for: "🧛 Gracula: Generating context-aware mock replies"
   - Check for: "🧛 Gracula: Detected tone: [tone]"
   - Check for: "🧛 Gracula: Last message: [message]"
   - Check for: "🧛 Gracula: Topics: [topics]"

## Success Criteria

✅ **Context Awareness**
- Replies reference conversation topics (e.g., "paypal", "bhai")
- Replies don't use generic templates

✅ **Language Mix**
- Replies use both English and Romanized Bangla
- Language mix matches conversation style

✅ **Style Matching**
- Lowercase preference is respected
- Emoji usage matches conversation level
- Tone is appropriate

✅ **Topic Adaptation**
- Different conversations generate different replies
- Topics are correctly extracted and used

## Issues to Check

1. **Extension Caching**: Verify extension reloads pick up code changes
2. **Topic Extraction**: Verify topics are correctly identified
3. **Language Detection**: Verify language mix is detected
4. **Style Detection**: Verify style markers are detected
5. **Fallback Behavior**: Verify generic replies when context is unavailable

## Improvements to Consider

1. **More Natural Language**
   - Use more varied sentence structures
   - Add more Bangla phrases
   - Make replies sound more conversational

2. **Better Topic Integration**
   - Reference specific details from last message
   - Use context from multiple recent messages
   - Avoid repetitive patterns

3. **Smarter Style Matching**
   - Detect formality level
   - Match sentence length
   - Match punctuation style

4. **Enhanced Emoji Usage**
   - Use emojis that match the topic
   - Vary emoji placement
   - Match emoji frequency

5. **Conversation Flow**
   - Consider conversation history
   - Detect if it's a question or statement
   - Respond appropriately to urgency

