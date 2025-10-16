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

    // Remove duplicates FIRST (before sorting)
    this.messages = this.removeDuplicates(this.messages);

    // Sort by timestamp (oldest to newest)
    this.messages.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return a.timestamp - b.timestamp;
      }

      return (a.metadata?.index || 0) - (b.metadata?.index || 0);
    });

    // Keep only the most recent MAX_MESSAGES
    if (this.messages.length > MAX_MESSAGES) {
      this.messages = this.messages.slice(-MAX_MESSAGES);
    }

    window.Gracula.logger.success(`Extracted ${this.messages.length} valid messages`);
    window.Gracula.logger.groupEnd();

    return this.messages;
  }

  /**
   * Find the main chat container (exclude chat list sidebar)
   */
  findMainChatContainer() {
    // Strategy 1: Look for the main chat area using [role="main"]
    // This is the actual DOM element that contains the chat messages
    const mainArea = document.querySelector('[role="main"]');
    if (mainArea) {
      const rows = mainArea.querySelectorAll('[role="row"]');
      if (rows.length > 0) {
        // Verify it has actual message content
        for (const row of rows) {
          const hasMessageText = row.querySelector('span.selectable-text.copyable-text');
          if (hasMessageText) {
            window.Gracula.logger.debug('🧛 [CONTEXT] Found main chat container via [role="main"]');
            return mainArea;
          }
        }
      }
    }

    // Strategy 2: Find the chat list grid and look for its sibling that contains messages
    const chatListGrid = document.querySelector('[role="grid"][aria-label*="Chat list"]');
    if (chatListGrid && chatListGrid.parentElement) {
      const parent = chatListGrid.parentElement;
      // Look for siblings that contain message rows
      for (let i = 0; i < parent.children.length; i++) {
        const sibling = parent.children[i];
        if (sibling !== chatListGrid) {
          const rows = sibling.querySelectorAll('[role="row"]');
          if (rows.length > 0) {
            // Verify it has actual message content
            for (const row of rows) {
              const hasMessageText = row.querySelector('span.selectable-text.copyable-text');
              if (hasMessageText) {
                window.Gracula.logger.debug('🧛 [CONTEXT] Found main chat container via chat list sibling');
                return sibling;
              }
            }
          }
        }
      }
    }

    // Strategy 3: Search all elements with [role="row"] and find the container with most message rows
    const allRows = document.querySelectorAll('[role="row"]');
    let bestContainer = null;
    let maxMessageRows = 0;

    for (const row of allRows) {
      // Check if this row has actual message content
      const hasMessageText = row.querySelector('span.selectable-text.copyable-text');
      if (hasMessageText) {
        // Find the parent container that holds multiple message rows
        let parent = row.parentElement;
        while (parent && parent !== document.body) {
          const siblingRows = parent.querySelectorAll('[role="row"]');
          let messageRowCount = 0;
          for (const sibRow of siblingRows) {
            if (sibRow.querySelector('span.selectable-text.copyable-text')) {
              messageRowCount++;
            }
          }
          if (messageRowCount > maxMessageRows) {
            maxMessageRows = messageRowCount;
            bestContainer = parent;
          }
          parent = parent.parentElement;
        }
      }
    }

    if (bestContainer && maxMessageRows > 0) {
      window.Gracula.logger.debug('🧛 [CONTEXT] Found main chat container via row parent scan with', maxMessageRows, 'message rows');
      return bestContainer;
    }

    window.Gracula.logger.warn('🧛 [CONTEXT] Could not find main chat container, using document');
    return document;
  }

  /**
   * Find all message elements on the page
   */
  findMessageElements() {
    const uniqueElements = new Set();
    const containerSelector = this.platform?.speakerSelectors?.messageContainer;

    // Find the main chat container first (exclude chat list)
    const mainChatContainer = this.findMainChatContainer();
    window.Gracula.logger.debug('🧛 [CONTEXT] Using chat container:', mainChatContainer.tagName || 'document');

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
        // Query ONLY within the main chat container, not the entire document
        mainChatContainer.querySelectorAll(selector).forEach(addElement);
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

    window.Gracula.logger.debug(`🧛 [CONTEXT] Collected ${uniqueElements.size} unique message containers`);
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
          .filter(Boolean);
      }

      textSegments = this.cleanTextSegments(textSegments);

      if (textSegments.length === 0) {
        // Use a more intelligent fallback that extracts only the actual message text
        const allText = element.innerText || element.textContent || '';

        // Split by newlines and filter out CSS class names and timestamps
        const lines = allText.split('\n').map(line => line.trim()).filter(Boolean);
        const cleanedLines = lines.filter(line => {
          // Skip lines that are just CSS class names or timestamps
          if (/^(tail-in|tail-out|msg-check|msg-dblcheck|Delivered|Read|Seen)$/.test(line)) {
            return false;
          }
          // Skip time patterns like "4:16 pm"
          if (/^\d{1,2}:\d{2}\s*(am|pm)$/.test(line)) {
            return false;
          }
          // Skip empty or very short lines
          if (line.length < 2) {
            return false;
          }
          return true;
        });

        const cleanedFallback = this.cleanTextSegments(cleanedLines);
        if (cleanedFallback.length > 0) {
          textSegments = cleanedFallback;
        }
      }

      let text = textSegments.join('\n').trim();

      const speakerInfo = this.speakerDetector.detectSpeaker(element) || {};

      text = this.stripSpeakerPrefix(text, speakerInfo);

      if (!text || text.length === 0) {
        return null;
      }

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

  cleanTextSegments(segments = []) {
    if (!Array.isArray(segments) || segments.length === 0) {
      return [];
    }

    const noisePatterns = [
      /^tail-(?:in|out)$/i,
      /^msg-(?:dblcheck|check|time)$/i,
      /^reaction\s+.+view reactions$/i,
      /^view reactions$/i,
      /^delivered$/i,
      /^read$/i,
      /^seen$/i,
      /^forwarded$/i,
      /^starred$/i,
      /^pinned$/i,
      /^removed$/i,
      /^muted chat$/i,
      /^typing…?$/i,
      /^end-to-end encrypted$/i,
      /^\d{1,2}:\d{2}\s*(?:am|pm)?$/i
    ];

    const cleaned = segments
      .map(segment => (segment || '').replace(/\s+/g, ' ').trim())
      .map(segment => segment.replace(/tail-(?:in|out)/gi, '').trim())
      .map(segment => segment.replace(/msg-(?:dblcheck|check|time)/gi, '').trim())
      .map(segment => (segment.includes('View reactions') ? segment.replace(/reaction[\s\S]*view reactions/i, '') : segment).trim())
      .map(segment => segment.replace(/view reactions$/i, '').trim())
      .map(segment => segment.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .filter(segment => !noisePatterns.some(pattern => pattern.test(segment)))
      .map(segment => segment.replace(/\s+/g, ' ').trim());

    const unique = [];
    const seen = new Set();

    cleaned.forEach(segment => {
      if (!seen.has(segment)) {
        seen.add(segment);
        unique.push(segment);
      }
    });

    return unique;
  }

  stripSpeakerPrefix(text, speakerInfo = {}) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let result = text.trim();
    if (!result) {
      return result;
    }

    const prefixes = new Set();
    const maybeAdd = (value) => {
      if (!value || typeof value !== 'string') {
        return;
      }
      prefixes.add(value.trim());
    };

    maybeAdd(speakerInfo.speaker);
    maybeAdd(speakerInfo.displayName);
    maybeAdd(speakerInfo.label);

    if (speakerInfo.isOutgoing) {
      maybeAdd('You');
      maybeAdd('Me');
    } else {
      maybeAdd('You');
    }

    prefixes.forEach(prefix => {
      const escaped = this.escapeRegExp(prefix);
      if (!escaped) {
        return;
      }
      const regex = new RegExp(`^${escaped}\\s*:\\s*`, 'i');
      if (regex.test(result)) {
        result = result.replace(regex, '').trim();
      }
    });

    return result;
  }

  escapeRegExp(value) {
    if (!value || typeof value !== 'string') {
      return '';
    }
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }


  /**
   * Remove duplicate messages
   */
  removeDuplicates(messages) {
    window.Gracula.logger.debug(`🧛 [DEDUP] Starting deduplication with ${messages.length} messages`);

    const seen = new Map(); // Map of key -> message
    const result = [];
    let duplicateCount = 0;

    for (const msg of messages) {
      // Create a composite key using speaker + text (most reliable for WhatsApp)
      // This ensures we catch duplicates even if timestamps or IDs differ
      const textKey = (msg.text || '').trim().toLowerCase();
      const speakerKey = (msg.speaker || 'unknown').trim().toLowerCase();
      const key = `${speakerKey}::${textKey}`;

      // If we've seen this key before, skip it
      if (seen.has(key)) {
        duplicateCount++;
        window.Gracula.logger.debug(`🧛 [DEDUP] Skipping duplicate: ${speakerKey}: ${textKey.substring(0, 50)}...`);
        continue;
      }

      seen.set(key, msg);
      result.push(msg);
    }

    window.Gracula.logger.debug(`🧛 [DEDUP] Deduplication complete: ${messages.length} -> ${result.length} messages (removed ${duplicateCount})`);

    return result;
  }

  hashText(text) {
    if (!text) return '0';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get messages with date separators for better chronological understanding
   */
  getMessagesWithDateSeparators() {
    if (this.messages.length === 0) {
      return [];
    }

    const result = [];
    let currentDate = null;

    for (const msg of this.messages) {
      const msgDate = msg.getDateString?.();

      // Add date separator if date changed
      if (msgDate && msgDate !== currentDate) {
        currentDate = msgDate;
        // Create a pseudo-message for date separator
        result.push({
          id: `date_${currentDate}`,
          text: `--- ${currentDate} ---`,
          speaker: 'system',
          timestamp: msg.timestamp,
          isOutgoing: false,
          type: 'date-separator',
          isDateSeparator: true
        });
      }

      result.push(msg);
    }

    return result;
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



