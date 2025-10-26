# 🎤 Voice Input Troubleshooting Guide

## Issue: Voice button not appearing

### Quick Fixes:

1. **Check if voice input is enabled:**
   - Click the Gracula extension icon
   - Scroll to "Voice Settings"
   - Make sure "Enable Voice Input" toggle is ON
   - Click "Save Voice Settings"

2. **Reload the page:**
   - Press `Ctrl+R` or `F5` to reload
   - Wait 3-5 seconds for extension to initialize
   - Check if purple Gracula button appears
   - Voice button should appear near the input field

3. **Check browser console:**
   - Press `F12` to open DevTools
   - Go to "Console" tab
   - Look for these messages:
     ```
     ✅ VoiceInputManager: Config loaded
     ✅ VoiceInputManager: Started (Ctrl+Shift+V to activate)
     ✅ VoiceButton: Created
     ```
   - If you see errors, note them down

4. **Verify extension is loaded:**
   - Go to `chrome://extensions/`
   - Find "Gracula AI Assistant"
   - Make sure it's enabled
   - Click "Reload" button if needed

---

## Issue: Ctrl+Shift+V not working

### Solutions:

1. **Make sure input field is focused:**
   - Click inside the message input field
   - You should see a cursor blinking
   - Then press `Ctrl+Shift+V`

2. **Check for keyboard shortcut conflicts:**
   - Some apps override this shortcut
   - Try clicking the microphone button instead
   - Or change the shortcut in extension settings (future feature)

3. **Verify voice input is enabled:**
   - Open extension popup
   - Check "Enable Voice Input" is ON
   - Save settings and reload page

---

## Issue: Microphone permission denied

### Fix:

1. **Grant microphone permission:**
   - Look for camera/microphone icon in Chrome address bar
   - Click it
   - Select "Always allow web.whatsapp.com to access your microphone"
   - Click "Done"
   - Reload the page

2. **Check system permissions:**
   - Windows: Settings → Privacy → Microphone → Allow apps to access microphone
   - Mac: System Preferences → Security & Privacy → Microphone → Allow Chrome

---

## Issue: No transcription appears

### Troubleshooting:

1. **Check internet connection:**
   - All providers require internet
   - Test your connection
   - Try again

2. **Verify API key (if using cloud provider):**
   - Open extension popup
   - Check API key is entered correctly
   - Try switching to "Web Speech API" (no key required)

3. **Check microphone is working:**
   - Test microphone in another app
   - Speak clearly and loudly
   - Reduce background noise

4. **Look for errors in console:**
   - Press `F12`
   - Check Console tab for error messages
   - Common errors:
     - "API key invalid" → Check your API key
     - "Network error" → Check internet connection
     - "No speech detected" → Speak louder or closer to mic

---

## Debug Mode

### Enable detailed logging:

1. Open browser console (`F12`)
2. Type: `localStorage.setItem('graculaDebug', 'true')`
3. Reload the page
4. Try voice input again
5. Check console for detailed logs

### What to look for:

```
🎤 VoiceInputManager: Initialized
✅ VoiceInputManager: Config loaded {voiceInputEnabled: true, voiceProvider: "webspeech", ...}
✅ VoiceInputManager: Started (Ctrl+Shift+V to activate)
✅ VoiceButton: Created
🎤 VoiceInputManager: Transcription started
✅ VoiceInputManager: Transcription complete: "your text here"
```

---

## Still Not Working?

### Manual Test:

1. Open `test/voice-integration-test.html` in Chrome
2. Click "Test Voice Input" button
3. Check if components load correctly
4. This will help identify if it's a platform-specific issue

### Report the Issue:

If nothing works, please provide:
- Browser version (chrome://version/)
- Extension version
- Platform (WhatsApp/Discord/Slack)
- Console errors (screenshot)
- Steps you tried

---

## Quick Reference

| Problem | Solution |
|---------|----------|
| No voice button | Enable in settings, reload page |
| Ctrl+Shift+V not working | Click input field first, or use button |
| Permission denied | Grant mic permission in browser |
| No transcription | Check internet, API key, microphone |
| Button appears but nothing happens | Check console for errors |

---

## Expected Behavior

When working correctly:

1. ✅ Purple Gracula button appears (main button)
2. ✅ Microphone button appears near input field
3. ✅ Pressing Ctrl+Shift+V starts recording
4. ✅ Recording indicator appears in top-right
5. ✅ Timer counts up (0:01, 0:02, etc.)
6. ✅ Waveform animates
7. ✅ Auto-stops after 2 seconds of silence
8. ✅ Transcript appears in input field

---

## Contact

If you need help, check:
- `docs/VOICE_QUICK_START.md` - Setup guide
- `docs/VOICE_INTEGRATION_VERIFICATION.md` - Technical details
- Browser console for error messages

