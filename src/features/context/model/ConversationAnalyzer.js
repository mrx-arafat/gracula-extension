// Conversation Analysis System
// Analyzes conversation patterns and flow

import { logger } from '../../../shared/lib/index.js';

export class ConversationAnalyzer {
  constructor() {
    this.messages = [];
  }

  /**
   * Analyze conversation and extract insights
   */
  analyze(messages) {
    this.messages = messages;

    return {
      messageCount: messages.length,
      speakers: this.identifySpeakers(),
      lastSpeaker: this.getLastSpeaker(),
      hasUnansweredQuestion: this.hasUnansweredQuestion(),
      conversationFlow: this.analyzeFlow(),
      sentiment: this.analyzeSentiment(),
      topics: this.extractTopics(),
      urgency: this.detectUrgency()
    };
  }

  /**
   * Identify unique speakers in conversation
   */
  identifySpeakers() {
    const speakers = new Set();
    this.messages.forEach(msg => {
      if (msg.speaker) {
        speakers.add(msg.speaker);
      }
    });
    return Array.from(speakers);
  }

  /**
   * Get the last person who spoke
   */
  getLastSpeaker() {
    if (this.messages.length === 0) return null;
    return this.messages[this.messages.length - 1].speaker;
  }

  /**
   * Check if there's an unanswered question
   */
  hasUnansweredQuestion() {
    // Look for questions in recent messages
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      
      if (msg.hasQuestion && msg.hasQuestion()) {
        // Check if there's a response after this question
        const hasResponse = this.messages
          .slice(i + 1)
          .some(m => m.speaker !== msg.speaker);
        
        if (!hasResponse) {
          return {
            hasQuestion: true,
            question: msg.text,
            askedBy: msg.speaker
          };
        }
      }
    }

    return { hasQuestion: false };
  }

  /**
   * Analyze conversation flow
   */
  analyzeFlow() {
    if (this.messages.length < 2) {
      return { type: 'single', description: 'Single message' };
    }

    const speakers = this.identifySpeakers();
    
    if (speakers.length === 1) {
      return { type: 'monologue', description: 'One person speaking' };
    }

    // Check for back-and-forth
    let alternations = 0;
    for (let i = 1; i < this.messages.length; i++) {
      if (this.messages[i].speaker !== this.messages[i - 1].speaker) {
        alternations++;
      }
    }

    const alternationRate = alternations / (this.messages.length - 1);

    if (alternationRate > 0.7) {
      return { type: 'dialogue', description: 'Active back-and-forth conversation' };
    } else if (alternationRate > 0.3) {
      return { type: 'mixed', description: 'Mixed conversation with some back-and-forth' };
    } else {
      return { type: 'sequential', description: 'Sequential messages from same speakers' };
    }
  }

  /**
   * Analyze sentiment of conversation
   */
  analyzeSentiment() {
    const positiveWords = ['good', 'great', 'awesome', 'love', 'happy', 'thanks', 'thank', 'nice', 'excellent', 'perfect', '😊', '😄', '❤️', '👍'];
    const negativeWords = ['bad', 'hate', 'angry', 'sad', 'terrible', 'awful', 'wrong', 'problem', 'issue', '😠', '😢', '😞', '👎'];
    const questionWords = ['?', 'what', 'when', 'where', 'who', 'why', 'how'];

    let positiveCount = 0;
    let negativeCount = 0;
    let questionCount = 0;

    this.messages.forEach(msg => {
      const text = msg.text.toLowerCase();
      
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
      
      questionWords.forEach(word => {
        if (text.includes(word)) questionCount++;
      });
    });

    if (positiveCount > negativeCount * 1.5) {
      return { tone: 'positive', confidence: 'high' };
    } else if (negativeCount > positiveCount * 1.5) {
      return { tone: 'negative', confidence: 'high' };
    } else if (questionCount > this.messages.length * 0.3) {
      return { tone: 'inquisitive', confidence: 'medium' };
    } else {
      return { tone: 'neutral', confidence: 'medium' };
    }
  }

  /**
   * Extract main topics from conversation
   */
  extractTopics() {
    // Simple keyword extraction
    const wordFrequency = new Map();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

    this.messages.forEach(msg => {
      const words = msg.text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        // Clean word
        word = word.replace(/[^a-z0-9]/g, '');
        if (word.length > 3 && !stopWords.has(word)) {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      });
    });

    // Get top 3 topics
    const topics = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    return topics;
  }

  /**
   * Detect urgency in conversation
   */
  detectUrgency() {
    const urgentWords = ['urgent', 'asap', 'immediately', 'now', 'quick', 'hurry', 'emergency', 'important', '!!!', '!!'];
    
    let urgencyScore = 0;

    this.messages.forEach(msg => {
      const text = msg.text.toLowerCase();
      urgentWords.forEach(word => {
        if (text.includes(word)) urgencyScore++;
      });
      
      // Check for multiple exclamation marks
      const exclamationCount = (text.match(/!/g) || []).length;
      if (exclamationCount > 2) urgencyScore += 2;
    });

    if (urgencyScore > 3) {
      return { level: 'high', score: urgencyScore };
    } else if (urgencyScore > 0) {
      return { level: 'medium', score: urgencyScore };
    } else {
      return { level: 'low', score: 0 };
    }
  }

  /**
   * Get conversation summary
   */
  getSummary() {
    const analysis = this.analyze(this.messages);
    
    return {
      totalMessages: analysis.messageCount,
      participants: analysis.speakers.join(', '),
      lastSpeaker: analysis.lastSpeaker,
      conversationType: analysis.conversationFlow.type,
      sentiment: analysis.sentiment.tone,
      hasQuestion: analysis.hasUnansweredQuestion.hasQuestion,
      urgency: analysis.urgency.level,
      topics: analysis.topics.join(', ')
    };
  }
}

export default ConversationAnalyzer;

