// Voice Input Manager (Refactored)
// Orchestrates voice input using TranscriptionManager and UI components

window.Gracula = window.Gracula || {};

window.Gracula.VoiceInputManager = class {
  constructor(options = {}) {
    this.inputField = options.inputField;
    this.onTranscription = options.onTranscription || (() => {});
    this.onError = options.onError || (() => {});
    this.container = options.container || null;

    // Components
    this.transcriptionManager = null;
    this.voiceButton = null;
    this.recordingIndicator = null;

    // State
    this.isActive = false;
    this.config = null;
    this.disabledShortcutListenerAttached = false;

    // Bind methods
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);
    this.handleDisabledKeydown = this.handleDisabledKeydown.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleConfigUpdate = this.handleConfigUpdate.bind(this);

    // Listen for config updates from background
    chrome.runtime.onMessage.addListener(this.handleConfigUpdate);

    console.log('🎤 VoiceInputManager: Initialized');
  }

  /**
   * Load configuration from background
   */
  async loadConfig() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getApiConfig' }, (response) => {
        if (response && response.success && response.config) {
          this.config = response.config;

          if (typeof this.config.voiceInputEnabled === 'string') {
            this.config.voiceInputEnabled = this.config.voiceInputEnabled.toLowerCase() !== 'false';
          }

          if (typeof this.config.voiceInputEnabled === 'undefined') {
            this.config.voiceInputEnabled = true;
          }

          console.log('✅ VoiceInputManager: Config loaded', this.config);
        } else {
          // Default config if not loaded
          this.config = {
            voiceInputEnabled: true, // Enable by default for testing
            voiceProvider: 'webspeech',
            voiceLanguage: 'en'
          };
          console.log('⚠️ VoiceInputManager: Using default config');
        }
        resolve();
      });
    });
  }

  /**
   * Start voice input manager
   */
  async start() {
    // Wait for config to load
    await this.loadConfig();

    const voiceEnabled = this.config?.voiceInputEnabled !== false;

    // Always render the button so users know the feature exists
    this.createVoiceButton({ enabled: voiceEnabled });

    // Ensure disabled shortcut listener is cleared if previously attached
    if (this.disabledShortcutListenerAttached) {
      document.removeEventListener('keydown', this.handleDisabledKeydown);
      this.disabledShortcutListenerAttached = false;
    }

    if (!voiceEnabled) {
      console.log('🎤 VoiceInputManager: Voice input disabled in settings - showing disabled button');
      if (!this.disabledShortcutListenerAttached) {
        document.addEventListener('keydown', this.handleDisabledKeydown);
        this.disabledShortcutListenerAttached = true;
      }
      return;
    }

    // Add keyboard shortcut listeners (Ctrl+Shift+V - push to talk)
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('keyup', this.handleKeyup);

    // Create transcription manager
    this.createTranscriptionManager();

    // Create recording indicator
    this.recordingIndicator = new window.Gracula.RecordingIndicator({
      onCancel: () => this.stopTranscription()
    });

    const shortcut = this.config?.voiceShortcut || 'Ctrl+Shift+V';
    console.log(`✅ VoiceInputManager: Started (${shortcut} to activate)`);
  }

  /**
   * Stop voice input manager
   */
  stop() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('keyup', this.handleKeyup);

    if (this.disabledShortcutListenerAttached) {
      document.removeEventListener('keydown', this.handleDisabledKeydown);
      this.disabledShortcutListenerAttached = false;
    }

    if (this.voiceButton) {
      this.voiceButton.destroy();
      this.voiceButton = null;
    }

    if (this.transcriptionManager) {
      this.transcriptionManager.destroy();
      this.transcriptionManager = null;
    }

    if (this.recordingIndicator) {
      this.recordingIndicator.destroy();
      this.recordingIndicator = null;
    }

    console.log('✅ VoiceInputManager: Stopped');
  }

  /**
   * Handle keyboard shortcut - KEYDOWN starts recording (push-to-talk)
   */
  handleKeydown(event) {
    if (this.matchesShortcut(event)) {
      event.preventDefault();
      // Only start if not already recording
      if (!this.isActive) {
        this.startTranscription();
      }
    }
  }

  /**
   * Handle keyboard shortcut - KEYUP stops recording (push-to-talk)
   */
  handleKeyup(event) {
    if (this.matchesShortcut(event)) {
      event.preventDefault();
      // Stop recording when key is released
      if (this.isActive) {
        this.stopTranscription();
      }
    }
  }

  /**
   * Handle keyboard shortcut when voice input is disabled
   */
  handleDisabledKeydown(event) {
    if (this.matchesShortcut(event)) {
      event.preventDefault();
      this.handleVoiceDisabled();
    }
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
    const eventKey = event.key?.toUpperCase();

    return eventKey === mainKey.toUpperCase();
  }

  /**
   * Create voice button
   */
  createVoiceButton({ enabled = true } = {}) {
    if (this.voiceButton || !this.inputField) return;

    const shortcut = this.config?.voiceShortcut || 'Ctrl+Shift+V';
    const tooltip = enabled
      ? `Voice Input (${shortcut})`
      : 'Enable voice input in the Gracula popup to use speech-to-text';

    this.voiceButton = new window.Gracula.VoiceButton({
      inputField: this.inputField,
      onClick: enabled ? this.handleButtonClick : () => this.handleVoiceDisabled(),
      disabled: !enabled,
      tooltip,
      container: this.container,
      compact: true
    });

    console.log(`✅ VoiceInputManager: Voice button created (enabled=${enabled})`);
  }

  /**
   * Create transcription manager
   */
  createTranscriptionManager() {
    // Determine provider from config
    const provider = this.config?.voiceProvider || 'webspeech';
    const language = this.config?.voiceLanguage || 'en';

    this.transcriptionManager = new window.Gracula.TranscriptionManager({
      provider: provider,
      language: language,
      useVAD: true,
      autoStop: true,
      onTranscriptionStart: () => {
        console.log('🎤 VoiceInputManager: Transcription started');
        this.isActive = true;
        this.voiceButton?.setRecording(true);
        this.recordingIndicator?.show('Listening...');
      },
      onTranscriptionComplete: (transcript) => {
        console.log('✅ VoiceInputManager: Transcription complete:', transcript);
        this.handleTranscriptionComplete(transcript);
      },
      onTranscriptionError: (error) => {
        console.error('❌ VoiceInputManager: Transcription error:', error);
        this.handleTranscriptionError(error);
      },
      onInterimResult: (transcript) => {
        console.log('🎤 VoiceInputManager: Interim result:', transcript);
        this.recordingIndicator?.updateMessage(`"${transcript}"`);
      },
      onAudioLevel: (level) => {
        this.recordingIndicator?.updateAudioLevel(level);
      },
      onStateChange: (state) => {
        console.log('🎤 VoiceInputManager: State changed to:', state);
        if (state === 'transcribing') {
          this.recordingIndicator?.updateMessage('Transcribing...');
        }
      }
    });

    console.log('✅ VoiceInputManager: Transcription manager created');
  }

  /**
   * Show guidance when voice input is disabled
   */
  handleVoiceDisabled() {
    console.warn('🎤 VoiceInputManager: Voice input requested but feature is disabled');
    this.onError('Enable voice input in the Gracula popup to use speech-to-text.');
  }

  /**
   * Handle button click
   */
  handleButtonClick() {
    this.toggleTranscription();
  }

  /**
   * Toggle transcription on/off
   */
  toggleTranscription() {
    if (this.isActive) {
      this.stopTranscription();
    } else {
      this.startTranscription();
    }
  }

  /**
   * Start transcription
   */
  async startTranscription() {
    if (!this.transcriptionManager) {
      console.error('❌ VoiceInputManager: Transcription manager not initialized');
      return;
    }

    try {
      await this.transcriptionManager.start();
    } catch (error) {
      if (error?.code === 'transcription-already-active') {
        console.log('🎤 VoiceInputManager: Already recording - showing pulse animation');
        // Silently ignore duplicate presses and show visual feedback
        this.pulseRecordingIndicator();
        return;
      }

      console.error('❌ VoiceInputManager: Failed to start transcription:', error);
      this.onError(error?.message || 'Failed to start voice input');

      if (typeof this.transcriptionManager.forceReset === 'function') {
        this.transcriptionManager.forceReset('start-failed');
      }
    }
  }

  /**
   * Pulse the recording indicator to show it's already active
   */
  pulseRecordingIndicator() {
    if (!this.recordingIndicator || !this.recordingIndicator.indicator) return;

    // Add scale pulse animation to the entire indicator
    const indicator = this.recordingIndicator.indicator;

    // Save original transform
    const originalTransform = indicator.style.transform;

    // Apply scale pulse
    indicator.style.transition = 'transform 0.15s ease-in-out';
    indicator.style.transform = 'translateX(0) scale(1.05)';

    // Reset after animation
    setTimeout(() => {
      indicator.style.transform = originalTransform;
      setTimeout(() => {
        indicator.style.transition = '';
      }, 150);
    }, 150);
  }

  /**
   * Stop transcription
   */
  stopTranscription() {
    if (!this.transcriptionManager) return;

    this.transcriptionManager.stop();
    this.isActive = false;
    this.voiceButton?.setRecording(false);
    this.recordingIndicator?.hide();
  }

  /**
   * Handle transcription complete
   */
  handleTranscriptionComplete(transcript) {
    if (!transcript) {
      console.warn('⚠️ VoiceInputManager: Empty transcript');
      this.onError('No speech detected');
      this.cleanup();
      return;
    }

    // Insert transcript into input field
    this.insertTranscript(transcript);

    // Call callback
    this.onTranscription(transcript);

    // Cleanup
    this.cleanup();

    console.log('✅ VoiceInputManager: Transcription inserted');
  }

  /**
   * Handle transcription error
   */
  handleTranscriptionError(error) {
    this.onError(error);
    this.cleanup();
  }

  /**
   * Insert transcript into input field
   */
  insertTranscript(transcript) {
    if (!this.inputField || !transcript) return;

    try {
      const field = this.inputField;

      // Handle contentEditable divs (WhatsApp, Discord, Slack, etc.)
      if (field.contentEditable === 'true') {
        field.focus();

        // Get current content
        const currentText = field.textContent || '';

        // Append transcript (add space if there's existing text)
        const newText = currentText ? `${currentText} ${transcript}` : transcript;

        // Clear the field
        field.innerHTML = '';

        // Create a text node with the new content
        const textNode = document.createTextNode(newText);
        field.appendChild(textNode);

        // Set cursor to end
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const range = document.createRange();
          range.setStart(textNode, newText.length);
          range.collapse(true);
          selection.addRange(range);
        }

        // Trigger input event for React/Vue to detect change
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          data: transcript,
          inputType: 'insertText'
        });
        field.dispatchEvent(inputEvent);
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
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        field.dispatchEvent(inputEvent);

        // Set cursor to end
        field.selectionStart = newValue.length;
        field.selectionEnd = newValue.length;
      }

      // Focus input field
      field.focus();

      console.log('✅ VoiceInputManager: Transcript inserted into input field');
    } catch (error) {
      console.error('❌ VoiceInputManager: Failed to insert transcript:', error);
    }
  }

  /**
   * Handle config update message from background
   */
  handleConfigUpdate(message, sender, sendResponse) {
    if (message.action === 'configUpdated') {
      console.log('🎤 VoiceInputManager: Config update received, reloading...');
      this.reloadConfig();
    }
  }

  /**
   * Reload configuration and recreate components
   */
  async reloadConfig() {
    console.log('🎤 VoiceInputManager: Reloading configuration...');

    // Stop any active transcription
    if (this.isActive) {
      this.stopTranscription();
    }

    // Destroy old transcription manager
    if (this.transcriptionManager) {
      this.transcriptionManager.destroy();
      this.transcriptionManager = null;
    }

    // Load new config
    await this.loadConfig();

    const voiceEnabled = this.config?.voiceInputEnabled !== false;

    // Update voice button state
    if (this.voiceButton) {
      this.voiceButton.setEnabled(voiceEnabled);
    }

    // Remove old keyboard listeners
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('keyup', this.handleKeyup);
    if (this.disabledShortcutListenerAttached) {
      document.removeEventListener('keydown', this.handleDisabledKeydown);
      this.disabledShortcutListenerAttached = false;
    }

    if (!voiceEnabled) {
      console.log('🎤 VoiceInputManager: Voice input disabled after reload');
      if (!this.disabledShortcutListenerAttached) {
        document.addEventListener('keydown', this.handleDisabledKeydown);
        this.disabledShortcutListenerAttached = true;
      }
      return;
    }

    // Add keyboard shortcut listeners (push-to-talk)
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('keyup', this.handleKeyup);

    // Recreate transcription manager with new config
    this.createTranscriptionManager();

    console.log('✅ VoiceInputManager: Configuration reloaded successfully');
    console.log('   Provider:', this.config?.voiceProvider);
    console.log('   Language:', this.config?.voiceLanguage);
    console.log('   Enabled:', voiceEnabled);
  }

  /**
   * Cleanup after transcription
   */
  cleanup() {
    this.isActive = false;
    this.voiceButton?.setRecording(false);
    this.recordingIndicator?.hide();
  }

  /**
   * Destroy voice input manager
   */
  destroy() {
    this.stop();

    // Remove message listener
    chrome.runtime.onMessage.removeListener(this.handleConfigUpdate);

    // Remove keyboard listeners
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('keyup', this.handleKeyup);
    if (this.disabledShortcutListenerAttached) {
      document.removeEventListener('keydown', this.handleDisabledKeydown);
    }

    this.inputField = null;
    console.log('🎤 VoiceInputManager: Destroyed');
  }
};

console.log('✅ VoiceInputManager class loaded');
