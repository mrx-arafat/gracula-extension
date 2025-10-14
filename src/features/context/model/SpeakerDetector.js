// Speaker Detection System
// Identifies who said what in conversations

window.Gracula = window.Gracula || {};

window.Gracula.SpeakerDetector = class {
  constructor(platform) {
    this.platform = platform;
    this.speakers = new Map(); // Map of speaker IDs to names
    this.currentUser = 'Me';
  }

  extractPrePlainMetadata(element) {
    if (!element || typeof element.getAttribute !== 'function') return null;

    const raw = element.getAttribute('data-pre-plain-text')
      || element.dataset?.prePlainText
      || null;

    if (!raw) return null;

    const closingIndex = raw.indexOf(']');
    let timestampText = null;
    let remainder = raw;

    if (closingIndex !== -1) {
      timestampText = raw.substring(1, closingIndex).trim();
      remainder = raw.substring(closingIndex + 1).trim();
    }

    const speakerMatch = remainder.match(/([^:]+):\s*$/);
    const speakerName = speakerMatch ? speakerMatch[1].trim() : null;

    const timestamp = this.parsePrePlainTimestamp(timestampText);

    return {
      raw,
      speakerName,
      timestampText,
      timestamp
    };
  }

  parsePrePlainTimestamp(timestampText) {
    if (!timestampText) return null;

    const parts = timestampText.split(',');
    const timePart = parts[0] ? parts[0].trim() : null;
    const datePart = parts.slice(1).join(',').trim();

    let parsed = null;

    if (datePart) {
      const candidate = new Date(`${datePart} ${timePart}`);
      if (!isNaN(candidate.getTime())) {
        parsed = candidate;
      }
    }

    if (!parsed && timePart) {
      parsed = this.parseTime(timePart);
    }

    return parsed || null;
  }

  isCurrentUserLabel(label) {
    if (!label) return false;
    const normalized = label.trim().toLowerCase();
    const synonyms = ['you', 'me', 'yo', 'moi', 'ich', 'ami'];
    return synonyms.includes(normalized) || normalized === this.currentUser.toLowerCase();
  }


  /**
   * Detect speaker for a message element
   */
  detectSpeaker(messageElement) {
    const selectors = this.platform?.speakerSelectors || {};
    const hasSelectors = Object.keys(selectors).length > 0;
    const prePlainMeta = this.extractPrePlainMetadata(messageElement);
    const timestampFromSelectors = selectors.timestamp
      ? this.extractTimestamp(messageElement, selectors.timestamp)
      : null;
    const buildMeta = (strategy, details = {}) => {
      const base = prePlainMeta ? { ...prePlainMeta } : {};
      return { ...base, strategy, ...details };
    };

    if (!hasSelectors) {
      const fallback = this.detectSpeakerFallback(messageElement, buildMeta('fallback-no-selectors'));
      if (!fallback.timestamp) {
        fallback.timestamp = prePlainMeta?.timestamp || timestampFromSelectors || null;
      }
      return fallback;
    }

    if (selectors.outgoingMessage) {
      const isOutgoing = this.isOutgoingMessage(messageElement, selectors.outgoingMessage);
      if (isOutgoing) {
        return {
          speaker: this.currentUser,
          isOutgoing: true,
          timestamp: prePlainMeta?.timestamp || timestampFromSelectors || null,
          meta: buildMeta('platform-outgoing', { selector: selectors.outgoingMessage })
        };
      }
    }

    if (selectors.incomingMessage) {
      const isIncoming = this.isIncomingMessage(messageElement, selectors.incomingMessage);
      if (isIncoming) {
        const senderName = this.extractSenderName(messageElement, selectors.senderName)
          || prePlainMeta?.speakerName
          || 'Other';

        const isCurrent = this.isCurrentUserLabel(senderName);

        return {
          speaker: isCurrent ? this.currentUser : senderName,
          isOutgoing: isCurrent,
          timestamp: prePlainMeta?.timestamp || timestampFromSelectors || null,
          meta: buildMeta('platform-incoming', {
            selector: selectors.incomingMessage,
            resolvedName: senderName
          })
        };
      }
    }

    if (prePlainMeta) {
      const isCurrent = this.isCurrentUserLabel(prePlainMeta.speakerName);
      return {
        speaker: isCurrent ? this.currentUser : (prePlainMeta.speakerName || 'Other'),
        isOutgoing: isCurrent,
        timestamp: prePlainMeta.timestamp || timestampFromSelectors || null,
        meta: buildMeta('preplain-detection')
      };
    }

    const fallback = this.detectSpeakerFallback(messageElement, buildMeta('fallback'));
    if (!fallback.timestamp) {
      fallback.timestamp = prePlainMeta?.timestamp || timestampFromSelectors || null;
    }
    return fallback;
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
      window.Gracula.logger.debug('Error extracting sender name:', error);
    }

    return null;
  }

  /**
   * Fallback speaker detection using heuristics
   */
  detectSpeakerFallback(element, metaOverride = null) {
    const baseMeta = metaOverride ? { ...metaOverride } : {};
    if (!baseMeta.strategy) {
      baseMeta.strategy = 'fallback';
    }

    const result = {
      speaker: baseMeta.speakerName || baseMeta.resolvedName || 'Other',
      isOutgoing: false,
      timestamp: baseMeta.timestamp || baseMeta.derivedTimestamp || null,
      meta: baseMeta
    };

    const classList = element?.className || '';
    const classString = typeof classList === 'string' ? classList : classList.toString();

    if (classString.match(/message-out|outgoing|sent|self|own|from-me|is-user/i)) {
      result.speaker = this.currentUser;
      result.isOutgoing = true;
      result.meta = { ...baseMeta, strategy: 'fallback-class', matchedClass: classString };
      return result;
    }

    if (classString.match(/message-in|incoming|received|other|from-them|is-other/i)) {
      const detectedName = baseMeta.speakerName || 'Other';
      const isCurrent = this.isCurrentUserLabel(detectedName);
      result.speaker = isCurrent ? this.currentUser : detectedName;
      result.isOutgoing = isCurrent;
      result.meta = { ...baseMeta, strategy: 'fallback-class', matchedClass: classString };
      return result;
    }

    let parent = element?.parentElement;
    let depth = 0;
    while (parent && depth < 6) {
      const parentClass = parent.className || '';
      const parentClassString = typeof parentClass === 'string' ? parentClass : parentClass.toString();

      if (parentClassString.match(/message-out|outgoing|sent|self|own|from-me|is-user/i)) {
        result.speaker = this.currentUser;
        result.isOutgoing = true;
        result.meta = { ...baseMeta, strategy: 'fallback-parent-class', matchedClass: parentClassString, depth };
        return result;
      }

      if (parentClassString.match(/message-in|incoming|received|other|from-them|is-other/i)) {
        const detectedName = baseMeta.speakerName || 'Other';
        const isCurrent = this.isCurrentUserLabel(detectedName);
        result.speaker = isCurrent ? this.currentUser : detectedName;
        result.isOutgoing = isCurrent;
        result.meta = { ...baseMeta, strategy: 'fallback-parent-class', matchedClass: parentClassString, depth };
        return result;
      }

      parent = parent.parentElement;
      depth++;
    }

    if (baseMeta.speakerName) {
      const isCurrent = this.isCurrentUserLabel(baseMeta.speakerName);
      result.speaker = isCurrent ? this.currentUser : baseMeta.speakerName;
      result.isOutgoing = isCurrent;
      result.meta = { ...baseMeta, strategy: 'fallback-preplain' };
    }

    return result;
  }

  /**
   * Extract timestamp from message element
   */
  extractTimestamp(element, timestampSelector) {
    const prePlainMeta = this.extractPrePlainMetadata(element);
    if (prePlainMeta?.timestamp) {
      return prePlainMeta.timestamp;
    }

    if (!timestampSelector) return null;

    try {
      const container = element.closest('[data-id], .message, [role="row"], [role="listitem"]') || element;
      const timestampElement = container.querySelector(timestampSelector);
      if (timestampElement) {
        const rawText = timestampElement.textContent.trim();
        if (!rawText) return null;

        const commaParts = rawText.split(',');
        if (commaParts.length > 1) {
          const timePart = commaParts[0].trim();
          const datePart = commaParts.slice(1).join(',').trim();
          const parsed = new Date(`${datePart} ${timePart}`);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        }

        return this.parseTime(rawText);
      }
    } catch (error) {
      window.Gracula.logger.debug('Error extracting timestamp:', error);
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



