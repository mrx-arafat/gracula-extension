// Speaker Detection System
// Identifies who said what in conversations

import { Message } from '../../../entities/message/index.js';
import { logger } from '../../../shared/lib/index.js';

export class SpeakerDetector {
  constructor(platform) {
    this.platform = platform;
    this.speakers = new Map(); // Map of speaker IDs to names
    this.currentUser = 'Me';
  }

  /**
   * Detect speaker for a message element
   */
  detectSpeaker(messageElement) {
    if (!this.platform || !this.platform.speakerSelectors) {
      return this.detectSpeakerFallback(messageElement);
    }

    const selectors = this.platform.speakerSelectors;
    
    // Check if message is outgoing (from current user)
    if (selectors.outgoingMessage) {
      const isOutgoing = this.isOutgoingMessage(messageElement, selectors.outgoingMessage);
      if (isOutgoing) {
        return { speaker: this.currentUser, isOutgoing: true };
      }
    }

    // Check if message is incoming (from other user)
    if (selectors.incomingMessage) {
      const isIncoming = this.isIncomingMessage(messageElement, selectors.incomingMessage);
      if (isIncoming) {
        // Try to extract sender name
        const senderName = this.extractSenderName(messageElement, selectors.senderName);
        return { speaker: senderName || 'Other', isOutgoing: false };
      }
    }

    // Fallback
    return this.detectSpeakerFallback(messageElement);
  }

  /**
   * Check if message is outgoing
   */
  isOutgoingMessage(element, selector) {
    try {
      // Check if element matches selector
      if (element.matches(selector)) {
        return true;
      }
      
      // Check if element is inside an outgoing message container
      const container = element.closest(selector);
      return !!container;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if message is incoming
   */
  isIncomingMessage(element, selector) {
    try {
      if (element.matches(selector)) {
        return true;
      }
      
      const container = element.closest(selector);
      return !!container;
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract sender name from message element
   */
  extractSenderName(element, senderSelector) {
    if (!senderSelector) return null;

    try {
      // Look for sender name in the message container
      const container = element.closest('[data-id], .message, [role="row"]');
      if (!container) return null;

      const senderElement = container.querySelector(senderSelector);
      if (senderElement) {
        const name = senderElement.textContent.trim();
        if (name && name.length > 0 && name.length < 50) {
          // Cache the speaker
          this.speakers.set(name, name);
          return name;
        }
      }
    } catch (error) {
      logger.debug('Error extracting sender name:', error);
    }

    return null;
  }

  /**
   * Fallback speaker detection using heuristics
   */
  detectSpeakerFallback(element) {
    // Check for common class patterns
    const classList = element.className || '';
    const classString = typeof classList === 'string' ? classList : classList.toString();

    // Outgoing message patterns
    if (classString.match(/message-out|outgoing|sent|self|own/i)) {
      return { speaker: this.currentUser, isOutgoing: true };
    }

    // Incoming message patterns
    if (classString.match(/message-in|incoming|received|other/i)) {
      return { speaker: 'Other', isOutgoing: false };
    }

    // Check parent elements
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      const parentClass = parent.className || '';
      const parentClassString = typeof parentClass === 'string' ? parentClass : parentClass.toString();

      if (parentClassString.match(/message-out|outgoing|sent|self|own/i)) {
        return { speaker: this.currentUser, isOutgoing: true };
      }

      if (parentClassString.match(/message-in|incoming|received|other/i)) {
        return { speaker: 'Other', isOutgoing: false };
      }

      parent = parent.parentElement;
      depth++;
    }

    // Default to unknown
    return { speaker: 'Unknown', isOutgoing: false };
  }

  /**
   * Extract timestamp from message element
   */
  extractTimestamp(element, timestampSelector) {
    if (!timestampSelector) return null;

    try {
      const container = element.closest('[data-id], .message, [role="row"]');
      if (!container) return null;

      const timestampElement = container.querySelector(timestampSelector);
      if (timestampElement) {
        const timeText = timestampElement.textContent.trim();
        // Try to parse time
        return this.parseTime(timeText);
      }
    } catch (error) {
      logger.debug('Error extracting timestamp:', error);
    }

    return null;
  }

  /**
   * Parse time string to Date object
   */
  parseTime(timeString) {
    // Handle formats like "12:30 PM", "12:30", etc.
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const meridiem = timeMatch[3];

      if (meridiem) {
        if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    return new Date();
  }

  /**
   * Get all known speakers
   */
  getSpeakers() {
    return Array.from(this.speakers.values());
  }

  /**
   * Clear speaker cache
   */
  clearCache() {
    this.speakers.clear();
  }
}

export default SpeakerDetector;

