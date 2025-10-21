/**
 * Smart Message Selector - Phase 2 Enhancement
 * Intelligently selects which messages to include in context for very long conversations
 */

window.Gracula = window.Gracula || {};

window.Gracula.SmartMessageSelector = class {
  constructor() {
    this.VERY_LONG_THRESHOLD = 50; // Conversations with >50 messages need smart selection
  }

  /**
   * Determine if smart selection is needed
   */
  needsSmartSelection(messages) {
    return Array.isArray(messages) && messages.length > this.VERY_LONG_THRESHOLD;
  }

  /**
   * Select most relevant messages from a very long conversation
   * @param {Array} messages - All messages
   * @param {Object} analysis - Conversation analysis
   * @param {Number} targetCount - Target number of messages to select (default: 30)
   * @returns {Array} Selected messages
   */
  selectRelevantMessages(messages, analysis, targetCount = 30) {
    if (!this.needsSmartSelection(messages)) {
      return messages; // Return all if not too long
    }

    console.log(`🧠 [SMART SELECTOR] Selecting ${targetCount} most relevant from ${messages.length} messages`);

    // Always include last N messages (immediate context)
    const immediateCount = 5;
    const immediateMessages = messages.slice(-immediateCount);
    
    // Score and select from remaining messages
    const remainingMessages = messages.slice(0, -immediateCount);
    const scoredMessages = this.scoreMessages(remainingMessages, analysis);
    
    // Sort by score and take top messages
    const topMessages = scoredMessages
      .sort((a, b) => b.score - a.score)
      .slice(0, targetCount - immediateCount)
      .map(item => item.message);
    
    // Sort selected messages by timestamp to maintain chronological order
    topMessages.sort((a, b) => {
      const aTime = a?.timestamp instanceof Date ? a.timestamp.getTime() : 0;
      const bTime = b?.timestamp instanceof Date ? b.timestamp.getTime() : 0;
      return aTime - bTime;
    });
    
    // Combine: selected messages + immediate context
    const result = [...topMessages, ...immediateMessages];
    
    console.log(`✅ [SMART SELECTOR] Selected ${result.length} messages (${topMessages.length} relevant + ${immediateCount} immediate)`);
    
    return result;
  }

  /**
   * Score messages based on relevance
   */
  scoreMessages(messages, analysis) {
    const currentTopic = this.extractCurrentTopic(analysis);
    const topicKeywords = this.extractTopicKeywords(currentTopic);
    
    return messages.map((message, index) => {
      let score = 0;
      const text = (message.text || '').toLowerCase();
      
      // 1. Recency score (newer = higher score)
      const recencyScore = (index / messages.length) * 30;
      score += recencyScore;
      
      // 2. Topic relevance score
      const topicScore = this.calculateTopicRelevance(text, topicKeywords) * 25;
      score += topicScore;
      
      // 3. Question/Answer score (keep Q&A pairs)
      if (this.isQuestion(text)) {
        score += 20; // Questions are important
      }
      if (this.isAnswer(text, index, messages)) {
        score += 15; // Answers to questions are important
      }
      
      // 4. Speaker alternation score (conversation flow)
      const alternationScore = this.calculateAlternationScore(message, index, messages) * 10;
      score += alternationScore;
      
      // 5. Message length score (longer messages often have more context)
      const lengthScore = Math.min(text.length / 50, 10); // Cap at 10 points
      score += lengthScore;
      
      return { message, score };
    });
  }

  /**
   * Extract current topic from analysis
   */
  extractCurrentTopic(analysis) {
    if (!analysis) return 'general conversation';
    
    // Try enhanced topic analysis first
    if (analysis.topicAnalysis?.mainTopics?.length > 0) {
      return analysis.topicAnalysis.mainTopics[0].name || 'general conversation';
    }
    
    // Fallback to simple topics
    if (analysis.topics?.length > 0) {
      return analysis.topics[0];
    }
    
    return 'general conversation';
  }

  /**
   * Extract keywords from topic
   */
  extractTopicKeywords(topic) {
    const keywords = new Set();
    
    // Split topic into words
    const words = topic.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 3) { // Ignore very short words
        keywords.add(word);
      }
    });
    
    // Add common variations
    words.forEach(word => {
      // Add plural/singular variations
      if (word.endsWith('s')) {
        keywords.add(word.slice(0, -1));
      } else {
        keywords.add(word + 's');
      }
    });
    
    return Array.from(keywords);
  }

  /**
   * Calculate topic relevance score
   */
  calculateTopicRelevance(text, keywords) {
    if (!keywords || keywords.length === 0) return 0;
    
    let matches = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        matches++;
      }
    });
    
    return matches / keywords.length; // Return 0-1 score
  }

  /**
   * Check if message is a question
   */
  isQuestion(text) {
    // Check for question marks
    if (text.includes('?')) return true;
    
    // Check for question words
    const questionWords = ['what', 'when', 'where', 'who', 'why', 'how', 'which', 'can', 'could', 'would', 'should', 'is', 'are', 'do', 'does', 'did'];
    const firstWord = text.trim().split(/\s+/)[0];
    
    return questionWords.includes(firstWord);
  }

  /**
   * Check if message is an answer to a previous question
   */
  isAnswer(text, index, messages) {
    if (index === 0) return false;
    
    // Check if previous message was a question
    const prevMessage = messages[index - 1];
    if (!prevMessage) return false;
    
    const prevText = (prevMessage.text || '').toLowerCase();
    return this.isQuestion(prevText);
  }

  /**
   * Calculate speaker alternation score
   */
  calculateAlternationScore(message, index, messages) {
    if (index === 0) return 0;
    
    const prevMessage = messages[index - 1];
    if (!prevMessage) return 0;
    
    // Higher score if speaker alternates (shows conversation flow)
    return message.speaker !== prevMessage.speaker ? 1 : 0.3;
  }

  /**
   * Validate context quality
   * Ensures the selected messages make logical sense
   */
  validateContextQuality(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return { valid: false, issues: ['No messages'] };
    }

    const issues = [];
    
    // 1. Check if we have at least one message from each speaker
    const speakers = new Set(messages.map(m => m.speaker));
    if (speakers.size < 2) {
      issues.push('Only one speaker detected - might be missing context');
    }
    
    // 2. Check if last message is included
    // (This should always be true, but let's verify)
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) {
        issues.push('Last message is missing');
      }
    }
    
    // 3. Check for broken Q&A pairs
    let brokenPairs = 0;
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      
      if (this.isQuestion(current.text || '') && !next) {
        brokenPairs++;
      }
    }
    
    if (brokenPairs > 2) {
      issues.push(`${brokenPairs} questions without answers`);
    }
    
    // 4. Check message density (are there big gaps?)
    const timestamps = messages
      .map(m => m.timestamp instanceof Date ? m.timestamp.getTime() : 0)
      .filter(t => t > 0);
    
    if (timestamps.length > 1) {
      const gaps = [];
      for (let i = 1; i < timestamps.length; i++) {
        gaps.push(timestamps[i] - timestamps[i - 1]);
      }
      
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const maxGap = Math.max(...gaps);
      
      // If max gap is 10x average, there might be missing context
      if (maxGap > avgGap * 10) {
        issues.push('Large time gap detected - some context might be missing');
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
      quality: issues.length === 0 ? 'excellent' : issues.length <= 2 ? 'good' : 'poor'
    };
  }

  /**
   * Extract topic changes in conversation
   * Helps identify when the conversation shifts to a new topic
   */
  detectTopicChanges(messages, windowSize = 5) {
    if (!Array.isArray(messages) || messages.length < windowSize * 2) {
      return []; // Not enough messages to detect changes
    }

    const changes = [];
    
    for (let i = windowSize; i < messages.length - windowSize; i++) {
      const beforeWindow = messages.slice(i - windowSize, i);
      const afterWindow = messages.slice(i, i + windowSize);
      
      const beforeKeywords = this.extractKeywordsFromMessages(beforeWindow);
      const afterKeywords = this.extractKeywordsFromMessages(afterWindow);
      
      // Calculate keyword overlap
      const overlap = this.calculateKeywordOverlap(beforeKeywords, afterKeywords);
      
      // If overlap is low, topic might have changed
      if (overlap < 0.3) {
        changes.push({
          index: i,
          message: messages[i],
          beforeTopic: Array.from(beforeKeywords).slice(0, 3).join(', '),
          afterTopic: Array.from(afterKeywords).slice(0, 3).join(', '),
          confidence: 1 - overlap
        });
      }
    }
    
    return changes;
  }

  /**
   * Extract keywords from messages
   */
  extractKeywordsFromMessages(messages) {
    const keywords = new Set();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
    
    messages.forEach(msg => {
      const text = (msg.text || '').toLowerCase();
      const words = text.split(/\s+/);
      
      words.forEach(word => {
        // Clean word
        word = word.replace(/[^a-z0-9]/g, '');
        
        // Add if not a stop word and long enough
        if (word.length > 3 && !stopWords.has(word)) {
          keywords.add(word);
        }
      });
    });
    
    return keywords;
  }

  /**
   * Calculate keyword overlap between two sets
   */
  calculateKeywordOverlap(set1, set2) {
    if (set1.size === 0 || set2.size === 0) return 0;
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }
};

console.log('✅ [SMART SELECTOR] SmartMessageSelector class loaded');

