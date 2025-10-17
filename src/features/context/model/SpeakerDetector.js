// Speaker Detection System
// Identifies who said what in conversations

window.Gracula = window.Gracula || {};

window.Gracula.SpeakerDetector = class {
  constructor(platform) {
    this.platform = platform;
    this.speakers = new Map(); // Map of speaker IDs to names
    this.currentUser = 'You';
  }

  extractPrePlainMetadata(element) {
    if (!element || typeof element.getAttribute !== 'function') return null;

    // First try to get from the element itself
    let raw = element.getAttribute('data-pre-plain-text')
      || element.dataset?.prePlainText
      || null;

    // If not found on the element, search in child elements
    if (!raw) {
      const childWithAttr = element.querySelector('[data-pre-plain-text]');
      if (childWithAttr) {
        raw = childWithAttr.getAttribute('data-pre-plain-text');
      }
    }

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

  sanitizeSpeakerName(name) {
    if (!name || typeof name !== 'string') {
      return null;
    }

    let value = name.replace(/\s+/g, ' ').trim();

    if (!value) {
      return null;
    }

    value = value
      .replace(/tail-(?:in|out)/gi, '')
      .replace(/msg-(?:dblcheck|check|time)/gi, '')
      .replace(/view reactions$/i, '')
      .replace(/view reactions$/i, '')
      .replace(/^(delivered|read|seen)$/i, '')
      .trim();


    if (value.includes('View reactions')) {
      value = value.replace(/reaction[\s\S]*view reactions/i, '').trim();
    }

    value = value.replace(/:\s*$/, '').trim();

    if (!value) {
      return null;
    }

    if (value.length > 120) {
      value = value.substring(0, 120).trim();
    }

    return value;
  }



  /**
   * Extract speaker name from message text (WhatsApp format: "Name: message")
   */
  extractSpeakerFromText(messageElement) {
    if (!messageElement) {
      return null;
    }

    // Strategy 1: Look for span elements with aria-label containing speaker name
    const ariaLabels = messageElement.querySelectorAll('[aria-label]');
    for (const elem of ariaLabels) {
      const label = elem.getAttribute('aria-label');
      if (label && label.endsWith(':') && label.length < 100 && label.length > 1) {
        const cleaned = this.sanitizeSpeakerName(label);
        if (cleaned && cleaned !== ':' && !this.isCurrentUserLabel(cleaned)) {
          return cleaned;
        }
      }
    }

    // Strategy 2: Look for clickable elements (sender names are usually clickable)
    const clickables = messageElement.querySelectorAll('[role="button"], a, [tabindex]');
    for (const elem of clickables) {
      const text = elem.textContent?.trim();
      // Skip if it's a timestamp pattern or too long
      if (text && !text.match(/^\d{1,2}:\d{2}\s*(am|pm)?$/i) && text.length > 2 && text.length < 50) {
        const cleaned = this.sanitizeSpeakerName(text);
        if (cleaned && !this.isCurrentUserLabel(cleaned)) {
          return cleaned;
        }
      }
    }

    // Strategy 3: Check text content but filter out timestamps first
    let fullText = messageElement.textContent || '';

    // Remove common timestamp patterns before looking for speaker names
    fullText = fullText
      .replace(/\d{1,2}:\d{2}\s*(am|pm)/gi, '') // Remove timestamps like "12:30 pm"
      .replace(/tail-(in|out)/gi, '') // Remove WhatsApp tail classes
      .replace(/msg-(check|dblcheck|time)/gi, '') // Remove message status indicators
      .trim();

    // Now look for the first colon
    const colonIndex = fullText.indexOf(':');

    if (colonIndex > 0 && colonIndex < 50) {
      const potentialSpeaker = fullText.substring(0, colonIndex);
      const cleaned = this.sanitizeSpeakerName(potentialSpeaker);

      if (cleaned && cleaned.length > 2 && cleaned.length < 50 && !this.isCurrentUserLabel(cleaned)) {
        return cleaned;
      }
    }

    return null;
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

    const messageText = messageElement?.textContent?.substring(0, 120) || 'N/A';
    console.log('🧛 [SPEAKER] Detecting speaker for:', messageText);

    const selectorName = selectors.senderName
      ? this.extractSenderName(messageElement, selectors.senderName)
      : null;
    const prePlainName = this.sanitizeSpeakerName(prePlainMeta?.speakerName);
    const resolvedName = selectorName || prePlainName || null;

    const outgoingDetected = selectors.outgoingMessage
      ? this.isOutgoingMessage(messageElement, selectors.outgoingMessage)
      : false;

    if (outgoingDetected) {
      console.log('🧛 [SPEAKER] ✅ Detected as OUTGOING (You)');
      return {
        speaker: this.currentUser,
        isOutgoing: true,
        timestamp: prePlainMeta?.timestamp || timestampFromSelectors || null,
        meta: buildMeta('platform-outgoing', {
          selector: selectors.outgoingMessage,
          resolvedName
        })
      };
    }

    const incomingDetected = selectors.incomingMessage
      ? this.isIncomingMessage(messageElement, selectors.incomingMessage)
      : false;

    if (incomingDetected) {
      const incomingName = resolvedName || 'Other';
      const isCurrent = this.isCurrentUserLabel(incomingName);
      console.log('🧛 [SPEAKER] ✅ Detected as INCOMING, sender:', incomingName);

      return {
        speaker: isCurrent ? this.currentUser : incomingName,
        isOutgoing: isCurrent,
        timestamp: prePlainMeta?.timestamp || timestampFromSelectors || null,
        meta: buildMeta('platform-incoming', {
          selector: selectors.incomingMessage,
          resolvedName: incomingName
        })
      };
    }

    if (resolvedName) {
      const isCurrent = this.isCurrentUserLabel(resolvedName);
      console.log('🧛 [SPEAKER] Using resolved sender name:', resolvedName, isCurrent ? '(YOU)' : '(OTHER)');
      return {
        speaker: isCurrent ? this.currentUser : resolvedName,
        isOutgoing: isCurrent,
        timestamp: prePlainMeta?.timestamp || timestampFromSelectors || null,
        meta: buildMeta('resolved-sender', { resolvedName })
      };
    }

    const speakerFromText = this.extractSpeakerFromText(messageElement);
    if (speakerFromText) {
      const isYou = this.isCurrentUserLabel(speakerFromText);
      console.log('🧛 [SPEAKER] ✅ Extracted from text:', speakerFromText, isYou ? '(YOU)' : '(OTHER)');
      return {
        speaker: isYou ? this.currentUser : speakerFromText,
        isOutgoing: isYou,
        timestamp: prePlainMeta?.timestamp || timestampFromSelectors || null,
        meta: buildMeta('text-extraction', { extractedName: speakerFromText })
      };
    }

    if (!hasSelectors) {
      const fallbackNoSelectors = this.detectSpeakerFallback(messageElement, buildMeta('fallback-no-selectors'));
      if (!fallbackNoSelectors.timestamp) {
        fallbackNoSelectors.timestamp = prePlainMeta?.timestamp || timestampFromSelectors || null;
      }
      console.log('🧛 [SPEAKER] No selectors, using fallback:', fallbackNoSelectors.speaker);
      return fallbackNoSelectors;
    }

    if (prePlainMeta?.speakerName) {
      const isCurrent = this.isCurrentUserLabel(prePlainMeta.speakerName);
      console.log('🧛 [SPEAKER] Using prePlainMeta, speaker:', prePlainMeta.speakerName);
      return {
        speaker: isCurrent ? this.currentUser : prePlainMeta.speakerName,
        isOutgoing: isCurrent,
        timestamp: prePlainMeta.timestamp || timestampFromSelectors || null,
        meta: buildMeta('preplain-detection')
      };
    }

    const fallback = this.detectSpeakerFallback(messageElement, buildMeta('fallback'));
    if (!fallback.timestamp) {
      fallback.timestamp = prePlainMeta?.timestamp || timestampFromSelectors || null;
    }
    console.log('🧛 [SPEAKER] Using fallback:', fallback.speaker);
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
      if (container) return true;

      // WhatsApp-specific: Check for "You:" label in the message
      // This is the most reliable indicator in current WhatsApp Web
      const messageRow = element.closest('[role="row"]') || element;
      const textContent = messageRow.textContent || '';

      // Check for "You:" at the beginning of message content
      if (textContent.includes('You:') || textContent.startsWith('You:')) {
        return true;
      }

      // Check for generic element with text "You"
      const youLabel = messageRow.querySelector('generic');
      if (youLabel && youLabel.textContent?.trim() === 'You') {
        return true;
      }

      // Check for check mark icons (msg-check, msg-dblcheck)
      const hasCheckMark = element.querySelector('span[data-icon="msg-check"], span[data-icon="msg-dblcheck"], img[alt="msg-check"], img[alt="msg-dblcheck"]');
      if (hasCheckMark) return true;

      // Check for "Delivered" or "Read" text (indicates outgoing message)
      if (textContent.includes('Delivered') || textContent.includes('Read') || textContent.includes('Sent')) {
        return true;
      }

      // Check for "tail-out" class (WhatsApp's outgoing message tail)
      const hasTailOut = element.querySelector('.tail-out') || element.classList.contains('tail-out');
      if (hasTailOut) return true;

      // Check if message is positioned on the right (outgoing messages are typically right-aligned)
      const messageContainer = element.closest('[data-id]');
      if (messageContainer) {
        const computedStyle = window.getComputedStyle(messageContainer);
        const justifyContent = computedStyle.justifyContent;

        // Outgoing messages often have flex-end or right alignment
        if (justifyContent === 'flex-end' || justifyContent === 'end') {
          return true;
        }
      }

      return false;
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
      if (container) return true;

      // WhatsApp-specific: Check if message does NOT contain "You:"
      const messageRow = element.closest('[role="row"]') || element;
      const textContent = messageRow.textContent || '';

      // If it doesn't have "You:" and has a colon, it's likely incoming
      if (!textContent.includes('You:') && textContent.includes(':')) {
        return true;
      }

      // Check for "tail-in" class (WhatsApp's incoming message tail)
      const hasTailIn = element.querySelector('.tail-in') || element.classList.contains('tail-in');
      if (hasTailIn) return true;

      // Check if message is positioned on the left (incoming messages are typically left-aligned)
      const messageContainer = element.closest('[data-id]');
      if (messageContainer) {
        const computedStyle = window.getComputedStyle(messageContainer);
        const justifyContent = computedStyle.justifyContent;

        // Incoming messages often have flex-start or left alignment
        if (justifyContent === 'flex-start' || justifyContent === 'start') {
          return true;
        }
      }

      return false;
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
        const candidates = [
          senderElement.textContent,
          senderElement.getAttribute?.('aria-label'),
          senderElement.getAttribute?.('title'),
          senderElement.getAttribute?.('data-testid')
        ];

        for (const candidate of candidates) {
          const cleanedName = this.sanitizeSpeakerName(candidate);
          if (cleanedName) {
            this.speakers.set(cleanedName, cleanedName);
            return cleanedName;
          }
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



