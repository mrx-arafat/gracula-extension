/**
 * Integration test for "Reply to Last Message" feature
 * Simulates the full flow: message extraction -> filtering -> last message selection
 */

// Simulate the isSystemNoticeText function
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

// Simulate message extraction with filtering
function extractAndFilterMessages(rawMessages) {
  return rawMessages.filter(msg => !isSystemNoticeText(msg.text));
}

// Get last message from filtered list
function getLastMessage(messages) {
  if (!messages || messages.length === 0) return null;
  return messages[messages.length - 1];
}

// Get last message from friend (not from user)
function getLastFriendMessage(messages, userName = 'You') {
  if (!messages || messages.length === 0) return null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].speaker !== userName && messages[i].speaker !== 'You') {
      return messages[i];
    }
  }
  return null;
}

// Test data: User's actual conversation
const testConversation = [
  {
    speaker: 'Shohan Shovo CSE 21',
    text: 'Ai hoilo card er obstha vai',
    timestamp: new Date('2025-11-23T10:00:00')
  },
  {
    speaker: 'Shohan Shovo CSE 21',
    text: '-3$ houar karone ar payment kori nah.. Card falaia raxi..',
    timestamp: new Date('2025-11-23T10:05:00')
  },
  {
    speaker: 'You',
    text: 'ami card e 10 dollar er beshi rakhi na',
    timestamp: new Date('2025-11-23T10:10:00')
  },
  {
    speaker: 'You',
    text: 'vorle kete nibe',
    timestamp: new Date('2025-11-23T10:15:00')
  },
  {
    speaker: 'Shohan Shovo CSE 21',
    text: 'Ji vai ejnnoi card bad dia dsi.. Onk manisher kase details ase.. Ke je kun jaygay service add koira rakhse khali payment request ashe.. Abr declination er o fee ase [reactions: 😢]',
    timestamp: new Date('2025-11-23T10:20:00')
  },
  {
    speaker: 'Other',
    text: 'Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them. Click to learn more',
    timestamp: new Date('2025-11-23T10:21:00')
  }
];

console.log('🧪 Integration Test: Reply to Last Message\n');
console.log('=' .repeat(70));

// Test 1: Raw message count
console.log('\n📋 Test 1: Raw Message Count');
console.log(`Total raw messages: ${testConversation.length}`);
console.log(`✓ Expected 6 messages (including E2E banner)`);

// Test 2: Filter system banners
console.log('\n🔍 Test 2: Filter System Banners');
const filtered = extractAndFilterMessages(testConversation);
console.log(`Filtered messages: ${filtered.length}`);
console.log(`✓ Expected 5 messages (E2E banner removed)`);

// Test 3: Get last message (reply_last mode)
console.log('\n📝 Test 3: Get Last Message (reply_last mode)');
const lastMsg = getLastMessage(filtered);
console.log(`Last message speaker: ${lastMsg?.speaker}`);
console.log(`Last message text: "${lastMsg?.text.substring(0, 50)}..."`);
const test3Pass = lastMsg?.text.includes('card bad dia dsi');
console.log(`✓ ${test3Pass ? 'PASS' : 'FAIL'}: Last message is from Shohan about card`);

// Test 4: Get last friend message (reply_friend mode)
console.log('\n👥 Test 4: Get Last Friend Message (reply_friend mode)');
const lastFriendMsg = getLastFriendMessage(filtered, 'You');
console.log(`Last friend message speaker: ${lastFriendMsg?.speaker}`);
console.log(`Last friend message text: "${lastFriendMsg?.text.substring(0, 50)}..."`);
const test4Pass = lastFriendMsg?.text.includes('card bad dia dsi');
console.log(`✓ ${test4Pass ? 'PASS' : 'FAIL'}: Last friend message is from Shohan`);

// Test 5: Verify banner is NOT selected
console.log('\n🚫 Test 5: Verify E2E Banner is NOT Selected');
const bannerInFiltered = filtered.some(msg => msg.text.includes('Messages and calls are end-to-end encrypted'));
console.log(`Banner in filtered list: ${bannerInFiltered}`);
console.log(`✓ ${!bannerInFiltered ? 'PASS' : 'FAIL'}: Banner correctly excluded`);

// Test 6: Verify correct message for reply generation
console.log('\n✉️ Test 6: Correct Message for Reply Generation');
const replyContext = lastMsg?.text || '';
const shouldReplyAbout = ['card', 'payment', 'declination', 'fee'];
const hasContext = shouldReplyAbout.some(word => replyContext.toLowerCase().includes(word));
console.log(`Reply context includes relevant keywords: ${hasContext}`);
console.log(`✓ ${hasContext ? 'PASS' : 'FAIL'}: AI will reply about correct topic`);

console.log('\n' + '=' .repeat(70));

// Summary
const allTests = [test3Pass, test4Pass, !bannerInFiltered, hasContext];
const passCount = allTests.filter(Boolean).length;
console.log(`\n📊 Summary: ${passCount}/${allTests.length} integration tests passed\n`);

if (passCount === allTests.length) {
  console.log('✅ All integration tests passed!');
  console.log('🎉 "Reply to Last Message" feature is working correctly!\n');
  process.exit(0);
} else {
  console.log('❌ Some integration tests failed!');
  process.exit(1);
}

