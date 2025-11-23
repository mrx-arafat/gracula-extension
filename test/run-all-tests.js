#!/usr/bin/env node

/**
 * Master test runner for all Gracula extension tests
 * Runs all test suites and provides a comprehensive report
 */

const { execSync } = require('child_process');
const path = require('path');

const tests = [
  {
    name: 'System Banner Filter Tests',
    file: 'test/test-system-banner-filter.js',
    description: 'Tests the isSystemNoticeText() function with 9 scenarios'
  },
  {
    name: 'Reply to Last Message Integration Tests',
    file: 'test/test-reply-last-message-integration.js',
    description: 'Tests the full message extraction and filtering flow'
  },
  {
    name: 'Regression Tests',
    file: 'test/test-no-regressions.js',
    description: 'Ensures existing features are not broken (12 scenarios)'
  }
];

console.log('\n' + '=' .repeat(80));
console.log('🧪 GRACULA EXTENSION - COMPREHENSIVE TEST SUITE');
console.log('=' .repeat(80) + '\n');

let totalPassed = 0;
let totalFailed = 0;
const results = [];

tests.forEach((test, index) => {
  console.log(`\n[${index + 1}/${tests.length}] Running: ${test.name}`);
  console.log(`Description: ${test.description}`);
  console.log('-' .repeat(80));

  try {
    const output = execSync(`node ${test.file}`, { encoding: 'utf-8' });
    console.log(output);
    results.push({
      name: test.name,
      status: 'PASSED',
      output
    });
    totalPassed++;
  } catch (error) {
    console.log(error.stdout || error.message);
    results.push({
      name: test.name,
      status: 'FAILED',
      error: error.message
    });
    totalFailed++;
  }
});

// Print summary
console.log('\n' + '=' .repeat(80));
console.log('📊 TEST SUMMARY');
console.log('=' .repeat(80) + '\n');

results.forEach((result, index) => {
  const icon = result.status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} Test ${index + 1}: ${result.name} - ${result.status}`);
});

console.log('\n' + '-' .repeat(80));
console.log(`Total: ${totalPassed} passed, ${totalFailed} failed out of ${tests.length} test suites\n`);

if (totalFailed === 0) {
  console.log('🎉 ALL TESTS PASSED! 🎉');
  console.log('\n✅ The "Reply to Last Message" fix is working correctly!');
  console.log('✅ No regressions detected!');
  console.log('✅ All features are functioning as expected!\n');
  console.log('=' .repeat(80) + '\n');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('\nPlease review the errors above.\n');
  console.log('=' .repeat(80) + '\n');
  process.exit(1);
}

