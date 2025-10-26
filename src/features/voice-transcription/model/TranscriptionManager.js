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
    this.provider = options.provider || 'elevenlabs'; // Default to ElevenLabs
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
      console.warn('🎤 TranscriptionManager: Already active');
      return;
    }

    try {
      console.log('🎤 TranscriptionManager: Starting transcription...');
      this.setState('recording');
      this.currentTranscript = '';
      
      // Determine which method to use
      if (this.provider === 'webspeech') {
        await this.startWebSpeech();
      } else {
        await this.startAudioRecording();
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
  async startWebSpeech() {
    const languageCode = window.Gracula.VoiceProviders.getLanguageCode(this.language, 'webspeech');
    
    this.webSpeechRecognizer = new window.Gracula.WebSpeechRecognizer({
      language: languageCode,
      continuous: true,
      interimResults: true,
      onResult: (transcript) => {
        this.currentTranscript = transcript;
        console.log('✅ TranscriptionManager: Final transcript:', transcript);
      },
      onInterimResult: (transcript) => {
        this.onInterimResult(transcript);
        console.log('🎤 TranscriptionManager: Interim transcript:', transcript);
      },
      onStart: () => {
        console.log('🎤 TranscriptionManager: Web Speech started');
      },
      onEnd: (transcript) => {
        this.currentTranscript = transcript || this.currentTranscript;
        this.handleTranscriptionComplete(this.currentTranscript);
      },
      onError: (error) => {
        this.handleTranscriptionError(error);
      }
    });
    
    this.webSpeechRecognizer.start();
  }

  /**
   * Start audio recording for cloud transcription
   */
  async startAudioRecording() {
    this.audioRecorder = new window.Gracula.AudioRecorder({
      onStart: () => {
        console.log('🎤 TranscriptionManager: Audio recording started');
        
        // Start VAD if enabled
        if (this.useVAD && this.audioRecorder.audioStream) {
          this.startVAD(this.audioRecorder.audioStream);
        }
      },
      onStop: async (audioBlob) => {
        console.log('🎤 TranscriptionManager: Audio recording stopped');
        this.setState('transcribing');
        
        // Stop VAD
        if (this.vad) {
          this.vad.stop();
        }
        
        // Transcribe audio
        await this.transcribeAudio(audioBlob);
      },
      onError: (error) => {
        this.handleTranscriptionError(error);
      },
      onAudioLevel: (level) => {
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
  async transcribeAudio(audioBlob) {
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
      
      this.handleTranscriptionComplete(transcript);
    } catch (error) {
      console.error('❌ TranscriptionManager: Transcription failed:', error);
      this.handleTranscriptionError(error.message || 'Transcription failed');
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
        
        chrome.runtime.sendMessage({
          action: 'transcribeAudio',
          provider: 'elevenlabs',
          audioData: base64Audio,
          mimeType: audioBlob.type,
          language: this.language
        }, (response) => {
          if (response.success) {
            resolve(response.transcript);
          } else {
            reject(new Error(response.error || 'Transcription failed'));
          }
        });
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
        
        chrome.runtime.sendMessage({
          action: 'transcribeAudio',
          provider: 'openai',
          audioData: base64Audio,
          mimeType: audioBlob.type,
          language: this.language
        }, (response) => {
          if (response.success) {
            resolve(response.transcript);
          } else {
            reject(new Error(response.error || 'Transcription failed'));
          }
        });
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(audioBlob);
    });
  }

  /**
   * Handle transcription complete
   */
  handleTranscriptionComplete(transcript) {
    console.log('✅ TranscriptionManager: Transcription complete:', transcript);
    this.currentTranscript = transcript;
    this.setState('complete');
    this.onTranscriptionComplete(transcript);
    this.cleanup();
  }

  /**
   * Handle transcription error
   */
  handleTranscriptionError(error) {
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
      this.audioRecorder.destroy();
      this.audioRecorder = null;
    }
    
    if (this.webSpeechRecognizer) {
      this.webSpeechRecognizer.destroy();
      this.webSpeechRecognizer = null;
    }
    
    if (this.vad) {
      this.vad.destroy();
      this.vad = null;
    }
    
    // Reset to idle after a short delay
    setTimeout(() => {
      if (this.state !== 'recording') {
        this.setState('idle');
      }
    }, 1000);
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

