// Voice Activity Detector (VAD)
// Enhanced speech detection with improved algorithms
// Uses spectral analysis and adaptive thresholding for better accuracy

window.Gracula = window.Gracula || {};

window.Gracula.VoiceActivityDetector = class {
  constructor(options = {}) {
    this.onSpeechStart = options.onSpeechStart || (() => {});
    this.onSpeechEnd = options.onSpeechEnd || (() => {});
    this.onSilenceDetected = options.onSilenceDetected || (() => {});
    this.onVolumeChange = options.onVolumeChange || (() => {});

    // Enhanced Configuration with adaptive thresholds
    this.silenceThreshold = options.silenceThreshold || 0.015; // Slightly higher for better noise rejection
    this.silenceDuration = options.silenceDuration || 1500; // Faster response (1.5s instead of 2s)
    this.minSpeechDuration = options.minSpeechDuration || 300; // Lower minimum for faster detection

    // Adaptive threshold parameters
    this.adaptiveThreshold = true;
    this.noiseFloor = 0.01; // Baseline noise level
    this.volumeHistory = []; // Track volume history for adaptive threshold
    this.maxHistoryLength = 50; // Keep last 50 samples

    // Spectral analysis parameters
    this.useSpectralAnalysis = true;
    this.speechFrequencyRange = { min: 85, max: 3000 }; // Human speech frequency range (Hz)

    // State
    this.isActive = false;
    this.isSpeaking = false;
    this.audioContext = null;
    this.analyser = null;
    this.animationFrame = null;
    this.silenceStartTime = null;
    this.speechStartTime = null;
    this.lastVolume = 0;
    this.lastSpectralEnergy = 0;

    console.log('🎤 VoiceActivityDetector: Initialized with enhanced algorithms');
    console.log('   - Adaptive thresholding: ✓');
    console.log('   - Spectral analysis: ✓');
    console.log('   - Speech frequency range: 85-3000 Hz');
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
      console.log('🎤 VoiceActivityDetector: Starting enhanced VAD...');

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(audioStream);

      // Create analyser with optimized settings for speech detection
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048; // Good balance between frequency resolution and time resolution
      this.analyser.smoothingTimeConstant = 0.3; // Less smoothing for faster response
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      // Connect source to analyser
      source.connect(this.analyser);

      this.isActive = true;
      this.silenceStartTime = null;
      this.speechStartTime = null;
      this.volumeHistory = [];

      // Calibrate noise floor
      this.calibrateNoiseFloor();

      // Start monitoring
      this.monitor();

      console.log('✅ VoiceActivityDetector: Started with enhanced detection');
    } catch (error) {
      console.error('❌ VoiceActivityDetector: Failed to start:', error);
    }
  }

  /**
   * Calibrate noise floor for adaptive thresholding
   */
  calibrateNoiseFloor() {
    console.log('🎤 VoiceActivityDetector: Calibrating noise floor...');
    const samples = [];
    const sampleCount = 10;
    let count = 0;

    const calibrate = () => {
      if (count >= sampleCount || !this.isActive) {
        if (samples.length > 0) {
          this.noiseFloor = Math.max(0.005, samples.reduce((a, b) => a + b) / samples.length * 1.5);
          console.log('✅ VoiceActivityDetector: Noise floor calibrated:', this.noiseFloor.toFixed(4));
        }
        return;
      }

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      const rms = this.calculateRMS(dataArray);
      const volume = rms / 255;
      samples.push(volume);
      count++;

      setTimeout(calibrate, 50);
    };

    setTimeout(calibrate, 100);
  }

  /**
   * Monitor audio levels with enhanced detection
   */
  monitor() {
    if (!this.isActive || !this.analyser) return;

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    const timeData = new Uint8Array(this.analyser.fftSize);

    const check = () => {
      if (!this.isActive) return;

      // Get both frequency and time domain data
      this.analyser.getByteFrequencyData(frequencyData);
      this.analyser.getByteTimeDomainData(timeData);

      // Calculate multiple metrics
      const rms = this.calculateRMS(frequencyData);
      const volume = rms / 255; // Normalize to 0-1

      // Calculate spectral energy in speech frequency range
      const spectralEnergy = this.useSpectralAnalysis ?
        this.calculateSpectralEnergy(frequencyData) : volume;

      // Update volume history for adaptive threshold
      this.volumeHistory.push(volume);
      if (this.volumeHistory.length > this.maxHistoryLength) {
        this.volumeHistory.shift();
      }

      // Calculate adaptive threshold
      const threshold = this.adaptiveThreshold ?
        this.calculateAdaptiveThreshold() : this.silenceThreshold;

      this.lastVolume = volume;
      this.lastSpectralEnergy = spectralEnergy;
      this.onVolumeChange(volume);

      // Use spectral energy for more accurate speech detection
      const isSpeechDetected = spectralEnergy > threshold;

      // Detect speech/silence
      const now = Date.now();

      if (isSpeechDetected) {
        // Speech detected
        if (!this.isSpeaking) {
          // Speech started
          this.speechStartTime = now;
          this.silenceStartTime = null;
          this.isSpeaking = true;
          this.onSpeechStart();
          console.log('🎤 VoiceActivityDetector: Speech started (spectral energy:', spectralEnergy.toFixed(4), 'threshold:', threshold.toFixed(4), ')');
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
   * Calculate spectral energy in speech frequency range
   */
  calculateSpectralEnergy(frequencyData) {
    const sampleRate = this.audioContext.sampleRate;
    const nyquist = sampleRate / 2;
    const binCount = frequencyData.length;

    // Calculate which bins correspond to speech frequencies
    const minBin = Math.floor((this.speechFrequencyRange.min / nyquist) * binCount);
    const maxBin = Math.ceil((this.speechFrequencyRange.max / nyquist) * binCount);

    // Calculate energy in speech frequency range
    let sum = 0;
    let count = 0;
    for (let i = minBin; i < maxBin && i < binCount; i++) {
      sum += frequencyData[i] * frequencyData[i];
      count++;
    }

    if (count === 0) return 0;

    const energy = Math.sqrt(sum / count) / 255;
    return energy;
  }

  /**
   * Calculate adaptive threshold based on recent volume history
   */
  calculateAdaptiveThreshold() {
    if (this.volumeHistory.length < 10) {
      return this.silenceThreshold;
    }

    // Calculate median of recent volumes (more robust than mean)
    const sorted = [...this.volumeHistory].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    // Adaptive threshold is noise floor + margin above median
    const adaptiveThreshold = Math.max(
      this.noiseFloor,
      median * 1.5,
      this.silenceThreshold
    );

    return Math.min(adaptiveThreshold, 0.1); // Cap at 0.1 to avoid being too aggressive
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

