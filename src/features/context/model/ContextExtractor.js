// Context Extraction System
// Extracts and processes conversation context from the page

import { Message } from '../../../entities/message/index.js';
import { SpeakerDetector } from './SpeakerDetector.js';
import { ConversationAnalyzer } from './ConversationAnalyzer.js';
import { logger } from '../../../shared/lib/index.js';

export class ContextExtractor {
  constructor(platform) {
    this.platform = platform;
    this.speakerDetector = new SpeakerDetector(platform);
    this.analyzer = new ConversationAnalyzer();
    this.messages = [];
  }

  /**
   * Extract conversation context from the page
   */
  extract() {
    logger.group('Extracting Conversation Context');
    
    this.messages = [];

    if (!this.platform) {
      logger.warn('No platform detected');
      logger.groupEnd();
      return this.messages;
    }

    // Find all message elements
    const messageElements = this.findMessageElements();
    logger.info(`Found ${messageElements.length} potential message elements`);

    // Process each message
    messageElements.forEach((element, index) => {
      const message = this.processMessageElement(element, index);
      if (message && message.isValid()) {
        this.messages.push(message);
      }
    });

    // Remove duplicates
    this.messages = this.removeDuplicates(this.messages);

    // Keep only recent messages (last 10)
    this.messages = this.messages.slice(-10);

    logger.success(`Extracted ${this.messages.length} valid messages`);
    logger.groupEnd();

    return this.messages;
  }

  /**
   * Find all message elements on the page
   */
  findMessageElements() {
    const elements = [];

    // Strategy 1: Use platform-specific selectors
    if (this.platform.messageSelectors) {
      this.platform.messageSelectors.forEach(selector => {
        try {
          const found = document.querySelectorAll(selector);
          elements.push(...Array.from(found));
        } catch (error) {
          logger.debug(`Invalid selector: ${selector}`);
        }
      });
    }

    // Strategy 2: Generic fallback selectors
    const fallbackSelectors = [
      'div[role="row"] span',
      'div.message span',
      '[data-id] span'
    ];

    fallbackSelectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector);
        elements.push(...Array.from(found));
      } catch (error) {
        // Ignore
      }
    });

    return elements;
  }

  /**
   * Process a single message element
   */
  processMessageElement(element, index) {
    try {
      // Extract text
      const text = element.textContent?.trim();
      if (!text) return null;

      // Detect speaker
      const speakerInfo = this.speakerDetector.detectSpeaker(element);

      // Extract timestamp
      const timestamp = this.speakerDetector.extractTimestamp(
        element,
        this.platform.speakerSelectors?.timestamp
      );

      // Create message object
      const message = new Message({
        id: `msg_${index}`,
        text: text,
        speaker: speakerInfo.speaker,
        isOutgoing: speakerInfo.isOutgoing,
        timestamp: timestamp || new Date(),
        element: element,
        metadata: {
          index: index,
          elementTag: element.tagName,
          elementClass: element.className
        }
      });

      return message;
    } catch (error) {
      logger.debug('Error processing message element:', error);
      return null;
    }
  }

  /**
   * Remove duplicate messages
   */
  removeDuplicates(messages) {
    const seen = new Set();
    return messages.filter(msg => {
      const key = `${msg.text}_${msg.speaker}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
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
    
    return {
      messages: this.messages.map(msg => msg.toJSON()),
      analysis: analysis,
      summary: this.analyzer.getSummary(),
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

export default ContextExtractor;

