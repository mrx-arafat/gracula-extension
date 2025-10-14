// Gracula Content Script - Main Logic

class GraculaAssistant {
  constructor() {
    this.config = window.GRACULA_CONFIG;
    this.currentPlatform = null;
    this.currentInputField = null;
    this.floatingButton = null;
    this.modal = null;
    this.isInitialized = false;
    this.conversationContext = [];
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;

    console.log('🧛 Gracula: ========================================');
    console.log('🧛 Gracula: EXTENSION LOADED');
    console.log('🧛 Gracula: Version 1.0.0 - Performance Optimized');
    console.log('🧛 Gracula: Waiting for page to fully load...');
    console.log('🧛 Gracula: ========================================');

    this.detectPlatform();

    if (this.currentPlatform) {
      console.log(`🧛 Gracula: ✅ Detected platform - ${this.currentPlatform.name}`);

      // DELAY initialization to let WhatsApp load first
      // This prevents hanging/freezing
      setTimeout(() => {
        console.log('🧛 Gracula: Starting initialization...');
        this.showLoadingNotification();
        this.observeInputFields();
        this.isInitialized = true;
      }, 3000); // Wait 3 seconds for WhatsApp to load

    } else {
      console.log('🧛 Gracula: ⚠️ Platform not supported:', window.location.hostname);
    }
  }

  showLoadingNotification() {
    // Show a brief, non-intrusive notification
    console.log('🧛 Gracula: ✅ Ready! Look for the purple button.');

    // Small notification that doesn't block anything
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
      z-index: 2147483647;
      font-family: Arial, sans-serif;
      font-size: 12px;
      font-weight: bold;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    notification.innerHTML = '🧛 Gracula Ready';

    // Use setTimeout to avoid blocking
    setTimeout(() => {
      if (document.body) {
        document.body.appendChild(notification);
        setTimeout(() => notification.style.opacity = '1', 100);
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => notification.remove(), 300);
        }, 2000);
      }
    }, 100);
  }

  detectPlatform() {
    const hostname = window.location.hostname;
    
    for (const [key, platform] of Object.entries(this.config.platforms)) {
      const domains = Array.isArray(platform.domain) ? platform.domain : [platform.domain];
      if (domains.some(domain => hostname.includes(domain))) {
        this.currentPlatform = platform;
        return;
      }
    }
  }

  observeInputFields() {
    console.log('🧛 Gracula: Setting up input field detection...');

    // DISABLE MutationObserver - it causes WhatsApp to hang!
    // Instead, use simple polling with setInterval

    // Initial checks with delays
    setTimeout(() => this.findAndAttachToInputField(), 1000);
    setTimeout(() => this.findAndAttachToInputField(), 2000);
    setTimeout(() => this.findAndAttachToInputField(), 4000);
    setTimeout(() => this.findAndAttachToInputField(), 6000);

    // Then check every 3 seconds (very light polling)
    setInterval(() => {
      if (!this.currentInputField || !document.body.contains(this.currentInputField)) {
        this.findAndAttachToInputField();
      }
    }, 3000);

    console.log('🧛 Gracula: Using lightweight polling (no MutationObserver)');
  }

  findAndAttachToInputField() {
    if (!this.currentPlatform) {
      console.log('🧛 Gracula: No platform detected');
      return;
    }

    console.log('🧛 Gracula: Searching for input field...');

    for (const selector of this.currentPlatform.inputSelectors) {
      const inputField = document.querySelector(selector);

      if (inputField && inputField !== this.currentInputField) {
        this.currentInputField = inputField;
        this.attachFloatingButton(inputField);
        this.attachInputListeners(inputField);
        console.log('🧛 Gracula: ✅ ATTACHED to input field with selector:', selector);
        console.log('🧛 Gracula: Input field element:', inputField);
        return; // Stop searching once found
      }
    }

    console.log('🧛 Gracula: ⚠️ Input field not found yet. Tried selectors:', this.currentPlatform.inputSelectors);
  }

  attachFloatingButton(inputField) {
    // Remove existing button if any
    if (this.floatingButton) {
      this.floatingButton.remove();
    }

    console.log('🧛 Gracula: Creating floating button...');

    // Create floating button
    this.floatingButton = document.createElement('div');
    this.floatingButton.id = 'gracula-floating-btn';
    this.floatingButton.className = 'gracula-btn-visible'; // Make visible immediately
    this.floatingButton.innerHTML = `
      <div class="gracula-btn-icon">🧛</div>
      <div class="gracula-btn-tooltip">Gracula AI - Click me!</div>
    `;

    document.body.appendChild(this.floatingButton);

    console.log('🧛 Gracula: ✅ Floating button added to page!');

    // Position button near input field
    this.positionFloatingButton(inputField);

    // Add click listener
    this.floatingButton.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('🧛 Gracula: Button clicked! Opening tone selector...');
      this.showToneSelector();
    });

    // Reposition on resize only (scroll listeners removed to prevent lag)
    window.addEventListener('resize', () => {
      this.positionFloatingButton(inputField);
    });
  }

  positionFloatingButton(inputField) {
    if (!this.floatingButton) {
      console.log('🧛 Gracula: No button to position');
      return;
    }

    if (!inputField) {
      // Fallback: position in bottom-right corner
      console.log('🧛 Gracula: No input field, using fallback position');
      this.floatingButton.style.position = 'fixed';
      this.floatingButton.style.bottom = '80px';
      this.floatingButton.style.right = '20px';
      this.floatingButton.style.top = 'auto';
      this.floatingButton.style.left = 'auto';
      return;
    }

    try {
      const rect = inputField.getBoundingClientRect();

      // Check if element is visible
      if (rect.width === 0 || rect.height === 0) {
        console.log('🧛 Gracula: Input field not visible, using fallback');
        this.floatingButton.style.position = 'fixed';
        this.floatingButton.style.bottom = '80px';
        this.floatingButton.style.right = '20px';
        this.floatingButton.style.top = 'auto';
        this.floatingButton.style.left = 'auto';
        return;
      }

      // Position next to input field
      this.floatingButton.style.position = 'fixed';
      this.floatingButton.style.top = `${rect.top + rect.height / 2 - 30}px`;
      this.floatingButton.style.left = `${rect.right + 15}px`;
      this.floatingButton.style.bottom = 'auto';
      this.floatingButton.style.right = 'auto';

      console.log('🧛 Gracula: Button positioned at:', {
        top: this.floatingButton.style.top,
        left: this.floatingButton.style.left
      });
    } catch (error) {
      console.error('🧛 Gracula: Error positioning button:', error);
      // Fallback position
      this.floatingButton.style.position = 'fixed';
      this.floatingButton.style.bottom = '80px';
      this.floatingButton.style.right = '20px';
    }
  }

  attachInputListeners(inputField) {
    inputField.addEventListener('focus', () => {
      if (this.floatingButton) {
        this.floatingButton.classList.add('gracula-btn-visible');
      }
    });

    inputField.addEventListener('blur', () => {
      setTimeout(() => {
        if (this.floatingButton && !this.modal) {
          this.floatingButton.classList.remove('gracula-btn-visible');
        }
      }, 200);
    });
  }

  showToneSelector() {
    // Extract conversation context
    this.extractConversationContext();

    // Create modal
    this.modal = document.createElement('div');
    this.modal.id = 'gracula-modal';
    this.modal.innerHTML = `
      <div class="gracula-modal-content">
        <div class="gracula-modal-header">
          <h2>🧛 Gracula AI Reply</h2>
          <button class="gracula-close-btn">&times;</button>
        </div>
        <div class="gracula-modal-body">
          <div class="gracula-context-section">
            <div class="gracula-context-header">
              <strong>📝 Conversation Context:</strong>
              <button class="gracula-edit-context-btn" title="Edit context">✏️ Edit</button>
            </div>
            <div class="gracula-context-display">
              <div class="gracula-context-preview">${this.getContextPreview() || '<em>No messages found. Add context below.</em>'}</div>
              <textarea class="gracula-context-editor" style="display: none;" placeholder="Add conversation context here...
Example:
Friend: Hey, what are you doing tonight?
Me: Nothing much, just chilling
Friend: Want to grab dinner?">${this.getFullContext()}</textarea>
            </div>
            <div class="gracula-context-actions" style="display: none;">
              <button class="gracula-save-context-btn">💾 Save Context</button>
              <button class="gracula-cancel-context-btn">❌ Cancel</button>
            </div>
          </div>
          <div class="gracula-tone-selector">
            <h3>Select Tone:</h3>
            <div class="gracula-tone-grid">
              ${this.renderToneButtons()}
            </div>
          </div>
          <div class="gracula-replies-container" style="display: none;">
            <h3>Generated Replies:</h3>
            <div class="gracula-loading">
              <div class="gracula-spinner"></div>
              <p>Generating replies...</p>
            </div>
            <div class="gracula-replies-list"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Add event listeners
    this.modal.querySelector('.gracula-close-btn').addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Tone button listeners
    this.modal.querySelectorAll('.gracula-tone-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleToneSelection(btn.dataset.toneId));
    });

    // Context edit listeners
    const editBtn = this.modal.querySelector('.gracula-edit-context-btn');
    const saveBtn = this.modal.querySelector('.gracula-save-context-btn');
    const cancelBtn = this.modal.querySelector('.gracula-cancel-context-btn');
    const preview = this.modal.querySelector('.gracula-context-preview');
    const editor = this.modal.querySelector('.gracula-context-editor');
    const actions = this.modal.querySelector('.gracula-context-actions');

    editBtn.addEventListener('click', () => {
      preview.style.display = 'none';
      editor.style.display = 'block';
      actions.style.display = 'flex';
      editBtn.style.display = 'none';
      editor.focus();
    });

    saveBtn.addEventListener('click', () => {
      const newContext = editor.value.trim();
      if (newContext) {
        // Parse the context into array
        this.conversationContext = newContext.split('\n').filter(line => line.trim().length > 0);
        preview.innerHTML = this.getContextPreview();
      } else {
        this.conversationContext = [];
        preview.innerHTML = '<em>No context provided.</em>';
      }

      preview.style.display = 'block';
      editor.style.display = 'none';
      actions.style.display = 'none';
      editBtn.style.display = 'inline-block';

      console.log('🧛 Gracula: Context updated:', this.conversationContext);
    });

    cancelBtn.addEventListener('click', () => {
      editor.value = this.getFullContext();
      preview.style.display = 'block';
      editor.style.display = 'none';
      actions.style.display = 'none';
      editBtn.style.display = 'inline-block';
    });
  }

  renderToneButtons() {
    return this.config.tones.map(tone => `
      <button class="gracula-tone-btn" data-tone-id="${tone.id}">
        <span class="gracula-tone-emoji">${tone.emoji}</span>
        <span class="gracula-tone-name">${tone.name}</span>
      </button>
    `).join('');
  }

  extractConversationContext() {
    this.conversationContext = [];

    if (!this.currentPlatform) return;

    console.log('🧛 Gracula: Extracting conversation context...');

    // Try multiple strategies to get messages
    let messageElements = [];

    // Strategy 1: Use platform-specific selectors
    const platformMessages = document.querySelectorAll(
      this.currentPlatform.messageSelectors.join(', ')
    );

    // Strategy 2: WhatsApp-specific - get message bubbles
    const whatsappMessages = document.querySelectorAll('div[data-id] span.selectable-text');

    // Strategy 3: Get all text spans in message containers
    const genericMessages = document.querySelectorAll('div[role="row"] span, div.message span');

    // Combine all strategies
    messageElements = [...platformMessages, ...whatsappMessages, ...genericMessages];

    console.log(`🧛 Gracula: Found ${messageElements.length} potential message elements`);

    // Get last 10 messages for better context
    const recentMessages = Array.from(messageElements).slice(-10);

    recentMessages.forEach(msg => {
      let text = msg.textContent?.trim();

      // Filter out timestamps, emojis only, and very short texts
      if (text &&
          text.length > 2 &&
          text.length < 500 &&
          !text.match(/^\d{1,2}:\d{2}/) && // Not a timestamp
          !text.match(/^[\u{1F300}-\u{1F9FF}]+$/u) && // Not just emojis
          text !== 'Today' &&
          text !== 'Yesterday') {

        // Remove duplicate consecutive messages
        if (this.conversationContext[this.conversationContext.length - 1] !== text) {
          this.conversationContext.push(text);
        }
      }
    });

    // Keep only last 8 unique messages
    this.conversationContext = [...new Set(this.conversationContext)].slice(-8);

    console.log('🧛 Gracula: Extracted context:', this.conversationContext);
  }

  getContextPreview() {
    if (this.conversationContext.length === 0) {
      return '<em>No recent messages found. Click to add context manually.</em>';
    }

    // Show last 3 messages with line breaks
    const preview = this.conversationContext.slice(-3).join('\n');
    return preview.length > 200 ? preview.substring(0, 200) + '...' : preview;
  }

  getFullContext() {
    if (this.conversationContext.length === 0) {
      return '';
    }
    return this.conversationContext.join('\n');
  }

  async handleToneSelection(toneId) {
    const tone = this.config.tones.find(t => t.id === toneId);
    if (!tone) return;

    console.log(`🧛 Gracula: Generating ${tone.name} replies...`);

    // Show loading state
    const repliesContainer = this.modal.querySelector('.gracula-replies-container');
    repliesContainer.style.display = 'block';
    repliesContainer.querySelector('.gracula-loading').style.display = 'block';
    repliesContainer.querySelector('.gracula-replies-list').innerHTML = '';

    try {
      // Generate AI replies
      const replies = await this.generateReplies(tone);
      
      // Hide loading
      repliesContainer.querySelector('.gracula-loading').style.display = 'none';
      
      // Display replies
      this.displayReplies(replies);
      
    } catch (error) {
      console.error('🧛 Gracula: Error generating replies:', error);
      const errorMessage = error.message || 'Unknown error';

      let helpText = '';
      if (errorMessage.includes('API key')) {
        helpText = `
          <p style="font-size: 13px; color: #ff6b6b; margin: 10px 0;">
            <strong>⚠️ API Key Required!</strong>
          </p>
          <p style="font-size: 12px; color: #666; margin: 10px 0;">
            1. Click the Gracula icon in Chrome toolbar<br>
            2. Make sure "OpenAI" is selected<br>
            3. Paste your API key<br>
            4. Click "Save Settings"<br>
            5. Reload this page and try again
          </p>
        `;
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        helpText = `
          <p style="font-size: 12px; color: #666;">
            You've hit the API rate limit. Please wait a minute and try again.
          </p>
        `;
      } else {
        helpText = `
          <p style="font-size: 12px; color: #666;">
            Error: ${errorMessage}<br><br>
            Try refreshing the page or check your API key in extension settings.
          </p>
        `;
      }

      repliesContainer.querySelector('.gracula-loading').innerHTML = `
        <p style="color: #ff4444; font-size: 16px; margin: 10px 0;">❌ Error Generating Replies</p>
        ${helpText}
      `;
    }
  }

  async generateReplies(tone) {
    // Send message to background script to call AI API
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'generateReplies',
        tone: tone,
        context: this.conversationContext
      }, (response) => {
        if (response.success) {
          resolve(response.replies);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  displayReplies(replies) {
    const repliesList = this.modal.querySelector('.gracula-replies-list');
    
    repliesList.innerHTML = replies.map((reply, index) => `
      <div class="gracula-reply-card" data-reply-index="${index}">
        <div class="gracula-reply-text">${this.escapeHtml(reply)}</div>
        <div class="gracula-reply-actions">
          <button class="gracula-reply-btn gracula-insert-btn" data-reply="${this.escapeHtml(reply)}">
            Insert
          </button>
          <button class="gracula-reply-btn gracula-copy-btn" data-reply="${this.escapeHtml(reply)}">
            Copy
          </button>
        </div>
      </div>
    `).join('');

    // Add click listeners
    repliesList.querySelectorAll('.gracula-insert-btn').forEach(btn => {
      btn.addEventListener('click', () => this.insertReply(btn.dataset.reply));
    });

    repliesList.querySelectorAll('.gracula-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => this.copyReply(btn.dataset.reply));
    });
  }

  insertReply(reply) {
    if (!this.currentInputField) return;

    // Insert text into input field
    if (this.currentInputField.contentEditable === 'true') {
      // For contenteditable divs
      this.currentInputField.focus();
      this.currentInputField.textContent = reply;
      
      // Trigger input event
      const event = new Event('input', { bubbles: true });
      this.currentInputField.dispatchEvent(event);
    } else {
      // For textarea/input elements
      this.currentInputField.value = reply;
      this.currentInputField.dispatchEvent(new Event('input', { bubbles: true }));
    }

    this.closeModal();
    console.log('🧛 Gracula: Reply inserted!');
  }

  copyReply(reply) {
    navigator.clipboard.writeText(reply).then(() => {
      console.log('🧛 Gracula: Reply copied to clipboard!');
      // Show feedback
      const btn = event.target;
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  }

  closeModal() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize Gracula when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GraculaAssistant();
  });
} else {
  new GraculaAssistant();
}

