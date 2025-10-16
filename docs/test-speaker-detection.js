// WhatsApp Speaker Detection Test Script
// Run this in the browser console on web.whatsapp.com after opening a chat

console.log('🧛 Starting Speaker Detection Test...');

// Test 1: Find all message containers
console.log('\n📦 TEST 1: Finding Message Containers');
const messageContainers = document.querySelectorAll('div[data-id^="true_"]');
console.log(`Found ${messageContainers.length} message containers with data-id`);

if (messageContainers.length === 0) {
  console.warn('⚠️ No messages found. Make sure you have a chat open with message history.');
} else {
  // Analyze first 5 messages
  const samplesToAnalyze = Math.min(5, messageContainers.length);
  console.log(`\n🔍 Analyzing first ${samplesToAnalyze} messages:\n`);
  
  for (let i = 0; i < samplesToAnalyze; i++) {
    const msg = messageContainers[i];
    const text = msg.querySelector('span.selectable-text.copyable-text')?.textContent?.substring(0, 50) || 'N/A';
    
    console.log(`\n--- Message ${i + 1} ---`);
    console.log(`Text: "${text}"`);
    
    // Check for check marks (outgoing indicator)
    const hasCheckMark = msg.querySelector('span[data-icon="msg-check"], span[data-icon="msg-dblcheck"]');
    console.log(`✓ Has check mark: ${!!hasCheckMark} ${hasCheckMark ? '(OUTGOING)' : ''}`);
    
    // Check for tail classes
    const hasTailOut = msg.querySelector('.tail-out') || msg.classList.contains('tail-out');
    const hasTailIn = msg.querySelector('.tail-in') || msg.classList.contains('tail-in');
    console.log(`✓ Has tail-out: ${hasTailOut} ${hasTailOut ? '(OUTGOING)' : ''}`);
    console.log(`✓ Has tail-in: ${hasTailIn} ${hasTailIn ? '(INCOMING)' : ''}`);
    
    // Check flexbox alignment
    const computedStyle = window.getComputedStyle(msg);
    const justifyContent = computedStyle.justifyContent;
    console.log(`✓ Justify-content: ${justifyContent} ${justifyContent === 'flex-end' ? '(OUTGOING)' : justifyContent === 'flex-start' ? '(INCOMING)' : ''}`);
    
    // Check data-pre-plain-text
    const prePlainText = msg.getAttribute('data-pre-plain-text');
    console.log(`✓ data-pre-plain-text: ${prePlainText || 'N/A'}`);
    
    // Check message-in/message-out classes
    const hasMessageIn = msg.classList.contains('message-in') || msg.querySelector('.message-in');
    const hasMessageOut = msg.classList.contains('message-out') || msg.querySelector('.message-out');
    console.log(`✓ Has message-in class: ${!!hasMessageIn}`);
    console.log(`✓ Has message-out class: ${!!hasMessageOut}`);
    
    // Final determination
    let determination = 'UNKNOWN';
    if (hasCheckMark || hasTailOut || justifyContent === 'flex-end') {
      determination = '🟢 OUTGOING (You)';
    } else if (hasTailIn || justifyContent === 'flex-start') {
      determination = '🔵 INCOMING (Other)';
    }
    console.log(`\n➡️ DETERMINATION: ${determination}`);
  }
}

// Test 2: Check if Gracula is loaded
console.log('\n\n🧛 TEST 2: Checking Gracula Extension');
if (window.Gracula) {
  console.log('✅ Gracula is loaded');
  console.log('Platform:', window.Gracula.platform?.name || 'Not detected');
  
  if (window.Gracula.platform?.speakerSelectors) {
    console.log('\nSpeaker Selectors:');
    console.log('- messageContainer:', window.Gracula.platform.speakerSelectors.messageContainer);
    console.log('- outgoingMessage:', window.Gracula.platform.speakerSelectors.outgoingMessage);
    console.log('- incomingMessage:', window.Gracula.platform.speakerSelectors.incomingMessage);
  }
} else {
  console.warn('⚠️ Gracula extension not loaded. Make sure the extension is installed and enabled.');
}

// Test 3: Test the actual speaker detection
console.log('\n\n🧛 TEST 3: Testing Gracula Speaker Detection');
if (window.Gracula && window.Gracula.SpeakerDetector && window.Gracula.platform) {
  const detector = new window.Gracula.SpeakerDetector(window.Gracula.platform);
  
  const samplesToTest = Math.min(5, messageContainers.length);
  console.log(`Testing speaker detection on ${samplesToTest} messages:\n`);
  
  for (let i = 0; i < samplesToTest; i++) {
    const msg = messageContainers[i];
    const text = msg.querySelector('span.selectable-text.copyable-text')?.textContent?.substring(0, 50) || 'N/A';
    
    console.log(`\n--- Message ${i + 1}: "${text}" ---`);
    const result = detector.detectSpeaker(msg);
    console.log(`Speaker: ${result.speaker}`);
    console.log(`Is Outgoing: ${result.isOutgoing}`);
    console.log(`Strategy: ${result.meta?.strategy || 'N/A'}`);
    console.log(`Timestamp: ${result.timestamp || 'N/A'}`);
  }
} else {
  console.warn('⚠️ Cannot test speaker detection. Gracula components not available.');
}

// Test 4: Check input field detection
console.log('\n\n🧛 TEST 4: Testing Input Field Detection');
const inputSelectors = [
  'footer div[contenteditable="true"][data-tab="10"]',
  'footer div[data-lexical-editor="true"][contenteditable="true"]',
  'footer div[contenteditable="true"][role="textbox"]',
  'footer div[contenteditable="true"]'
];

let inputFound = false;
for (const selector of inputSelectors) {
  const input = document.querySelector(selector);
  if (input) {
    console.log(`✅ Found input field with selector: ${selector}`);
    console.log(`   Tag: ${input.tagName}, contentEditable: ${input.contentEditable}`);
    inputFound = true;
    break;
  }
}

if (!inputFound) {
  console.warn('⚠️ No input field found. Make sure you have a chat open.');
}

// Test 5: Summary
console.log('\n\n📊 SUMMARY');
console.log('='.repeat(50));
console.log(`Messages found: ${messageContainers.length}`);
console.log(`Gracula loaded: ${!!window.Gracula}`);
console.log(`Input field found: ${inputFound}`);

// Recommendations
console.log('\n\n💡 RECOMMENDATIONS');
console.log('='.repeat(50));

if (messageContainers.length === 0) {
  console.log('❌ Open a chat with message history to test speaker detection');
}

if (!window.Gracula) {
  console.log('❌ Install and enable the Gracula extension');
  console.log('   1. Go to chrome://extensions/');
  console.log('   2. Enable "Gracula"');
  console.log('   3. Refresh this page');
}

if (!inputFound) {
  console.log('❌ Open a chat to test input field detection');
}

if (messageContainers.length > 0 && window.Gracula && inputFound) {
  console.log('✅ All systems ready! Click the Gracula button to test.');
  console.log('   Look for 🧛 [SPEAKER] logs in the console when you open the modal.');
}

console.log('\n🧛 Test Complete!');
console.log('='.repeat(50));

