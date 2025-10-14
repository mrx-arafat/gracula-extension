# 🔑 OpenAI API Setup Guide for Gracula

## ✅ What's Been Updated

Gracula now uses **OpenAI's GPT models** for high-quality AI-powered replies! This provides:

- ✨ **Better quality** responses
- 🎯 **More accurate** tone matching
- 🚀 **Faster** generation
- 💬 **More natural** conversations

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Load the Extension

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `gracula-extension` folder
5. Extension should now be loaded! ✅

### Step 2: Add Your OpenAI API Key

1. Click the **Gracula icon** in Chrome toolbar (🧛)
2. In the popup, you'll see **"API Settings"**
3. Make sure **"OpenAI"** is selected as the provider
4. Paste your API key in the **"API Key"** field:
   ```
   sk-proj-YOUR_OPENAI_API_KEY_HERE
   ```
5. Select your preferred model (GPT-3.5 Turbo recommended for speed)
6. Click **"Save Settings"**
7. You should see: ✓ Settings saved successfully!

### Step 3: Test It!

1. Go to **https://web.whatsapp.com**
2. Open any chat
3. Click on the message input field
4. Look for the **🧛 floating button** (appears on the right)
5. Click it and select a tone (e.g., "Funny")
6. Wait 2-3 seconds for AI to generate replies
7. Click **"Insert"** to add the reply to your message
8. Done! 🎉

---

## 🎛️ Configuration Options

### AI Provider Options

**OpenAI (Recommended)**
- Best quality responses
- Fast generation (2-3 seconds)
- Requires API key
- Small cost per request (~$0.001-0.002)

**Hugging Face (Free Alternative)**
- Free to use
- Slower generation (5-10 seconds)
- May have rate limits
- Lower quality responses

### OpenAI Model Options

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| **GPT-3.5 Turbo** | ⚡⚡⚡ Fast | ⭐⭐⭐ Good | 💰 Cheap | Daily use, quick replies |
| **GPT-4** | ⚡ Slower | ⭐⭐⭐⭐⭐ Best | 💰💰💰 Expensive | Important messages |
| **GPT-4 Turbo** | ⚡⚡ Medium | ⭐⭐⭐⭐ Great | 💰💰 Moderate | Balanced option |

**Recommendation:** Start with **GPT-3.5 Turbo** for the best balance of speed, quality, and cost.

---

## 💰 API Costs

OpenAI charges per token (roughly per word). Here's what to expect:

- **GPT-3.5 Turbo**: ~$0.001 per reply (very cheap!)
- **GPT-4**: ~$0.01-0.03 per reply
- **GPT-4 Turbo**: ~$0.005 per reply

**Example:** If you generate 100 replies per day with GPT-3.5 Turbo:
- Daily cost: ~$0.10
- Monthly cost: ~$3.00

**Your API key has usage limits set by OpenAI. You can monitor usage at:**
https://platform.openai.com/usage

---

## 🔒 Security & Privacy

### Your API Key is Safe

- ✅ Stored locally in Chrome's secure storage
- ✅ Never sent to any server except OpenAI
- ✅ Not shared with anyone
- ✅ Only used for generating replies

### What Data is Sent to OpenAI?

When you generate a reply, Gracula sends:
- Last 5 messages from the conversation (for context)
- The selected tone (e.g., "Funny", "Formal")
- Your prompt

**What is NOT sent:**
- ❌ Your personal information
- ❌ Contact names or phone numbers
- ❌ Media files or images
- ❌ Full conversation history

---

## 🎨 Available Tones

Gracula supports 11 different tones:

1. **💬 Default** - Natural, friendly replies
2. **😠 Angry** - Frustrated, irritated responses
3. **😎 Chill** - Relaxed, laid-back vibes
4. **🤔 Confused** - Questioning, uncertain
5. **🤩 Excited** - Enthusiastic, energetic
6. **😘 Flirty** - Playful, charming
7. **📝 Formal** - Professional, polite
8. **😂 Funny** - Humorous, witty
9. **🤙 GenZ** - Trendy slang, internet culture
10. **🎵 Lyrical** - Poetic, artistic
11. **✨ Creative Praise** - Complimentary, uplifting

---

## 🌐 Supported Platforms

Gracula works on all major messaging platforms:

- ✅ **WhatsApp Web** (web.whatsapp.com)
- ✅ **Instagram DM** (instagram.com)
- ✅ **Facebook Messenger** (messenger.com)
- ✅ **LinkedIn Messages** (linkedin.com)
- ✅ **Twitter/X DMs** (twitter.com / x.com)
- ✅ **Discord** (discord.com)
- ✅ **Slack** (slack.com)
- ✅ **Gmail** (mail.google.com)
- ✅ **Telegram Web** (web.telegram.org)

---

## 🐛 Troubleshooting

### Button Not Appearing?

1. **Refresh the page** (F5)
2. **Click on the input field** to focus it
3. **Check extension is enabled** in chrome://extensions/
4. **Open console** (F12) and look for 🧛 Gracula messages

### API Key Not Working?

1. **Verify the key** is correct (starts with `sk-proj-` or `sk-`)
2. **Check OpenAI account** has credits: https://platform.openai.com/usage
3. **Try regenerating** the API key at: https://platform.openai.com/api-keys
4. **Make sure** you saved the settings after pasting the key

### "Error Generating Replies"?

**Possible causes:**
- API key is invalid or expired
- OpenAI account has no credits
- Rate limit exceeded (wait a minute and try again)
- Network connection issue

**Solutions:**
1. Check your API key in extension settings
2. Add credits to your OpenAI account
3. Wait 60 seconds and try again
4. Check browser console (F12) for detailed error messages

### Replies Are Low Quality?

1. **Switch to GPT-4** for better quality (more expensive)
2. **Provide more context** - have a longer conversation first
3. **Try different tones** - some work better for certain situations

---

## 🔄 Switching Between Providers

You can switch between OpenAI and Hugging Face anytime:

1. Click Gracula icon in Chrome toolbar
2. Change **"AI Provider"** dropdown
3. Add appropriate API key (if needed)
4. Click **"Save Settings"**
5. Reload messaging pages

**When to use Hugging Face:**
- Testing the extension
- Don't want to pay for API
- Okay with slower/lower quality

**When to use OpenAI:**
- Need high-quality replies
- Want fast generation
- Professional/important conversations

---

## 📊 Testing Checklist

Use this checklist to verify everything works:

### Installation
- [ ] Extension loaded in Chrome
- [ ] No errors in chrome://extensions/
- [ ] Gracula icon visible in toolbar
- [ ] Popup opens when clicking icon

### Configuration
- [ ] OpenAI selected as provider
- [ ] API key pasted and saved
- [ ] Model selected (GPT-3.5 Turbo)
- [ ] Success message shown

### Functionality
- [ ] WhatsApp Web opens successfully
- [ ] Floating button appears near input
- [ ] Button shows on input focus
- [ ] Modal opens when clicking button
- [ ] All 11 tones are visible
- [ ] Conversation context is shown

### Reply Generation
- [ ] Select a tone (e.g., "Funny")
- [ ] Loading spinner appears
- [ ] Wait 2-5 seconds
- [ ] 3 replies are generated
- [ ] Replies match the selected tone
- [ ] Replies are relevant to context

### Reply Insertion
- [ ] Click "Insert" on a reply
- [ ] Modal closes automatically
- [ ] Reply appears in input field
- [ ] Can edit the reply
- [ ] Can send the message

### Copy Function
- [ ] Click "Copy" on a reply
- [ ] Button shows "✓ Copied!"
- [ ] Can paste reply elsewhere
- [ ] Button returns to "Copy"

---

## 🎯 Best Practices

### For Best Results:

1. **Have a conversation first** - More context = better replies
2. **Choose the right tone** - Match the situation
3. **Edit the reply** - Personalize it before sending
4. **Use GPT-3.5 Turbo** - Best balance of speed/quality/cost
5. **Monitor your usage** - Check OpenAI dashboard regularly

### Tips:

- 💡 Try multiple tones to see different styles
- 💡 Combine replies from different generations
- 💡 Use "Copy" to save replies for later
- 💡 Switch to GPT-4 for important messages
- 💡 Keep conversations natural - don't overuse AI

---

## 🆘 Need Help?

### Resources:

- **Extension Issues**: Check browser console (F12)
- **OpenAI Issues**: https://platform.openai.com/docs
- **API Key Help**: https://platform.openai.com/api-keys
- **Usage Monitoring**: https://platform.openai.com/usage

### Common Questions:

**Q: Is my API key safe?**
A: Yes! It's stored securely in Chrome and only used for OpenAI API calls.

**Q: How much will this cost?**
A: Very little! ~$0.001 per reply with GPT-3.5 Turbo. About $3/month for heavy use.

**Q: Can I use this for free?**
A: Switch to Hugging Face provider for free (but slower/lower quality).

**Q: Does this work on mobile?**
A: No, Chrome extensions only work on desktop browsers.

**Q: Can I customize the tones?**
A: Yes! Edit `config.js` to add custom tones and prompts.

---

## ✅ You're All Set!

Your Gracula extension is now configured with OpenAI and ready to use!

**Next Steps:**
1. ✅ Extension loaded
2. ✅ API key configured
3. ✅ Ready to test on WhatsApp Web
4. 🎉 Start generating amazing replies!

---

**Made with 🧛 by Gracula Team**

*Never send a boring message again!*

