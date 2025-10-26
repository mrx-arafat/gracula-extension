// Cloud Transcriber
// Unified interface for cloud-based transcription services

window.Gracula = window.Gracula || {};

window.Gracula.CloudTranscriber = class {
  constructor(options = {}) {
    this.provider = options.provider || 'elevenlabs';
    this.language = options.language || 'en';
    this.onProgress = options.onProgress || (() => {});
    this.onError = options.onError || (() => {});
    
    console.log('☁️ CloudTranscriber: Initialized with provider:', this.provider);
  }

  /**
   * Transcribe audio using selected cloud provider
   */
  async transcribe(audioBlob, mimeType = 'audio/webm') {
    console.log('☁️ CloudTranscriber: Starting transcription with', this.provider);
    
    try {
      // Convert blob to base64
      const audioData = await this.blobToBase64(audioBlob);
      
      // Send to background script for API call
      const response = await chrome.runtime.sendMessage({
        action: 'transcribeAudio',
        provider: this.provider,
        audioData: audioData,
        mimeType: mimeType,
        language: this.language
      });
      
      if (response.success) {
        console.log('✅ CloudTranscriber: Transcription complete');
        return response.transcript;
      } else {
        throw new Error(response.error || 'Transcription failed');
      }
    } catch (error) {
      console.error('❌ CloudTranscriber: Error:', error);
      this.onError(error.message);
      throw error;
    }
  }

  /**
   * Convert blob to base64
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Set provider
   */
  setProvider(provider) {
    this.provider = provider;
    console.log('☁️ CloudTranscriber: Provider changed to:', provider);
  }

  /**
   * Set language
   */
  setLanguage(language) {
    this.language = language;
    console.log('☁️ CloudTranscriber: Language changed to:', language);
  }

  /**
   * Check if provider is available
   */
  async isProviderAvailable(provider) {
    // Check if API key is configured for the provider
    const response = await chrome.runtime.sendMessage({
      action: 'getApiConfig'
    });
    
    if (!response.success) {
      return false;
    }
    
    const config = response.config;
    
    switch (provider) {
      case 'elevenlabs':
        return !!config.elevenlabsApiKey;
      case 'openai':
        return !!config.apiKey;
      case 'google':
        return !!config.googleApiKey;
      case 'deepgram':
        return !!config.deepgramApiKey;
      default:
        return false;
    }
  }

  /**
   * Get available providers
   */
  async getAvailableProviders() {
    const providers = ['elevenlabs', 'openai', 'google', 'deepgram'];
    const available = [];
    
    for (const provider of providers) {
      if (await this.isProviderAvailable(provider)) {
        available.push(provider);
      }
    }
    
    return available;
  }

  /**
   * Destroy transcriber
   */
  destroy() {
    console.log('☁️ CloudTranscriber: Destroyed');
  }
};

console.log('✅ CloudTranscriber class loaded');

