/**
 * Real WhatsApp Data Testing Script
 * Tests context building approaches with actual WhatsApp conversations
 * 
 * This script will:
 * 1. Extract real conversation data from WhatsApp Web
 * 2. Test all 3 context building approaches
 * 3. Generate sample prompts for each approach
 * 4. Compare the results
 */

const {
  HierarchicalContextBuilder,
  SlidingWindowContextBuilder,
  SmartContextBuilder
} = require('./context-builders.js');

/**
 * Extract conversation data from WhatsApp Web page
 * This mimics what the extension does
 */
function extractWhatsAppConversation() {
  const messages = [];
  
  // Find all message elements (same logic as extension)
  const messageElements = document.querySelectorAll('[role="row"]');
  
  console.log(`Found ${messageElements.length} message elements`);
  
  messageElements.forEach((element, index) => {
    try {
      // Extract message text
      const textElements = element.querySelectorAll('span.selectable-text');
      const text = Array.from(textElements)
        .map(el => el.innerText || el.textContent)
        .filter(Boolean)
        .join(' ')
        .trim();
      
      if (!text) return;
      
      // Extract timestamp from data-pre-plain-text
      const prePlainText = element.querySelector('[data-pre-plain-text]');
      let speaker = 'Unknown';
      let time = 'Unknown';
      
      if (prePlainText) {
        const prePlainTextValue = prePlainText.getAttribute('data-pre-plain-text');
        // Format: "[10:35 am, 20/10/2025] Speaker Name: "
        const match = prePlainTextValue.match(/\[(.*?)\]\s*(.*?):/);
        if (match) {
          time = match[1];
          speaker = match[2];
        }
      }
      
      // Detect if message is outgoing (from user)
      const isOutgoing = element.classList.contains('message-out') || 
                        element.querySelector('[data-icon="msg-check"]') !== null ||
                        element.querySelector('[data-icon="msg-dblcheck"]') !== null;
      
      if (isOutgoing) {
        speaker = 'You';
      }
      
      messages.push({
        speaker,
        text,
        time,
        isOutgoing,
        element: element.outerHTML.substring(0, 100) + '...' // Store snippet for debugging
      });
      
    } catch (error) {
      console.error('Error processing message element:', error);
    }
  });
  
  return messages;
}

/**
 * Generate comparison report for all approaches
 */
function generateComparisonReport(messages, approaches) {
  const report = {
    conversationStats: {
      totalMessages: messages.length,
      speakers: [...new Set(messages.map(m => m.speaker))],
      timeRange: messages.length > 0 ? 
        `${messages[0].time} to ${messages[messages.length - 1].time}` : 
        'N/A',
      lastMessage: messages.length > 0 ? 
        messages[messages.length - 1] : 
        null
    },
    approaches: []
  };
  
  approaches.forEach(({ name, builder }) => {
    const context = builder.build(messages);
    
    const approachResult = {
      name,
      contextLength: context.length,
      contextLines: context.split('\n').length,
      messagesIncluded: (context.match(/>>>/g) || []).length + 
                       (context.match(/\w+:/g) || []).length,
      hasReplyMarker: context.includes('>>> ') || context.includes('REPLY TO THIS'),
      hasTopicSection: context.includes('TOPIC') || context.includes('Topic'),
      hasTaskSection: context.includes('YOUR TASK') || context.includes('🎯'),
      hasSummary: context.includes('SUMMARY') || context.includes('BACKGROUND'),
      context: context
    };
    
    report.approaches.push(approachResult);
  });
  
  return report;
}

/**
 * Format report for console output
 */
function formatReport(report) {
  let output = '\n';
  output += '╔' + '═'.repeat(78) + '╗\n';
  output += '║' + ' '.repeat(20) + 'REAL WHATSAPP CONVERSATION TEST' + ' '.repeat(26) + '║\n';
  output += '╚' + '═'.repeat(78) + '╝\n\n';
  
  // Conversation Stats
  output += '📊 CONVERSATION STATISTICS\n';
  output += '─'.repeat(80) + '\n';
  output += `Total Messages: ${report.conversationStats.totalMessages}\n`;
  output += `Speakers: ${report.conversationStats.speakers.join(', ')}\n`;
  output += `Time Range: ${report.conversationStats.timeRange}\n`;
  
  if (report.conversationStats.lastMessage) {
    output += `\nLast Message:\n`;
    output += `  Speaker: ${report.conversationStats.lastMessage.speaker}\n`;
    output += `  Text: "${report.conversationStats.lastMessage.text}"\n`;
    output += `  Time: ${report.conversationStats.lastMessage.time}\n`;
  }
  
  output += '\n\n';
  
  // Approach Comparison
  output += '🔍 APPROACH COMPARISON\n';
  output += '═'.repeat(80) + '\n\n';
  
  report.approaches.forEach((approach, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
    
    output += `${medal} ${approach.name}\n`;
    output += '─'.repeat(80) + '\n';
    output += `Context Length: ${approach.contextLength} characters\n`;
    output += `Context Lines: ${approach.contextLines}\n`;
    output += `Messages Included: ~${approach.messagesIncluded}\n`;
    output += `Has Reply Marker: ${approach.hasReplyMarker ? '✅' : '❌'}\n`;
    output += `Has Topic Section: ${approach.hasTopicSection ? '✅' : '❌'}\n`;
    output += `Has Task Section: ${approach.hasTaskSection ? '✅' : '❌'}\n`;
    output += `Has Summary: ${approach.hasSummary ? '✅' : '❌'}\n`;
    output += '\n';
  });
  
  return output;
}

/**
 * Format individual context for detailed view
 */
function formatContext(name, context) {
  let output = '\n';
  output += '╔' + '═'.repeat(78) + '╗\n';
  output += `║  ${name}` + ' '.repeat(78 - name.length - 3) + '║\n';
  output += '╚' + '═'.repeat(78) + '╝\n\n';
  output += context;
  output += '\n\n' + '═'.repeat(80) + '\n';
  return output;
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.WhatsAppTester = {
    extractWhatsAppConversation,
    generateComparisonReport,
    formatReport,
    formatContext,
    HierarchicalContextBuilder,
    SlidingWindowContextBuilder,
    SmartContextBuilder,
    
    /**
     * Main test function - run this in browser console
     */
    runTest: function() {
      console.log('🧪 Starting Real WhatsApp Conversation Test...\n');
      
      // Extract messages
      const messages = extractWhatsAppConversation();
      console.log(`✅ Extracted ${messages.length} messages\n`);
      
      if (messages.length === 0) {
        console.error('❌ No messages found! Make sure you have a chat open.');
        return;
      }
      
      // Create builders
      const approaches = [
        {
          name: 'Hierarchical Context (Smart Layering)',
          builder: new HierarchicalContextBuilder({
            immediateWindow: 5,
            recentWindow: 15,
            maxTotal: 50
          })
        },
        {
          name: 'Sliding Window + Summary (Hybrid)',
          builder: new SlidingWindowContextBuilder({
            windowSize: 20,
            summaryThreshold: 25
          })
        },
        {
          name: 'Smart Context Selection (Relevance-Based)',
          builder: new SmartContextBuilder({
            maxMessages: 25,
            alwaysIncludeLast: 5
          })
        }
      ];
      
      // Generate report
      const report = generateComparisonReport(messages, approaches);
      
      // Print summary
      console.log(formatReport(report));
      
      // Print detailed contexts
      console.log('\n\n📄 DETAILED CONTEXT OUTPUTS\n');
      console.log('═'.repeat(80) + '\n');
      
      report.approaches.forEach(approach => {
        console.log(formatContext(approach.name, approach.context));
      });
      
      // Store report for further analysis
      window.lastTestReport = report;
      
      console.log('\n✅ Test complete! Report stored in window.lastTestReport');
      console.log('\nTo view a specific context again, use:');
      console.log('  window.lastTestReport.approaches[0].context  // Hierarchical');
      console.log('  window.lastTestReport.approaches[1].context  // Sliding Window');
      console.log('  window.lastTestReport.approaches[2].context  // Smart Selection');
      
      return report;
    }
  };
  
  console.log('✅ WhatsApp Tester loaded!');
  console.log('To run the test, execute: WhatsAppTester.runTest()');
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractWhatsAppConversation,
    generateComparisonReport,
    formatReport,
    formatContext
  };
}

