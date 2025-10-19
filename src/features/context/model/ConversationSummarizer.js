// Conversation Summarization System
// Creates concise summaries of long conversations to preserve context while reducing token usage

window.Gracula = window.Gracula || {};

window.Gracula.ConversationSummarizer = class {
  constructor() {
    this.maxMessagesBeforeSummary = 28;
    this.summaryTargetLength = 200; // characters
  }

  /**
   * Check if conversation needs summarization
   */
  needsSummarization(messages) {
    return messages.length > this.maxMessagesBeforeSummary;
  }

  /**
   * Create a summary of the conversation
   */
  summarize(messages, analysis = null) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return null;
    }

    // Keep recent messages intact, summarize older ones
    const recentCount = Math.min(this.maxMessagesBeforeSummary, messages.length);
    const recentMessages = messages.slice(-recentCount);
    const olderMessages = messages.slice(0, -recentCount);

    if (olderMessages.length === 0) {
      return {
        hasSummary: false,
        recentMessages,
        olderSummary: null
      };
    }

    // Create summary of older messages
    const olderSummary = this.createSummary(olderMessages, analysis);

    return {
      hasSummary: true,
      recentMessages,
      olderSummary,
      totalMessages: messages.length,
      summarizedMessages: olderMessages.length,
      recentMessageCount: recentMessages.length
    };
  }

  /**
   * Create a text summary from messages
   */
  createSummary(messages, analysis = null) {
    const summary = {
      messageCount: messages.length,
      timespan: this.calculateTimespan(messages),
      keyTopics: this.extractKeyTopics(messages),
      speakers: this.identifySpeakers(messages),
      importantMoments: this.extractImportantMoments(messages),
      conversationPattern: this.describePattern(messages)
    };

    return this.formatSummary(summary);
  }

  /**
   * Calculate timespan of messages
   */
  calculateTimespan(messages) {
    if (messages.length < 2) return 'recent';

    const first = messages[0];
    const last = messages[messages.length - 1];

    const firstTime = first.timestamp instanceof Date ? first.timestamp : new Date(first.timestamp);
    const lastTime = last.timestamp instanceof Date ? last.timestamp : new Date(last.timestamp);

    const diffMs = lastTime - firstTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    return 'recent';
  }

  /**
   * Extract key topics from messages
   */
  extractKeyTopics(messages) {
    const wordFrequency = new Map();
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'
    ]);

    messages.forEach(msg => {
      const text = (msg?.text || '').toLowerCase();
      const words = text.split(/\s+/);

      words.forEach(word => {
        // Clean word
        word = word.replace(/[^a-z0-9]/g, '');
        if (word.length > 3 && !stopWords.has(word)) {
          wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
      });
    });

    // Get top 3-5 topics
    return Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Identify speakers in conversation
   */
  identifySpeakers(messages) {
    const speakers = new Set();
    messages.forEach(msg => {
      if (msg.speaker) {
        speakers.add(msg.speaker);
      }
    });
    return Array.from(speakers);
  }

  /**
   * Extract important moments (questions, decisions, shared info)
   */
  extractImportantMoments(messages) {
    const moments = [];

    // Look for questions
    const questions = messages.filter(msg => msg.hasQuestion && msg.hasQuestion());
    if (questions.length > 0) {
      const lastQuestion = questions[questions.length - 1];
      moments.push({
        type: 'question',
        text: this.truncate(lastQuestion.text, 80),
        speaker: lastQuestion.speaker
      });
    }

    // Look for shared links or media
    const mediaMessages = messages.filter(msg =>
      msg.metadata?.mediaAttachments && msg.metadata.mediaAttachments.length > 0
    );
    if (mediaMessages.length > 0) {
      moments.push({
        type: 'media',
        count: mediaMessages.length,
        types: [...new Set(mediaMessages.flatMap(m => m.metadata.mediaAttachments))]
      });
    }

    // Look for emotional moments
    const emotionalWords = /excited|love|hate|worried|frustrated|happy|sad|amazing|terrible/i;
    const emotionalMessages = messages.filter(msg => emotionalWords.test(msg.text));
    if (emotionalMessages.length > 2) {
      moments.push({
        type: 'emotional',
        count: emotionalMessages.length
      });
    }

    return moments.slice(0, 3); // Keep top 3 moments
  }

  /**
   * Describe conversation pattern
   */
  describePattern(messages) {
    if (messages.length < 2) return 'brief';

    const speakers = this.identifySpeakers(messages);

    if (speakers.length === 1) return 'monologue';

    // Check for back-and-forth
    let alternations = 0;
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].speaker !== messages[i - 1].speaker) {
        alternations++;
      }
    }

    const alternationRate = alternations / (messages.length - 1);

    if (alternationRate > 0.7) return 'active dialogue';
    if (alternationRate > 0.3) return 'mixed exchange';
    return 'sequential messages';
  }

  /**
   * Format summary into readable text
   */
  formatSummary(summary) {
    let text = `Earlier: ${summary.messageCount} messages over ${summary.timespan}`;

    if (summary.speakers.length > 0) {
      const speakerList = summary.speakers.slice(0, 3).join(', ');
      text += ` between ${speakerList}`;
    }

    text += ` (${summary.conversationPattern})`;

    if (summary.keyTopics.length > 0) {
      const topics = summary.keyTopics.slice(0, 3).join(', ');
      text += `. Discussed: ${topics}`;
    }

    // Add important moments
    if (summary.importantMoments.length > 0) {
      summary.importantMoments.forEach(moment => {
        if (moment.type === 'question') {
          text += `. ${moment.speaker} asked: "${moment.text}"`;
        } else if (moment.type === 'media') {
          text += `. Shared ${moment.count} ${moment.types.join('/')}`;
        } else if (moment.type === 'emotional') {
          text += `. ${moment.count} emotional exchanges`;
        }
      });
    }

    return this.truncate(text, this.summaryTargetLength);
  }

  /**
   * Truncate text to max length
   */
  truncate(text, maxLength) {
    if (!text || text.length <= maxLength) return text;

    const truncated = text.slice(0, maxLength).replace(/\s+\S*$/, '');
    return truncated + '...';
  }

  /**
   * Get summarized context strings for AI
   */
  getSummarizedContext(messages, analysis = null) {
    const result = this.summarize(messages, analysis);

    if (!result.hasSummary) {
      // No summary needed, return all messages
      return messages.map(msg => msg.toContextString());
    }

    // Return summary + recent messages
    const contextLines = [];

    // Add summary at the top
    contextLines.push(`📋 CONVERSATION SUMMARY: ${result.olderSummary}`);
    contextLines.push(''); // Empty line

    // Add recent messages
    contextLines.push('📝 RECENT MESSAGES:');
    result.recentMessages.forEach(msg => {
      contextLines.push(msg.toContextString());
    });

    return contextLines;
  }
}
