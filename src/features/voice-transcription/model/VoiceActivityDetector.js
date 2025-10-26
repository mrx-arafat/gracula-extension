// Voice Activity Detector (VAD)
// Detects speech activity and silence for auto-stop functionality

window.Gracula = window.Gracula || {};

window.Gracula.VoiceActivityDetector = class {
  constructor(options = {}) {
    this.onSpeechStart = options.onSpeechStart || (() => {});
    this.onSpeechEnd = options.onSpeechEnd || (() => {});
    this.onSilenceDetected = options.onSilenceDetected || (() => {});
    this.onVolumeChange = options.onVolumeChange || (() => {});
    
    // Configuration
    this.silenceThreshold = options.silenceThreshold || 0.01; // Volume threshold (0-1)
    this.silenceDuration = options.silenceDuration || 2000; // ms of silence before triggering
    this.minSpeechDuration = options.minSpeechDuration || 500; // Minimum speech duration to count
    
    // State
    this.isActive = false;
    this.isSpeaking = false;
    this.audioContext = null;
    this.analyser = null;
    this.animationFrame = null;
    this.silenceStartTime = null;
    this.speechStartTime = null;
    this.lastVolume = 0;
    
    console.log('🎤 VoiceActivityDetector: Initialized');
  }

  /**
   * Start VAD with audio stream
   */
  start(audioStream) {
    if (this.isActive) {
      console.warn('🎤 VoiceActivityDetector: Already active');
      return;
    }

    try {
      console.log('🎤 VoiceActivityDetector: Starting...');
      
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(audioStream);
      
      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Connect source to analyser
      source.connect(this.analyser);
      
      this.isActive = true;
      this.silenceStartTime = null;
      this.speechStartTime = null;
      
      // Start monitoring
      this.monitor();
      
      console.log('✅ VoiceActivityDetector: Started');
    } catch (error) {
      console.error('❌ VoiceActivityDetector: Failed to start:', error);
    }
  }

  /**
   * Monitor audio levels
   */
  monitor() {
    if (!this.isActive || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const check = () => {
      if (!this.isActive) return;
      
      // Get frequency data
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS (Root Mean Square) volume
      const rms = this.calculateRMS(dataArray);
      const volume = rms / 255; // Normalize to 0-1
      
      this.lastVolume = volume;
      this.onVolumeChange(volume);
      
      // Detect speech/silence
      const now = Date.now();
      
      if (volume > this.silenceThreshold) {
        // Speech detected
        if (!this.isSpeaking) {
          // Speech started
          this.speechStartTime = now;
          this.silenceStartTime = null;
          this.isSpeaking = true;
          this.onSpeechStart();
          console.log('🎤 VoiceActivityDetector: Speech started');
        }
      } else {
        // Silence detected
        if (this.isSpeaking) {
          // Check if speech was long enough
          const speechDuration = now - this.speechStartTime;
          
          if (speechDuration >= this.minSpeechDuration) {
            // Valid speech ended, start silence timer
            if (!this.silenceStartTime) {
              this.silenceStartTime = now;
              console.log('🎤 VoiceActivityDetector: Silence started');
            }
            
            // Check silence duration
            const silenceDuration = now - this.silenceStartTime;
            if (silenceDuration >= this.silenceDuration) {
              // Silence threshold reached
              this.isSpeaking = false;
              this.onSpeechEnd();
              this.onSilenceDetected();
              console.log('🎤 VoiceActivityDetector: Silence detected after', silenceDuration, 'ms');
            }
          } else {
            // Speech was too short, ignore
            this.isSpeaking = false;
            this.speechStartTime = null;
          }
        }
      }
      
      this.animationFrame = requestAnimationFrame(check);
    };
    
    check();
  }

  /**
   * Calculate RMS (Root Mean Square) volume
   */
  calculateRMS(dataArray) {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    return Math.sqrt(sum / dataArray.length);
  }

  /**
   * Stop VAD
   */
  stop() {
    if (!this.isActive) {
      console.warn('🎤 VoiceActivityDetector: Not active');
      return;
    }

    console.log('🎤 VoiceActivityDetector: Stopping...');
    
    this.isActive = false;
    this.isSpeaking = false;
    
    // Stop animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.silenceStartTime = null;
    this.speechStartTime = null;
    
    console.log('✅ VoiceActivityDetector: Stopped');
  }

  /**
   * Reset VAD state
   */
  reset() {
    this.isSpeaking = false;
    this.silenceStartTime = null;
    this.speechStartTime = null;
    console.log('🎤 VoiceActivityDetector: Reset');
  }

  /**
   * Set silence threshold
   */
  setSilenceThreshold(threshold) {
    this.silenceThreshold = Math.max(0, Math.min(1, threshold));
    console.log('🎤 VoiceActivityDetector: Silence threshold set to:', this.silenceThreshold);
  }

  /**
   * Set silence duration
   */
  setSilenceDuration(duration) {
    this.silenceDuration = Math.max(500, duration);
    console.log('🎤 VoiceActivityDetector: Silence duration set to:', this.silenceDuration, 'ms');
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isActive: this.isActive,
      isSpeaking: this.isSpeaking,
      lastVolume: this.lastVolume,
      silenceThreshold: this.silenceThreshold,
      silenceDuration: this.silenceDuration
    };
  }

  /**
   * Get current volume
   */
  getCurrentVolume() {
    return this.lastVolume;
  }

  /**
   * Destroy VAD
   */
  destroy() {
    if (this.isActive) {
      this.stop();
    }
    console.log('🎤 VoiceActivityDetector: Destroyed');
  }
};

console.log('✅ VoiceActivityDetector class loaded');

