/**
 * Test Runner - Compares all three context building approaches
 * Run this with: node test/run-context-tests.js
 */

const { TEST_SCENARIOS, ContextQualityTester } = require('./context-quality-test.js');
const {
  HierarchicalContextBuilder,
  SlidingWindowContextBuilder,
  SmartContextBuilder
} = require('./context-builders.js');

/**
 * Mock Reply Generator
 * Simulates AI responses based on context quality
 * In real implementation, this would call the actual AI API
 */
class MockReplyGenerator {
  generate(context, scenario) {
    // Analyze context to generate appropriate reply
    const lastMessage = scenario.messages[scenario.messages.length - 1];
    const contextLower = context.toLowerCase();
    
    // Check if context clearly highlights the last message
    const hasReplyMarker = contextLower.includes('reply to this') || 
                          contextLower.includes('>>>');
    
    // Check if context is too long (might confuse AI)
    const isTooLong = context.length > 2000;
    
    // Check if last message is clearly visible
    const lastMessageVisible = context.includes(lastMessage.text);

    // Generate reply based on scenario type and context quality
    if (!lastMessageVisible) {
      return "What did you say?"; // Bad - context missing last message
    }

    if (isTooLong && !hasReplyMarker) {
      return "Hey, what's up?"; // Generic - overwhelmed by context
    }

    // Generate contextually appropriate reply based on scenario
    switch (scenario.expectedReplyType) {
      case 'direct_answer':
        return hasReplyMarker ? 
          "12:30 works for me!" : 
          "Sure, sounds good";

      case 'decision_response':
        return hasReplyMarker ?
          "Yes, let's book it! The free breakfast makes it worth it." :
          "Yeah, I think we should go for it";

      case 'confirmation':
        return hasReplyMarker ?
          "Saturday night works! What movie?" :
          "Sure, that works";

      case 'answer_question':
        return hasReplyMarker ?
          "Yes, I finished it this morning!" :
          "Almost done with it";

      case 'supportive_agreement':
        return hasReplyMarker ?
          "Absolutely, I'm here for you. Let's grab that drink." :
          "Yes, let's do it";

      case 'immediate_response':
        return hasReplyMarker ?
          "Sure, I can pick up the cake!" :
          "Yeah, no problem";

      default:
        return hasReplyMarker ?
          "Sounds good!" :
          "Okay";
    }
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + 'CONTEXT QUALITY COMPARISON TEST' + ' '.repeat(26) + '║');
  console.log('║' + ' '.repeat(25) + 'Testing 3 Approaches' + ' '.repeat(33) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('\n');

  const tester = new ContextQualityTester();
  const replyGenerator = new MockReplyGenerator();

  // Test Approach 1: Hierarchical Context
  await tester.testApproach(
    'Hierarchical Context (Smart Layering)',
    (messages) => {
      const builder = new HierarchicalContextBuilder({
        immediateWindow: 5,
        recentWindow: 15,
        maxTotal: 50
      });
      return builder.build(messages);
    },
    (context, scenario) => replyGenerator.generate(context, scenario)
  );

  // Test Approach 2: Sliding Window + Summary
  await tester.testApproach(
    'Sliding Window + Summary (Hybrid)',
    (messages) => {
      const builder = new SlidingWindowContextBuilder({
        windowSize: 20,
        summaryThreshold: 25
      });
      return builder.build(messages);
    },
    (context, scenario) => replyGenerator.generate(context, scenario)
  );

  // Test Approach 3: Smart Context Selection
  await tester.testApproach(
    'Smart Context Selection (Relevance-Based)',
    (messages) => {
      const builder = new SmartContextBuilder({
        maxMessages: 25,
        alwaysIncludeLast: 5
      });
      return builder.build(messages);
    },
    (context, scenario) => replyGenerator.generate(context, scenario)
  );

  // Generate final report
  const winner = tester.generateReport();

  // Print detailed recommendation
  console.log('\n\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(30) + 'RECOMMENDATION' + ' '.repeat(33) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('\n');
  
  printRecommendation(winner);
}

function printRecommendation(winner) {
  console.log(`Based on the test results, the recommended approach is:\n`);
  console.log(`🏆 ${winner.name}\n`);
  
  if (winner.name.includes('Hierarchical')) {
    console.log('✅ PROS:');
    console.log('   - Preserves full conversation history');
    console.log('   - Clear structure with background, recent, and immediate layers');
    console.log('   - Highlights what needs immediate attention');
    console.log('   - Scales well to very long conversations');
    console.log('   - AI gets both context AND focus\n');
    
    console.log('⚠️  CONS:');
    console.log('   - Slightly more complex to implement');
    console.log('   - Longer prompts (but well-structured)\n');
    
    console.log('💡 IMPLEMENTATION NOTES:');
    console.log('   - Use 5 messages for immediate window');
    console.log('   - Use 15 messages for recent window');
    console.log('   - Summarize everything older than 15 messages');
    console.log('   - Always mark the last message with ">>> REPLY TO THIS"');
    
  } else if (winner.name.includes('Sliding Window')) {
    console.log('✅ PROS:');
    console.log('   - Good balance between context and focus');
    console.log('   - Simple to implement');
    console.log('   - Moderate prompt length');
    console.log('   - Works well for most conversations\n');
    
    console.log('⚠️  CONS:');
    console.log('   - Summary might miss nuances');
    console.log('   - Fixed window size might not suit all conversations\n');
    
    console.log('💡 IMPLEMENTATION NOTES:');
    console.log('   - Use 20 messages for sliding window');
    console.log('   - Summarize if conversation > 25 messages');
    console.log('   - Clearly mark the reply target');
    
  } else {
    console.log('✅ PROS:');
    console.log('   - Most intelligent approach');
    console.log('   - Includes only relevant messages');
    console.log('   - Adapts to conversation type');
    console.log('   - Best for complex, multi-topic conversations\n');
    
    console.log('⚠️  CONS:');
    console.log('   - Most complex to implement');
    console.log('   - Might miss context if relevance logic is wrong');
    console.log('   - Requires tuning of relevance thresholds\n');
    
    console.log('💡 IMPLEMENTATION NOTES:');
    console.log('   - Always include last 5 messages');
    console.log('   - Select up to 25 total messages based on relevance');
    console.log('   - Use topic matching, questions, and emotional content as signals');
    console.log('   - Show "..." for gaps in conversation');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Next Steps:');
  console.log('1. Review the test results above');
  console.log('2. Examine sample contexts generated for each approach');
  console.log('3. Implement the winning approach in the extension');
  console.log('4. Test with real WhatsApp conversations');
  console.log('5. Fine-tune parameters based on real-world usage');
  console.log('='.repeat(80));
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

