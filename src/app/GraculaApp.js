// Gracula Application
// Main application orchestrator

// console.log('🧛 [GRACULA APP CLASS] GraculaApp.js script loading...');

window.Gracula = window.Gracula || {};

// console.log('🧛 [GRACULA APP CLASS] Defining GraculaApp class...');

window.Gracula.GraculaApp = class {
  constructor() {
    this.platform = null;
    this.contextExtractor = null;
    this.floatingButton = null;
    this.modal = null;
    this.toneSelector = null;
    this.contextViewer = null;
    this.replyList = null;
    this.currentInputField = null;
    this.isInitialized = false;
    this.context = [];
    this.enhancedContext = null;
    this.isInserting = false;

    // NEW: Autocomplete components
    this.autocompleteDropdown = null;
    this.autocompleteManager = null;

    // NEW: Voice input component
    this.voiceInputManager = null;
  }

  /**
   * Initialize the application
   */
  async init() {
    // console.log('🧛 [GRACULA APP] init() called');

    if (this.isInitialized) {
      // console.log('⚠️ [GRACULA APP] Already initialized, skipping');
      return;
    }

    try {
      // Check if logger exists
      if (!window.Gracula?.logger) {
        // console.error('❌ [GRACULA APP] ERROR: window.Gracula.logger not found!');
        return;
      }

      // window.Gracula.logger.separator();
      // window.Gracula.logger.info('EXTENSION LOADED');
      // window.Gracula.logger.info('Version 2.0.0 - FSD Architecture');
      // window.Gracula.logger.info('Waiting for page to fully load...');
      // window.Gracula.logger.separator();

      // Check if detectPlatform exists
      if (!window.Gracula?.detectPlatform) {
        // console.error('❌ [GRACULA APP] ERROR: window.Gracula.detectPlatform not found!');
        return;
      }

      // Detect platform
      // console.log('🧛 [GRACULA APP] Detecting platform...');
      this.platform = window.Gracula.detectPlatform();

      if (!this.platform) {
        // window.Gracula.logger.warn('Platform not supported');
        // console.log('⚠️ [GRACULA APP] Current URL:', window.location.href);
        return;
      }

      // window.Gracula.logger.success(`Platform detected: ${this.platform.name}`);
      // console.log('✅ [GRACULA APP] Platform:', this.platform);

      // Check if ContextExtractor exists
      if (!window.Gracula?.ContextExtractor) {
        // console.error('❌ [GRACULA APP] ERROR: window.Gracula.ContextExtractor not found!');
        return;
      }

      // Initialize context extractor
      // console.log('🧛 [GRACULA APP] Creating ContextExtractor...');
      this.contextExtractor = new window.Gracula.ContextExtractor(this.platform);
      // console.log('✅ [GRACULA APP] ContextExtractor created');

      // Delay initialization to let page load
      setTimeout(() => {
        // console.log('🧛 [GRACULA APP] Starting delayed initialization...');
        // window.Gracula.logger.info('Starting initialization...');
        this.showLoadingNotification();
        this.observeInputFields();
        this.isInitialized = true;
        // console.log('✅ [GRACULA APP] Initialization complete');
      }, 3000);
    } catch (error) {
      // console.error('❌ [GRACULA APP] ERROR during init():', error);
      // console.error('❌ [GRACULA APP] Error stack:', error.stack);
    }
  }

  /**
   * Show loading notification
   */
  showLoadingNotification() {
    this.showNotification('🧛 <strong>Gracula AI</strong> is ready!', 'success');
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');

    // Determine background color based on type
    let background;
    switch (type) {
      case 'error':
        background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
        break;
      case 'success':
        background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        break;
      case 'warning':
        background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        break;
      default:
        background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    }

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${background};
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s ease;
      max-width: 400px;
    `;
    notification.innerHTML = message;

    setTimeout(() => {
      if (document.body) {
        document.body.appendChild(notification);
        setTimeout(() => notification.style.opacity = '1', 100);
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 300);
        }, type === 'error' ? 4000 : 2000); // Show errors longer
      }
    }, 100);
  }

  /**
   * Observe input fields
   */
  observeInputFields() {
    // window.Gracula.logger.info('Setting up input field detection...');

    // Initial checks with delays
    setTimeout(() => this.findAndAttachToInputField(), 1000);
    setTimeout(() => this.findAndAttachToInputField(), 2000);
    setTimeout(() => this.findAndAttachToInputField(), 4000);
    setTimeout(() => this.findAndAttachToInputField(), 6000);

    // Periodic polling
    setInterval(() => {
      if (!this.currentInputField || !document.body.contains(this.currentInputField)) {
        this.findAndAttachToInputField();
      }
    }, 3000);

    // window.Gracula.logger.info('Using lightweight polling for input detection');
  }

  /**
   * Find and attach to input field
   */
  findAndAttachToInputField() {
    if (!this.platform) return;

    const inputField = this.platform.findInputField();

    if (inputField && inputField !== this.currentInputField) {
      this.currentInputField = inputField;
      this.attachFloatingButton(inputField);
      // window.Gracula.logger.success('Attached to input field');
    }
  }

  /**
   * Attach floating button to input field
   */
  attachFloatingButton(inputField) {
    // Remove existing button
    if (this.floatingButton) {
      this.floatingButton.destroy();
    }

    // Create new button
    this.floatingButton = new window.Gracula.FloatingButton({
      inputField: inputField,
      onClick: () => this.handleButtonClick()
    });

    this.floatingButton.render();
    this.floatingButton.position(inputField);

    // Reposition on resize
    window.addEventListener('resize', () => {
      if (this.floatingButton) {
        this.floatingButton.updatePosition();
      }
    });

    // NEW: Attach autocomplete to input field
    this.attachAutocomplete(inputField);

    // NEW: Attach voice input to input field
    this.attachVoiceInput(inputField);

    // window.Gracula.logger.success('Floating button attached');
  }

  /**
   * NEW: Attach autocomplete to input field
   */
  attachAutocomplete(inputField) {
    // Remove existing autocomplete
    if (this.autocompleteManager) {
      this.autocompleteManager.destroy();
    }

    // Check if autocomplete classes exist
    if (!window.Gracula.AutocompleteDropdown || !window.Gracula.AutocompleteManager) {
      console.warn('🧛 Autocomplete: Classes not loaded yet');
      return;
    }

    // Create autocomplete manager first (we'll pass dropdown later)
    this.autocompleteManager = new window.Gracula.AutocompleteManager({
      inputField: inputField,
      contextExtractor: this.contextExtractor,
      autocompleteDropdown: null, // Will be set below
      onSuggestionSelect: (suggestion) => {
        // console.log('🧛 Autocomplete: Suggestion selected:', suggestion);
      }
    });

    // Create autocomplete dropdown with callback to manager's insertSuggestion
    this.autocompleteDropdown = new window.Gracula.AutocompleteDropdown({
      onSelect: (suggestion) => {
        // console.log('🔥🔥🔥 GraculaApp: onSelect callback triggered!');
        // console.log('🔥 Suggestion:', suggestion);
        // console.log('🔥 Manager exists?', !!this.autocompleteManager);
        // console.log('🔥 Manager.insertSuggestion exists?', typeof this.autocompleteManager?.insertSuggestion);

        if (this.autocompleteManager && typeof this.autocompleteManager.insertSuggestion === 'function') {
          this.autocompleteManager.insertSuggestion(suggestion);
        } else {
          console.error('❌ Cannot call insertSuggestion - manager or method not available');
        }
      },
      onDismiss: () => {
        console.log('🧛 Dropdown: Dismissed');
      }
    });

    // Now connect dropdown to manager
    this.autocompleteManager.autocompleteDropdown = this.autocompleteDropdown;

    // Start monitoring input
    this.autocompleteManager.start();

    console.log('✅ [GRACULA APP] Autocomplete attached to input field');
  }

  /**
   * NEW: Attach voice input to input field
   */
  attachVoiceInput(inputField) {
    // Remove existing voice input
    if (this.voiceInputManager) {
      this.voiceInputManager.destroy();
    }

    // Check if voice input class exists
    if (!window.Gracula.VoiceInputManager) {
      console.warn('🎤 Voice Input: Class not loaded yet');
      return;
    }

    // Create voice input manager
    this.voiceInputManager = new window.Gracula.VoiceInputManager({
      inputField: inputField,
      onTranscription: (text) => {
        console.log('🎤 Voice Input: Transcription received:', text);
      },
      onError: (error) => {
        console.error('🎤 Voice Input: Error:', error);

        // Check if it's an extension context error
        if (error.includes('Extension was reloaded') || error.includes('Extension connection lost')) {
          this.showNotification(
            '🔄 Extension was reloaded. Please <strong>refresh this page</strong> to continue using voice input.',
            'warning'
          );
        } else {
          // Show regular error notification
          this.showNotification(error, 'error');
        }
      }
    });

    // Start voice input
    this.voiceInputManager.start();

    console.log('✅ [GRACULA APP] Voice input attached to input field');
  }

  /**
   * Handle button click
   */
  async handleButtonClick() {
    // window.Gracula.logger.info('Button clicked - Opening modal');

    // Extract context (await the async operation)
    await this.extractContext();

    // Show modal
    this.showModal();
  }

  /**
   * Extract conversation context
   */
  async extractContext() {
    if (!this.contextExtractor) return;

    // Await the async extract() method
    const messages = await this.contextExtractor.extract();
    this.context = this.contextExtractor.getSimpleContext();
    this.enhancedContext = this.contextExtractor.getEnhancedContext();

    // window.Gracula.logger.success(`Context extracted: ${this.context.length} messages`);
  }

  /**
   * Show modal with tone selector
   */
  showModal() {
    // Close old modal if it exists
    if (this.modal) {
      this.modal.close();
      this.modal = null;
    }

    // Create widgets
    this.toneSelector = new window.Gracula.ToneSelector({
      onToneSelect: (tone) => this.handleToneSelection(tone)
    });

    this.contextViewer = new window.Gracula.ContextViewer({
      context: this.context,
      enhancedContext: this.enhancedContext,
      showEnhanced: true,
      onContextUpdate: (newContext) => {
        this.context = newContext;
        // window.Gracula.logger.info('Context manually updated');
      }
    });

    this.replyList = new window.Gracula.ReplyList({
      onInsert: (reply) => this.insertReply(reply),
      onCopy: (reply) => { /* Reply copied */ }
    });

    // Build modal content
    const content = `
      ${this.contextViewer.render()}
      ${this.toneSelector.render()}
      ${this.replyList.render()}
    `;

    // Create and show modal
    this.modal = new window.Gracula.Modal({
      onClose: () => { /* Modal closed */ }
    });

    this.modal.render(content);

    // Attach listeners
    const modalBody = this.modal.getBody();
    if (modalBody) {
      this.toneSelector.attachListeners(modalBody);
      this.contextViewer.attachListeners(modalBody);
    }

    // window.Gracula.logger.success('Modal opened');
  }

  /**
   * Handle tone selection
   * ENHANCED: Check cache first, only use API if useAI is enabled
   */
  async handleToneSelection(tone) {
    const modalBody = this.modal.getBody();
    if (!modalBody) return;

    // Show loading
    this.replyList.showLoading(modalBody);

    try {
      let replies = null;

      // Check if user wants to use AI
      if (!tone.useAI) {
        // Try to get cached responses first (NO API CALL)
        console.log('🔍 Checking cache for similar context...');
        const responseCache = window.Gracula.ResponseCache;
        const cachedReplies = responseCache?.get(this.context);

        if (cachedReplies && cachedReplies.length > 0) {
          console.log('✅ Using cached responses (NO API CALL)');
          replies = cachedReplies;
        } else {
          console.log('⚠️ No cached responses found. Enable "Use AI" to generate new suggestions.');
          throw new Error('No cached suggestions available. Enable "Use AI" toggle to generate new replies using the API.');
        }
      } else {
        // User explicitly wants AI - call API
        console.log('🤖 Calling API (user enabled AI)...');
        replies = await this.generateReplies(tone);

        // Cache the new responses for future use
        const responseCache = window.Gracula.ResponseCache;
        if (responseCache && replies && replies.length > 0) {
          responseCache.set(this.context, replies, { tone: tone.name });
          console.log('💾 Cached new responses for future use');
        }
      }

      // Display replies
      this.replyList.displayReplies(replies, modalBody);

    } catch (error) {
      console.error('Error:', error);

      let errorMessage = error.message;
      if (error.message.includes('API key')) {
        errorMessage = 'Please add your API key in the extension settings.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = error.message + ' Try using cached suggestions (disable "Use AI" toggle).';
      }

      this.replyList.showError(errorMessage, modalBody);
    }
  }

  /**
   * Generate replies using background script
   */
  async generateReplies(tone) {
    // Get selected mode from modal
    const modalBody = this.modal.getBody();
    const selectedMode = modalBody?.dataset?.selectedMode || 'reply';

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'generateReplies',
        tone: tone.toJSON(),
        context: this.context,
        enhancedContext: this.enhancedContext,
        responseMode: selectedMode  // NEW: Pass selected mode
      }, (response) => {
        if (response && response.success) {
          resolve(response.replies);
        } else {
          reject(new Error(response?.error || 'Unknown error'));
        }
      });
    });
  }

  /**
   * Insert reply into input field
   */
  insertReply(reply) {
    // Prevent duplicate inserts
    if (this.isInserting) {
      // window.Gracula.logger.warn('Insert already in progress');
      return;
    }

    if (!this.currentInputField) {
      // window.Gracula.logger.warn('No input field found');
      return;
    }

    this.isInserting = true;

    let field = this.currentInputField;

    if (this.platform && !this.platform.isEditableElement(field)) {
      const normalizedField = this.platform.normaliseInputElement(field);
      if (normalizedField) {
        this.currentInputField = normalizedField;
        field = normalizedField;
      }
    }

    const normalizedReply = reply || '';

    try {
      if (field.contentEditable === 'true') {
        field.focus();

        // Clear the field first
        field.innerHTML = '';

        // Create a text node with the reply
        const textNode = document.createTextNode(normalizedReply);
        field.appendChild(textNode);

        // Set cursor to end
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const range = document.createRange();
          range.setStart(textNode, normalizedReply.length);
          range.collapse(true);
          selection.addRange(range);
        }

        // Trigger input event for React/Vue to detect change
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          data: normalizedReply,
          inputType: 'insertText'
        });
        field.dispatchEvent(inputEvent);
      } else {
        const prototype = Object.getPrototypeOf(field);
        const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        if (valueSetter) {
          valueSetter.call(field, normalizedReply);
        } else {
          field.value = normalizedReply;
        }

        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        field.dispatchEvent(inputEvent);
      }

      // window.Gracula.logger.success('Reply inserted');
    } catch (error) {
      // window.Gracula.logger.error('Failed to insert reply:', error);
    } finally {
      // Close modal and reset flag
      if (this.modal) {
        this.modal.close();
        this.modal = null;
      }

      setTimeout(() => {
        this.isInserting = false;
      }, 300);
    }
  }
};

// console.log('✅ [GRACULA APP CLASS] GraculaApp class defined successfully');
// console.log('🧛 [GRACULA APP CLASS] Verifying class:', typeof window.Gracula.GraculaApp);

