// Context Extraction System
// Extracts and processes conversation context from the page

window.Gracula = window.Gracula || {};


const MAX_MESSAGES = 50;
const MESSAGE_CONTAINER_FALLBACKS = [
  '[data-id]',
  'div[class*="message"]',
  'li[class*="message"]',
  '[role="row"]',
  '[role="listitem"]',
  '[data-testid="messageEntry"]'
];


window.Gracula.ContextExtractor = class {
  constructor(platform) {
    this.platform = platform;
    this.speakerDetector = new window.Gracula.SpeakerDetector(platform);
    this.analyzer = new window.Gracula.ConversationAnalyzer();
    this.messages = [];
  }

  /**
   * Extract conversation context from the page
   */
  extract() {
    window.Gracula.logger.group('Extracting Conversation Context');

    this.messages = [];

    if (!this.platform) {
      window.Gracula.logger.warn('No platform detected');
      window.Gracula.logger.groupEnd();
      return this.messages;
    }

    // Find all message elements
    const messageElements = this.findMessageElements();
    window.Gracula.logger.info(`Found ${messageElements.length} potential message elements`);

    // Process each message
    messageElements.forEach((element, index) => {
      const message = this.processMessageElement(element, index);
      if (message && message.isValid()) {
        this.messages.push(message);
      }
    });

    this.messages.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return a.timestamp - b.timestamp;
      }

      return (a.metadata?.index || 0) - (b.metadata?.index || 0);
    });

    // Remove duplicates
    this.messages = this.removeDuplicates(this.messages);

    if (this.messages.length > MAX_MESSAGES) {
      this.messages = this.messages.slice(-MAX_MESSAGES);
    }

    window.Gracula.logger.success(`Extracted ${this.messages.length} valid messages`);
    window.Gracula.logger.groupEnd();

    return this.messages;
  }

  /**
   * Find all message elements on the page
   */
  findMessageElements() {
    const uniqueElements = new Set();
    const containerSelector = this.platform?.speakerSelectors?.messageContainer;

    const addElement = (node) => {
      if (!node) return;

      let target = node;

      if (typeof node.closest === 'function') {
        if (containerSelector) {
          const specificContainer = node.closest(containerSelector);
          if (specificContainer) {
            target = specificContainer;
          }
        }

        if (target === node) {
          for (const fallbackSelector of MESSAGE_CONTAINER_FALLBACKS) {
            const fallbackContainer = node.closest(fallbackSelector);
            if (fallbackContainer) {
              target = fallbackContainer;
              break;
            }
          }
        }
      }

      uniqueElements.add(target);
    };

    const collect = (selector, logInvalid = true) => {
      try {
        document.querySelectorAll(selector).forEach(addElement);
      } catch (error) {
        if (logInvalid) {
          window.Gracula.logger.debug(`Invalid selector: ${selector}`);
        }
      }
    };

    // Strategy 1: Use platform-specific selectors
    if (Array.isArray(this.platform?.messageSelectors)) {
      this.platform.messageSelectors.forEach(selector => collect(selector));
    }

    // Strategy 2: Generic fallback selectors
    MESSAGE_CONTAINER_FALLBACKS.forEach(selector => collect(selector, false));

    return Array.from(uniqueElements);
  }

  /**
   * Process a single message element
   */
  processMessageElement(element, index) {
    try {
      if (!element) return null;

      const messageTextSelector = this.platform?.speakerSelectors?.messageText;
      let textSegments = [];

      if (messageTextSelector) {
        const nodes = element.querySelectorAll(messageTextSelector);
        textSegments = Array.from(nodes)
          .map(node => node.innerText || node.textContent || '')
          .map(value => value.replace(/\s+/g, ' ').trim())
          .filter(Boolean);
      }

      if (textSegments.length === 0) {
        const fallbackText = element.innerText || element.textContent || '';
        const cleaned = fallbackText.replace(/\s+/g, ' ').trim();
        if (cleaned) {
          textSegments = [cleaned];
        }
      }

      const text = textSegments.join('\n').trim();
      if (!text || text.length === 0) {
        return null;
      }

      const speakerInfo = this.speakerDetector.detectSpeaker(element) || {};
      const timestampFromSelector = this.speakerDetector.extractTimestamp(
        element,
        this.platform?.speakerSelectors?.timestamp
      );
      const timestamp = speakerInfo.timestamp || timestampFromSelector || new Date();

      const messageId = element.getAttribute?.('data-id')
        || element.dataset?.id
        || element.id
        || `msg_${index}`;

      const prePlainText = element.getAttribute?.('data-pre-plain-text')
        || element.dataset?.prePlainText
        || null;

      const message = new window.Gracula.Message({
        id: messageId,
        text,
        speaker: speakerInfo.speaker,
        isOutgoing: speakerInfo.isOutgoing,
        timestamp,
        element,
        metadata: {
          index,
          elementTag: element.tagName,
          elementClass: element.className,
          messageSelector: messageTextSelector || 'innerText',
          prePlainText,
          speakerDetection: speakerInfo.meta || null
        }
      });

      return message;
    } catch (error) {
      window.Gracula.logger.debug('Error processing message element:', error);
      return null;
    }
  }

  /**
   * Remove duplicate messages
   */
  removeDuplicates(messages) {
    const seen = new Set();
    return messages.filter(msg => {
      const timestampKey = msg.timestamp instanceof Date ? msg.timestamp.getTime() : msg.timestamp;
      const key = msg.id
        || `${timestampKey}_${msg.speaker || 'unknown'}_${(msg.text || '').slice(0, 100)}`;

      if (!key) {
        return true;
      }

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  computeMetrics(messages = [], analysis = null, summary = null) {
    const defaults = {
      totalMessages: 0,
      averageChars: 0,
      averageWords: 0,
      medianChars: 0,
      medianWords: 0,
      recommendedReplyLength: {
        chars: 80,
        words: 16,
        sentences: 2,
        basis: 'default'
      },
      languageHints: [],
      messagePaceSeconds: null,
      shortMessageExamples: [],
      lastMessage: null,
      lastIncomingMessage: null,
      lastOutgoingMessage: null,
      recentIncomingAverageChars: 0,
      recentIncomingAverageWords: 0,
      recentOutgoingAverageChars: 0,
      recentOutgoingAverageWords: 0,
      conversationSummary: summary || null
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return defaults;
    }

    const charLengths = messages.map(msg => (msg?.text || '').length);
    const wordCounts = messages.map(msg => this.countWords(msg?.text));
    const averageChars = Math.round(charLengths.reduce((sum, value) => sum + value, 0) / messages.length);
    const averageWords = Math.round(wordCounts.reduce((sum, value) => sum + value, 0) / messages.length);
    const medianChars = this.getMedian(charLengths);
    const medianWords = this.getMedian(wordCounts);

    const incomingMessages = messages.filter(msg => !this.isMessageFromUser(msg));
    const outgoingMessages = messages.filter(msg => this.isMessageFromUser(msg));
    const lastMessage = messages[messages.length - 1] || null;
    const lastIncoming = incomingMessages[incomingMessages.length - 1] || null;
    const lastOutgoing = outgoingMessages[outgoingMessages.length - 1] || null;

    const recommendedReplyLength = this.calculateRecommendedReplyLength({
      messages,
      averageChars,
      medianChars,
      lastIncoming,
      lastMessage,
      incomingMessages,
      analysis
    });

    const shortMessageExamples = messages
      .filter(msg => (msg?.text || '').length > 0)
      .slice(-6)
      .map(msg => this.truncateText(msg.text, 120));

    return {
      totalMessages: messages.length,
      averageChars,
      averageWords,
      medianChars,
      medianWords,
      recommendedReplyLength,
      languageHints: this.detectLanguageHints(messages),
      messagePaceSeconds: this.computeAverageInterval(messages),
      shortMessageExamples: shortMessageExamples.slice(-3),
      lastMessage: this.serializeLiteMessage(lastMessage),
      lastIncomingMessage: this.serializeLiteMessage(lastIncoming),
      lastOutgoingMessage: this.serializeLiteMessage(lastOutgoing),
      recentIncomingAverageChars: this.averageLength(incomingMessages.slice(-3)),
      recentIncomingAverageWords: this.averageWordLength(incomingMessages.slice(-3)),
      recentOutgoingAverageChars: this.averageLength(outgoingMessages.slice(-3)),
      recentOutgoingAverageWords: this.averageWordLength(outgoingMessages.slice(-3)),
      conversationSummary: summary || null
    };
  }

  serializeLiteMessage(message) {
    if (!message || typeof message.text !== 'string') {
      return null;
    }

    return {
      speaker: message.speaker || (this.isMessageFromUser(message) ? 'Me' : 'Other'),
      isOutgoing: this.isMessageFromUser(message),
      length: (message.text || '').length,
      words: this.countWords(message.text),
      snippet: this.truncateText(message.text, 160),
      timestamp: message.timestamp instanceof Date
        ? message.timestamp.toISOString()
        : message.timestamp || null
    };
  }

  countWords(value) {
    if (typeof value !== 'string') {
      return 0;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return 0;
    }

    return trimmed.split(/\s+/).filter(Boolean).length;
  }

  truncateText(value, maxLength = 140) {
    if (typeof value !== 'string') {
      return '';
    }

    const trimmed = value.trim();
    if (trimmed.length <= maxLength) {
      return trimmed;
    }

    const truncated = trimmed.slice(0, maxLength).replace(/\s+\S*$/, '').trim();
    return truncated ? `${truncated}...` : trimmed.slice(0, maxLength);
  }

  isMessageFromUser(message) {
    if (!message) {
      return false;
    }

    if (typeof message.isFromUser === 'function') {
      return message.isFromUser();
    }

    return !!message.isOutgoing;
  }

  averageLength(messages) {
    const valid = messages.filter(msg => msg && typeof msg.text === 'string' && msg.text.trim().length > 0);
    if (valid.length === 0) {
      return 0;
    }

    const total = valid.reduce((sum, msg) => sum + msg.text.length, 0);
    return Math.round(total / valid.length);
  }

  averageWordLength(messages) {
    const valid = messages.filter(msg => msg && typeof msg.text === 'string' && msg.text.trim().length > 0);
    if (valid.length === 0) {
      return 0;
    }

    const total = valid.reduce((sum, msg) => sum + this.countWords(msg.text), 0);
    return Math.round(total / valid.length);
  }

  getMedian(values = []) {
    const numeric = values
      .filter(value => typeof value === 'number' && !Number.isNaN(value))
      .sort((a, b) => a - b);

    if (numeric.length === 0) {
      return 0;
    }

    const middle = Math.floor(numeric.length / 2);

    if (numeric.length % 2 === 0) {
      return Math.round((numeric[middle - 1] + numeric[middle]) / 2);
    }

    return numeric[middle];
  }

  computeAverageInterval(messages) {
    const timestamps = messages
      .map(msg => {
        if (!msg) {
          return null;
        }

        if (msg.timestamp instanceof Date) {
          return msg.timestamp;
        }

        if (typeof msg.timestamp === 'number') {
          return new Date(msg.timestamp);
        }

        if (typeof msg.timestamp === 'string') {
          const parsed = new Date(msg.timestamp);
          return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        return null;
      })
      .filter(Boolean);

    if (timestamps.length < 2) {
      return null;
    }

    const intervals = [];
    for (let i = 1; i < timestamps.length; i += 1) {
      const current = timestamps[i];
      const previous = timestamps[i - 1];
      const diffSeconds = (current.getTime() - previous.getTime()) / 1000;
      if (diffSeconds > 0) {
        intervals.push(diffSeconds);
      }
    }

    if (intervals.length === 0) {
      return null;
    }

    const average = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
    return Math.round(average);
  }

  calculateRecommendedReplyLength({
    averageChars,
    medianChars,
    lastIncoming,
    lastMessage,
    incomingMessages,
    analysis
  }) {
    const base = Math.round(((averageChars || 0) + (medianChars || 0)) / 2) || 80;
    const recentIncoming = (incomingMessages || []).slice(-3);
    const recentAverage = this.averageLength(recentIncoming) || base;
    const lastIncomingLength = lastIncoming && typeof lastIncoming.text === 'string'
      ? lastIncoming.text.length
      : 0;

    let target = recentAverage;
    if (lastIncomingLength > 0) {
      target = (recentAverage * 0.6) + (lastIncomingLength * 0.4);
    }

    if (!recentIncoming.length && analysis?.lastSpeaker === 'Me') {
      target = Math.min(target, base);
    }

    if (!Number.isFinite(target) || target <= 0) {
      target = base;
    }

    const clamped = Math.min(140, Math.max(35, Math.round(target)));
    const sentences = clamped <= 70 ? 1 : 2;
    const words = Math.max(6, Math.round(clamped / 5));

    return {
      chars: clamped,
      words,
      sentences,
      basis: recentIncoming.length ? 'recentIncomingMessages' : 'conversationAverage',
      lastIncomingLength,
      lastMessageSpeaker: lastMessage?.speaker || null
    };
  }

  detectLanguageHints(messages) {
    const hints = new Set();
    const romanisedBanglaPatterns = /(ami|tumi|valo|bhalo|kintu|kemon|korbo|korchi|ache|achhi|parbo|hobey|hobena|na|hoye|kor|korle|korish)/i;

    messages.forEach(message => {
      const text = (message?.text || '').trim();
      if (!text) {
        return;
      }

      if (/[\u0985-\u09B9]/.test(text)) {
        hints.add('Bangla (Bengali script)');
      }

      if (romanisedBanglaPatterns.test(text)) {
        hints.add('Romanized Bangla');
      }

      if (/[a-z]/i.test(text)) {
        hints.add('English');
      }
    });

    return Array.from(hints);
  }

  /**
   * Get context as formatted strings for AI
   */
  getContextStrings() {
    return this.messages.map(msg => msg.toContextString());
  }

  /**
   * Get enhanced context with analysis
   */
  getEnhancedContext() {
    const analysis = this.analyzer.analyze(this.messages);
    const summary = this.analyzer.getSummary();
    const metrics = this.computeMetrics(this.messages, analysis, summary);

    return {
      messages: this.messages.map(msg => msg.toJSON()),
      analysis,
      summary,
      metrics,
      contextStrings: this.getContextStrings()
    };
  }

  /**
   * Get simple context (backward compatible)
   */
  getSimpleContext() {
    return this.getContextStrings();
  }

  /**
   * Clear cached messages
   */
  clear() {
    this.messages = [];
    this.speakerDetector.clearCache();
  }
}



