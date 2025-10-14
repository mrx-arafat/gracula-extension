# 🧛 Gracula - AI Reply Assistant

**Never run out of words again!** Gracula is a Chrome extension that helps you generate AI-powered replies and rewrites for messaging apps with different tones.

## ✨ Features

- 🤖 **AI Reply Generation** - Get creative AI-powered replies to conversations
- 🎭 **11 Different Tones** - Angry, Chill, Confused, Excited, Flirty, Formal, Funny, GenZ, Lyrical, Creative Praise, and Default
- 🌐 **Universal Support** - Works on WhatsApp Web, Instagram, Messenger, Facebook, LinkedIn, Twitter/X, Discord, Slack, Gmail, Telegram, and more
- 💬 **Context-Aware** - Analyzes recent conversation for relevant replies
- 🎨 **Beautiful UI** - Floating button interface inspired by mobile apps
- 🆓 **Completely Free** - No subscriptions, no token limits

## 🚀 Installation

### Method 1: Load Unpacked Extension (For Development/Testing)

1. **Download or Clone** this repository to your computer

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Go to `chrome://extensions/`
   - Or click Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to the folder containing Gracula files
   - Select the folder and click "Select Folder"

5. **Done!** You should see the Gracula extension icon in your toolbar

### Method 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon!

## 📖 How to Use

### Step 1: Visit a Messaging Platform
Open any supported messaging platform:
- WhatsApp Web (web.whatsapp.com)
- Instagram Direct Messages
- Facebook Messenger
- LinkedIn Messages
- Twitter/X DMs
- Discord
- Slack
- Gmail
- Telegram Web
- And more!

### Step 2: Click on Message Input
Click on any message input field to focus it.

### Step 3: Click the Gracula Button
Look for the floating 🧛 Gracula button that appears near the input field.

### Step 4: Select a Tone
Choose from 11 different tones:
- 💬 **Default** - Natural, friendly replies
- 😠 **Angry** - Frustrated, irritated responses
- 😎 **Chill** - Relaxed, laid-back vibes
- 🤔 **Confused** - Questioning, uncertain responses
- 🤩 **Excited** - Enthusiastic, energetic replies
- 😘 **Flirty** - Playful, charming messages
- 📝 **Formal** - Professional, polite responses
- 😂 **Funny** - Humorous, witty replies
- 🤙 **GenZ** - Trendy slang and internet culture
- 🎵 **Lyrical** - Poetic, artistic expressions
- ✨ **Creative Praise** - Complimentary, uplifting messages

### Step 5: Choose and Insert
- Review the 3 generated reply options
- Click "Insert" to add it to your message input
- Or click "Copy" to copy it to clipboard

## ⚙️ Configuration (Optional)

### Adding Your Own API Key

For better performance and no rate limits, you can add your own Hugging Face API key:

1. **Get a Free API Key**
   - Visit [huggingface.co](https://huggingface.co/)
   - Create a free account
   - Go to Settings → Access Tokens
   - Create a new token

2. **Add to Gracula**
   - Click the Gracula extension icon in Chrome toolbar
   - Paste your API key in the settings
   - Click "Save Settings"

### Changing AI Model

You can choose from different AI models:
- **Mistral 7B** (Recommended) - Best balance of quality and speed
- **Llama 2 7B** - Good alternative
- **Flan-T5 Large** - Faster, lighter model
- **Falcon 7B** - Another quality option

## 🛠️ Technical Details

### Architecture
- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No frameworks, lightweight and fast
- **Content Scripts** - Inject UI into web pages
- **Background Service Worker** - Handle API calls
- **Hugging Face API** - Free AI inference

### File Structure
```
gracula/
├── manifest.json          # Extension configuration
├── config.js             # Tones and platform configurations
├── content.js            # Main content script
├── background.js         # API handler
├── styles.css            # UI styles
├── popup.html            # Settings popup
├── popup.js              # Settings logic
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| WhatsApp Web | ✅ Supported | Fully tested |
| Instagram DM | ✅ Supported | Fully tested |
| Facebook Messenger | ✅ Supported | Fully tested |
| LinkedIn Messages | ✅ Supported | Fully tested |
| Twitter/X DMs | ✅ Supported | Fully tested |
| Discord | ✅ Supported | Fully tested |
| Slack | ✅ Supported | Fully tested |
| Gmail | ✅ Supported | Fully tested |
| Telegram Web | ✅ Supported | Fully tested |
| Other platforms | 🔄 Experimental | May work on other sites |

## 🔒 Privacy & Security

- **No Data Collection** - Gracula does not collect or store any personal data
- **Local Processing** - Conversation context is processed locally
- **API Calls Only** - Only the prompt is sent to AI API for generation
- **No Tracking** - No analytics, no tracking, no telemetry
- **Open Source** - All code is transparent and auditable

## 🐛 Troubleshooting

### Floating Button Not Appearing
- Make sure you've clicked on the message input field
- Refresh the page and try again
- Check if the extension is enabled in `chrome://extensions/`

### API Errors
- The free Hugging Face API has rate limits
- Add your own API key for unlimited usage
- Try a different AI model in settings

### Platform Not Working
- Some platforms update their UI frequently
- Report the issue so we can update selectors
- Try refreshing the page

### Generated Replies Are Poor Quality
- Add your own Hugging Face API key for better models
- Try different AI models in settings
- Provide more conversation context

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs** - Open an issue with details
2. **Suggest Features** - Share your ideas
3. **Add Platform Support** - Help us support more messaging apps
4. **Improve Prompts** - Better tone prompts = better replies
5. **Translate** - Help make Gracula multilingual

## 📝 Roadmap

### Version 1.0 (Current)
- ✅ AI Reply Generation
- ✅ 11 Tone Options
- ✅ Multi-platform Support
- ✅ Floating Button UI

### Version 1.1 (Planned)
- 🔄 AI Rewrite Feature
- 🔄 Custom Prompts
- 🔄 Keyboard Shortcuts
- 🔄 Dark Mode

### Version 1.2 (Future)
- 🔄 AI Chat Feature
- 🔄 Multi-language Support
- 🔄 Voice Input
- 🔄 GIF Integration

## 📄 License

MIT License - Feel free to use, modify, and distribute!

## 💬 Support

- **Email**: support@gracula.app
- **Issues**: [GitHub Issues](https://github.com/yourusername/gracula/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gracula/discussions)

## 🙏 Acknowledgments

- Inspired by AInput Android app
- Powered by Hugging Face AI models
- Built with ❤️ for the community

---

**Made with 🧛 by the Gracula Team**

*Never send a boring message again!*

