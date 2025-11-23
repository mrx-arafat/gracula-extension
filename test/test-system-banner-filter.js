/**
 * Unit test for system banner filtering logic
 * Tests the isSystemNoticeText() function from ContextExtractor
 */

// Simulate the isSystemNoticeText function from ContextExtractor
function isSystemNoticeText(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();

  // WhatsApp E2E banner commonly shown at the top of chats
  const e2eBannerCore = 'messages and calls are end-to-end encrypted.';

  const e2eBannerTailPhrases = [
    'only people in this chat can read, listen to, or share them. click to learn more',
    'only people in this group can read, listen to, or share them. click to learn more'
  ];

  if (normalized.includes(e2eBannerCore)) {
    const hasTail = e2eBannerTailPhrases.some(phrase => normalized.includes(phrase));
    if (hasTail) {
      return true;
    }
  }

  // Older / alternative wording: "secured with end-to-end encryption" banners
  if (normalized.includes('secured with end-to-end encryption')) {
    if (normalized.includes('tap for more info') || normalized.includes('click to learn more')) {
      return true;
    }
  }

  return false;
}

// Test cases
const testCases = [
  {
    name: 'Full E2E banner (chat)',
    text: 'Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them. Click to learn more',
    expected: true
  },
  {
    name: 'Full E2E banner (group)',
    text: 'Messages and calls are end-to-end encrypted. Only people in this group can read, listen to, or share them. Click to learn more',
    expected: true
  },
  {
    name: 'E2E banner with extra whitespace',
    text: 'Messages  and   calls   are   end-to-end   encrypted.   Only people in this chat can read, listen to, or share them. Click to learn more',
    expected: true
  },
  {
    name: 'Secured with E2E encryption',
    text: 'Secured with end-to-end encryption. Tap for more info',
    expected: true
  },
  {
    name: 'Normal user message',
    text: 'Ji vai ejnnoi card bad dia dsi.. Onk manisher kase details ase.. Ke je kun jaygay service add koira rakhse khali payment request ashe.. Abr declination er o fee ase',
    expected: false
  },
  {
    name: 'Message with "encrypted" but not system banner',
    text: 'I encrypted my password',
    expected: false
  },
  {
    name: 'Empty string',
    text: '',
    expected: false
  },
  {
    name: 'Null value',
    text: null,
    expected: false
  },
  {
    name: 'Partial banner (missing tail)',
    text: 'Messages and calls are end-to-end encrypted.',
    expected: false
  }
];

// Run tests
console.log('🧪 Testing System Banner Filter Logic\n');
console.log('=' .repeat(60));

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = isSystemNoticeText(testCase.text);
  const isPass = result === testCase.expected;

  if (isPass) {
    passed++;
    console.log(`✓ Test ${index + 1}: ${testCase.name}`);
  } else {
    failed++;
    console.log(`✗ Test ${index + 1}: ${testCase.name}`);
    console.log(`  Expected: ${testCase.expected}, Got: ${result}`);
    if (testCase.text) {
      console.log(`  Text: "${testCase.text.substring(0, 60)}..."`);
    }
  }
});

console.log('=' .repeat(60));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests\n`);

if (failed === 0) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}

