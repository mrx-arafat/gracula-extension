// Autocomplete Manager
// Handles input monitoring, debouncing, and suggestion generation

window.Gracula = window.Gracula || {};

window.Gracula.AutocompleteManager = class {
  constructor(options = {}) {
    this.inputField = options.inputField;
    this.contextExtractor = options.contextExtractor;
    this.autocompleteDropdown = options.autocompleteDropdown;
    this.onSuggestionSelect = options.onSuggestionSelect || (() => {});

    // Settings
    this.minChars = options.minChars || 2; // Minimum characters to trigger (reduced for faster response)
    this.debounceDelay = options.debounceDelay || 200; // SUPERFAST: reduced from 500ms to 200ms
    this.enabled = true;
    this.instantMode = options.instantMode !== false; // Enable instant predictions

    // State
    this.debounceTimer = null;
    this.lastText = '';
    this.isGenerating = false;
    this.abortController = null;
    this.isInserting = false; // Flag to prevent dual insertion

    // NEW: Smart caching for instant responses
    this.cache = new Map(); // Cache predictions by context + partial text
    this.contextCache = null; // Cache extracted context
    this.lastContextUpdate = 0;
    this.contextCacheDuration = 5000; // Cache context for 5 seconds

    // NEW: Predictive pre-generation
    this.commonStarters = ['hi', 'hey', 'hello', 'yes', 'no', 'ok', 'okay', 'sure', 'thanks', 'thank'];
    this.preGeneratedSuggestions = new Map();

    // Bind event handlers
    this.handleInput = this.handleInput.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  /**
   * Start monitoring input field
   */
  start() {
    if (!this.inputField) {
      // console.warn('🧛 Autocomplete: No input field provided');
      return;
    }

    // Add event listeners
    this.inputField.addEventListener('input', this.handleInput);
    // CRITICAL: Use capture:true to intercept Enter BEFORE WhatsApp
    this.inputField.addEventListener('keydown', this.handleKeydown, true);
    document.addEventListener('click', this.handleClickOutside);

    // NEW: Pre-generate suggestions for common starters
    this.preGenerateCommonSuggestions();

    // NEW: Update context cache periodically
    this.startContextCaching();

    // console.log('🧛 Autocomplete: Started monitoring input field (SUPERFAST MODE)');
  }

  /**
   * Stop monitoring input field
   */
  stop() {
    if (this.inputField) {
      this.inputField.removeEventListener('input', this.handleInput);
      // Remove with capture:true since we added with it
      this.inputField.removeEventListener('keydown', this.handleKeydown, true);
    }
    document.removeEventListener('click', this.handleClickOutside);

    this.clearDebounce();
    this.autocompleteDropdown?.hide();

    // console.log('🧛 Autocomplete: Stopped monitoring');
  }

  /**
   * Handle input event (typing)
   */
  handleInput(event) {
    console.log('🔵 [INPUT] handleInput triggered, currentText:', this.getInputText(), 'isInserting:', this.isInserting);

    if (!this.enabled) return;

    // Skip if we're in the middle of inserting a suggestion
    if (this.isInserting) {
      console.log('⚠️ [INPUT] SKIPPING handleInput - insertion in progress');
      return;
    }

    const currentText = this.getInputText();

    // Check if text has actually changed
    if (currentText === this.lastText) {
      console.log('⚠️ [INPUT] SKIPPING handleInput - text unchanged:', currentText);
      return;
    }

    console.log('✅ [INPUT] Text changed from:', this.lastText, 'to:', currentText);
    this.lastText = currentText;

    // Clear existing debounce timer
    this.clearDebounce();

    // Hide dropdown if text is too short
    if (currentText.trim().length < this.minChars) {
      this.autocompleteDropdown?.hide();
      return;
    }

    // Show loading state
    this.autocompleteDropdown?.show([], this.inputField);

    // Debounce: wait for user to stop typing
    this.debounceTimer = setTimeout(() => {
      this.generateSuggestions(currentText);
    }, this.debounceDelay);
  }

  /**
   * Handle keydown events
   * SIMPLIFIED: Let dropdown handle all keys when visible
   */
  handleKeydown(event) {
    console.log('🔍 [MANAGER] handleKeydown called:', {
      key: event.key,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      dropdownVisible: this.autocompleteDropdown?.isVisible
    });

    // If dropdown is visible, let it handle all keyboard events
    if (this.autocompleteDropdown?.isVisible) {
      console.log('✅ [MANAGER] Dropdown is visible, delegating to dropdown');
      const handled = this.autocompleteDropdown?.handleKeydown(event);

      console.log('🔍 [MANAGER] Dropdown handled:', handled);

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        console.log('✅ [MANAGER] Event prevented and stopped');
      } else {
        console.log('⚠️ [MANAGER] Event NOT handled by dropdown');
      }
      return;
    }

    // Ctrl+Space to trigger instant autocomplete (when dropdown is NOT visible)
    if (event.ctrlKey && event.code === 'Space') {
      event.preventDefault();
      event.stopPropagation();
      console.log('✅ [MANAGER] Ctrl+Space pressed - triggering instant suggestions');
      this.triggerInstantSuggestions();
      return;
    }

    console.log('⚠️ [MANAGER] No action taken for this key');
  }

  /**
   * Handle clicks outside dropdown
   */
  handleClickOutside(event) {
    if (!this.autocompleteDropdown?.isVisible) return;

    const dropdown = this.autocompleteDropdown.container;
    if (dropdown && !dropdown.contains(event.target) && event.target !== this.inputField) {
      this.autocompleteDropdown.hide();
    }
  }

  /**
   * Get current text from input field
   */
  getInputText() {
    if (!this.inputField) return '';

    if (this.inputField.contentEditable === 'true') {
      return this.inputField.textContent || '';
    } else {
      return this.inputField.value || '';
    }
  }

  /**
   * Generate autocomplete suggestions (SUPERFAST with caching)
   */
  async generateSuggestions(partialText) {
    if (this.isGenerating) {
      // Cancel previous request
      this.abortController?.abort();
    }

    this.isGenerating = true;
    this.abortController = new AbortController();

    try {
      // console.log('🧛 Autocomplete: Generating suggestions for:', partialText);

      // NEW: Check cache first for instant response
      const cacheKey = this.getCacheKey(partialText);
      if (this.cache.has(cacheKey)) {
        const cachedSuggestions = this.cache.get(cacheKey);
        // console.log('⚡ Autocomplete: Using CACHED suggestions (INSTANT)');
        this.autocompleteDropdown?.show(cachedSuggestions, this.inputField);
        this.isGenerating = false;
        return;
      }

      // NEW: Use cached context for speed
      const context = await this.getCachedContext();
      const simpleContext = this.contextExtractor?.getSimpleContext() || [];
      const enhancedContext = this.contextExtractor?.getEnhancedContext() || {};

      // Analyze partial text with smart prediction
      const analysis = this.analyzePartialText(partialText);

      // NEW: Try instant local predictions first
      const instantSuggestions = this.getInstantPredictions(partialText, analysis, enhancedContext);
      if (instantSuggestions && instantSuggestions.length > 0) {
        // console.log('⚡ Autocomplete: Using INSTANT predictions');
        this.autocompleteDropdown?.show(instantSuggestions, this.inputField);

        // Still fetch AI suggestions in background and update
        this.fetchAISuggestionsInBackground(partialText, analysis, simpleContext, enhancedContext);
        this.isGenerating = false;
        return;
      }

      // Call background script to generate completions
      const suggestions = await this.requestAutocompletions({
        partialText,
        analysis,
        context: simpleContext,
        enhancedContext
      });

      // Cache the results for next time
      if (suggestions && suggestions.length > 0) {
        this.cache.set(cacheKey, suggestions);
        this.autocompleteDropdown?.show(suggestions, this.inputField);
      } else {
        this.autocompleteDropdown?.hide();
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        // console.log('🧛 Autocomplete: Request aborted');
      } else {
        // console.error('🧛 Autocomplete: Error generating suggestions:', error);
        this.autocompleteDropdown?.hide();
      }
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Analyze partial text to understand what user is typing
   */
  analyzePartialText(text) {
    const trimmedText = text.trim();
    const words = trimmedText.split(/\s+/);
    const lastWord = words[words.length - 1] || '';

    // Detect intent patterns
    const isQuestion = /\b(what|when|where|who|why|how|ki|keno|kobe)\b/i.test(trimmedText);
    const isGreeting = /^(hi|hey|hello|hola|namaste|salam|assalam)/i.test(trimmedText);
    const isAgreement = /^(yes|yeah|yup|ok|okay|sure|hoo|thik)/i.test(trimmedText);
    const isDisagreement = /^(no|nah|nope|na)/i.test(trimmedText);

    // NEW: Deep analysis of last message for better context
    const lastMessageAnalysis = this.analyzeLastMessage();

    return {
      text: trimmedText,
      wordCount: words.length,
      lastWord,
      isQuestion,
      isGreeting,
      isAgreement,
      isDisagreement,
      endsWithPunctuation: /[.!?,]$/.test(trimmedText),
      isComplete: trimmedText.length > 10 && /[.!?]$/.test(trimmedText),
      // NEW: Include last message context
      lastMessageContext: lastMessageAnalysis
    };
  }

  /**
   * NEW: Deep analysis of the last message to focus replies
   * PRIORITY: Check for reply-to message first (user explicitly selected a message to reply to)
   */
  analyzeLastMessage() {
    // console.log('🔍 analyzeLastMessage called');

    // PRIORITY 1: Check if user is replying to a specific message (reply-to feature)
    const replyToMessage = this.detectReplyToMessage();
    if (replyToMessage && replyToMessage.text) {
      // console.log('🎯 Using REPLY-TO message as context:', replyToMessage);
      const content = replyToMessage.text;
      const contentLower = content.toLowerCase();

      // Analyze the replied-to message
      const analysis = {
        speaker: replyToMessage.sender,
        content,
        fullMessage: `${replyToMessage.sender}: ${content}`,
        isReplyTo: true, // Flag that this is a reply-to message

        // Question detection
        isQuestion: /\?/.test(content),
        questionType: this.detectQuestionType(contentLower),

        // Request detection
        isRequest: /\b(can you|could you|would you|please|help|need)\b/i.test(contentLower),
        requestType: this.detectRequestType(contentLower),

        // Sentiment
        isPositive: /\b(good|great|awesome|nice|love|happy|thanks|excited)\b/i.test(contentLower),
        isNegative: /\b(bad|terrible|sad|angry|hate|upset|frustrated|sorry)\b/i.test(contentLower),
        isUrgent: /\b(asap|urgent|quickly|now|immediately|jaldi|taratari)\b/i.test(contentLower),

        // Topic detection
        topics: this.extractTopics(contentLower),

        // Emotion
        emotion: this.detectEmotion(contentLower),

        // Requires response to specific thing
        requiresAnswer: /\b(what|when|where|who|why|how|ki|keno|kobe|tell me|let me know)\b/i.test(contentLower)
      };

      return analysis;
    }

    // PRIORITY 2: Fall back to last message in conversation
    const messages = this.contextExtractor?.getSimpleContext() || [];
    // console.log('🔍 Messages from contextExtractor:', messages);
    // console.log('🔍 Total messages:', messages.length);

    if (messages.length === 0) {
      // console.warn('⚠️ No messages found in context!');
      return null;
    }

    const lastMessage = messages[messages.length - 1] || '';
    // console.log('🔍 Last message:', lastMessage);

    const messageLower = lastMessage.toLowerCase();

    // Extract who sent it and what they said
    const match = lastMessage.match(/^(.+?):\s*(.+)$/);
    const speaker = match ? match[1] : 'Friend';
    const content = match ? match[2] : lastMessage;
    const contentLower = content.toLowerCase();

    // console.log('🔍 Parsed - Speaker:', speaker, 'Content:', content);

    // Deep message analysis
    const analysis = {
      speaker,
      content,
      fullMessage: lastMessage,

      // Question detection
      isQuestion: /\?/.test(content),
      questionType: this.detectQuestionType(contentLower),

      // Request detection
      isRequest: /\b(can you|could you|would you|please|help|need)\b/i.test(contentLower),
      requestType: this.detectRequestType(contentLower),

      // Sentiment
      isPositive: /\b(good|great|awesome|nice|love|happy|thanks|excited)\b/i.test(contentLower),
      isNegative: /\b(bad|terrible|sad|angry|hate|upset|frustrated|sorry)\b/i.test(contentLower),
      isUrgent: /\b(asap|urgent|quickly|now|immediately|jaldi|taratari)\b/i.test(contentLower),

      // Topic detection
      topics: this.extractTopics(contentLower),

      // Emotion
      emotion: this.detectEmotion(contentLower),

      // Requires response to specific thing
      requiresAnswer: /\b(what|when|where|who|why|how|ki|keno|kobe|tell me|let me know)\b/i.test(contentLower)
    };

    return analysis;
  }

  /**
   * Detect question type
   */
  detectQuestionType(text) {
    if (/\b(what|ki)\b/i.test(text)) return 'what';
    if (/\b(when|kobe)\b/i.test(text)) return 'when';
    if (/\b(where|kothay)\b/i.test(text)) return 'where';
    if (/\b(who|ke)\b/i.test(text)) return 'who';
    if (/\b(why|keno)\b/i.test(text)) return 'why';
    if (/\b(how|kivabe)\b/i.test(text)) return 'how';
    return 'yes-no';
  }

  /**
   * Detect request type
   */
  detectRequestType(text) {
    if (/\b(help|assist|support)\b/i.test(text)) return 'help';
    if (/\b(send|share|give)\b/i.test(text)) return 'send';
    if (/\b(call|phone|ring)\b/i.test(text)) return 'call';
    if (/\b(meet|see|visit)\b/i.test(text)) return 'meet';
    if (/\b(do|make|create)\b/i.test(text)) return 'action';
    return 'general';
  }

  /**
   * Extract topics from message
   */
  extractTopics(text) {
    const topics = [];

    // Time-related
    if (/\b(today|tonight|tomorrow|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(text)) {
      topics.push('time');
    }

    // Location-related
    if (/\b(here|there|place|location|address|restaurant|cafe|home|office)\b/i.test(text)) {
      topics.push('location');
    }

    // Work-related
    if (/\b(work|job|project|meeting|deadline|task|office)\b/i.test(text)) {
      topics.push('work');
    }

    // Social
    if (/\b(party|dinner|lunch|movie|hangout|meet|friends)\b/i.test(text)) {
      topics.push('social');
    }

    // Help-related
    if (/\b(help|problem|issue|stuck|confused|question)\b/i.test(text)) {
      topics.push('help');
    }

    return topics;
  }

  /**
   * Detect emotion in message
   */
  detectEmotion(text) {
    if (/\b(excited|amazing|awesome|love it|can't wait)\b|!{2,}|😍|🤩|🎉/i.test(text)) return 'excited';
    if (/\b(happy|good|great|nice|wonderful)\b|😊|😄|😁/i.test(text)) return 'happy';
    if (/\b(sad|down|depressed|unhappy)\b|😢|😭|😔/i.test(text)) return 'sad';
    if (/\b(angry|mad|furious|pissed)\b|😠|😡|🤬/i.test(text)) return 'angry';
    if (/\b(worried|concerned|anxious|nervous)\b|😰|😟|😥/i.test(text)) return 'worried';
    if (/\b(thanks|thank you|grateful|appreciate)\b|🙏|❤️/i.test(text)) return 'grateful';
    if (/\b(confused|lost|unsure|don't understand)\b|🤔|😕/i.test(text)) return 'confused';
    return 'neutral';
  }

  /**
   * Detect if user is replying to a specific message (WhatsApp reply-to feature)
   * Returns the message being replied to, or null
   */
  detectReplyToMessage() {
    try {
      // WhatsApp Web: Look for the reply preview bar above the input
      // The structure is typically: <div class="..." data-quoted-message-id="...">
      const replyPreview = document.querySelector('[data-quoted-message-id], [class*="quoted"], [class*="reply-preview"]');

      if (replyPreview) {
        // Try to extract the quoted message text
        const quotedText = replyPreview.querySelector('[class*="quoted-text"], [class*="copyable-text"]');
        const quotedSender = replyPreview.querySelector('[class*="quoted-author"], [class*="quoted-sender"]');

        if (quotedText) {
          const messageText = quotedText.textContent || quotedText.innerText || '';
          const senderName = quotedSender ? (quotedSender.textContent || quotedSender.innerText || 'Someone') : 'Someone';

          // console.log('🎯 Reply-To detected:', { sender: senderName, message: messageText });

          return {
            text: messageText.trim(),
            sender: senderName.trim(),
            isReplyTo: true
          };
        }
      }

      return null;
    } catch (error) {
      // console.error('Error detecting reply-to message:', error);
      return null;
    }
  }

  /**
   * Request autocompletions from background script
   */
  async requestAutocompletions(data) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'generateAutocompletions',
        partialText: data.partialText,
        analysis: data.analysis,
        context: data.context,
        enhancedContext: data.enhancedContext
      }, (response) => {
        if (response && response.success) {
          resolve(response.suggestions);
        } else {
          reject(new Error(response?.error || 'Unknown error'));
        }
      });
    });
  }

  /**
   * Insert selected suggestion - REWRITTEN to work with Lexical editor
   */
  insertSuggestion(suggestion) {
    console.log('🔥🔥🔥 [INSERT] insertSuggestion CALLED with:', suggestion);

    if (!this.inputField) {
      console.error('❌ [INSERT] No input field!');
      return;
    }

    try {
      console.log('✅ [INSERT] Starting insertion process...');
      console.log('📝 [INSERT] Suggestion to insert:', suggestion);
      console.log('📝 [INSERT] Current input text BEFORE:', this.getInputText());
      console.log('📝 [INSERT] Input field type:', this.inputField.contentEditable === 'true' ? 'contenteditable' : 'regular');

      // CRITICAL: Set flag FIRST, before anything else
      this.isInserting = true;
      console.log('🚩 [INSERT] isInserting flag set to TRUE');

      // CRITICAL: Update lastText IMMEDIATELY to the suggestion we're about to insert
      this.lastText = suggestion;
      console.log('🚩 [INSERT] lastText updated to:', this.lastText);

      // Hide dropdown BEFORE insertion
      this.autocompleteDropdown?.hide();
      console.log('✅ [INSERT] Dropdown hidden');

      if (this.inputField.contentEditable === 'true') {
        // For contenteditable elements (WhatsApp with Lexical editor)
        // NEW APPROACH: Simulate Ctrl+A then type (like a real user)

        console.log('✅ [INSERT] Using keyboard simulation for Lexical editor');

        // Step 1: Focus the input field
        this.inputField.focus();
        console.log('✅ [INSERT] Input field focused');

        // Step 2: Simulate Ctrl+A (Select All) using keyboard events
        console.log('🔴 [INSERT] Simulating Ctrl+A to select all text...');

        const selectAllEvent = new KeyboardEvent('keydown', {
          key: 'a',
          code: 'KeyA',
          keyCode: 65,
          which: 65,
          ctrlKey: true,
          bubbles: true,
          cancelable: true
        });

        this.inputField.dispatchEvent(selectAllEvent);
        console.log('✅ [INSERT] Dispatched Ctrl+A event');

        // Small delay to let Lexical process the selection
        setTimeout(() => {
          console.log('📝 [INSERT] Text after Ctrl+A:', this.getInputText());

          // Step 3: Now type the new text (this will replace the selection)
          console.log('🔴 [INSERT] Inserting text via execCommand:', suggestion);
          const insertSuccess = document.execCommand('insertText', false, suggestion);

          console.log('✅ [INSERT] execCommand insertText result:', insertSuccess);
          console.log('📝 [INSERT] FINAL Text AFTER insertion:', this.getInputText());
          console.log('📝 [INSERT] FINAL HTML:', this.inputField.innerHTML);

          // Step 4: Move cursor to end
          setTimeout(() => {
            const sel = window.getSelection();
            const rng = document.createRange();
            rng.selectNodeContents(this.inputField);
            rng.collapse(false); // Collapse to end
            sel.removeAllRanges();
            sel.addRange(rng);

            console.log('✅ [INSERT] Cursor moved to end');
          }, 10);
        }, 50); // 50ms delay for Lexical to process Ctrl+A

      } else {
        // For regular input/textarea elements
        console.log('✅ [INSERT] Using regular input/textarea insertion');
        const prototype = Object.getPrototypeOf(this.inputField);
        const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

        if (valueSetter) {
          valueSetter.call(this.inputField, suggestion);
        } else {
          this.inputField.value = suggestion;
        }

        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        this.inputField.dispatchEvent(inputEvent);
        console.log('✅ [INSERT] Input event dispatched');
      }

      // Callback
      this.onSuggestionSelect(suggestion);
      console.log('✅ [INSERT] onSuggestionSelect callback called');

      console.log('✅✅✅ [INSERT] Insertion complete!');

      // Reset flag after a delay
      setTimeout(() => {
        this.isInserting = false;
        console.log('🚩 [INSERT] isInserting flag reset to FALSE');
      }, 300);
    } catch (error) {
      console.error('❌❌❌ [INSERT] Error inserting suggestion:', error);
      this.isInserting = false;
    }
  }

  /**
   * Clear debounce timer
   */
  clearDebounce() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Enable autocomplete
   */
  enable() {
    this.enabled = true;
    // console.log('🧛 Autocomplete: Enabled');
  }

  /**
   * Disable autocomplete
   */
  disable() {
    this.enabled = false;
    this.autocompleteDropdown?.hide();
    this.clearDebounce();
    // console.log('🧛 Autocomplete: Disabled');
  }

  /**
   * Destroy autocomplete manager
   */
  destroy() {
    this.stop();
    this.autocompleteDropdown?.destroy();
    this.inputField = null;
    this.contextExtractor = null;
    this.cache.clear();
    this.preGeneratedSuggestions.clear();
  }

  // ========================================
  // NEW: SUPERFAST INSTANT PREDICTION METHODS
  // ========================================

  /**
   * Get cache key for suggestions
   */
  getCacheKey(partialText) {
    const lastMessages = this.contextExtractor?.getSimpleContext()?.slice(-2).join('|') || '';
    return `${lastMessages}::${partialText.toLowerCase().trim()}`;
  }

  /**
   * Get cached context (avoid re-extraction)
   */
  async getCachedContext() {
    const now = Date.now();
    if (this.contextCache && (now - this.lastContextUpdate) < this.contextCacheDuration) {
      return this.contextCache;
    }

    const context = await this.contextExtractor?.extract() || [];
    this.contextCache = context;
    this.lastContextUpdate = now;
    return context;
  }

  /**
   * Start context caching (proactive updates)
   */
  startContextCaching() {
    // Update context every 3 seconds proactively
    this.contextCacheInterval = setInterval(async () => {
      await this.getCachedContext();
    }, 3000);
  }

  /**
   * Pre-generate suggestions for common starters
   */
  async preGenerateCommonSuggestions() {
    // console.log('⚡ Autocomplete: Pre-generating common suggestions...');

    for (const starter of this.commonStarters) {
      setTimeout(async () => {
        try {
          const context = await this.getCachedContext();
          const simpleContext = this.contextExtractor?.getSimpleContext() || [];
          const enhancedContext = this.contextExtractor?.getEnhancedContext() || {};
          const analysis = this.analyzePartialText(starter);

          const suggestions = await this.requestAutocompletions({
            partialText: starter,
            analysis,
            context: simpleContext,
            enhancedContext
          });

          if (suggestions && suggestions.length > 0) {
            this.preGeneratedSuggestions.set(starter.toLowerCase(), suggestions);
            // console.log(`⚡ Pre-generated suggestions for: "${starter}"`);
          }
        } catch (error) {
          // console.log(`Failed to pre-generate for "${starter}"`);
        }
      }, Math.random() * 2000); // Stagger requests
    }
  }

  /**
   * Get instant predictions without API call (MIND-READING MODE - FOCUSED ON LAST MESSAGE)
   */
  getInstantPredictions(partialText, analysis, enhancedContext) {
    const textLower = partialText.toLowerCase().trim();

    // Check pre-generated suggestions first
    if (this.preGeneratedSuggestions.has(textLower)) {
      // console.log('⚡ Using pre-generated suggestion (INSTANT!)');
      return this.preGeneratedSuggestions.get(textLower);
    }

    // NEW: Get deep last message analysis
    const lastMsg = analysis.lastMessageContext;
    if (!lastMsg) return null;

    // console.log('🎯 Focusing on last message:', lastMsg.content);

    const predictions = [];

    // ========================================
    // PRIORITY 1: Reply to LAST MESSAGE Question
    // ========================================
    if (lastMsg.isQuestion) {
      // console.log('🎯 Last message is a QUESTION:', lastMsg.questionType);

      switch (lastMsg.questionType) {
        case 'what':
          predictions.push(
            `${partialText}, it's about ${lastMsg.topics[0] || 'this'}`,
            `${partialText}, let me explain`,
            `${partialText}, not sure yet`
          );
          break;

        case 'when':
          if (analysis.isAgreement) {
            predictions.push(
              `${partialText}, tomorrow`,
              `${partialText}, tonight`,
              `${partialText}, this weekend`
            );
          } else {
            predictions.push(
              `${partialText} tomorrow?`,
              `${partialText} tonight?`,
              `${partialText} this weekend?`
            );
          }
          break;

        case 'where':
          if (analysis.isAgreement) {
            predictions.push(
              `${partialText}, usual place`,
              `${partialText}, that cafe`,
              `${partialText}, my place`
            );
          } else {
            predictions.push(
              `${partialText} usual place?`,
              `${partialText} that cafe?`,
              `${partialText} my place?`
            );
          }
          break;

        case 'why':
          predictions.push(
            `${partialText} it's better`,
            `${partialText}, let me explain`,
            `${partialText}, not sure`
          );
          break;

        case 'how':
          predictions.push(
            `${partialText}, pretty straightforward`,
            `${partialText}, I'll show you`,
            `${partialText}, I can help`
          );
          break;

        case 'yes-no':
          if (analysis.isAgreement) {
            predictions.push(
              `${partialText}, definitely`,
              `${partialText}, sounds good`,
              `${partialText}, I'm in`
            );
          } else if (analysis.isDisagreement) {
            predictions.push(
              `${partialText}, I don't think so`,
              `${partialText}, maybe later`,
              `${partialText}, not this time`
            );
          }
          break;
      }
    }

    // ========================================
    // PRIORITY 2: Reply to LAST MESSAGE Request
    // ========================================
    else if (lastMsg.isRequest) {
      // console.log('🎯 Last message is a REQUEST:', lastMsg.requestType);

      if (analysis.isAgreement) {
        switch (lastMsg.requestType) {
          case 'help':
            predictions.push(
              `${partialText}, happy to help`,
              `${partialText}, I got you`,
              `${partialText}, let me help`
            );
            break;

          case 'send':
            predictions.push(
              `${partialText}, sending now`,
              `${partialText}, I'll share it`,
              `${partialText}, on it`
            );
            break;

          case 'call':
            predictions.push(
              `${partialText}, calling soon`,
              `${partialText}, I'll call`,
              `${partialText}, give me a sec`
            );
            break;

          case 'meet':
            predictions.push(
              `${partialText}, let's meet`,
              `${partialText}, when works?`,
              `${partialText}, where to?`
            );
            break;

          default:
            predictions.push(
              `${partialText}, I can do that`,
              `${partialText}, no problem`,
              `${partialText}, done`
            );
        }
      } else if (analysis.isDisagreement) {
        predictions.push(
          `${partialText}, can't right now`,
          `${partialText}, maybe later`,
          `${partialText}, not this time`
        );
      }
    }

    // ========================================
    // PRIORITY 3: Reply to LAST MESSAGE Sentiment
    // ========================================
    else if (lastMsg.emotion !== 'neutral') {
      // console.log('🎯 Last message has EMOTION:', lastMsg.emotion);

      switch (lastMsg.emotion) {
        case 'excited':
          predictions.push(
            `${partialText}! Me too!`,
            `${partialText}, awesome!`,
            `${partialText}! Can't wait!`
          );
          break;

        case 'happy':
          predictions.push(
            `${partialText}! That's great!`,
            `${partialText}, happy for you!`,
            `${partialText}! Love it!`
          );
          break;

        case 'sad':
          predictions.push(
            `${partialText}, I'm sorry`,
            `${partialText}, hope it gets better`,
            `${partialText}, here if you need me`
          );
          break;

        case 'angry':
          predictions.push(
            `${partialText}, I understand`,
            `${partialText}, that's frustrating`,
            `${partialText}, let's fix this`
          );
          break;

        case 'grateful':
          predictions.push(
            `${partialText}, you're welcome!`,
            `${partialText}, happy to help!`,
            `${partialText}, anytime!`
          );
          break;

        case 'confused':
          predictions.push(
            `${partialText}, let me explain`,
            `${partialText}, it's simple`,
            `${partialText}, here's how`
          );
          break;
      }
    }

    // ========================================
    // PRIORITY 4: Generic greeting responses
    // ========================================
    else if (analysis.isGreeting) {
      predictions.push(
        `${partialText}! How are you?`,
        `${partialText} there! What's up?`,
        `${partialText}! Good to hear from you`
      );
    }

    // ========================================
    // PRIORITY 5: Topic-based responses
    // ========================================
    else if (lastMsg.topics.length > 0) {
      const topic = lastMsg.topics[0];
      // console.log('🎯 Responding to TOPIC:', topic);

      switch (topic) {
        case 'time':
          predictions.push(
            `${partialText}, tomorrow works for me`,
            `${partialText}, how about this weekend?`,
            `${partialText}, tonight if you're free`
          );
          break;

        case 'location':
          predictions.push(
            `${partialText}, the usual place?`,
            `${partialText}, where did you have in mind?`,
            `${partialText}, let's meet at that cafe`
          );
          break;

        case 'work':
          predictions.push(
            `${partialText}, let me check my schedule`,
            `${partialText}, I can help with that project`,
            `${partialText}, when's the deadline?`
          );
          break;

        case 'social':
          predictions.push(
            `${partialText}, sounds fun! I'm in!`,
            `${partialText}, who else is coming?`,
            `${partialText}, what time were you thinking?`
          );
          break;
      }
    }

    // ========================================
    // FALLBACK: Generic smart completions if no match
    // ========================================
    if (predictions.length === 0) {
      // For yes/no questions, provide simple answers
      if (lastMsg.isQuestion && lastMsg.questionType === 'yes-no') {
        if (textLower.startsWith('y')) {
          predictions.push(
            `${partialText}, definitely`,
            `${partialText}, for sure`,
            `${partialText}, absolutely`
          );
        } else if (textLower.startsWith('n')) {
          predictions.push(
            `${partialText}, not really`,
            `${partialText}, maybe later`,
            `${partialText}, I don't think so`
          );
        }
      }

      // For short inputs (1-2 letters), suggest common continuations
      if (textLower.length <= 2 && predictions.length === 0) {
        const commonContinuations = {
          'o': ['ok', 'ok, sounds good', 'oh, I see'],
          'y': ['yes', 'yes, definitely', 'yeah, sure'],
          'n': ['no', 'no, thanks', 'not really'],
          't': ['thanks', 'that works', 'tomorrow'],
          's': ['sure', 'sounds good', 'sorry'],
          'g': ['good', 'got it', 'great'],
          'i': ['I understand', 'I can help', 'I see'],
          'w': ['when?', 'where?', 'what time?']
        };

        if (commonContinuations[textLower]) {
          return commonContinuations[textLower];
        }
      }
    }

    // Return predictions if we generated any
    return predictions.length >= 3 ? predictions : null;
  }

  /**
   * Fetch AI suggestions in background and update dropdown
   */
  async fetchAISuggestionsInBackground(partialText, analysis, context, enhancedContext) {
    try {
      const suggestions = await this.requestAutocompletions({
        partialText,
        analysis,
        context,
        enhancedContext
      });

      if (suggestions && suggestions.length > 0) {
        // Cache for next time
        const cacheKey = this.getCacheKey(partialText);
        this.cache.set(cacheKey, suggestions);

        // Update dropdown if still visible and text hasn't changed
        const currentText = this.getInputText();
        if (currentText === partialText && this.autocompleteDropdown?.isVisible) {
          this.autocompleteDropdown.show(suggestions, this.inputField);
          // console.log('⚡ Updated with AI suggestions');
        }
      }
    } catch (error) {
      // console.log('Background AI fetch failed:', error);
    }
  }

  /**
   * Trigger instant suggestions (Ctrl+Space)
   */
  async triggerInstantSuggestions() {
    const currentText = this.getInputText();

    if (!currentText || currentText.length < 1) {
      // Show common starters when input is empty
      const commonSuggestions = [
        'Hey! How are you?',
        'Hi there! What\'s up?',
        'Hello! Good to hear from you'
      ];
      this.autocompleteDropdown?.show(commonSuggestions, this.inputField);
      return;
    }

    // Force generation without debounce
    this.clearDebounce();
    await this.generateSuggestions(currentText);
  }
};
