// Context Extraction System
// Extracts and processes conversation context from the page

window.Gracula = window.Gracula || {};


const MAX_MESSAGES = 50;
const RECENT_MESSAGE_WINDOW = 40;
const MIN_RECENT_MESSAGE_COUNT = 16;
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
    this.userProfileDetector = new window.Gracula.UserProfileDetector(); // NEW: User profile detector
    this.speakerDetector = new window.Gracula.SpeakerDetector(platform);
    this.analyzer = new window.Gracula.ConversationAnalyzer();
    this.summarizer = new window.Gracula.ConversationSummarizer();
    this.smartSelector = new window.Gracula.SmartMessageSelector(); // PHASE 2: Smart message selection
    this.messages = [];
    this.detectedUserName = null; // NEW: Store detected user name
  }

  /**
   * Detect user profile before extraction
   */
  async detectUserProfile() {
    try {
      console.log('🔍 [CONTEXT] Detecting user profile...');
      const userName = await this.userProfileDetector.detectUserProfile();

      if (userName) {
        this.detectedUserName = userName;
        this.speakerDetector.setCurrentUser(userName);
        console.log('✅ [CONTEXT] User profile detected:', userName);
      } else {
        console.log('⚠️ [CONTEXT] Could not detect user name, using fallback "You"');
      }
    } catch (error) {
      console.error('❌ [CONTEXT] Error detecting user profile:', error);
    }
  }

  /**
   * Extract conversation context from the page
   */
  async extract() {
    // window.Gracula.logger.group('Extracting Conversation Context');

    // NEW: Detect user profile first
    await this.detectUserProfile();

    this.messages = [];

    if (!this.platform) {
      // window.Gracula.logger.warn('No platform detected');
      // window.Gracula.logger.groupEnd();
      return this.messages;
    }

    // Find the main chat container
    const mainChatContainer = this.findMainChatContainer();

    // Build a map of date labels to their positions in the DOM
    const dateLabelMap = this.buildDateLabelMap(mainChatContainer);

    // Find all message elements
    const messageElements = this.findMessageElements(mainChatContainer);
    // window.Gracula.logger.debug(`🧛 [CONTEXT] Found ${messageElements.length} message elements`);

    // Process each message element
    messageElements.forEach((element, index) => {
      const message = this.processMessageElement(element, index);
      if (message && message.isValid()) {
        // Assign the date label based on the element's position
        const dateLabel = this.getDateLabelForElement(element, dateLabelMap);
        if (dateLabel) {
          message.dateLabel = dateLabel;
        }
        this.messages.push(message);
      }
    });

    // Remove duplicates FIRST (before sorting)
    this.messages = this.removeDuplicates(this.messages);

    // Normalize timestamps using date labels (Today/Yesterday/Monday...)
    this.normalizeTimestampsByDateLabels();

    // Sort by timestamp (oldest to newest)
    this.messages.sort((a, b) => {
      const aTime = a?.timestamp instanceof Date ? a.timestamp.getTime() : (typeof a?.timestamp === 'number' ? a.timestamp : (a?.timestamp ? new Date(a.timestamp).getTime() : 0));
      const bTime = b?.timestamp instanceof Date ? b.timestamp.getTime() : (typeof b?.timestamp === 'number' ? b.timestamp : (b?.timestamp ? new Date(b.timestamp).getTime() : 0));

      if (aTime && bTime) {
        return aTime - bTime;
      }

      return (a?.metadata?.index || 0) - (b?.metadata?.index || 0);
    });

    // Limit to the most recent exchange window for analysis
    this.messages = this.applyConversationWindow(this.messages);

    // NEW: Pass detected user name to analyzer
    if (this.detectedUserName) {
      this.analyzer.setUserName(this.detectedUserName);
    }

    // Analyze conversation for context
    const analysis = this.analyzer.analyze(this.messages);
    this.lastSpeaker = analysis.lastSpeaker;
    this.conversationAnalysis = analysis;

    // window.Gracula.logger.success(`Extracted ${this.messages.length} valid messages`);
    // window.Gracula.logger.debug(`📊 Last speaker: ${this.lastSpeaker}`);
    // window.Gracula.logger.debug(`📊 Conversation type: ${analysis.conversationFlow.type}`);
    // window.Gracula.logger.debug(`📊 Topics: ${analysis.topics.join(', ') || 'None'}`);
    // window.Gracula.logger.groupEnd();

    return this.messages;
  }

  /**
   * Build a map of date labels to their positions in the DOM
   * Returns an array of {dateLabel, element} objects in DOM order
   */
  buildDateLabelMap(container) {
    const dateLabelMap = [];
    const seenDates = new Set(); // Track dates we've already added to avoid duplicates

    // Find all div elements that might be date separators
    const allDivs = container.querySelectorAll('div');

    allDivs.forEach(element => {
      const text = (element.textContent || '').trim();

      // Remove common prefixes like emojis (📅, 📆, etc.) and whitespace
      const cleanedText = text.replace(/^[📅📆🗓️\s]+/, '').trim();

      // Check if the text matches common date patterns and is short (date separators are usually short)
      // Check both original text and cleaned text to handle emoji prefixes
      const isDatePattern = (str) => {
        return str === 'Today' || str === 'Yesterday' ||
               str === 'Monday' || str === 'Tuesday' || str === 'Wednesday' ||
               str === 'Thursday' || str === 'Friday' || str === 'Saturday' || str === 'Sunday' ||
               /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str) ||
               /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(str);
      };

      if (text.length < 30 && (isDatePattern(text) || isDatePattern(cleanedText))) {
        // Use the cleaned text as the date label (without emoji)
        const dateLabel = isDatePattern(cleanedText) ? cleanedText : text;

        // Only add if we haven't seen this date yet (avoid duplicates from nested divs)
        if (!seenDates.has(dateLabel)) {
          dateLabelMap.push({ dateLabel, element });
          seenDates.add(dateLabel);
          // window.Gracula.logger.debug(`🧛 [CONTEXT] Found date separator: ${dateLabel}`);
        }
      }
    });

    return dateLabelMap;
  }

  /**
   * Get the date label for a message element based on its position in the DOM
   */
  getDateLabelForElement(messageElement, dateLabelMap) {
    if (!dateLabelMap || dateLabelMap.length === 0) return null;

    // Find the closest date separator that comes before this message element
    let closestDateLabel = null;

    for (const { dateLabel, element } of dateLabelMap) {
      // Check if the date separator comes before the message element in the DOM
      const position = element.compareDocumentPosition(messageElement);

      // DOCUMENT_POSITION_FOLLOWING (4) means the message element comes after the date separator
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        closestDateLabel = dateLabel;
      } else {
        // Once we find a date separator that comes after the message, stop
        break;
      }
    }

    return closestDateLabel;
  }

  /**
   * Normalize message timestamps using the inferred date labels (Today/Yesterday/Monday...)
   * This fixes mis-ordering when WhatsApp only shows time-of-day in bubbles.
   */
  normalizeTimestampsByDateLabels() {
    if (!Array.isArray(this.messages) || this.messages.length === 0) return;

    const toDate = (value) => {
      if (!value) return null;
      if (value instanceof Date) return value;
      if (typeof value === 'number') return new Date(value);
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    for (const msg of this.messages) {
      if (!msg || !msg.timestamp || !msg.dateLabel) continue;

      const baseDate = this.resolveDateForLabel(msg.dateLabel);
      if (!baseDate) continue;

      const ts = toDate(msg.timestamp);
      if (!ts) continue;

      const adjusted = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        ts.getHours(),
        ts.getMinutes(),
        ts.getSeconds(),
        ts.getMilliseconds()
      );

      msg.timestamp = adjusted;
    }
  }

  /**
   * Limit conversation analysis to the trailing window that contains the most recent exchange.
   */
  applyConversationWindow(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return [];
    }

    const capped = messages.length > MAX_MESSAGES
      ? messages.slice(-MAX_MESSAGES)
      : messages.slice();

    const total = capped.length;
    if (total <= MIN_RECENT_MESSAGE_COUNT) {
      return capped;
    }

    let startIndex = 0;
    let seenUser = false;
    let seenFriend = false;
    let collected = 0;

    for (let i = total - 1; i >= 0; i--) {
      const message = capped[i];
      collected += 1;

      if (this.isMessageFromUser(message)) {
        seenUser = true;
      } else {
        seenFriend = true;
      }

      const hasPair = seenUser && seenFriend;
      const reachedMinimum = collected >= MIN_RECENT_MESSAGE_COUNT;
      const reachedWindow = collected >= RECENT_MESSAGE_WINDOW;

      if (reachedWindow || (hasPair && reachedMinimum)) {
        startIndex = i;
        break;
      }

      if (i === 0) {
        startIndex = 0;
      }
    }

    const windowed = capped.slice(startIndex);
    // window.Gracula.logger.debug(
    //   `🧛 [CONTEXT] Applying recent window: total=${total}, startIndex=${startIndex}, windowSize=${windowed.length}`
    // );

    return windowed;
  }


  /**
   * Resolve a concrete Date (at 00:00) for a WhatsApp date label like Today/Yesterday/Monday
   */
  resolveDateForLabel(label) {
    if (!label || typeof label !== 'string') return null;
    const text = label.trim();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lower = text.toLowerCase();
    if (lower === 'today') return new Date(today);
    if (lower === 'yesterday') {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return d;
    }

    const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const idx = weekdays.indexOf(lower);
    if (idx !== -1) {
      const current = today.getDay();
      let diff = (current - idx + 7) % 7;
      if (diff === 0) diff = 7; // if same weekday label, assume previous week
      const d = new Date(today);
      d.setDate(d.getDate() - diff);
      return d;
    }

    // Try to parse DD/MM/YYYY or DD/MM/YY format (common in WhatsApp)
    const ddmmyyyyMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (ddmmyyyyMatch) {
      const day = parseInt(ddmmyyyyMatch[1], 10);
      const month = parseInt(ddmmyyyyMatch[2], 10) - 1; // months are 0-indexed
      let year = parseInt(ddmmyyyyMatch[3], 10);

      // Handle 2-digit years
      if (year < 100) {
        year += 2000;
      }

      const parsed = new Date(year, month, day, 0, 0, 0, 0);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // Try generic date parse (e.g., Oct 20, 2025)
    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }

    return null;
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
          // window.Gracula.logger.debug('🧛 [CONTEXT] Found main chat container via [role="main"]');
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
                // window.Gracula.logger.debug('🧛 [CONTEXT] Found main chat container via chat list sibling');
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
      // window.Gracula.logger.debug('🧛 [CONTEXT] Found main chat container via row parent scan with', maxMessageRows, 'message rows');
      return bestContainer;
    }

    // window.Gracula.logger.warn('🧛 [CONTEXT] Could not find main chat container, using document');
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
    // window.Gracula.logger.debug('🧛 [CONTEXT] Using chat container:', mainChatContainer.tagName || 'document');

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

      // CRITICAL FIX: Filter out nested rows that are children of other message rows
      // This prevents duplicate extraction of messages with nested elements like:
      // - "Forward media" buttons
      // - Reaction buttons
      // - Reply buttons
      if (target.hasAttribute('role') && target.getAttribute('role') === 'row') {
        // Check if this row is nested inside another message row
        const parentRow = target.parentElement?.closest('[role="row"]');
        if (parentRow && parentRow !== target) {
          // This is a nested row, skip it
          return;
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
          // window.Gracula.logger.debug(`Invalid selector: ${selector}`);
        }
      }
    };

    // Strategy 1: Use platform-specific selectors
    if (Array.isArray(this.platform?.messageSelectors)) {
      this.platform.messageSelectors.forEach(selector => collect(selector));
    }

    // Strategy 2: Generic fallback selectors
    MESSAGE_CONTAINER_FALLBACKS.forEach(selector => collect(selector, false));

    // window.Gracula.logger.debug(`🧛 [CONTEXT] Collected ${uniqueElements.size} unique message containers`);
    return Array.from(uniqueElements);
  }

  /**
   * Extract quoted message context if present
   */
  extractQuotedContext(element) {
    if (!element) return null;

    const quotedContainer = element.querySelector('[data-quoted], .quoted-message, [class*="quoted"]');
    if (!quotedContainer) return null;

    const quotedText = quotedContainer.textContent || quotedContainer.innerText || '';
    const cleanedText = quotedText.trim();

    if (!cleanedText) return null;

    // Try to extract quoted sender if available
    const quotedSender = quotedContainer.querySelector('[class*="quoted-author"], [class*="quoted-name"]');
    const sender = quotedSender ? quotedSender.textContent.trim() : 'Unknown';

    return {
      text: cleanedText.substring(0, 100), // Limit to 100 chars for context
      sender
    };
  }

  /**
   * Detect reactions on a message
   * Returns array of {emoji, reactedBy} objects
   */
  detectReactions(element) {
    if (!element) return [];

    const reactions = [];

    try {
      // WhatsApp reaction button format: <button aria-label="reaction ❤. View reactions">
      // The button contains an img with class "emoji" and the emoji in the background-position style
      const reactionButtons = element.querySelectorAll('button[aria-label*="reaction"]');

      reactionButtons.forEach(btn => {
        const ariaLabel = btn.getAttribute('aria-label') || '';

        // Extract emoji from aria-label
        // Format: "reaction ❤. View reactions" or "reaction ❤ by Rafi. View reactions"
        // The emoji is between "reaction " and ". View reactions"
        const emojiMatch = ariaLabel.match(/reaction\s+([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}❤️❤👍😂😮😢🙏]+)/u);

        if (emojiMatch) {
          const emoji = emojiMatch[1].trim();

          // Try to extract who reacted from aria-label
          // Format might be: "reaction ❤ by Rafi. View reactions"
          const reactedByMatch = ariaLabel.match(/reaction\s+[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}❤️❤👍😂😮😢🙏]+\s+by\s+([^.]+)/ui);
          const reactedBy = reactedByMatch ? reactedByMatch[1].trim() : null;

          reactions.push({ emoji, reactedBy });
        }
      });

      // Also check for img elements with emoji class inside reaction buttons
      // WhatsApp uses img.emoji with background-position for emojis
      const emojiImages = element.querySelectorAll('button[aria-label*="reaction"] img.emoji, button[aria-label*="reaction"] img[alt]');
      emojiImages.forEach(img => {
        const alt = img.getAttribute('alt') || '';
        const reactionContainer = img.closest('button[aria-label*="reaction"]');

        if (reactionContainer && alt) {
          const ariaLabel = reactionContainer.getAttribute('aria-label') || '';

          // Extract emoji from alt attribute
          const emoji = alt.trim();

          // Try to extract who reacted
          const reactedByMatch = ariaLabel.match(/by\s+([^.]+)/i);
          const reactedBy = reactedByMatch ? reactedByMatch[1].trim() : null;

          // Avoid duplicates
          if (emoji && !reactions.some(r => r.emoji === emoji && r.reactedBy === reactedBy)) {
            reactions.push({ emoji, reactedBy });
          }
        }
      });
    } catch (error) {
      console.warn('🧛 [CONTEXT] Error detecting reactions:', error);
    }

    return reactions;
  }

  /**
   * Detect if message was forwarded
   */
  detectForwarded(element) {
    if (!element) return false;

    try {
      // WhatsApp shows "Forwarded" label with forward-refreshed icon
      // Structure: <span data-icon="forward-refreshed"> + <span>Forwarded</span>

      // Check for forward-refreshed icon
      const forwardIcon = element.querySelector('[data-icon="forward-refreshed"]');
      if (forwardIcon) {
        return true;
      }

      // Check for "Forwarded" text in specific span
      const forwardedSpans = element.querySelectorAll('span.x1n2onr6.x1qiirwl.xdj266r.x1p8j9ns.xat24cr.x7phf20.x13a8xbf.x1k4tb9n.xhslqc4');
      for (const span of forwardedSpans) {
        if (span.textContent && span.textContent.trim() === 'Forwarded') {
          return true;
        }
      }

      // Fallback: Check for "Forwarded" text anywhere in the element
      const text = element.textContent || element.innerText || '';
      if (/\bForwarded\b/.test(text)) {
        return true;
      }
    } catch (error) {
      console.warn('🧛 [CONTEXT] Error detecting forwarded status:', error);
    }

    return false;
  }

  /**
   * Detect media attachments in a message
   */
  detectMediaAttachments(element) {
    if (!element) return [];

    const media = [];

    // Images
    if (element.querySelector('img[src*="blob:"], img[src*="media"]')) {
      media.push('image');
    }

    // Videos
    if (element.querySelector('video')) {
      media.push('video');
    }

    // Audio/Voice messages
    if (element.querySelector('audio, [data-icon="audio"], [aria-label*="audio"], [aria-label*="voice"]')) {
      media.push('audio');
    }

    // Documents
    if (element.querySelector('[data-icon="document"], [aria-label*="document"], [class*="document"]')) {
      media.push('document');
    }

    // Stickers
    if (element.querySelector('[data-icon="sticker"], [class*="sticker"]')) {
      media.push('sticker');
    }

    // GIFs
    if (element.querySelector('[aria-label*="GIF"], [class*="gif"]')) {
      media.push('gif');
    }

    return [...new Set(media)]; // Remove duplicates
  }

  /**
   * Check if a message element is a quoted/forwarded message
   */
  isQuotedMessage(element) {
    if (!element) return false;

    // If the bubble contains real message text outside of the quoted block, treat it as a normal message.
    const primaryTextNodes = Array.from(element.querySelectorAll('span.selectable-text.copyable-text'));
    const hasOwnText = primaryTextNodes.some(node => {
      const text = (node.textContent || '').trim();
      if (!text) return false;
      const inQuotedButton = node.closest('[role="button"][aria-label*="Quoted"]');
      const quotedContainer = node.closest('[data-quoted], .quoted-message, [class*="quoted"]');
      const isInsideQuotedPreview = quotedContainer && !quotedContainer.isSameNode(element);
      return !inQuotedButton && !isInsideQuotedPreview;
    });

    if (hasOwnText) {
      return false;
    }

    // Check for WhatsApp quoted message indicators
    // Quoted messages have a button with text "Quoted message"
    const quotedButton = element.querySelector('button');
    if (quotedButton) {
      const buttonText = quotedButton.textContent || quotedButton.innerText || '';
      if (buttonText.includes('Quoted message') || buttonText.includes('quoted')) {
        return true;
      }
    }

    // Check for aria-label containing "Quoted"
    const quotedElements = element.querySelectorAll('[aria-label*="Quoted"], [aria-label*="quoted"]');
    if (quotedElements.length > 0) {
      return true;
    }

    // Check if the element has nested quoted message structure
    // WhatsApp quoted messages often have a specific nested div structure
    const hasQuotedStructure = element.querySelector('[data-quoted], .quoted-message, [class*="quoted"]');
    if (hasQuotedStructure) {
      return true;
    }

    return false;
  }

  /**
   * Process a single message element
   */
  processMessageElement(element, index) {
    try {
      if (!element) return null;

      // Skip quoted/forwarded messages
      if (this.isQuotedMessage(element)) {
      // window.Gracula.logger.debug('🧛 [CONTEXT] Skipping quoted message');
        return null;
      }

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
          if (/^(tail-in|tail-out|msg-check|msg-dblcheck|Delivered|Read|Seen|forward-refreshed)$/.test(line)) {
            return false;
          }
          // Skip time patterns like "4:16 pm" or "9:34 am"
          if (/^\d{1,2}:\d{2}\s*(am|pm)$/i.test(line)) {
            return false;
          }
          // Skip lines that end with timestamp (e.g., "Emon Bro Startise9:34 am")
          if (/\d{1,2}:\d{2}\s*(am|pm)$/i.test(line)) {
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

      // Extract quoted context if present
      const quotedContext = this.extractQuotedContext(element);

      // Detect media attachments
      const mediaAttachments = this.detectMediaAttachments(element);

      // NEW: Detect reactions
      const reactions = this.detectReactions(element);
      if (reactions && reactions.length > 0) {
        console.log(`🎉 [CONTEXT] Detected ${reactions.length} reactions:`, reactions);
      }

      // NEW: Detect if message was forwarded
      const isForwarded = this.detectForwarded(element);
      if (isForwarded) {
        console.log(`📤 [CONTEXT] Message is forwarded`);
      }

      const message = new window.Gracula.Message({
        id: messageId,
        text,
        speaker: speakerInfo.speaker,
        isOutgoing: speakerInfo.isOutgoing,
        timestamp,
        element,
        reactions,        // NEW: Add reactions
        isForwarded,      // NEW: Add forwarded status
        metadata: {
          index,
          elementTag: element.tagName,
          elementClass: element.className,
          messageSelector: messageTextSelector || 'innerText',
          prePlainText,
          speakerDetection: speakerInfo.meta || null,
          quotedContext,
          mediaAttachments
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
      /^forward-refreshed$/i,
      /^starred$/i,
      /^pinned$/i,
      /^removed$/i,
      /^muted chat$/i,
      /^typing…?$/i,
      /^end-to-end encrypted$/i,
      /^\d{1,2}:\d{2}\s*(?:am|pm)?$/i,
      // Match timestamps concatenated with text (e.g., "9:34 am" or "9:34am")
      /\d{1,2}:\d{2}\s*(?:am|pm)/i
    ];

    const cleaned = segments
      .map(segment => (segment || '').replace(/\s+/g, ' ').trim())
      // Remove timestamps that might be concatenated (e.g., "text9:34 am" -> "text")
      .map(segment => segment.replace(/\d{1,2}:\d{2}\s*(?:am|pm)/gi, '').trim())
      .map(segment => segment.replace(/tail-(?:in|out)/gi, '').trim())
      .map(segment => segment.replace(/msg-(?:dblcheck|check|time)/gi, '').trim())
      .map(segment => segment.replace(/forward-refreshed/gi, '').trim())
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

    // First, remove "Speaker: " prefix patterns
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

    // Second, if the result is EXACTLY the speaker's name (no actual message), return empty
    // This handles cases where the extracted text is just "Ismail Bhai Startise" with no message
    prefixes.forEach(prefix => {
      if (result.toLowerCase() === prefix.toLowerCase()) {
        result = '';
      }
    });

    // Third, check if the text is just speaker name + timestamp + metadata (no actual message)
    // This happens when a message has no actual text content (e.g., image-only messages)
    // Examples: "Emon Bro Startise9:34 am", "Emon Bro Startise9:34 amforward-refreshed", "Ismail Bhai Startise9:35 am"
    prefixes.forEach(prefix => {
      const escaped = this.escapeRegExp(prefix);
      if (!escaped) {
        return;
      }
      // Match: "SpeakerName" followed by timestamp (with or without space)
      const regex = new RegExp(`^${escaped}\\s*\\d{1,2}:\\d{2}\\s*(?:am|pm)?`, 'i');
      if (regex.test(result)) {
        // Remove speaker name
        const withoutSpeaker = result.replace(new RegExp(`^${escaped}`, 'i'), '').trim();
        // Remove timestamp and check if anything meaningful remains
        const withoutTimestamp = withoutSpeaker.replace(/^\d{1,2}:\d{2}\s*(?:am|pm)?/i, '').trim();
        // Remove common metadata patterns
        const withoutMetadata = withoutTimestamp
          .replace(/^forward-refreshed$/i, '')
          .replace(/^tail-(?:in|out)$/i, '')
          .replace(/^msg-(?:dblcheck|check|time)$/i, '')
          .trim();

        // If nothing meaningful remains, this is not a real message
        if (!withoutMetadata || withoutMetadata.length === 0) {
          result = '';
        }
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

      // If we've seen this key before, check which one to keep
      if (seen.has(key)) {
        const existingMsg = seen.get(key);
        const existingIndex = existingMsg.metadata?.index ?? Infinity;
        const currentIndex = msg.metadata?.index ?? Infinity;

        // Keep the message with the LOWER index (earlier in DOM order)
        // This ensures we keep the first occurrence and discard later duplicates
        if (currentIndex < existingIndex) {
          // Replace the existing message with the current one (it has a lower index)
          window.Gracula.logger.debug(`🧛 [DEDUP] Replacing duplicate (keeping earlier index ${currentIndex} vs ${existingIndex}): ${speakerKey}: ${textKey.substring(0, 50)}...`);

          // Remove the old message from result
          const oldIndex = result.indexOf(existingMsg);
          if (oldIndex !== -1) {
            result.splice(oldIndex, 1);
          }

          // Add the new message (with lower index)
          seen.set(key, msg);
          result.push(msg);
        } else {
          // Skip the current message (existing one has lower index)
          duplicateCount++;
          window.Gracula.logger.debug(`🧛 [DEDUP] Skipping duplicate (keeping earlier index ${existingIndex} vs ${currentIndex}): ${speakerKey}: ${textKey.substring(0, 50)}...`);
        }
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
   * Get context as formatted strings for AI with date grouping and topic awareness
   */
  getContextStrings() {
    if (this.messages.length === 0) {
      return [];
    }

    // Check if we need summarization for long conversations
    if (this.summarizer && this.summarizer.needsSummarization(this.messages)) {
      // Use summarized context
      return this.summarizer.getSummarizedContext(this.messages, this.conversationAnalysis);
    }

    const contextLines = [];

    // NEW: Add user identity at the top if detected
    if (this.detectedUserName) {
      contextLines.push(`👤 User: ${this.detectedUserName}`);
      contextLines.push(''); // Empty line for separation
    }

    // Group messages by date
    const messagesByDate = this.groupMessagesByDate();

    // Build context with date separators
    for (const [dateLabel, messages] of Object.entries(messagesByDate)) {
      contextLines.push(`\n📅 ${dateLabel}`);
      messages.forEach(msg => {
        contextLines.push(msg.toContextString());
      });
    }

    // Add conversation summary at the end
    if (this.conversationAnalysis) {
      contextLines.push(''); // Empty line
      contextLines.push('📊 CONVERSATION CONTEXT:');

      const analysis = this.conversationAnalysis;

      // Get summary from ConversationAnalyzer (which has the correct last messages)
      const summary = this.analyzer.getSummary();

      // Use the summary data which has already calculated the correct last messages
      const isYourLastMessage = summary.isYourLastMessage || false;
      const lastUserMessage = summary.lastUserMessage || '';
      const lastFriendMessage = summary.lastFriendMessage || '';
      const lastFriendSpeaker = summary.lastFriendSpeaker || '';

      // YOUR last message (what you're continuing from)
      if (lastUserMessage) {
        contextLines.push(`💬 Your last message: "${lastUserMessage}"`);
      }

      // Last message from a friend (who you're responding to)
      if (lastFriendMessage) {
        contextLines.push(`⏰ Last reply from ${lastFriendSpeaker}: "${lastFriendMessage}"`);
      }

      // Context indicator: who sent the last message
      if (isYourLastMessage) {
        contextLines.push(`📌 Context: You sent the last message - continue your thought or wait for a reply`);
      } else if (lastFriendMessage) {
        contextLines.push(`📌 Context: ${lastFriendSpeaker} sent the last message - you should respond`);
      }

      // Enhanced Topics
      if (analysis.topicAnalysis && analysis.topicAnalysis.summary) {
        contextLines.push(`🎯 Topic: ${analysis.topicAnalysis.summary}`);

        // Show detected entities for technical conversations
        if (analysis.topicAnalysis.entities) {
          const entities = analysis.topicAnalysis.entities;
          if (entities.tools && entities.tools.length > 0) {
            contextLines.push(`🔧 Tools: ${entities.tools.join(', ')}`);
          }
          if (entities.technologies && entities.technologies.length > 0) {
            contextLines.push(`💻 Technologies: ${entities.technologies.join(', ')}`);
          }
        }

        // Show language mixing info with relationship context
        if (analysis.topicAnalysis.languageAnalysis && analysis.topicAnalysis.languageAnalysis.mixingLevel !== 'none') {
          const langInfo = analysis.topicAnalysis.languageAnalysis;
          let langDisplay = `🌐 Language: ${langInfo.primaryLanguage} (${langInfo.mixingLevel} mixing)`;

          // Add relationship intimacy indicator
          if (langInfo.relationshipType && langInfo.relationshipType !== 'neutral') {
            const relationshipEmojis = {
              'very_close': '👥💯',
              'close': '👥',
              'friendly': '🤝',
              'formal': '🎩'
            };
            const emoji = relationshipEmojis[langInfo.relationshipType] || '';
            langDisplay += ` ${emoji}`;
          }

          contextLines.push(langDisplay);

          // Show detected Bangla words for context
          if (langInfo.detectedBanglaWords && langInfo.detectedBanglaWords.length > 0) {
            const banglaWords = langInfo.detectedBanglaWords.slice(0, 5).join(', ');
            contextLines.push(`🗣️ Bangla terms: ${banglaWords}`);
          }
        }
      } else if (analysis.topics && analysis.topics.length > 0) {
        // Fallback to old topic extraction
        contextLines.push(`🎯 Main topics: ${analysis.topics.join(', ')}`);
      }

      // Unanswered question
      if (analysis.hasUnansweredQuestion && analysis.hasUnansweredQuestion.hasQuestion) {
        contextLines.push(`❓ Unanswered question from ${analysis.hasUnansweredQuestion.askedBy}: "${analysis.hasUnansweredQuestion.question}"`);
      }

      // Conversation flow
      if (analysis.conversationFlow) {
        contextLines.push(`🔄 Conversation style: ${analysis.conversationFlow.description}`);
      }

      // Sentiment/Tone
      if (analysis.sentiment) {
        contextLines.push(`💭 Overall tone: ${analysis.sentiment.tone}`);
      }
    }

    return contextLines;
  }

  /**
   * Group messages by date
   */
  groupMessagesByDate() {
    const grouped = {};
    const dateOrder = [];

    this.messages.forEach(msg => {
      const dateStr = msg.getDateString() || 'Unknown';
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
        dateOrder.push(dateStr);
      }
      grouped[dateStr].push(msg);
    });

    // Define date priority for sorting (most recent first)
    const datePriority = {
      'Today': 1,
      'Yesterday': 2,
      'Monday': 3,
      'Tuesday': 4,
      'Wednesday': 5,
      'Thursday': 6,
      'Friday': 7,
      'Saturday': 8,
      'Sunday': 9
    };

    // Sort dates by priority (most recent first)
    dateOrder.sort((a, b) => {
      const priorityA = datePriority[a] || 999;
      const priorityB = datePriority[b] || 999;
      return priorityA - priorityB;
    });

    // Return in reverse chronological order (most recent first)
    const result = {};
    dateOrder.forEach(date => {
      result[date] = grouped[date];
    });

    return result;
  }

  /**
   * Get the last message from a specific speaker
   */
  getLastMessageFrom(speaker) {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].speaker === speaker) {
        return this.messages[i];
      }
    }
    return null;
  }

  /**
   * Get the last message NOT from a specific speaker
   * Only considers messages from "Today" to ensure we're responding to recent context
   */
  getLastMessageNotFrom(speaker) {
    // Iterate from the end (most recent) to find the last message from a friend
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i];

      // Skip messages from the specified speaker (e.g., "You")
      if (message.speaker === speaker) {
        continue;
      }

      // Only consider messages from "Today"
      const dateString = message.getDateString();

      if (dateString !== 'Today') {
        continue;
      }

      // Return the first (chronologically last) message that matches
      return message;
    }
    return null;
  }

  /**
   * Get who sent the last message
   */
  getLastMessageSender() {
    if (this.messages.length === 0) return null;
    return this.messages[this.messages.length - 1].speaker;
  }

  /**
   * Get enhanced context with analysis - PHASE 2 ENHANCED
   */
  getEnhancedContext() {
    const analysis = this.analyzer.analyze(this.messages);
    const summary = this.analyzer.getSummary();
    const metrics = this.computeMetrics(this.messages, analysis, summary);
    const dualAnalysis = this.analyzer.getDualAnalysis();

    // PHASE 2: Smart message selection for very long conversations
    let selectedMessages = this.messages;
    let smartSelectionUsed = false;

    if (this.smartSelector.needsSmartSelection(this.messages)) {
      console.log('🧠 [PHASE 2] Using smart message selection for long conversation');
      selectedMessages = this.smartSelector.selectRelevantMessages(this.messages, analysis, 30);
      smartSelectionUsed = true;
    }

    // PHASE 2: Topic change detection
    const topicChanges = this.smartSelector.detectTopicChanges(this.messages);

    // PHASE 2: Context quality validation
    const contextQuality = this.smartSelector.validateContextQuality(selectedMessages);

    console.log(`✅ [PHASE 2] Context quality: ${contextQuality.quality}`, contextQuality.issues);

    return {
      messages: this.messages.map(msg => msg.toJSON()),
      selectedMessages: selectedMessages.map(msg => msg.toJSON()), // PHASE 2: Selected messages
      analysis,
      summary,
      metrics,
      contextStrings: this.getContextStrings(),
      dualAnalysis,  // NEW: Add dual context analysis
      // PHASE 2 enhancements:
      smartSelection: {
        used: smartSelectionUsed,
        originalCount: this.messages.length,
        selectedCount: selectedMessages.length
      },
      topicChanges,
      contextQuality
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



