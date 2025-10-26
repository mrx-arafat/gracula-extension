// Voice Input Manager (Refactored)
// Orchestrates voice input using TranscriptionManager and UI components

window.Gracula = window.Gracula || {};

window.Gracula.VoiceInputManager = class {
  constructor(options = {}) {
    this.inputField = options.inputField;
    this.onTranscription = options.onTranscription || (() => {});
    this.onError = options.onError || (() => {});

    // Components
    this.transcriptionManager = null;
    this.voiceButton = null;
    this.recordingIndicator = null;

    // State
    this.isActive = false;
    this.config = null;

    // Load configuration
    this.loadConfig();

    // Bind methods
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);

    console.log('🎤 VoiceInputManager: Initialized');
  }

  /**
   * Load configuration from background
   */
  loadConfig() {
    chrome.runtime.sendMessage({ action: 'getApiConfig' }, (response) => {
      if (response && response.success && response.config) {
        this.config = response.config;
        console.log('✅ VoiceInputManager: Config loaded');
      }
    });
  }

  /**
   * Start voice input manager
   */
  start() {
    if (!this.config?.voiceInputEnabled) {
      console.log('🎤 VoiceInputManager: Voice input disabled');
      return;
    }

    // Add keyboard shortcut listener (Ctrl+Shift+V)
    document.addEventListener('keydown', this.handleKeydown);

    // Create voice button
    this.createVoiceButton();

    // Create transcription manager
    this.createTranscriptionManager();

    // Create recording indicator
    this.recordingIndicator = new window.Gracula.RecordingIndicator({
      onCancel: () => this.stopTranscription()
    });

    console.log('✅ VoiceInputManager: Started (Ctrl+Shift+V to activate)');
  }

  /**
   * Stop voice input manager
   */
  stop() {
    document.removeEventListener('keydown', this.handleKeydown);

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
   * Handle keyboard shortcut (Ctrl+Shift+V)
   */
  handleKeydown(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'V') {
      event.preventDefault();
      this.toggleTranscription();
    }
  }

  /**
   * Create voice button
   */
  createVoiceButton() {
    if (this.voiceButton || !this.inputField) return;

    this.voiceButton = new window.Gracula.VoiceButton({
      inputField: this.inputField,
      onClick: this.handleButtonClick
    });

    console.log('✅ VoiceInputManager: Voice button created');
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
      console.error('❌ VoiceInputManager: Failed to start transcription:', error);
      this.onError(error.message || 'Failed to start voice input');
    }
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
      // Get current value
      const currentValue = this.inputField.value || this.inputField.textContent || '';

      // Append transcript (add space if there's existing text)
      const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;

      // Set new value
      if (this.inputField.value !== undefined) {
        this.inputField.value = newValue;
      } else {
        this.inputField.textContent = newValue;
      }

      // Trigger input event for platform detection
      const inputEvent = new Event('input', { bubbles: true });
      this.inputField.dispatchEvent(inputEvent);

      // Focus input field
      this.inputField.focus();

      console.log('✅ VoiceInputManager: Transcript inserted into input field');
    } catch (error) {
      console.error('❌ VoiceInputManager: Failed to insert transcript:', error);
    }
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
    this.inputField = null;
    console.log('🎤 VoiceInputManager: Destroyed');
  }
};

console.log('✅ VoiceInputManager class loaded');
