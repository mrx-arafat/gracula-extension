// Web Speech Recognizer
// Wrapper for Chrome's built-in Web Speech API

window.Gracula = window.Gracula || {};

window.Gracula.WebSpeechRecognizer = class {
  constructor(options = {}) {
    this.onResult = options.onResult || (() => {});
    this.onInterimResult = options.onInterimResult || (() => {});
    this.onStart = options.onStart || (() => {});
    this.onEnd = options.onEnd || (() => {});
    this.onError = options.onError || (() => {});
    
    // Configuration
    this.language = options.language || 'en-US';
    this.continuous = options.continuous !== false; // Default true
    this.interimResults = options.interimResults !== false; // Default true
    this.maxAlternatives = options.maxAlternatives || 1;
    
    // State
    this.isRecognizing = false;
    this.recognition = null;
    this.finalTranscript = '';
    this.interimTranscript = '';
    
    // Check browser support
    this.isSupported = this.checkSupport();
    
    if (this.isSupported) {
      this.initializeRecognition();
      console.log('✅ WebSpeechRecognizer: Initialized with language:', this.language);
    } else {
      console.warn('⚠️ WebSpeechRecognizer: Web Speech API not supported');
    }
  }

  /**
   * Check if Web Speech API is supported
   */
  checkSupport() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  /**
   * Initialize speech recognition
   */
  initializeRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = this.continuous;
    this.recognition.interimResults = this.interimResults;
    this.recognition.maxAlternatives = this.maxAlternatives;
    this.recognition.lang = this.language;
    
    // Event handlers
    this.recognition.onstart = () => {
      console.log('🎤 WebSpeechRecognizer: Recognition started');
      this.isRecognizing = true;
      this.finalTranscript = '';
      this.interimTranscript = '';
      this.onStart();
    };
    
    this.recognition.onresult = (event) => {
      this.handleResult(event);
    };
    
    this.recognition.onerror = (event) => {
      console.error('❌ WebSpeechRecognizer: Error:', event.error);
      this.isRecognizing = false;
      
      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition aborted.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      this.onError(errorMessage);
    };
    
    this.recognition.onend = () => {
      console.log('🎤 WebSpeechRecognizer: Recognition ended');
      this.isRecognizing = false;
      
      // Return final transcript
      if (this.finalTranscript) {
        this.onEnd(this.finalTranscript);
      } else {
        this.onEnd('');
      }
    };
  }

  /**
   * Handle recognition result
   */
  handleResult(event) {
    let interim = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      
      if (result.isFinal) {
        this.finalTranscript += transcript + ' ';
        console.log('✅ WebSpeechRecognizer: Final result:', transcript);
      } else {
        interim += transcript;
      }
    }
    
    // Update interim transcript
    if (interim) {
      this.interimTranscript = interim;
      this.onInterimResult(interim);
      console.log('🎤 WebSpeechRecognizer: Interim result:', interim);
    }
    
    // Send final result if available
    if (this.finalTranscript) {
      this.onResult(this.finalTranscript.trim());
    }
  }

  /**
   * Start recognition
   */
  start() {
    if (!this.isSupported) {
      this.onError('Web Speech API not supported in this browser');
      return;
    }
    
    if (this.isRecognizing) {
      console.warn('🎤 WebSpeechRecognizer: Already recognizing');
      return;
    }
    
    try {
      console.log('🎤 WebSpeechRecognizer: Starting recognition...');
      this.recognition.start();
    } catch (error) {
      console.error('❌ WebSpeechRecognizer: Failed to start:', error);
      this.onError('Failed to start speech recognition');
    }
  }

  /**
   * Stop recognition
   */
  stop() {
    if (!this.isRecognizing) {
      console.warn('🎤 WebSpeechRecognizer: Not recognizing');
      return;
    }
    
    try {
      console.log('🎤 WebSpeechRecognizer: Stopping recognition...');
      this.recognition.stop();
    } catch (error) {
      console.error('❌ WebSpeechRecognizer: Failed to stop:', error);
    }
  }

  /**
   * Abort recognition
   */
  abort() {
    if (!this.isRecognizing) {
      return;
    }
    
    try {
      console.log('🎤 WebSpeechRecognizer: Aborting recognition...');
      this.recognition.abort();
      this.isRecognizing = false;
    } catch (error) {
      console.error('❌ WebSpeechRecognizer: Failed to abort:', error);
    }
  }

  /**
   * Set language
   */
  setLanguage(language) {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
      console.log('🎤 WebSpeechRecognizer: Language set to:', language);
    }
  }

  /**
   * Get current transcript
   */
  getTranscript() {
    return {
      final: this.finalTranscript.trim(),
      interim: this.interimTranscript,
      combined: (this.finalTranscript + this.interimTranscript).trim()
    };
  }

  /**
   * Get recognition state
   */
  getState() {
    return {
      isRecognizing: this.isRecognizing,
      isSupported: this.isSupported,
      language: this.language,
      finalTranscript: this.finalTranscript.trim(),
      interimTranscript: this.interimTranscript
    };
  }

  /**
   * Destroy recognizer
   */
  destroy() {
    if (this.isRecognizing) {
      this.abort();
    }
    this.recognition = null;
    console.log('🎤 WebSpeechRecognizer: Destroyed');
  }
};

console.log('✅ WebSpeechRecognizer class loaded');

