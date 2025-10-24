// Voice Input Manager
// Handles voice recording and transcription using ElevenLabs API

window.Gracula = window.Gracula || {};

window.Gracula.VoiceInputManager = class {
  constructor(options = {}) {
    this.inputField = options.inputField;
    this.onTranscription = options.onTranscription || (() => {});
    this.onError = options.onError || (() => {});
    
    // State
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.micButton = null;
    
    // Config
    this.enabled = false;
    this.apiKey = '';
    this.loadConfig();
    
    // Bind methods
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  /**
   * Load configuration from background
   */
  loadConfig() {
    chrome.runtime.sendMessage({ action: 'getApiConfig' }, (response) => {
      if (response && response.success && response.config) {
        this.enabled = response.config.voiceInputEnabled || false;
        this.apiKey = response.config.elevenlabsApiKey || '';
        console.log('🎤 Voice Input: Enabled:', this.enabled);
      }
    });
  }

  /**
   * Start voice input manager
   */
  start() {
    if (!this.enabled) {
      console.log('🎤 Voice Input: Disabled');
      return;
    }

    // Add keyboard shortcut listener (Ctrl+Shift+V)
    document.addEventListener('keydown', this.handleKeydown);

    // Create microphone button
    this.createMicButton();

    console.log('🎤 Voice Input: Started (Ctrl+Shift+V to activate)');
  }

  /**
   * Stop voice input manager
   */
  stop() {
    document.removeEventListener('keydown', this.handleKeydown);
    this.removeMicButton();
    this.stopRecording();
  }

  /**
   * Handle keyboard shortcut (Ctrl+Shift+V)
   */
  handleKeydown(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'V') {
      event.preventDefault();
      this.toggleRecording();
    }
  }

  /**
   * Create microphone button near input field
   */
  createMicButton() {
    if (this.micButton || !this.inputField) return;

    this.micButton = document.createElement('button');
    this.micButton.className = 'gracula-mic-button';
    this.micButton.innerHTML = '🎤';
    this.micButton.title = 'Voice Input (Ctrl+Shift+V)';
    
    // Style the button
    this.micButton.style.cssText = `
      position: absolute;
      z-index: 2147483646;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 2px solid white;
      color: white;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Position near input field
    this.positionMicButton();

    // Add click handler
    this.micButton.addEventListener('click', () => this.toggleRecording());

    // Add to page
    document.body.appendChild(this.micButton);

    // Reposition on window resize
    window.addEventListener('resize', () => this.positionMicButton());
  }

  /**
   * Position microphone button near input field
   */
  positionMicButton() {
    if (!this.micButton || !this.inputField) return;

    const rect = this.inputField.getBoundingClientRect();
    this.micButton.style.top = `${rect.top + window.scrollY - 50}px`;
    this.micButton.style.left = `${rect.right + window.scrollX - 50}px`;
  }

  /**
   * Remove microphone button
   */
  removeMicButton() {
    if (this.micButton) {
      this.micButton.remove();
      this.micButton = null;
    }
  }

  /**
   * Toggle recording on/off
   */
  async toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  /**
   * Start recording audio
   */
  async startRecording() {
    if (!this.apiKey) {
      this.onError('ElevenLabs API key not configured. Please add it in extension settings.');
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      // Collect audio data
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        this.audioChunks.push(event.data);
      });

      // Handle recording stop
      this.mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.transcribeAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      });

      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;

      // Update button appearance
      if (this.micButton) {
        this.micButton.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
        this.micButton.innerHTML = '⏹️';
        this.micButton.title = 'Stop Recording';
      }

      console.log('🎤 Voice Input: Recording started');
    } catch (error) {
      console.error('🎤 Voice Input: Error starting recording:', error);
      this.onError('Failed to access microphone. Please check permissions.');
    }
  }

  /**
   * Stop recording audio
   */
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;

      // Reset button appearance
      if (this.micButton) {
        this.micButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        this.micButton.innerHTML = '🎤';
        this.micButton.title = 'Voice Input (Ctrl+Shift+V)';
      }

      console.log('🎤 Voice Input: Recording stopped');
    }
  }

  /**
   * Transcribe audio using ElevenLabs API
   */
  async transcribeAudio(audioBlob) {
    try {
      console.log('🎤 Voice Input: Transcribing audio...');

      // Convert blob to file
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

      // Create form data
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('model_id', 'eleven_multilingual_v2');

      // Call ElevenLabs API
      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const transcription = data.text || '';

      if (transcription) {
        console.log('🎤 Voice Input: Transcription:', transcription);
        this.onTranscription(transcription);
        this.insertTranscription(transcription);
      } else {
        this.onError('No transcription received. Please try again.');
      }

    } catch (error) {
      console.error('🎤 Voice Input: Transcription error:', error);
      this.onError('Failed to transcribe audio: ' + error.message);
    }
  }

  /**
   * Insert transcription into input field
   */
  insertTranscription(text) {
    if (!this.inputField) return;

    // Get current text
    const currentText = this.inputField.contentEditable === 'true' 
      ? this.inputField.textContent || ''
      : this.inputField.value || '';

    // Append transcription with space if needed
    const newText = currentText ? `${currentText} ${text}` : text;

    // Insert text
    if (this.inputField.contentEditable === 'true') {
      this.inputField.textContent = newText;
      
      // Trigger input event
      const event = new Event('input', { bubbles: true });
      this.inputField.dispatchEvent(event);
    } else {
      this.inputField.value = newText;
      
      // Trigger input event
      const event = new Event('input', { bubbles: true });
      this.inputField.dispatchEvent(event);
    }

    // Focus input field
    this.inputField.focus();
  }

  /**
   * Destroy voice input manager
   */
  destroy() {
    this.stop();
    this.inputField = null;
  }
};

