# ⚡ Gracula Quick Start

Get Gracula running in 5 minutes!

## 📦 What You Have

Your Gracula folder should contain:
- ✅ `manifest.json` - Extension configuration
- ✅ `config.js` - Tones and settings
- ✅ `content.js` - Main functionality
- ✅ `background.js` - API handler
- ✅ `styles.css` - UI styling
- ✅ `popup.html` - Settings page
- ✅ `popup.js` - Settings logic
- ✅ `README.md` - Full documentation
- ✅ `SETUP_GUIDE.md` - Detailed setup
- ✅ `TESTING_GUIDE.md` - Testing instructions
- ✅ `create-icons.html` - Icon generator

## 🚀 3-Step Installation

### Step 1: Create Icons (2 minutes)

1. Open `create-icons.html` in your browser
2. Click "Download All Icons"
3. Create a folder named `icons` in your Gracula directory
4. Move the 3 downloaded PNG files into the `icons` folder

**Your folder should now look like:**
```
gracula/
├── manifest.json
├── config.js
├── content.js
├── background.js
├── styles.css
├── popup.html
├── popup.js
├── icons/
│   ├── icon16.png  ✅
│   ├── icon48.png  ✅
│   └── icon128.png ✅
└── README.md
```

### Step 2: Load Extension (2 minutes)

1. Open Chrome and go to: `chrome://extensions/`
2. Turn ON "Developer mode" (top-right toggle)
3. Click "Load unpacked" button
4. Select your Gracula folder
5. Done! You should see Gracula in your extensions list

### Step 3: Test It! (1 minute)

1. Go to https://web.whatsapp.com
2. Open any chat
3. Click on the message input field
4. Look for the floating 🧛 button
5. Click it and select a tone
6. Watch the magic happen! ✨

## 🎯 First Use

### Without API Key (Works Immediately)
- Gracula uses fallback mock replies
- Perfect for testing
- May have rate limits on free AI tier

### With API Key (Better Results)
1. Get free key: https://huggingface.co/settings/tokens
2. Click Gracula icon in Chrome toolbar
3. Paste API key
4. Click "Save Settings"
5. Enjoy unlimited, high-quality replies!

## ✅ Quick Test Checklist

- [ ] Extension loaded in Chrome
- [ ] Icons showing correctly
- [ ] Popup opens when clicking icon
- [ ] Button appears on WhatsApp Web
- [ ] Modal opens when clicking button
- [ ] All 11 tones are visible
- [ ] Replies generate successfully
- [ ] Insert button works
- [ ] Copy button works

## 🎨 Supported Tones

1. 💬 **Default** - Natural replies
2. 😠 **Angry** - Frustrated responses
3. 😎 **Chill** - Relaxed vibes
4. 🤔 **Confused** - Questioning
5. 🤩 **Excited** - Enthusiastic
6. 😘 **Flirty** - Playful
7. 📝 **Formal** - Professional
8. 😂 **Funny** - Humorous
9. 🤙 **GenZ** - Trendy slang
10. 🎵 **Lyrical** - Poetic
11. ✨ **Creative Praise** - Complimentary

## 🌐 Supported Platforms

Works on:
- ✅ WhatsApp Web
- ✅ Instagram DM
- ✅ Facebook Messenger
- ✅ LinkedIn Messages
- ✅ Twitter/X DMs
- ✅ Discord
- ✅ Slack
- ✅ Gmail
- ✅ Telegram Web

## 🐛 Troubleshooting

### Button Not Showing?
1. Refresh the page (F5)
2. Click on the input field
3. Check extension is enabled
4. Look for console errors (F12)

### API Errors?
1. Normal for free tier (rate limits)
2. Add your own API key for better results
3. Extension will use fallback replies

### Extension Not Loading?
1. Check all files are present
2. Verify icons folder exists
3. Reload extension in chrome://extensions/
4. Check for errors in extension details

## 📚 Need More Help?

- **Full Setup**: Read `SETUP_GUIDE.md`
- **Testing**: Read `TESTING_GUIDE.md`
- **Documentation**: Read `README.md`
- **Issues**: Check browser console (F12)

## 🎉 You're Ready!

Gracula is now installed and ready to use. Try it on your favorite messaging platform!

**Tips:**
- Start with WhatsApp Web (most tested)
- Try different tones to see variety
- Add API key for best results
- Customize tones in config.js if needed

---

**Made with 🧛 by Gracula Team**

*Never send a boring message again!*

