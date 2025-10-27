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

    // NEW: Smart generation tracking
    this.isGenerating = false;
    this.generationMonitor = null;
    this.currentGenerationId = null;
    this.lastInsertedText = null;

    // Hot reload support
    this.setupHotReload();
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
   * SMART: Real-time message monitoring with auto-regenerate
   */
  async handleToneSelection(tone) {
    const modalBody = this.modal.getBody();
    if (!modalBody) return;

    // Cancel any ongoing generation
    if (this.isGenerating) {
      console.log('⚠️ Cancelling previous generation...');
      this.stopGenerationMonitor();
    }

    // Generate unique ID for this generation
    const generationId = Date.now();
    this.currentGenerationId = generationId;
    this.isGenerating = true;

    // Show enhanced loading with status
    this.showEnhancedLoading(modalBody, 'Extracting latest messages...');

    // Re-extract context to get the latest messages
    console.log('🔄 Re-extracting context to ensure latest messages...');
    await this.extractContext();

    // Capture current last message before generation
    const lastMessageBeforeGeneration = this.getLastMessage();
    const messageCountBefore = this.context.length;
    console.log('📸 Captured FRIEND\'s last message before generation:', lastMessageBeforeGeneration?.text?.substring(0, 50));
    console.log('   From:', lastMessageBeforeGeneration?.sender);
    console.log('   Total messages in context:', messageCountBefore);

    // Validate we have context to work with
    if (!this.context || this.context.length === 0) {
      console.error('❌ No context available for generation');
      this.replyList.showError('No conversation found. Please make sure you\'re in a chat.', modalBody);
      this.isGenerating = false;
      return;
    }

    if (!lastMessageBeforeGeneration || !lastMessageBeforeGeneration.text) {
      console.error('❌ No friend message found to respond to');
      this.replyList.showError('No message from your friend found. Please make sure there are messages in the chat.', modalBody);
      this.isGenerating = false;
      return;
    }

    // Start monitoring for new messages during generation
    this.startGenerationMonitor(lastMessageBeforeGeneration, messageCountBefore, tone, modalBody, generationId);

    try {
      let replies = null;

      // Check if user wants to use AI
      if (!tone.useAI) {
        // Try to get cached responses first (NO API CALL)
        console.log('🔍 Checking cache for similar context...');
        this.showEnhancedLoading(modalBody, 'Checking cache...');

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
        this.showEnhancedLoading(modalBody, 'Generating smart replies...');

        replies = await this.generateReplies(tone);

        // Check if this generation is still valid (not cancelled)
        if (this.currentGenerationId !== generationId) {
          console.log('⚠️ Generation cancelled (newer generation started)');
          return;
        }

        // Cache the new responses for future use
        const responseCache = window.Gracula.ResponseCache;
        if (responseCache && replies && replies.length > 0) {
          responseCache.set(this.context, replies, { tone: tone.name });
          console.log('💾 Cached new responses for future use');
        }
      }

      // Stop monitoring
      this.stopGenerationMonitor();
      this.isGenerating = false;

      // Final check if new messages arrived during generation
      await this.extractContext();
      const lastMessageAfterGeneration = this.getLastMessage();
      const messageCountAfter = this.context.length;
      const messagesChanged = this.hasMessagesChanged(lastMessageBeforeGeneration, lastMessageAfterGeneration);
      const newMessageCount = messageCountAfter - messageCountBefore;

      if (messagesChanged && newMessageCount > 0) {
        console.log(`⚠️ ${newMessageCount} new message(s) detected during generation!`);
        console.log('   Before:', lastMessageBeforeGeneration?.text?.substring(0, 50));
        console.log('   After:', lastMessageAfterGeneration?.text?.substring(0, 50));

        // Show warning with option to regenerate
        this.showNewMessageWarning(modalBody, tone, newMessageCount);
      }

      // Display replies
      this.replyList.displayReplies(replies, modalBody);

    } catch (error) {
      console.error('Error:', error);

      this.stopGenerationMonitor();
      this.isGenerating = false;

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
   * Show enhanced loading with status message
   */
  showEnhancedLoading(modalBody, statusMessage) {
    const loadingContainer = modalBody.querySelector('.gracula-loading');
    if (loadingContainer) {
      const statusEl = loadingContainer.querySelector('.loading-status');
      if (statusEl) {
        statusEl.textContent = statusMessage;
      } else {
        // Add status message
        const status = document.createElement('div');
        status.className = 'loading-status';
        status.style.cssText = `
          margin-top: 8px;
          font-size: 13px;
          color: #666;
          font-weight: 500;
        `;
        status.textContent = statusMessage;
        loadingContainer.appendChild(status);
      }
    }
  }

  /**
   * Start monitoring for new messages during generation
   */
  startGenerationMonitor(lastMessage, messageCount, tone, modalBody, generationId) {
    // Clear any existing monitor
    this.stopGenerationMonitor();

    console.log('👀 Starting real-time message monitor...');

    // Check every 2 seconds for new messages
    this.generationMonitor = setInterval(async () => {
      // Re-extract context
      await this.extractContext();

      const currentLastMessage = this.getLastMessage();
      const currentMessageCount = this.context.length;

      // Check if messages changed
      if (this.hasMessagesChanged(lastMessage, currentLastMessage)) {
        const newMessageCount = currentMessageCount - messageCount;
        console.log(`🔔 NEW MESSAGE DETECTED! (${newMessageCount} new messages)`);

        // Stop monitoring
        this.stopGenerationMonitor();

        // Check if this is still the active generation
        if (this.currentGenerationId === generationId) {
          // Show immediate notification
          this.showLiveUpdateNotification(modalBody, tone, newMessageCount);
        }
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * Stop generation monitor
   */
  stopGenerationMonitor() {
    if (this.generationMonitor) {
      clearInterval(this.generationMonitor);
      this.generationMonitor = null;
      console.log('👀 Stopped message monitor');
    }
  }

  /**
   * Show live update notification during generation
   */
  showLiveUpdateNotification(modalBody, tone, newMessageCount) {
    // Create live notification
    const notification = document.createElement('div');
    notification.className = 'gracula-live-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideInRight 0.3s ease-out;
      cursor: pointer;
      transition: transform 0.2s;
    `;

    notification.innerHTML = `
      <span style="font-size: 24px;">🔔</span>
      <div>
        <div style="font-weight: 600; font-size: 14px;">
          ${newMessageCount} new message${newMessageCount > 1 ? 's' : ''} received!
        </div>
        <div style="font-size: 12px; opacity: 0.9;">
          Click to regenerate with latest context
        </div>
      </div>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .gracula-live-notification:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Click to regenerate
    notification.addEventListener('click', async () => {
      notification.remove();
      console.log('🔄 Auto-regenerating with new context...');
      await this.handleToneSelection(tone);
    });
  }

  /**
   * Get the FRIEND's last message (not the user's own message)
   * This is what we should be responding to
   */
  getLastMessage() {
    if (!this.context || this.context.length === 0) return null;

    // Get the user's name from enhanced context
    const userName = this.enhancedContext?.summary?.userName || 'You';

    // Loop through messages from the end to find the friend's last message
    for (let i = this.context.length - 1; i >= 0; i--) {
      const msg = this.context[i];
      const sender = msg.sender || msg.speaker || 'Unknown';

      // Check if this message is NOT from the user
      const isUserMessage =
        sender === userName ||
        sender === 'You' ||
        sender.toLowerCase() === userName.toLowerCase() ||
        sender.toLowerCase() === 'you';

      if (!isUserMessage) {
        // This is the friend's message - return it
        return {
          text: msg.text || msg.message || '',
          timestamp: msg.timestamp || Date.now(),
          sender: sender
        };
      }
    }

    // Fallback: if no friend message found, return the last message
    const lastMsg = this.context[this.context.length - 1];
    return {
      text: lastMsg.text || lastMsg.message || '',
      timestamp: lastMsg.timestamp || Date.now(),
      sender: lastMsg.sender || lastMsg.speaker || 'Unknown'
    };
  }

  /**
   * Check if messages have changed
   */
  hasMessagesChanged(before, after) {
    if (!before || !after) return false;

    // Compare text content and timestamp
    return before.text !== after.text || before.timestamp !== after.timestamp;
  }

  /**
   * Show warning when new message arrives during generation
   */
  showNewMessageWarning(modalBody, tone, newMessageCount = 1) {
    // Remove any existing warning
    const existingWarning = modalBody.querySelector('.gracula-new-message-warning');
    if (existingWarning) {
      existingWarning.remove();
    }

    // Create warning banner
    const warningBanner = document.createElement('div');
    warningBanner.className = 'gracula-new-message-warning';
    warningBanner.style.cssText = `
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
      color: white;
      padding: 14px 18px;
      border-radius: 10px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
      animation: slideIn 0.3s ease-out, pulse 2s infinite;
    `;

    warningBanner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 22px;">⚠️</span>
        <div>
          <div style="font-weight: 600; font-size: 14px;">
            ${newMessageCount} new message${newMessageCount > 1 ? 's' : ''} received!
          </div>
          <div style="font-size: 12px; opacity: 0.9;">These replies may be outdated</div>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="gracula-dismiss-btn" style="
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
        ">
          Dismiss
        </button>
        <button class="gracula-regenerate-btn" style="
          background: rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: white;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        ">
          🔄 Regenerate
        </button>
      </div>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
        }
        50% {
          box-shadow: 0 4px 24px rgba(255, 107, 107, 0.6);
        }
      }
      .gracula-regenerate-btn:hover {
        background: rgba(255, 255, 255, 0.35) !important;
        transform: scale(1.05);
      }
      .gracula-dismiss-btn:hover {
        background: rgba(255, 255, 255, 0.25) !important;
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);

    // Insert at the top of modal body
    modalBody.insertBefore(warningBanner, modalBody.firstChild);

    // Add dismiss button listener
    const dismissBtn = warningBanner.querySelector('.gracula-dismiss-btn');
    dismissBtn.addEventListener('click', () => {
      warningBanner.remove();
    });

    // Add regenerate button listener
    const regenerateBtn = warningBanner.querySelector('.gracula-regenerate-btn');
    regenerateBtn.addEventListener('click', async () => {
      console.log('🔄 Regenerating with new context...');

      // Remove warning banner
      warningBanner.remove();

      // Regenerate replies
      await this.handleToneSelection(tone);
    });

    // Add keyboard shortcut (R key)
    const keyHandler = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        regenerateBtn.click();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);

    // Remove keyboard listener when banner is removed
    setTimeout(() => {
      document.removeEventListener('keydown', keyHandler);
    }, 10000);
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
   * Insert reply into input field with undo support
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

    // Save previous text for undo
    const previousText = field.contentEditable === 'true' ? field.textContent : field.value;
    this.lastInsertedText = {
      previous: previousText,
      inserted: normalizedReply,
      field: field
    };

    // Show undo notification
    this.showUndoNotification();

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

  /**
   * Setup hot reload listener for development
   */
  setupHotReload() {
    // Listen for extension updates ONLY when explicitly triggered by background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'hotReload') {
        console.log('🔥 Hot Reload: Extension updated, reinitializing Gracula...');
        this.cleanup();
        setTimeout(() => {
          this.init();
        }, 100);
      }
    });
  }

  /**
   * Cleanup all components before reinitializing
   */
  cleanup() {
    console.log('🧹 Cleaning up Gracula components...');

    // Remove floating button
    if (this.floatingButton?.button) {
      this.floatingButton.button.remove();
      this.floatingButton = null;
    }

    // Remove modal
    if (this.modal?.modal) {
      this.modal.modal.remove();
      this.modal = null;
    }

    // Remove voice button
    if (this.voiceInputManager?.voiceButton?.button) {
      this.voiceInputManager.voiceButton.button.remove();
    }

    // Remove recording indicator
    if (this.voiceInputManager?.recordingIndicator?.indicator) {
      this.voiceInputManager.recordingIndicator.indicator.remove();
    }

    // Cleanup voice input manager
    if (this.voiceInputManager) {
      this.voiceInputManager.cleanup?.();
      this.voiceInputManager = null;
    }

    // Remove autocomplete dropdown
    if (this.autocompleteDropdown?.dropdown) {
      this.autocompleteDropdown.dropdown.remove();
      this.autocompleteDropdown = null;
    }

    // Cleanup autocomplete manager
    if (this.autocompleteManager) {
      this.autocompleteManager.cleanup?.();
      this.autocompleteManager = null;
    }

    // Reset state
    this.isInitialized = false;
    this.currentInputField = null;

    console.log('✅ Cleanup complete');
  }
};

// console.log('✅ [GRACULA APP CLASS] GraculaApp class defined successfully');
// console.log('🧛 [GRACULA APP CLASS] Verifying class:', typeof window.Gracula.GraculaApp);

