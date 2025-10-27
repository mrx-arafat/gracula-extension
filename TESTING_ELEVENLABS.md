# Testing ElevenLabs Voice Transcription

## Quick Test Steps

### 1. Reload the Extension
Since we modified the code, you need to reload the extension:
1. Go to `chrome://extensions/`
2. Find "Gracula" extension
3. Click the **reload** icon (circular arrow)
4. ✅ Extension reloaded with fixes

### 2. Enable ElevenLabs
1. Click the Gracula extension icon in toolbar
2. Go to "Voice Input Settings" tab
3. Change "Voice Provider" to **"ElevenLabs"**
4. Click "Save Voice Settings"
5. You should see: "✓ Voice settings saved and applied in real-time! No reload needed."

### 3. Test on WhatsApp Web
1. Open https://web.whatsapp.com
2. Open any chat
3. Click in the message input field
4. You should see the **microphone button** appear (purple gradient button)
5. Click the microphone button (or press Ctrl+Shift+V)
6. Speak clearly: "Hello, how are you? What are you doing today?"
7. Stop recording (click button again or wait for auto-stop)
8. ✅ Should transcribe with punctuation: "Hello, how are you? What are you doing today?"

## Expected Results

### ✅ Success Indicators:
- Microphone button appears in input field
- Button turns red when recording
- Recording indicator shows at top of page
- Transcription appears with proper punctuation
- Text is automatically inserted into input field

### Console Logs to Check:
Open browser console (F12) and look for:
```
🎤 Calling ElevenLabs API...
   MIME type: audio/webm;codecs=opus
   Language: en
   Audio blob size: XXXXX bytes
   Sending to: https://api.elevenlabs.io/v1/speech-to-text
   Response status: 200
✅ ElevenLabs transcription complete: [your text with punctuation]
```

## Troubleshooting

### Error: "Must provide either file or cloud_storage_url parameter"
**Status**: ✅ FIXED in latest code
**Cause**: FormData parameter name was wrong (`audio` instead of `file`)
**Solution**: Already fixed - reload extension

### Error: "invalid_model_id - 'eleven_multilingual_v2' is not a valid model_id"
**Status**: ✅ FIXED in latest code
**Cause**: ElevenLabs changed their model IDs. Valid models are now `scribe_v1` and `scribe_v1_experimental`
**Solution**: Already fixed - updated to use `scribe_v1` - reload extension

### Error: "ElevenLabs API key not configured"
**Check**: 
1. Open extension popup
2. Go to Voice Settings
3. Verify API key field shows: `sk_17f927bfb2297bf127c442949b9b16ab964c7b916c6cd56a`
4. If empty, the key should be auto-loaded from background.js

### Error: "Failed to start voice input"
**Solutions**:
1. Grant microphone permissions when prompted
2. Check microphone is working in system settings
3. Try refreshing the page
4. Check browser console for detailed error

### No punctuation in transcription
**Check**:
1. Verify "ElevenLabs" is selected (not "Web Speech API")
2. Check console logs show "Calling ElevenLabs API"
3. If it says "Web Speech", settings didn't apply - try saving again

### Button not appearing
**Solutions**:
1. Make sure "Enable Voice Input" toggle is ON
2. Click in the message input field
3. Wait 2-3 seconds for button to appear
4. Try refreshing the page

## Detailed Test Cases

### Test Case 1: Basic Transcription
**Input**: "hello how are you"
**Expected**: "Hello, how are you?"
**Provider**: ElevenLabs

### Test Case 2: Multiple Sentences
**Input**: "I need to go to the store can you come with me"
**Expected**: "I need to go to the store. Can you come with me?"
**Provider**: ElevenLabs

### Test Case 3: Questions
**Input**: "what time is it where are you"
**Expected**: "What time is it? Where are you?"
**Provider**: ElevenLabs

### Test Case 4: Long Message
**Input**: "I wanted to let you know that I'll be late today because of traffic I should be there around ten thirty sorry for the inconvenience"
**Expected**: "I wanted to let you know that I'll be late today because of traffic. I should be there around 10:30. Sorry for the inconvenience."
**Provider**: ElevenLabs

### Test Case 5: Real-Time Settings Update
**Steps**:
1. Start with Web Speech API
2. Test voice input (no punctuation)
3. Switch to ElevenLabs in popup
4. Test voice input again (with punctuation)
5. **No page reload needed!**

## Comparison Test

### Test with Web Speech API:
1. Set provider to "Web Speech API"
2. Say: "hello how are you what are you doing"
3. Result: "hello how are you what are you doing" ❌

### Test with ElevenLabs:
1. Set provider to "ElevenLabs"
2. Say: "hello how are you what are you doing"
3. Result: "Hello, how are you? What are you doing?" ✅

## API Request Details

### What Gets Sent to ElevenLabs:
```javascript
POST https://api.elevenlabs.io/v1/speech-to-text
Headers:
  xi-api-key: sk_17f927bfb2297bf127c442949b9b16ab964c7b916c6cd56a
  Content-Type: multipart/form-data

Body (FormData):
  file: [audio blob] (recording.webm)
  model_id: scribe_v1
  language: en
```

### Expected Response:
```json
{
  "language_code": "en",
  "language_probability": 0.98,
  "text": "Hello, how are you? What are you doing?",
  "words": [...]
}
```

## Performance Metrics

### Web Speech API:
- **Latency**: ~100ms (instant)
- **Accuracy**: Good
- **Punctuation**: None
- **Cost**: Free

### ElevenLabs:
- **Latency**: ~1-2 seconds (API call)
- **Accuracy**: Excellent
- **Punctuation**: Automatic
- **Cost**: Paid (API key provided)

## Debug Checklist

If ElevenLabs is not working, check:

- [ ] Extension reloaded after code changes
- [ ] "ElevenLabs" selected in Voice Provider dropdown
- [ ] Settings saved (green success message shown)
- [ ] Microphone permissions granted
- [ ] Internet connection active
- [ ] Browser console shows no errors
- [ ] API key is correct in background.js
- [ ] Audio is being recorded (check console logs)
- [ ] FormData contains 'file' parameter (not 'audio')

## Success Criteria

✅ **All tests pass when**:
1. ElevenLabs API returns 200 status
2. Transcription includes punctuation
3. Text is properly capitalized
4. Settings apply without page reload
5. No console errors
6. Transcription is accurate

## Next Steps After Testing

Once ElevenLabs is working:
1. Test with different languages
2. Try longer recordings
3. Test real-time settings switching
4. Experiment with different speaking styles
5. Compare accuracy with Web Speech API

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify API key is valid
3. Test with Web Speech API first (to isolate issue)
4. Check network tab for API request/response
5. Share console logs for debugging

---

**Remember**: The key fix was changing `formData.append('audio', ...)` to `formData.append('file', ...)` in the ElevenLabs API call!

