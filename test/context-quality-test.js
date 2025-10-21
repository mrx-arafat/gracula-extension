/**
 * Context Quality Test Framework
 * Tests different context management approaches to find the best one
 */

// Test Scenarios - Real-world conversation patterns
const TEST_SCENARIOS = [
  {
    id: 'short_conversation',
    name: 'Short Conversation (5 messages)',
    messages: [
      { speaker: 'Friend', text: 'Hey, what are you up to?', time: '10:00 AM' },
      { speaker: 'You', text: 'Just working on a project', time: '10:02 AM' },
      { speaker: 'Friend', text: 'Cool, want to grab lunch later?', time: '10:05 AM' },
      { speaker: 'You', text: 'Sure, what time?', time: '10:06 AM' },
      { speaker: 'Friend', text: 'How about 12:30?', time: '10:07 AM' }
    ],
    expectedReplyType: 'direct_answer',
    expectedKeywords: ['12:30', 'yes', 'no', 'works', 'time'],
    description: 'Should reply directly to the time suggestion'
  },

  {
    id: 'long_conversation_same_topic',
    name: 'Long Conversation - Same Topic (30 messages)',
    messages: [
      // Planning a trip - 30 messages about Bali
      { speaker: 'Friend', text: 'Want to plan a trip to Bali?', time: '3 days ago' },
      { speaker: 'You', text: 'Yes! When are you thinking?', time: '3 days ago' },
      { speaker: 'Friend', text: 'Maybe June?', time: '3 days ago' },
      { speaker: 'You', text: 'June works for me', time: '3 days ago' },
      { speaker: 'Friend', text: 'Great! What\'s your budget?', time: '3 days ago' },
      { speaker: 'You', text: 'Around $2000', time: '3 days ago' },
      { speaker: 'Friend', text: 'Perfect, same here', time: '3 days ago' },
      // ... 15 more messages about hotels, flights, activities ...
      { speaker: 'Friend', text: 'I found a beachfront hotel', time: '2 hours ago' },
      { speaker: 'You', text: 'Send me the link', time: '2 hours ago' },
      { speaker: 'Friend', text: '[hotel link]', time: '2 hours ago' },
      { speaker: 'You', text: 'Looks expensive', time: '1 hour ago' },
      { speaker: 'Friend', text: 'But it has free breakfast and pool', time: '1 hour ago' },
      { speaker: 'You', text: 'True, that saves money', time: '1 hour ago' },
      { speaker: 'Friend', text: 'So should we book it?', time: '5 minutes ago' }
    ],
    expectedReplyType: 'decision_response',
    expectedKeywords: ['yes', 'no', 'book', 'hotel', 'think'],
    description: 'Should understand the full trip context but reply to booking question'
  },

  {
    id: 'topic_shift',
    name: 'Topic Shift (20 messages)',
    messages: [
      // Started talking about work, shifted to weekend plans
      { speaker: 'Friend', text: 'How was the meeting?', time: '2 hours ago' },
      { speaker: 'You', text: 'Boring as usual', time: '2 hours ago' },
      { speaker: 'Friend', text: 'Lol same here', time: '2 hours ago' },
      // ... 10 more messages about work ...
      { speaker: 'Friend', text: 'Anyway, what are you doing this weekend?', time: '30 minutes ago' },
      { speaker: 'You', text: 'Not sure yet', time: '25 minutes ago' },
      { speaker: 'Friend', text: 'Want to go hiking?', time: '20 minutes ago' },
      { speaker: 'You', text: 'I\'m pretty tired tbh', time: '15 minutes ago' },
      { speaker: 'Friend', text: 'Fair enough. Movie instead?', time: '10 minutes ago' },
      { speaker: 'You', text: 'That sounds better', time: '5 minutes ago' },
      { speaker: 'Friend', text: 'Cool, Saturday night?', time: '2 minutes ago' }
    ],
    expectedReplyType: 'confirmation',
    expectedKeywords: ['saturday', 'yes', 'sure', 'works', 'movie'],
    description: 'Should focus on current topic (movie plans) not old topic (work)'
  },

  {
    id: 'unanswered_question',
    name: 'Unanswered Question (15 messages)',
    messages: [
      { speaker: 'Friend', text: 'Did you finish the report?', time: '1 day ago' },
      { speaker: 'You', text: 'Working on it', time: '1 day ago' },
      // ... conversation continues but question never answered ...
      { speaker: 'Friend', text: 'Hey', time: '10 minutes ago' },
      { speaker: 'You', text: 'What\'s up?', time: '9 minutes ago' },
      { speaker: 'Friend', text: 'So... did you finish that report?', time: '5 minutes ago' }
    ],
    expectedReplyType: 'answer_question',
    expectedKeywords: ['yes', 'no', 'finished', 'report', 'almost'],
    description: 'Should recognize this is a follow-up to earlier question'
  },

  {
    id: 'emotional_context',
    name: 'Emotional Context (12 messages)',
    messages: [
      { speaker: 'Friend', text: 'I just got fired', time: '1 hour ago' },
      { speaker: 'You', text: 'Oh no! What happened?', time: '1 hour ago' },
      { speaker: 'Friend', text: 'Budget cuts, they let go 20 people', time: '1 hour ago' },
      { speaker: 'You', text: 'I\'m so sorry, that\'s terrible', time: '1 hour ago' },
      // ... supportive conversation ...
      { speaker: 'Friend', text: 'Thanks for listening', time: '30 minutes ago' },
      { speaker: 'You', text: 'Of course, I\'m here for you', time: '30 minutes ago' },
      { speaker: 'Friend', text: 'Want to grab a drink tonight?', time: '5 minutes ago' }
    ],
    expectedReplyType: 'supportive_agreement',
    expectedKeywords: ['yes', 'absolutely', 'sure', 'there', 'support'],
    description: 'Should maintain emotional awareness (friend is upset) while responding to drink invitation'
  },

  {
    id: 'multi_day_conversation',
    name: 'Multi-Day Conversation (40 messages)',
    messages: [
      // Day 1: Planning
      { speaker: 'Friend', text: 'Let\'s organize a birthday party for Sarah', time: '3 days ago' },
      { speaker: 'You', text: 'Great idea! When?', time: '3 days ago' },
      // ... 15 messages about planning ...
      
      // Day 2: Updates
      { speaker: 'Friend', text: 'I booked the venue', time: '2 days ago' },
      { speaker: 'You', text: 'Awesome!', time: '2 days ago' },
      // ... 10 messages about venue ...
      
      // Day 3: Last minute details
      { speaker: 'Friend', text: 'Party is tomorrow!', time: '1 day ago' },
      { speaker: 'You', text: 'Excited!', time: '1 day ago' },
      // ... 8 messages ...
      
      // Today: Immediate question
      { speaker: 'Friend', text: 'Can you pick up the cake on your way?', time: '10 minutes ago' }
    ],
    expectedReplyType: 'immediate_response',
    expectedKeywords: ['yes', 'no', 'sure', 'cake', 'pick'],
    description: 'Should understand party context but focus on immediate cake request'
  }
];

// Evaluation Criteria
const EVALUATION_CRITERIA = {
  contextRelevance: {
    weight: 0.35,
    description: 'Does the reply show understanding of conversation context?'
  },
  directness: {
    weight: 0.25,
    description: 'Does the reply directly address the last message?'
  },
  topicContinuity: {
    weight: 0.20,
    description: 'Does the reply stay on the current topic?'
  },
  emotionalAwareness: {
    weight: 0.10,
    description: 'Does the reply match the emotional tone?'
  },
  brevity: {
    weight: 0.10,
    description: 'Is the reply concise and natural?'
  }
};

// Test Runner
class ContextQualityTester {
  constructor() {
    this.results = [];
  }

  /**
   * Test a specific approach with all scenarios
   */
  async testApproach(approachName, contextBuilder, replyGenerator) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing Approach: ${approachName}`);
    console.log('='.repeat(60));

    const approachResults = {
      name: approachName,
      scenarios: [],
      averageScore: 0
    };

    for (const scenario of TEST_SCENARIOS) {
      console.log(`\n📋 Scenario: ${scenario.name}`);
      console.log(`   ${scenario.description}`);

      // Build context using the approach
      const context = contextBuilder(scenario.messages);
      
      console.log(`\n📊 Context Stats:`);
      console.log(`   - Original messages: ${scenario.messages.length}`);
      console.log(`   - Context length: ${context.length} characters`);
      console.log(`   - Context lines: ${context.split('\n').length}`);

      // Generate reply (this would call AI in real implementation)
      const reply = await replyGenerator(context, scenario);

      // Evaluate reply
      const score = this.evaluateReply(reply, scenario);

      console.log(`\n💬 Generated Reply: "${reply}"`);
      console.log(`⭐ Score: ${score.total.toFixed(2)}/100`);
      console.log(`   - Context Relevance: ${score.contextRelevance}/35`);
      console.log(`   - Directness: ${score.directness}/25`);
      console.log(`   - Topic Continuity: ${score.topicContinuity}/20`);
      console.log(`   - Emotional Awareness: ${score.emotionalAwareness}/10`);
      console.log(`   - Brevity: ${score.brevity}/10`);

      approachResults.scenarios.push({
        scenario: scenario.name,
        score: score.total,
        reply,
        context
      });
    }

    // Calculate average score
    approachResults.averageScore = 
      approachResults.scenarios.reduce((sum, s) => sum + s.score, 0) / 
      approachResults.scenarios.length;

    this.results.push(approachResults);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Average Score for ${approachName}: ${approachResults.averageScore.toFixed(2)}/100`);
    console.log('='.repeat(60));

    return approachResults;
  }

  /**
   * Evaluate a reply against a scenario
   */
  evaluateReply(reply, scenario) {
    const scores = {
      contextRelevance: 0,
      directness: 0,
      topicContinuity: 0,
      emotionalAwareness: 0,
      brevity: 0,
      total: 0
    };

    // Context Relevance (0-35 points)
    const hasExpectedKeywords = scenario.expectedKeywords.some(keyword => 
      reply.toLowerCase().includes(keyword.toLowerCase())
    );
    scores.contextRelevance = hasExpectedKeywords ? 35 : 15;

    // Directness (0-25 points)
    const lastMessage = scenario.messages[scenario.messages.length - 1];
    const isDirectResponse = this.isDirectResponse(reply, lastMessage.text);
    scores.directness = isDirectResponse ? 25 : 10;

    // Topic Continuity (0-20 points)
    const recentTopics = this.extractTopics(scenario.messages.slice(-5));
    const replyTopics = this.extractTopics([{ text: reply }]);
    const topicOverlap = this.calculateOverlap(recentTopics, replyTopics);
    scores.topicContinuity = Math.round(topicOverlap * 20);

    // Emotional Awareness (0-10 points)
    scores.emotionalAwareness = 7; // Placeholder - would need sentiment analysis

    // Brevity (0-10 points)
    const wordCount = reply.split(/\s+/).length;
    scores.brevity = wordCount <= 15 ? 10 : (wordCount <= 25 ? 7 : 4);

    // Calculate total
    scores.total = Object.entries(scores)
      .filter(([key]) => key !== 'total')
      .reduce((sum, [_, value]) => sum + value, 0);

    return scores;
  }

  isDirectResponse(reply, lastMessage) {
    // Simple heuristic: does reply reference words from last message?
    const lastWords = lastMessage.toLowerCase().split(/\s+/);
    const replyWords = reply.toLowerCase().split(/\s+/);
    const overlap = lastWords.filter(word => 
      word.length > 3 && replyWords.includes(word)
    );
    return overlap.length > 0;
  }

  extractTopics(messages) {
    // Simple topic extraction - get meaningful words
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const topics = new Set();
    
    messages.forEach(msg => {
      const words = msg.text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
          topics.add(word);
        }
      });
    });
    
    return Array.from(topics);
  }

  calculateOverlap(arr1, arr2) {
    if (arr1.length === 0 || arr2.length === 0) return 0;
    const set1 = new Set(arr1);
    const overlap = arr2.filter(item => set1.has(item));
    return overlap.length / Math.max(arr1.length, arr2.length);
  }

  /**
   * Generate comparison report
   */
  generateReport() {
    console.log('\n\n');
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(25) + 'FINAL COMPARISON REPORT' + ' '.repeat(30) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');

    // Sort by average score
    const sorted = [...this.results].sort((a, b) => b.averageScore - a.averageScore);

    sorted.forEach((result, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      console.log(`\n${medal} ${index + 1}. ${result.name}`);
      console.log(`   Average Score: ${result.averageScore.toFixed(2)}/100`);
      console.log(`   Scenario Breakdown:`);
      result.scenarios.forEach(s => {
        console.log(`      - ${s.scenario}: ${s.score.toFixed(2)}/100`);
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log(`🏆 WINNER: ${sorted[0].name} with ${sorted[0].averageScore.toFixed(2)}/100`);
    console.log('='.repeat(80));

    return sorted[0];
  }
}

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEST_SCENARIOS,
    EVALUATION_CRITERIA,
    ContextQualityTester
  };
}

