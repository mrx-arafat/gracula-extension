/**
 * Three Different Context Building Approaches
 * Each implements a different strategy for managing conversation context
 */

/**
 * APPROACH 1: Hierarchical Context (Smart Layering)
 * Structures context in layers: Background → Recent → Immediate
 */
class HierarchicalContextBuilder {
  constructor(options = {}) {
    this.immediateWindow = options.immediateWindow || 5;
    this.recentWindow = options.recentWindow || 15;
    this.maxTotal = options.maxTotal || 50;
  }

  build(messages) {
    if (!messages || messages.length === 0) {
      return 'No conversation history available.';
    }

    const total = messages.length;
    let context = '';

    // LAYER 3: Background Summary (if conversation is long)
    if (total > this.recentWindow) {
      const backgroundMessages = messages.slice(0, total - this.recentWindow);
      const summary = this.generateBackgroundSummary(backgroundMessages);
      
      context += '=== CONVERSATION BACKGROUND ===\n';
      context += summary + '\n\n';
    }

    // LAYER 2: Recent Conversation (condensed)
    if (total > this.immediateWindow) {
      const recentStart = Math.max(0, total - this.recentWindow);
      const recentEnd = total - this.immediateWindow;
      const recentMessages = messages.slice(recentStart, recentEnd);

      if (recentMessages.length > 0) {
        context += '=== RECENT CONVERSATION ===\n';
        recentMessages.forEach(msg => {
          context += `${msg.speaker}: "${msg.text}" (${msg.time})\n`;
        });
        context += '\n';
      }
    }

    // LAYER 1: Immediate Context (full detail)
    const immediateMessages = messages.slice(-this.immediateWindow);
    context += '=== IMMEDIATE CONTEXT (Last ' + immediateMessages.length + ' messages) ===\n';
    immediateMessages.forEach((msg, index) => {
      const isLast = index === immediateMessages.length - 1;
      const prefix = isLast ? '>>> ' : '    ';
      const suffix = isLast ? ' ← REPLY TO THIS' : '';
      context += `${prefix}${msg.speaker}: "${msg.text}" (${msg.time})${suffix}\n`;
    });

    context += '\n🎯 YOUR TASK: Reply directly to the last message marked above.\n';

    return context;
  }

  generateBackgroundSummary(messages) {
    if (messages.length === 0) return '';

    const participants = [...new Set(messages.map(m => m.speaker))];
    const topics = this.extractTopics(messages);
    const timeRange = this.getTimeRange(messages);
    const messageCount = messages.length;

    let summary = `Participants: ${participants.join(', ')}\n`;
    summary += `Messages: ${messageCount} earlier messages\n`;
    summary += `Time range: ${timeRange}\n`;
    
    if (topics.length > 0) {
      summary += `Topics discussed: ${topics.slice(0, 5).join(', ')}`;
    }

    return summary;
  }

  extractTopics(messages) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were']);
    const wordFreq = {};

    messages.forEach(msg => {
      const words = msg.text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        word = word.replace(/[^a-z]/g, '');
        if (word.length > 3 && !stopWords.has(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  getTimeRange(messages) {
    if (messages.length === 0) return 'unknown';
    const first = messages[0].time;
    const last = messages[messages.length - 1].time;
    return `${first} to ${last}`;
  }
}

/**
 * APPROACH 2: Sliding Window + Summary (Hybrid)
 * Keeps recent messages + summary of older messages
 */
class SlidingWindowContextBuilder {
  constructor(options = {}) {
    this.windowSize = options.windowSize || 20;
    this.summaryThreshold = options.summaryThreshold || 25;
  }

  build(messages) {
    if (!messages || messages.length === 0) {
      return 'No conversation history available.';
    }

    const total = messages.length;
    let context = '';

    // If conversation is long, add summary of older messages
    if (total > this.summaryThreshold) {
      const olderMessages = messages.slice(0, total - this.windowSize);
      const summary = this.generateSummary(olderMessages);
      
      context += '=== CONVERSATION SUMMARY (Earlier Messages) ===\n';
      context += summary + '\n\n';
    }

    // Sliding window of recent messages
    const recentMessages = messages.slice(-this.windowSize);
    context += `=== RECENT MESSAGES (Last ${recentMessages.length}) ===\n`;
    
    recentMessages.forEach((msg, index) => {
      const isLast = index === recentMessages.length - 1;
      if (isLast) {
        context += '\n'; // Add spacing before last message
      }
      context += `${msg.speaker}: "${msg.text}" (${msg.time})\n`;
    });

    // Highlight the message to reply to
    const lastMessage = messages[messages.length - 1];
    context += '\n=== REPLY TO THIS MESSAGE ===\n';
    context += `>>> ${lastMessage.speaker}: "${lastMessage.text}" (sent ${lastMessage.time})\n`;
    context += '\n🎯 Generate a direct reply to the message above.\n';

    return context;
  }

  generateSummary(messages) {
    if (messages.length === 0) return 'No earlier messages.';

    const participants = [...new Set(messages.map(m => m.speaker))];
    const topics = this.extractKeyPhrases(messages);
    const questions = this.findQuestions(messages);

    let summary = `Earlier, ${participants.join(' and ')} discussed:\n`;
    
    if (topics.length > 0) {
      summary += `- Main topics: ${topics.join(', ')}\n`;
    }

    if (questions.length > 0) {
      summary += `- Questions asked: ${questions.slice(0, 2).join('; ')}\n`;
    }

    summary += `(${messages.length} messages from ${messages[0].time} to ${messages[messages.length - 1].time})`;

    return summary;
  }

  extractKeyPhrases(messages) {
    // Simple extraction - get longer phrases
    const phrases = [];
    messages.forEach(msg => {
      const text = msg.text;
      // Look for noun phrases (simple heuristic)
      const matches = text.match(/\b[A-Z][a-z]+(?:\s+[a-z]+){0,2}\b/g);
      if (matches) {
        phrases.push(...matches);
      }
    });

    // Get unique phrases
    const unique = [...new Set(phrases)];
    return unique.slice(0, 3);
  }

  findQuestions(messages) {
    return messages
      .filter(msg => msg.text.includes('?'))
      .map(msg => msg.text)
      .slice(-3);
  }
}

/**
 * APPROACH 3: Smart Context Selection (Relevance-Based)
 * Intelligently selects which messages to include based on relevance
 */
class SmartContextBuilder {
  constructor(options = {}) {
    this.maxMessages = options.maxMessages || 25;
    this.alwaysIncludeLast = options.alwaysIncludeLast || 5;
  }

  build(messages) {
    if (!messages || messages.length === 0) {
      return 'No conversation history available.';
    }

    const total = messages.length;
    
    // If conversation is short, include everything
    if (total <= this.maxMessages) {
      return this.buildFullContext(messages);
    }

    // Smart selection for long conversations
    const selectedMessages = this.selectRelevantMessages(messages);
    return this.buildSmartContext(selectedMessages, total);
  }

  selectRelevantMessages(messages) {
    const total = messages.length;
    const selected = new Set();

    // ALWAYS include last N messages
    for (let i = total - this.alwaysIncludeLast; i < total; i++) {
      selected.add(i);
    }

    // Get the last message to determine current topic
    const lastMessage = messages[total - 1];
    const currentTopicWords = this.extractWords(lastMessage.text);

    // Scan backwards to find relevant messages
    let budget = this.maxMessages - this.alwaysIncludeLast;
    
    for (let i = total - this.alwaysIncludeLast - 1; i >= 0 && budget > 0; i--) {
      const msg = messages[i];
      const score = this.calculateRelevanceScore(msg, currentTopicWords, messages);

      if (score > 0.3) { // Relevance threshold
        selected.add(i);
        budget--;
      }
    }

    // Convert to sorted array of messages
    const indices = Array.from(selected).sort((a, b) => a - b);
    return indices.map(i => ({ ...messages[i], originalIndex: i }));
  }

  calculateRelevanceScore(message, topicWords, allMessages) {
    let score = 0;

    // Has question? +0.5
    if (message.text.includes('?')) {
      score += 0.5;
    }

    // Mentions topic words? +0.3 per word
    const msgWords = this.extractWords(message.text);
    const topicOverlap = msgWords.filter(w => topicWords.includes(w)).length;
    score += topicOverlap * 0.3;

    // Long message (>50 chars)? +0.2
    if (message.text.length > 50) {
      score += 0.2;
    }

    // Has emotional words? +0.3
    const emotionalWords = ['love', 'hate', 'sorry', 'thanks', 'excited', 'sad', 'happy', 'angry'];
    if (emotionalWords.some(word => message.text.toLowerCase().includes(word))) {
      score += 0.3;
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  extractWords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return text.toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[^a-z]/g, ''))
      .filter(w => w.length > 3 && !stopWords.has(w));
  }

  buildFullContext(messages) {
    let context = '=== CONVERSATION ===\n';
    messages.forEach((msg, index) => {
      const isLast = index === messages.length - 1;
      const prefix = isLast ? '>>> ' : '    ';
      const suffix = isLast ? ' ← REPLY TO THIS' : '';
      context += `${prefix}${msg.speaker}: "${msg.text}" (${msg.time})${suffix}\n`;
    });
    context += '\n🎯 Reply to the last message above.\n';
    return context;
  }

  buildSmartContext(selectedMessages, totalMessages) {
    let context = `=== CONVERSATION (${selectedMessages.length} selected from ${totalMessages} total) ===\n`;
    
    let lastIndex = -1;
    selectedMessages.forEach((msg, arrayIndex) => {
      const isLast = arrayIndex === selectedMessages.length - 1;
      
      // Add "..." if there's a gap
      if (lastIndex !== -1 && msg.originalIndex > lastIndex + 1) {
        context += '    ...\n';
      }

      const prefix = isLast ? '>>> ' : '    ';
      const suffix = isLast ? ' ← REPLY TO THIS' : '';
      context += `${prefix}${msg.speaker}: "${msg.text}" (${msg.time})${suffix}\n`;
      
      lastIndex = msg.originalIndex;
    });

    context += '\n🎯 Reply to the last message above. Use the earlier context to understand the conversation flow.\n';
    return context;
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HierarchicalContextBuilder,
    SlidingWindowContextBuilder,
    SmartContextBuilder
  };
}

