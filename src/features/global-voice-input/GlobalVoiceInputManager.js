// Global Voice Input Manager
// Works with ANY input field on ANY webpage - Universal voice input feature
// Activated by keyboard shortcut (Ctrl+Shift+V by default)

window.Gracula = window.Gracula || {};

window.Gracula.GlobalVoiceInputManager = class {
  constructor() {
    // State
    this.currentFocusedInput = null;
    this.voiceInputManager = null;
    this.isActive = false;
    this.config = null;

    // Minimal visual feedback (no buttons, just a subtle indicator)
    this.listeningIndicator = null;

    // Track modifier key states for shortcuts
    this.modifierKeysHeld = {
      ctrl: false,
      shift: false,
      alt: false
    };

    // Bind methods
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);

    console.log('🎤 [GLOBAL VOICE] GlobalVoiceInputManager: Initialized');
  }

  /**
   * Initialize global voice input
   */
  async init() {
    console.log('🎤 [GLOBAL VOICE] Starting initialization...');

    // Load configuration
    await this.loadConfig();

    // Check if voice input is enabled
    if (this.config?.voiceInputEnabled === false) {
      console.log('🎤 [GLOBAL VOICE] Voice input disabled in settings');
      return;
    }

    // Add global keyboard listeners only (no focus listeners, no buttons)
    this.attachKeyboardListeners();

    // Create minimal visual indicator (small, subtle)
    this.createMinimalIndicator();

    console.log('✅ [GLOBAL VOICE] Started successfully! Press Ctrl+Shift+V in any input field');
  }

  /**
   * Load configuration from storage
   */
  async loadConfig() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getApiConfig' }, (response) => {
        if (response && response.success && response.config) {
          this.config = response.config;

          // Ensure boolean
          if (typeof this.config.voiceInputEnabled === 'string') {
            this.config.voiceInputEnabled = this.config.voiceInputEnabled.toLowerCase() !== 'false';
          }

          if (typeof this.config.voiceInputEnabled === 'undefined') {
            this.config.voiceInputEnabled = true;
          }

          console.log('✅ [GLOBAL VOICE] Config loaded:', this.config);
        } else {
          // Default config
          this.config = {
            voiceInputEnabled: true,
            voiceProvider: 'elevenlabs',
            voiceLanguage: 'en',
            voiceShortcut: 'Ctrl+Shift+V'
          };
          console.log('⚠️ [GLOBAL VOICE] Using default config');
        }
        resolve();
      });
    });
  }

  /**
   * Attach keyboard listeners only (minimal approach)
   */
  attachKeyboardListeners() {
    // Listen for keyboard shortcuts only
    document.addEventListener('keydown', this.handleKeydown, true);
    document.addEventListener('keyup', this.handleKeyup, true);

    console.log('✅ [GLOBAL VOICE] Keyboard listeners attached (Ctrl+Shift+V)');
  }

  /**
   * Handle keydown event (start recording)
   */
  handleKeydown(event) {
    // Track modifier key states
    if (event.key === 'Control' || event.key === 'Meta') {
      this.modifierKeysHeld.ctrl = true;
    }
    if (event.key === 'Shift') {
      this.modifierKeysHeld.shift = true;
    }
    if (event.key === 'Alt') {
      this.modifierKeysHeld.alt = true;
    }

    // Debug log
    console.log('🔍 [GLOBAL VOICE] Key pressed:', {
      key: event.key,
      ctrl: event.ctrlKey || event.metaKey,
      shift: event.shiftKey,
      alt: event.altKey,
      modifiersHeld: this.modifierKeysHeld
    });

    if (!this.matchesShortcut(event)) {
      return;
    }

    console.log('✅ [GLOBAL VOICE] Shortcut matched!');

    event.preventDefault();
    event.stopPropagation();

    // Automatically detect currently focused input field
    const activeElement = document.activeElement;
    console.log('🔍 [GLOBAL VOICE] Active element:', activeElement?.tagName, activeElement?.type);

    if (!activeElement || !this.isInputField(activeElement)) {
      console.log('⚠️ [GLOBAL VOICE] No input field focused - please click in a text field first');
      return;
    }

    // Store the focused input
    this.currentFocusedInput = activeElement;
    console.log('✅ [GLOBAL VOICE] Input field detected:', activeElement.tagName);

    // Only start if not already recording
    if (!this.isActive) {
      this.startVoiceInput();
    }
  }

  /**
   * Handle keyup event (stop recording)
   */
  handleKeyup(event) {
    // Track modifier key states
    if (event.key === 'Control' || event.key === 'Meta') {
      this.modifierKeysHeld.ctrl = false;
    }
    if (event.key === 'Shift') {
      this.modifierKeysHeld.shift = false;
    }
    if (event.key === 'Alt') {
      this.modifierKeysHeld.alt = false;
    }

    // If we're recording and ANY shortcut key is released, stop recording
    // Don't use matchesShortcut() here because keys are being released
    if (this.isActive && this.isShortcutKey(event.key)) {
      console.log('🔍 [GLOBAL VOICE] Shortcut key released - stopping...');

      event.preventDefault();
      event.stopPropagation();

      // Update indicator to show "Processing..."
      this.updateIndicatorStatus('Processing...', 'Pasting text...');
      this.stopVoiceInput();
    }
  }

  /**
   * Check if a key is part of the configured shortcut
   */
  isShortcutKey(key) {
    const shortcut = this.config?.voiceShortcut || 'Ctrl+Shift+V';
    const parts = shortcut.split('+').map(p => p.trim());

    // Check if the released key is part of the shortcut
    if (key === 'Control' || key === 'Meta') {
      return parts.includes('Ctrl');
    }
    if (key === 'Shift') {
      return parts.includes('Shift');
    }
    if (key === 'Alt') {
      return parts.includes('Alt');
    }

    // Check main key (case-insensitive)
    const mainKey = parts[parts.length - 1];
    if (mainKey === 'Space' && key === ' ') {
      return true;
    }
    return key?.toUpperCase() === mainKey.toUpperCase();
  }

  /**
   * Check if event matches the configured shortcut
   */
  matchesShortcut(event) {
    const shortcut = this.config?.voiceShortcut || 'Ctrl+Shift+V';
    const parts = shortcut.split('+').map(p => p.trim());

    // Check modifiers
    const needsCtrl = parts.includes('Ctrl');
    const needsAlt = parts.includes('Alt');
    const needsShift = parts.includes('Shift');

    if (needsCtrl && !event.ctrlKey && !event.metaKey) return false;
    if (needsAlt && !event.altKey) return false;
    if (needsShift && !event.shiftKey) return false;

    // Check main key (last part)
    const mainKey = parts[parts.length - 1];
    const eventKey = event.key;

    // Handle special keys
    if (mainKey === 'Space' && eventKey === ' ') {
      return true;
    }

    // Standard key matching (case-insensitive)
    return eventKey?.toUpperCase() === mainKey.toUpperCase();
  }

  /**
   * Check if element is an input field
   */
  isInputField(element) {
    if (!element) return false;

    const tagName = element.tagName?.toLowerCase();
    const contentEditable = element.contentEditable === 'true';
    const isInput = tagName === 'input' &&
                    element.type !== 'file' &&
                    element.type !== 'checkbox' &&
                    element.type !== 'radio' &&
                    element.type !== 'submit' &&
                    element.type !== 'button';
    const isTextarea = tagName === 'textarea';

    // Also check for common contenteditable patterns
    const hasEditableRole = element.getAttribute('role') === 'textbox';

    return isInput || isTextarea || contentEditable || hasEditableRole;
  }


  /**
   * Start voice input
   */
  async startVoiceInput() {
    if (!this.currentFocusedInput) {
      console.log('⚠️ [GLOBAL VOICE] No input field focused');
      return;
    }

    if (this.isActive) {
      console.log('⚠️ [GLOBAL VOICE] Voice input already active');
      return;
    }

    console.log('🎤 [GLOBAL VOICE] Starting voice input...');

    this.isActive = true;

    // Show minimal listening indicator (small, subtle)
    this.showListeningIndicator();

    try {
      // Create transcription manager if not exists
      if (!this.voiceInputManager) {
        console.log('🎤 [GLOBAL VOICE] Creating transcription manager...');
        await this.createTranscriptionManager();
      }

      // Start transcription
      console.log('🎤 [GLOBAL VOICE] Starting transcription...');
      await this.voiceInputManager.transcriptionManager.start();

      // Update indicator once recording actually starts
      this.updateIndicatorStatus('Listening...', 'Speak now! Release keys to paste');
      console.log('✅ [GLOBAL VOICE] Listening... Speak now!');

    } catch (error) {
      console.error('❌ [GLOBAL VOICE] Failed to start voice input:', error);
      this.stopVoiceInput();
    }
  }

  /**
   * Stop voice input
   */
  stopVoiceInput() {
    if (!this.isActive) {
      return;
    }

    console.log('🎤 [GLOBAL VOICE] Stopping voice input...');

    this.isActive = false;

    // Hide listening indicator
    this.hideListeningIndicator();

    // Stop transcription
    if (this.voiceInputManager?.transcriptionManager) {
      this.voiceInputManager.transcriptionManager.stop();
    }
  }

  /**
   * Create transcription manager
   */
  async createTranscriptionManager() {
    const provider = this.config?.voiceProvider || 'webspeech';
    const language = this.config?.voiceLanguage || 'en';

    console.log('🎤 [GLOBAL VOICE] Creating transcription manager with:', { provider, language });

    // Create a simple wrapper
    this.voiceInputManager = {
      transcriptionManager: new window.Gracula.TranscriptionManager({
        provider: provider,
        language: language,
        useVAD: true,
        autoStop: true,
        onTranscriptionStart: () => {
          console.log('🎤 [GLOBAL VOICE] Transcription started');
        },
        onTranscriptionComplete: (transcript) => {
          console.log('✅ [GLOBAL VOICE] Transcription complete:', transcript);
          this.handleTranscriptionComplete(transcript);
        },
        onTranscriptionError: (error) => {
          console.error('❌ [GLOBAL VOICE] Transcription error:', error);
          this.stopVoiceInput();
        },
        onInterimResult: (transcript) => {
          console.log('🎤 [GLOBAL VOICE] Interim result:', transcript);
        },
        onAudioLevel: (level) => {
          // Silent mode - no audio level visualization
        },
        onStateChange: (state) => {
          console.log('🎤 [GLOBAL VOICE] State changed to:', state);
        }
      })
    };

    console.log('✅ [GLOBAL VOICE] Transcription manager created');
  }

  /**
   * Handle transcription complete
   */
  handleTranscriptionComplete(transcript) {
    if (!transcript || !transcript.trim()) {
      console.log('⚠️ [GLOBAL VOICE] No speech detected');
      this.updateIndicatorStatus('No speech detected', 'Try again');
      setTimeout(() => this.hideListeningIndicator(), 1000);
      return;
    }

    console.log('✅ [GLOBAL VOICE] Inserting transcript:', transcript);

    // Show success state
    this.updateIndicatorStatus('✓ Pasted!', transcript.substring(0, 50) + (transcript.length > 50 ? '...' : ''));

    // Insert transcript silently into focused input
    this.insertTranscript(transcript);

    // Hide indicator after a brief moment
    setTimeout(() => this.hideListeningIndicator(), 800);

    // Reset state
    this.isActive = false;
  }

  /**
   * Insert transcript into focused input field
   */
  insertTranscript(transcript) {
    const field = this.currentFocusedInput;

    if (!field) {
      console.error('❌ [GLOBAL VOICE] No focused input field');
      return;
    }

    console.log('🎤 [GLOBAL VOICE] Inserting into:', field.tagName, field.type);

    try {
      // Handle contentEditable divs
      if (field.contentEditable === 'true') {
        field.focus();

        // Get current content
        const currentText = field.textContent || '';

        // Append transcript (add space if there's existing text)
        const newText = currentText ? `${currentText} ${transcript}` : transcript;

        // Insert using execCommand for better compatibility
        try {
          const inserted = document.execCommand('insertText', false, transcript);
          if (!inserted) {
            // Fallback
            field.innerHTML = '';
            field.appendChild(document.createTextNode(newText));
          }
        } catch (e) {
          // Fallback
          field.innerHTML = '';
          field.appendChild(document.createTextNode(newText));
        }

        // Set cursor to end
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const range = document.createRange();
          range.selectNodeContents(field);
          range.collapse(false);
          selection.addRange(range);
        }

        // Trigger input event
        field.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          data: transcript,
          inputType: 'insertText'
        }));
      } else {
        // Handle regular input/textarea elements
        const currentValue = field.value || '';
        const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;

        // Use native setter for React compatibility
        const prototype = Object.getPrototypeOf(field);
        const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        if (valueSetter) {
          valueSetter.call(field, newValue);
        } else {
          field.value = newValue;
        }

        // Trigger input event
        field.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

        // Set cursor to end
        field.selectionStart = newValue.length;
        field.selectionEnd = newValue.length;
      }

      // Focus input field
      field.focus();

      console.log('✅ [GLOBAL VOICE] Transcript inserted successfully!');
    } catch (error) {
      console.error('❌ [GLOBAL VOICE] Failed to insert transcript:', error);
    }
  }

  /**
   * Create prominent visual indicator with clear instructions
   */
  createMinimalIndicator() {
    // Create listening indicator overlay
    this.listeningIndicator = document.createElement('div');
    this.listeningIndicator.id = 'gracula-listening-indicator';
    this.listeningIndicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 40px;
      border-radius: 20px;
      display: none;
      z-index: 2147483647;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      pointer-events: none;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      min-width: 320px;
    `;

    this.listeningIndicator.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
        <div id="gracula-mic-icon" style="
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          animation: gracula-mic-pulse 1.5s infinite;
        ">🎤</div>
        <div id="gracula-voice-status" style="
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        ">Listening...</div>
        <div id="gracula-voice-instruction" style="
          font-size: 14px;
          opacity: 0.9;
          font-weight: 500;
        ">Speak now! Release keys to paste</div>
      </div>
    `;

    document.body.appendChild(this.listeningIndicator);

    // Add animation styles
    if (!document.getElementById('gracula-voice-animations')) {
      const style = document.createElement('style');
      style.id = 'gracula-voice-animations';
      style.textContent = `
        @keyframes gracula-mic-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
        }

        @keyframes gracula-fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes gracula-fade-out {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }
      `;
      document.head.appendChild(style);
    }

    console.log('✅ [GLOBAL VOICE] Voice indicator created');
  }

  /**
   * Update indicator status text
   */
  updateIndicatorStatus(status, instruction) {
    if (this.listeningIndicator) {
      const statusEl = this.listeningIndicator.querySelector('#gracula-voice-status');
      const instructionEl = this.listeningIndicator.querySelector('#gracula-voice-instruction');

      if (statusEl) {
        statusEl.textContent = status;
      }
      if (instructionEl) {
        instructionEl.textContent = instruction;
      }
    }
  }

  /**
   * Show listening indicator with animation
   */
  showListeningIndicator() {
    if (this.listeningIndicator) {
      // Reset to listening state
      this.updateIndicatorStatus('Requesting microphone...', 'Keep holding keys! Allow microphone access');

      this.listeningIndicator.style.display = 'block';
      // Trigger animation
      requestAnimationFrame(() => {
        this.listeningIndicator.style.opacity = '1';
        this.listeningIndicator.style.transform = 'translate(-50%, -50%) scale(1)';
        this.listeningIndicator.style.animation = 'gracula-fade-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      });
      console.log('👁️ [GLOBAL VOICE] Indicator shown - Requesting microphone...');
    }
  }

  /**
   * Hide listening indicator with animation
   */
  hideListeningIndicator() {
    if (this.listeningIndicator) {
      this.listeningIndicator.style.animation = 'gracula-fade-out 0.2s ease-out';
      setTimeout(() => {
        if (this.listeningIndicator) {
          this.listeningIndicator.style.display = 'none';
          this.listeningIndicator.style.opacity = '0';
          this.listeningIndicator.style.transform = 'translate(-50%, -50%) scale(0.8)';
        }
      }, 200);
      console.log('👁️ [GLOBAL VOICE] Indicator hidden');
    }
  }

  /**
   * Destroy global voice input manager
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown, true);
    document.removeEventListener('keyup', this.handleKeyup, true);

    // Remove voice input manager
    if (this.voiceInputManager) {
      this.voiceInputManager.transcriptionManager?.destroy();
      this.voiceInputManager = null;
    }

    // Remove listening indicator
    if (this.listeningIndicator) {
      this.listeningIndicator.remove();
      this.listeningIndicator = null;
    }

    console.log('✅ [GLOBAL VOICE] Destroyed');
  }
};

console.log('✅ [GLOBAL VOICE] GlobalVoiceInputManager class loaded');
