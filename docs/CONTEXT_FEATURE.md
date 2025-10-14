# 📝 Context Feature - How It Works

## ✅ What's New:

### 1. **Automatic Context Extraction** 🤖
- Extension now properly extracts actual chat messages (not timestamps!)
- Gets last 8 messages from the conversation
- Filters out timestamps, emojis-only, and system messages
- Shows you exactly what the AI will use as context

### 2. **Editable Context** ✏️
- You can now **edit the context** before generating replies
- Click the **"✏️ Edit"** button to modify context
- Add missing messages manually
- Remove irrelevant messages
- Format it however you want

### 3. **Better Message Detection** 🎯
- Uses multiple strategies to find messages
- Works with WhatsApp groups and individual chats
- Handles different message formats
- Removes duplicates automatically

---

## 🚀 How to Use:

### **Step 1: Open Gracula**
1. Click the 🧛 purple button
2. Modal opens

### **Step 2: Check Context**
You'll see a section at the top:
```
📝 Conversation Context:          [✏️ Edit]
┌─────────────────────────────────────┐
│ hoo bhai                            │
│ chokher pani jomay rakh             │
│ chokh and cock both                 │
│ bhai amar mone hoiteche Khaled...  │
└─────────────────────────────────────┘
```

### **Step 3: Edit Context (Optional)**
1. Click **"✏️ Edit"** button
2. Text area appears with current context
3. **Edit as needed:**
   - Add more messages
   - Remove irrelevant ones
   - Fix typos
   - Add speaker names (e.g., "John: Hey there")
4. Click **"💾 Save Context"**
5. Or click **"❌ Cancel"** to discard changes

### **Step 4: Select Tone**
1. Choose any tone (Funny, Formal, etc.)
2. AI generates replies based on YOUR context
3. Replies will be contextually relevant!

---

## 📊 Context Extraction Details:

### What Gets Extracted:
- ✅ Actual message text
- ✅ Last 8-10 messages
- ✅ Both incoming and outgoing messages
- ✅ Group chat messages
- ✅ Messages with emojis

### What Gets Filtered Out:
- ❌ Timestamps (12:01 am, etc.)
- ❌ Date labels (Today, Yesterday)
- ❌ Emoji-only messages
- ❌ Very short messages (< 3 characters)
- ❌ Duplicate consecutive messages
- ❌ System messages

### Example:

**Raw WhatsApp HTML:**
```
12:01 am
hoo bhai
12:01 am
chokher pani jomay rakh
12:00 am
chokh and cock both
😂
Today
12:01 am
bhai amar mone hoiteche...
```

**Extracted Context:**
```
hoo bhai
chokher pani jomay rakh
chokh and cock both
bhai amar mone hoiteche...
```

---

## 🎯 Context Format:

### Automatic Format:
```
Message 1
Message 2
Message 3
```

### You Can Edit To:
```
Friend: Message 1
Me: Message 2
Friend: Message 3
```

Or:
```
Context: We're discussing dinner plans
Friend: What are you doing tonight?
Me: Nothing much
Friend: Want to grab dinner?
```

---

## 💡 Pro Tips:

### 1. **Add Speaker Names**
Instead of:
```
Hey what's up
Not much, you?
Want to hang out?
```

Do this:
```
John: Hey what's up
Me: Not much, you?
John: Want to hang out?
```

**Result:** AI understands who said what, generates better replies!

### 2. **Add Context Summary**
```
Context: Planning a birthday party for Sarah
Mike: Should we do it at your place?
Me: Yeah, I can host
Mike: What about decorations?
```

**Result:** AI knows the situation, generates relevant replies!

### 3. **Remove Irrelevant Messages**
If context shows:
```
Random joke from 2 hours ago
Another random message
The actual conversation you want to reply to
```

Edit to keep only:
```
The actual conversation you want to reply to
```

**Result:** AI focuses on what matters!

### 4. **Add Missing Messages**
If auto-extraction missed something important:
1. Click Edit
2. Add the missing message
3. Save
4. Generate replies

---

## 🔍 Debugging Context Extraction:

### Check Console (F12):
```
🧛 Gracula: Extracting conversation context...
🧛 Gracula: Found 47 potential message elements
🧛 Gracula: Extracted context: [
  "hoo bhai",
  "chokher pani jomay rakh",
  "chokh and cock both",
  ...
]
```

### If Context is Empty:
1. **Check console** - See what was found
2. **Open a chat** - Make sure you're in a conversation
3. **Scroll up** - Load more messages
4. **Manually add context** - Use the Edit button

### If Context Has Timestamps:
1. **Report the format** - Tell me what you see
2. **Manually edit** - Remove timestamps yourself
3. **I'll fix the filter** - Update the regex

---

## 🧪 Test Cases:

### Test 1: Individual Chat
1. Open 1-on-1 chat
2. Have 5+ messages
3. Click Gracula button
4. **Expected:** Last 5-8 messages shown

### Test 2: Group Chat
1. Open group chat
2. Multiple people talking
3. Click Gracula button
4. **Expected:** Last 5-8 messages from all members

### Test 3: Edit Context
1. Click Edit button
2. Modify text
3. Click Save
4. **Expected:** Preview updates with your changes

### Test 4: Generate with Custom Context
1. Edit context to add specific scenario
2. Select a tone
3. Generate replies
4. **Expected:** Replies match your custom context

---

## 📈 Context Quality:

### Good Context = Better Replies

**Poor Context:**
```
(empty)
```
**Result:** Generic replies, not relevant

**Okay Context:**
```
hey
what's up
nothing
```
**Result:** Basic replies, somewhat relevant

**Good Context:**
```
Friend: Hey, did you finish the project?
Me: Almost done, just need to test it
Friend: Cool, let me know when you're ready
```
**Result:** Specific, contextual, perfect replies!

---

## 🎨 Context Display:

### In Modal:
- **Preview mode:** Shows last 3 messages (compact)
- **Edit mode:** Shows all messages (full)
- **Max height:** 150px with scroll
- **Line breaks:** Each message on new line

### Styling:
- 📝 Icon for context section
- ✏️ Edit button (purple gradient)
- 💾 Save button (purple gradient)
- ❌ Cancel button (gray)
- White background for text area
- Purple border when focused

---

## 🔧 Advanced: Manual Context

### When to Use:
- Auto-extraction fails
- Want to add hypothetical scenario
- Testing different contexts
- Need very specific context

### How to Add:
1. Click Gracula button
2. Click "✏️ Edit"
3. Clear existing text (if any)
4. Type your context:
```
I'm planning a surprise party for my friend.
Need to come up with an excuse to get them to the venue.
They're suspicious because I've been acting weird.
```
5. Click "💾 Save Context"
6. Select tone
7. Generate replies

**Result:** AI generates replies for your exact scenario!

---

## ✅ Success Checklist:

- [ ] Context shows actual messages (not timestamps)
- [ ] Last 5-8 messages visible
- [ ] Edit button works
- [ ] Can modify context
- [ ] Save button updates preview
- [ ] Cancel button discards changes
- [ ] Generated replies match context
- [ ] Works in individual chats
- [ ] Works in group chats
- [ ] Console shows extracted messages

**If ALL checked → CONTEXT FEATURE WORKING!** ✅

---

## 🆘 Troubleshooting:

### Issue: Context shows timestamps
**Solution:** 
- Manually edit to remove them
- Report the format to me
- I'll update the filter

### Issue: Context is empty
**Solution:**
- Check console for extracted messages
- Manually add context using Edit button
- Make sure you're in an active chat

### Issue: Context has wrong messages
**Solution:**
- Use Edit button to fix it
- Remove irrelevant messages
- Add missing ones

### Issue: Edit button doesn't work
**Solution:**
- Check console for errors
- Reload extension
- Try again

---

**Made with 🧛 by Gracula Team**

*Context-Aware AI Replies!*

