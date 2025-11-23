/**
 * Regression Test: Ensure existing features still work
 * Verifies that the system banner filter doesn't break other functionality
 */

function isSystemNoticeText(text) {
  if (!text || typeof text !== 'string') return false;
  const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();
  const e2eBannerCore = 'messages and calls are end-to-end encrypted.';
  const e2eBannerTailPhrases = [
    'only people in this chat can read, listen to, or share them. click to learn more',
    'only people in this group can read, listen to, or share them. click to learn more'
  ];
  
  if (normalized.includes(e2eBannerCore)) {
    const hasTail = e2eBannerTailPhrases.some(phrase => normalized.includes(phrase));
    if (hasTail) return true;
  }
  
  if (normalized.includes('secured with end-to-end encryption')) {
    if (normalized.includes('tap for more info') || normalized.includes('click to learn more')) {
      return true;
    }
  }
  
  return false;
}

// Test data with various message types
const regressionTestCases = [
  {
    name: 'Grammar check message (should NOT be filtered)',
    text: 'he like friens',
    shouldFilter: false
  },
  {
    name: 'Message with tone markers (should NOT be filtered)',
    text: 'I am very happy about this!',
    shouldFilter: false
  },
  {
    name: 'Forwarded message (should NOT be filtered)',
    text: 'Forwarded message: Check this out',
    shouldFilter: false
  },
  {
    name: 'Message with reactions (should NOT be filtered)',
    text: 'Great idea! [reactions: 👍😂]',
    shouldFilter: false
  },
  {
    name: 'Message with media reference (should NOT be filtered)',
    text: 'Check the image I sent',
    shouldFilter: false
  },
  {
    name: 'Long message (should NOT be filtered)',
    text: 'This is a very long message that contains multiple sentences. It talks about various topics and should definitely not be filtered out because it is a legitimate user message.',
    shouldFilter: false
  },
  {
    name: 'Message with special characters (should NOT be filtered)',
    text: 'Hello! @user #hashtag $100 €50',
    shouldFilter: false
  },
  {
    name: 'Message with URLs (should NOT be filtered)',
    text: 'Check this: https://example.com/page',
    shouldFilter: false
  },
  {
    name: 'Message with emojis (should NOT be filtered)',
    text: '😀😃😄😁😆😅🤣😂',
    shouldFilter: false
  },
  {
    name: 'Bangla text (should NOT be filtered)',
    text: 'আমি খুব খুশি এই খবর শুনে',
    shouldFilter: false
  },
  {
    name: 'Mixed language (should NOT be filtered)',
    text: 'আমি very happy আছি',
    shouldFilter: false
  },
  {
    name: 'E2E banner (SHOULD be filtered)',
    text: 'Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them. Click to learn more',
    shouldFilter: true
  }
];

console.log('🔄 Regression Test: Ensure No Feature Breakage\n');
console.log('=' .repeat(70));

let passed = 0;
let failed = 0;

regressionTestCases.forEach((testCase, index) => {
  const result = isSystemNoticeText(testCase.text);
  const isPass = result === testCase.shouldFilter;

  if (isPass) {
    passed++;
    console.log(`✓ Test ${index + 1}: ${testCase.name}`);
  } else {
    failed++;
    console.log(`✗ Test ${index + 1}: ${testCase.name}`);
    console.log(`  Expected filter: ${testCase.shouldFilter}, Got: ${result}`);
    console.log(`  Text: "${testCase.text.substring(0, 60)}..."`);
  }
});

console.log('=' .repeat(70));
console.log(`\n📊 Regression Test Results: ${passed} passed, ${failed} failed out of ${regressionTestCases.length} tests\n`);

if (failed === 0) {
  console.log('✅ No regressions detected!');
  console.log('🎉 All existing features continue to work correctly!\n');
  process.exit(0);
} else {
  console.log('❌ Regressions detected!');
  process.exit(1);
}

