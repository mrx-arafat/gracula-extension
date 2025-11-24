// Autocomplete Manager
// Handles input monitoring, debouncing, and suggestion generation

window.Gracula = window.Gracula || {};

window.Gracula.AutocompleteManager = class {
  constructor(options = {}) {
    this.inputField = options.inputField;
    this.contextExtractor = options.contextExtractor;
    this.autocompleteDropdown = options.autocompleteDropdown;
    this.onSuggestionSelect = options.onSuggestionSelect || (() => { });

    // Settings
    this.minChars = options.minChars || 2; // Minimum characters to trigger (reduced for faster response)
    this.debounceDelay = options.debounceDelay || 100; // ULTRA-FAST: reduced from 200ms to 100ms
    this.enabled = true;
    this.instantMode = options.instantMode !== false; // Enable instant predictions
    this.maxSuggestions = 6; // Increased from 3 to 6

    // NEW: Control-key trigger mode
    this.controlKeyPressed = false; // Track Control key state
    this.manualTriggerMode = true; // Enable manual-only triggering (Control key)

    // State
    this.debounceTimer = null;
    this.lastText = '';
    this.isGenerating = false;
    this.abortController = null;
    this.isInserting = false; // Flag to prevent dual insertion

    // NEW: Smart caching for instant responses (LRU cache)
    this.cache = new Map(); // Cache predictions by context + partial text
    this.cacheMaxSize = 50; // LRU cache size
    this.contextCache = null; // Cache extracted context
    this.lastContextUpdate = 0;
    this.contextCacheDuration = 10000; // Cache context for 10 seconds (increased from 5s)

    // NEW: Predictive pre-generation
    this.commonStarters = ['hi', 'hey', 'hello', 'yes', 'no', 'ok', 'okay', 'sure', 'thanks', 'thank'];
    this.preGeneratedSuggestions = new Map();

    // NEW: Offline suggestion system
    this.patternMatcher = null;
    this.useAI = false; // Will be loaded from config
    this.initializeOfflineSuggestions();
    this.loadAIConfig();

    // NEW: N-gram phrase predictor
    this.phrasePredictor = null;
    this.initializePhrasePredictor();

    // Listen for config updates from settings
    this.setupConfigListener();

    // Bind event handlers
    this.handleInput = this.handleInput.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  /**
   * Initialize offline suggestion system
   */
  initializeOfflineSuggestions() {
    if (window.Gracula.OfflineSuggestions && window.Gracula.OfflineSuggestions.PatternMatcher) {
      this.patternMatcher = new window.Gracula.OfflineSuggestions.PatternMatcher();
      console.log('⚡ Autocomplete: Offline suggestion system initialized');
    } else {
      console.warn('⚠️ Autocomplete: Offline suggestion system not loaded');
    }
  }

  /**
   * Initialize n-gram phrase predictor
   */
	  initializePhrasePredictor(retryCount = 0) {
	    try {
	      // If predictor class is available, initialize once and stop
	      if (window.Gracula && window.Gracula.PhrasePredictor) {
	        if (!this.phrasePredictor) {
	          this.phrasePredictor = new window.Gracula.PhrasePredictor();
	          console.log('⚡ Autocomplete: Phrase predictor initialized');
	        }
	        return;
	      }

	      // In some environments the script load order can race a bit.
	      // Retry a few times before giving up, to avoid noisy warnings.
	      const maxRetries = 5;
	      if (retryCount < maxRetries) {
	        if (retryCount === 0) {
	          console.log('⏳ Autocomplete: Phrase predictor not ready yet, retrying...');
	        }
	        setTimeout(() => this.initializePhrasePredictor(retryCount + 1), 500);
	      } else {
	        console.warn('⚠️ Autocomplete: Phrase predictor not available, continuing without n-gram predictions');
	      }
	    } catch (error) {
	      console.warn('⚠️ Autocomplete: Failed to initialize phrase predictor:', error?.message || error);
	    }
	  }

  /**
   * Load AI configuration from background
   */
  loadAIConfig() {
    try {
      chrome.runtime.sendMessage({ action: 'getApiConfig' }, (response) => {
        // Check for extension context invalidation
        if (chrome.runtime.lastError) {
          console.warn('🧛 Autocomplete: Extension context error, using offline mode:', chrome.runtime.lastError.message);
          this.useAI = false;
          return;
        }

        if (response && response.success && response.config) {
          // Treat useAIForAutosuggestions as the master switch for the entire feature
          // If false, disable everything (including offline suggestions)
          this.enabled = response.config.useAIForAutosuggestions !== false;
          this.useAI = this.enabled; // If enabled, try to use AI (fallback to offline happens elsewhere if API fails)

          console.log('🧛 Autocomplete: Feature is', this.enabled ? 'ENABLED' : 'DISABLED');
          if (!this.enabled) {
            this.autocompleteDropdown?.hide();
          }
        }
      });
    } catch (error) {
      console.warn('🧛 Autocomplete: Failed to load AI config, using offline mode:', error.message);
      this.useAI = false;
    }
  }

  /**
   * Setup listener for real-time config updates
   */
  setupConfigListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'configUpdated' && request.config) {
        const oldEnabled = this.enabled;

        // Treat useAIForAutosuggestions as the master switch
        this.enabled = request.config.useAIForAutosuggestions !== false;
        this.useAI = this.enabled;

        if (oldEnabled !== this.enabled) {
          console.log('🧛 Autocomplete: Feature updated to:', this.enabled ? 'ENABLED' : 'DISABLED');

          if (!this.enabled) {
            this.autocompleteDropdown?.hide();
            this.clearDebounce();
          } else {
            // Clear cache when re-enabled
            this.cache.clear();
            this.preGeneratedSuggestions.clear();

            // Pre-generate common suggestions if enabled
            if (this.inputField) {
              this.preGenerateCommonSuggestions();
            }
          }
        }
      }
    });
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
    this.inputField.addEventListener('keyup', this.handleKeyup, true);
    document.addEventListener('click', this.handleClickOutside);

    // NEW: Pre-generate suggestions for common starters (only if AI is enabled)
    if (this.useAI) {
      this.preGenerateCommonSuggestions();
    }

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
      this.inputField.removeEventListener('keyup', this.handleKeyup, true);
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

    // NEW: Skip automatic triggering if in manual mode and Control key not pressed
    if (this.manualTriggerMode && !this.controlKeyPressed) {
      console.log('⚠️ [INPUT] SKIPPING handleInput - manual mode, Control key not pressed');
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

    // NEW: Handle Control key press/release for toggle
    if (event.key === 'Control') {
      console.log('🔑 [MANAGER] Control key detected, dropdown visible:', this.autocompleteDropdown?.isVisible);

      if (this.autocompleteDropdown?.isVisible) {
        // Control pressed again while visible → hide (like Escape)
        console.log('✅ [MANAGER] Control pressed - HIDING dropdown');
        this.autocompleteDropdown.hide();
        this.controlKeyPressed = false;
      } else {
        // Control pressed while hidden → show INSTANTLY
        console.log('✅ [MANAGER] Control pressed - SHOWING autocomplete INSTANTLY');
        this.controlKeyPressed = true;

        // Clear any pending debounce for instant response
        this.clearDebounce();

        // Get current text and generate suggestions (AI or offline)
        const currentText = this.getInputText();

        if (currentText && currentText.trim().length >= this.minChars) {
          // If there's enough text, generate AI suggestions (wait for AI, don't show offline first)
          console.log('📝 [MANAGER] Generating AI suggestions for:', currentText);
          this.generateSuggestions(currentText, true); // forceAI = true for manual trigger
        } else {
          // If not enough text, show common starters
          console.log('📝 [MANAGER] Showing common starters');
          this.triggerInstantSuggestions();
        }
      }

      // Stop the event completely
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return;
    }

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

    console.log('⚠️ [MANAGER] No action taken for this key');
  }

  /**
   * Handle keyup events - reset Control key state
   */
  handleKeyup(event) {
    if (event.key === 'Control') {
      this.controlKeyPressed = false;
      console.log('🔍 [MANAGER] Control key released - state reset');
    }
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
   * @param {string} partialText - The text to generate suggestions for
   * @param {boolean} forceAI - If true, wait for AI suggestions instead of showing offline first (for manual Control key trigger)
   */
  async generateSuggestions(partialText, forceAI = false) {
    if (this.isGenerating) {
      // Cancel previous request
      this.abortController?.abort();
    }

    this.isGenerating = true;
    this.abortController = new AbortController();

    try {
      // console.log('🧛 Autocomplete: Generating suggestions for:', partialText);

      // NEW: Check cache first for instant response (LRU cache)
      const cacheKey = this.getCacheKey(partialText);
      if (this.cache.has(cacheKey)) {
        const cachedSuggestions = this.cache.get(cacheKey);
        // Move to end for LRU
        this.cache.delete(cacheKey);
        this.cache.set(cacheKey, cachedSuggestions);
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

      // NEW HYBRID MODE: Always show offline suggestions first (instant), then enhance with AI
      if (!this.useAI) {
        // Pure offline mode - use pattern matcher + n-gram predictor
        const suggestions = this.generateHybridSuggestions(partialText, simpleContext, analysis);

        if (suggestions && suggestions.length > 0) {
          this.addToCache(cacheKey, suggestions);
          this.autocompleteDropdown?.show(suggestions, this.inputField);
        } else {
          this.autocompleteDropdown?.hide();
        }

        // Learn from user's typing
        if (this.phrasePredictor) {
          this.phrasePredictor.learn(partialText);
        }

        this.isGenerating = false;
        return;
      }

      // AI is enabled - Check if we should wait for AI (Control key) or show hybrid first (automatic)
      if (forceAI) {
        // FORCE AI MODE: Wait for AI suggestions (used when Control key is pressed)
        console.log('🤖 [AI] Waiting for AI suggestions (manual trigger)...');
        this.autocompleteDropdown?.show([], this.inputField); // Show loading state

        const suggestions = await this.requestAutocompletions({
          partialText,
          analysis,
          context: simpleContext,
          enhancedContext
        });

        if (suggestions && suggestions.length > 0) {
          this.addToCache(cacheKey, suggestions);
          this.autocompleteDropdown?.show(suggestions, this.inputField);
          console.log('✅ [AI] AI suggestions received:', suggestions);

          // Learn from AI suggestions
          if (this.phrasePredictor) {
            suggestions.forEach(sugg => this.phrasePredictor.learn(sugg));
          }
        } else {
          console.log('⚠️ [AI] No AI suggestions, falling back to offline');
          // Fallback to offline if AI fails
          const hybridSuggestions = this.generateHybridSuggestions(partialText, simpleContext, analysis);
          if (hybridSuggestions && hybridSuggestions.length > 0) {
            this.autocompleteDropdown?.show(hybridSuggestions, this.inputField);
          } else {
            this.autocompleteDropdown?.hide();
          }
        }

        this.isGenerating = false;
        return;
      }

      // HYBRID MODE: show instant offline first, then enhance with AI (automatic typing)
      const hybridSuggestions = this.generateHybridSuggestions(partialText, simpleContext, analysis);
      if (hybridSuggestions && hybridSuggestions.length > 0) {
        // console.log('⚡ Autocomplete: Using HYBRID suggestions (instant)');
        this.autocompleteDropdown?.show(hybridSuggestions, this.inputField);

        // Fetch AI suggestions in background and merge/update
        this.fetchAISuggestionsInBackground(partialText, analysis, simpleContext, enhancedContext, hybridSuggestions);

        // Learn from user's typing
        if (this.phrasePredictor) {
          this.phrasePredictor.learn(partialText);
        }

        this.isGenerating = false;
        return;
      }

      // Call background script to generate completions (AI mode)
      const suggestions = await this.requestAutocompletions({
        partialText,
        analysis,
        context: simpleContext,
        enhancedContext
      });

      // Cache the results for next time (LRU)
      if (suggestions && suggestions.length > 0) {
        this.addToCache(cacheKey, suggestions);
        this.autocompleteDropdown?.show(suggestions, this.inputField);

        // Learn from AI suggestions too
        if (this.phrasePredictor) {
          suggestions.forEach(sugg => this.phrasePredictor.learn(sugg));
        }
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

    // Learn from user selection (for offline mode)
    if (this.patternMatcher && this.lastText) {
      this.patternMatcher.learnPattern(this.lastText, suggestion);
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
        console.log('✅ [INSERT] Using contenteditable insertion for Lexical editor');

        // Step 1: Focus the input field
        this.inputField.focus();
        console.log('✅ [INSERT] Input field focused');

        // Step 2: Select all existing text
        console.log('🔴 [INSERT] Selecting all text...');
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(this.inputField);
        selection.removeAllRanges();
        selection.addRange(range);
        console.log('✅ [INSERT] All text selected');

        // Step 3: Use execCommand to replace selection with new text
        // This works with Lexical because it simulates real typing
        console.log('🔴 [INSERT] Inserting suggestion via execCommand:', suggestion);

        // Small delay to ensure selection is processed
        setTimeout(() => {
          const success = document.execCommand('insertText', false, suggestion);
          console.log('✅ [INSERT] execCommand result:', success);
          console.log('📝 [INSERT] FINAL Text:', this.getInputText());
          console.log('📝 [INSERT] FINAL HTML:', this.inputField.innerHTML);

          // Move cursor to end
          setTimeout(() => {
            const sel = window.getSelection();
            const rng = document.createRange();
            rng.selectNodeContents(this.inputField);
            rng.collapse(false);
            sel.removeAllRanges();
            sel.addRange(rng);
            console.log('✅ [INSERT] Cursor moved to end');
          }, 10);
        }, 10);

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
   * Generate hybrid suggestions combining offline patterns + n-gram predictions
   * Returns 5 diverse, high-quality suggestions
   */
  generateHybridSuggestions(partialText, context, analysis) {
    const suggestions = [];
    const suggestionSet = new Set();

    // Helper to add unique suggestion with metadata
    const addSuggestion = (text, source, confidence) => {
      const key = text.toLowerCase().trim();
      if (!suggestionSet.has(key)) {
        suggestionSet.add(key);
        suggestions.push({ text, source, confidence });
      }
    };

    // 1. N-gram predictions (highest priority for continuations)
    if (this.phrasePredictor) {
      const ngramPredictions = this.phrasePredictor.predict(partialText, 5);
      ngramPredictions.forEach(pred => {
        const confidence = this.phrasePredictor.getConfidence(pred, partialText);
        addSuggestion(pred, 'ngram', confidence);
      });
    }

    // 2. Pattern matcher suggestions
    if (this.patternMatcher) {
      const patternSuggestions = this.patternMatcher.findSuggestions(partialText, context);
      patternSuggestions.forEach(sugg => {
        addSuggestion(sugg, 'pattern', 0.8);
      });
    }

    // 3. Context-aware instant predictions
    const instantPreds = this.getInstantPredictions(partialText, analysis, {});
    if (instantPreds && instantPreds.length > 0) {
      instantPreds.forEach(pred => {
        addSuggestion(pred, 'instant', 0.75);
      });
    }

    // Sort by confidence and ensure diversity
    suggestions.sort((a, b) => b.confidence - a.confidence);
    const diverse = this.ensureDiversity(suggestions);

    // Return top 5 with just the text (backward compatible)
    return diverse.slice(0, this.maxSuggestions).map(s => s.text);
  }

  /**
   * Ensure diversity in suggestions (avoid too similar results)
   */
  ensureDiversity(suggestions) {
    if (suggestions.length <= this.maxSuggestions) return suggestions;

    const diverse = [suggestions[0]]; // Always keep the best
    const minJaccardDistance = 0.4; // Require at least 40% difference

    for (let i = 1; i < suggestions.length; i++) {
      const candidate = suggestions[i];
      let isDifferent = true;

      // Check similarity with already selected suggestions
      for (const selected of diverse) {
        const similarity = this.calculateJaccardSimilarity(candidate.text, selected.text);
        if (similarity > minJaccardDistance) {
          isDifferent = false;
          break;
        }
      }

      if (isDifferent) {
        diverse.push(candidate);
      }

      if (diverse.length >= this.maxSuggestions) break;
    }

    return diverse;
  }

  /**
   * Calculate Jaccard similarity between two texts
   */
  calculateJaccardSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Add suggestion to LRU cache
   */
  addToCache(key, suggestions) {
    // Remove oldest if cache is full
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, suggestions);
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

    // Save phrase predictor data
    if (this.phrasePredictor) {
      this.phrasePredictor.save();
    }
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
   * ENHANCED: Get common phrase completions (NO API CALLS)
   * Now integrates with offline suggestions database
   */
  getCommonPhraseCompletions(partialText) {
    const text = partialText.toLowerCase().trim();
    const completions = [];

    // NEW: Try offline suggestions first if available
    if (this.patternMatcher) {
      const offlineSuggestions = this.patternMatcher.findSuggestions(text, []);
      if (offlineSuggestions && offlineSuggestions.length > 0) {
        return offlineSuggestions.slice(0, 3);
      }
    }

    // Fallback to hardcoded patterns
    // Greetings
    if (text.startsWith('h')) {
      if ('hello'.startsWith(text)) completions.push('hello');
      if ('hey'.startsWith(text)) completions.push('hey');
      if ('hi'.startsWith(text)) completions.push('hi');
      if ('how are you'.startsWith(text)) completions.push('how are you?');
      if ('hope you'.startsWith(text)) completions.push('hope you\'re doing well');
    }

    // Agreements
    if (text.startsWith('y')) {
      if ('yes'.startsWith(text)) completions.push('yes', 'yeah', 'yup');
      if ('you'.startsWith(text)) completions.push('you too', 'you\'re right', 'you\'re welcome');
    }

    // Common responses
    if (text.startsWith('t')) {
      if ('thanks'.startsWith(text)) completions.push('thanks', 'thank you', 'thanks a lot');
      if ('that'.startsWith(text)) completions.push('that\'s great', 'that sounds good', 'that works');
      if ('the'.startsWith(text)) completions.push('the same', 'the usual');
    }

    // Time-related
    if (text.startsWith('s')) {
      if ('see you'.startsWith(text)) completions.push('see you later', 'see you soon', 'see you tomorrow');
      if ('sounds'.startsWith(text)) completions.push('sounds good', 'sounds great', 'sounds perfect');
      if ('sure'.startsWith(text)) completions.push('sure', 'sure thing', 'sure, no problem');
    }

    // Confirmations
    if (text.startsWith('o')) {
      if ('ok'.startsWith(text)) completions.push('ok', 'okay', 'ok, got it');
      if ('on my way'.startsWith(text)) completions.push('on my way', 'on my way there');
    }

    // Questions
    if (text.startsWith('w')) {
      if ('what'.startsWith(text)) completions.push('what\'s up?', 'what time?', 'what do you think?');
      if ('when'.startsWith(text)) completions.push('when?', 'when are you free?', 'when should we meet?');
      if ('where'.startsWith(text)) completions.push('where?', 'where are you?', 'where should we meet?');
    }

    // Apologies
    if (text.startsWith('s')) {
      if ('sorry'.startsWith(text)) completions.push('sorry', 'sorry about that', 'sorry for the delay');
    }

    // Let me know
    if (text.startsWith('l')) {
      if ('let me'.startsWith(text)) completions.push('let me know', 'let me check', 'let me think');
      if ('looking forward'.startsWith(text)) completions.push('looking forward to it');
    }

    // I'm
    if (text.startsWith('i')) {
      if ('i\'m'.startsWith(text) || 'im'.startsWith(text)) {
        completions.push('I\'m good', 'I\'m on my way', 'I\'m free', 'I\'m busy');
      }
      if ('i can'.startsWith(text)) completions.push('I can do that', 'I can help');
      if ('i\'ll'.startsWith(text) || 'ill'.startsWith(text)) {
        completions.push('I\'ll be there', 'I\'ll let you know', 'I\'ll check');
      }
    }

    // No problem
    if (text.startsWith('n')) {
      if ('no'.startsWith(text)) completions.push('no problem', 'no worries', 'not sure');
    }

    // Got it
    if (text.startsWith('g')) {
      if ('got'.startsWith(text)) completions.push('got it', 'got it, thanks');
      if ('good'.startsWith(text)) completions.push('good', 'good idea', 'good to know');
    }

    // Perfect
    if (text.startsWith('p')) {
      if ('perfect'.startsWith(text)) completions.push('perfect', 'perfect, thanks');
    }

    // Alright
    if (text.startsWith('a')) {
      if ('alright'.startsWith(text)) completions.push('alright', 'alright, sounds good');
      if ('awesome'.startsWith(text)) completions.push('awesome', 'awesome, thanks');
    }

    return completions.slice(0, 3); // Return max 3
  }

  /**
   * Get instant predictions without API call (MIND-READING MODE - FOCUSED ON LAST MESSAGE)
   * ENHANCED: More patterns, smarter matching, NO API CALLS
   */
  getInstantPredictions(partialText, analysis, enhancedContext) {
    const textLower = partialText.toLowerCase().trim();

    // Check pre-generated suggestions first
    if (this.preGeneratedSuggestions.has(textLower)) {
      // console.log('⚡ Using pre-generated suggestion (INSTANT!)');
      return this.preGeneratedSuggestions.get(textLower);
    }

    const predictions = [];

    // ========================================
    // ENHANCED: Common phrase completions (NO API)
    // ========================================
    const commonPhrases = this.getCommonPhraseCompletions(partialText);
    if (commonPhrases.length > 0) {
      predictions.push(...commonPhrases);
    }

    // NEW: Get deep last message analysis
    const lastMsg = analysis.lastMessageContext;
    if (!lastMsg && predictions.length > 0) {
      // Return common phrases if we have them and no context
      return predictions.slice(0, 3);
    }

    if (!lastMsg) return null;

    // console.log('🎯 Focusing on last message:', lastMsg.content);

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
   * Fetch AI suggestions in background and merge with offline suggestions
   * ENHANCED: Merges AI with existing offline suggestions for best of both worlds
   */
  async fetchAISuggestionsInBackground(partialText, analysis, context, enhancedContext, existingOffline = []) {
    try {
      const aiSuggestions = await this.requestAutocompletions({
        partialText,
        analysis,
        context,
        enhancedContext
      });

      if (aiSuggestions && aiSuggestions.length > 0) {
        // Merge AI with offline suggestions
        const merged = this.mergeAIWithOffline(aiSuggestions, existingOffline);

        // Cache for next time (LRU)
        const cacheKey = this.getCacheKey(partialText);
        this.addToCache(cacheKey, merged);

        // Update dropdown if still visible and text hasn't changed
        const currentText = this.getInputText();
        if (currentText === partialText && this.autocompleteDropdown?.isVisible) {
          this.autocompleteDropdown.show(merged, this.inputField);
          // console.log('🤖 Updated with AI + offline merged suggestions');
        }

        // Learn from AI suggestions
        if (this.phrasePredictor) {
          aiSuggestions.forEach(sugg => this.phrasePredictor.learn(sugg));
        }
      }
    } catch (error) {
      // console.log('Background AI fetch failed:', error);
      // Offline suggestions already shown, no problem
    }
  }

  /**
   * Merge AI suggestions with offline suggestions intelligently
   * Returns top 5 best suggestions from both sources
   */
  mergeAIWithOffline(aiSuggestions, offlineSuggestions) {
    const combined = [];
    const seen = new Set();

    // Helper to add unique suggestions
    const addUnique = (text, source, score) => {
      const key = text.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({ text, source, score });
      }
    };

    // Add AI suggestions with high priority
    aiSuggestions.forEach(sugg => {
      addUnique(sugg, 'ai', 0.9);
    });

    // Add offline suggestions with medium priority
    offlineSuggestions.forEach(sugg => {
      addUnique(sugg, 'offline', 0.7);
    });

    // Sort by score and ensure diversity
    combined.sort((a, b) => b.score - a.score);
    const diverse = combined; // Already diverse from different sources

    // Return top 5 text only
    return diverse.slice(0, this.maxSuggestions).map(s => s.text);
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
