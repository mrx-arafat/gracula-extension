# Grammar Checker Debugging Guide

If the grammar checker modal is blank, follow these steps to debug:

## Step 1: Check Browser Console

1. Open WhatsApp Web (or any supported platform)
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Type some text with errors: "I loves her"
5. Press **Ctrl+G** (or click the ✍️ button)
6. Look for these console messages:

### Expected Console Output:

```
✍️ [GRACULA APP] Starting grammar check...
📝 Text to analyze: I loves her
🔄 Sending text to analyzer...
✍️ Gracula Background: Analyzing grammar for text length: 11
   Text: I loves her
📝 Grammar prompt built, length: XXX
🔄 Calling AI API for grammar analysis...
📥 AI API response received: {...}
🔍 Parsing grammar response...
✅ Parsed corrections: [...]
📊 Final result: {...}
✅ Analysis successful, showing results
```

### If you see errors, check:

1. **"No API key" error**: You need to configure an API key
   - Go to extension settings
   - Add your OpenAI, Google, or OpenRouter API key

2. **"Failed to parse" error**: The AI response format is wrong
   - Check the console for the full AI response
   - The response should be valid JSON with corrections array

3. **"Network error"**: API request failed
   - Check your internet connection
   - Verify the API key is correct
   - Check if you have API credits

## Step 2: Test API Manually

In the browser console, run this command:

```javascript
// Test grammar API
chrome.runtime.sendMessage({
  action: 'analyzeGrammar',
  text: 'I loves her',
  options: {
    checkGrammar: true,
    checkSpelling: true,
    checkStyle: true,
    checkPunctuation: true,
    language: 'en-US'
  }
}, (response) => {
  console.log('Grammar API Response:', response);
});
```

### Expected Response:

```javascript
{
  success: true,
  originalText: "I loves her",
  corrections: [
    {
      type: "grammar",
      offset: 2,
      length: 5,
      original: "loves",
      replacement: "love",
      explanation: "Subject-verb agreement"
    }
  ],
  correctedText: "I love her",
  summary: "Found 1 issue: 1 grammar"
}
```

## Step 3: Check API Configuration

In the console, check your API settings:

```javascript
chrome.runtime.sendMessage({action: 'getApiConfig'}, (response) => {
  console.log('API Config:', response.config);
});
```

Make sure:
- `provider` is set (openai, google, openrouter)
- `apiKey` exists and is not empty
- `model` is set

## Step 4: Common Issues & Fixes

### Issue: Modal is blank

**Cause**: AI returned invalid JSON or no corrections array

**Fix**:
1. Check console for parsing errors
2. Try a different AI provider
3. Check if your API key has credits

### Issue: "No text to analyze"

**Cause**: Text extraction failed from input field

**Fix**:
1. Make sure you clicked in the text field
2. Try typing in a different field
3. Refresh the page and try again

### Issue: API timeout

**Cause**: AI taking too long to respond

**Fix**:
1. Try shorter text
2. Check your internet connection
3. Try a different AI provider

## Step 5: Enable Detailed Logging

For maximum debugging, check ALL console messages. The grammar checker now has extensive logging at every step.

## Need Help?

If none of these steps work:

1. Copy ALL console output
2. Note which AI provider you're using
3. Check if the extension works for other features (reply generation)
4. Create a GitHub issue with the details

## Quick Test Command

Paste this in console for a complete test:

```javascript
(async function testGrammar() {
  console.log('🧪 Testing Grammar Checker...');

  // Test 1: Check if GrammarChecker class exists
  if (typeof GrammarChecker === 'undefined') {
    console.error('❌ GrammarChecker class not loaded');
    return;
  }
  console.log('✅ GrammarChecker class loaded');

  // Test 2: Check API config
  chrome.runtime.sendMessage({action: 'getApiConfig'}, (config) => {
    console.log('✅ API Config:', config);

    // Test 3: Send test request
    chrome.runtime.sendMessage({
      action: 'analyzeGrammar',
      text: 'I loves her',
      options: {}
    }, (response) => {
      if (response.success) {
        console.log('✅ Grammar check successful!');
        console.log('   Corrections:', response.corrections);
        console.log('   Corrected text:', response.correctedText);
      } else {
        console.error('❌ Grammar check failed:', response.error);
      }
    });
  });
})();
```
