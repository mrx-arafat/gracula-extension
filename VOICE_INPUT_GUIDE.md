# 🎤 Global Voice Input Feature - User Guide

## Overview

The **Global Voice Input** feature allows you to use voice-to-text anywhere on any webpage where you need to type. Simply hold a keyboard shortcut and speak - your voice will be transcribed and inserted into the focused input field.

---

## ✨ Key Features

### 1. **Universal Compatibility**
- Works with **ANY input field** on **ANY webpage**
- Supports:
  - Standard `<input>` fields
  - `<textarea>` elements
  - ContentEditable divs (WhatsApp, Facebook, Discord, etc.)
  - Custom input components

### 2. **Push-to-Talk Activation**
- **Default Shortcut**: `Ctrl + Shift + V`
- **How it works**:
  - **Hold** the shortcut to start recording
  - **Release** to stop and transcribe
  - No clicking required!

### 3. **Visual Feedback**
- **Floating Voice Button**: Appears next to focused input fields
- **Pulse Indicator**: Shows when you're recording (center of screen)
- **Status Notifications**: Real-time feedback on recording/transcription
- **Audio Level Visualization**: Pulse grows with your voice volume

### 4. **Smart Integration**
- Automatically detects when you focus on an input field
- Button follows the focused input
- Works seamlessly with React, Vue, Angular, and vanilla JS apps

---

## 📖 How to Use

### Basic Usage

1. **Focus on any input field** (click inside it)
2. **Hold** `Ctrl + Shift + V` on your keyboard
3. **Speak clearly** into your microphone
4. **Release** the keys when done
5. Your speech will be transcribed and inserted automatically! ✨

### Button Usage (Alternative)

1. Focus on any input field
2. Click the **floating microphone button** that appears
3. Speak while the button is red (recording)
4. Click again to stop, or let it auto-stop after silence

---

## 🎯 Use Cases

### Perfect For:

- **Quick Messaging**: Type messages in WhatsApp, Telegram, Discord
- **Email Composition**: Gmail, Outlook, any email client
- **Social Media**: Facebook, Twitter, LinkedIn posts/comments
- **Form Filling**: Long text inputs, feedback forms
- **Note Taking**: Google Docs, Notion, Evernote
- **Search Bars**: Google, YouTube, any website search
- **Chat Applications**: Customer support, live chat widgets

### Anywhere You Can Type!

The voice input works on:
- ✅ WhatsApp Web
- ✅ Telegram Web
- ✅ Discord
- ✅ Facebook/Messenger
- ✅ Gmail
- ✅ Twitter/X
- ✅ LinkedIn
- ✅ Slack
- ✅ Google Docs
- ✅ Notion
- ✅ And literally **ANY website with text input**!

---

## ⚙️ Configuration

### Keyboard Shortcut

You can customize the keyboard shortcut in the extension settings:

1. Click the **Gracula extension icon**
2. Go to **Settings**
3. Change **Voice Shortcut** to your preferred combination
4. Common alternatives:
   - `Ctrl + Shift + V` (default)
   - `Alt + V`
   - `Ctrl + M`
   - `Ctrl + Shift + Space`

### Voice Provider

Choose your transcription provider:

1. **Web Speech API** (default, free, no API key needed)
   - Uses browser's built-in speech recognition
   - Works offline
   - Good accuracy for most languages

2. **OpenAI Whisper** (requires API key)
   - Very high accuracy
   - Supports 50+ languages
   - Cloud-based

3. **ElevenLabs** (requires API key)
   - Excellent accuracy
   - Fast transcription
   - Cloud-based

### Language Selection

- Set your preferred language in settings
- Supports English, Spanish, French, German, and many more
- The extension will transcribe in the selected language

---

## 💡 Tips & Best Practices

### For Best Results:

1. **Speak Clearly**: Enunciate your words
2. **Reduce Background Noise**: Find a quiet environment
3. **Hold Steady**: Keep holding the shortcut while speaking
4. **Short Bursts**: Use for sentences or short paragraphs
5. **Check Microphone**: Ensure your mic is working and has permissions

### Troubleshooting:

**Voice input not working?**
- Check microphone permissions in your browser
- Ensure the input field is focused (click inside it)
- Try refreshing the page
- Check if voice input is enabled in settings

**Button not appearing?**
- Make sure you clicked inside an input field
- Some websites may have custom input fields - try the keyboard shortcut instead
- Check browser console for errors

**Transcription inaccurate?**
- Speak more slowly and clearly
- Reduce background noise
- Try switching voice provider in settings
- Ensure correct language is selected

---

## 🔐 Privacy & Security

- **Local Processing**: Web Speech API processes speech locally (no data sent to servers)
- **Secure**: No recording is stored permanently
- **Permissions**: Only requests microphone access when you activate voice input
- **Your Control**: Can be disabled anytime in settings

---

## 🎨 Visual Elements

### Components You'll See:

1. **Floating Voice Button** 🎤
   - Purple gradient circular button
   - Appears next to focused input
   - Changes to red when recording

2. **Pulse Indicator** 💫
   - Large circle in center of screen
   - Only visible during recording
   - Pulses with your voice volume

3. **Status Toast** 📊
   - Top-center notification
   - Shows recording status
   - Displays transcribed text preview

---

## 🚀 Advanced Features

### Auto-Stop on Silence
- Automatically stops recording after 2 seconds of silence
- No need to manually stop every time
- Configurable in settings

### Multi-Language Support
- Seamlessly switch between languages
- Auto-detects language mix in some providers
- Perfect for multilingual users

### React/Vue/Angular Compatibility
- Uses native DOM events for maximum compatibility
- Works with virtual DOM frameworks
- Triggers proper change events for form validation

---

## 📝 Keyboard Shortcuts Summary

| Action | Shortcut | Description |
|--------|----------|-------------|
| Start Recording | Hold `Ctrl+Shift+V` | Begins voice transcription |
| Stop Recording | Release keys | Stops and inserts transcribed text |
| Toggle Button | Click mic button | Alternative to keyboard shortcut |

---

## 🆘 Support

If you encounter any issues:

1. Check this guide for troubleshooting tips
2. Refresh the page and try again
3. Check browser console for error messages
4. Report issues on GitHub: [gracula-extension/issues](https://github.com/yourusername/gracula-extension/issues)

---

## 🎉 Enjoy Your Global Voice Input!

Now you can type anywhere, anytime, just by speaking! No more tedious typing - let your voice do the work! 🚀

**Pro Tip**: Practice using the hold-to-speak pattern - it becomes second nature after a few tries!

---

*Made with ❤️ by the Gracula Team*
