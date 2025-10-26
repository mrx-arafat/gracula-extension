// Audio Recorder
// Handles audio capture using MediaRecorder API

window.Gracula = window.Gracula || {};

window.Gracula.AudioRecorder = class {
  constructor(options = {}) {
    this.onDataAvailable = options.onDataAvailable || (() => {});
    this.onStart = options.onStart || (() => {});
    this.onStop = options.onStop || (() => {});
    this.onError = options.onError || (() => {});
    this.onAudioLevel = options.onAudioLevel || (() => {});
    
    // State
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioStream = null;
    this.audioChunks = [];
    this.audioContext = null;
    this.analyser = null;
    this.animationFrame = null;
    
    // Configuration
    this.mimeType = this.getSupportedMimeType();
    this.audioBitsPerSecond = 128000; // 128 kbps
    
    console.log('🎤 AudioRecorder: Initialized with MIME type:', this.mimeType);
  }

  /**
   * Get supported MIME type for recording
   */
  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'audio/webm'; // Fallback
  }

  /**
   * Start recording audio
   */
  async startRecording() {
    if (this.isRecording) {
      console.warn('🎤 AudioRecorder: Already recording');
      return;
    }

    try {
      console.log('🎤 AudioRecorder: Requesting microphone access...');
      
      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      console.log('✅ AudioRecorder: Microphone access granted');

      // Create audio context for level monitoring
      this.setupAudioAnalyzer();

      // Create media recorder
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: this.mimeType,
        audioBitsPerSecond: this.audioBitsPerSecond
      });

      this.audioChunks = [];

      // Handle data available
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('🎤 AudioRecorder: Data chunk received:', event.data.size, 'bytes');
        }
      });

      // Handle recording stop
      this.mediaRecorder.addEventListener('stop', () => {
        console.log('🎤 AudioRecorder: Recording stopped');
        const audioBlob = new Blob(this.audioChunks, { type: this.mimeType });
        this.cleanup();
        this.onStop(audioBlob);
      });

      // Handle errors
      this.mediaRecorder.addEventListener('error', (event) => {
        console.error('❌ AudioRecorder: Recording error:', event.error);
        this.cleanup();
        this.onError(event.error);
      });

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      
      console.log('✅ AudioRecorder: Recording started');
      this.onStart();

    } catch (error) {
      console.error('❌ AudioRecorder: Failed to start recording:', error);
      this.cleanup();
      
      let errorMessage = 'Failed to access microphone';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied. Please allow microphone access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone.';
      }
      
      this.onError(errorMessage);
    }
  }

  /**
   * Stop recording audio
   */
  stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      console.warn('🎤 AudioRecorder: Not recording');
      return;
    }

    console.log('🎤 AudioRecorder: Stopping recording...');
    this.mediaRecorder.stop();
    this.isRecording = false;
  }

  /**
   * Setup audio analyzer for level monitoring
   */
  setupAudioAnalyzer() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.audioStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      // Start monitoring audio levels
      this.monitorAudioLevel();
      
      console.log('✅ AudioRecorder: Audio analyzer setup complete');
    } catch (error) {
      console.warn('⚠️ AudioRecorder: Failed to setup audio analyzer:', error);
    }
  }

  /**
   * Monitor audio level for visualization
   */
  monitorAudioLevel() {
    if (!this.analyser || !this.isRecording) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const checkLevel = () => {
      if (!this.isRecording) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average level (0-1)
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedLevel = average / 255;
      
      this.onAudioLevel(normalizedLevel);
      
      this.animationFrame = requestAnimationFrame(checkLevel);
    };
    
    checkLevel();
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    console.log('🎤 AudioRecorder: Cleaning up...');
    
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
    
    // Stop all audio tracks
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => {
        track.stop();
        console.log('🎤 AudioRecorder: Stopped audio track');
      });
      this.audioStream = null;
    }
    
    this.analyser = null;
    this.isRecording = false;
  }

  /**
   * Convert audio blob to base64
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get recording state
   */
  getState() {
    return {
      isRecording: this.isRecording,
      mimeType: this.mimeType,
      duration: this.audioChunks.length * 0.1 // Approximate duration in seconds
    };
  }

  /**
   * Destroy recorder
   */
  destroy() {
    if (this.isRecording) {
      this.stopRecording();
    }
    this.cleanup();
    console.log('🎤 AudioRecorder: Destroyed');
  }
};

console.log('✅ AudioRecorder class loaded');

