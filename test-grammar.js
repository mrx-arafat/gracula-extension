/**
 * Grammar Checker Test Script
 *
 * HOW TO USE:
 * 1. Open WhatsApp Web (or any page)
 * 2. Press F12 to open console
 * 3. Copy and paste this entire file into console
 * 4. Run: testGrammarChecker()
 *
 * This will test the entire grammar checking flow
 */

async function testGrammarChecker() {
    console.clear();
    console.log('🧪 ========================================');
    console.log('🧪 GRAMMAR CHECKER COMPREHENSIVE TEST');
    console.log('🧪 ========================================\n');

    // Test 1: Check if extension is loaded
    console.log('📦 TEST 1: Checking if extension classes are loaded...');
    if (typeof GrammarChecker === 'undefined') {
        console.error('❌ FAIL: GrammarChecker class not found!');
        console.log('   → Extension may not be loaded on this page');
        console.log('   → Try refreshing the page');
        return;
    }
    console.log('✅ PASS: GrammarChecker class found\n');

    // Test 2: Check API configuration
    console.log('⚙️ TEST 2: Checking API configuration...');
    const config = await new Promise((resolve) => {
        chrome.runtime.sendMessage({action: 'getApiConfig'}, resolve);
    });

    if (!config || !config.config) {
        console.error('❌ FAIL: Could not get API config');
        return;
    }

    const apiConfig = config.config;
    console.log('   Provider:', apiConfig.provider);
    console.log('   Model:', apiConfig.model || apiConfig.googleModel || apiConfig.openrouterModel);
    console.log('   Has API Key:', !!apiConfig.apiKey);
    console.log('   API Key length:', apiConfig.apiKey?.length || 0);

    if (!apiConfig.apiKey) {
        console.error('❌ FAIL: No API key configured!');
        console.log('   → Go to extension settings and add your API key');
        console.log('   → Click extension icon → Settings → Add API key');
        return;
    }
    console.log('✅ PASS: API key is configured\n');

    // Test 3: Test grammar analysis with background script directly
    console.log('🔍 TEST 3: Testing grammar analysis API call...');
    console.log('   Analyzing: "i loves her"');

    try {
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'analyzeGrammar',
                text: 'i loves her',
                options: {
                    checkGrammar: true,
                    checkSpelling: true,
                    checkStyle: true,
                    checkPunctuation: true,
                    language: 'en-US'
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });

        console.log('📥 Response received:', response);

        if (!response) {
            console.error('❌ FAIL: No response received');
            console.log('   → Check service worker console for errors');
            return;
        }

        if (!response.success) {
            console.error('❌ FAIL: Analysis failed');
            console.log('   Error:', response.error);
            return;
        }

        console.log('✅ PASS: Analysis succeeded');
        console.log('   Original text:', response.originalText);
        console.log('   Corrections found:', response.corrections?.length || 0);
        console.log('   Corrected text:', response.correctedText);

        if (response.corrections && response.corrections.length > 0) {
            console.log('\n📝 Corrections:');
            response.corrections.forEach((c, i) => {
                console.log(`   ${i + 1}. [${c.type}] "${c.original}" → "${c.replacement}"`);
                console.log(`      ${c.explanation}`);
            });
        } else {
            console.warn('⚠️ WARNING: No corrections found!');
            console.log('   This might indicate an issue with the AI prompt or response parsing');
        }

        console.log('\n✅ PASS: Grammar analysis completed\n');

    } catch (error) {
        console.error('❌ FAIL: Error during analysis');
        console.error('   Error:', error);
        return;
    }

    // Test 4: Check service worker console
    console.log('🔍 TEST 4: Service Worker Console Check');
    console.log('   → Open chrome://extensions/');
    console.log('   → Find "Gracula" extension');
    console.log('   → Click "service worker" link');
    console.log('   → Look for error messages or API responses\n');

    // Test 5: Manual test instructions
    console.log('🎯 TEST 5: Manual Test Instructions');
    console.log('   1. Type some text with errors: "i loves her"');
    console.log('   2. Press Ctrl+G (or Cmd+G on Mac)');
    console.log('   3. Check if modal opens');
    console.log('   4. Check for corrections or error messages\n');

    console.log('🧪 ========================================');
    console.log('🧪 TEST COMPLETE');
    console.log('🧪 ========================================\n');
}

// Run test automatically
console.log('📝 Grammar Checker Test Loaded!');
console.log('   Run: testGrammarChecker()');
