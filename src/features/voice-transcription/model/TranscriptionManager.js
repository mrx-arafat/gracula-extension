// Transcription Manager
// Orchestrates voice transcription using multiple providers

window.Gracula = window.Gracula || {};

window.Gracula.TranscriptionManager = class {
  constructor(options = {}) {
    this.onTranscriptionStart = options.onTranscriptionStart || (() => {});
    this.onTranscriptionComplete = options.onTranscriptionComplete || (() => {});
    this.onTranscriptionError = options.onTranscriptionError || (() => {});
    this.onInterimResult = options.onInterimResult || (() => {});
    this.onAudioLevel = options.onAudioLevel || (() => {});
    this.onStateChange = options.onStateChange || (() => {});

    // Configuration
    this.provider = options.provider || 'webspeech'; // Default to Web Speech API (always available, free)
    this.language = options.language || 'en';
    this.useVAD = options.useVAD !== false; // Default true
    this.autoStop = options.autoStop !== false; // Default true

    // Components
    this.audioRecorder = null;
    this.webSpeechRecognizer = null;
    this.vad = null;

    // State
    this.state = 'idle'; // idle, recording, transcribing, complete, error
    this.currentTranscript = '';
    this.apiConfig = null;

    // Session tracking
    this.sessionCounter = 0;
    this.currentSessionId = 0;


    // Load API configuration
    this.loadConfig();

    console.log('🎤 TranscriptionManager: Initialized with provider:', this.provider);
  }

  /**
   * Load API configuration from background
   */
  loadConfig() {
    chrome.runtime.sendMessage({ action: 'getApiConfig' }, (response) => {
      if (response && response.success && response.config) {
        this.apiConfig = response.config;
        console.log('✅ TranscriptionManager: Config loaded');
      }
    });
  }

  /**
   * Start transcription
   */
  async start() {
    if (this.state !== 'idle') {
      if (this.isBusy()) {
        const error = new Error('Voice input is already running');
        error.code = 'transcription-already-active';
        console.warn('🎤 TranscriptionManager: Start requested while busy');
        throw error;
      }


      console.warn(`🎤 TranscriptionManager: Resetting stale state before restart (state=${this.state})`);
      this.forceReset('stale-state');
    }

    const sessionId = ++this.sessionCounter;
    this.currentSessionId = sessionId;

    try {
      console.log('🎤 TranscriptionManager: Starting transcription...');

      this.setState('recording');
      this.currentTranscript = '';

      // Determine which method to use
      if (this.provider === 'webspeech') {
        await this.startWebSpeech(sessionId);
      } else {
        await this.startAudioRecording(sessionId);
      }

      this.onTranscriptionStart();
      console.log('✅ TranscriptionManager: Transcription started');
    } catch (error) {
      console.error('❌ TranscriptionManager: Failed to start:', error);
      this.setState('error');
      this.onTranscriptionError(error.message || 'Failed to start transcription');
    }
  }

  /**
   * Start Web Speech API recognition
   */
  async startWebSpeech(sessionId) {
    const languageCode = window.Gracula.VoiceProviders.getLanguageCode(this.language, 'webspeech');

    this.webSpeechRecognizer = new window.Gracula.WebSpeechRecognizer({
      language: languageCode,
      continuous: true,
      interimResults: true,
      onResult: (transcript) => {
        if (!this.isSessionActive(sessionId)) {
          console.warn('🎤 TranscriptionManager: Ignoring Web Speech result for stale session');
          return;
        }

        this.currentTranscript = transcript;
        console.log('✅ TranscriptionManager: Final transcript:', transcript);
      },
      onInterimResult: (transcript) => {
        if (!this.isSessionActive(sessionId)) {
          return;
        }

        this.onInterimResult(transcript);
        console.log('🎤 TranscriptionManager: Interim transcript:', transcript);
      },
      onStart: () => {
        if (!this.isSessionActive(sessionId)) {
          console.warn('🎤 TranscriptionManager: Web Speech start fired for stale session');
          return;
        }

        console.log('🎤 TranscriptionManager: Web Speech started');
      },
      onEnd: (transcript) => {
        if (!this.isSessionActive(sessionId)) {
          console.warn('🎤 TranscriptionManager: Ignoring Web Speech end for stale session');
          return;
        }

        this.currentTranscript = transcript || this.currentTranscript;
        this.handleTranscriptionComplete(this.currentTranscript, sessionId);
      },
      onError: (error) => {
        if (!this.isSessionActive(sessionId)) {
          console.warn('🎤 TranscriptionManager: Ignoring Web Speech error for stale session');
          return;
        }

        this.handleTranscriptionError(error, sessionId);
      }
    });

    this.webSpeechRecognizer.start();
  }

  /**
   * Start audio recording for cloud transcription
   */
  async startAudioRecording(sessionId) {
    this.audioRecorder = new window.Gracula.AudioRecorder({
      onStart: () => {
        if (!this.isSessionActive(sessionId)) {
          console.warn('🎤 TranscriptionManager: Ignoring audio recorder start for stale session');
          return;
        }

        console.log('🎤 TranscriptionManager: Audio recording started');

        // Start VAD if enabled
        if (this.useVAD && this.audioRecorder.audioStream) {
          this.startVAD(this.audioRecorder.audioStream);
        }
      },
      onStop: async (audioBlob) => {
        if (!this.isSessionActive(sessionId)) {
          console.warn('🎤 TranscriptionManager: Ignoring audio recorder stop for stale session');
          return;
        }

        console.log('🎤 TranscriptionManager: Audio recording stopped');
        this.setState('transcribing');

        // Stop VAD
        if (this.vad) {
          this.vad.stop();
        }

        // Transcribe audio
        await this.transcribeAudio(audioBlob, sessionId);
      },
      onError: (error) => {
        if (!this.isSessionActive(sessionId)) {
          console.warn('🎤 TranscriptionManager: Ignoring audio recorder error for stale session');
          return;
        }

        this.handleTranscriptionError(error, sessionId);
      },
      onAudioLevel: (level) => {
        if (!this.isSessionActive(sessionId)) {
          return;
        }

        this.onAudioLevel(level);
      }
    });

    await this.audioRecorder.startRecording();
  }

  /**
   * Start Voice Activity Detection
   */
  startVAD(audioStream) {
    this.vad = new window.Gracula.VoiceActivityDetector({
      silenceThreshold: 0.01,
      silenceDuration: 2000, // 2 seconds of silence
      onSilenceDetected: () => {
        if (this.autoStop) {
          console.log('🎤 TranscriptionManager: Auto-stopping due to silence');
          this.stop();
        }
      },
      onVolumeChange: (volume) => {
        this.onAudioLevel(volume);
      }
    });

    this.vad.start(audioStream);
  }

  /**
   * Stop transcription
   */
  stop() {
    if (this.state === 'idle' || this.state === 'transcribing') {
      console.warn('🎤 TranscriptionManager: Cannot stop in current state:', this.state);
      return;
    }

    console.log('🎤 TranscriptionManager: Stopping...');

    if (this.webSpeechRecognizer) {
      this.webSpeechRecognizer.stop();
    }

    if (this.audioRecorder) {
      this.audioRecorder.stopRecording();
    }

    if (this.vad) {
      this.vad.stop();
    }
  }

  /**
   * Transcribe audio using cloud API
   */
  async transcribeAudio(audioBlob, sessionId = this.currentSessionId) {
    if (!this.isSessionActive(sessionId)) {
      console.warn('🎤 TranscriptionManager: Ignoring transcribeAudio for stale session');
      return;
    }

    if (this.state === 'idle') {
      console.warn('🎤 TranscriptionManager: Ignoring transcribeAudio because manager is idle');
      return;
    }

    try {
      console.log('🎤 TranscriptionManager: Transcribing audio with', this.provider);

      let transcript = '';

      if (this.provider === 'elevenlabs') {
        transcript = await this.transcribeWithElevenLabs(audioBlob);
      } else if (this.provider === 'openai') {
        transcript = await this.transcribeWithOpenAI(audioBlob);
      } else {
        throw new Error(`Unsupported provider: ${this.provider}`);
      }

      this.handleTranscriptionComplete(transcript, sessionId);
    } catch (error) {
      console.error('❌ TranscriptionManager: Transcription failed:', error);
      this.handleTranscriptionError(error.message || 'Transcription failed', sessionId);
    }
  }

  /**
   * Transcribe with ElevenLabs API
   */
  async transcribeWithElevenLabs(audioBlob) {
    const apiKey = this.apiConfig?.elevenlabsApiKey;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Send to background script for API call
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result.split(',')[1];

        try {
          chrome.runtime.sendMessage({
            action: 'transcribeAudio',
            provider: 'elevenlabs',
            audioData: base64Audio,
            mimeType: audioBlob.type,
            language: this.language
          }, (response) => {
            // Check for extension context invalidation
            if (chrome.runtime.lastError) {
              console.error('🎤 TranscriptionManager: Extension context error:', chrome.runtime.lastError);
              reject(new Error('Extension was reloaded. Please refresh the page to continue using voice input.'));
              return;
            }

            if (response && response.success) {
              resolve(response.transcript);
            } else {
              reject(new Error(response?.error || 'Transcription failed'));
            }
          });
        } catch (error) {
          console.error('🎤 TranscriptionManager: Error sending message:', error);
          reject(new Error('Extension connection lost. Please refresh the page.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(audioBlob);
    });
  }

  /**
   * Transcribe with OpenAI Whisper API
   */
  async transcribeWithOpenAI(audioBlob) {
    const apiKey = this.apiConfig?.openaiApiKey;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Send to background script for API call
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result.split(',')[1];

        try {
          chrome.runtime.sendMessage({
            action: 'transcribeAudio',
            provider: 'openai',
            audioData: base64Audio,
            mimeType: audioBlob.type,
            language: this.language
          }, (response) => {
            // Check for extension context invalidation
            if (chrome.runtime.lastError) {
              console.error('🎤 TranscriptionManager: Extension context error:', chrome.runtime.lastError);
              reject(new Error('Extension was reloaded. Please refresh the page to continue using voice input.'));
              return;
            }

            if (response && response.success) {
              resolve(response.transcript);
            } else {
              reject(new Error(response?.error || 'Transcription failed'));
            }
          });
        } catch (error) {
          console.error('🎤 TranscriptionManager: Error sending message:', error);
          reject(new Error('Extension connection lost. Please refresh the page.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(audioBlob);
    });
  }

  /**
   * Handle transcription complete
   */
  handleTranscriptionComplete(transcript, sessionId = this.currentSessionId) {
    if (!this.isSessionActive(sessionId)) {
      console.warn('🎤 TranscriptionManager: Ignoring completion callback for stale session');
      return;
    }

    if (this.state === 'idle') {
      console.warn('🎤 TranscriptionManager: Ignoring completion callback because manager is idle');
      return;
    }

    console.log('✅ TranscriptionManager: Transcription complete:', transcript);
    this.currentTranscript = transcript;
    this.setState('complete');
    this.onTranscriptionComplete(transcript);
    this.cleanup();
  }

  /**
   * Handle transcription error
   */
  handleTranscriptionError(error, sessionId = this.currentSessionId) {
    if (!this.isSessionActive(sessionId)) {
      console.warn('🎤 TranscriptionManager: Ignoring error callback for stale session');
      return;
    }

    if (this.state === 'idle') {
      console.warn('🎤 TranscriptionManager: Ignoring error callback because manager is idle');
      return;
    }

    console.error('❌ TranscriptionManager: Error:', error);
    this.setState('error');
    this.onTranscriptionError(error);
    this.cleanup();
  }

  /**
   * Set state
   */
  setState(newState) {
    this.state = newState;
    this.onStateChange(newState);
    console.log('🎤 TranscriptionManager: State changed to:', newState);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.audioRecorder) {
      try {
        this.audioRecorder.destroy();
      } catch (error) {
        console.warn('Warning: TranscriptionManager failed to destroy audio recorder during cleanup:', error);
      }
      this.audioRecorder = null;
    }

    if (this.webSpeechRecognizer) {
      try {
        this.webSpeechRecognizer.destroy();
      } catch (error) {
        console.warn('Warning: TranscriptionManager failed to destroy web speech recognizer during cleanup:', error);
      }
      this.webSpeechRecognizer = null;
    }

    if (this.vad) {
      try {
        this.vad.destroy();
      } catch (error) {
        console.warn('Warning: TranscriptionManager failed to destroy VAD during cleanup:', error);
      }
      this.vad = null;
    }

    this.currentTranscript = '';

    if (this.state !== 'idle') {
      this.setState('idle');
    }
  }

  /**
   * Determine if capture is currently active
   */
  isCaptureActive() {
    const recognizerActive = Boolean(this.webSpeechRecognizer && this.webSpeechRecognizer.isRecognizing);
    const recorderActive = Boolean(this.audioRecorder && this.audioRecorder.isRecording);
    return recognizerActive || recorderActive;
  }

  /**
   * Determine if manager is processing captured audio
   */
  isProcessing() {
    return this.state === 'transcribing';
  }

  /**
   * Determine if manager is busy handling audio
   */
  isBusy() {
    return this.isCaptureActive() || this.isProcessing();
  }

  /**
   * Check if a session is still active
   */
  isSessionActive(sessionId) {
    return sessionId === this.currentSessionId;
  }

  /**
   * Force reset manager back to idle
   */
  forceReset(reason = 'manual-reset') {
    console.warn(`🎤 TranscriptionManager: Force reset triggered (${reason}) from state: ${this.state}`);

    if (this.audioRecorder) {
      try {
        this.audioRecorder.destroy();
      } catch (error) {
        console.warn('Warning: TranscriptionManager failed to destroy audio recorder during force reset:', error);
      }
      this.audioRecorder = null;
    }

    if (this.webSpeechRecognizer) {
      try {
        this.webSpeechRecognizer.destroy();
      } catch (error) {
        console.warn('Warning: TranscriptionManager failed to destroy web speech recognizer during force reset:', error);
      }
      this.webSpeechRecognizer = null;
    }

    if (this.vad) {
      try {
        this.vad.destroy();
      } catch (error) {
        console.warn('Warning: TranscriptionManager failed to destroy VAD during force reset:', error);
      }
      this.vad = null;
    }

    this.currentTranscript = '';

    if (this.state !== 'idle') {
      this.setState('idle');
    }
  }


  /**
   * Get current state
   */
  getState() {
    return {
      state: this.state,
      provider: this.provider,
      language: this.language,
      transcript: this.currentTranscript
    };
  }

  /**
   * Destroy manager
   */
  destroy() {
    this.cleanup();
    console.log('🎤 TranscriptionManager: Destroyed');
  }
};

console.log('✅ TranscriptionManager class loaded');

