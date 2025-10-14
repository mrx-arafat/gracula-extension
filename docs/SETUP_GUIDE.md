# 🚀 Gracula Setup Guide

## Quick Start (5 Minutes)

### Prerequisites
- Google Chrome browser (or any Chromium-based browser like Edge, Brave, Opera)
- Internet connection

### Step-by-Step Installation

#### 1. Download Gracula
- Download all the Gracula files to a folder on your computer
- Make sure all these files are in the same folder:
  - `manifest.json`
  - `config.js`
  - `content.js`
  - `background.js`
  - `styles.css`
  - `popup.html`
  - `popup.js`
  - `README.md`
  - `icons/` folder (create this if missing)

#### 2. Create Extension Icons

Since we need icon files, you have two options:

**Option A: Use Placeholder Icons (Quick)**
1. Create a folder named `icons` in your Gracula directory
2. Download any 3 PNG images and rename them:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)
3. Or use online tools like [favicon.io](https://favicon.io/) to generate icons with the 🧛 emoji

**Option B: Create Custom Icons**
1. Use an image editor (Photoshop, GIMP, Canva, etc.)
2. Create 3 PNG files with the vampire emoji or custom logo:
   - 16x16 pixels → `icon16.png`
   - 48x48 pixels → `icon48.png`
   - 128x128 pixels → `icon128.png`
3. Save them in the `icons/` folder

#### 3. Load Extension in Chrome

1. **Open Chrome Extensions Page**
   ```
   Type in address bar: chrome://extensions/
   ```
   Or: Menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**
   - Look for the toggle switch in the top-right corner
   - Turn it ON (it should be blue)

3. **Load Unpacked Extension**
   - Click the "Load unpacked" button (top-left)
   - Navigate to your Gracula folder
   - Select the folder and click "Select Folder"

4. **Verify Installation**
   - You should see "Gracula - AI Reply Assistant" in your extensions list
   - The extension should be enabled (toggle is ON)
   - You should see the Gracula icon in your Chrome toolbar

#### 4. Test the Extension

1. **Open WhatsApp Web**
   - Go to [web.whatsapp.com](https://web.whatsapp.com)
   - Log in with your phone

2. **Open a Chat**
   - Click on any conversation
   - Click on the message input field at the bottom

3. **Look for Gracula Button**
   - You should see a floating purple button with 🧛 emoji
   - It appears to the right of the input field

4. **Generate a Reply**
   - Click the Gracula button
   - Select a tone (e.g., "Funny")
   - Wait for replies to generate
   - Click "Insert" to add to your message

### Troubleshooting Installation

#### Extension Not Loading
- **Error: "Manifest file is missing or unreadable"**
  - Make sure `manifest.json` is in the root folder
  - Check that the file is not corrupted
  - Verify JSON syntax is correct

- **Error: "Could not load icon"**
  - Create the `icons/` folder
  - Add the three icon files (icon16.png, icon48.png, icon128.png)
  - Or temporarily remove the icons section from manifest.json

#### Button Not Appearing
- **Refresh the page** - Press F5 or Ctrl+R
- **Check extension is enabled** - Go to chrome://extensions/
- **Check console for errors**:
  - Right-click on page → Inspect
  - Go to Console tab
  - Look for Gracula messages (they start with 🧛)

#### API Errors
- **"API Error" or "Failed to generate"**
  - This is normal for free tier (rate limits)
  - The extension will use fallback mock replies
  - For better results, add your own API key:
    1. Go to [huggingface.co](https://huggingface.co/)
    2. Sign up for free
    3. Go to Settings → Access Tokens
    4. Create a new token
    5. Click Gracula icon → Paste API key → Save

## Configuration

### Adding Hugging Face API Key (Recommended)

1. **Create Free Account**
   - Visit [huggingface.co](https://huggingface.co/)
   - Click "Sign Up"
   - Verify your email

2. **Generate API Token**
   - Go to Settings (click your profile picture)
   - Click "Access Tokens"
   - Click "New token"
   - Name it "Gracula"
   - Select "Read" permission
   - Click "Generate"
   - Copy the token (starts with `hf_`)

3. **Add to Gracula**
   - Click Gracula extension icon in Chrome toolbar
   - Paste your API key in the "Hugging Face API Key" field
   - Click "Save Settings"
   - You should see "✓ Settings saved successfully!"

### Changing AI Model

Different models have different characteristics:

- **Mistral 7B** (Default) - Best overall quality
- **Llama 2 7B** - Good alternative, similar quality
- **Flan-T5 Large** - Faster, uses less resources
- **Falcon 7B** - Good for creative responses

To change:
1. Click Gracula icon
2. Select model from dropdown
3. Click "Save Settings"

## Testing on Different Platforms

### WhatsApp Web
- URL: https://web.whatsapp.com
- Works: ✅ Fully supported
- Notes: Best tested platform

### Instagram
- URL: https://www.instagram.com/direct/inbox/
- Works: ✅ Fully supported
- Notes: Must be in DM view

### Facebook Messenger
- URL: https://www.messenger.com
- Works: ✅ Fully supported
- Notes: Works in both messenger.com and facebook.com/messages

### LinkedIn
- URL: https://www.linkedin.com/messaging/
- Works: ✅ Fully supported
- Notes: Must be in messaging view

### Twitter/X
- URL: https://twitter.com/messages or https://x.com/messages
- Works: ✅ Fully supported
- Notes: Works in DM view

### Discord
- URL: https://discord.com/channels/
- Works: ✅ Fully supported
- Notes: Works in any channel or DM

### Slack
- URL: https://app.slack.com
- Works: ✅ Fully supported
- Notes: Works in channels and DMs

### Gmail
- URL: https://mail.google.com
- Works: ✅ Fully supported
- Notes: Works when composing emails

### Telegram Web
- URL: https://web.telegram.org
- Works: ✅ Fully supported
- Notes: Works in any chat

## Advanced Configuration

### Modifying Tones

You can customize tones by editing `config.js`:

```javascript
{
  id: 'custom',
  name: 'Custom Tone',
  emoji: '🎯',
  prompt: 'Your custom prompt here...'
}
```

### Adding New Platforms

To add support for a new platform, edit `config.js`:

```javascript
newplatform: {
  name: 'New Platform',
  domain: 'newplatform.com',
  inputSelectors: [
    'div[contenteditable="true"]',  // Add selectors here
  ],
  messageSelectors: [
    'div.message-text',  // Add selectors here
  ]
}
```

### Debugging

Enable detailed logging:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for messages starting with "🧛 Gracula:"

## Performance Tips

1. **Use API Key** - Avoid rate limits
2. **Choose Faster Model** - Flan-T5 is quickest
3. **Clear Browser Cache** - If extension seems slow
4. **Disable Other Extensions** - Reduce conflicts

## Security Best Practices

1. **Never Share API Keys** - Keep them private
2. **Use Read-Only Tokens** - Don't give write permissions
3. **Review Permissions** - Extension only needs what's listed
4. **Keep Updated** - Update to latest version

## Getting Help

If you encounter issues:

1. **Check Console** - Look for error messages
2. **Refresh Page** - Often fixes temporary issues
3. **Reload Extension** - Go to chrome://extensions/ and click reload
4. **Report Issue** - Open GitHub issue with details

## Next Steps

Now that Gracula is installed:

1. ✅ Test on your favorite messaging platform
2. ✅ Try different tones
3. ✅ Add your API key for better results
4. ✅ Customize tones if needed
5. ✅ Share feedback!

---

**Enjoy using Gracula! 🧛**

*Never send a boring message again!*

