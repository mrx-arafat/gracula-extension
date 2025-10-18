# 🧪 Complete Testing Guide - Context-Aware Reply Generation

## 📋 Overview

This guide will help you thoroughly test the new context-aware reply generation feature using Playwright MCP and manual testing.

---

## 🔄 Part 1: Extension Reload (REQUIRED FIRST!)

### Why Reload?
Chrome caches the background service worker. Without reloading, you'll still see the old generic replies.

### How to Reload:
1. Open `chrome://extensions/` in Chrome
2. Find "Gracula" extension
3. Click the reload button (🔄 circular arrow)
4. Refresh your WhatsApp Web tab (F5)

### Verify Reload Worked:
Open browser console (F12) and look for:
```
🧛 Gracula Background Script loaded
```

---

## 🎯 Part 2: Manual Testing

### Test 1: PayPal Conversation (Negative Message)

**Setup**:
1. Open WhatsApp Web
2. Open "Vratas" chat
3. Last message should be: "Paypal nai" from Nigash Khaled CSE 20

**Steps**:
1. Click the purple Gracula button (bottom-right)
2. Verify context shows topics: "paypal, bhai, taka"
3. Click "💬 Default" tone
4. Check generated replies

**Expected Results**:
```
✅ Reply 1: "Oh, paypal nai? Let me see what we can do"
✅ Reply 2: "No worries about paypal, we'll figure it out"
✅ Reply 3: "Okay, paypal na thakle alternative dekhbo"
```

**What to Check**:
- [ ] Replies mention "paypal" (the topic)
- [ ] Replies acknowledge the negative ("nai")
- [ ] Replies use mixed language (English + Bangla)
- [ ] Replies are reassuring (not generic)

---

### Test 2: Different Tones with Same Context

**Setup**: Same Vratas chat (last message: "Paypal nai")

**Test Each Tone**:

#### 😂 Funny
**Expected**:
```
✅ "Haha paypal? That's hilarious! 😂"
✅ "LOL bhai, paypal nai mane shob shesh! 🤣"
✅ "paypal er jonno etoh tension? Chill koro! 😄"
```
**Check**: Humor + topic reference + Bangla

#### 😎 Chill
**Expected**:
```
✅ "Yeah no worries about paypal, we'll figure it out"
✅ "Chill bhai, paypal hoye jabe"
✅ "Relax, it's all good"
```
**Check**: Relaxed tone + reassurance

#### 🤔 Confused
**Expected**:
```
✅ "Wait, paypal ki? I'm confused 🤔"
✅ "Hmm, paypal er byapare ektu explain koro"
✅ "Sorry bhai, paypal ta bujhlam na"
```
**Check**: Asks for clarification + topic reference

#### 😠 Angry
**Expected**:
```
✅ "Seriously? paypal nai? This is frustrating! 😠"
✅ "Bhai this paypal situation is ridiculous"
✅ "I can't believe this is happening with paypal"
```
**Check**: Frustration + topic reference

#### ⚡ Short
**Expected**:
```
✅ "Ok paypal"
✅ "Got it"
✅ "Sure"
```
**Check**: Brief + topic mention

---

### Test 3: Different Conversation (Topic Adaptation)

**Setup**:
1. Open a different WhatsApp chat
2. One with different topics (not paypal)

**Steps**:
1. Click Gracula button
2. Note the topics shown in context
3. Generate replies with any tone

**Expected**:
- Replies should reference the NEW topics
- Replies should NOT mention "paypal"
- Replies should adapt to the new conversation

**Example**:
If topics are "meeting, time, tomorrow":
```
✅ "Okay, let me check about the meeting thing"
✅ "Got it, I'll look into meeting"
```

---

## 🖥️ Part 3: Console Log Verification

### Open Browser Console
Press `F12` or `Ctrl+Shift+I`

### What to Look For

#### When Clicking Gracula Button:
```
🧛 Gracula: Extracting Conversation Context
🧛 [CONTEXT] Found date separator: Yesterday
🧛 [CONTEXT] Found date separator: Today
🧛 Gracula: ✅ Extracted 30 valid messages
📊 Topics: paypal, bhai, taka
```

#### When Clicking a Tone Button:
```
🧛 Gracula: Tone selected: Funny
🧛 Gracula: Generating Funny replies...
🧛 Gracula: Generating context-aware mock replies  ← NEW!
🧛 Gracula: Detected tone: funny                   ← NEW!
🧛 Gracula: Last message: Paypal nai               ← NEW!
🧛 Gracula: Topics: paypal, bhai, taka             ← NEW!
🧛 Gracula: ✅ Replies generated successfully
```

### ⚠️ If You DON'T See the NEW Logs:
The extension is still using cached code. Try:
1. Close ALL Chrome windows
2. Reopen Chrome
3. Go to `chrome://extensions/`
4. Reload Gracula extension
5. Test again

---

## 📊 Part 4: Quality Assessment

### Scoring Rubric

For each tone tested, rate 1-5:

#### Context Awareness (1-5)
- 5: Perfectly references topic and message sentiment
- 4: References topic, partially considers sentiment
- 3: References topic, ignores sentiment
- 2: Generic with minimal topic reference
- 1: Completely generic, no context

#### Language Mix (1-5)
- 5: Perfect blend of English + Romanized Bangla
- 4: Good mix, natural sounding
- 3: Some Bangla, mostly English
- 2: Minimal Bangla
- 1: English only

#### Tone Appropriateness (1-5)
- 5: Perfect match for selected tone
- 4: Good match, minor inconsistencies
- 3: Somewhat matches tone
- 2: Barely matches tone
- 1: Doesn't match tone at all

#### Naturalness (1-5)
- 5: Sounds like a real person
- 4: Mostly natural, minor awkwardness
- 3: Somewhat robotic
- 2: Very robotic
- 1: Completely unnatural

---

## 🐛 Part 5: Issue Reporting

### If Something Doesn't Work

**Issue Template**:
```
**What I Expected**:
[Describe what should happen]

**What Actually Happened**:
[Describe what actually happened]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Console Logs**:
[Paste relevant console logs]

**Screenshots**:
[Attach screenshots if helpful]
```

### Common Issues & Solutions

#### Issue: Replies are still generic
**Solution**: Extension not reloaded. Follow Part 1 again.

#### Issue: No console logs appear
**Solution**: Background script not loaded. Check `chrome://extensions/` for errors.

#### Issue: Topics not detected
**Solution**: Chat may not have enough messages. Try a chat with more history.

#### Issue: Language mix is wrong
**Solution**: This is expected behavior - it adapts to conversation style.

---

## ✅ Part 6: Success Criteria

### Minimum Requirements
- [ ] Extension reloads without errors
- [ ] Gracula button appears on WhatsApp
- [ ] Context extraction shows correct topics
- [ ] At least 3 tones generate context-aware replies
- [ ] Replies reference conversation topics
- [ ] Console shows new context-aware logs

### Ideal Results
- [ ] All 11 tones generate contextually relevant replies
- [ ] Replies adapt to message type (question/negative/positive)
- [ ] Language mix matches conversation style
- [ ] Replies sound natural and conversational
- [ ] No repetitive patterns across different tones
- [ ] Topics are correctly extracted from all conversations

---

## 📝 Part 7: Feedback Form

After testing, please provide feedback:

### Overall Impression
- [ ] Much better than before
- [ ] Somewhat better
- [ ] About the same
- [ ] Worse than before

### Specific Feedback

**What works well?**
[Your answer]

**What needs improvement?**
[Your answer]

**Favorite tone?**
[Your answer]

**Least favorite tone?**
[Your answer]

**Suggestions for new features?**
[Your answer]

---

## 🚀 Next Steps

After completing this test:
1. Document any issues found
2. Note which tones work best
3. Identify patterns that need improvement
4. Suggest new features or enhancements

Thank you for testing! 🎉

