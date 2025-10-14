// Gracula Application
// Main application orchestrator

import { detectPlatform } from '../entities/platform/index.js';
import { ContextExtractor } from '../features/context/index.js';
import { FloatingButton } from '../widgets/floating-button/index.js';
import { Modal } from '../widgets/modal/index.js';
import { ToneSelector } from '../widgets/tone-selector/index.js';
import { ContextViewer } from '../widgets/context-viewer/index.js';
import { ReplyList } from '../widgets/reply-list/index.js';
import { logger, triggerInputEvent } from '../shared/lib/index.js';

export class GraculaApp {
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
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) return;

    logger.separator();
    logger.info('EXTENSION LOADED');
    logger.info('Version 1.0.0 - FSD Architecture');
    logger.info('Waiting for page to fully load...');
    logger.separator();

    // Detect platform
    this.platform = detectPlatform();

    if (!this.platform) {
      logger.warn('Platform not supported');
      return;
    }

    logger.success(`Platform detected: ${this.platform.name}`);

    // Initialize context extractor
    this.contextExtractor = new ContextExtractor(this.platform);

    // Delay initialization to let page load
    setTimeout(() => {
      logger.info('Starting initialization...');
      this.showLoadingNotification();
      this.observeInputFields();
      this.isInitialized = true;
    }, 3000);
  }

  /**
   * Show loading notification
   */
  showLoadingNotification() {
    logger.success('Ready! Look for the purple button.');

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    notification.innerHTML = '🧛 <strong>Gracula AI</strong> is ready!';

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

  /**
   * Observe input fields
   */
  observeInputFields() {
    logger.info('Setting up input field detection...');

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

    logger.info('Using lightweight polling for input detection');
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
      logger.success('Attached to input field');
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
    this.floatingButton = new FloatingButton({
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

    logger.success('Floating button attached');
  }

  /**
   * Handle button click
   */
  handleButtonClick() {
    logger.info('Button clicked - Opening modal');
    
    // Extract context
    this.extractContext();
    
    // Show modal
    this.showModal();
  }

  /**
   * Extract conversation context
   */
  extractContext() {
    if (!this.contextExtractor) return;

    const messages = this.contextExtractor.extract();
    this.context = this.contextExtractor.getSimpleContext();
    this.enhancedContext = this.contextExtractor.getEnhancedContext();

    logger.success(`Context extracted: ${this.context.length} messages`);
  }

  /**
   * Show modal with tone selector
   */
  showModal() {
    // Create widgets
    this.toneSelector = new ToneSelector({
      onToneSelect: (tone) => this.handleToneSelection(tone)
    });

    this.contextViewer = new ContextViewer({
      context: this.context,
      enhancedContext: this.enhancedContext,
      showEnhanced: true,
      onContextUpdate: (newContext) => {
        this.context = newContext;
        logger.info('Context manually updated');
      }
    });

    this.replyList = new ReplyList({
      onInsert: (reply) => this.insertReply(reply),
      onCopy: (reply) => logger.info('Reply copied')
    });

    // Build modal content
    const content = `
      ${this.contextViewer.render()}
      ${this.toneSelector.render()}
      ${this.replyList.render()}
    `;

    // Create and show modal
    this.modal = new Modal({
      onClose: () => logger.info('Modal closed')
    });

    this.modal.render(content);

    // Attach listeners
    const modalBody = this.modal.getBody();
    if (modalBody) {
      this.toneSelector.attachListeners(modalBody);
      this.contextViewer.attachListeners(modalBody);
    }

    logger.success('Modal opened');
  }

  /**
   * Handle tone selection
   */
  async handleToneSelection(tone) {
    logger.info(`Generating ${tone.name} replies...`);

    const modalBody = this.modal.getBody();
    if (!modalBody) return;

    // Show loading
    this.replyList.showLoading(modalBody);

    try {
      // Generate replies
      const replies = await this.generateReplies(tone);
      
      // Display replies
      this.replyList.displayReplies(replies, modalBody);
      
      logger.success('Replies generated successfully');
    } catch (error) {
      logger.error('Error generating replies:', error);
      
      const errorMessage = error.message.includes('API key') 
        ? 'Please add your OpenAI API key in the extension settings.'
        : 'Try refreshing the page or check your API key in extension settings.';
      
      this.replyList.showError(errorMessage, modalBody);
    }
  }

  /**
   * Generate replies using background script
   */
  async generateReplies(tone) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'generateReplies',
        tone: tone.toJSON(),
        context: this.context,
        enhancedContext: this.enhancedContext
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
    if (!this.currentInputField) {
      logger.warn('No input field found');
      return;
    }

    // Insert text
    if (this.currentInputField.contentEditable === 'true') {
      // For contenteditable divs
      this.currentInputField.focus();
      this.currentInputField.textContent = reply;
      triggerInputEvent(this.currentInputField);
    } else {
      // For textarea/input elements
      this.currentInputField.value = reply;
      triggerInputEvent(this.currentInputField);
    }

    // Close modal
    if (this.modal) {
      this.modal.close();
    }

    logger.success('Reply inserted');
  }
}

export default GraculaApp;

