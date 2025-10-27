# Extension Context Invalidation Fix

## Issue: "Extension context invalidated"

### What Happened?
When you reload the Chrome extension while a page is still open, the connection between the content script (running on the page) and the background script (running in the extension) is broken. This causes the error:

```
Uncaught Error: Extension context invalidated.
```

This happens because:
1. Content scripts are injected into web pages
2. They communicate with the background script via `chrome.runtime.sendMessage()`
3. When you reload the extension, the background script restarts
4. Old content scripts lose their connection to the new background script
5. Any attempt to send messages fails with "Extension context invalidated"

---

## Solution Implemented

### ✅ Added Error Handling to All `chrome.runtime.sendMessage()` Calls

We now check for `chrome.runtime.lastError` after every message to detect when the extension context is invalidated.

### Files Modified:

#### 1. `src/features/voice-transcription/model/TranscriptionManager.js`

**ElevenLabs Transcription** (lines 296-330):
```javascript
try {
  chrome.runtime.sendMessage({
    action: 'transcribeAudio',
    provider: 'elevenlabs',
    audioData: base64Audio,
    mimeType: audioBlob.type,
    language: this.language
  }, (response) => {
    // Check for extension context invalidation
    if (chrome.runtime.lastError) {
      console.error('🎤 TranscriptionManager: Extension context error:', chrome.runtime.lastError);
      reject(new Error('Extension was reloaded. Please refresh the page to continue using voice input.'));
      return;
    }

    if (response && response.success) {
      resolve(response.transcript);
    } else {
      reject(new Error(response?.error || 'Transcription failed'));
    }
  });
} catch (error) {
  console.error('🎤 TranscriptionManager: Error sending message:', error);
  reject(new Error('Extension connection lost. Please refresh the page.'));
}
```

**OpenAI Transcription** (lines 342-372):
- Same error handling added for OpenAI Whisper API calls

#### 2. `src/widgets/autocomplete/model/AutocompleteManager.js`

**Load AI Config** (lines 60-82):
```javascript
try {
  chrome.runtime.sendMessage({ action: 'getApiConfig' }, (response) => {
    // Check for extension context invalidation
    if (chrome.runtime.lastError) {
      console.warn('🧛 Autocomplete: Extension context error, using offline mode:', chrome.runtime.lastError.message);
      this.useAI = false;
      return;
    }

    if (response && response.success && response.config) {
      this.useAI = response.config.useAIForAutosuggestions || false;
      console.log('🧛 Autocomplete: AI mode:', this.useAI ? 'ENABLED' : 'DISABLED (Offline)');
    }
  });
} catch (error) {
  console.warn('🧛 Autocomplete: Failed to load AI config, using offline mode:', error.message);
  this.useAI = false;
}
```

#### 3. `src/app/GraculaApp.js`

**Enhanced Error Notification** (lines 306-319):
```javascript
onError: (error) => {
  console.error('🎤 Voice Input: Error:', error);
  
  // Check if it's an extension context error
  if (error.includes('Extension was reloaded') || error.includes('Extension connection lost')) {
    this.showNotification(
      '🔄 Extension was reloaded. Please <strong>refresh this page</strong> to continue using voice input.',
      'warning'
    );
  } else {
    // Show regular error notification
    this.showNotification(error, 'error');
  }
}
```

---

## How It Works Now

### Before Fix:
1. User reloads extension
2. Content script tries to send message
3. ❌ Uncaught error: "Extension context invalidated"
4. Extension stops working
5. No user feedback

### After Fix:
1. User reloads extension
2. Content script tries to send message
3. ✅ Error is caught and handled gracefully
4. User sees notification: "🔄 Extension was reloaded. Please refresh this page to continue using voice input."
5. Autocomplete falls back to offline mode automatically

---

## User Experience

### Voice Input:
- **Before**: Silent failure, no feedback
- **After**: Clear notification asking user to refresh page

### Autocomplete:
- **Before**: Crashes with error
- **After**: Automatically falls back to offline mode, continues working

---

## Best Practices

### When Developing:
1. **Always check `chrome.runtime.lastError`** after `chrome.runtime.sendMessage()`
2. **Wrap in try-catch** to handle synchronous errors
3. **Provide user feedback** when extension context is lost
4. **Implement fallbacks** where possible (like offline mode)

### When Testing:
1. **Don't reload extension** while testing on a page
2. **If you must reload**, refresh all open pages afterward
3. **Use "Reload" button** in chrome://extensions/ instead of disabling/enabling

---

## Error Messages

### For Users:
```
🔄 Extension was reloaded. Please refresh this page to continue using voice input.
```

### In Console:
```
🎤 TranscriptionManager: Extension context error: Error: Extension context invalidated.
🧛 Autocomplete: Extension context error, using offline mode: Extension context invalidated.
```

---

## Prevention

### To Avoid This Issue:
1. **Don't reload extension** while pages are open
2. **Close all tabs** before reloading extension
3. **Use development mode** with auto-reload disabled
4. **Test in incognito** to avoid cached content scripts

### If It Happens:
1. **Refresh the page** (F5 or Ctrl+R)
2. Extension will reconnect automatically
3. All features will work again

---

## Technical Details

### Why This Happens:
- Content scripts are **injected into web pages**
- They run in the **page's context**, not the extension's
- They communicate with background script via **message passing**
- When extension reloads, **background script restarts**
- Old content scripts still reference **old background script**
- New background script doesn't know about **old content scripts**
- Result: **Connection broken**

### Chrome Extension Architecture:
```
┌─────────────────┐
│   Web Page      │
│  ┌───────────┐  │
│  │  Content  │  │ ──┐
│  │  Script   │  │   │ chrome.runtime.sendMessage()
│  └───────────┘  │   │
└─────────────────┘   │
                      ▼
              ┌───────────────┐
              │  Background   │
              │    Script     │
              └───────────────┘
```

When extension reloads:
```
┌─────────────────┐
│   Web Page      │
│  ┌───────────┐  │
│  │  Content  │  │ ──┐
│  │  Script   │  │   │ ❌ Connection broken!
│  │  (OLD)    │  │   │
│  └───────────┘  │   │
└─────────────────┘   ▼
              ┌───────────────┐
              │  Background   │
              │    Script     │
              │    (NEW)      │
              └───────────────┘
```

Solution: Refresh page to inject new content script:
```
┌─────────────────┐
│   Web Page      │
│  ┌───────────┐  │
│  │  Content  │  │ ──┐
│  │  Script   │  │   │ ✅ Connection restored!
│  │  (NEW)    │  │   │
│  └───────────┘  │   │
└─────────────────┘   ▼
              ┌───────────────┐
              │  Background   │
              │    Script     │
              │    (NEW)      │
              └───────────────┘
```

---

## Summary

✅ **Fixed**: Extension context invalidation errors
✅ **Added**: Graceful error handling
✅ **Added**: User-friendly notifications
✅ **Added**: Automatic fallback to offline mode
✅ **Improved**: Developer experience

**Result**: Extension now handles reloads gracefully and provides clear feedback to users!

