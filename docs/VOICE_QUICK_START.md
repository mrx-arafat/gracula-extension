# 🎤 Voice Integration Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Load the Extension

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `gracula-extension/src` folder
6. Extension should now appear in your extensions list

### Step 2: Configure Voice Settings

1. Click the Gracula extension icon in Chrome toolbar
2. Navigate to the "Voice Settings" section
3. Choose your preferred voice provider:
   - **Web Speech API** (Free, no setup required) ✅ Recommended for testing
   - **ElevenLabs** (Already configured with API key)
   - **OpenAI Whisper** (Requires API key)
   - **Google Speech-to-Text** (Requires API key)
   - **Deepgram** (Requires API key)
4. Select your language (default: English)
5. Toggle "Enable Voice Input" to ON
6. Click "Save Voice Settings"

### Step 3: Test Voice Input

1. Navigate to **web.whatsapp.com** (or Discord/Slack)
2. Open any chat conversation
3. Click in the message input field
4. You should see a **purple microphone button** appear near the input
5. Click the button OR press **Ctrl+Shift+V**
6. A **recording indicator** will appear in the top-right corner
7. **Speak clearly** into your microphone
8. The recording will **auto-stop** after 2 seconds of silence
9. Your transcribed text will be **automatically inserted** into the input field

---

## 🎯 Quick Test Scenarios

### Test 1: Basic Voice Input (Web Speech API)

**Setup:**
- Provider: Web Speech API (Free)
- Language: English
- Platform: WhatsApp Web

**Steps:**
1. Open WhatsApp Web
2. Open any chat
3. Press `Ctrl+Shift+V`
4. Say: "Hello, this is a test message"
5. Wait for auto-stop
6. Verify text appears in input field

**Expected Result:** ✅ "Hello, this is a test message" appears in input

---

### Test 2: Multi-Language Support

**Setup:**
- Provider: Web Speech API
- Language: Spanish
- Platform: Discord

**Steps:**
1. Change language to Spanish in settings
2. Open Discord
3. Open any channel
4. Press `Ctrl+Shift+V`
5. Say: "Hola, ¿cómo estás?"
6. Wait for auto-stop

**Expected Result:** ✅ Spanish text appears correctly

---

### Test 3: ElevenLabs High-Quality Transcription

**Setup:**
- Provider: ElevenLabs (API key pre-configured)
- Language: English
- Platform: Slack

**Steps:**
1. Select ElevenLabs in settings
2. Open Slack workspace
3. Open any channel
4. Click microphone button
5. Say a longer sentence with complex words
6. Wait for transcription

**Expected Result:** ✅ High-quality transcription with proper punctuation

---

## 🎨 UI Features to Verify

### Voice Button
- ✅ Appears near input field
- ✅ Purple gradient background
- ✅ Hover effect (lifts up)
- ✅ Changes to red when recording
- ✅ Pulsing animation during recording
- ✅ Tooltip shows "Voice Input (Ctrl+Shift+V)"

### Recording Indicator
- ✅ Appears in top-right corner
- ✅ Shows real-time timer (0:00, 0:01, etc.)
- ✅ Animated waveform (5 bars)
- ✅ Status messages ("Listening...", "Transcribing...")
- ✅ Cancel button with ESC hint
- ✅ Pulsing red dot

---

## 🔧 Troubleshooting

### Issue: Microphone button doesn't appear

**Solution:**
1. Check if voice input is enabled in settings
2. Verify you're on a supported platform (WhatsApp, Discord, Slack)
3. Check browser console for errors (F12)
4. Reload the page

### Issue: "Microphone permission denied"

**Solution:**
1. Click the camera/microphone icon in Chrome address bar
2. Allow microphone access
3. Reload the page
4. Try again

### Issue: No transcription appears

**Solution:**
1. Check your internet connection (required for all providers)
2. Verify API key is correct (for cloud providers)
3. Check browser console for error messages
4. Try switching to Web Speech API (free, no key required)

### Issue: Wrong language detected

**Solution:**
1. Open extension settings
2. Select correct language from dropdown
3. Save settings
4. Try again

### Issue: Recording doesn't stop

**Solution:**
1. Press ESC to cancel
2. Click the cancel button in recording indicator
3. Check if VAD is working (speak, then stay silent for 2 seconds)

---

## 🎯 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+V` | Start voice input |
| `ESC` | Cancel recording |

---

## 📊 Provider Comparison

| Provider | Quality | Speed | Cost | Setup |
|----------|---------|-------|------|-------|
| Web Speech API | Good | Fast | Free | None |
| ElevenLabs | Excellent | Medium | Paid | Pre-configured |
| OpenAI Whisper | Excellent | Medium | Paid | API key required |
| Google Speech-to-Text | Excellent | Fast | Paid | API key required |
| Deepgram | Excellent | Very Fast | Paid | API key required |

**Recommendation for Testing:** Start with **Web Speech API** (free, no setup)

**Recommendation for Production:** Use **ElevenLabs** or **OpenAI Whisper** for best quality

---

## 🌍 Supported Languages

| Language | Code | Provider Support |
|----------|------|------------------|
| English | en | All providers |
| Spanish | es | All providers |
| French | fr | All providers |
| German | de | All providers |
| Italian | it | All providers |
| Portuguese | pt | All providers |
| Chinese | zh | All providers |
| Japanese | ja | All providers |
| Korean | ko | All providers |
| Arabic | ar | Most providers |
| Hindi | hi | Most providers |
| Bengali | bn | Most providers |

---

## 🎓 Tips for Best Results

### 1. Microphone Quality
- Use a good quality microphone
- Reduce background noise
- Speak clearly and at normal pace

### 2. Internet Connection
- All providers require internet
- Faster connection = faster transcription
- Check connection if experiencing delays

### 3. Language Selection
- Select correct language in settings
- Don't mix languages in single recording
- Some providers auto-detect language

### 4. Recording Duration
- Keep recordings under 30 seconds
- Pause between sentences for better accuracy
- Auto-stop triggers after 2 seconds of silence

### 5. Provider Selection
- Web Speech API: Fast, free, good for testing
- ElevenLabs: Best for production, high quality
- OpenAI Whisper: Best accuracy, supports 99+ languages
- Google/Deepgram: Enterprise-grade, very reliable

---

## 📝 Testing Checklist

- [ ] Extension loaded successfully
- [ ] Voice settings configured
- [ ] Microphone permission granted
- [ ] Voice button appears on WhatsApp Web
- [ ] Ctrl+Shift+V activates recording
- [ ] Recording indicator shows
- [ ] Audio waveform animates
- [ ] Auto-stop works after silence
- [ ] Transcript inserted into input field
- [ ] Tested on Discord
- [ ] Tested on Slack
- [ ] Tested different languages
- [ ] Tested different providers
- [ ] Error handling works (denied permission, no internet)

---

## 🎉 Success Criteria

Your voice integration is working correctly if:

✅ Microphone button appears near input fields
✅ Ctrl+Shift+V activates voice input
✅ Recording indicator shows with timer and waveform
✅ Voice is transcribed accurately
✅ Text is automatically inserted into input field
✅ Auto-stop works after silence
✅ Works on WhatsApp, Discord, and Slack
✅ Multiple languages supported
✅ Error messages displayed when issues occur

---

## 🆘 Need Help?

If you encounter issues:

1. Check browser console (F12) for error messages
2. Verify all settings are correct
3. Try reloading the extension
4. Test with Web Speech API first (simplest setup)
5. Check the verification document: `docs/VOICE_INTEGRATION_VERIFICATION.md`

---

## 🚀 Ready to Test!

You're all set! Start with **Test 1** above and work through the scenarios. The voice integration should work seamlessly across all supported platforms.

**Happy Testing! 🎤**

